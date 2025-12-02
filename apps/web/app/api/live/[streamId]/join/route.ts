/**
 * Join a Live Stream as a Viewer
 *
 * POST /api/live/[streamId]/join - Join stream and get playback info
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ streamId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { streamId } = await params;

    // Get user if authenticated
    let user;
    try {
      user = await requireAuth();
    } catch {
      // Anonymous viewing is allowed
    }

    // Generate session ID for tracking
    const sessionId = request.cookies.get('viewer_session')?.value || crypto.randomUUID();

    // Get stream details
    const streams = await db.$queryRaw<any[]>`
      SELECT 
        ls.*,
        u.name as streamer_name,
        u.image as streamer_avatar
      FROM live_streams ls
      JOIN "User" u ON ls.streamer_id = u.id
      WHERE ls.id = ${streamId}::uuid
    `;

    if (streams.length === 0) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const stream = streams[0];

    // Check if stream is actually live
    if (stream.status !== 'live') {
      return NextResponse.json(
        {
          error: 'Stream is not live',
          status: stream.status,
        },
        { status: 400 }
      );
    }

    // Check visibility
    if (stream.visibility === 'private' && stream.streamer_id !== user?.id) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Check follower-only
    if (stream.visibility === 'followers' && user) {
      const isFollowing = await db.$queryRaw<any[]>`
        SELECT 1 FROM live_stream_follows
        WHERE follower_id = ${user.id} AND streamer_id = ${stream.streamer_id}
      `;
      if (isFollowing.length === 0 && stream.streamer_id !== user.id) {
        return NextResponse.json(
          {
            error: 'This stream is for followers only',
            followRequired: true,
          },
          { status: 403 }
        );
      }
    }

    // Check if viewer already has an active session
    const existingSession = await db.$queryRaw<any[]>`
      SELECT id FROM live_stream_viewers
      WHERE stream_id = ${streamId}::uuid 
        AND session_id = ${sessionId}
        AND left_at IS NULL
    `;

    if (existingSession.length === 0) {
      // Create new viewer session
      await db.$executeRaw`
        INSERT INTO live_stream_viewers (stream_id, viewer_id, session_id)
        VALUES (${streamId}::uuid, ${user?.id || null}, ${sessionId})
      `;

      // Update viewer count
      await db.$executeRaw`
        UPDATE live_streams 
        SET 
          viewer_count = viewer_count + 1,
          total_views = total_views + 1,
          peak_viewer_count = GREATEST(peak_viewer_count, viewer_count + 1),
          updated_at = NOW()
        WHERE id = ${streamId}::uuid
      `;
    }

    // Check if user is following streamer
    let isFollowing = false;
    if (user) {
      const followResult = await db.$queryRaw<any[]>`
        SELECT 1 FROM live_stream_follows
        WHERE follower_id = ${user.id} AND streamer_id = ${stream.streamer_id}
      `;
      isFollowing = followResult.length > 0;
    }

    const response = NextResponse.json({
      stream: {
        id: stream.id,
        title: stream.title,
        description: stream.description,
        category: stream.category,
        playbackUrl: stream.playback_url,
        playbackId: stream.playback_id,
        viewerCount: stream.viewer_count + 1,
        chatEnabled: stream.chat_enabled,
        reactionsEnabled: stream.reactions_enabled,
        slowModeSeconds: stream.slow_mode_seconds,
        followerOnlyChat: stream.follower_only_chat,
        startedAt: stream.actual_start_at,
        streamer: {
          id: stream.streamer_id,
          name: stream.streamer_name,
          avatar: stream.streamer_avatar,
        },
      },
      viewer: {
        sessionId,
        isAuthenticated: !!user,
        isFollowing,
        userId: user?.id,
      },
    });

    // Set session cookie if new
    if (!request.cookies.get('viewer_session')) {
      response.cookies.set('viewer_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    return response;
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]/join', method: 'POST' });
  }
}
