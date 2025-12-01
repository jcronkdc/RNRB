import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { requireAuth } from '@/lib/session';

// GET /api/ecosystem/opportunities/[id] - Get single opportunity
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const opportunity = await db.opportunity.findUnique({
      where: { id: params.id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            capacity: true,
          },
        },
        applications: {
          select: {
            id: true,
            applicantId: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Increment view count
    await db.opportunity.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}

// PATCH /api/ecosystem/opportunities/[id] - Update opportunity
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (!session?.userId) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const opportunity = await db.opportunity.findUnique({
      where: { id: params.id },
      select: { postedById: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (opportunity.postedById !== session.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own opportunities' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updated = await db.opportunity.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type && { type: body.type }),
        ...(body.compensation && { compensation: body.compensation }),
        ...(body.payAmount !== undefined && {
          payAmount: body.payAmount ? parseFloat(body.payAmount) : null,
        }),
        ...(body.status && { status: body.status }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.deadline && { deadline: new Date(body.deadline) }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.isRemote !== undefined && { isRemote: body.isRemote }),
      },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ opportunity: updated });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

// DELETE /api/ecosystem/opportunities/[id] - Delete opportunity
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (!session?.userId) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const opportunity = await db.opportunity.findUnique({
      where: { id: params.id },
      select: { postedById: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (opportunity.postedById !== session.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own opportunities' },
        { status: 403 }
      );
    }

    await db.opportunity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
