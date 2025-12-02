import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

// Stalwart Mail Server API configuration
const STALWART_API_URL = process.env.STALWART_API_URL || 'http://mail.rnrb.me:8080';
const STALWART_ADMIN_USER = process.env.STALWART_ADMIN_USER || 'admin';
const STALWART_ADMIN_PASSWORD = process.env.STALWART_ADMIN_PASSWORD;
const WEBMAIL_URL = process.env.WEBMAIL_URL || 'https://webmail.rnrb.me';

// Helper to call Stalwart API
async function stalwartFetch(endpoint: string, options: RequestInit = {}) {
  const auth = Buffer.from(`${STALWART_ADMIN_USER}:${STALWART_ADMIN_PASSWORD}`).toString('base64');
  const response = await fetch(`${STALWART_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
}

// Send password reset email using Resend
// sendTo: the platform email (where the email is sent)
// rnrbEmail: the @rnrb.me email being reset
async function sendPasswordResetEmail(sendTo: string, rnrbEmail: string, resetToken: string) {
  const resetLink = `${WEBMAIL_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(rnrbEmail)}`;

  const result = await sendEmail({
    to: sendTo,
    subject: `🔐 Reset your RNRB Mail password (${rnrbEmail})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="dark">
      </head>
      <body style="margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #161616; border-radius: 16px; border: 1px solid #2a2a2a; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 32px; text-align: center; border-bottom: 1px solid #2a2a2a;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f3f4f6;">RNRB Mail</h1>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Password Reset</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                You requested to reset the password for your RNRB Mail account:
              </p>
              
              <div style="background: #1f1f1f; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px; margin: 0 0 24px; text-align: center;">
                <p style="margin: 0; color: #ff6b35; font-size: 18px; font-weight: 600;">${rnrbEmail}</p>
              </div>
              
              <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" 
                   style="display: inline-block; padding: 14px 32px; background: #ff6b35; color: white; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 16px;">
                This link will expire in <strong>1 hour</strong>.
              </p>
              
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                If you didn't request this, you can safely ignore this email. Your password won't be changed.
              </p>
              
              <!-- Fallback link -->
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #2a2a2a;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">
                  Or copy this link:
                </p>
                <p style="color: #ff6b35; font-size: 12px; word-break: break-all; margin: 0;">
                  ${resetLink}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px 32px; background: #111111; border-top: 1px solid #2a2a2a; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Rock N' Roll Basement • Secure Email for Musicians
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Reset your RNRB Mail password

You requested to reset the password for: ${rnrbEmail}

Click the link below to create a new password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

- Rock N' Roll Basement
    `,
  });

  return result.success;
}

// Update password on Stalwart
async function updateStalwartPassword(emailAddress: string, newPassword: string) {
  try {
    const username = emailAddress.split('@')[0];

    const response = await stalwartFetch(`/api/principal/${username}`, {
      method: 'PATCH',
      body: JSON.stringify({
        secrets: [newPassword],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[STALWART] Failed to update password:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('[STALWART] Error updating password:', error);
    return { success: false, error };
  }
}

/**
 * POST /api/email/reset-password
 * Handle password reset requests
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, newPassword, action } = body;

    // Action: request - Request a password reset (sends email)
    if (action === 'request') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase();

      // Find the email account AND the user's platform email
      const emailAccount = await prisma.emailAccount.findUnique({
        where: { emailAddress: normalizedEmail },
        include: { user: true },
      });

      // Always return success to prevent email enumeration
      const successResponse = {
        success: true,
        message:
          'If this email exists, a reset link has been sent to your registered platform email.',
      };

      if (!emailAccount) {
        console.log('[EMAIL-RESET] Email not found:', normalizedEmail);
        return NextResponse.json(successResponse);
      }

      // Get the user's platform email (the email they use to log into rnrb.pro)
      // This is where we send the reset link - NOT the @rnrb.me email they're locked out of
      const platformEmail = emailAccount.user.email;

      if (!platformEmail) {
        console.error('[EMAIL-RESET] No platform email found for user:', emailAccount.userId);
        return NextResponse.json(successResponse);
      }

      // Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Invalidate any existing tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: emailAccount.userId,
          usedAt: null,
        },
        data: {
          usedAt: new Date(), // Mark as used
        },
      });

      // Create new reset token
      const requestedIp =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

      await prisma.passwordResetToken.create({
        data: {
          id: `prt_${crypto.randomUUID()}`,
          userId: emailAccount.userId,
          tokenHash,
          expiresAt,
          requestedIp,
        },
      });

      // Send the reset email to their PLATFORM email (not the @rnrb.me email)
      // This way they can reset even if locked out of their @rnrb.me inbox
      const emailSent = await sendPasswordResetEmail(platformEmail, normalizedEmail, resetToken);

      if (!emailSent) {
        console.error('[EMAIL-RESET] Failed to send email to:', platformEmail);
        // Still return success to prevent enumeration, but log the error
      } else {
        console.log(
          '[EMAIL-RESET] Reset email sent to platform email:',
          platformEmail,
          'for:',
          normalizedEmail
        );
      }

      return NextResponse.json(successResponse);
    }

    // Action: verify - Check if a token is valid (used by reset page)
    if (action === 'verify') {
      if (!token || !email) {
        return NextResponse.json({ error: 'Token and email are required' }, { status: 400 });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const normalizedEmail = email.toLowerCase();

      // Find the email account
      const emailAccount = await prisma.emailAccount.findUnique({
        where: { emailAddress: normalizedEmail },
      });

      if (!emailAccount) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }

      // Find valid token
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: emailAccount.userId,
          tokenHash,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!resetToken) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      return NextResponse.json({ valid: true });
    }

    // Action: reset - Actually reset the password (requires valid token)
    if (action === 'reset') {
      if (!email || !token || !newPassword) {
        return NextResponse.json(
          { error: 'Email, token, and new password are required' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase();
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Validate password requirements
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      if (!/[A-Z]/.test(newPassword)) {
        return NextResponse.json(
          { error: 'Password must contain at least one uppercase letter' },
          { status: 400 }
        );
      }

      if (!/[a-z]/.test(newPassword)) {
        return NextResponse.json(
          { error: 'Password must contain at least one lowercase letter' },
          { status: 400 }
        );
      }

      if (!/[0-9]/.test(newPassword)) {
        return NextResponse.json(
          { error: 'Password must contain at least one number' },
          { status: 400 }
        );
      }

      // Find the email account
      const emailAccount = await prisma.emailAccount.findUnique({
        where: { emailAddress: normalizedEmail },
      });

      if (!emailAccount) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }

      // Verify token is valid
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: emailAccount.userId,
          tokenHash,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!resetToken) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      // Update password on Stalwart
      const stalwartResult = await updateStalwartPassword(normalizedEmail, newPassword);

      if (!stalwartResult.success) {
        return NextResponse.json(
          { error: 'Failed to update password on mail server' },
          { status: 500 }
        );
      }

      // Mark token as used
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      // Update the stored password hash in app passwords
      await prisma.emailAppPassword.updateMany({
        where: {
          emailAccountId: emailAccount.id,
          name: 'Primary Password',
        },
        data: {
          passwordHash: crypto.createHash('sha256').update(newPassword).digest('hex'),
        },
      });

      console.log('[EMAIL-RESET] Password reset successful for:', normalizedEmail);

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully. You can now sign in.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[EMAIL-RESET] Error:', error);
    return NextResponse.json({ error: 'Failed to process password reset' }, { status: 500 });
  }
}
