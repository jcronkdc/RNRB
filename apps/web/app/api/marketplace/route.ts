import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cronkwaters/db';
import { standardLimiter } from '@/lib/rate-limit';

/**
 * GET /api/marketplace
 * Fetch marketplace listings with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await standardLimiter.check(identifier);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined;
    const listingType = searchParams.get('listingType') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'active',
      expiresAt: { gt: new Date() },
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (listingType) {
      where.listingType = listingType;
    }

    // Fetch listings
    const [listings, total] = await Promise.all([
      db.marketplaceListing.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              favorites: true,
              offers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.marketplaceListing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      limit,
      hasMore: skip + listings.length < total,
    });
  } catch (error) {
    console.error('[MARKETPLACE] Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

/**
 * POST /api/marketplace
 * Create a new marketplace listing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const { success } = await standardLimiter.check(identifier);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const data = await request.json();

    // Create listing
    const listing = await db.marketplaceListing.create({
      data: {
        sellerId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        brand: data.brand,
        model: data.model,
        year: data.year ? parseInt(data.year) : null,
        serialNumber: data.serialNumber,
        condition: data.condition || 'good',
        conditionNotes: data.conditionNotes,
        price: data.price,
        currency: data.currency || 'USD',
        acceptsOffers: data.acceptsOffers ?? true,
        tradeFor: data.tradeFor,
        tradeValue: data.tradeValue,
        listingType: data.listingType || 'sell',
        location: [data.city, data.state, data.country].filter(Boolean).join(', ') || data.location,
        shippingCost: data.shippingCost,
        localPickup: data.localPickup ?? true,
        status: 'active',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('[MARKETPLACE] Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
