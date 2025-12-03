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
            bio: true,
            location: true,
            website: true,
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
            currentStatus: user.musicianProfile.currentStatus,
            statusMessage: user.musicianProfile.statusMessage,
          }
        : null,
      stats: {
        followers: user._count.followers,
        following: user._count.following,
        friends: friendsCount,
        posts: user._count.authoredPosts,
        tracks: user._count.communityTracks,
      },
      isFollowing,
      isFollowedBy,
      isFriend: isFollowing && isFollowedBy,
      recentPosts: user.authoredPosts,
      recentTracks: user.communityTracks,
      mutualFriends,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
