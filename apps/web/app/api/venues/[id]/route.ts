import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/venues/[id]
 * Get a single venue by ID or slug
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const venue = await db.venue.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        shows: {
          orderBy: { date: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            date: true,
            status: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Venue GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 });
  }
}

/**
 * PATCH /api/venues/[id]
 * Update a venue
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
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

    // Check if venue exists
    const existingVenue = await db.venue.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
      // Regenerate slug if name changed
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = capacity ? parseInt(capacity) : null;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (website !== undefined) updateData.website = website;
    if (parkingInfo !== undefined) updateData.parkingInfo = parkingInfo;
    if (accessibilityInfo !== undefined) updateData.accessibilityInfo = accessibilityInfo;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

    const venue = await db.venue.update({
      where: { id: existingVenue.id },
      data: updateData,
    });

    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Venue PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 });
  }
}

/**
 * DELETE /api/venues/[id]
 * Delete a venue
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if venue exists
    const existingVenue = await db.venue.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        shows: true,
      },
    });

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Check if venue has shows
    if (existingVenue.shows.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete venue with existing shows. Delete shows first.' },
        { status: 400 }
      );
    }

    await db.venue.delete({
      where: { id: existingVenue.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Venue DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 });
  }
}
