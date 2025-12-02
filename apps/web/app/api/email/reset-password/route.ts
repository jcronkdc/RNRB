import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

// Send password reset email via Stalwart SMTP
async function sendPasswordResetEmail(toEmail: string, resetToken: string) {
  const resetLink = `${WEBMAIL_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

  // Send email via JMAP/Stalwart
  try {
    const response = await stalwartFetch('/api/jmap', {
      method: 'POST',
      body: JSON.stringify({
        using: [
          'urn:ietf:params:jmap:core',
          'urn:ietf:params:jmap:mail',
          'urn:ietf:params:jmap:submission',
        ],
        methodCalls: [
          [
            'Email/set',
            {
              accountId: 'noreply',
              create: {
                email1: {
                  from: [{ email: 'noreply@rnrb.me', name: 'RNRB Mail' }],
                  to: [{ email: toEmail }],
                  subject: 'Reset your RNRB Mail password',
                  bodyValues: {
                    body: {
                      value: `Hi,

You requested to reset your RNRB Mail password.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

- The RNRB Team`,
                      charset: 'utf-8',
                    },
                  },
                  textBody: [{ partId: 'body', type: 'text/plain' }],
                },
              },
            },
            'create',
          ],
          [
            'EmailSubmission/set',
            {
              accountId: 'noreply',
              create: {
                sub1: {
                  emailId: '#email1',
                  envelope: {
                    mailFrom: { email: 'noreply@rnrb.me' },
                    rcptTo: [{ email: toEmail }],
                  },
                },
              },
            },
            'submit',
          ],
        ],
      }),
    });

    if (!response.ok) {
      console.error('[EMAIL-RESET] Failed to send reset email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[EMAIL-RESET] Error sending reset email:', error);
    return false;
  }
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

      // Find the email account
      const emailAccount = await prisma.emailAccount.findUnique({
        where: { emailAddress: normalizedEmail },
        include: { user: true },
      });

      // Always return success to prevent email enumeration
      const successResponse = {
        success: true,
        message: 'If this email exists, you will receive a password reset link.',
      };

      if (!emailAccount) {
        console.log('[EMAIL-RESET] Email not found:', normalizedEmail);
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
      await prisma.passwordResetToken.create({
        data: {
          id: `prt_${crypto.randomUUID()}`,
          userId: emailAccount.userId,
          tokenHash,
          expiresAt,
          requestedIp: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      // Send the reset email
      const emailSent = await sendPasswordResetEmail(normalizedEmail, resetToken);

      if (!emailSent) {
        console.error('[EMAIL-RESET] Failed to send email to:', normalizedEmail);
        // Still return success to prevent enumeration, but log the error
      }

      console.log('[EMAIL-RESET] Reset requested for:', normalizedEmail);
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
