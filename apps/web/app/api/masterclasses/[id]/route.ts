import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { strictLimiter } from '@/lib/rate-limit';
import { requireAuth, getCurrentUser } from '@/lib/session';

// GET - Get single masterclass by ID or slug
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Try to find by ID first, then by slug
    let masterclass = await prisma.masterclass.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            headline: true,
            bio: true,
            profileImage: true,
            coverImage: true,
            credentials: true,
            specialties: true,
            verified: true,
            totalStudents: true,
            averageRating: true,
            reviewCount: true,
            website: true,
            instagram: true,
            youtube: true,
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            duration: true,
            isFreePreview: true,
            isLive: true,
            scheduledAt: true,
            thumbnailUrl: true,
            // Only include video URL for free previews (full access checked separately)
          },
        },
        resources: {
          where: { lessonId: null }, // Only class-wide resources
          select: {
            id: true,
            title: true,
            description: true,
            fileType: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        liveSessions: {
          where: {
            scheduledAt: { gte: new Date() },
            status: { in: ['scheduled', 'live'] },
          },
          orderBy: { scheduledAt: 'asc' },
          take: 5,
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            reviews: true,
          },
        },
      },
    });

    // If not found by ID, try by slug
    if (!masterclass) {
      masterclass = await prisma.masterclass.findUnique({
        where: { slug: id },
        include: {
          instructor: {
            select: {
              id: true,
              userId: true,
              displayName: true,
              headline: true,
              bio: true,
              profileImage: true,
              coverImage: true,
              credentials: true,
              specialties: true,
              verified: true,
              totalStudents: true,
              averageRating: true,
              reviewCount: true,
              website: true,
              instagram: true,
              youtube: true,
            },
          },
          lessons: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              order: true,
              duration: true,
              isFreePreview: true,
              isLive: true,
              scheduledAt: true,
              thumbnailUrl: true,
            },
          },
          resources: {
            where: { lessonId: null },
            select: {
              id: true,
              title: true,
              description: true,
              fileType: true,
            },
          },
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          liveSessions: {
            where: {
              scheduledAt: { gte: new Date() },
              status: { in: ['scheduled', 'live'] },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
          },
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              reviews: true,
            },
          },
        },
      });
    }

    if (!masterclass) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    // Check if class should be visible
    if (masterclass.status === 'draft') {
      // Only instructor can see drafts
      if (!user || masterclass.instructor.userId !== user.id) {
        return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
      }
    }

    // Check if user is enrolled
    let enrollment = null;
    if (user) {
      enrollment = await prisma.masterclassEnrollment.findUnique({
        where: {
          masterclassId_userId: {
            masterclassId: masterclass.id,
            userId: user.id,
          },
        },
        include: {
          progress: true,
        },
      });
    }

    // Calculate total duration
    const totalDuration = masterclass.lessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    );

    return NextResponse.json({
      masterclass: {
        ...masterclass,
        totalDuration,
      },
      enrollment,
      isInstructor: user?.id === masterclass.instructor.userId,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses/[id]', method: 'GET' });
  }
}

// PATCH - Update masterclass (instructor only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rateLimitResult = await strictLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    const user = await requireAuth();
    const { id } = await params;

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

    // Verify ownership
    if (masterclass.instructor.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      shortDesc,
      category,
      tags,
      skillLevel,
      format,
      isFree,
      price,
      originalPrice,
      accessDays,
      maxStudents,
      features,
      requirements,
      whatYouLearn,
      thumbnailUrl,
      promoVideoUrl,
      startDate,
      endDate,
      timezone,
      status,
    } = body;

    // Update masterclass
    const updated = await prisma.masterclass.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        shortDesc,
        category,
        tags,
        skillLevel,
        format,
        isFree,
        price: isFree ? null : price,
        originalPrice,
        accessDays,
        maxStudents,
        features,
        requirements,
        whatYouLearn,
        thumbnailUrl,
        promoVideoUrl,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        timezone,
        status,
        publishedAt: status === 'published' && !masterclass.publishedAt ? new Date() : undefined,
      },
    });

    return NextResponse.json({ masterclass: updated });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses/[id]', method: 'PATCH' });
  }
}

// DELETE - Delete masterclass (instructor only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = await strictLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    const user = await requireAuth();
    const { id } = await params;

    // Get masterclass
    const masterclass = await prisma.masterclass.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { userId: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!masterclass) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    // Verify ownership
    if (masterclass.instructor.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Don't allow deletion if there are enrollments
    if (masterclass._count.enrollments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete masterclass with existing enrollments. Archive it instead.' },
        { status: 400 }
      );
    }

    // Delete masterclass (cascades to lessons, resources, etc.)
    await prisma.masterclass.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses/[id]', method: 'DELETE' });
  }
}
