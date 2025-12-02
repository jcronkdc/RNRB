/**
 * Meeting Invite API
 *
 * POST /api/meet/[meetingCode]/invite - Send invitations
 * GET /api/meet/[meetingCode]/invite - Get invite details (for ICS calendar file)
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { sendEmail } from '@/lib/email';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { meetingCode } = await params;

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT 
        m.*,
        u.name as organizer_name,
        u.email as organizer_email
      FROM meetings m
      JOIN "User" u ON m.organizer_id = u.id
      WHERE m.meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Generate ICS calendar file
    const startDate = meeting.scheduled_start_at
      ? new Date(meeting.scheduled_start_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const endDate = meeting.scheduled_end_at
      ? new Date(meeting.scheduled_end_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rock N Roll Basement//Meeting//EN
BEGIN:VEVENT
UID:${meeting.id}@rocknrollbasement.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${meeting.title}
DESCRIPTION:${meeting.description || 'Join the meeting'}\\n\\nJoin URL: ${meeting.join_url}
URL:${meeting.join_url}
ORGANIZER;CN=${meeting.organizer_name}:mailto:${meeting.organizer_email}
END:VEVENT
END:VCALENDAR`;

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/invite', method: 'GET' });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const body = await request.json();

    const { emails, message } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Email addresses required' }, { status: 400 });
    }

    // Validate emails
    const validEmails = emails.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (validEmails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses' }, { status: 400 });
    }

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT * FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Check if user can invite (organizer or co-host)
    if (meeting.organizer_id !== user.id) {
      const participant = await db.$queryRaw<any[]>`
        SELECT role FROM meeting_participants 
        WHERE meeting_id = ${meeting.id}::uuid AND user_id = ${user.id}
      `;

      if (!participant.length || !['organizer', 'co_host'].includes(participant[0].role)) {
        return NextResponse.json({ error: 'Not authorized to invite' }, { status: 403 });
      }
    }

    // Add participants
    for (const email of validEmails) {
      await db.$executeRaw`
        INSERT INTO meeting_participants (meeting_id, email, role, invite_status)
        VALUES (${meeting.id}::uuid, ${email}, 'participant', 'pending')
        ON CONFLICT (meeting_id, email) DO NOTHING
      `;
    }

    // Send invitation emails
    const scheduledTime = meeting.scheduled_start_at
      ? new Date(meeting.scheduled_start_at).toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      : 'Starting now';

    const emailPromises = validEmails.map((email) =>
      sendEmail({
        to: email,
        subject: `${user.name || 'Someone'} invited you to: ${meeting.title}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">
                📹 You're Invited
              </h1>
            </div>
            
            <div style="background: #1a1a1a; padding: 30px; color: white;">
              <h2 style="margin: 0 0 20px; font-size: 22px;">${meeting.title}</h2>
              
              <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px; color: #888; font-size: 14px;">When</p>
                <p style="margin: 0; font-size: 16px;">${scheduledTime}</p>
              </div>
              
              ${
                message
                  ? `
                <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Message from ${user.name || 'organizer'}</p>
                  <p style="margin: 0; font-size: 14px;">${message}</p>
                </div>
              `
                  : ''
              }
              
              <a href="${meeting.join_url}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 10px;">
                Join Meeting →
              </a>
              
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                Meeting code: <strong>${meeting.meeting_code}</strong>
              </p>
            </div>
            
            <div style="background: #0a0a0a; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #666; margin: 0; font-size: 12px;">
                <a href="${meeting.join_url.replace(`/meet/${meetingCode}`, `/api/meet/${meetingCode}/invite`)}" style="color: #888;">
                  Add to calendar
                </a>
              </p>
            </div>
          </div>
        `,
      }).catch((err) => console.error(`Failed to send invite to ${email}:`, err))
    );

    await Promise.allSettled(emailPromises);

    return NextResponse.json({
      success: true,
      invited: validEmails.length,
      message: `Invitation sent to ${validEmails.length} recipient(s)`,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/invite', method: 'POST' });
  }
}
