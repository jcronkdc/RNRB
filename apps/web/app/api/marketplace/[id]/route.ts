import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cronkwaters/db';
import { standardLimiter } from '@/lib/rate-limit';

/**
 * GET /api/marketplace/[id]
 * Fetch a single marketplace listing
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success } = await standardLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const listing = await db.marketplaceListing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            createdAt: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            favorites: true,
            offers: true,
            views: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Increment view count
    await db.marketplaceListing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('[MARKETPLACE] Error fetching listing:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

/**
 * PATCH /api/marketplace/[id]
 * Update a marketplace listing
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Rate limiting
    const identifier = session.user.id;
    const { success } = await standardLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Check ownership
    const existing = await db.marketplaceListing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existing.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update listing
    const listing = await db.marketplaceListing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        condition: data.condition,
        conditionNotes: data.conditionNotes,
        isNegotiable: data.isNegotiable,
        acceptsTrade: data.acceptsTrade,
        tradeNotes: data.tradeNotes,
        shippingAvailable: data.shippingAvailable,
        shippingCost: data.shippingCost,
        localPickup: data.localPickup,
        status: data.status,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('[MARKETPLACE] Error updating listing:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

/**
 * DELETE /api/marketplace/[id]
 * Delete a marketplace listing
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check ownership
    const existing = await db.marketplaceListing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existing.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete listing (cascades to images, favorites, etc.)
    await db.marketplaceListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MARKETPLACE] Error deleting listing:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
