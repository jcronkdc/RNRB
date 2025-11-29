import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - Fetch analytics for user's site
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, all

    // Get user's site
    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get page views
    const pageViews = await prisma.sitePageView.findMany({
      where: {
        siteId: site.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get events
    const events = await prisma.siteEvent.findMany({
      where: {
        siteId: site.id,
        createdAt: { gte: startDate },
      },
    });

    // Calculate stats
    const totalViews = pageViews.length;
    const uniqueVisitors = new Set(pageViews.map((pv) => pv.visitorId)).size;

    // Views by day
    const viewsByDay: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const day = pv.createdAt.toISOString().split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    // Top pages
    const pageCount: Record<string, number> = {};
    pageViews.forEach((pv) => {
      pageCount[pv.path] = (pageCount[pv.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Device breakdown
    const deviceCount: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    pageViews.forEach((pv) => {
      const device = pv.deviceType || 'desktop';
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });

    // Country breakdown
    const countryCount: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const country = pv.ipCountry || 'Unknown';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCount)
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Referrer breakdown
    const referrerCount: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const referrer = pv.referrer || 'Direct';
      try {
        const url = new URL(referrer);
        referrerCount[url.hostname] = (referrerCount[url.hostname] || 0) + 1;
      } catch {
        referrerCount[referrer] = (referrerCount[referrer] || 0) + 1;
      }
    });
    const topReferrers = Object.entries(referrerCount)
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Event breakdown
    const eventCount: Record<string, number> = {};
    events.forEach((e) => {
      eventCount[e.eventType] = (eventCount[e.eventType] || 0) + 1;
    });

    // Get subscriber count
    const subscriberCount = await prisma.siteSubscriber.count({
      where: { siteId: site.id, unsubscribed: false },
    });

    // Get contact submissions count
    const contactCount = await prisma.siteContactSubmission.count({
      where: { siteId: site.id, createdAt: { gte: startDate } },
    });

    // Get order stats (if merch enabled)
    const orders = await prisma.merchOrder.findMany({
      where: { siteId: site.id, createdAt: { gte: startDate }, paymentStatus: 'paid' },
    });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;

    return NextResponse.json({
      period,
      overview: {
        totalViews,
        uniqueVisitors,
        subscriberCount,
        contactCount,
        orderCount,
        totalRevenue,
        avgSessionDuration:
          pageViews.length > 0
            ? Math.round(
                pageViews.reduce((sum, pv) => sum + (pv.sessionDuration || 0), 0) / pageViews.length
              )
            : 0,
      },
      viewsByDay: Object.entries(viewsByDay)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topPages,
      devices: deviceCount,
      topCountries,
      topReferrers,
      events: eventCount,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// POST - Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subdomain,
      path,
      referrer,
      visitorId,
      deviceType,
      browser,
      os,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    if (!subdomain || !path || !visitorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const site = await prisma.musicianSite.findUnique({
      where: { subdomain },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Get geo info from IP (simplified - in production use a proper geo service)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    await prisma.sitePageView.create({
      data: {
        siteId: site.id,
        path,
        referrer,
        visitorId,
        deviceType,
        browser,
        os,
        utmSource,
        utmMedium,
        utmCampaign,
        ipCountry: null, // Would need geo lookup service
        ipCity: null,
      },
    });

    // Increment total views on site
    await prisma.musicianSite.update({
      where: { id: site.id },
      data: { totalViews: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track page view:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
