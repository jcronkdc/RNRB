import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - Fetch friends (mutual follows)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get users that current user follows
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    // Get users that follow current user AND current user follows them back (mutual = friends)
    const friends = await prisma.userFollow.findMany({
      where: {
        followingId: userId,
        followerId: { in: followingIds }, // They follow us AND we follow them
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            _count: {
              select: { followers: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const friendsList = friends.map((f) => ({
      id: f.follower.id,
      name: f.follower.name,
      image: f.follower.image,
      email: f.follower.email,
      followerCount: f.follower._count.followers,
    }));

    return NextResponse.json({ friends: friendsList });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}
