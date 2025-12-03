/**
 * Message Request Actions API
 *
 * POST - Accept a message request (follow the sender back)
 * DELETE - Delete/ignore a message request
 */

import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// POST - Accept a message request (follow the sender)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { requestId } = await params;

    // requestId format is the channelId: "dm:userId1:userId2"
    // Extract the other user's ID
    const parts = requestId.split(':');
    let senderId: string | null = null;

    if (parts[0] === 'dm' && parts.length === 3) {
      // Find which ID is not the current user
      senderId = parts[1] === userId ? parts[2] : parts[1];
    } else if (parts[0] === 'request' && parts.length === 2) {
      senderId = parts[1];
    }

    if (!senderId) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    // Verify sender exists
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, name: true },
    });

    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Follow the sender to "accept" the request (creates a connection)
    await prisma.userFollow.upsert({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: senderId,
        },
      },
      create: {
        followerId: userId,
        followingId: senderId,
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      message: `You are now connected with ${sender.name || 'this user'}`,
      senderId,
    });
  } catch (error) {
    console.error('Error accepting message request:', error);
    return NextResponse.json({ error: 'Failed to accept request' }, { status: 500 });
  }
}

// DELETE - Delete/ignore a message request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { requestId } = await params;

    // requestId is the channelId
    // Soft delete all messages in this channel from the sender
    const parts = requestId.split(':');
    let senderId: string | null = null;

    if (parts[0] === 'dm' && parts.length === 3) {
      senderId = parts[1] === userId ? parts[2] : parts[1];
    } else if (parts[0] === 'request' && parts.length === 2) {
      senderId = parts[1];
    }

    if (!senderId) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    // Mark messages as deleted (soft delete)
    await prisma.chatMessage.updateMany({
      where: {
        channelId: requestId,
        senderId,
      },
      data: {
        isDeleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message request deleted',
    });
  } catch (error) {
    console.error('Error deleting message request:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
