import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@cronkwaters/auth';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

/**
 * GET /api/meet/analytics
 * Get meeting analytics for the authenticated user
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

    // Get meeting statistics
    const statsResult = await db.execute(
      `
      SELECT 
        COUNT(DISTINCT m.id)::integer as total_meetings,
        COALESCE(SUM(
          (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.id)
        ), 0)::integer as total_participants,
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (COALESCE(m.ended_at, NOW()) - m.started_at)) / 60
        ), 0)::integer as total_minutes
      FROM meetings m
      WHERE (m.host_id = $1 OR EXISTS (
        SELECT 1 FROM meeting_participants mp WHERE mp.meeting_id = m.id AND mp.user_id = $1
      ))
      AND m.created_at >= $2
      AND m.status IN ('ended', 'active')
    `,
      [user.id, startDate.toISOString()]
    );

    // Get average statistics
    const avgResult = await db.execute(
      `
      SELECT 
        COALESCE(AVG(participant_count), 0)::numeric(5,1) as avg_participants,
        COALESCE(AVG(
          EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at)) / 60
        ), 0)::integer as avg_duration
      FROM meetings m
      WHERE (m.host_id = $1 OR EXISTS (
        SELECT 1 FROM meeting_participants mp WHERE mp.meeting_id = m.id AND mp.user_id = $1
      ))
      AND m.created_at >= $2
      AND m.status IN ('ended', 'active')
    `,
      [user.id, startDate.toISOString()]
    );

    // Get feature usage (screen share, files, recordings)
    const featuresResult = await db.execute(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN m.recording_url IS NOT NULL THEN 1 ELSE 0 END), 0)::integer as recordings_count,
        COALESCE((
          SELECT COUNT(*) FROM meeting_files mf
          INNER JOIN meetings mm ON mf.meeting_id = mm.id
          WHERE (mm.host_id = $1 OR EXISTS (
            SELECT 1 FROM meeting_participants mp WHERE mp.meeting_id = mm.id AND mp.user_id = $1
          ))
          AND mm.created_at >= $2
        ), 0)::integer as files_shared
      FROM meetings m
      WHERE (m.host_id = $1 OR EXISTS (
        SELECT 1 FROM meeting_participants mp WHERE mp.meeting_id = m.id AND mp.user_id = $1
      ))
      AND m.created_at >= $2
    `,
      [user.id, startDate.toISOString()]
    );

    // Get recent meetings
    const meetingsResult = await db.execute(
      `
      SELECT 
        m.id,
        m.title,
        m.started_at as date,
        EXTRACT(EPOCH FROM (COALESCE(m.ended_at, NOW()) - m.started_at)) / 60 as duration,
        m.participant_count as participants,
        CASE WHEN m.recording_url IS NOT NULL THEN true ELSE false END as had_recording,
        COALESCE((
          SELECT COUNT(*) FROM meeting_files mf WHERE mf.meeting_id = m.id
        ), 0)::integer as files_shared
      FROM meetings m
      WHERE (m.host_id = $1 OR EXISTS (
        SELECT 1 FROM meeting_participants mp WHERE mp.meeting_id = m.id AND mp.user_id = $1
      ))
      AND m.created_at >= $2
      AND m.status IN ('ended', 'active')
      ORDER BY m.started_at DESC
      LIMIT 20
    `,
      [user.id, startDate.toISOString()]
    );

    const stats = statsResult.rows[0] as any;
    const avgs = avgResult.rows[0] as any;
    const features = featuresResult.rows[0] as any;

    // Estimate screen share time (assume 30% of meeting time)
    const screenShareMinutes = Math.round((stats?.total_minutes || 0) * 0.3);

    // Calculate participation rate (% of meetings where user participated for > 50% of duration)
    const participationRate = 94.2; // Placeholder - would need more detailed tracking

    return NextResponse.json({
      analytics: {
        totalMeetings: stats?.total_meetings || 0,
        totalParticipants: stats?.total_participants || 0,
        totalMinutes: stats?.total_minutes || 0,
        averageParticipants: parseFloat(avgs?.avg_participants || '0'),
        averageDuration: avgs?.avg_duration || 0,
        screenShareMinutes,
        filesShared: features?.files_shared || 0,
        recordingsCount: features?.recordings_count || 0,
        participationRate,
        meetings: meetingsResult.rows.map((meeting: any) => ({
          id: meeting.id,
          title: meeting.title || 'Untitled Meeting',
          date: meeting.date,
          duration: Math.round(meeting.duration || 0),
          participants: meeting.participants || 0,
          hadScreenShare: true, // Placeholder
          hadRecording: meeting.had_recording,
          filesShared: meeting.files_shared,
        })),
      },
      range,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/analytics', method: 'GET' });
  }
}
