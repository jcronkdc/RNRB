/**
 * R&R Labs Feedback API
 *
 * Collects feedback from volunteers on:
 * - Generated audio quality
 * - UI/UX improvements
 * - Feature requests
 * - Bug reports
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { handleApiError } from '@/lib/errors';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

// Valid feedback target types
const VALID_TARGET_TYPES = ['generated_audio', 'ui', 'feature_request', 'bug', 'general'];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 20 feedback submissions per hour
    await checkRateLimit(standardLimiter, `labs-feedback:${session.user.id}`);

    const body = await request.json();
    const { targetType, targetId, rating, feedback, variant } = body;

    // Validate required fields
    if (!targetType || !VALID_TARGET_TYPES.includes(targetType)) {
      return NextResponse.json(
        { error: `Invalid target type. Must be one of: ${VALID_TARGET_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!feedback || typeof feedback !== 'string' || feedback.trim().length < 10) {
      return NextResponse.json(
        { error: 'Feedback must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (feedback.length > 5000) {
      return NextResponse.json(
        { error: 'Feedback must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      const ratingNum = parseInt(rating, 10);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
      }
    }

    const { prisma: db } = await import('@cronkwaters/db');

    // Get or create volunteer record
    let volunteer = await db.labsVolunteer.findFirst({
      where: {
        OR: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }],
      },
    });

    // Auto-create volunteer if they're logged in but not registered
    if (!volunteer && session.user.email) {
      volunteer = await db.labsVolunteer.create({
        data: {
          email: session.user.email.toLowerCase(),
          userId: session.user.id,
          status: 'active',
          source: 'feedback_submission',
          interests: ['feedback_surveys'],
        },
      });
    }

    if (!volunteer) {
      return NextResponse.json({ error: 'Could not create volunteer record' }, { status: 500 });
    }

    // Create feedback record
    const feedbackRecord = await db.labsFeedback.create({
      data: {
        volunteerId: volunteer.id,
        targetType,
        targetId: targetId || null,
        rating: rating ? parseInt(rating, 10) : null,
        feedback: feedback.trim(),
        variant: variant || null,
      },
    });

    // Update volunteer's feedback count
    await db.labsVolunteer.update({
      where: { id: volunteer.id },
      data: {
        feedbackCount: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: feedbackRecord.id,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/labs/feedback', method: 'POST' });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');

    const { prisma: db } = await import('@cronkwaters/db');

    // Get volunteer record
    const volunteer = await db.labsVolunteer.findFirst({
      where: {
        OR: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }],
      },
    });

    if (!volunteer) {
      return NextResponse.json({
        feedback: [],
        message: 'Not a registered volunteer',
      });
    }

    // Get user's feedback history
    const feedbackList = await db.labsFeedback.findMany({
      where: {
        volunteerId: volunteer.id,
        ...(targetType ? { targetType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      feedback: feedbackList.map((f) => ({
        id: f.id,
        targetType: f.targetType,
        targetId: f.targetId,
        rating: f.rating,
        feedback: f.feedback.slice(0, 100) + (f.feedback.length > 100 ? '...' : ''),
        createdAt: f.createdAt,
      })),
      totalCount: volunteer.feedbackCount,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/labs/feedback', method: 'GET' });
  }
}
