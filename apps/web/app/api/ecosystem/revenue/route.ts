import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from '@/lib/auth';
import { prisma } from '@cronkwaters/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all'; // month, quarter, year, all
    const userId = session.user.id;

    // Calculate date range
    let startDate: Date | undefined;
    const now = new Date();

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const where: any = { userId };
    if (startDate) {
      where.earnedDate = { gte: startDate };
    }

    // Fetch revenues
    const revenues = await prisma.revenue.findMany({
      where,
      orderBy: { earnedDate: 'desc' },
      include: {
        song: { select: { id: true, title: true } },
        show: { select: { id: true, name: true, slug: true } },
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    // Calculate totals by source
    const bySource = revenues.reduce(
      (acc, rev) => {
        const source = rev.source;
        if (!acc[source]) {
          acc[source] = { total: 0, count: 0 };
        }
        acc[source].total += Number(rev.amount);
        acc[source].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    // Calculate totals by month (for chart)
    const byMonth = revenues.reduce(
      (acc, rev) => {
        const month = new Date(rev.earnedDate).toISOString().slice(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += Number(rev.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    // Get total
    const total = revenues.reduce((sum, rev) => sum + Number(rev.amount), 0);

    // Format revenues
    const formattedRevenues = revenues.map((rev) => ({
      id: rev.id,
      source: rev.source,
      platform: rev.platform,
      amount: Number(rev.amount),
      netAmount: Number(rev.netAmount) || Number(rev.amount),
      currency: rev.currency,
      earnedDate: rev.earnedDate,
      receivedDate: rev.receivedDate,
      description: rev.description,
      status: rev.status,
      song: rev.song,
      show: rev.show,
      project: rev.project,
    }));

    return NextResponse.json({
      revenues: formattedRevenues,
      totals: {
        total,
        bySource,
        byMonth: Object.entries(byMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, amount]) => ({ month, amount })),
      },
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 });
  }
}

// POST - Log new revenue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      source,
      platform,
      amount,
      netAmount,
      currency,
      earnedDate,
      receivedDate,
      description,
      notes,
      songId,
      showId,
      projectId,
      opportunityId,
    } = body;

    if (!source || !amount || !earnedDate) {
      return NextResponse.json(
        { error: 'Source, amount, and earned date are required' },
        { status: 400 }
      );
    }

    const revenue = await prisma.revenue.create({
      data: {
        userId: session.user.id,
        source,
        platform,
        amount: parseFloat(amount),
        netAmount: netAmount ? parseFloat(netAmount) : null,
        currency: currency || 'USD',
        earnedDate: new Date(earnedDate),
        receivedDate: receivedDate ? new Date(receivedDate) : null,
        description,
        notes,
        songId,
        showId,
        projectId,
        opportunityId,
      },
    });

    // Update musician profile total revenue
    await prisma.musicianProfile.updateMany({
      where: { userId: session.user.id },
      data: {
        totalRevenue: {
          increment: parseFloat(amount),
        },
      },
    });

    // Create activity event
    await prisma.activityEvent.create({
      data: {
        userId: session.user.id,
        type: 'revenue_earned',
        title: `Earned $${parseFloat(amount).toFixed(2)} from ${source}`,
        description: description || `${source} revenue${platform ? ` via ${platform}` : ''}`,
        songId,
        showId,
        projectId,
        visibility: 'private', // Revenue is private by default
      },
    });

    return NextResponse.json({ revenue });
  } catch (error) {
    console.error('Error logging revenue:', error);
    return NextResponse.json({ error: 'Failed to log revenue' }, { status: 500 });
  }
}
