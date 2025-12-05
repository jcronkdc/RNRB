import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

// POST - Update progress for a lesson
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: masterclassId } = await params;
    const body = await request.json();
    const { lessonId, watchedSeconds, isCompleted, notes } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    // Verify enrollment - check for 'active' status (enrollment completed = payment done)
    const enrollment = await prisma.masterclassEnrollment.findFirst({
      where: {
        masterclassId,
        userId: session.user.id,
        status: 'active',
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    // Get existing progress
    const existingProgress = await prisma.masterclassProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          lessonId,
          enrollmentId: enrollment.id,
        },
      },
    });

    const updateData: Record<string, unknown> = {};

    if (watchedSeconds !== undefined) {
      updateData.watchedSeconds = Math.max(existingProgress?.watchedSeconds || 0, watchedSeconds);
    }

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted && !existingProgress?.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const progress = await prisma.masterclassProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          lessonId,
          enrollmentId: enrollment.id,
        },
      },
      update: updateData,
      create: {
        lessonId,
        enrollmentId: enrollment.id,
        watchedSeconds: watchedSeconds || 0,
        totalSeconds: 0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
        notes: notes || null,
      },
    });

    // Check if all lessons are completed for certificate
    if (isCompleted) {
      const totalLessons = await prisma.masterclassLesson.count({
        where: { masterclassId },
      });

      const completedLessons = await prisma.masterclassProgress.count({
        where: {
          enrollmentId: enrollment.id,
          isCompleted: true,
        },
      });

      if (completedLessons === totalLessons) {
        // Update enrollment with completion
        await prisma.masterclassEnrollment.update({
          where: { id: enrollment.id },
          data: {
            completedAt: new Date(),
            lessonsCompleted: completedLessons,
            progressPercent: 100,
          },
        });
      } else {
        // Update progress percentage
        await prisma.masterclassEnrollment.update({
          where: { id: enrollment.id },
          data: {
            lessonsCompleted: completedLessons,
            progressPercent: (completedLessons / totalLessons) * 100,
          },
        });
      }
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}

// GET - Get progress for all lessons in a masterclass
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: masterclassId } = await params;

    // Verify enrollment
    const enrollment = await prisma.masterclassEnrollment.findFirst({
      where: {
        masterclassId,
        userId: session.user.id,
        status: 'active',
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    const progress = await prisma.masterclassProgress.findMany({
      where: { enrollmentId: enrollment.id },
      select: {
        lessonId: true,
        watchedSeconds: true,
        isCompleted: true,
        completedAt: true,
        notes: true,
      },
    });

    return NextResponse.json({ progress, enrollment });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
