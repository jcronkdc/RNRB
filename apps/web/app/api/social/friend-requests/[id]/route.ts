import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// PATCH - Accept or decline a friend request
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const body = await request.json();
    const { action } = body; // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    // Find the follow relationship (friend request)
    const followRequest = await prisma.userFollow.findUnique({
      where: { id },
      include: {
        follower: {
          select: { id: true, name: true },
        },
      },
    });

    if (!followRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Verify this request is for the current user
    if (followRequest.followingId !== userId) {
      return NextResponse.json({ error: 'Not authorized to manage this request' }, { status: 403 });
    }

    if (action === 'accept') {
      // Accept = follow them back (creates mutual follow = friendship)
      await prisma.userFollow.create({
        data: {
          followerId: userId,
          followingId: followRequest.followerId,
        },
      });

      return NextResponse.json({
        success: true,
        message: `You are now friends with ${followRequest.follower.name || 'this user'}`,
        isFriends: true,
      });
    } else {
      // Decline = remove their follow (they can re-follow later if they want)
      await prisma.userFollow.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Friend request declined',
        isFriends: false,
      });
    }
  } catch (error) {
    console.error('Error processing friend request:', error);
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 });
  }
}

// DELETE - Cancel a sent friend request (unfollow)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Find and verify the follow relationship
    const followRequest = await prisma.userFollow.findUnique({
      where: { id },
    });

    if (!followRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Can only cancel your own sent requests
    if (followRequest.followerId !== userId) {
      return NextResponse.json({ error: 'Not authorized to cancel this request' }, { status: 403 });
    }

    await prisma.userFollow.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Friend request cancelled',
    });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    return NextResponse.json({ error: 'Failed to cancel friend request' }, { status: 500 });
  }
}
