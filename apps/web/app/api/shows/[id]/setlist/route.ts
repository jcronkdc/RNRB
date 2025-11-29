import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/shows/[id]/setlist
 * Get the setlist for a show
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const show = await db.show.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        orgId: true,
        public: true,
      },
    });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Verify access - ensure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const setlist = await db.setlist.findUnique({
      where: { showId: show.id },
      include: {
        items: {
          include: {
            song: {
              select: {
                id: true,
                title: true,
                key: true,
                tempo: true,
                description: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!setlist) {
      return NextResponse.json({ setlist: null });
    }

    return NextResponse.json({ setlist });
  } catch (error) {
    console.error('Setlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch setlist' }, { status: 500 });
  }
}

/**
 * POST /api/shows/[id]/setlist
 * Create or update setlist for a show
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, notes, items } = body;

    const show = await db.show.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Verify access - ensure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: show.orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if setlist already exists
    let setlist = await db.setlist.findUnique({
      where: { showId: show.id },
    });

    if (setlist) {
      // Update existing setlist
      setlist = await db.setlist.update({
        where: { id: setlist.id },
        data: {
          name,
          notes,
        },
      });

      // Delete existing items
      await db.setlistItem.deleteMany({
        where: { setlistId: setlist.id },
      });
    } else {
      // Create new setlist
      setlist = await db.setlist.create({
        data: {
          showId: show.id,
          name: name || `${show.name} Setlist`,
          notes,
        },
      });
    }

    // Create setlist items
    if (items && Array.isArray(items)) {
      await db.setlistItem.createMany({
        data: items.map((item: any, index: number) => ({
          setlistId: setlist.id,
          songId: item.songId || null,
          position: item.position !== undefined ? item.position : index,
          notes: item.notes || null,
          duration: item.duration ? parseInt(item.duration) : null,
          isEncore: item.isEncore || false,
          customTitle: item.customTitle || null,
        })),
      });
    }

    // Fetch updated setlist with items
    const updatedSetlist = await db.setlist.findUnique({
      where: { id: setlist.id },
      include: {
        items: {
          include: {
            song: {
              select: {
                id: true,
                title: true,
                key: true,
                tempo: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    return NextResponse.json({ setlist: updatedSetlist }, { status: setlist ? 200 : 201 });
  } catch (error) {
    console.error('Setlist POST error:', error);
    return NextResponse.json({ error: 'Failed to create/update setlist' }, { status: 500 });
  }
}

/**
 * PATCH /api/shows/[id]/setlist
 * Update setlist items (for drag-drop reordering)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    const show = await db.show.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Verify access - ensure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: show.orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const setlist = await db.setlist.findUnique({
      where: { showId: show.id },
    });

    if (!setlist) {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 });
    }

    // Update positions
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await db.setlistItem.update({
          where: { id: item.id },
          data: { position: item.position },
        });
      }
    }

    // Fetch updated setlist
    const updatedSetlist = await db.setlist.findUnique({
      where: { id: setlist.id },
      include: {
        items: {
          include: {
            song: {
              select: {
                id: true,
                title: true,
                key: true,
                tempo: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    return NextResponse.json({ setlist: updatedSetlist });
  } catch (error) {
    console.error('Setlist PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update setlist' }, { status: 500 });
  }
}
