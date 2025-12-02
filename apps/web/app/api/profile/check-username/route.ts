import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        available: false,
        error:
          'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
      });
    }

    // Check if username is taken
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Find any profile with this username (excluding current user's profile)
    const existingProfile = await prisma.$queryRaw<{ id: string; userId: string }[]>`
      SELECT id, "userId" FROM "MusicianProfile" 
      WHERE "socialLinks" IS NOT NULL 
      AND "socialLinks"->>'username' = ${username}
      LIMIT 1
    `;

    // If profile exists and belongs to a different user, username is taken
    if (existingProfile.length > 0 && existingProfile[0].userId !== currentUserId) {
      return NextResponse.json({ available: false, error: 'Username is already taken' });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('[Check Username] Error:', error);
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}
