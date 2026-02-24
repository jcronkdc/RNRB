import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@/lib/errors';
import { authLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';

export const runtime = 'nodejs';

const resetSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be fewer than 128 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Strict rate limiting for password reset to prevent brute-force
    const clientIp = getClientIp(request);
    await checkRateLimit(authLimiter, `password-reset:${clientIp}`);

    const body = await request.json();
    const { token, password } = resetSchema.parse(body);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        {
          error: 'Invalid or expired reset link.',
          code: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: record.userId,
          id: { not: record.id },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password updated. You can sign in with your new password.',
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/auth/password/reset',
      method: 'POST',
    });
  }
}
