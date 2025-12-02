import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';

/**
 * Artist Merch Mockup Generation API
 *
 * Uses Printful's Mockup Generator to create product images
 */

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '17319056';

interface MockupRequest {
  productId: string; // Our database product ID
  printfulProductId: number;
  designUrl: string;
  variantIds?: number[];
  placement?: string;
}

// POST /api/artist-merch/mockup - Generate mockup for a product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    if (!PRINTFUL_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Printful API not configured. Please add PRINTFUL_API_KEY to environment variables.',
          code: 'PRINTFUL_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    // Verify Printful store exists (required for mockup generation)
    try {
      const storeCheck = await fetchWithTimeout(
        `${PRINTFUL_API_URL}/stores`,
        {
          headers: {
            Authorization: `Bearer ${PRINTFUL_API_KEY}`,
            'X-PF-Store-Id': PRINTFUL_STORE_ID,
          },
        },
        TIMEOUTS.STANDARD
      );
      const storeData = await storeCheck.json();
      if (!storeData.result || storeData.result.length === 0) {
        return NextResponse.json(
          {
            error:
              'No Printful store found. Please create a store at printful.com/dashboard first.',
            code: 'NO_PRINTFUL_STORE',
            setupUrl: 'https://www.printful.com/dashboard/store/add',
          },
          { status: 503 }
        );
      }
    } catch (storeErr) {
      console.error('[MOCKUP] Store check failed:', storeErr);
      // Continue anyway - maybe the endpoint changed
    }

    const body = (await request.json()) as MockupRequest;
    const { productId, printfulProductId, designUrl, variantIds, placement = 'front' } = body;

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

    // Step 1: Get print files for the product
    const printFilesResponse = await fetchWithTimeout(
      `${PRINTFUL_API_URL}/mockup-generator/printfiles/${printfulProductId}`,
      {
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json',
          'X-PF-Store-Id': PRINTFUL_STORE_ID,
        },
      },
      TIMEOUTS.STANDARD
    );

    if (!printFilesResponse.ok) {
      console.error('[MOCKUP] Failed to get print files');
      return NextResponse.json({ error: 'Failed to get product info' }, { status: 500 });
    }

    const printFilesData = await printFilesResponse.json();
    const printFiles = printFilesData.result;

    // Get available variant IDs
    let targetVariants = variantIds;
    if (!targetVariants || targetVariants.length === 0) {
      // Get first few variants for mockup
      targetVariants = printFiles.variant_ids?.slice(0, 3) || [];
    }

    if (targetVariants.length === 0) {
      return NextResponse.json({ error: 'No variants available for mockup' }, { status: 400 });
    }

    // Step 2: Create mockup generation task
    const mockupPayload = {
      variant_ids: targetVariants,
      format: 'jpg',
      width: 1000,
      files: [
        {
          placement,
          image_url: designUrl,
          position: {
            area_width: 1800,
            area_height: 2400,
            width: 1800,
            height: 2400,
            top: 0,
            left: 0,
          },
        },
      ],
    };

    const taskResponse = await fetchWithTimeout(
      `${PRINTFUL_API_URL}/mockup-generator/create-task/${printfulProductId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockupPayload),
      },
      TIMEOUTS.STANDARD
    );

    const taskData = await taskResponse.json();

    if (!taskResponse.ok) {
      console.error('[MOCKUP] Task creation failed:', taskData);
      return NextResponse.json(
        { error: taskData.result?.message || 'Failed to create mockup task' },
        { status: 500 }
      );
    }

    const taskKey = taskData.result?.task_key;

    if (!taskKey) {
      return NextResponse.json({ error: 'No task key returned' }, { status: 500 });
    }

    // Step 3: Poll for task completion
    let mockupUrls: string[] = [];
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const statusResponse = await fetchWithTimeout(
        `${PRINTFUL_API_URL}/mockup-generator/task?task_key=${taskKey}`,
        {
          headers: {
            Authorization: `Bearer ${PRINTFUL_API_KEY}`,
            'X-PF-Store-Id': PRINTFUL_STORE_ID,
          },
        },
        TIMEOUTS.STANDARD
      );

      const statusData = await statusResponse.json();
      const status = statusData.result?.status;

      if (status === 'completed') {
        const mockups = statusData.result?.mockups || [];
        mockupUrls = mockups.map((m: { mockup_url: string }) => m.mockup_url);
        break;
      } else if (status === 'failed') {
        console.error('[MOCKUP] Task failed:', statusData.result?.error);
        return NextResponse.json(
          { error: statusData.result?.error || 'Mockup generation failed' },
          { status: 500 }
        );
      }

      attempts++;
    }

    if (mockupUrls.length === 0) {
      return NextResponse.json({ error: 'Mockup generation timed out' }, { status: 504 });
    }

    // Step 4: Update product with mockup URL if productId provided
    if (productId && mockupUrls[0]) {
      await prisma.artistMerchProduct.update({
        where: { id: productId },
        data: {
          mockupUrl: mockupUrls[0],
          thumbnailUrl: mockupUrls[0],
        },
      });
    }

    return NextResponse.json({
      success: true,
      mockupUrls,
      primaryMockup: mockupUrls[0],
      taskKey,
      message: 'Mockup generated successfully!',
    });
  } catch (error) {
    console.error('[MOCKUP] Error:', error);
    return NextResponse.json({ error: 'Failed to generate mockup' }, { status: 500 });
  }
}

// GET /api/artist-merch/mockup - Get mockup task status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!PRINTFUL_API_KEY) {
      return NextResponse.json({ error: 'Printful not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const taskKey = searchParams.get('task_key');

    if (!taskKey) {
      return NextResponse.json({ error: 'Task key required' }, { status: 400 });
    }

    const response = await fetchWithTimeout(
      `${PRINTFUL_API_URL}/mockup-generator/task?task_key=${taskKey}`,
      {
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        },
      },
      TIMEOUTS.STANDARD
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to check task status' }, { status: 500 });
    }

    const result = data.result;
    const status = result?.status;

    if (status === 'completed') {
      const mockups = result?.mockups || [];
      return NextResponse.json({
        success: true,
        status: 'completed',
        mockupUrls: mockups.map((m: { mockup_url: string }) => m.mockup_url),
      });
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('[MOCKUP] GET error:', error);
    return NextResponse.json({ error: 'Failed to check task status' }, { status: 500 });
  }
}
