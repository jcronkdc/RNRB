/**
 * 2FA Verification API
 *
 * POST /api/auth/two-factor/verify - Verify TOTP code and enable 2FA
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';
import { auth } from '@cronkwaters/auth';
import { verifyTOTP, verifyBackupCode, decryptSecret } from '@/lib/two-factor-auth';

const ENCRYPTION_KEY =
  process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'fallback-key';

/**
 * POST - Verify TOTP code
 * Used for:
 * 1. Confirming 2FA setup (enables 2FA)
 * 2. Login verification (returns token/session)
 * 3. Backup code verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, isBackupCode = false, isSetup = false } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
    }

    // Get authenticated user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA not configured. Please set up 2FA first.' },
        { status: 400 }
      );
    }

    // Decrypt secret
    const secret = decryptSecret(user.twoFactorSecret, ENCRYPTION_KEY);

    // Clean the code input
    const cleanCode = code.replace(/\s|-/g, '');

    // Try backup code first if specified
    if (isBackupCode) {
      const backupCodes = user.twoFactorBackupCodes || [];
      const codeIndex = verifyBackupCode(cleanCode, backupCodes);

      if (codeIndex === -1) {
        return NextResponse.json({ error: 'Invalid backup code' }, { status: 400 });
      }

      // Remove used backup code
      const updatedBackupCodes = [...backupCodes];
      updatedBackupCodes.splice(codeIndex, 1);

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorBackupCodes: updatedBackupCodes,
        },
      });

      const remainingCodes = updatedBackupCodes.length;

      return NextResponse.json({
        success: true,
        verified: true,
        isBackupCode: true,
        remainingBackupCodes: remainingCodes,
        warning:
          remainingCodes < 3
            ? `Only ${remainingCodes} backup codes remaining. Consider generating new ones.`
            : undefined,
      });
    }

    // Verify TOTP code
    const isValid = verifyTOTP(secret, cleanCode);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // If this is setup verification, enable 2FA
    if (isSetup && !user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorVerifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        enabled: true,
        message: 'Two-factor authentication has been enabled!',
      });
    }

    // Regular verification success
    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
