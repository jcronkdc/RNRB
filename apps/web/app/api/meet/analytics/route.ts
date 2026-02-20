import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

/**
 * GET /api/meet/analytics
 * Get real meeting analytics from the meetings table (raw SQL)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    let daysBack = 30;
    switch (range) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case 'all': daysBack = 365 * 10; break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Fetch meetings where user was organizer or participant
    let meetings: any[] = [];
    try {
      meetings = await db.$queryRaw`
        SELECT 
          m.id,
          m.title,
          m.type,
          m.status,
          m.actual_start_at,
          m.actual_end_at,
          m.created_at,
          (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.id) as participant_count
        FROM meetings m
        WHERE m.created_at >= ${startDate}
          AND (
            m.organizer_id = ${userId}
            OR m.id IN (SELECT mp.meeting_id FROM meeting_participants mp WHERE mp.user_id = ${userId})
          )
        ORDER BY m.created_at DESC
        LIMIT 50
      `;
    } catch {
      // meetings table might not exist — return zeros
    }

    const totalMeetings = meetings.length;
    const totalParticipants = meetings.reduce(
      (sum: number, m: any) => sum + (Number(m.participant_count) || 0), 0
    );

    const totalMinutes = meetings.reduce((sum: number, m: any) => {
      if (m.actual_start_at && m.actual_end_at) {
        const mins = (new Date(m.actual_end_at).getTime() - new Date(m.actual_start_at).getTime()) / (1000 * 60);
        return sum + Math.max(0, mins);
      }
      return sum;
    }, 0);

    const avgParticipants = totalMeetings > 0 ? totalParticipants / totalMeetings : 0;
    const avgDuration = totalMeetings > 0 ? Math.round(totalMinutes / totalMeetings) : 0;

    return NextResponse.json({
      analytics: {
        totalMeetings,
        totalParticipants,
        totalMinutes: Math.round(totalMinutes),
        averageParticipants: parseFloat(avgParticipants.toFixed(1)),
        averageDuration: avgDuration,
        meetings: meetings.map((m: any) => ({
          id: m.id,
          title: m.title || 'Untitled Meeting',
          date: m.actual_start_at || m.created_at,
          duration: m.actual_start_at && m.actual_end_at
            ? Math.round((new Date(m.actual_end_at).getTime() - new Date(m.actual_start_at).getTime()) / (1000 * 60))
            : 0,
          participants: Number(m.participant_count) || 0,
        })),
      },
      range,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/analytics', method: 'GET' });
  }
}
