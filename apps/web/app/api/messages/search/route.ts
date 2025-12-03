/**
 * Message Search API
 *
 * GET - Search through messages
 *
 * Query params:
 * - q: Search query (required)
 * - conversationId: Limit to specific conversation (optional)
 * - limit: Number of results (default 20, max 50)
 * - before: Cursor for pagination (message ID)
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
    const query = searchParams.get('q');
    const conversationId = searchParams.get('conversationId');
    const before = searchParams.get('before');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      channelType: 'dm',
      channelId: {
        contains: userId,
      },
      isDeleted: false,
      content: {
        contains: query,
        mode: 'insensitive',
      },
    };

    // Limit to specific conversation if provided
    if (conversationId) {
      if (!conversationId.includes(userId)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      where.channelId = conversationId;
    }

    // Pagination
    if (before) {
      where.id = { lt: before };
    }

    // Search messages
    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Get one extra for pagination check
      select: {
        id: true,
        channelId: true,
        content: true,
        senderId: true,
        senderName: true,
        senderAvatar: true,
        createdAt: true,
        messageType: true,
      },
    });

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;

    // Get unique conversation IDs to fetch participant info
    const conversationIds = [...new Set(results.map((m) => m.channelId))];

    // Get participant info for each conversation
    const participantMap = new Map<string, any>();
    await Promise.all(
      conversationIds.map(async (convId) => {
        const parts = convId.split(':');
        const otherUserId = parts[1] === userId ? parts[2] : parts[1];

        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });

        participantMap.set(convId, otherUser);
      })
    );

    // Format results
    const formattedResults = results.map((msg) => ({
      id: msg.id,
      conversationId: msg.channelId,
      content: msg.content,
      sender: {
        id: msg.senderId,
        name: msg.senderName,
        avatar: msg.senderAvatar,
      },
      participant: participantMap.get(msg.channelId),
      createdAt: msg.createdAt.toISOString(),
      type: msg.messageType,
      // Highlight matching text
      highlight: highlightMatch(msg.content || '', query),
    }));

    return NextResponse.json({
      results: formattedResults,
      query,
      total: formattedResults.length,
      hasMore,
      nextCursor: hasMore ? results[results.length - 1].id : null,
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    return NextResponse.json({ error: 'Failed to search messages' }, { status: 500 });
  }
}

/**
 * Highlight matching text in content
 */
function highlightMatch(content: string, query: string): string {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return content.replace(regex, '**$1**');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
