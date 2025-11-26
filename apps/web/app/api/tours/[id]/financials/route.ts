import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/tours/[id]/financials
 * Comprehensive financial tracking and reporting
 * 
 * WORLD-CLASS: Professional tour accounting
 * Features:
 * - Revenue tracking by show
 * - Expense categorization
 * - Profit/loss calculations
 * - Payment splits
 * - Tax estimates
 * - Cash flow projections
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tour with financial data
    const tour = await db.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        org: true,
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
      },
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Verify access
    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: tour.orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate comprehensive financials
    const financials = calculateTourFinancials(tour);

    return NextResponse.json({ financials });
  } catch (error) {
    console.error('Tour financials error:', error);
    return NextResponse.json({ error: 'Failed to fetch financials' }, { status: 500 });
  }
}

/**
 * Calculate comprehensive tour financials
 * WORLD-CLASS: Industry-standard accounting metrics
 */
function calculateTourFinancials(tour: any) {
  const now = new Date();
  const pastShows = tour.shows.filter((show: any) => new Date(show.date) < now);
  const upcomingShows = tour.shows.filter((show: any) => new Date(show.date) >= now);

  // Revenue calculation
  const completedRevenue = pastShows.reduce(
    (sum: number, show: any) => sum + (Number(show.grossRevenue) || 0),
    0
  );
  const averageRevenuePerShow =
    pastShows.length > 0 ? completedRevenue / pastShows.length : 0;
  const projectedRevenue = upcomingShows.length * averageRevenuePerShow;
  const totalProjectedRevenue = completedRevenue + projectedRevenue;

  // Attendance metrics
  const completedAttendance = pastShows.reduce(
    (sum: number, show: any) => sum + (show.attendance || 0),
    0
  );
  const averageAttendance =
    pastShows.length > 0 ? completedAttendance / pastShows.length : 0;
  const projectedAttendance = Math.round(upcomingShows.length * averageAttendance);

  // Estimated expenses (industry averages)
  const estimatedExpenses = calculateEstimatedExpenses(tour);

  // Profit/Loss
  const grossProfit = completedRevenue - estimatedExpenses.completed.total;
  const projectedProfit = projectedRevenue - estimatedExpenses.upcoming.total;
  const totalProjectedProfit = grossProfit + projectedProfit;

  // Profit margin
  const profitMargin =
    completedRevenue > 0 ? (grossProfit / completedRevenue) * 100 : 0;

  // Revenue per attendee
  const revenuePerAttendee =
    completedAttendance > 0 ? completedRevenue / completedAttendance : 0;

  // Show-by-show breakdown
  const showBreakdown = pastShows.map((show: any) => {
    const revenue = Number(show.grossRevenue) || 0;
    const estimatedShowExpenses = estimateShowExpenses(show);
    const profit = revenue - estimatedShowExpenses;

    return {
      showId: show.id,
      name: show.name,
      date: show.date,
      venue: show.venue?.name,
      city: show.venue?.city,
      revenue,
      expenses: estimatedShowExpenses,
      profit,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
      attendance: show.attendance,
      revenuePerAttendee:
        show.attendance > 0 ? revenue / show.attendance : 0,
    };
  });

  // Sort shows by profit
  const topProfitableShows = [...showBreakdown]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);
  const leastProfitableShows = [...showBreakdown]
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 5);

  // Cash flow timeline
  const cashFlow = generateCashFlowTimeline(tour.shows, now);

  // Tax estimates removed - users should consult their accountant
  // This is tour planning software, not tax software

  // Financial health indicators
  const healthIndicators = {
    profitMargin: {
      value: profitMargin,
      status: profitMargin >= 30 ? 'excellent' : profitMargin >= 20 ? 'good' : profitMargin >= 10 ? 'fair' : 'poor',
      benchmark: '30%+ is excellent for touring',
    },
    revenueGrowth: {
      value: calculateRevenueGrowth(pastShows),
      status: calculateRevenueGrowth(pastShows) > 10 ? 'growing' : calculateRevenueGrowth(pastShows) < -10 ? 'declining' : 'stable',
    },
    cashPosition: {
      value: completedRevenue - estimatedExpenses.completed.total,
      status:
        completedRevenue - estimatedExpenses.completed.total > 0
          ? 'positive'
          : 'negative',
    },
  };

  return {
    overview: {
      tourName: tour.name,
      status: tour.status,
      totalShows: tour.shows.length,
      completedShows: pastShows.length,
      upcomingShows: upcomingShows.length,
    },
    revenue: {
      completed: completedRevenue,
      projected: projectedRevenue,
      total: totalProjectedRevenue,
      averagePerShow: averageRevenuePerShow,
      perAttendee: revenuePerAttendee,
    },
    expenses: estimatedExpenses,
    profitLoss: {
      completed: grossProfit,
      projected: projectedProfit,
      total: totalProjectedProfit,
      margin: profitMargin,
    },
    attendance: {
      completed: completedAttendance,
      projected: projectedAttendance,
      averagePerShow: averageAttendance,
    },
    showBreakdown,
    topPerformers: {
      mostProfitable: topProfitableShows,
      leastProfitable: leastProfitableShows,
    },
    cashFlow,
    healthIndicators,
    recommendations: generateFinancialRecommendations(healthIndicators, showBreakdown),
    disclaimer: 'PLANNING ESTIMATES ONLY - These are industry-standard percentages, not actual expenses. Track real costs for accurate accounting.',
  };
}

/**
 * Calculate estimated expenses
 * Uses industry-standard percentages
 */
function calculateEstimatedExpenses(tour: any) {
  const now = new Date();
  const pastShows = tour.shows.filter((show: any) => new Date(show.date) < now);
  const upcomingShows = tour.shows.filter((show: any) => new Date(show.date) >= now);

  const completedRevenue = pastShows.reduce(
    (sum: number, show: any) => sum + (Number(show.grossRevenue) || 0),
    0
  );
  const projectedRevenue = upcomingShows.reduce(
    (sum: number, show: any) => sum + (Number(show.grossRevenue) || 0),
    0
  );

  // Industry-standard expense percentages
  const expenseRates = {
    venueRental: 0.15, // 15% of gross
    production: 0.2, // 20% (sound, lights, stage)
    crew: 0.15, // 15% (tour manager, sound engineer, etc.)
    travel: 0.1, // 10% (transport, fuel)
    accommodation: 0.1, // 10%
    marketing: 0.05, // 5%
    misc: 0.05, // 5%
  };

  const completed = {
    venueRental: completedRevenue * expenseRates.venueRental,
    production: completedRevenue * expenseRates.production,
    crew: completedRevenue * expenseRates.crew,
    travel: completedRevenue * expenseRates.travel,
    accommodation: completedRevenue * expenseRates.accommodation,
    marketing: completedRevenue * expenseRates.marketing,
    misc: completedRevenue * expenseRates.misc,
    total: completedRevenue * Object.values(expenseRates).reduce((sum, rate) => sum + rate, 0),
  };

  const upcoming = {
    venueRental: projectedRevenue * expenseRates.venueRental,
    production: projectedRevenue * expenseRates.production,
    crew: projectedRevenue * expenseRates.crew,
    travel: projectedRevenue * expenseRates.travel,
    accommodation: projectedRevenue * expenseRates.accommodation,
    marketing: projectedRevenue * expenseRates.marketing,
    misc: projectedRevenue * expenseRates.misc,
    total: projectedRevenue * Object.values(expenseRates).reduce((sum, rate) => sum + rate, 0),
  };

  return {
    completed,
    upcoming,
    total: {
      venueRental: completed.venueRental + upcoming.venueRental,
      production: completed.production + upcoming.production,
      crew: completed.crew + upcoming.crew,
      travel: completed.travel + upcoming.travel,
      accommodation: completed.accommodation + upcoming.accommodation,
      marketing: completed.marketing + upcoming.marketing,
      misc: completed.misc + upcoming.misc,
      total: completed.total + upcoming.total,
    },
    note: 'Estimates based on industry averages. Track actual expenses for accurate reporting.',
  };
}

/**
 * Estimate expenses for a single show
 */
function estimateShowExpenses(show: any): number {
  const revenue = Number(show.grossRevenue) || 0;
  // Total expense rate: 80% of gross (20% profit margin)
  return revenue * 0.8;
}

/**
 * Generate cash flow timeline
 */
function generateCashFlowTimeline(shows: any[], now: Date) {
  const timeline: any[] = [];
  let runningBalance = 0;

  shows
    .filter((show: any) => new Date(show.date) < now)
    .forEach((show: any) => {
      const revenue = Number(show.grossRevenue) || 0;
      const expenses = estimateShowExpenses(show);
      const netCashFlow = revenue - expenses;
      runningBalance += netCashFlow;

      timeline.push({
        date: show.date,
        showName: show.name,
        revenue,
        expenses,
        netCashFlow,
        runningBalance,
      });
    });

  return timeline;
}

/**
 * Calculate revenue growth rate
 */
function calculateRevenueGrowth(shows: any[]): number {
  if (shows.length < 2) return 0;

  const sorted = [...shows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

  const firstHalfAvg =
    firstHalf.reduce((sum, show) => sum + (Number(show.grossRevenue) || 0), 0) /
    firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, show) => sum + (Number(show.grossRevenue) || 0), 0) /
    secondHalf.length;

  return ((secondHalfAvg - firstHalfAvg) / Math.max(firstHalfAvg, 1)) * 100;
}

/**
 * Generate financial recommendations
 */
function generateFinancialRecommendations(
  healthIndicators: any,
  showBreakdown: any[]
): string[] {
  const recommendations: string[] = [];

  // Profit margin recommendations
  if (healthIndicators.profitMargin.value < 20) {
    recommendations.push(
      `💰 Profit margin is ${healthIndicators.profitMargin.value.toFixed(1)}%. Aim for 30%+ by negotiating better venue deals or reducing expenses.`
    );
  }

  // Revenue growth recommendations
  if (healthIndicators.revenueGrowth.status === 'declining') {
    recommendations.push(
      '📉 Revenue is declining. Consider playing larger venues in proven markets or increasing ticket prices.'
    );
  }

  // Cash flow recommendations
  if (healthIndicators.cashPosition.status === 'negative') {
    recommendations.push(
      '⚠️ Negative cash flow. Secure advance deposits from venues and negotiate better payment terms.'
    );
  }

  // Show performance recommendations
  if (showBreakdown.length > 0) {
    const avgProfit =
      showBreakdown.reduce((sum, show) => sum + show.profit, 0) / showBreakdown.length;
    const lowPerformers = showBreakdown.filter((show) => show.profit < avgProfit * 0.5);

    if (lowPerformers.length > 0) {
      recommendations.push(
        `🎯 ${lowPerformers.length} shows significantly underperformed. Analyze these markets before booking return dates.`
      );
    }
  }

  // General best practices
  if (recommendations.length === 0) {
    recommendations.push(
      '✅ Financial health looks good! Continue monitoring expenses and maximizing revenue in top markets.'
    );
  }

  return recommendations;
}

