import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Public Merch Catalog API
 *
 * GET /api/merch/catalog - Get all published artist merch products
 *
 * This endpoint returns products that are:
 * - Published (isPublished = true)
 * - Active (status = 'ACTIVE')
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const artistId = searchParams.get('artistId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Build where clause
    const where: any = {
      isPublished: true,
      status: 'ACTIVE',
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (artistId) {
      where.artistId = artistId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price_low':
        orderBy = { retailPrice: 'asc' };
        break;
      case 'price_high':
        orderBy = { retailPrice: 'desc' };
        break;
      case 'popular':
        orderBy = { salesCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.artistMerchProduct.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.artistMerchProduct.count({ where }),
    ]);

    // Get unique categories for filter UI
    const categories = await prisma.artistMerchProduct.groupBy({
      by: ['category'],
      where: {
        isPublished: true,
        status: 'ACTIVE',
      },
      _count: {
        category: true,
      },
    });

    // Transform products for public API
    const publicProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      retailPrice: p.retailPrice,
      mockupUrl: p.mockupUrl,
      thumbnailUrl: p.thumbnailUrl,
      colors: p.colors,
      sizes: p.sizes,
      artist: p.artist
        ? {
            id: p.artist.id,
            name: p.artist.name,
            username: p.artist.username,
            image: p.artist.image,
          }
        : null,
      salesCount: p.salesCount,
    }));

    return NextResponse.json({
      products: publicProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
      categories: categories.map((c) => ({
        name: c.category,
        count: c._count.category,
      })),
    });
  } catch (error) {
    console.error('[MERCH-CATALOG] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}
