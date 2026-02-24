import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getBlockedUserIds } from '@/lib/social';

/**
 * GET /api/discover/users
 * Search for musicians to collaborate with based on skills, genre, or location.
 * Used by the MCP server's find_collaborators tool.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const skills = searchParams.getAll('skills');
    const genre = searchParams.get('genre');
    const location = searchParams.get('location');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Get blocked users to exclude
    const blockedIds = await getBlockedUserIds(userId);
    const excludeIds = [...Array.from(blockedIds), userId]; // Also exclude self

    // Build musician profile filter
    const profileWhere: Record<string, unknown> = {};

    if (skills.length > 0) {
      profileWhere.skills = { hasSome: skills };
    }
    if (genre) {
      profileWhere.genres = { has: genre };
    }
    if (location) {
      profileWhere.location = { contains: location, mode: 'insensitive' };
    }

    // Search musician profiles
    const profiles = await prisma.musicianProfile.findMany({
      where: {
        userId: { notIn: excludeIds },
        availableForCollaboration: true,
        ...profileWhere,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    const users = profiles.map((p) => ({
      id: p.user.id,
      name: p.user.name || 'Anonymous',
      image: p.user.image,
      skills: p.skills,
      genres: p.genres,
      instruments: p.instruments,
      location: p.location || 'Unknown',
      experience: p.experience,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error discovering users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
