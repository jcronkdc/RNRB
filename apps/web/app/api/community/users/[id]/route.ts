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
        pro: true,
        mlcMember: true,
        profileCompleted: true,
        subscriptionTier: true,
        // Musician Profile - comprehensive info
        musicianProfile: {
          select: {
            id: true,
            instruments: true,
            genres: true,
            skills: true,
            experience: true,
            availableForCollaboration: true,
            availableForGigs: true,
            hourlyRate: true,
            location: true,
            willingToTravel: true,
            travelRadius: true,
            portfolio: true,
            socialLinks: true,
            currentStatus: true,
            statusMessage: true,
            lookingFor: true,
            openToOpportunities: true,
            featuredSongId: true,
            featuredProjectId: true,
            totalPracticeMinutes: true,
            currentStreak: true,
            longestStreak: true,
            completedSongs: true,
            completedProjects: true,
            collaborationsCount: true,
            showsPlayed: true,
            totalRevenue: true,
          },
        },
        // Community Tracks
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
          take: 10,
        },
        // Social Feed Posts
        authoredPosts: {
          where: {
            isDeleted: false,
            visibility: 'public',
          },
          include: {
            _count: {
              select: {
                reactions: true,
                comments: true,
                shares: true,
                plays: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        // Followers list (people who follow this user)
        followers: {
          select: {
            id: true,
            createdAt: true,
            follower: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        // Following list (people this user follows)
        following: {
          select: {
            id: true,
            createdAt: true,
            following: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        // Songs (for music tab)
        songs: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            artworkUrl: true,
            createdAt: true,
            visibility: true,
            status: true,
          },
          where: {
            visibility: 'public',
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        // Projects
        projectMemberships: {
          select: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                coverImage: true,
                status: true,
              },
            },
            role: true,
          },
          take: 6,
        },
        // Counts for stats
        _count: {
          select: {
            followers: true,
            following: true,
            songs: true,
            communityTracks: true,
            authoredPosts: true,
            projectMemberships: true,
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
    let isOwnProfile = false;

    if (session?.user?.id) {
      isOwnProfile = session.user.id === id;

      if (!isOwnProfile) {
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
    }

    // Get mutual connections (friends of friends)
    let mutualConnections: any[] = [];
    if (session?.user?.id && !isOwnProfile) {
      // Get IDs of people the current user follows
      const currentUserFollowing = await prisma.userFollow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      const currentUserFollowingIds = currentUserFollowing.map((f) => f.followingId);

      // Get IDs of people who follow the profile user
      const profileUserFollowers = await prisma.userFollow.findMany({
        where: { followingId: id },
        select: { followerId: true },
      });
      const profileUserFollowerIds = profileUserFollowers.map((f) => f.followerId);

      // Find intersection (mutual connections)
      const mutualIds = currentUserFollowingIds.filter((fId) =>
        profileUserFollowerIds.includes(fId)
      );

      if (mutualIds.length > 0) {
        const mutuals = await prisma.user.findMany({
          where: { id: { in: mutualIds.slice(0, 3) } },
          select: { id: true, name: true, image: true },
        });
        mutualConnections = mutuals;
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
        createdAt: user.createdAt,
        pro: user.pro,
        subscriptionTier: user.subscriptionTier,
        mlcMember: user.mlcMember,
        profileCompleted: user.profileCompleted,
        musicianProfile: user.musicianProfile,
        tracks: user.communityTracks,
        posts: user.authoredPosts,
        songs: user.songs,
        projects: user.projectMemberships.map((pm: (typeof user.projectMemberships)[0]) => ({
          ...pm.project,
          role: pm.role,
        })),
        followers: user.followers.map((f: (typeof user.followers)[0]) => f.follower),
        following: user.following.map((f: (typeof user.following)[0]) => f.following),
        followerCount: user._count.followers,
        followingCount: user._count.following,
        trackCount: user._count.communityTracks,
        songCount: user._count.songs,
        postCount: user._count.authoredPosts,
        projectCount: user._count.projectMemberships,
        isFollowing,
        isOwnProfile,
        mutualConnections,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
