import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getBlockedUserIds } from '@/lib/social';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/ecosystem/collaboration-needs
 * List collaboration needs with filters.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const needType = searchParams.get('needType');
    const genre = searchParams.get('genre');
    const isRemote = searchParams.get('isRemote');
    const isPaid = searchParams.get('isPaid');
    const urgency = searchParams.get('urgency');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'open',
      visibility: 'public',
    };

    if (needType && needType !== 'all') {
      where.needType = needType;
    }
    if (genre) {
      where.genres = { has: genre };
    }
    if (isRemote === 'true') {
      where.isRemote = true;
    }
    if (isPaid === 'true') {
      where.isPaid = true;
    }
    if (urgency) {
      where.urgency = urgency;
    }

    // Optionally filter blocked users if authenticated
    let session;
    try {
      session = await requireAuth();
      const blockedIds = await getBlockedUserIds(session.id);
      if (blockedIds.size > 0) {
        where.userId = { notIn: Array.from(blockedIds) };
      }
    } catch {
      // Not authenticated — public listing is fine
    }

    const [needs, total] = await Promise.all([
      db.collaborationNeed.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      db.collaborationNeed.count({ where }),
    ]);

    return NextResponse.json({
      needs,
      total,
      hasMore: offset + needs.length < total,
    });
  } catch (error) {
    console.error('Error fetching collaboration needs:', error);
    return NextResponse.json({ error: 'Failed to fetch collaboration needs' }, { status: 500 });
  }
}

/**
 * POST /api/ecosystem/collaboration-needs
 * Create a new collaboration need.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    // Validate required fields
    if (!body.needType || !body.title) {
      return NextResponse.json({ error: 'Need type and title are required' }, { status: 400 });
    }

    const validNeedTypes = ['musician', 'producer', 'mixer', 'vocalist', 'writer', 'other'];
    if (!validNeedTypes.includes(body.needType)) {
      return NextResponse.json(
        { error: `Invalid need type. Must be one of: ${validNeedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const need = await db.collaborationNeed.create({
      data: {
        userId: user.id,
        projectId: body.projectId || null,
        songId: body.songId || null,

        needType: body.needType,
        title: body.title,
        description: body.description || null,

        instruments: body.instruments || [],
        genres: body.genres || [],
        skills: body.skills || [],

        isPaid: body.isPaid || false,
        budget: body.budget ? parseFloat(body.budget) : null,
        compensation: body.compensation || 'credit_only',

        isRemote: body.isRemote ?? true,
        location: body.location || null,

        status: 'open',
        urgency: body.urgency || 'normal',
        visibility: body.visibility || 'public',

        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create activity event
    await db.activityEvent.create({
      data: {
        userId: user.id,
        type: 'collaboration_need_posted',
        title: `Looking for: ${need.title}`,
        collaborationNeedId: need.id,
        metadata: {
          needType: need.needType,
        },
      },
    });

    return NextResponse.json({ need }, { status: 201 });
  } catch (error) {
    console.error('Error creating collaboration need:', error);
    return NextResponse.json({ error: 'Failed to create collaboration need' }, { status: 500 });
  }
}
