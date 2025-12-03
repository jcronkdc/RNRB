/**
 * User Block API
 *
 * POST - Block a user
 * DELETE - Unblock a user
 */

import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { blockUser, unblockUser } from '@/lib/spam-protection';

// POST - Block user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockerId = session.user.id;
    const { userId: blockedId } = await params;

    if (blockerId === blockedId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    // Verify blocked user exists
    const blockedUser = await prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true, name: true },
    });

    if (!blockedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Block the user using spam-protection utility
    await blockUser(blockerId, blockedId);

    // Remove any follow relationships
    try {
      await prisma.userFollow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      });
    } catch {
      // Might already be deleted
    }

    return NextResponse.json({
      success: true,
      message: `Blocked ${blockedUser.name || 'user'}`,
      blockedUserId: blockedId,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
}

// DELETE - Unblock user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockerId = session.user.id;
    const { userId: blockedId } = await params;

    // Unblock the user using spam-protection utility
    await unblockUser(blockerId, blockedId);

    return NextResponse.json({
      success: true,
      message: 'User unblocked',
      unblockedUserId: blockedId,
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
  }
}

// GET - Check if user is blocked
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { userId: otherUserId } = await params;

    try {
      const blocks = await prisma.userBlock.findMany({
        where: {
          OR: [
            { blockerId: userId, blockedId: otherUserId },
            { blockerId: otherUserId, blockedId: userId },
          ],
        },
      });

      return NextResponse.json({
        blockedByMe: blocks.some((b) => b.blockerId === userId),
        blockedByThem: blocks.some((b) => b.blockerId === otherUserId),
        anyBlock: blocks.length > 0,
      });
    } catch {
      // UserBlock model might not exist
      return NextResponse.json({
        blockedByMe: false,
        blockedByThem: false,
        anyBlock: false,
      });
    }
  } catch (error) {
    console.error('Error checking block status:', error);
    return NextResponse.json({ error: 'Failed to check block status' }, { status: 500 });
  }
}
