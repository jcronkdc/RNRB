/**
 * Send Reaction to Live Stream
 *
 * POST /api/live/[streamId]/react - Send a floating reaction (heart, fire, etc)
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ streamId: string }>;
}

const VALID_REACTIONS = ['heart', 'fire', 'clap', 'wow', 'love', 'laugh', 'rock', 'star'];

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { streamId } = await params;
    const body = await request.json();

    const { reactionType = 'heart', positionX = Math.floor(Math.random() * 80) + 10 } = body;

    if (!VALID_REACTIONS.includes(reactionType)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Verify stream exists and is live
    const streams = await db.$queryRaw<any[]>`
      SELECT id, reactions_enabled FROM live_streams
      WHERE id = ${streamId}::uuid AND status = 'live'
    `;

    if (streams.length === 0) {
      return NextResponse.json({ error: 'Stream not found or not live' }, { status: 404 });
    }

    if (!streams[0].reactions_enabled) {
      return NextResponse.json(
        { error: 'Reactions are disabled for this stream' },
        { status: 403 }
      );
    }

    // Rate limit: max 10 reactions per 5 seconds per user
    const recentReactions = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM live_stream_reactions
      WHERE stream_id = ${streamId}::uuid 
        AND viewer_id = ${user.id}
        AND created_at > NOW() - INTERVAL '5 seconds'
    `;

    if (parseInt(recentReactions[0].count) >= 10) {
      return NextResponse.json({ error: 'Too many reactions' }, { status: 429 });
    }

    // Create reaction
    const reactions = await db.$queryRaw<any[]>`
      INSERT INTO live_stream_reactions (stream_id, viewer_id, reaction_type, position_x)
      VALUES (${streamId}::uuid, ${user.id}, ${reactionType}, ${positionX})
      RETURNING id, reaction_type, position_x, created_at
    `;

    // Update reaction count on stream
    await db.$executeRaw`
      UPDATE live_streams 
      SET total_reactions = total_reactions + 1, updated_at = NOW()
      WHERE id = ${streamId}::uuid
    `;

    // Update viewer's reaction count
    const sessionId = request.cookies.get('viewer_session')?.value;
    if (sessionId) {
      await db.$executeRaw`
        UPDATE live_stream_viewers 
        SET reactions_sent = reactions_sent + 1
        WHERE stream_id = ${streamId}::uuid AND session_id = ${sessionId}
      `;
    }

    return NextResponse.json({
      reaction: {
        id: reactions[0].id,
        type: reactions[0].reaction_type,
        positionX: reactions[0].position_x,
        createdAt: reactions[0].created_at,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]/react', method: 'POST' });
  }
}

// GET recent reactions (for syncing)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { streamId } = await params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    // Get reactions from last 5 seconds (or since timestamp)
    const reactions = await db.$queryRaw<any[]>`
      SELECT id, reaction_type, position_x, created_at
      FROM live_stream_reactions
      WHERE stream_id = ${streamId}::uuid
        AND created_at > ${since ? new Date(since) : new Date(Date.now() - 5000)}
      ORDER BY created_at ASC
      LIMIT 100
    `;

    return NextResponse.json({
      reactions: reactions.map((r) => ({
        id: r.id,
        type: r.reaction_type,
        positionX: r.position_x,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]/react', method: 'GET' });
  }
}
