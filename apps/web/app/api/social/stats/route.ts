import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all stats in parallel
    const [
      followersCount,
      followingCount,
      friendsCount,
      pendingRequestsCount,
      unreadMessagesCount,
      profileViewsCount,
    ] = await Promise.all([
      // Followers count
      prisma.userFollow.count({
        where: { followingId: userId },
      }),
      // Following count
      prisma.userFollow.count({
        where: { followerId: userId },
      }),
      // Friends count (mutual follows)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM "UserFollow" f1
        INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
        WHERE f1."followerId" = ${userId}
      `.then((result) => Number(result[0]?.count || 0)),
      // Pending friend requests (people who follow you but you don't follow back)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM "UserFollow" f1
        LEFT JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
        WHERE f1."followingId" = ${userId} AND f2.id IS NULL
      `.then((result) => Number(result[0]?.count || 0)),
      // Unread messages count
      prisma.message
        .count({
          where: {
            conversation: {
              participants: {
                some: { userId },
              },
            },
            senderId: { not: userId },
            readAt: null,
          },
        })
        .catch(() => 0), // Handle if Message model doesn't exist
      // Profile views (from last 30 days) - placeholder for now
      Promise.resolve(0), // Will implement profile views tracking later
    ]);

    return NextResponse.json({
      followers: followersCount,
      following: followingCount,
      friends: friendsCount,
      pendingRequests: pendingRequestsCount,
      unreadMessages: unreadMessagesCount,
      profileViews: profileViewsCount,
    });
  } catch (error) {
    console.error('Error fetching social stats:', error);
    return NextResponse.json({ error: 'Failed to fetch social stats' }, { status: 500 });
  }
}
