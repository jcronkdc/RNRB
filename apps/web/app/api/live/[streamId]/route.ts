/**
 * Single Live Stream API Routes
 *
 * GET /api/live/[streamId] - Get stream details
 * PATCH /api/live/[streamId] - Update stream (title, description, etc)
 * DELETE /api/live/[streamId] - End and delete stream
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { notifyArtistWentLive } from '@/lib/live-notifications';
import { endLiveStream, getLiveStream, deleteLiveStream, getStreamAsset } from '@/lib/mux';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ streamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { streamId } = await params;

    // Get stream from database
    const streams = await db.$queryRaw<any[]>`
      SELECT 
        ls.*,
        u.name as streamer_name,
        u.image as streamer_avatar,
        (SELECT COUNT(*) FROM live_stream_viewers WHERE stream_id = ls.id AND left_at IS NULL) as current_viewers
      FROM live_streams ls
      JOIN "User" u ON ls.streamer_id = u.id
      WHERE ls.id = ${streamId}::uuid
    `;

    if (streams.length === 0) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const stream = streams[0];

    // Check visibility
    let user;
    try {
      user = await requireAuth();
    } catch {
      // Anonymous user
    }

    if (stream.visibility === 'private' && stream.streamer_id !== user?.id) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    return NextResponse.json({
      stream: {
        id: stream.id,
        title: stream.title,
        description: stream.description,
        category: stream.category,
        tags: stream.tags,
        status: stream.status,
        visibility: stream.visibility,
        thumbnailUrl: stream.thumbnail_url,
        playbackUrl: stream.playback_url,
        playbackId: stream.playback_id,
        viewerCount: stream.current_viewers || stream.viewer_count || 0,
        peakViewerCount: stream.peak_viewer_count || 0,
        totalViews: stream.total_views || 0,
        totalReactions: stream.total_reactions || 0,
        totalChatMessages: stream.total_chat_messages || 0,
        startedAt: stream.actual_start_at,
        scheduledAt: stream.scheduled_start_at,
        endedAt: stream.ended_at,
        durationSeconds: stream.duration_seconds,
        recordingUrl: stream.recording_url,
        chatEnabled: stream.chat_enabled,
        reactionsEnabled: stream.reactions_enabled,
        slowModeSeconds: stream.slow_mode_seconds,
        followerOnlyChat: stream.follower_only_chat,
        streamer: {
          id: stream.streamer_id,
          name: stream.streamer_name,
          avatar: stream.streamer_avatar,
        },
        // Only include stream key for the streamer
        streamKey: stream.streamer_id === user?.id ? stream.stream_key : undefined,
        rtmpUrl: stream.streamer_id === user?.id ? stream.rtmp_url : undefined,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]', method: 'GET' });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { streamId } = await params;
    const body = await request.json();

    // Verify ownership
    const streams = await db.$queryRaw<any[]>`
      SELECT * FROM live_streams WHERE id = ${streamId}::uuid AND streamer_id = ${user.id}
    `;

    if (streams.length === 0) {
      return NextResponse.json({ error: 'Stream not found or unauthorized' }, { status: 404 });
    }

    const stream = streams[0];
    const {
      title,
      description,
      category,
      tags,
      visibility,
      chatEnabled,
      reactionsEnabled,
      slowModeSeconds,
      status,
    } = body;

    // Handle status changes
    if (status) {
      if (status === 'live' && stream.status !== 'live') {
        // Going live
        await db.$executeRaw`
          UPDATE live_streams 
          SET status = 'live', actual_start_at = NOW(), updated_at = NOW()
          WHERE id = ${streamId}::uuid
        `;

        // Get streamer info for notifications
        const streamerInfo = await db.$queryRaw<any[]>`
          SELECT name, image FROM "User" WHERE id = ${user.id}
        `;

        // Notify subscribers (fire and forget)
        notifyArtistWentLive({
          streamId,
          streamerId: user.id,
          streamerName: streamerInfo[0]?.name || 'Artist',
          streamerAvatar: streamerInfo[0]?.image,
          streamTitle: stream.title,
          streamCategory: stream.category || 'Music',
          thumbnailUrl: stream.thumbnail_url,
        }).catch((err) => console.error('Failed to send live notifications:', err));
      } else if (status === 'ending' && stream.status === 'live') {
        // Ending stream
        await db.$executeRaw`
          UPDATE live_streams 
          SET status = 'ending', updated_at = NOW()
          WHERE id = ${streamId}::uuid
        `;

        // Signal Mux to end the stream
        if (stream.mux_stream_id) {
          try {
            await endLiveStream(stream.mux_stream_id);
          } catch (muxError) {
            console.error('Failed to end Mux stream:', muxError);
          }
        }
      } else if (status === 'ended') {
        // Calculate duration and finalize
        const durationSeconds = stream.actual_start_at
          ? Math.floor((Date.now() - new Date(stream.actual_start_at).getTime()) / 1000)
          : 0;

        // Get recording URL if available
        let recordingUrl = null;
        if (stream.mux_stream_id) {
          try {
            const muxStream = await getLiveStream(stream.mux_stream_id);
            if (muxStream?.activeAssetId) {
              const asset = await getStreamAsset(muxStream.activeAssetId);
              recordingUrl = asset?.playbackUrl || null;
            }
          } catch (muxError) {
            console.error('Failed to get recording:', muxError);
          }
        }

        await db.$executeRaw`
          UPDATE live_streams 
          SET 
            status = 'ended', 
            ended_at = NOW(),
            duration_seconds = ${durationSeconds},
            recording_url = ${recordingUrl},
            updated_at = NOW()
          WHERE id = ${streamId}::uuid
        `;

        // Update all active viewers to mark them as left
        await db.$executeRaw`
          UPDATE live_stream_viewers 
          SET left_at = NOW(), watch_duration_seconds = EXTRACT(EPOCH FROM (NOW() - joined_at))::integer
          WHERE stream_id = ${streamId}::uuid AND left_at IS NULL
        `;
      }
    }

    // Update other fields
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = $1');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${values.length + 1}`);
      values.push(description);
    }
    if (category !== undefined) {
      updates.push(`category = $${values.length + 1}`);
      values.push(category);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${values.length + 1}::text[]`);
      values.push(tags);
    }
    if (visibility !== undefined) {
      updates.push(`visibility = $${values.length + 1}`);
      values.push(visibility);
    }
    if (chatEnabled !== undefined) {
      updates.push(`chat_enabled = $${values.length + 1}`);
      values.push(chatEnabled);
    }
    if (reactionsEnabled !== undefined) {
      updates.push(`reactions_enabled = $${values.length + 1}`);
      values.push(reactionsEnabled);
    }
    if (slowModeSeconds !== undefined) {
      updates.push(`slow_mode_seconds = $${values.length + 1}`);
      values.push(slowModeSeconds);
    }

    if (updates.length > 0) {
      // Use raw query for flexibility
      await db.$executeRaw`
        UPDATE live_streams 
        SET 
          title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          category = COALESCE(${category}, category),
          visibility = COALESCE(${visibility}, visibility),
          chat_enabled = COALESCE(${chatEnabled}, chat_enabled),
          reactions_enabled = COALESCE(${reactionsEnabled}, reactions_enabled),
          slow_mode_seconds = COALESCE(${slowModeSeconds}, slow_mode_seconds),
          updated_at = NOW()
        WHERE id = ${streamId}::uuid
      `;
    }

    // Get updated stream
    const updatedStreams = await db.$queryRaw<any[]>`
      SELECT * FROM live_streams WHERE id = ${streamId}::uuid
    `;

    return NextResponse.json({ stream: updatedStreams[0] });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]', method: 'PATCH' });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { streamId } = await params;

    // Verify ownership
    const streams = await db.$queryRaw<any[]>`
      SELECT * FROM live_streams WHERE id = ${streamId}::uuid AND streamer_id = ${user.id}
    `;

    if (streams.length === 0) {
      return NextResponse.json({ error: 'Stream not found or unauthorized' }, { status: 404 });
    }

    const stream = streams[0];

    // End stream on Mux if it's live
    if (stream.mux_stream_id && (stream.status === 'live' || stream.status === 'starting')) {
      try {
        await endLiveStream(stream.mux_stream_id);
      } catch (muxError) {
        console.error('Failed to end Mux stream:', muxError);
      }
    }

    // Delete from Mux
    if (stream.mux_stream_id) {
      try {
        await deleteLiveStream(stream.mux_stream_id);
      } catch (muxError) {
        console.error('Failed to delete Mux stream:', muxError);
      }
    }

    // Delete from database (cascades to viewers, reactions, chat)
    await db.$executeRaw`
      DELETE FROM live_streams WHERE id = ${streamId}::uuid
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/[streamId]', method: 'DELETE' });
  }
}
