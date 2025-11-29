import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/tours/[id]/export
 * Export tour data in multiple formats
 *
 * WORLD-CLASS: Professional export capabilities
 * Formats: CSV, JSON, PDF-ready data
 * Includes: Shows, venues, financials, setlists, analytics
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, pdf-data

    // Get comprehensive tour data
    const tour = await db.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        shows: {
          include: {
            venue: true,
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
                  orderBy: { position: 'asc' },
                },
              },
            },
            project: {
              select: {
                id: true,
                name: true,
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

    // Format data based on requested format
    if (format === 'csv') {
      const csv = convertToCSV(tour);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${tour.slug}-export.csv"`,
        },
      });
    } else if (format === 'pdf-data') {
      // Return structured data optimized for PDF generation
      const pdfData = preparePDFData(tour);
      return NextResponse.json(pdfData);
    } else {
      // Default JSON format
      return NextResponse.json({
        tour,
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
      });
    }
  } catch (error) {
    console.error('Tour export error:', error);
    return NextResponse.json({ error: 'Failed to export tour' }, { status: 500 });
  }
}

/**
 * Convert tour data to CSV format
 * WORLD-CLASS: Comprehensive CSV with all important data
 */
function convertToCSV(tour: any): string {
  const lines: string[] = [];

  // Header
  lines.push('# Tour Export');
  lines.push(`# Tour: ${tour.name}`);
  lines.push(`# Organization: ${tour.org.name}`);
  lines.push(`# Start Date: ${tour.startDate}`);
  lines.push(`# End Date: ${tour.endDate || 'TBD'}`);
  lines.push(`# Status: ${tour.status}`);
  lines.push(`# Exported: ${new Date().toISOString()}`);
  lines.push('');

  // Shows data
  lines.push('Show Data');
  lines.push(
    'Date,Show Name,Venue,City,State,Country,Status,Doors Time,Soundcheck Time,Ticket URL,Attendance,Gross Revenue,Capacity,Utilization %,Set Length,Songs Played'
  );

  tour.shows.forEach((show: any) => {
    const utilization =
      show.venue?.capacity && show.attendance
        ? ((show.attendance / show.venue.capacity) * 100).toFixed(1)
        : '';
    const songsPlayed = show.setlist?.items?.length || 0;

    lines.push(
      [
        show.date,
        `"${show.name}"`,
        `"${show.venue?.name || ''}"`,
        show.venue?.city || '',
        show.venue?.state || '',
        show.venue?.country || '',
        show.status,
        show.doorsTime || '',
        show.soundcheckTime || '',
        show.ticketUrl || '',
        show.attendance || '',
        show.grossRevenue || '',
        show.venue?.capacity || '',
        utilization,
        show.setLength || '',
        songsPlayed,
      ].join(',')
    );
  });

  lines.push('');

  // Financial summary
  lines.push('Financial Summary');
  lines.push('Metric,Value');

  const totalRevenue = tour.shows.reduce(
    (sum: number, show: any) => sum + (Number(show.grossRevenue) || 0),
    0
  );
  const showsWithRevenue = tour.shows.filter((show: any) => show.grossRevenue);
  const avgRevenue = showsWithRevenue.length > 0 ? totalRevenue / showsWithRevenue.length : 0;

  lines.push(`Total Gross Revenue,$${totalRevenue.toFixed(2)}`);
  lines.push(`Total Shows,${tour.shows.length}`);
  lines.push(`Shows with Revenue Data,${showsWithRevenue.length}`);
  lines.push(`Average Revenue per Show,$${avgRevenue.toFixed(2)}`);

  lines.push('');

  // Venue summary
  lines.push('Venue Summary');
  lines.push('Venue,City,State,Shows,Total Attendance,Total Revenue');

  const venueStats: { [venueId: string]: any } = {};
  tour.shows.forEach((show: any) => {
    if (show.venue) {
      if (!venueStats[show.venue.id]) {
        venueStats[show.venue.id] = {
          name: show.venue.name,
          city: show.venue.city,
          state: show.venue.state,
          shows: 0,
          attendance: 0,
          revenue: 0,
        };
      }
      venueStats[show.venue.id].shows++;
      venueStats[show.venue.id].attendance += show.attendance || 0;
      venueStats[show.venue.id].revenue += Number(show.grossRevenue) || 0;
    }
  });

  Object.values(venueStats).forEach((venue: any) => {
    lines.push(
      [
        `"${venue.name}"`,
        venue.city,
        venue.state,
        venue.shows,
        venue.attendance,
        `$${venue.revenue.toFixed(2)}`,
      ].join(',')
    );
  });

  return lines.join('\n');
}

/**
 * Prepare data optimized for PDF generation
 * WORLD-CLASS: Structured data perfect for PDF reports
 */
function preparePDFData(tour: any) {
  // Calculate comprehensive metrics
  const totalRevenue = tour.shows.reduce(
    (sum: number, show: any) => sum + (Number(show.grossRevenue) || 0),
    0
  );
  const totalAttendance = tour.shows.reduce(
    (sum: number, show: any) => sum + (show.attendance || 0),
    0
  );

  const now = new Date();
  const pastShows = tour.shows.filter((show: any) => new Date(show.date) < now);
  const upcomingShows = tour.shows.filter((show: any) => new Date(show.date) >= now);

  // City performance
  const cityStats: { [city: string]: any } = {};
  tour.shows.forEach((show: any) => {
    const city = show.venue?.city || 'Unknown';
    if (!cityStats[city]) {
      cityStats[city] = {
        city,
        state: show.venue?.state,
        shows: 0,
        attendance: 0,
        revenue: 0,
      };
    }
    cityStats[city].shows++;
    cityStats[city].attendance += show.attendance || 0;
    cityStats[city].revenue += Number(show.grossRevenue) || 0;
  });

  const topCities = Object.values(cityStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    tour: {
      name: tour.name,
      organization: tour.org.name,
      startDate: tour.startDate,
      endDate: tour.endDate,
      status: tour.status,
      description: tour.description,
    },
    summary: {
      totalShows: tour.shows.length,
      completedShows: pastShows.length,
      upcomingShows: upcomingShows.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalAttendance,
      averageRevenue:
        pastShows.length > 0 ? Number((totalRevenue / pastShows.length).toFixed(2)) : 0,
      averageAttendance: pastShows.length > 0 ? Math.round(totalAttendance / pastShows.length) : 0,
    },
    shows: tour.shows.map((show: any) => ({
      date: show.date,
      name: show.name,
      venue: {
        name: show.venue?.name,
        city: show.venue?.city,
        state: show.venue?.state,
        capacity: show.venue?.capacity,
      },
      status: show.status,
      attendance: show.attendance,
      revenue: Number(show.grossRevenue) || 0,
      utilization:
        show.venue?.capacity && show.attendance
          ? Number(((show.attendance / show.venue.capacity) * 100).toFixed(1))
          : null,
      setlist: show.setlist?.items?.map((item: any) => ({
        position: item.position,
        song: item.song?.title || item.customTitle,
        isEncore: item.isEncore,
      })),
    })),
    topMarkets: topCities,
    exportedAt: new Date().toISOString(),
  };
}
