/**
 * Block User from Conversation API
 *
 * POST - Block the other participant in this conversation
 * DELETE - Unblock the other participant
 *
 * Blocking:
 * - Prevents them from sending you messages
 * - Hides their messages from your inbox
 * - Removes them from your friends/followers
 * - They won't be notified of the block
 */

import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { blockUser, unblockUser } from '@/lib/spam-protection';

// POST - Block user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { conversationId } = await params;

    // Verify user is part of this conversation
    if (!conversationId.includes(userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Extract other user ID
    const parts = conversationId.split(':');
    const otherUserId = parts[1] === userId ? parts[2] : parts[1];

    if (!otherUserId) {
      return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 });
    }

    // Block the user
    await blockUser(userId, otherUserId);

    // Also remove any follow relationships
    try {
      await prisma.userFollow.deleteMany({
        where: {
          OR: [
            { followerId: userId, followingId: otherUserId },
            { followerId: otherUserId, followingId: userId },
          ],
        },
      });
    } catch {
      // Might fail if already deleted
    }

    // Archive the conversation
    try {
      await prisma.conversationSettings.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        create: {
          conversationId,
          userId,
          isArchived: true,
        },
        update: {
          isArchived: true,
        },
      });
    } catch {
      // Model might not exist
    }

    return NextResponse.json({
      success: true,
      message: 'User blocked. They can no longer message you.',
      blockedUserId: otherUserId,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
}

// DELETE - Unblock user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { conversationId } = await params;

    // Verify user is part of this conversation
    if (!conversationId.includes(userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Extract other user ID
    const parts = conversationId.split(':');
    const otherUserId = parts[1] === userId ? parts[2] : parts[1];

    if (!otherUserId) {
      return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 });
    }

    // Unblock the user
    await unblockUser(userId, otherUserId);

    return NextResponse.json({
      success: true,
      message: 'User unblocked. They can now message you again.',
      unblockedUserId: otherUserId,
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
  }
}
