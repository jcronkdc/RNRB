import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/venues
 * List all venues (with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = {};

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const venues = await db.venue.findMany({
      where,
      orderBy: [{ name: 'asc' }],
      take: 100, // Limit results
    });

    return NextResponse.json({ venues });
  } catch (error) {
    console.error('Venues GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

/**
 * POST /api/venues
 * Create a new venue
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type = 'club',
      capacity,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      parkingInfo,
      accessibilityInfo,
      latitude,
      longitude,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Venue name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingVenue = await db.venue.findUnique({
      where: { slug },
    });

    if (existingVenue) {
      return NextResponse.json({ error: 'A venue with this name already exists' }, { status: 400 });
    }

    const venue = await db.venue.create({
      data: {
        name,
        slug,
        type,
        capacity: capacity ? parseInt(capacity) : null,
        address,
        city,
        state,
        country,
        postalCode,
        phone,
        email,
        website,
        parkingInfo,
        accessibilityInfo,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    return NextResponse.json({ venue }, { status: 201 });
  } catch (error) {
    console.error('Venues POST error:', error);
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
  }
}
