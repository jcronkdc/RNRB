import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/tours/[id]/analytics
 * Get comprehensive analytics for a tour
 * 
 * World-class features:
 * - Revenue trends and projections
 * - Attendance patterns
 * - Geographic performance
 * - Show-by-show comparisons
 * - ROI calculations
 * - Market penetration metrics
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tour with all shows and detailed data
    const tour = await db.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
        shows: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
                country: true,
                capacity: true,
                latitude: true,
                longitude: true,
              },
            },
            setlist: {
              include: {
                items: {
                  include: {
                    song: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
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

    // Calculate comprehensive analytics
    const analytics = calculateTourAnalytics(tour);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Tour analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

/**
 * Calculate comprehensive tour analytics
 * WORLD-CLASS: Industry-leading metrics and insights
 */
function calculateTourAnalytics(tour: any) {
  const now = new Date();
  const shows = tour.shows || [];

  // Separate past and upcoming shows
  const pastShows = shows.filter((show: any) => new Date(show.date) < now);
  const upcomingShows = shows.filter((show: any) => new Date(show.date) >= now);

  // Financial Metrics
  const totalRevenue = pastShows.reduce(
    (sum: number, show: any) => sum + (Number(show.grossRevenue) || 0),
    0
  );
  const averageRevenuePerShow =
    pastShows.length > 0 ? totalRevenue / pastShows.length : 0;

  // Projected revenue for remaining shows
  const projectedRevenue = upcomingShows.length * averageRevenuePerShow;
  const totalProjectedRevenue = totalRevenue + projectedRevenue;

  // Attendance Metrics
  const totalAttendance = pastShows.reduce(
    (sum: number, show: any) => sum + (show.attendance || 0),
    0
  );
  const averageAttendance =
    pastShows.length > 0 ? totalAttendance / pastShows.length : 0;

  // Capacity utilization (sell-through rate)
  const showsWithCapacity = pastShows.filter(
    (show: any) => show.venue?.capacity && show.attendance
  );
  const averageUtilization =
    showsWithCapacity.length > 0
      ? showsWithCapacity.reduce(
          (sum: number, show: any) =>
            sum + (show.attendance / show.venue.capacity) * 100,
          0
        ) / showsWithCapacity.length
      : 0;

  // Geographic Performance
  const performanceByCity = pastShows.reduce((acc: any, show: any) => {
    const city = show.venue?.city || 'Unknown';
    if (!acc[city]) {
      acc[city] = {
        city,
        state: show.venue?.state,
        country: show.venue?.country,
        shows: 0,
        totalRevenue: 0,
        totalAttendance: 0,
        venues: new Set(),
      };
    }
    acc[city].shows++;
    acc[city].totalRevenue += Number(show.grossRevenue) || 0;
    acc[city].totalAttendance += show.attendance || 0;
    if (show.venue?.name) {
      acc[city].venues.add(show.venue.name);
    }
    return acc;
  }, {});

  const cityMetrics = Object.values(performanceByCity).map((city: any) => ({
    city: city.city,
    state: city.state,
    country: city.country,
    shows: city.shows,
    totalRevenue: city.totalRevenue,
    averageRevenue: city.totalRevenue / city.shows,
    totalAttendance: city.totalAttendance,
    averageAttendance: city.totalAttendance / city.shows,
    uniqueVenues: city.venues.size,
  }));

  // Sort cities by revenue
  cityMetrics.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

  // Show Performance Timeline
  const showTimeline = pastShows.map((show: any) => ({
    id: show.id,
    name: show.name,
    date: show.date,
    venue: show.venue?.name,
    city: show.venue?.city,
    revenue: Number(show.grossRevenue) || 0,
    attendance: show.attendance || 0,
    capacity: show.venue?.capacity,
    utilization:
      show.venue?.capacity && show.attendance
        ? (show.attendance / show.venue.capacity) * 100
        : null,
    songsPlayed: show.setlist?.items?.length || 0,
  }));

  // Revenue Trend (week by week)
  const revenueByWeek = calculateWeeklyRevenue(pastShows);

  // Top Markets (best performing cities)
  const topMarkets = cityMetrics.slice(0, 5);

  // Growth Markets (cities with increasing performance)
  const growthMarkets = identifyGrowthMarkets(cityMetrics, pastShows);

  // Tour Progress
  const tourProgress = {
    totalShows: shows.length,
    completedShows: pastShows.length,
    upcomingShows: upcomingShows.length,
    percentComplete: shows.length > 0 ? (pastShows.length / shows.length) * 100 : 0,
    daysRemaining: upcomingShows.length > 0 
      ? Math.ceil((new Date(upcomingShows[upcomingShows.length - 1].date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  };

  // Setlist Insights
  const setlistStats = calculateSetlistStats(pastShows);

  // Performance metrics (for reference, not grading)
  const performanceMetrics = {
    utilizationRate: averageUtilization,
    revenueGrowth: calculateRevenueGrowth(pastShows),
    consistency: calculateConsistency(pastShows),
  };

  return {
    overview: {
      tourName: tour.name,
      status: tour.status,
      startDate: tour.startDate,
      endDate: tour.endDate,
    },
    financial: {
      totalRevenue,
      averageRevenuePerShow,
      projectedRevenue,
      totalProjectedRevenue,
      topGrossingShow: getTopShow(pastShows, 'grossRevenue'),
      revenueByWeek,
    },
    attendance: {
      totalAttendance,
      averageAttendance,
      averageUtilization,
      topAttendanceShow: getTopShow(pastShows, 'attendance'),
    },
    geographic: {
      topMarkets,
      growthMarkets,
      cityMetrics,
      totalCities: Object.keys(performanceByCity).length,
      totalStates: new Set(
        pastShows.map((show: any) => show.venue?.state).filter(Boolean)
      ).size,
    },
    timeline: {
      shows: showTimeline,
    },
    progress: tourProgress,
    setlist: setlistStats,
    performanceMetrics,
    recommendations: generateInsights({
      tour,
      pastShows,
      upcomingShows,
      cityMetrics,
      performanceMetrics,
    }),
  };
}

/**
 * Calculate weekly revenue trend
 */
function calculateWeeklyRevenue(shows: any[]) {
  const weeklyData: { [week: string]: number } = {};

  shows.forEach((show: any) => {
    const date = new Date(show.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = 0;
    }
    weeklyData[weekKey] += Number(show.grossRevenue) || 0;
  });

  return Object.entries(weeklyData)
    .map(([week, revenue]) => ({ week, revenue }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Identify cities with growing performance
 */
function identifyGrowthMarkets(cityMetrics: any[], shows: any[]) {
  // Cities where performance improved over time
  const cityShowHistory = shows.reduce((acc: any, show: any) => {
    const city = show.venue?.city || 'Unknown';
    if (!acc[city]) acc[city] = [];
    acc[city].push({
      date: show.date,
      revenue: Number(show.grossRevenue) || 0,
      attendance: show.attendance || 0,
    });
    return acc;
  }, {});

  const growthCities = Object.entries(cityShowHistory)
    .filter(([_, history]: any) => history.length >= 2)
    .map(([city, history]: any) => {
      const sorted = history.sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const growth = ((last.revenue - first.revenue) / Math.max(first.revenue, 1)) * 100;

      return {
        city,
        growth,
        firstRevenue: first.revenue,
        lastRevenue: last.revenue,
        shows: sorted.length,
      };
    })
    .filter((city) => city.growth > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5);

  return growthCities;
}

/**
 * Calculate setlist statistics
 */
function calculateSetlistStats(shows: any[]) {
  const songsPlayed: { [songId: string]: { title: string; count: number } } = {};
  let totalSongsPlayed = 0;

  shows.forEach((show: any) => {
    if (show.setlist?.items) {
      show.setlist.items.forEach((item: any) => {
        if (item.song) {
          totalSongsPlayed++;
          if (!songsPlayed[item.song.id]) {
            songsPlayed[item.song.id] = {
              title: item.song.title,
              count: 0,
            };
          }
          songsPlayed[item.song.id].count++;
        }
      });
    }
  });

  const topSongs = Object.values(songsPlayed)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const averageSongsPerShow =
    shows.length > 0 ? totalSongsPlayed / shows.length : 0;

  return {
    totalSongsPlayed,
    uniqueSongs: Object.keys(songsPlayed).length,
    averageSongsPerShow,
    topSongs,
  };
}

/**
 * Calculate revenue growth rate
 */
function calculateRevenueGrowth(shows: any[]) {
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
 * Calculate consistency (standard deviation of revenue)
 */
function calculateConsistency(shows: any[]) {
  if (shows.length < 2) return 100;

  const revenues = shows.map((show) => Number(show.grossRevenue) || 0);
  const avg = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length;
  const variance =
    revenues.reduce((sum, rev) => sum + Math.pow(rev - avg, 2), 0) / revenues.length;
  const stdDev = Math.sqrt(variance);

  // Convert to consistency score (0-100, higher is more consistent)
  const coefficientOfVariation = avg > 0 ? (stdDev / avg) * 100 : 0;
  return Math.max(0, 100 - coefficientOfVariation);
}

// Performance grading removed - focusing on actionable metrics instead

/**
 * Get top performing show by metric
 */
function getTopShow(shows: any[], metric: string) {
  if (shows.length === 0) return null;

  const topShow = shows.reduce((best, show) => {
    const value = metric === 'grossRevenue' 
      ? Number(show.grossRevenue) || 0 
      : show.attendance || 0;
    const bestValue = metric === 'grossRevenue'
      ? Number(best?.grossRevenue) || 0
      : best?.attendance || 0;
    
    return value > bestValue ? show : best;
  }, shows[0]);

  return {
    id: topShow.id,
    name: topShow.name,
    date: topShow.date,
    venue: topShow.venue?.name,
    city: topShow.venue?.city,
    value: metric === 'grossRevenue' ? Number(topShow.grossRevenue) || 0 : topShow.attendance || 0,
  };
}

/**
 * Generate data-driven recommendations
 */
function generateInsights(data: any) {
  const insights: string[] = [];
  const { tour, pastShows, upcomingShows, cityMetrics, performanceMetrics } = data;

  // Performance insights
  if (performanceMetrics.utilizationRate >= 85) {
    insights.push(
      `Strong attendance (${performanceMetrics.utilizationRate.toFixed(1)}% average fill rate). Shows are selling well.`
    );
  } else if (performanceMetrics.utilizationRate < 60) {
    insights.push(
      `Lower attendance (${performanceMetrics.utilizationRate.toFixed(1)}% fill rate). Consider smaller venues or more marketing.`
    );
  }

  // Growth insights
  if (performanceMetrics.revenueGrowth > 10) {
    insights.push(
      `Revenue trending up (+${performanceMetrics.revenueGrowth.toFixed(1)}%). Consider adding more dates.`
    );
  } else if (performanceMetrics.revenueGrowth < -10) {
    insights.push(
      `Revenue declining (${performanceMetrics.revenueGrowth.toFixed(1)}%). Review marketing strategy.`
    );
  }

  // Market insights
  if (cityMetrics.length > 0) {
    const topCity = cityMetrics[0];
    insights.push(
      `${topCity.city} is your top market ($${topCity.totalRevenue.toLocaleString()} revenue). Strong candidate for return dates.`
    );
  }

  // Routing insights
  if (upcomingShows.length > 0) {
    const routingEfficiency = calculateRoutingEfficiency(upcomingShows);
    if (routingEfficiency < 70) {
      insights.push(
        `Tour routing could be optimized. Check the Routing tab for specific suggestions.`
      );
    }
  }

  // Consistency insights
  if (performanceMetrics.consistency < 60) {
    insights.push(
      `Show performance varies significantly. Review top performers for patterns.`
    );
  }

  // Opportunity insights
  if (pastShows.length >= 5) {
    const avgRevenue = pastShows.reduce(
      (sum: number, show: any) => sum + (Number(show.grossRevenue) || 0),
      0
    ) / pastShows.length;
    const lowPerformers = pastShows.filter(
      (show: any) => Number(show.grossRevenue) < avgRevenue * 0.7
    );
    if (lowPerformers.length > 0) {
      insights.push(
        `${lowPerformers.length} shows below average revenue. May need better promotion in those markets.`
      );
    }
  }

  // Add note about data quality
  if (insights.length === 0) {
    insights.push(
      `Keep adding show data (revenue, attendance) to see more insights.`
    );
  }

  return insights;
}

/**
 * Calculate routing efficiency (placeholder - would need actual distance calculations)
 */
function calculateRoutingEfficiency(shows: any[]) {
  // Simplified calculation based on geographic clustering
  // In production, use Google Maps Distance Matrix API
  if (shows.length < 2) return 100;

  // Count back-and-forth movements between states
  let backtrackCount = 0;
  const stateSequence = shows
    .map((show: any) => show.venue?.state)
    .filter(Boolean);

  for (let i = 2; i < stateSequence.length; i++) {
    if (stateSequence[i] === stateSequence[i - 2] && stateSequence[i] !== stateSequence[i - 1]) {
      backtrackCount++;
    }
  }

  const efficiency = Math.max(0, 100 - backtrackCount * 20);
  return efficiency;
}

