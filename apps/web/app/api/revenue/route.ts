import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cronkwaters/db';
import { standardLimiter } from '@/lib/rate-limit';

/**
 * GET /api/revenue
 * Fetch revenue records for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const { success } = await standardLimiter.check(identifier);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (source && source !== 'all') {
      where.source = source;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Fetch revenue records
    const [revenues, total] = await Promise.all([
      db.revenue.findMany({
        where,
        include: {
          song: {
            select: {
              id: true,
              title: true,
            },
          },
          show: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      db.revenue.count({ where }),
    ]);

    // Calculate totals
    const totalRevenue = await db.revenue.aggregate({
      where: { userId: session.user.id },
      _sum: {
        amount: true,
        netAmount: true,
      },
    });

    return NextResponse.json({
      revenues,
      total,
      page,
      limit,
      hasMore: skip + revenues.length < total,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalNetRevenue: totalRevenue._sum.netAmount || 0,
    });
  } catch (error) {
    console.error('[REVENUE] Error fetching revenue:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 });
  }
}

/**
 * POST /api/revenue
 * Create a new revenue record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const { success } = await standardLimiter.check(identifier);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const data = await request.json();

    // Create revenue record
    const revenue = await db.revenue.create({
      data: {
        userId: session.user.id,
        source: data.source,
        platform: data.platform,
        amount: data.amount,
        currency: data.currency || 'USD',
        netAmount: data.netAmount,
        songId: data.songId,
        showId: data.showId,
        projectId: data.projectId,
        opportunityId: data.opportunityId,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
        status: data.status || 'paid',
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        taxDeducted: data.taxDeducted,
        feeDeducted: data.feeDeducted,
        notes: data.notes,
        tags: data.tags || [],
      },
      include: {
        song: {
          select: {
            id: true,
            title: true,
          },
        },
        show: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ revenue }, { status: 201 });
  } catch (error) {
    console.error('[REVENUE] Error creating revenue:', error);
    return NextResponse.json({ error: 'Failed to create revenue' }, { status: 500 });
  }
}
