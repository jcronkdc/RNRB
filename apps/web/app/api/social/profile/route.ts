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

    // Fetch user with all profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        musicianProfile: {
          select: {
            instruments: true,
            genres: true,
            availableForCollaboration: true,
            availableForGigs: true,
            bio: true,
            location: true,
            website: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            authoredPosts: true,
            communityTracks: true,
          },
        },
        authoredPosts: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            content: true,
            likeCount: true,
            commentCount: true,
            createdAt: true,
          },
        },
        communityTracks: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            title: true,
            playCount: true,
            likeCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate friends count (mutual follows)
    const friendsCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM "UserFollow" f1
      INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
      WHERE f1."followerId" = ${userId}
    `.then((result) => Number(result[0]?.count || 0));

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.musicianProfile?.bio || null,
      location: user.musicianProfile?.location || null,
      website: user.musicianProfile?.website || null,
      createdAt: user.createdAt.toISOString(),
      musicianProfile: user.musicianProfile
        ? {
            instruments: user.musicianProfile.instruments,
            genres: user.musicianProfile.genres,
            availableForCollaboration: user.musicianProfile.availableForCollaboration,
            availableForGigs: user.musicianProfile.availableForGigs,
          }
        : null,
      stats: {
        followers: user._count.followers,
        following: user._count.following,
        friends: friendsCount,
        posts: user._count.authoredPosts,
        tracks: user._count.communityTracks,
      },
      recentPosts: user.authoredPosts,
      recentTracks: user.communityTracks,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
