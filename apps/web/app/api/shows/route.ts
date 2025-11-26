import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/shows
 * List all shows for user's organizations
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const projectId = searchParams.get('projectId');
    const tourId = searchParams.get('tourId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming'); // 'true' or 'false'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;
    const includeSetlist = searchParams.get('includeSetlist') === 'true';

    // Get user's organizations - consider caching this
    const memberships = await db.membership.findMany({
      where: { userId: user.id },
      select: { orgId: true },
    });

    const userOrgIds = memberships.map((m) => m.orgId);

    if (userOrgIds.length === 0) {
      return NextResponse.json({ shows: [], total: 0, page, limit });
    }

    const where: any = {
      orgId: { in: userOrgIds },
    };

    // Validate orgId is in user's authorized organizations
    if (orgId) {
      if (!userOrgIds.includes(orgId)) {
        return NextResponse.json(
          { error: 'Unauthorized: You do not have access to this organization' },
          { status: 403 }
        );
      }
      where.orgId = orgId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (tourId) {
      where.tourId = tourId;
    }

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.date = { gte: new Date() };
    } else if (upcoming === 'false') {
      where.date = { lt: new Date() };
    }

    // Get total count
    const total = await db.show.count({ where });

    // Optimized query with selective loading
    const shows = await db.show.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        date: true,
        doorsTime: true,
        soundcheckTime: true,
        setLength: true,
        status: true,
        ticketUrl: true,
        ticketPrice: true,
        ageRestriction: true,
        notes: true,
        posterImage: true,
        attendance: true,
        grossRevenue: true,
        public: true,
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
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
        tour: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        ...(includeSetlist ? {
          setlist: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  items: true,
                },
              },
              items: {
                select: {
                  id: true,
                  position: true,
                  isEncore: true,
                  song: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
                orderBy: { position: 'asc' },
                take: 5, // Just show first 5 songs
              },
            },
          },
        } : {}),
      },
      orderBy: [{ date: upcoming === 'false' ? 'desc' : 'asc' }],
      skip,
      take: limit,
    });

    return NextResponse.json({
      shows,
      total,
      page,
      limit,
      hasMore: skip + shows.length < total,
    });
  } catch (error) {
    console.error('Shows GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 });
  }
}

/**
 * POST /api/shows
 * Create a new show
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      orgId,
      projectId,
      tourId,
      venueId,
      name,
      description,
      date,
      doorsTime,
      soundcheckTime,
      setLength,
      status = 'scheduled',
      ticketUrl,
      ticketPrice,
      ageRestriction,
      supportingActs,
      notes,
      posterImage,
      public: isPublic = true,
    } = body;

    if (!orgId || !name || !date) {
      return NextResponse.json(
        { error: 'Organization ID, name, and date are required' },
        { status: 400 }
      );
    }

    // Verify user is member of org
    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      );
    }

    // Generate slug from name and date
    const dateStr = new Date(date).toISOString().split('T')[0];
    const slug = `${name}-${dateStr}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug exists
    const existingShow = await db.show.findUnique({
      where: { slug },
    });

    let finalSlug = slug;
    if (existingShow) {
      // Add timestamp to make unique
      finalSlug = `${slug}-${Date.now()}`;
    }

    const show = await db.show.create({
      data: {
        orgId,
        projectId: projectId || null,
        tourId: tourId || null,
        venueId: venueId || null,
        name,
        slug: finalSlug,
        description,
        date: new Date(date),
        doorsTime: doorsTime ? new Date(doorsTime) : null,
        soundcheckTime: soundcheckTime ? new Date(soundcheckTime) : null,
        setLength: setLength ? parseInt(setLength) : null,
        status,
        ticketUrl,
        ticketPrice: ticketPrice || null,
        ageRestriction,
        supportingActs: supportingActs || null,
        notes,
        posterImage,
        public: isPublic,
      },
      include: {
        venue: true,
        project: true,
        tour: true,
      },
    });

    return NextResponse.json({ show }, { status: 201 });
  } catch (error) {
    console.error('Shows POST error:', error);
    return NextResponse.json({ error: 'Failed to create show' }, { status: 500 });
  }
}
