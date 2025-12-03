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

    // Get IDs of users the current user is already following
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map(f => f.followingId);

    // Exclude self and already-following users
    const excludeIds = [userId, ...followingIds];

    // Get suggested users based on:
    // 1. Users with the most followers (popular)
    // 2. Recently active users (posted content recently)
    // 3. Users with similar genres (if musician profile exists)
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        musicianProfile: {
          select: {
            genres: true,
            instruments: true,
            availableForCollaboration: true,
          },
        },
        _count: {
          select: {
            followers: true,
            authoredPosts: true,
          },
        },
      },
      orderBy: [
        { followers: { _count: 'desc' } },
        { authoredPosts: { _count: 'desc' } },
      ],
      take: 6,
    });

    // Check if any of these users follow the current user (for "Follows you" badge)
    const followerCheck = await prisma.userFollow.findMany({
      where: {
        followerId: { in: suggestedUsers.map(u => u.id) },
        followingId: userId,
      },
      select: { followerId: true },
    });
    const followsYouIds = new Set(followerCheck.map(f => f.followerId));

    const suggestions = suggestedUsers.map(user => ({
      id: user.id,
      name: user.name,
      image: user.image,
      email: user.email,
      profile: user.musicianProfile,
      stats: {
        followers: user._count.followers,
        posts: user._count.authoredPosts,
      },
      followsYou: followsYouIds.has(user.id),
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

