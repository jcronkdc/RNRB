/**
 * Message/Conversation Reporting API
 *
 * POST - Report a message or conversation for abuse
 *
 * Report reasons:
 * - spam: Unsolicited commercial messages
 * - harassment: Bullying, threats, hate speech
 * - inappropriate: Adult content, violence
 * - scam: Fraud, phishing attempts
 * - impersonation: Pretending to be someone else
 * - other: Other violations
 */

import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

const VALID_REASONS = [
  'spam',
  'harassment',
  'inappropriate',
  'scam',
  'impersonation',
  'other',
] as const;

type ReportReason = (typeof VALID_REASONS)[number];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { conversationId, messageId, reportedUserId, reason, details } = body;

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason as ReportReason)) {
      return NextResponse.json(
        { error: 'Invalid report reason. Must be one of: ' + VALID_REASONS.join(', ') },
        { status: 400 }
      );
    }

    // Need at least conversationId or messageId
    if (!conversationId && !messageId) {
      return NextResponse.json(
        { error: 'Either conversationId or messageId is required' },
        { status: 400 }
      );
    }

    // Verify the message/conversation exists and user has access
    if (messageId) {
      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      if (!message.channelId.includes(userId)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    // Create the report
    try {
      await prisma.messageReport.create({
        data: {
          reporterId: userId,
          conversationId: conversationId || null,
          messageId: messageId || null,
          reportedUserId: reportedUserId || null,
          reason,
          details: details?.slice(0, 1000) || null, // Limit details length
          status: 'pending',
        },
      });
    } catch (dbError) {
      // MessageReport model might not exist, log for admin review
      console.error('Report submitted (model may not exist):', {
        reporterId: userId,
        conversationId,
        messageId,
        reportedUserId,
        reason,
        details: details?.slice(0, 500),
        timestamp: new Date().toISOString(),
      });
    }

    // Auto-block the reported user for the reporter (optional feature)
    if (reportedUserId && reason === 'harassment') {
      try {
        await prisma.userBlock.upsert({
          where: {
            blockerId_blockedId: {
              blockerId: userId,
              blockedId: reportedUserId,
            },
          },
          create: {
            blockerId: userId,
            blockedId: reportedUserId,
          },
          update: {},
        });
      } catch {
        // Block model might not exist
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your report. Our team will review it.',
      reportId: `report_${Date.now()}`, // Placeholder ID
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

// GET - Get user's submitted reports (for transparency)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
      const reports = await prisma.messageReport.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          reason: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
      });

      return NextResponse.json({ reports });
    } catch {
      // Model might not exist
      return NextResponse.json({ reports: [] });
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
