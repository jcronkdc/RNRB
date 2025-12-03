/**
 * Booking Messages API
 *
 * Real-time messaging between client and provider for a booking
 *
 * Security Features:
 * - Rate limiting (10 messages/minute per user)
 * - Spam content filtering
 * - Duplicate message detection
 * - Access control (only booking participants)
 */

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import {
  checkRateLimits,
  checkMessageForSpam,
  checkDuplicateMessage,
  recordMessage,
} from '@/lib/spam-protection';

/**
 * GET - Get messages for a booking
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this booking
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { select: { userId: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isClient = booking.clientId === session.user.id;
    const isProvider = booking.provider.userId === session.user.id;

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const messages = await prisma.bookingMessage.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { name: true, image: true },
        },
      },
    });

    // Mark unread messages as read
    await prisma.bookingMessage.updateMany({
      where: {
        bookingId: id,
        readAt: null,
        senderId: { not: session.user.id },
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[BOOKING_MESSAGES] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST - Send a message
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const body = await request.json();
    const { content, attachments } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    const trimmedContent = content.trim();

    // First, verify user has access and determine recipient
    // This must happen BEFORE rate limiting so we can check per-recipient cooldowns
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { select: { userId: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isClient = booking.clientId === userId;
    const isProvider = booking.provider.userId === userId;

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Determine recipient for rate limiting (needed for per-recipient cooldown)
    const recipientId = isClient ? booking.provider.userId : booking.clientId;

    // 🔒 SPAM PROTECTION: Check rate limits (includes per-recipient 5s cooldown)
    const rateLimit = checkRateLimits(userId, recipientId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason || 'Too many messages. Please slow down.' },
        { status: 429 }
      );
    }

    // 🔒 SPAM PROTECTION: Check for spam content
    const spamCheck = checkMessageForSpam(trimmedContent);
    if (spamCheck.isSpam) {
      return NextResponse.json(
        { error: 'Message flagged as potential spam. Please revise your message.' },
        { status: 400 }
      );
    }

    // 🔒 SPAM PROTECTION: Check for duplicate messages
    if (checkDuplicateMessage(userId, trimmedContent)) {
      return NextResponse.json(
        { error: 'Please avoid sending duplicate messages.' },
        { status: 400 }
      );
    }

    // Record message for rate limiting (for future checks)
    recordMessage(userId, recipientId, trimmedContent);

    const message = await prisma.bookingMessage.create({
      data: {
        bookingId: id,
        senderId: userId,
        content: trimmedContent,
        attachments: attachments || null,
      },
      include: {
        sender: {
          select: { name: true, image: true },
        },
      },
    });

    // TODO: Send real-time notification via Ably
    // TODO: Send email notification if recipient offline

    return NextResponse.json({ message });
  } catch (error) {
    console.error('[BOOKING_MESSAGES] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
