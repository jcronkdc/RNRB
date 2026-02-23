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

    // Get users the current user is following
    const followingRelations = await prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
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
    });

    // Get users who follow the current user
    const followerRelations = await prisma.userFollow.findMany({
      where: { followingId: userId },
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
    });

    // Get set of IDs the current user is following (for "follows back" check)
    const followingIds = new Set(followingRelations.map((r) => r.followingId));

    // Transform the data
    const following = followingRelations.map((r) => ({
      id: r.following.id,
      name: r.following.name,
      image: r.following.image,
      email: r.following.email,
      followerCount: r.following._count.followers,
    }));

    const followers = followerRelations.map((r) => ({
      id: r.follower.id,
      name: r.follower.name,
      image: r.follower.image,
      email: r.follower.email,
      followerCount: r.follower._count.followers,
      isFollowingBack: followingIds.has(r.follower.id),
    }));

    return NextResponse.json({
      following,
      followers,
      followingCount: following.length,
      followerCount: followers.length,
    });
  } catch (error) {
    console.error('Error fetching network:', error);
    return NextResponse.json({ error: 'Failed to fetch network' }, { status: 500 });
  }
}
