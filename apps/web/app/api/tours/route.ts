import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Get user's organizations
    const memberships = await db.membership.findMany({
      where: { userId: user.id },
      select: { orgId: true },
    });

    const userOrgIds = memberships.map((m) => m.orgId);

    if (userOrgIds.length === 0) {
      return NextResponse.json({ tours: [] });
    }

    const where: any = {
      orgId: { in: userOrgIds },
    };

    if (orgId) {
      where.orgId = orgId;
    }

    if (status) {
      where.status = status;
    }

    const tours = await db.tour.findMany({
      where,
      include: {
        shows: {
          include: {
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
        },
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ startDate: 'desc' }],
    });

    return NextResponse.json({ tours });
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
