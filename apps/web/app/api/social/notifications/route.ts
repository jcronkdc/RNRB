import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Check if Notification model exists in the schema
    // For now, we'll create notifications from activity
    // This is a placeholder that generates notifications from recent activity

    // Get recent follows
    const recentFollows = await prisma.userFollow.findMany({
      where: {
        followingId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Transform follows into notification format
    const notifications = recentFollows.map((follow) => ({
      id: `follow_${follow.id}`,
      type: 'follow' as const,
      read: false, // In production, track this in a separate table
      createdAt: follow.createdAt.toISOString(),
      fromUser: {
        id: follow.follower.id,
        name: follow.follower.name,
        image: follow.follower.image,
      },
      data: {},
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
