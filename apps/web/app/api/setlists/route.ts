import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/setlists
 * List setlists for the authenticated user, optionally filtered by projectId or showId
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const showId = searchParams.get('showId');

    // Build where clause — setlists belong to shows which belong to orgs
    const where: any = {};

    if (showId) {
      where.showId = showId;
    }

    if (projectId) {
      // Find shows that belong to the project's org
      where.show = {
        projectId,
      };
    }

    const setlists = await db.setlist.findMany({
      where,
      include: {
        show: {
          select: {
            id: true,
            name: true,
            date: true,
            venue: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
        items: {
          orderBy: { position: 'asc' },
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
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ setlists });
  } catch (error) {
    console.error('GET /api/setlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch setlists' }, { status: 500 });
  }
}
