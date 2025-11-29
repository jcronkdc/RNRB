import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/users/follow
 * Follow a user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();
    const followerId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === followerId) {
      return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
    }

    // Create follow relationship
    const follow = await prisma.userFollow.create({
      data: {
        followerId,
        followingId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            _count: {
              select: { followers: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        action: 'followed',
        following: follow.following,
        newFollowerCount: follow.following._count.followers,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/follow?userId=xxx
 * Unfollow a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const followerId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find and delete follow relationship
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    if (!follow) {
      return NextResponse.json({ error: 'Not following this user' }, { status: 404 });
    }

    await prisma.userFollow.delete({
      where: { id: follow.id },
    });

    // Get updated follower count
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: { select: { followers: true } },
      },
    });

    return NextResponse.json({
      success: true,
      action: 'unfollowed',
      newFollowerCount: updatedUser?._count.followers || 0,
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}

/**
 * GET /api/users/follow?userId=xxx&type=followers|following
 * Get followers or following list for a user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'followers';
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (type === 'followers') {
      const followers = await prisma.userFollow.findMany({
        where: { followingId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              _count: {
                select: { followers: true, authoredPosts: true },
              },
            },
          },
        },
      });

      // Add follow back status if logged in
      let result = followers.map((f) => f.follower);
      if (session?.user?.id) {
        const followerIds = result.map((u) => u.id);
        const followingBack = await prisma.userFollow.findMany({
          where: {
            followerId: session.user.id,
            followingId: { in: followerIds },
          },
          select: { followingId: true },
        });

        const followingSet = new Set(followingBack.map((f) => f.followingId));
        result = result.map((u) => ({
          ...u,
          isFollowingBack: followingSet.has(u.id),
          isOwnProfile: u.id === session.user?.id,
        }));
      }

      return NextResponse.json({
        users: result,
        nextCursor: followers.length === limit ? followers[followers.length - 1].id : null,
      });
    } else {
      const following = await prisma.userFollow.findMany({
        where: { followerId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              _count: {
                select: { followers: true, authoredPosts: true },
              },
            },
          },
        },
      });

      const result = following.map((f) => ({
        ...f.following,
        isFollowing: true, // They're in the following list, so obviously following
      }));

      return NextResponse.json({
        users: result,
        nextCursor: following.length === limit ? following[following.length - 1].id : null,
      });
    }
  } catch (error) {
    console.error('Error fetching follow list:', error);
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
  }
}
