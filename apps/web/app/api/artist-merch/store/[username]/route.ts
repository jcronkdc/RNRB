import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Public Artist Store API
 *
 * Fetches published products for an artist's public store.
 * Accessible without authentication.
 */

// GET /api/artist-merch/store/[username] - Get artist's published products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Find the artist by username
    const artist = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
      },
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Get published products
    const products = await prisma.artistMerchProduct.findMany({
      where: {
        artistId: artist.id,
        isPublished: true,
        status: 'ACTIVE',
      },
      include: {
        variants: {
          where: { inStock: true },
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { salesCount: 'desc' }, { createdAt: 'desc' }],
    });

    // Get categories with counts
    const categories = products.reduce(
      (acc, product) => {
        const cat = product.category;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate some stats for the store
    const stats = {
      totalProducts: products.length,
      categories: Object.keys(categories).length,
    };

    return NextResponse.json({
      success: true,
      artist: {
        id: artist.id,
        name: artist.name,
        username: artist.username,
        image: artist.image,
        bio: artist.bio,
      },
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        slug: p.slug,
        retailPrice: p.retailPrice,
        category: p.category,
        mockupUrl: p.mockupUrl,
        thumbnailUrl: p.thumbnailUrl,
        isFeatured: p.isFeatured,
        variants: p.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          retailPrice: v.retailPrice,
          inStock: v.inStock,
        })),
      })),
      categories,
      stats,
    });
  } catch (error) {
    console.error('[ARTIST-STORE] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}
