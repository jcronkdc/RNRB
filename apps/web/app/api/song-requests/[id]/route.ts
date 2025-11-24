import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * PATCH /api/song-requests/[id]
 * Update song request status (approve/reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, responseMessage } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be approved or rejected' },
        { status: 400 }
      );
    }

    // Find the request
    const songRequest = await db.songRequest.findUnique({
      where: { id },
      include: {
        setlist: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!songRequest) {
      return NextResponse.json({ error: 'Song request not found' }, { status: 404 });
    }

    // Verify user is member of the project's org
    const membership = await db.membership.findFirst({
      where: {
        userId: user.id,
        orgId: songRequest.setlist.project.orgId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this request' },
        { status: 403 }
      );
    }

    // Update the request
    const updated = await db.songRequest.update({
      where: { id },
      data: {
        status,
        responseMessage,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({ songRequest: updated });
  } catch (error) {
    console.error('Song request PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update song request' }, { status: 500 });
  }
}

/**
 * DELETE /api/song-requests/[id]
 * Delete a song request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const songRequest = await db.songRequest.findUnique({
      where: { id },
      include: {
        setlist: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!songRequest) {
      return NextResponse.json({ error: 'Song request not found' }, { status: 404 });
    }

    // Verify user is member of the project's org
    const membership = await db.membership.findFirst({
      where: {
        userId: user.id,
        orgId: songRequest.setlist.project.orgId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this request' },
        { status: 403 }
      );
    }

    await db.songRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Song request DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete song request' }, { status: 500 });
  }
}

