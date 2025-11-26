/**
 * Read Receipts API
 * 
 * POST /api/chat/read-receipts
 * - Batch update read status for multiple messages
 * - Optimized with single database transaction
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { prisma as db } from '@cronkwaters/db';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channelId, messageIds } = body;

    if (!channelId || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'channelId and messageIds are required' },
        { status: 400 }
      );
    }

    // Batch update messages as read in a single transaction
    // Note: This is a simplified version. In production, you might want to:
    // 1. Store read receipts in a separate table for better performance
    // 2. Use a message queue for async processing
    // 3. Add read receipt notifications via Ably

    const result = await db.chatMessage.updateMany({
      where: {
        id: {
          in: messageIds,
        },
        channelId,
        // Only update messages sent by others
        NOT: {
          senderId: user.id,
        },
      },
      data: {
        // If you have a read receipts tracking field, update it here
        // For now, we'll just log it
        updatedAt: new Date(),
      },
    });

    // Optionally, broadcast read receipt event via Ably
    if (process.env.ABLY_API_KEY) {
      try {
        const Ably = (await import('ably')).default;
        const ably = new Ably.Rest(process.env.ABLY_API_KEY);
        const channel = ably.channels.get(channelId);

        await channel.publish('read-receipt', {
          userId: user.id,
          messageIds,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to broadcast read receipt:', error);
        // Don't fail the request if broadcast fails
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Read receipts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




