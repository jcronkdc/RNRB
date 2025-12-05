import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    // Get affiliate profile
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: session.user.id },
      include: {
        referrals: {
          where: {
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        payouts: {
          where: {
            createdAt: { gte: startDate },
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 });
    }

    // Calculate stats
    const totalEarnings = Number(affiliate.lifetimeEarnings);
    const pendingEarnings = Number(affiliate.pendingEarnings);
    const totalClicks = affiliate.totalClicks;
    const totalConversions = affiliate.referrals.length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Get active referrals count (users who are still subscribed)
    const activeReferrals = await prisma.affiliateReferral.count({
      where: {
        affiliateId: affiliate.id,
        status: 'converted',
      },
    });

    // Calculate monthly earnings for chart
    const monthlyEarnings = await calculateMonthlyEarnings(affiliate.id, startDate);

    // Format recent referrals
    const recentReferrals = affiliate.referrals.map(
      (ref: (typeof affiliate.referrals)[0] & { referredUser?: { email?: string | null } }) => ({
        email: maskEmail(ref.referredUser?.email || 'unknown'),
        date: ref.createdAt.toISOString().split('T')[0],
        plan: ref.subscriptionTier || 'Creator',
        commission: Number(ref.commissionEarned || 0),
      })
    );

    return NextResponse.json({
      totalEarnings,
      pendingEarnings,
      totalClicks,
      totalConversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      activeReferrals,
      currentTier: affiliate.tier,
      affiliateCode: affiliate.code,
      monthlyEarnings,
      recentReferrals,
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate stats' }, { status: 500 });
  }
}

async function calculateMonthlyEarnings(affiliateId: string, startDate: Date) {
  const referrals = await prisma.affiliateReferral.findMany({
    where: {
      affiliateId,
      createdAt: { gte: startDate },
    },
    select: {
      commissionEarned: true,
      createdAt: true,
    },
  });

  // Group by month
  const monthlyMap = new Map<string, number>();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  referrals.forEach((ref) => {
    const month = months[ref.createdAt.getMonth()];
    const current = monthlyMap.get(month) || 0;
    monthlyMap.set(month, current + Number(ref.commissionEarned || 0));
  });

  // Return last 5 months
  const result: { month: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = months[date.getMonth()];
    result.push({
      month,
      amount: monthlyMap.get(month) || 0,
    });
  }

  return result;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';
  return `${local[0]}***@${domain}`;
}
