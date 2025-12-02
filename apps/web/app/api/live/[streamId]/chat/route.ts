/**
 * Live Stream Chat API
 *
 * GET /api/live/[streamId]/chat - Get recent chat messages
 * POST /api/live/[streamId]/chat - Send a chat message
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ streamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { streamId } = await params;
    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Get messages with sender info
    const messages = await db.$queryRaw<any[]>`
      SELECT 
        c.*,
        u.name as sender_name,
        u.image as sender_avatar
      FROM live_stream_chat c
      JOIN "User" u ON c.sender_id = u.id
      WHERE c.stream_id = ${streamId}::uuid
        AND c.is_visible = true
        ${before ? db.$queryRaw`AND c.created_at < ${new Date(before)}` : db.$queryRaw``}
      ORDER BY c.created_at DESC
      LIMIT ${limit}
    `;

    // Reverse to get chronological order
    messages.reverse();

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        message: m.message,
        type: m.message_type,
        tipAmount: m.tip_amount,
        tipCurrency: m.tip_currency,
        isPinned: m.is_pinned,
        badges: m.badges,
        color: m.color,
        replyToId: m.reply_to_id,
        createdAt: m.created_at,
        sender: {
          id: m.sender_id,
          name: m.sender_name,
          avatar: m.sender_avatar,
        },
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]/chat', method: 'GET' });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { streamId } = await params;
    const body = await request.json();

    const { message, replyToId } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 characters)' }, { status: 400 });
    }

    // Verify stream exists and is live
    const streams = await db.$queryRaw<any[]>`
      SELECT id, chat_enabled, slow_mode_seconds, follower_only_chat, streamer_id
      FROM live_streams
      WHERE id = ${streamId}::uuid AND status = 'live'
    `;

    if (streams.length === 0) {
      return NextResponse.json({ error: 'Stream not found or not live' }, { status: 404 });
    }

    const stream = streams[0];

    if (!stream.chat_enabled) {
      return NextResponse.json({ error: 'Chat is disabled for this stream' }, { status: 403 });
    }

    // Check follower-only chat
    if (stream.follower_only_chat && stream.streamer_id !== user.id) {
      const isFollowing = await db.$queryRaw<any[]>`
        SELECT 1 FROM live_stream_follows
        WHERE follower_id = ${user.id} AND streamer_id = ${stream.streamer_id}
      `;
      if (isFollowing.length === 0) {
        return NextResponse.json(
          {
            error: 'Chat is for followers only',
            followRequired: true,
          },
          { status: 403 }
        );
      }
    }

    // Check slow mode
    if (stream.slow_mode_seconds > 0 && stream.streamer_id !== user.id) {
      const lastMessage = await db.$queryRaw<any[]>`
        SELECT created_at FROM live_stream_chat
        WHERE stream_id = ${streamId}::uuid AND sender_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (lastMessage.length > 0) {
        const timeSinceLastMessage =
          (Date.now() - new Date(lastMessage[0].created_at).getTime()) / 1000;
        if (timeSinceLastMessage < stream.slow_mode_seconds) {
          const waitSeconds = Math.ceil(stream.slow_mode_seconds - timeSinceLastMessage);
          return NextResponse.json(
            {
              error: `Slow mode: wait ${waitSeconds} seconds`,
              waitSeconds,
            },
            { status: 429 }
          );
        }
      }
    }

    // Get user badges
    const badges: string[] = [];
    if (stream.streamer_id === user.id) {
      badges.push('streamer');
    }
    // Could add more badges: subscriber, moderator, vip, etc.

    // Create message
    const messages = await db.$queryRaw<any[]>`
      INSERT INTO live_stream_chat (stream_id, sender_id, message, badges, reply_to_id)
      VALUES (${streamId}::uuid, ${user.id}, ${message.trim()}, ${badges}::text[], ${replyToId || null}::uuid)
      RETURNING *
    `;

    // Update chat count on stream
    await db.$executeRaw`
      UPDATE live_streams 
      SET total_chat_messages = total_chat_messages + 1, updated_at = NOW()
      WHERE id = ${streamId}::uuid
    `;

    // Update viewer's message count
    const sessionId = request.cookies.get('viewer_session')?.value;
    if (sessionId) {
      await db.$executeRaw`
        UPDATE live_stream_viewers 
        SET messages_sent = messages_sent + 1
        WHERE stream_id = ${streamId}::uuid AND session_id = ${sessionId}
      `;
    }

    const createdMessage = messages[0];

    return NextResponse.json({
      message: {
        id: createdMessage.id,
        message: createdMessage.message,
        type: createdMessage.message_type,
        isPinned: createdMessage.is_pinned,
        badges: createdMessage.badges,
        replyToId: createdMessage.reply_to_id,
        createdAt: createdMessage.created_at,
        sender: {
          id: user.id,
          name: user.name,
          avatar: user.image,
        },
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]/chat', method: 'POST' });
  }
}
