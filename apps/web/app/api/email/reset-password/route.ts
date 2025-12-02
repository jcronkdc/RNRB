import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Stalwart Mail Server API configuration
const STALWART_API_URL = process.env.STALWART_API_URL || 'http://mail.rnrb.me:8080';
const STALWART_ADMIN_USER = process.env.STALWART_ADMIN_USER || 'admin';
const STALWART_ADMIN_PASSWORD = process.env.STALWART_ADMIN_PASSWORD;

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

// Update password on Stalwart
async function updateStalwartPassword(emailAddress: string, newPassword: string) {
  try {
    const username = emailAddress.split('@')[0];

    // Update the user's password
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
 * Request a password reset or reset the password
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, newPassword, action } = body;

    // Action: request - Send password reset email
    if (action === 'request') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      // Find the email account
      const emailAccount = await prisma.emailAccount.findUnique({
        where: { emailAddress: email.toLowerCase() },
        include: { user: true },
      });

      if (!emailAccount) {
        // Don't reveal if email exists or not
        return NextResponse.json({
          success: true,
          message: 'If this email exists, you will receive a password reset link.',
        });
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store the token (using a simple approach - in production use a dedicated table)
      await prisma.emailAccount.update({
        where: { id: emailAccount.id },
        data: {
          // Using signature field temporarily to store reset token (hacky but works)
          // In production, create a proper PasswordResetToken table
          signature: `RESET:${resetToken}:${resetTokenExpiry.toISOString()}`,
        },
      });

      // In production, send an email with the reset link
      // For now, we'll use a direct reset approach via the main RNRB platform
      console.log(`[EMAIL-RESET] Reset token generated for ${email}: ${resetToken}`);

      // TODO: Send actual email with reset link
      // await sendPasswordResetEmail(emailAccount.user.email, resetToken);

      return NextResponse.json({
        success: true,
        message: 'If this email exists, you will receive a password reset link.',
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      });
    }

    // Action: reset - Actually reset the password
    if (action === 'reset') {
      if (!email || !newPassword) {
        return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
      }

      // Validate password
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
        where: { emailAddress: email.toLowerCase() },
      });

      if (!emailAccount) {
        return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
      }

      // If token provided, verify it
      if (token) {
        const storedToken = emailAccount.signature;
        if (!storedToken?.startsWith('RESET:')) {
          return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }

        const [, savedToken, expiry] = storedToken.split(':');
        if (savedToken !== token || new Date(expiry) < new Date()) {
          return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }
      }

      // Update password on Stalwart
      const stalwartResult = await updateStalwartPassword(email, newPassword);

      if (!stalwartResult.success) {
        return NextResponse.json(
          { error: 'Failed to update password on mail server' },
          { status: 500 }
        );
      }

      // Clear the reset token and update password hash
      await prisma.emailAccount.update({
        where: { id: emailAccount.id },
        data: {
          signature: null, // Clear the temporary token storage
        },
      });

      // Update the stored password hash
      await prisma.emailAppPassword.updateMany({
        where: {
          emailAccountId: emailAccount.id,
          name: 'Primary Password',
        },
        data: {
          passwordHash: crypto.createHash('sha256').update(newPassword).digest('hex'),
        },
      });

      return NextResponse.json({
        success: true,
        message:
          'Password has been reset successfully. You can now sign in with your new password.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[EMAIL-RESET] Error:', error);
    return NextResponse.json({ error: 'Failed to process password reset' }, { status: 500 });
  }
}
