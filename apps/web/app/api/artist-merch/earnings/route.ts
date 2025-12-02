import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Artist Earnings API
 *
 * Tracks artist earnings, sales stats, and payout history.
 */

// GET /api/artist-merch/earnings - Get earnings dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get total earnings (all time)
    const allTimeEarnings = await prisma.artistMerchOrderItem.aggregate({
      where: {
        artistId: session.user.id,
        order: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      _sum: {
        artistEarning: true,
        totalPrice: true,
        quantity: true,
      },
    });

    // Get period earnings
    const periodEarnings = await prisma.artistMerchOrderItem.aggregate({
      where: {
        artistId: session.user.id,
        createdAt: { gte: startDate },
        order: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      _sum: {
        artistEarning: true,
        totalPrice: true,
        quantity: true,
      },
    });

    // Get pending balance (not yet paid out)
    const lastPayout = await prisma.artistMerchPayout.findFirst({
      where: {
        artistId: session.user.id,
        status: 'COMPLETED',
      },
      orderBy: { processedAt: 'desc' },
    });

    const pendingEarnings = await prisma.artistMerchOrderItem.aggregate({
      where: {
        artistId: session.user.id,
        createdAt: { gt: lastPayout?.periodEnd || new Date(0) },
        order: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      _sum: {
        artistEarning: true,
      },
    });

    // Get recent orders
    const recentOrders = await prisma.artistMerchOrderItem.findMany({
      where: {
        artistId: session.user.id,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            customerName: true,
          },
        },
        product: {
          select: {
            name: true,
            thumbnailUrl: true,
          },
        },
        variant: {
          select: {
            size: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get top products
    const topProducts = await prisma.artistMerchProduct.findMany({
      where: {
        artistId: session.user.id,
        salesCount: { gt: 0 },
      },
      orderBy: { salesCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        salesCount: true,
        totalRevenue: true,
        retailPrice: true,
      },
    });

    // Get payout history
    const payouts = await prisma.artistMerchPayout.findMany({
      where: { artistId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate daily earnings for chart (last 30 days)
    const dailyEarnings = await prisma.$queryRaw<{ date: Date; earnings: number; sales: number }[]>`
      SELECT 
        DATE(created_at) as date,
        SUM(artist_earning) as earnings,
        SUM(quantity) as sales
      FROM "ArtistMerchOrderItem"
      WHERE artist_id = ${session.user.id}
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `.catch(() => []);

    return NextResponse.json({
      success: true,
      earnings: {
        allTime: {
          total: allTimeEarnings._sum.artistEarning || 0,
          revenue: allTimeEarnings._sum.totalPrice || 0,
          sales: allTimeEarnings._sum.quantity || 0,
        },
        period: {
          total: periodEarnings._sum.artistEarning || 0,
          revenue: periodEarnings._sum.totalPrice || 0,
          sales: periodEarnings._sum.quantity || 0,
          days: periodDays,
        },
        pending: pendingEarnings._sum.artistEarning || 0,
      },
      recentOrders: recentOrders.map((item) => ({
        id: item.id,
        orderNumber: item.order.orderNumber,
        orderStatus: item.order.status,
        productName: item.product.name,
        productImage: item.product.thumbnailUrl,
        variant: item.variant ? `${item.variant.size} / ${item.variant.color}` : null,
        quantity: item.quantity,
        earning: item.artistEarning,
        customerName: item.order.customerName,
        date: item.createdAt,
      })),
      topProducts,
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        processedAt: p.processedAt,
        ordersCount: p.ordersCount,
      })),
      chart: dailyEarnings,
    });
  } catch (error) {
    console.error('[ARTIST-EARNINGS] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }
}

// POST /api/artist-merch/earnings - Request a payout
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    // Check if user has Stripe Connect set up
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeConnectAccountId: true },
    });

    if (!user?.stripeConnectAccountId) {
      return NextResponse.json(
        {
          error: 'Please connect your Stripe account to receive payouts',
          needsStripeConnect: true,
        },
        { status: 400 }
      );
    }

    // Get last payout
    const lastPayout = await prisma.artistMerchPayout.findFirst({
      where: {
        artistId: session.user.id,
        status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate pending amount
    const pendingEarnings = await prisma.artistMerchOrderItem.aggregate({
      where: {
        artistId: session.user.id,
        createdAt: { gt: lastPayout?.periodEnd || new Date(0) },
        order: {
          status: { in: ['SHIPPED', 'DELIVERED'] }, // Only shipped orders
        },
      },
      _sum: {
        artistEarning: true,
      },
      _count: true,
    });

    const pendingAmount = pendingEarnings._sum.artistEarning || 0;
    const ordersCount = pendingEarnings._count || 0;

    // Minimum payout threshold: $25
    const MIN_PAYOUT = 2500;
    if (pendingAmount < MIN_PAYOUT) {
      return NextResponse.json(
        {
          error: `Minimum payout is $${(MIN_PAYOUT / 100).toFixed(2)}. Current balance: $${(pendingAmount / 100).toFixed(2)}`,
          currentBalance: pendingAmount,
          minimumPayout: MIN_PAYOUT,
        },
        { status: 400 }
      );
    }

    // Check for pending payout request
    const existingPending = await prisma.artistMerchPayout.findFirst({
      where: {
        artistId: session.user.id,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error: 'You have a pending payout request',
          existingPayout: existingPending,
        },
        { status: 400 }
      );
    }

    // Create payout request
    const payout = await prisma.artistMerchPayout.create({
      data: {
        artistId: session.user.id,
        amount: pendingAmount,
        periodStart: lastPayout?.periodEnd || new Date(0),
        periodEnd: new Date(),
        ordersCount,
        status: 'PENDING',
      },
    });

    // TODO: Trigger actual Stripe transfer
    // This would normally be handled by a background job or admin approval

    return NextResponse.json({
      success: true,
      payout,
      message: `Payout request submitted for $${(pendingAmount / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error('[ARTIST-EARNINGS] POST error:', error);
    return NextResponse.json({ error: 'Failed to request payout' }, { status: 500 });
  }
}
