import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-options';
import { prisma } from '@repo/db';

// GET /api/ecosystem/opportunities - List opportunities with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const compensation = searchParams.get('compensation');
    const isRemote = searchParams.get('isRemote');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: any = {
      status: 'open',
    };

    if (type && type !== 'all') {
      where.type = type;
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (compensation) {
      where.compensation = compensation;
    }

    if (isRemote === 'true') {
      where.isRemote = true;
    }

    // Fetch opportunities
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        include: {
          postedBy: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.opportunity.count({ where }),
    ]);

    return NextResponse.json({
      opportunities,
      total,
      hasMore: offset + opportunities.length < total,
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

// POST /api/ecosystem/opportunities - Create a new opportunity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to post opportunities' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
    }

    // Create opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        postedById: session.user.id,
        orgId: body.orgId || null,
        type: body.type,
        title: body.title,
        description: body.description || null,

        // Requirements
        instruments: body.instruments || [],
        genres: body.genres || [],
        skills: body.skills || [],
        experienceLevel: body.experienceLevel || null,

        // Compensation
        compensation: body.compensation || 'unpaid',
        payAmount: body.payAmount ? parseFloat(body.payAmount) : null,
        payType: body.payType || null,
        payDetails: body.payDetails || null,

        // Location
        isRemote: body.isRemote || false,
        location: body.location || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || null,
        venueId: body.venueId || null,

        // Timing
        date: body.date ? new Date(body.date) : null,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        deadline: body.deadline ? new Date(body.deadline) : null,

        // Details
        dressCode: body.dressCode || null,
        additionalInfo: body.additionalInfo || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        applicationUrl: body.applicationUrl || null,

        // Settings
        allowApplications: body.allowApplications ?? true,
        status: 'open',
        isPinned: false,
      },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    // Create activity event
    await prisma.activityEvent.create({
      data: {
        userId: session.user.id,
        type: 'opportunity_posted',
        entityType: 'opportunity',
        entityId: opportunity.id,
        metadata: {
          opportunityType: opportunity.type,
          title: opportunity.title,
        },
      },
    });

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
