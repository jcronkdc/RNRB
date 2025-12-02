import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@cronkwaters/auth';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

/**
 * GET /api/live/analytics
 * Get streaming analytics for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    let daysBack = 30;
    switch (range) {
      case '7d':
        daysBack = 7;
        break;
      case '30d':
        daysBack = 30;
        break;
      case '90d':
        daysBack = 90;
        break;
      case 'all':
        daysBack = 365 * 10; // 10 years
        break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get stream statistics
    const statsResult = await db.execute(
      `
      SELECT 
        COUNT(*)::integer as total_streams,
        COALESCE(SUM(viewer_count), 0)::integer as total_viewers,
        COALESCE(SUM(EXTRACT(EPOCH FROM (ended_at - started_at)) / 3600), 0)::numeric(10,2) as total_watch_hours,
        COALESCE(AVG(viewer_count), 0)::integer as average_viewers,
        COALESCE(MAX(peak_viewers), 0)::integer as peak_viewers
      FROM live_streams
      WHERE streamer_id = $1 
        AND created_at >= $2
        AND status = 'ended'
    `,
      [user.id, startDate.toISOString()]
    );

    // Get engagement statistics
    const engagementResult = await db.execute(
      `
      SELECT 
        COALESCE(SUM(r.reaction_count), 0)::integer as total_reactions,
        COALESCE(SUM(m.message_count), 0)::integer as total_messages
      FROM live_streams ls
      LEFT JOIN (
        SELECT stream_id, COUNT(*) as reaction_count
        FROM live_stream_reactions
        GROUP BY stream_id
      ) r ON ls.id = r.stream_id
      LEFT JOIN (
        SELECT stream_id, COUNT(*) as message_count
        FROM live_stream_chat
        GROUP BY stream_id
      ) m ON ls.id = m.stream_id
      WHERE ls.streamer_id = $1 AND ls.created_at >= $2
    `,
      [user.id, startDate.toISOString()]
    );

    // Get follower growth
    const followerResult = await db.execute(
      `
      SELECT COUNT(*)::integer as new_followers
      FROM live_stream_follows
      WHERE streamer_id = $1 AND created_at >= $2
    `,
      [user.id, startDate.toISOString()]
    );

    // Get recent streams
    const streamsResult = await db.execute(
      `
      SELECT 
        ls.id,
        ls.title,
        ls.started_at as date,
        EXTRACT(EPOCH FROM (COALESCE(ls.ended_at, NOW()) - ls.started_at))::integer as duration,
        ls.peak_viewers,
        ls.viewer_count as avg_viewers,
        COALESCE(r.reaction_count, 0)::integer as total_reactions,
        COALESCE(m.message_count, 0)::integer as total_messages,
        ls.thumbnail_url as thumbnail
      FROM live_streams ls
      LEFT JOIN (
        SELECT stream_id, COUNT(*) as reaction_count
        FROM live_stream_reactions
        GROUP BY stream_id
      ) r ON ls.id = r.stream_id
      LEFT JOIN (
        SELECT stream_id, COUNT(*) as message_count
        FROM live_stream_chat
        GROUP BY stream_id
      ) m ON ls.id = m.stream_id
      WHERE ls.streamer_id = $1 AND ls.created_at >= $2
      ORDER BY ls.started_at DESC
      LIMIT 20
    `,
      [user.id, startDate.toISOString()]
    );

    const stats = statsResult.rows[0] as any;
    const engagement = engagementResult.rows[0] as any;
    const followers = followerResult.rows[0] as any;

    // Calculate engagement rate
    const totalInteractions =
      (engagement?.total_reactions || 0) + (engagement?.total_messages || 0);
    const engagementRate =
      stats?.total_viewers > 0 ? ((totalInteractions / stats.total_viewers) * 100).toFixed(1) : 0;

    // Calculate average watch duration
    const avgWatchDuration =
      stats?.total_streams > 0
        ? Math.round((stats.total_watch_hours * 3600) / stats.total_streams)
        : 0;

    return NextResponse.json({
      analytics: {
        totalStreams: stats?.total_streams || 0,
        totalViewers: stats?.total_viewers || 0,
        totalWatchHours: Math.round(parseFloat(stats?.total_watch_hours || '0')),
        averageViewers: stats?.average_viewers || 0,
        peakViewers: stats?.peak_viewers || 0,
        totalReactions: engagement?.total_reactions || 0,
        totalMessages: engagement?.total_messages || 0,
        avgWatchDuration,
        followerGrowth: followers?.new_followers || 0,
        engagementRate: parseFloat(engagementRate.toString()),
        streams: streamsResult.rows.map((stream: any) => ({
          id: stream.id,
          title: stream.title,
          date: stream.date,
          duration: stream.duration,
          peakViewers: stream.peak_viewers || 0,
          avgViewers: stream.avg_viewers || 0,
          totalReactions: stream.total_reactions,
          totalMessages: stream.total_messages,
          thumbnail: stream.thumbnail,
        })),
      },
      range,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/live/analytics', method: 'GET' });
  }
}
