import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        createdAt: true,
        communityTracks: {
          include: {
            song: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
            _count: {
              select: {
                likes: true,
                plays: true,
                comments: true,
              },
            },
          },
          orderBy: { publishedAt: 'desc' },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current user follows this user
    const session = await auth();
    let isFollowing = false;

    if (session?.user?.id) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      user: {
        ...user,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        tracks: user.communityTracks,
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
