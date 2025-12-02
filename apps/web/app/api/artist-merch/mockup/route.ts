import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { generatePrintfulMockups, getPrintfulMockupStatus } from '@/lib/merch/printful-mockups';

/**
 * Artist Merch Mockup Generation API
 *
 * Uses Printful's Mockup Generator to create product images
 */

interface MockupRequest {
  productId?: string; // Our database product ID
  printfulProductId: number;
  designUrl: string;
  variantIds?: number[];
  placement?: 'front' | 'back' | 'left' | 'right';
  position?: {
    area_width: number;
    area_height: number;
    width: number;
    height: number;
    top: number;
    left: number;
  };
}

// POST /api/artist-merch/mockup - Generate mockup for a product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const body = (await request.json()) as MockupRequest;
    const { productId, printfulProductId, designUrl, variantIds, placement, position } = body;

    if (!printfulProductId || !designUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: printfulProductId, designUrl' },
        { status: 400 }
      );
    }

    // If productId provided, verify ownership
    if (productId) {
      const product = await prisma.artistMerchProduct.findFirst({
        where: { id: productId, artistId: session.user.id },
      });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
    }

    // Generate mockups using our utility
    try {
      const mockups = await generatePrintfulMockups({
        productId: printfulProductId,
        designUrl,
        variantIds,
        placement: placement || 'front',
        position,
      });

      if (mockups.length === 0) {
        return NextResponse.json({ error: 'No mockups generated' }, { status: 500 });
      }

      // Update product with mockup URL if productId provided
      if (productId && mockups[0]) {
        await prisma.artistMerchProduct.update({
          where: { id: productId },
          data: {
            mockupUrl: mockups[0].mockupUrl,
            thumbnailUrl: mockups[0].mockupUrl,
          },
        });
      }

      return NextResponse.json({
        success: true,
        mockups: mockups.map((m) => ({
          variantId: m.variantId,
          url: m.mockupUrl,
          placement: m.placement,
          color: m.productColor,
        })),
        primaryMockupUrl: mockups[0].mockupUrl,
      });
    } catch (mockupError) {
      console.error('[MOCKUP] Generation error:', mockupError);

      const errorMessage =
        mockupError instanceof Error ? mockupError.message : 'Failed to generate mockups';

      // Handle specific Printful errors
      if (errorMessage.includes('API key')) {
        return NextResponse.json(
          {
            error: 'Printful API not configured',
            code: 'PRINTFUL_NOT_CONFIGURED',
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('[MOCKUP] Unexpected error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// GET /api/artist-merch/mockup?taskKey=xxx - Check mockup status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const { searchParams } = new URL(request.url);
    const taskKey = searchParams.get('taskKey');

    if (!taskKey) {
      return NextResponse.json({ error: 'Task key required' }, { status: 400 });
    }

    const status = await getPrintfulMockupStatus(taskKey);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('[MOCKUP] Status check error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check mockup status',
      },
      { status: 500 }
    );
  }
}
