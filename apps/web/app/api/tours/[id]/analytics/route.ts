import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/tours/[id]/analytics
 * Get practical analytics for a tour
 *
 * Features:
 * - Show schedule overview
 * - Attendance tracking (actual data only)
 * - Geographic spread
 * - No fake financial projections
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tour with all shows
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

    // Calculate practical analytics only
    const analytics = calculatePracticalAnalytics(tour);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Tour analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

/**
 * Calculate practical tour analytics - no fake money stuff
 */
function calculatePracticalAnalytics(tour: any) {
  const now = new Date();
  const shows = tour.shows || [];

  const pastShows = shows.filter((show: any) => new Date(show.date) < now);
  const upcomingShows = shows.filter((show: any) => new Date(show.date) >= now);

  // Attendance (actual data only)
  const totalAttendance = pastShows.reduce(
    (sum: number, show: any) => sum + (show.attendance || 0),
    0
  );
  const showsWithAttendance = pastShows.filter((show: any) => show.attendance > 0);
  const averageAttendance =
    showsWithAttendance.length > 0 ? totalAttendance / showsWithAttendance.length : 0;

  // Capacity utilization (for shows with venue capacity data)
  const showsWithCapacity = pastShows.filter(
    (show: any) => show.venue?.capacity && show.attendance
  );
  const averageUtilization =
    showsWithCapacity.length > 0
      ? showsWithCapacity.reduce(
          (sum: number, show: any) => sum + (show.attendance / show.venue.capacity) * 100,
          0
        ) / showsWithCapacity.length
      : null;

  // Geographic spread
  const citiesVisited = new Set(shows.map((show: any) => show.venue?.city).filter(Boolean));
  const statesVisited = new Set(shows.map((show: any) => show.venue?.state).filter(Boolean));

  // Tour progress
  const tourProgress = {
    totalShows: shows.length,
    completedShows: pastShows.length,
    upcomingShows: upcomingShows.length,
    percentComplete: shows.length > 0 ? (pastShows.length / shows.length) * 100 : 0,
  };

  // Next show
  const nextShow = upcomingShows[0] || null;

  return {
    overview: {
      tourName: tour.name,
      status: tour.status,
      startDate: tour.startDate,
      endDate: tour.endDate,
    },
    progress: tourProgress,
    attendance: {
      total: totalAttendance,
      average: Math.round(averageAttendance),
      showsWithData: showsWithAttendance.length,
      utilization: averageUtilization ? Math.round(averageUtilization) : null,
    },
    geographic: {
      totalCities: citiesVisited.size,
      totalStates: statesVisited.size,
      cities: Array.from(citiesVisited),
    },
    nextShow: nextShow
      ? {
          id: nextShow.id,
          name: nextShow.name,
          date: nextShow.date,
          venue: nextShow.venue?.name,
          city: nextShow.venue?.city,
          ticketUrl: nextShow.ticketUrl,
        }
      : null,
  };
}
