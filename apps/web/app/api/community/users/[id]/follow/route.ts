import { prisma } from '@cronkwaters/db';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/auth';
import { isBlocked } from '@/lib/social';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Block check — if either party blocked the other, deny the interaction
    const blocked = await isBlocked(session.user.id, targetUserId);
    if (blocked) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    let isFollowing: boolean;

    if (existing) {
      // Unfollow
      await prisma.userFollow.delete({
        where: { id: existing.id },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.userFollow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      });
      isFollowing = true;
    }

    // Get updated counts
    const followerCount = await prisma.userFollow.count({
      where: { followingId: targetUserId },
    });

    return NextResponse.json({
      isFollowing,
      followerCount,
    });
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}
