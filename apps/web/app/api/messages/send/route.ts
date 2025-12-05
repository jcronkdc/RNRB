/**
 * Direct Messages API
 *
 * POST - Send a direct message to a user
 *
 * Security Features:
 * - Rate limiting (10 messages/minute, 5 second cooldown per recipient)
 * - Spam content filtering
 * - Duplicate message detection
 * - User blocking support
 *
 * Message Routing:
 * - Friends/connections: Message goes to direct inbox
 * - Non-friends: Message goes to "Message Requests" folder
 */

import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { recordMessage, validateMessage } from '@/lib/spam-protection';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const senderId = session.user.id;
    const body = await request.json();
    const { recipientId, content, channelId } = body;

    // Validate required fields
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Can't message yourself
    if (recipientId === senderId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, name: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // 🔒 COMPREHENSIVE SPAM PROTECTION (with atomic rate limit reservation)
    const validation = await validateMessage(senderId, recipientId, trimmedContent);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Message could not be sent' },
        { status: 400 }
      );
    }

    // Get sender info for the message
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, name: true, image: true, email: true },
    });

    // Create or get the chat channel for DMs
    const resolvedChannelId = channelId || `dm:${[senderId, recipientId].sort().join(':')}`;

    // Save message to database
    // If this fails, we release the rate limit reservation
    let message;
    try {
      message = await prisma.chatMessage.create({
        data: {
          channelId: resolvedChannelId,
          channelType: 'direct',
          senderId,
          senderName: sender?.name || sender?.email || 'Unknown',
          senderEmail: sender?.email || '',
          senderAvatar: sender?.image,
          messageType: 'text',
          content: trimmedContent,
        },
      });
    } catch (dbError) {
      // Release the rate limit reservation since the message wasn't actually sent
      validation.releaseRateLimit();
      throw dbError;
    }

    // Record message content for duplicate detection (rate limit already handled by reservation)
    recordMessage(senderId, recipientId, trimmedContent);

    // Broadcast via Ably if available
    if (process.env.ABLY_API_KEY) {
      try {
        const Ably = (await import('ably')).default;
        const ably = new Ably.Rest(process.env.ABLY_API_KEY);
        const channel = ably.channels.get(resolvedChannelId);

        await channel.publish('message', {
          id: message.id,
          senderId,
          senderName: sender?.name,
          senderAvatar: sender?.image,
          content: trimmedContent,
          timestamp: message.createdAt.toISOString(),
        });
      } catch (ablyError) {
        console.error('Ably broadcast error:', ablyError);
        // Don't fail the request if Ably fails
      }
    }

    // Determine if this went to requests or direct inbox
    const isMessageRequest = validation.deliveryType === 'request';

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        channelId: resolvedChannelId,
        content: trimmedContent,
        sender: {
          id: senderId,
          name: sender?.name,
          avatar: sender?.image,
        },
        createdAt: message.createdAt,
      },
      // Let the sender know if message went to requests
      deliveryType: validation.deliveryType,
      notice: isMessageRequest
        ? `Your message was sent to ${recipient.name || 'this user'}'s message requests since you're not connected.`
        : undefined,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
