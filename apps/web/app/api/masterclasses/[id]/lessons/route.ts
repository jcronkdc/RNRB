import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { checkStrictLimit } from '@/lib/rate-limit';
import { requireAuth, getCurrentUser } from '@/lib/session';

// GET - Get lessons for a masterclass
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Get masterclass
    const masterclass = await prisma.masterclass.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { userId: true },
        },
      },
    });

    if (!masterclass) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    // Check access
    let hasFullAccess = false;

    if (user?.id) {
      // Instructor has full access
      if (masterclass.instructor.userId === user.id) {
        hasFullAccess = true;
      } else {
        // Check enrollment
        const enrollment = await prisma.masterclassEnrollment.findUnique({
          where: {
            masterclassId_userId: {
              masterclassId: id,
              userId: user.id,
            },
          },
        });

        if (enrollment?.status === 'active') {
          // Check access period
          if (!enrollment.accessEndsAt || enrollment.accessEndsAt > new Date()) {
            hasFullAccess = true;
          }
        }
      }
    }

    // Get lessons
    const lessons = await prisma.masterclassLesson.findMany({
      where: { masterclassId: id },
      orderBy: { order: 'asc' },
      include: {
        resources: {
          select: {
            id: true,
            title: true,
            description: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
    });

    // Filter sensitive data if no access
    const processedLessons = lessons.map((lesson) => ({
      ...lesson,
      // Only show video URL if has access or is free preview
      videoUrl: hasFullAccess || lesson.isFreePreview ? lesson.videoUrl : null,
      dailyRoomId: hasFullAccess || lesson.isFreePreview ? lesson.dailyRoomId : null,
      recordingUrl: hasFullAccess ? lesson.recordingUrl : null,
      resources: hasFullAccess ? lesson.resources : [],
    }));

    return NextResponse.json({
      lessons: processedLessons,
      hasFullAccess,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses/[id]/lessons', method: 'GET' });
  }
}

// POST - Create a new lesson (instructor only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rateLimitResult = await checkStrictLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const user = await requireAuth();
    const { id } = await params;

    // Get masterclass and verify ownership
    const masterclass = await prisma.masterclass.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { userId: true },
        },
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!masterclass) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    if (masterclass.instructor.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      videoUrl,
      duration,
      thumbnailUrl,
      isLive,
      scheduledAt,
      isFreePreview,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Lesson title is required' }, { status: 400 });
    }

    // Get next order number
    const nextOrder = masterclass._count.lessons + 1;

    // Create lesson
    const lesson = await prisma.masterclassLesson.create({
      data: {
        masterclassId: id,
        title,
        description,
        order: nextOrder,
        videoUrl,
        duration,
        thumbnailUrl,
        isLive: isLive || false,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isFreePreview: isFreePreview || false,
      },
    });

    // Update lesson count
    await prisma.masterclass.update({
      where: { id },
      data: { lessonCount: nextOrder },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses/[id]/lessons', method: 'POST' });
  }
}
