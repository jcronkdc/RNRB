import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { standardLimiter, strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/tours/[id]
 * Get a single tour by ID or slug
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `tour-read:${user.id}`);

    const { searchParams } = new URL(request.url);
    const includeShowDetails = searchParams.get('includeShowDetails') === 'true';

    // Optimized query with selective field loading
    const tour = await db.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        orgId: true,
        name: true,
        slug: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        posterImage: true,
        sponsorLogos: true,
        merch: true,
        public: true,
        createdAt: true,
        updatedAt: true,
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        shows: {
          select: {
            id: true,
            name: true,
            slug: true,
            date: true,
            status: true,
            doorsTime: true,
            attendance: true,
            ...(includeShowDetails
              ? {
                  venue: {
                    select: {
                      id: true,
                      name: true,
                      city: true,
                      state: true,
                      country: true,
                      capacity: true,
                    },
                  },
                  project: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                  setlist: {
                    select: {
                      id: true,
                      name: true,
                      _count: {
                        select: {
                          items: true,
                        },
                      },
                    },
                  },
                }
              : {}),
          },
          orderBy: { date: 'asc' },
        },
        _count: {
          select: {
            shows: true,
          },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Verify access - ensure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: tour.orgId,
        },
      },
    });

    if (!membership && !tour.public) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ tour });
  } catch (error) {
    console.error('Tour GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 });
  }
}

/**
 * PATCH /api/tours/[id]
 * Update a tour
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 30 updates per minute
    await checkRateLimit(strictLimiter, `tour-update:${user.id}`);

    const body = await request.json();

    const existingTour = await db.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingTour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Verify access - ensure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: existingTour.orgId,
        },
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json(
        { error: 'You do not have permission to update this tour' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined)
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.posterImage !== undefined) updateData.posterImage = body.posterImage;
    if (body.sponsorLogos !== undefined) updateData.sponsorLogos = body.sponsorLogos;
    if (body.merch !== undefined) updateData.merch = body.merch;
    if (body.public !== undefined) updateData.public = body.public;

    const tour = await db.tour.update({
      where: { id: existingTour.id },
      data: updateData,
      include: {
        org: true,
        shows: {
          include: {
            venue: true,
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    return NextResponse.json({ tour });
  } catch (error) {
    console.error('Tour PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 });
  }
}

/**
 * DELETE /api/tours/[id]
 * Delete a tour
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 deletes per minute
    await checkRateLimit(strictLimiter, `tour-delete:${user.id}`);

    const existingTour = await db.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        shows: true,
      },
    });

    if (!existingTour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Verify access - ensure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: existingTour.orgId,
        },
      },
    });

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only organization owners can delete tours' },
        { status: 403 }
      );
    }

    // Check if tour has shows
    if (existingTour.shows.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tour with existing shows. Delete shows first or unlink them.' },
        { status: 400 }
      );
    }

    await db.tour.delete({
      where: { id: existingTour.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tour DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 });
  }
}
