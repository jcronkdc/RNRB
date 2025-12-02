import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'support',
  'help',
  'info',
  'contact',
  'noreply',
  'no-reply',
  'postmaster',
  'webmaster',
  'abuse',
  'security',
  'root',
  'system',
  'mail',
  'email',
  'rnrb',
  'rocknroll',
  'rock',
  'roll',
  'basement',
  'team',
  'staff',
  'hello',
  'hi',
  'sales',
  'billing',
  'legal',
  'press',
  'media',
  'news',
  'newsletter',
  'marketing',
  'api',
  'www',
  'ftp',
  'smtp',
  'imap',
  'pop',
  'music',
  'band',
  'artist',
  'booking',
  'tour',
  'merch',
  'store',
  'shop',
  'buy',
  'sell',
  'official',
  'verified',
  'pro',
  'premium',
  'vip',
  'test',
  'demo',
  'example',
];

/**
 * GET /api/email/check-username?username=xxx
 * Check if an email username is available
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Validate format
    const usernameRegex = /^[a-z0-9][a-z0-9._-]{2,29}$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return NextResponse.json({
        available: false,
        reason: 'invalid_format',
        message:
          'Username must be 3-30 characters, start with a letter or number, and contain only letters, numbers, dots, underscores, or hyphens',
      });
    }

    // Check reserved
    if (RESERVED_USERNAMES.includes(normalizedUsername)) {
      return NextResponse.json({
        available: false,
        reason: 'reserved',
        message: 'This username is reserved',
      });
    }

    // Check if already taken
    const existing = await prisma.emailAccount.findUnique({
      where: { username: normalizedUsername },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        reason: 'taken',
        message: 'This username is already taken',
      });
    }

    // Username is available!
    return NextResponse.json({
      available: true,
      username: normalizedUsername,
      emailAddresses: [
        `${normalizedUsername}@rnrb.me`,
        `${normalizedUsername}@rnrb.band`,
        `${normalizedUsername}@rnrb.app`,
      ],
    });
  } catch (error) {
    console.error('[EMAIL-API] Error checking username:', error);
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}
