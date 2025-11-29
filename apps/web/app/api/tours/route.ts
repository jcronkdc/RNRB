import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { standardLimiter, strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/session';
import { requireFeatureAccess, SubscriptionError } from '@/lib/subscription';

/**
 * GET /api/tours
 * List all tours for user's organizations
 * REQUIRES: Creator or Studio subscription
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `tours-read:${user.id}`);

    // Check subscription access - FEATURE GATE
    try {
      await requireFeatureAccess(user.id, 'toursAndGigs');
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return NextResponse.json(
          {
            error: 'Subscription required',
            message: error.message,
            feature: error.feature,
            requiredTier: error.requiredTier,
            upgradeUrl: '/settings/billing?upgrade=creator',
          },
          { status: 403 }
        );
      }
      throw error;
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const status = searchParams.get('status');

    // Parse and validate pagination parameters
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '50');

    // Validate parsed values are valid positive integers
    if (isNaN(pageParam) || pageParam < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter: must be a positive integer' },
        { status: 400 }
      );
    }

    if (isNaN(limitParam) || limitParam < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter: must be a positive integer' },
        { status: 400 }
      );
    }

    const page = pageParam;
    const limit = Math.min(limitParam, 100); // Max 100
    const skip = (page - 1) * limit;
    const includeShows = searchParams.get('includeShows') === 'true';

    // Get user's organizations (optimized with caching potential)
    const memberships = await db.membership.findMany({
      where: { userId: user.id },
      select: { orgId: true },
    });

    const userOrgIds = memberships.map((m) => m.orgId);

    if (userOrgIds.length === 0) {
      return NextResponse.json({ tours: [], total: 0, page, limit });
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

    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const total = await db.tour.count({ where });

    // Optimized query - only load what's needed
    const tours = await db.tour.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        posterImage: true,
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
        ...(includeShows
          ? {
              shows: {
                select: {
                  id: true,
                  name: true,
                  date: true,
                  status: true,
                  venue: {
                    select: {
                      id: true,
                      name: true,
                      city: true,
                      state: true,
                    },
                  },
                },
                orderBy: { date: 'asc' },
                take: 10, // Limit shows per tour
              },
            }
          : {}),
        _count: {
          select: {
            shows: true,
          },
        },
      },
      orderBy: [{ startDate: 'desc' }],
      skip,
      take: limit,
    });

    return NextResponse.json({
      tours,
      total,
      page,
      limit,
      hasMore: skip + tours.length < total,
    });
  } catch (error) {
    console.error('Tours GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
  }
}

/**
 * POST /api/tours
 * Create a new tour
 * REQUIRES: Creator or Studio subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 tours per minute for writes
    await checkRateLimit(strictLimiter, `tours-write:${user.id}`);

    // Check subscription access - FEATURE GATE
    try {
      await requireFeatureAccess(user.id, 'toursAndGigs');
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return NextResponse.json(
          {
            error: 'Subscription required',
            message: error.message,
            feature: error.feature,
            requiredTier: error.requiredTier,
            upgradeUrl: '/settings/billing?upgrade=creator',
          },
          { status: 403 }
        );
      }
      throw error;
    }

    const body = await request.json();
    const {
      orgId,
      name,
      description,
      startDate,
      endDate,
      status = 'planning',
      posterImage,
      sponsorLogos,
      merch,
      public: isPublic = false,
    } = body;

    if (!orgId || !name || !startDate) {
      return NextResponse.json(
        { error: 'Organization ID, name, and start date are required' },
        { status: 400 }
      );
    }

    // Verify user is member of org (user.id already checked above)
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

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug exists
    const existingTour = await db.tour.findUnique({
      where: { slug },
    });

    let finalSlug = slug;
    if (existingTour) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const tour = await db.tour.create({
      data: {
        orgId,
        name,
        slug: finalSlug,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        posterImage,
        sponsorLogos: sponsorLogos || null,
        merch: merch || null,
        public: isPublic,
      },
      include: {
        org: true,
      },
    });

    return NextResponse.json({ tour }, { status: 201 });
  } catch (error) {
    console.error('Tours POST error:', error);
    return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 });
  }
}
