/**
 * Chat Messages API
 *
 * GET /api/chat/messages
 * - Retrieves message history for a channel
 * - Supports pagination
 * - Filters by message type
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { prisma as db } from '@cronkwaters/db';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Message ID for pagination
    const messageType = searchParams.get('type'); // Filter by type

    if (!channelId) {
      return NextResponse.json({ error: 'channelId required' }, { status: 400 });
    }

    // Build query
    const where: any = {
      channelId,
      isDeleted: false,
    };

    if (messageType) {
      where.messageType = messageType;
    }

    if (before) {
      where.createdAt = {
        lt: new Date(before),
      };
    }

    // Get messages from database
    const messages = await db.chatMessage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Transform to frontend format
    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg.id,
      type: msg.messageType,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderEmail: msg.senderEmail,
      senderAvatar: msg.senderAvatar,
      content: msg.content,
      audioUrl: msg.audioUrl,
      audioDuration: msg.audioDuration,
      waveformData: msg.waveformData,
      videoUrl: msg.videoUrl,
      videoDuration: msg.videoDuration,
      timestamp: msg.createdAt,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      threadId: msg.threadId,
      reactions: msg.reactions,
      mentions: msg.mentions,
    }));

    return NextResponse.json({
      messages: formattedMessages,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

