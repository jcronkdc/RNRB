/**
 * Meeting Chat API
 *
 * GET /api/meet/[meetingCode]/chat - Get chat messages
 * POST /api/meet/[meetingCode]/chat - Send a message
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { meetingCode } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const before = searchParams.get('before');

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Get messages
    let whereClause = `WHERE mc.meeting_id = '${meeting.id}'::uuid`;
    if (before) {
      whereClause += ` AND mc.created_at < '${before}'`;
    }

    const messages = await db.$queryRaw<any[]>`
      SELECT 
        mc.*,
        u.name as sender_name,
        u.image as sender_avatar
      FROM meeting_chat mc
      LEFT JOIN "User" u ON mc.sender_id = u.id
      ${whereClause.includes('WHERE') ? whereClause : ''}
      ORDER BY mc.created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      messages: messages.reverse().map((m) => ({
        id: m.id,
        message: m.message,
        type: m.message_type,
        fileUrl: m.file_url,
        fileName: m.file_name,
        fileType: m.file_type,
        sender: {
          id: m.sender_id,
          name: m.sender_name || 'Guest',
          avatar: m.sender_avatar,
        },
        recipientId: m.recipient_id,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/chat', method: 'GET' });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const body = await request.json();

    const { message, recipientId, fileUrl, fileName, fileType } = body;

    if (!message?.trim() && !fileUrl) {
      return NextResponse.json({ error: 'Message or file required' }, { status: 400 });
    }

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id, chat_enabled FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    if (!meeting.chat_enabled) {
      return NextResponse.json({ error: 'Chat is disabled for this meeting' }, { status: 403 });
    }

    // Insert message
    const messageType = fileUrl ? 'file' : 'text';

    const result = await db.$queryRaw<any[]>`
      INSERT INTO meeting_chat (meeting_id, sender_id, message, message_type, file_url, file_name, file_type, recipient_id)
      VALUES (
        ${meeting.id}::uuid,
        ${user.id},
        ${message?.trim() || ''},
        ${messageType},
        ${fileUrl || null},
        ${fileName || null},
        ${fileType || null},
        ${recipientId || null}
      )
      RETURNING *
    `;

    const newMessage = result[0];

    return NextResponse.json({
      message: {
        id: newMessage.id,
        message: newMessage.message,
        type: newMessage.message_type,
        fileUrl: newMessage.file_url,
        fileName: newMessage.file_name,
        sender: {
          id: user.id,
          name: user.name || 'Guest',
          avatar: user.image,
        },
        createdAt: newMessage.created_at,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/chat', method: 'POST' });
  }
}
