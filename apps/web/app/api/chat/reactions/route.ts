/**
 * Chat Reactions API
 *
 * POST /api/chat/reactions - Add a reaction
 * DELETE /api/chat/reactions - Remove a reaction
 *
 * Reactions are stored as JSON: { "👍": ["userId1", "userId2"], "❤️": ["userId3"] }
 */

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';

export const runtime = 'nodejs';

// Common emoji reactions for chat
const ALLOWED_EMOJIS = [
  '👍',
  '👎',
  '❤️',
  '🔥',
  '😂',
  '😮',
  '😢',
  '🎵',
  '🎸',
  '🥁',
  '🎹',
  '🎤',
  '✅',
  '❌',
  '💯',
  '🙌',
  '👏',
  '🤘',
  '⭐',
  '💡',
];

interface ReactionBody {
  messageId: string;
  emoji: string;
}

/**
 * POST - Add a reaction to a message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body: ReactionBody = await request.json();
    const { messageId, emoji } = body;

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'messageId and emoji are required' }, { status: 400 });
    }

    // Validate emoji
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json(
        { error: 'Invalid emoji', allowedEmojis: ALLOWED_EMOJIS },
        { status: 400 }
      );
    }

    // Get current message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, reactions: true, channelId: true },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Parse existing reactions
    const reactions = (message.reactions as Record<string, string[]>) || {};

    // Add user to emoji array if not already there
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    // Update message with new reactions
    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { reactions },
      select: {
        id: true,
        reactions: true,
      },
    });

    // Broadcast reaction via Ably if configured
    if (process.env.ABLY_API_KEY) {
      try {
        const Ably = (await import('ably')).default;
        const ably = new Ably.Rest(process.env.ABLY_API_KEY);
        const channel = ably.channels.get(message.channelId);

        await channel.publish('reaction-added', {
          messageId,
          emoji,
          userId,
          reactions: updated.reactions,
        });
      } catch (ablyError) {
        console.warn('Ably broadcast failed:', ablyError);
        // Don't fail the request if Ably fails
      }
    }

    return NextResponse.json({
      success: true,
      messageId,
      emoji,
      reactions: updated.reactions,
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

/**
 * DELETE - Remove a reaction from a message
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const emoji = searchParams.get('emoji');

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'messageId and emoji are required' }, { status: 400 });
    }

    // Get current message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, reactions: true, channelId: true },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Parse existing reactions
    const reactions = (message.reactions as Record<string, string[]>) || {};

    // Remove user from emoji array
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id) => id !== userId);

      // Remove emoji key if no users left
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    // Update message
    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { reactions },
      select: {
        id: true,
        reactions: true,
      },
    });

    // Broadcast via Ably
    if (process.env.ABLY_API_KEY) {
      try {
        const Ably = (await import('ably')).default;
        const ably = new Ably.Rest(process.env.ABLY_API_KEY);
        const channel = ably.channels.get(message.channelId);

        await channel.publish('reaction-removed', {
          messageId,
          emoji,
          userId,
          reactions: updated.reactions,
        });
      } catch (ablyError) {
        console.warn('Ably broadcast failed:', ablyError);
      }
    }

    return NextResponse.json({
      success: true,
      messageId,
      emoji,
      reactions: updated.reactions,
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}
