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

    // Extract other user IDs from channel names
    const channelUserMap = new Map<string, string>();
    for (const channelId of channelIds) {
      const parts = channelId.split(':');
      const otherUserId = parts[1] === userId ? parts[2] : parts[1];
      if (otherUserId) channelUserMap.set(channelId, otherUserId);
    }

    const otherUserIds = [...new Set(channelUserMap.values())];

    // Batch-fetch all other users at once (replaces N queries)
    const otherUsers = await prisma.user.findMany({
      where: { id: { in: otherUserIds } },
      select: { id: true, name: true, image: true },
    });
    const userMap = new Map(otherUsers.map((u) => [u.id, u]));

    // Batch-fetch latest message per channel and unread counts
    // These still need per-channel queries but we parallelize them
    const [latestMessages, unreadCounts, blocks] = await Promise.all([
      // Latest messages - one query with grouping
      Promise.all(
        channelIds.map((channelId) =>
          prisma.chatMessage
            .findFirst({
              where: { channelId, isDeleted: false },
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true,
                messageType: true,
                channelId: true,
              },
            })
            .then((msg) => ({ channelId, message: msg }))
        )
      ),
      // Unread counts
      Promise.all(
        channelIds.map((channelId) =>
          prisma.chatMessage
            .count({
              where: { channelId, senderId: { not: userId }, isDeleted: false },
            })
            .then((count) => ({ channelId, count }))
        )
      ),
      // Blocked users
      prisma.userBlock.findMany({
        where: { blockerId: userId, blockedId: { in: otherUserIds } },
        select: { blockedId: true },
      }),
    ]);

    const latestMessageMap = new Map(latestMessages.map((m) => [m.channelId, m.message]));
    const unreadCountMap = new Map(unreadCounts.map((u) => [u.channelId, u.count]));
    const blockedSet = new Set(blocks.map((b) => b.blockedId));

    // Build conversations list
    const conversations = channelIds.map((channelId) => {
      const settings = settingsMap.get(channelId) || {
        isArchived: false,
        isDeleted: false,
        isMuted: false,
        isPinned: false,
      };

      if (filter === 'archived' && !settings.isArchived) return null;
      if (filter === 'trash' && !settings.isDeleted) return null;
      if (filter === 'all' && (settings.isArchived || settings.isDeleted)) return null;

      const otherUserId = channelUserMap.get(channelId);
      const otherUser = otherUserId ? userMap.get(otherUserId) : null;
      if (!otherUser) return null;

      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = otherUser.name?.toLowerCase().includes(searchLower);
        if (!nameMatch) return null;
      }

      const latestMessage = latestMessageMap.get(channelId) || null;
      const unreadCount = unreadCountMap.get(channelId) || 0;

      return {
        id: channelId,
        type: 'dm',
        participant: {
          id: otherUser.id,
          name: otherUser.name,
          image: otherUser.image,
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
        isBlocked: otherUserId ? blockedSet.has(otherUserId) : false,
        updatedAt: latestMessage?.createdAt.toISOString() || new Date().toISOString(),
      };
    });

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
