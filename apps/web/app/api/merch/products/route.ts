import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Public Merch Products API
 *
 * Returns published artist merchandise products available for purchase.
 * This is a public endpoint - no authentication required.
 */

export const dynamic = 'force-dynamic';

// GET /api/merch/products - Get published products from all artists
export async function GET(request: NextRequest) {
  try {
    // Rate limit by IP for public endpoint
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    await checkRateLimit(standardLimiter, ip);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const artistId = searchParams.get('artistId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query published products only
    const products = await prisma.artistMerchProduct.findMany({
      where: {
        isPublished: true,
        status: 'ACTIVE',
        ...(category && { category }),
        ...(featured && { isFeatured: true }),
        ...(artistId && { artistId }),
      },
      include: {
        variants: {
          where: {
            inStock: true,
          },
        },
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.artistMerchProduct.count({
      where: {
        isPublished: true,
        status: 'ACTIVE',
        ...(category && { category }),
        ...(featured && { isFeatured: true }),
        ...(artistId && { artistId }),
      },
    });

    // Transform products to public format
    const publicProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      slug: product.slug,
      category: product.category,
      retailPrice: product.retailPrice,
      mockupUrl: product.mockupUrl,
      thumbnailUrl: product.thumbnailUrl,
      colors: product.colors,
      sizes: product.sizes,
      isFeatured: product.isFeatured,
      publishedAt: product.publishedAt,
      artist: {
        id: product.artist.id,
        name: product.artist.name || 'Anonymous Artist',
        image: product.artist.image,
      },
      variants: product.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorCode: v.colorCode,
        retailPrice: v.retailPrice,
      })),
      variantCount: product.variants.length,
    }));

    return NextResponse.json({
      success: true,
      products: publicProducts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('[PUBLIC-MERCH] GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
