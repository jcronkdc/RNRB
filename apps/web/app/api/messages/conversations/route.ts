/**
 * Conversations API
 *
 * GET - List all conversations with filters
 *
 * Query params:
 * - filter: 'all' | 'unread' | 'archived' | 'trash'
 * - search: Search query for messages/participants
 * - limit: Number of results (default 20)
 */

import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user's conversation settings
    let conversationSettings: any[] = [];
    try {
      conversationSettings = await prisma.conversationSettings.findMany({
        where: { userId },
      });
    } catch (error) {
      // Model might not exist yet - this is okay, continue with empty settings
      console.log('[Conversations API] ConversationSettings table not available:', error);
    }

    const settingsMap = new Map(conversationSettings.map((s) => [s.conversationId, s]));

    // Get all DM channels the user is part of
    let messages: any[] = [];
    try {
      messages = await prisma.chatMessage.findMany({
        where: {
          channelType: 'direct',
          channelId: {
            contains: userId,
          },
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        distinct: ['channelId'],
        take: 100,
      });
    } catch (error) {
      // ChatMessage table might not exist yet - return empty conversations
      console.log('[Conversations API] ChatMessage table not available:', error);
      return NextResponse.json({
        conversations: [],
        total: 0,
      });
    }

    // Get unique channel IDs
    const channelIds = [...new Set(messages.map((m) => m.channelId))];

    // Build conversations list
    const conversations = await Promise.all(
      channelIds.map(async (channelId) => {
        // Get conversation settings
        const settings = settingsMap.get(channelId) || {
          isArchived: false,
          isDeleted: false,
          isMuted: false,
          isPinned: false,
        };

        // Apply filter
        if (filter === 'archived' && !settings.isArchived) return null;
        if (filter === 'trash' && !settings.isDeleted) return null;
        if (filter === 'all' && (settings.isArchived || settings.isDeleted)) return null;

        // Extract other user ID from channel
        const parts = channelId.split(':');
        const otherUserId = parts[1] === userId ? parts[2] : parts[1];

        // Get other user info
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        });

        if (!otherUser) return null;

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          const nameMatch = otherUser.name?.toLowerCase().includes(searchLower);
          const emailMatch = otherUser.email?.toLowerCase().includes(searchLower);
          if (!nameMatch && !emailMatch) return null;
        }

        // Get latest message
        const latestMessage = await prisma.chatMessage.findFirst({
          where: {
            channelId,
            isDeleted: false,
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            messageType: true,
          },
        });

        // Get unread count
        const unreadCount = await prisma.chatMessage.count({
          where: {
            channelId,
            senderId: { not: userId },
            isDeleted: false,
            // Would need readAt field on messages or a separate read receipts table
          },
        });

        // Check if blocked
        let isBlocked = false;
        try {
          const block = await prisma.userBlock.findFirst({
            where: {
              OR: [
                { blockerId: userId, blockedId: otherUserId },
                { blockerId: otherUserId, blockedId: userId },
              ],
            },
          });
          isBlocked = !!block;
        } catch (error) {
          // Model might not exist - this is okay, assume not blocked
          console.log('[Conversations API] UserBlock table not available:', error);
        }

        return {
          id: channelId,
          type: 'dm',
          participant: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image,
            email: otherUser.email,
          },
          lastMessage: latestMessage
            ? {
                id: latestMessage.id,
                content: latestMessage.content,
                senderId: latestMessage.senderId,
                createdAt: latestMessage.createdAt.toISOString(),
                type: latestMessage.messageType,
              }
            : null,
          unreadCount,
          isArchived: settings.isArchived || false,
          isDeleted: settings.isDeleted || false,
          isMuted: settings.isMuted || false,
          isPinned: settings.isPinned || false,
          isBlocked,
          updatedAt: latestMessage?.createdAt.toISOString() || new Date().toISOString(),
        };
      })
    );

    // Filter out nulls and sort
    const validConversations = conversations
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by date
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, limit);

    // Apply unread filter
    const filteredConversations =
      filter === 'unread'
        ? validConversations.filter((c) => c.unreadCount > 0)
        : validConversations;

    return NextResponse.json({
      conversations: filteredConversations,
      total: filteredConversations.length,
    });
  } catch (error) {
    console.error('[Conversations API] Error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: 'unknown',
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch conversations',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 }
    );
  }
}
