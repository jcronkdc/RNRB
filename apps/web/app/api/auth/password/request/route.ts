import { prisma } from '@cronkwaters/db';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { handleApiError } from '@/lib/errors';
import { checkRateLimit, strictLimiter } from '@/lib/rate-limit';
import { getClientIp, logSecurityEvent } from '@/lib/security';

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

  return 'http://localhost:3001';
}

function buildEmailHtml(name: string | null, resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>Reset your password</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0b0b0c; color: #e9e9ec; padding: 0; margin: 0; line-height: 1.6; }
      .email-wrapper { background: #0b0b0c; padding: 40px 20px; }
      .email-container { max-width: 560px; margin: 0 auto; background: linear-gradient(180deg, #1e1e1e 0%, #161616 100%); border-radius: 16px; border: 1px solid #2f2f34; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
      .email-header { background: linear-gradient(135deg, rgba(255, 99, 71, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%); border-bottom: 1px solid #2f2f34; padding: 32px; text-align: center; }
      .logo-text { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(135deg, #ff6347 0%, #ffd700 50%, #ff6347 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; }
      .tagline { font-size: 13px; color: #9c9ca5; letter-spacing: 0.05em; text-transform: uppercase; margin: 8px 0 0; }
      .email-content { padding: 40px 32px; }
      .greeting { font-size: 15px; color: #b5b5c2; margin-bottom: 8px; }
      .main-heading { font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 20px; letter-spacing: -0.02em; }
      .body-text { font-size: 15px; color: #b5b5c2; margin: 16px 0; line-height: 1.7; }
      .warning-box { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
      .warning-text { color: #fbbf24; font-size: 14px; margin: 0; }
      .button-container { text-align: center; margin: 32px 0; }
      .primary-button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ff6347 0%, #ff4500 100%); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 999px; letter-spacing: 0.02em; box-shadow: 0 4px 14px rgba(255, 99, 71, 0.4); }
      .link-fallback { font-size: 12px; color: #6b6b75; word-break: break-all; margin-top: 16px; }
      .link-fallback a { color: #ff6347; }
      .info-card { background: #1a1a1a; border: 1px solid #2f2f34; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
      .email-footer { background: #141414; border-top: 1px solid #2f2f34; padding: 24px 32px; text-align: center; }
      .footer-brand { font-size: 13px; font-weight: 600; color: #9c9ca5; margin-bottom: 8px; }
      .footer-text { font-size: 12px; color: #6b6b75; margin: 4px 0; }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-container">
        <div class="email-header">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
          <p class="tagline">Password Reset</p>
        </div>
        <div class="email-content">
          <p class="greeting">${name ? `Hey ${name},` : 'Hey there,'}</p>
          <h2 class="main-heading">Reset Your Password</h2>

          <p class="body-text">
            We received a request to reset your password. Click the button below to create a new one.
          </p>

          <div class="warning-box">
            <p class="warning-text">⏰ This link expires in 30 minutes for security</p>
          </div>

          <div class="button-container">
            <a href="${resetUrl}" class="primary-button">Reset Password</a>
          </div>

          <div class="info-card">
            <p style="color: #9c9ca5; font-size: 13px; margin: 0 0 8px;">Or copy this link:</p>
            <p style="color: #ff6347; font-size: 12px; margin: 0; word-break: break-all;">${resetUrl}</p>
          </div>

          <p class="body-text" style="margin-top: 24px;">
            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div class="email-footer">
          <p class="footer-brand">Rock N' Roll Basement</p>
          <p class="footer-text">Los Angeles, CA • The All-In-One Platform for Modern Musicians</p>
          <p class="footer-text" style="margin-top: 12px;">
            <a href="${getBaseUrl()}" style="color: #ff6347; text-decoration: none;">Visit Website</a>
            &nbsp;•&nbsp;
            <a href="mailto:support@rnrb.app" style="color: #6b6b75; text-decoration: none;">Contact Support</a>
          </p>
        </div>
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
    // 🔒 RATE LIMITING: Prevent email spam and enumeration attacks (10 per minute per IP)
    const clientIp = getClientIp(request);
    try {
      await checkRateLimit(strictLimiter, `password-reset:${clientIp}`);
    } catch {
      logSecurityEvent('rate_limit', {
        action: 'password-reset-request',
        ip: clientIp,
      });
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

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

    // SECURITY: Never reveal whether the email exists in the database.
    // Always return the same response regardless of user existence or email delivery.
    if (emailResult && !emailResult.success) {
      console.error('[PASSWORD-RESET] Email delivery failed:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: 'If that email is registered, reset instructions are on the way.',
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/auth/password/request',
      method: 'POST',
    });
  }
}
