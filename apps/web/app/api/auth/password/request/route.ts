import { prisma } from '@cronkwaters/db';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

const requestSchema = z.object({
  email: z.string().email(),
  redirect: z.string().optional(),
});

function sanitizeRedirect(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }

  return value;
}

function getBaseUrl(): string {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (env.NEXTAUTH_URL) {
    return env.NEXTAUTH_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith('http')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return vercelUrl.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

function buildEmailHtml(name: string | null, resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #f5f5f5; padding: 0; margin: 0; }
      .container { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
      .card { background: #1c1c1f; border: 1px solid #2f2f34; border-radius: 16px; padding: 32px; box-shadow: 0 20px 45px rgba(0,0,0,0.4); }
      .button { display: inline-block; padding: 14px 24px; background: linear-gradient(135deg, #ff6200, #ff2d55); color: #ffffff; border-radius: 999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em; }
      .footer { margin-top: 32px; font-size: 12px; color: #9c9ca5; line-height: 1.6; }
      p { line-height: 1.6; color: #e0e0e6; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <p>${name ? `Hey ${name},` : 'Hey there,'}</p>
        <p>We received a request to reset your Rock N' Roll Basement password. Click the secure link below — it expires in 30 minutes.</p>
        <p style="text-align:center; margin: 32px 0;">
          <a href="${resetUrl}" class="button">Reset password</a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; font-size: 13px; color: #b5b5c2;">${resetUrl}</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p class="footer">
          Rock N' Roll Basement · Los Angeles, CA<br/>
          Need help? Reply to this email or contact support@cronkwaters.com
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function buildEmailText(resetUrl: string): string {
  return [
    "Rock N' Roll Basement Password Reset",
    '',
    'We received a request to reset your password. Use the secure link below (expires in 30 minutes):',
    resetUrl,
    '',
    'If you did not request this reset, you can safely ignore this email.',
  ].join('\n');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, redirect } = requestSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();
    const safeRedirect = sanitizeRedirect(redirect);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true },
    });

    let emailResult: Awaited<ReturnType<typeof sendEmail>> | null = null;

    if (user) {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const token = crypto.randomBytes(48).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const requesterIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          requestedIp: requesterIp,
        },
      });

      const baseUrl = getBaseUrl();
      const resetUrl = new URL('/auth/reset', `${baseUrl}/`);
      resetUrl.searchParams.set('token', token);
      if (safeRedirect) {
        resetUrl.searchParams.set('redirect', safeRedirect);
      }

      emailResult = await sendEmail({
        to: normalizedEmail,
        subject: "Reset your Rock N' Roll Basement password",
        html: buildEmailHtml(user.name ?? null, resetUrl.toString()),
        text: buildEmailText(resetUrl.toString()),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If that email is registered, reset instructions are on the way.',
      emailSent: emailResult?.success ?? false,
      ...(emailResult && !emailResult.success ? { warning: emailResult.error } : {}),
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/auth/password/request',
      method: 'POST',
    });
  }
}
