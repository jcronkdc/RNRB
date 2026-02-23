/**
 * 2FA Setup API
 *
 * Generates TOTP secret and QR code URI for user to scan
 * POST /api/auth/two-factor/setup - Start 2FA setup
 * DELETE /api/auth/two-factor/setup - Disable 2FA
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';
import { auth } from '@cronkwaters/auth';
import {
  generateTOTPSecret,
  generateTOTPUri,
  generateBackupCodes,
  hashBackupCodes,
  encryptSecret,
  formatBackupCode,
} from '@/lib/two-factor-auth';

function getEncryptionKey(): string {
  const key = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!key) {
    throw new Error('TWO_FACTOR_ENCRYPTION_KEY or NEXTAUTH_SECRET must be set for 2FA support');
  }
  return key;
}

/**
 * POST - Start 2FA setup (generate secret)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if 2FA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
    }

    // Generate new secret
    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(secret, user.email || 'user');

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = hashBackupCodes(backupCodes);

    // Encrypt secret for storage
    const encryptedSecret = encryptSecret(secret, getEncryptionKey());

    // Store encrypted secret and backup codes (not enabled yet)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: hashedBackupCodes,
        // NOT enabling yet - wait for verification
      },
    });

    // Return secret and URI for QR code (only shown once)
    return NextResponse.json({
      secret, // Show to user for manual entry
      uri, // For QR code generation
      backupCodes: backupCodes.map(formatBackupCode), // Show formatted codes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}

/**
 * DELETE - Disable 2FA
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify current password or TOTP code for security
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user?.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    // Import verification function
    const { verifyTOTP, decryptSecret } = await import('@/lib/two-factor-auth');

    if (!user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA secret not found' }, { status: 400 });
    }

    const secret = decryptSecret(user.twoFactorSecret, getEncryptionKey());
    const isValid = verifyTOTP(secret, code);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        twoFactorVerifiedAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}
