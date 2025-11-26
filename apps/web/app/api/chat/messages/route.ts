/**
 * Chat Messages API
 *
 * GET /api/chat/messages
 * - Retrieves message history for a channel
 * - Supports pagination
 * - Filters by message type
 */

import { NextRequest, NextResponse } from 'next/server';

import { prisma as db } from '@cronkwaters/db';

import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Use NextAuth for authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = { id: session.user.id };

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const cursor = searchParams.get('cursor'); // Cursor for pagination (message ID)
    const messageType = searchParams.get('type'); // Filter by type

    if (!channelId) {
      return NextResponse.json({ error: 'channelId required' }, { status: 400 });
    }
    
    // Parse and validate pagination parameters
    const limitParam = parseInt(searchParams.get('limit') || '50');
    
    if (isNaN(limitParam) || limitParam < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter: must be a positive integer' },
        { status: 400 }
      );
    }
    
    const limit = Math.min(limitParam, 100); // Max 100 messages

    // Build optimized query with cursor-based pagination
    const where: any = {
      channelId,
      isDeleted: false,
    };

    if (messageType) {
      where.messageType = messageType;
    }

    // Cursor-based pagination - more efficient than offset
    if (cursor) {
      where.id = {
        lt: cursor, // Get messages before this cursor
      };
    }

    // Optimized query with selective field loading
    const messages = await db.chatMessage.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }, // Secondary sort for consistency
      ],
      take: limit + 1, // Fetch one extra to check if there are more
      select: {
        id: true,
        channelId: true,
        messageType: true,
        senderId: true,
        senderName: true,
        senderEmail: true,
        senderAvatar: true,
        content: true,
        // Lazy load media fields only when needed - use spread syntax for conditional inclusion
        ...((messageType === 'voice' || !messageType) && {
          audioUrl: true,
          audioDuration: true,
          waveformData: true,
        }),
        ...((messageType === 'video' || !messageType) && {
          videoUrl: true,
          videoDuration: true,
          videoThumbnail: true,
        }),
        ...((messageType === 'file' || !messageType) && {
          attachments: true,
        }),
        createdAt: true,
        isEdited: true,
        editedAt: true,
        threadId: true,
        reactions: true,
        mentions: true,
      },
    });

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;

    // Transform to frontend format
    const formattedMessages = messagesToReturn.reverse().map((msg) => ({
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
      videoThumbnail: msg.videoThumbnail,
      attachments: msg.attachments,
      timestamp: msg.createdAt,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      threadId: msg.threadId,
      reactions: msg.reactions,
      mentions: msg.mentions,
    }));

    // Return next cursor for pagination
    const nextCursor = hasMore ? messages[limit].id : null;

    return NextResponse.json({
      messages: formattedMessages,
      hasMore,
      nextCursor,
      // Cache headers for better performance
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30', // Cache for 30 seconds
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

