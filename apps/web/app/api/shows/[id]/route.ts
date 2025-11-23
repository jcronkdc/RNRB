import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/shows/[id]
 * Get a single show by ID or slug
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const show = await db.show.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        venue: true,
        project: {
          include: {
            songs: {
              orderBy: { title: 'asc' },
            },
          },
        },
        tour: true,
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        setlist: {
          include: {
            items: {
              include: {
                song: {
                  select: {
                    id: true,
                    title: true,
                    key: true,
                    tempo: true,
                    duration: true,
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Verify user has access
    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: show.orgId,
        },
      },
    });

    if (!membership && !show.public) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ show });
  } catch (error) {
    console.error('Show GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch show' }, { status: 500 });
  }
}

/**
 * PATCH /api/shows/[id]
 * Update a show
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if show exists
    const existingShow = await db.show.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existingShow) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Verify user has access
    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: existingShow.orgId,
        },
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json(
        { error: 'You do not have permission to update this show' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    // Update fields if provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.doorsTime !== undefined)
      updateData.doorsTime = body.doorsTime ? new Date(body.doorsTime) : null;
    if (body.soundcheckTime !== undefined)
      updateData.soundcheckTime = body.soundcheckTime ? new Date(body.soundcheckTime) : null;
    if (body.setLength !== undefined)
      updateData.setLength = body.setLength ? parseInt(body.setLength) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.venueId !== undefined) updateData.venueId = body.venueId;
    if (body.projectId !== undefined) updateData.projectId = body.projectId;
    if (body.tourId !== undefined) updateData.tourId = body.tourId;
    if (body.ticketUrl !== undefined) updateData.ticketUrl = body.ticketUrl;
    if (body.ticketPrice !== undefined) updateData.ticketPrice = body.ticketPrice;
    if (body.ageRestriction !== undefined) updateData.ageRestriction = body.ageRestriction;
    if (body.supportingActs !== undefined) updateData.supportingActs = body.supportingActs;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.posterImage !== undefined) updateData.posterImage = body.posterImage;
    if (body.public !== undefined) updateData.public = body.public;
    if (body.attendance !== undefined)
      updateData.attendance = body.attendance ? parseInt(body.attendance) : null;
    if (body.grossRevenue !== undefined) updateData.grossRevenue = body.grossRevenue;

    const show = await db.show.update({
      where: { id: existingShow.id },
      data: updateData,
      include: {
        venue: true,
        project: true,
        tour: true,
      },
    });

    return NextResponse.json({ show });
  } catch (error) {
    console.error('Show PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update show' }, { status: 500 });
  }
}

/**
 * DELETE /api/shows/[id]
 * Delete a show (cascades to setlist)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if show exists
    const existingShow = await db.show.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existingShow) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Verify user has access
    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: existingShow.orgId,
        },
      },
    });

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only organization owners can delete shows' },
        { status: 403 }
      );
    }

    // Delete show (cascades to setlist due to onDelete: Cascade in schema)
    await db.show.delete({
      where: { id: existingShow.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Show DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete show' }, { status: 500 });
  }
}
