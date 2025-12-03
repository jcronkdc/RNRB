import { NextResponse } from 'next/server';

/**
 * ADMIN ENDPOINT - Reset Stalwart Mail Server Password
 *
 * This endpoint directly resets the password on the Stalwart mail server
 * for email accounts like justin@rnrb.me when the user can't use the
 * normal recovery flow (no recovery email set up).
 *
 * Protected by ADMIN_PASSWORD_RESET_KEY environment variable.
 *
 * Usage: POST /api/admin/reset-email-password
 * Body: { emailAddress, newPassword, adminKey }
 */

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailAddress, newPassword, adminKey } = body;

    // SECURITY: Require admin key from environment
    const expectedKey = process.env.ADMIN_PASSWORD_RESET_KEY;

    if (!expectedKey) {
      console.error('[ADMIN-EMAIL] ADMIN_PASSWORD_RESET_KEY not configured');
      return NextResponse.json(
        { error: 'Admin endpoint not configured. Set ADMIN_PASSWORD_RESET_KEY in Vercel.' },
        { status: 500 }
      );
    }

    if (adminKey !== expectedKey) {
      console.error('[ADMIN-EMAIL] Invalid admin key attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validation
    if (!emailAddress) {
      return NextResponse.json({ error: 'emailAddress required' }, { status: 400 });
    }

    if (!newPassword) {
      return NextResponse.json({ error: 'newPassword required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if Stalwart credentials are configured
    if (!STALWART_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'STALWART_ADMIN_PASSWORD not configured' },
        { status: 500 }
      );
    }

    const normalizedEmail = emailAddress.toLowerCase();
    const username = normalizedEmail.split('@')[0];

    console.log('[ADMIN-EMAIL] Resetting password for:', normalizedEmail, 'username:', username);

    // Update password on Stalwart
    const response = await stalwartFetch(`/api/principal/${username}`, {
      method: 'PATCH',
      body: JSON.stringify({
        secrets: [newPassword],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ADMIN-EMAIL] Stalwart API error:', response.status, errorText);
      return NextResponse.json(
        {
          error: 'Failed to update password on mail server',
          details: `Status ${response.status}: ${errorText}`,
        },
        { status: 500 }
      );
    }

    console.log('[ADMIN-EMAIL] Password reset successful for:', normalizedEmail);

    return NextResponse.json({
      success: true,
      message: `Password for ${normalizedEmail} has been reset successfully`,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('[ADMIN-EMAIL] Error:', error);
    return NextResponse.json(
      {
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if an email account exists on Stalwart
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const emailAddress = url.searchParams.get('emailAddress');
    const adminKey = url.searchParams.get('adminKey');

    // SECURITY: Require admin key
    const expectedKey = process.env.ADMIN_PASSWORD_RESET_KEY;

    if (!expectedKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!emailAddress) {
      return NextResponse.json({ error: 'emailAddress required' }, { status: 400 });
    }

    if (!STALWART_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'STALWART_ADMIN_PASSWORD not configured' },
        { status: 500 }
      );
    }

    const username = emailAddress.toLowerCase().split('@')[0];

    const response = await stalwartFetch(`/api/principal/${username}`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          exists: false,
          message: 'Email account not found on mail server',
        });
      }
      return NextResponse.json({ error: 'Failed to check account' }, { status: 500 });
    }

    const userData = await response.json();

    return NextResponse.json({
      exists: true,
      account: {
        username: userData.name,
        emails: userData.emails,
        quota: userData.quota,
        enabled: userData.enabled !== false,
        description: userData.description,
      },
    });
  } catch (error) {
    console.error('[ADMIN-EMAIL] Check error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}

