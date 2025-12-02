/**
 * Leave a Live Stream
 *
 * POST /api/live/[streamId]/leave - Leave stream and record watch time
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ streamId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { streamId } = await params;
    const sessionId = request.cookies.get('viewer_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'No active session' }, { status: 400 });
    }

    // Update viewer session with leave time
    const result = await db.$executeRaw`
      UPDATE live_stream_viewers 
      SET 
        left_at = NOW(),
        watch_duration_seconds = EXTRACT(EPOCH FROM (NOW() - joined_at))::integer
      WHERE stream_id = ${streamId}::uuid 
        AND session_id = ${sessionId}
        AND left_at IS NULL
    `;

    // Decrement viewer count if we actually updated a record
    if (result > 0) {
      await db.$executeRaw`
        UPDATE live_streams 
        SET 
          viewer_count = GREATEST(0, viewer_count - 1),
          updated_at = NOW()
        WHERE id = ${streamId}::uuid
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]/leave', method: 'POST' });
  }
}
