import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: profileId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Fetch user with all profile data
    const user = await prisma.user.findUnique({
      where: { id: profileId },
      include: {
        musicianProfile: {
          select: {
            instruments: true,
            genres: true,
            availableForCollaboration: true,
            availableForGigs: true,
            location: true,
            socialLinks: true,
            currentStatus: true,
            statusMessage: true,
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
            genre: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Type assertion for included relations
    const userData = user as typeof user & {
      musicianProfile: {
        instruments: string[];
        genres: string[];
        availableForCollaboration: boolean;
        availableForGigs: boolean;
        bio: string | null;
        location: string | null;
        website: string | null;
        currentStatus: string | null;
        statusMessage: string | null;
      } | null;
      _count: {
        followers: number;
        following: number;
        authoredPosts: number;
        communityTracks: number;
      };
    };

    // Calculate friends count (mutual follows)
    const friendsCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM "UserFollow" f1
      INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
      WHERE f1."followerId" = ${profileId}
    `.then((result) => Number(result[0]?.count || 0));

    // Check relationship with current user
    let isFollowing = false;
    let isFollowedBy = false;
    let mutualFriends: { id: string; name: string | null; image: string | null }[] = [];

    if (currentUserId && currentUserId !== profileId) {
      // Check if current user follows this profile
      const followingCheck = await prisma.userFollow.findFirst({
        where: {
          followerId: currentUserId,
          followingId: profileId,
        },
      });
      isFollowing = !!followingCheck;

      // Check if this profile follows current user
      const followedByCheck = await prisma.userFollow.findFirst({
        where: {
          followerId: profileId,
          followingId: currentUserId,
        },
      });
      isFollowedBy = !!followedByCheck;

      // Get mutual friends (users that both follow each other with both current user and profile user)
      // Get current user's friends
      const currentUserFriends = await prisma.$queryRaw<{ id: string }[]>`
        SELECT f1."followingId" as id
        FROM "UserFollow" f1
        INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
        WHERE f1."followerId" = ${currentUserId}
      `;

      // Get profile user's friends
      const profileUserFriends = await prisma.$queryRaw<{ id: string }[]>`
        SELECT f1."followingId" as id
        FROM "UserFollow" f1
        INNER JOIN "UserFollow" f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
        WHERE f1."followerId" = ${profileId}
      `;

      const currentFriendIds = new Set(currentUserFriends.map((f) => f.id));
      const mutualFriendIds = profileUserFriends
        .filter((f) => currentFriendIds.has(f.id))
        .map((f) => f.id)
        .slice(0, 10);

      if (mutualFriendIds.length > 0) {
        const mutualFriendsData = await prisma.user.findMany({
          where: { id: { in: mutualFriendIds } },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });
        mutualFriends = mutualFriendsData;
      }
    }

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
            currentStatus: userData.musicianProfile.currentStatus,
            statusMessage: userData.musicianProfile.statusMessage,
          }
        : null,
      stats: {
        followers: userData._count.followers,
        following: userData._count.following,
        friends: friendsCount,
        posts: userData._count.authoredPosts,
        tracks: userData._count.communityTracks,
      },
      isFollowing,
      isFollowedBy,
      isFriend: isFollowing && isFollowedBy,
      recentPosts: (user as typeof userData).authoredPosts,
      recentTracks: (user as typeof userData).communityTracks,
      mutualFriends,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
