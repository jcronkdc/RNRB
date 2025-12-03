import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - Fetch friend requests (people who follow you that you don't follow back)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'received'; // received, sent
    const limit = parseInt(searchParams.get('limit') || '20');

    if (type === 'received') {
      // People who follow you that you don't follow back (incoming friend requests)
      const requests = await prisma.userFollow.findMany({
        where: {
          followingId: userId,
          follower: {
            following: {
              none: {
                followingId: userId,
              },
            },
          },
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Filter to only show those where current user doesn't follow back
      const userFollowing = await prisma.userFollow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = new Set(userFollowing.map((f) => f.followingId));

      const filteredRequests = requests
        .filter((r) => !followingIds.has(r.followerId))
        .map((r) => ({
          id: r.id,
          fromUser: r.follower,
          createdAt: r.createdAt.toISOString(),
        }));

      return NextResponse.json({ requests: filteredRequests });
    } else {
      // Sent requests - people you follow that don't follow you back
      const sent = await prisma.userFollow.findMany({
        where: {
          followerId: userId,
        },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              followers: {
                where: { followerId: userId },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Filter to only show those who haven't followed back
      const pendingSent = sent
        .filter((s) => {
          // Check if they follow us back
          return !s.following.followers.some((f) => f.id);
        })
        .map((s) => ({
          id: s.id,
          toUser: {
            id: s.following.id,
            name: s.following.name,
            image: s.following.image,
            email: s.following.email,
          },
          createdAt: s.createdAt.toISOString(),
        }));

      return NextResponse.json({ requests: pendingSent });
    }
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 });
  }
}
