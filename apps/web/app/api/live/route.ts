/**
 * Live Streaming API Routes
 *
 * POST /api/live - Create a new live stream
 * GET /api/live - Get all active/scheduled live streams
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { createLiveStream } from '@/lib/mux';
import { requireAuth } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Live streaming requires Studio tier
    try {
      await requireFeatureAccess('videoCalls');
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || 'Upgrade to Studio plan to go live',
          requiresUpgrade: true,
          currentTier: error.tier || 'free',
          requiredTier: 'studio',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category = 'music',
      tags = [],
      visibility = 'public',
      scheduledStartAt,
      chatEnabled = true,
      reactionsEnabled = true,
    } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create Mux live stream
    let muxStream;
    try {
      muxStream = await createLiveStream({
        title,
        streamerId: user.id,
        lowLatency: true,
        recordingEnabled: true,
      });
    } catch (muxError: any) {
      console.error('Mux error:', muxError);
      // Fall back to Daily.co if Mux isn't configured
      if (muxError.message?.includes('not configured')) {
        return NextResponse.json(
          { error: 'Live streaming is not configured. Please contact support.' },
          { status: 503 }
        );
      }
      throw muxError;
    }

    if (!muxStream) {
      return NextResponse.json(
        { error: 'Failed to create live stream. Please try again.' },
        { status: 500 }
      );
    }

    // Save to database
    const liveStream = await db.$queryRaw<any[]>`
      INSERT INTO live_streams (
        streamer_id,
        title,
        description,
        category,
        tags,
        visibility,
        scheduled_start_at,
        stream_provider,
        stream_key,
        rtmp_url,
        playback_id,
        playback_url,
        mux_stream_id,
        chat_enabled,
        reactions_enabled,
        status
      ) VALUES (
        ${user.id},
        ${title},
        ${description || null},
        ${category},
        ${tags}::text[],
        ${visibility},
        ${scheduledStartAt ? new Date(scheduledStartAt) : null},
        'mux',
        ${muxStream.streamKey},
        ${muxStream.rtmpUrl},
        ${muxStream.playbackId},
        ${muxStream.playbackUrl},
        ${muxStream.id},
        ${chatEnabled},
        ${reactionsEnabled},
        ${scheduledStartAt ? 'scheduled' : 'starting'}
      )
      RETURNING *
    `;

    // If we have followers, notify them
    if (visibility === 'public' && !scheduledStartAt) {
      // Queue notifications (would use a job queue in production)
      notifyFollowers(user.id, liveStream[0].id, title).catch(console.error);
    }

    return NextResponse.json({
      stream: {
        id: liveStream[0].id,
        title: liveStream[0].title,
        description: liveStream[0].description,
        status: liveStream[0].status,
        visibility: liveStream[0].visibility,
        streamKey: muxStream.streamKey,
        rtmpUrl: muxStream.rtmpUrl,
        playbackUrl: muxStream.playbackUrl,
        playbackId: muxStream.playbackId,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live', method: 'POST' });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'live';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get live streams based on status
    let streams;

    if (status === 'live') {
      streams = await db.$queryRaw<any[]>`
        SELECT 
          ls.*,
          u.name as streamer_name,
          u.image as streamer_avatar,
          (SELECT COUNT(*) FROM live_stream_viewers WHERE stream_id = ls.id AND left_at IS NULL) as current_viewers
        FROM live_streams ls
        JOIN "User" u ON ls.streamer_id = u.id
        WHERE ls.status = 'live' AND ls.visibility = 'public'
        ORDER BY ls.viewer_count DESC, ls.actual_start_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status === 'scheduled') {
      streams = await db.$queryRaw<any[]>`
        SELECT 
          ls.*,
          u.name as streamer_name,
          u.image as streamer_avatar
        FROM live_streams ls
        JOIN "User" u ON ls.streamer_id = u.id
        WHERE ls.status = 'scheduled' AND ls.visibility = 'public'
        AND ls.scheduled_start_at > NOW()
        ORDER BY ls.scheduled_start_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status === 'ended') {
      streams = await db.$queryRaw<any[]>`
        SELECT 
          ls.*,
          u.name as streamer_name,
          u.image as streamer_avatar
        FROM live_streams ls
        JOIN "User" u ON ls.streamer_id = u.id
        WHERE ls.status = 'ended' AND ls.visibility = 'public'
        AND ls.recording_url IS NOT NULL
        ORDER BY ls.ended_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    return NextResponse.json({
      streams: streams.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        tags: s.tags,
        status: s.status,
        visibility: s.visibility,
        thumbnailUrl: s.thumbnail_url,
        playbackUrl: s.playback_url,
        viewerCount: s.current_viewers || s.viewer_count || 0,
        peakViewerCount: s.peak_viewer_count || 0,
        startedAt: s.actual_start_at,
        scheduledAt: s.scheduled_start_at,
        endedAt: s.ended_at,
        durationSeconds: s.duration_seconds,
        recordingUrl: s.recording_url,
        streamer: {
          id: s.streamer_id,
          name: s.streamer_name,
          avatar: s.streamer_avatar,
        },
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live', method: 'GET' });
  }
}

// Helper function to notify followers when someone goes live
async function notifyFollowers(streamerId: string, streamId: string, title: string) {
  try {
    const followers = await db.$queryRaw<any[]>`
      SELECT follower_id FROM live_stream_follows
      WHERE streamer_id = ${streamerId} AND notify_on_live = true
    `;

    if (followers.length === 0) return;

    // Get streamer info
    const streamer = await db.$queryRaw<any[]>`
      SELECT name, image FROM "User" WHERE id = ${streamerId}
    `;
    const streamerName = streamer[0]?.name || 'Someone you follow';

    // Create notifications for all followers
    const notificationValues = followers.map((f) => ({
      user_id: f.follower_id,
      stream_id: streamId,
      notification_type: 'going_live',
      title: `🔴 ${streamerName} is now live!`,
      body: title,
    }));

    // Batch insert notifications
    for (const notification of notificationValues) {
      await db.$executeRaw`
        INSERT INTO live_stream_notifications (user_id, stream_id, notification_type, title, body)
        VALUES (${notification.user_id}, ${notification.stream_id}::uuid, ${notification.notification_type}, ${notification.title}, ${notification.body})
      `;
    }
  } catch (error) {
    console.error('Failed to notify followers:', error);
  }
}
