import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - Fetch online users (friends with recent activity)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get users the current user follows
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Get recent activity threshold (within last 15 minutes = "online")
    const recentThreshold = new Date(Date.now() - 15 * 60 * 1000);

    // Find users who are following back (mutual = friends) and have recent activity
    const onlineUsers = await prisma.user.findMany({
      where: {
        id: { in: followingIds },
        // Check if they follow us back (mutual)
        following: {
          some: { followingId: userId },
        },
        // Either has a musician profile with recent status OR has been active recently
        OR: [
          {
            musicianProfile: {
              currentStatus: { not: null },
              updatedAt: { gte: recentThreshold },
            },
          },
          {
            updatedAt: { gte: recentThreshold },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        musicianProfile: {
          select: {
            currentStatus: true,
            updatedAt: true,
          },
        },
      },
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const users = onlineUsers.map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image,
      activity: user.musicianProfile?.currentStatus || null,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching online users:', error);
    return NextResponse.json({ error: 'Failed to fetch online users' }, { status: 500 });
  }
}
