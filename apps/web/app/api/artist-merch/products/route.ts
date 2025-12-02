import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Artist Merch Products API
 *
 * Allows artists to create and manage their own merchandise products
 * using Printful print-on-demand.
 *
 * Revenue Split:
 * - Printful: Production cost
 * - RNRB Platform: 15% of profit (configurable)
 * - Artist: 85% of profit
 */

// Platform fee percentage (can be moved to env/config)
const PLATFORM_FEE_PERCENT = 15;

// Printful base prices for common products (in cents)
const PRINTFUL_BASE_PRICES: Record<number, number> = {
  71: 1295, // Bella+Canvas 3001 T-Shirt
  380: 2595, // Hoodie
  195: 1095, // Tank Top
  1: 895, // Poster
  19: 695, // Mug 11oz
  358: 245, // Stickers
  206: 1295, // Dad Hat
  83: 1195, // Tote Bag
};

interface CreateProductRequest {
  name: string;
  description?: string;
  printfulProductId: number;
  designUrl: string;
  placement?: string;
  retailPrice: number; // in cents
  category?: string;
  colors?: string[];
  sizes?: string[];
  variants?: {
    printfulVariantId: number;
    size?: string;
    color?: string;
    colorCode?: string;
    retailPrice: number;
  }[];
}

// GET /api/artist-merch/products - List artist's products
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const products = await prisma.artistMerchProduct.findMany({
      where: {
        artistId: session.user.id,
        ...(status && { status: status as any }),
        ...(category && { category }),
      },
      include: {
        variants: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate earnings summary
    const earningsSummary = await prisma.artistMerchOrderItem.aggregate({
      where: {
        artistId: session.user.id,
        order: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      _sum: {
        artistEarning: true,
        totalPrice: true,
        quantity: true,
      },
    });

    return NextResponse.json({
      success: true,
      products,
      summary: {
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.status === 'ACTIVE').length,
        totalSales: earningsSummary._sum.quantity || 0,
        totalRevenue: earningsSummary._sum.totalPrice || 0,
        totalEarnings: earningsSummary._sum.artistEarning || 0,
      },
    });
  } catch (error) {
    console.error('[ARTIST-MERCH] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/artist-merch/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const body = (await request.json()) as CreateProductRequest;
    const {
      name,
      description,
      printfulProductId,
      designUrl,
      placement = 'front',
      retailPrice,
      category = 'apparel',
      colors,
      sizes,
      variants,
    } = body;

    // Validation
    if (!name || !printfulProductId || !designUrl || !retailPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: name, printfulProductId, designUrl, retailPrice' },
        { status: 400 }
      );
    }

    // Get base price for this product
    const basePrice = PRINTFUL_BASE_PRICES[printfulProductId] || 1500; // Default $15

    // Validate retail price is above base price
    if (retailPrice <= basePrice) {
      return NextResponse.json(
        { error: `Retail price must be above production cost ($${(basePrice / 100).toFixed(2)})` },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for existing slug
    const existingProduct = await prisma.artistMerchProduct.findFirst({
      where: {
        artistId: session.user.id,
        slug: { startsWith: baseSlug },
      },
    });

    const slug = existingProduct ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    // Create product
    const product = await prisma.artistMerchProduct.create({
      data: {
        artistId: session.user.id,
        name,
        description,
        slug,
        printfulProductId,
        designUrl,
        placement,
        basePrice,
        retailPrice,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        category,
        colors: colors || null,
        sizes: sizes || null,
        status: 'DRAFT',
        variants: variants
          ? {
              create: variants.map((v) => ({
                printfulVariantId: v.printfulVariantId,
                size: v.size,
                color: v.color,
                colorCode: v.colorCode,
                basePrice: PRINTFUL_BASE_PRICES[printfulProductId] || 1500,
                retailPrice: v.retailPrice || retailPrice,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });

    // Calculate profit breakdown
    const profit = retailPrice - basePrice;
    const platformFee = Math.round(profit * (PLATFORM_FEE_PERCENT / 100));
    const artistEarning = profit - platformFee;

    return NextResponse.json({
      success: true,
      product,
      profitBreakdown: {
        retailPrice,
        productionCost: basePrice,
        grossProfit: profit,
        platformFee,
        artistEarning,
        platformFeePercent: PLATFORM_FEE_PERCENT,
      },
      message: 'Product created! Publish it to make it available in your store.',
    });
  } catch (error) {
    console.error('[ARTIST-MERCH] POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PUT /api/artist-merch/products - Update a product
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.artistMerchProduct.findFirst({
      where: { id, artistId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Handle publish action
    if (updates.action === 'publish') {
      const product = await prisma.artistMerchProduct.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          isPublished: true,
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, product, message: 'Product published!' });
    }

    // Handle unpublish action
    if (updates.action === 'unpublish') {
      const product = await prisma.artistMerchProduct.update({
        where: { id },
        data: {
          status: 'PAUSED',
          isPublished: false,
        },
      });
      return NextResponse.json({ success: true, product, message: 'Product unpublished' });
    }

    // Regular update
    const allowedUpdates = ['name', 'description', 'retailPrice', 'category', 'isFeatured'];
    const filteredUpdates: Record<string, any> = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const product = await prisma.artistMerchProduct.update({
      where: { id },
      data: filteredUpdates,
      include: { variants: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('[ARTIST-MERCH] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/artist-merch/products - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.artistMerchProduct.findFirst({
      where: { id, artistId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has orders
    const orderCount = await prisma.artistMerchOrderItem.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      // Archive instead of delete
      await prisma.artistMerchProduct.update({
        where: { id },
        data: { status: 'ARCHIVED', isPublished: false },
      });
      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Product archived (has existing orders)',
      });
    }

    // Delete product and variants
    await prisma.artistMerchProduct.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('[ARTIST-MERCH] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
