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
            location: true,
            socialLinks: true,
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
            song: { select: { title: true } },
            _count: { select: { plays: true, likes: true } },
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Type assertion for included relations
    type UserWithIncludes = typeof user & {
      musicianProfile: {
        instruments: string[];
        genres: string[];
        availableForCollaboration: boolean;
        availableForGigs: boolean;
        bio: string | null;
        location: string | null;
        website: string | null;
      } | null;
      _count: {
        followers: number;
        following: number;
        authoredPosts: number;
        communityTracks: number;
      };
      authoredPosts: {
        id: string;
        content: string;
        likeCount: number;
        commentCount: number;
        createdAt: Date;
      }[];
      communityTracks: {
        id: string;
        title: string;
        playCount: number;
        likeCount: number;
        createdAt: Date;
      }[];
    };
    const userData = user as UserWithIncludes;

    // Calculate friends count (mutual follows)
    const friendsCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM "UserFollow" f1
      INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
      WHERE f1."followerId" = ${userId}
    `.then((result) => Number(result[0]?.count || 0));

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      bio: userData.musicianProfile?.bio || null,
      location: userData.musicianProfile?.location || null,
      website: userData.musicianProfile?.website || null,
      createdAt: userData.createdAt.toISOString(),
      musicianProfile: userData.musicianProfile
        ? {
            instruments: userData.musicianProfile.instruments,
            genres: userData.musicianProfile.genres,
            availableForCollaboration: userData.musicianProfile.availableForCollaboration,
            availableForGigs: userData.musicianProfile.availableForGigs,
          }
        : null,
      stats: {
        followers: userData._count.followers,
        following: userData._count.following,
        friends: friendsCount,
        posts: userData._count.authoredPosts,
        tracks: userData._count.communityTracks,
      },
      recentPosts: userData.authoredPosts,
      recentTracks: userData.communityTracks,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
