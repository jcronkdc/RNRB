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
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const type = searchParams.get('type');
    const city = searchParams.get('city');

    // Get user's profile for matching
    const profile = await prisma.musicianProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        instruments: true,
        genres: true,
        skills: true,
        location: true,
      },
    });

    // Build filter
    const where: any = {
      status: 'open',
      visibility: 'public',
    };

    if (type) {
      where.type = type;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Fetch opportunities
    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        venue: {
          select: {
            name: true,
            city: true,
          },
        },
      },
    });

    // Format for frontend
    const formattedOpportunities = opportunities.map((opp) => ({
      id: opp.id,
      type: opp.type,
      title: opp.title,
      description: opp.description,
      location: opp.venue?.city || opp.city || (opp.isRemote ? 'Remote' : null),
      date: opp.startDate?.toISOString().split('T')[0],
      isPaid: opp.compensation === 'paid',
      payAmount: Number(opp.payAmount) || null,
      compensation: opp.compensation,
      instruments: opp.instruments,
      genres: opp.genres,
      postedBy: opp.postedBy,
      venue: opp.venue,
    }));

    return NextResponse.json({
      opportunities: formattedOpportunities,
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

// POST - Create a new opportunity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      description,
      instruments,
      genres,
      skills,
      experienceLevel,
      compensation,
      payAmount,
      payType,
      payDetails,
      isRemote,
      location,
      city,
      state,
      country,
      venueId,
      startDate,
      endDate,
      isOngoing,
      positionsAvailable,
    } = body;

    if (!type || !title || !compensation) {
      return NextResponse.json(
        { error: 'Type, title, and compensation are required' },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        postedById: session.user.id,
        type,
        title,
        description,
        instruments: instruments || [],
        genres: genres || [],
        skills: skills || [],
        experienceLevel,
        compensation,
        payAmount: payAmount ? parseFloat(payAmount) : null,
        payType,
        payDetails,
        isRemote: isRemote ?? false,
        location,
        city,
        state,
        country,
        venueId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isOngoing: isOngoing ?? false,
        positionsAvailable: positionsAvailable || 1,
      },
    });

    // Create activity event
    await prisma.activityEvent.create({
      data: {
        userId: session.user.id,
        type: 'opportunity_posted',
        title: `Posted opportunity: "${title}"`,
        opportunityId: opportunity.id,
        visibility: 'public',
      },
    });

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
