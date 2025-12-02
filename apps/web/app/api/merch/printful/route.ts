import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';

import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Printful Integration API - Print-on-Demand Merchandise
 *
 * Enables artists to sell custom merchandise without inventory:
 * - Create products with custom designs
 * - Generate professional mockups
 * - Printful handles production, shipping, fulfillment
 * - Artist sets retail price, keeps profit margin
 *
 * SETUP REQUIRED:
 * 1. Create Printful account at https://www.printful.com
 * 2. Get API key from Settings > API
 * 3. Add PRINTFUL_API_KEY to environment variables
 *
 * Revenue Model:
 * - Printful takes production cost
 * - RNRB takes 15% platform fee
 * - Artist keeps 85% of profit margin
 *
 * API Documentation: https://developers.printful.com/docs/
 */

const PRINTFUL_API_URL = 'https://api.printful.com';

// Import product constants
// PRINTFUL_PRODUCTS moved to @/lib/merch/printful-constants.ts

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  thumbnail_url: string;
  variants: PrintfulVariant[];
  is_ignored: boolean;
}

interface PrintfulVariant {
  id: number;
  variant_id: number;
  name: string;
  retail_price: string;
  sku: string;
}

interface CreateProductRequest {
  name: string;
  designUrl: string;
  productType: string; // e.g., 'tshirt', 'hoodie', 'mug', 'poster'
  variants: {
    variantId: number;
    retailPrice: number;
    size?: string;
    color?: string;
  }[];
  description?: string;
  placement?: 'front' | 'back' | 'embroidery_front' | 'embroidery_chest_left';
}

interface MockupRequest {
  productId: number;
  variantIds: number[];
  designUrl: string;
  placement?: string;
}

interface CreateOrderRequest {
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
    email: string;
    phone?: string;
  };
  items: {
    sync_variant_id?: number;
    variant_id?: number;
    quantity: number;
    retail_price?: string;
    files?: {
      type: string;
      url: string;
    }[];
  }[];
  retail_costs?: {
    subtotal: string;
    discount: string;
    shipping: string;
    tax: string;
  };
}

// Printful Store ID - required for most API calls
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '17319056';

// Helper to make Printful API calls
async function printfulFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'Printful API not configured' };
  }

  try {
    const response = await fetchWithTimeout(
      `${PRINTFUL_API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-PF-Store-Id': PRINTFUL_STORE_ID,
          ...options.headers,
        },
      },
      TIMEOUTS.STANDARD
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || `Printful API error: ${response.status}`,
      };
    }

    return { success: true, result: data.result };
  } catch (error) {
    console.error('[PRINTFUL] API error:', error);
    return { success: false, error: 'Failed to communicate with Printful' };
  }
}

// GET /api/merch/printful - List sync products or get catalog
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'products';

    switch (action) {
      case 'products': {
        // List artist's sync products
        const result = await printfulFetch('/store/products');
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          products: result.result,
        });
      }

      case 'catalog': {
        // Get available product catalog (shirts, hoodies, etc.)
        const categoryId = searchParams.get('category') || '';
        const endpoint = categoryId ? `/products?category_id=${categoryId}` : '/products';
        const result = await printfulFetch(endpoint);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          catalog: result.result,
        });
      }

      case 'categories': {
        // Get product categories
        const result = await printfulFetch('/categories');
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          categories: result.result,
        });
      }

      case 'product-details': {
        // Get specific product variants and pricing
        const productId = searchParams.get('id');
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }
        const result = await printfulFetch(`/products/${productId}`);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          product: result.result,
        });
      }

      case 'printfiles': {
        // Get printfile info for mockup generation
        const productId = searchParams.get('id');
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }
        const result = await printfulFetch(`/mockup-generator/printfiles/${productId}`);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          printfiles: result.result,
        });
      }

      case 'mockup-templates': {
        // Get mockup templates for a product
        const productId = searchParams.get('id');
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }
        const result = await printfulFetch(`/mockup-generator/templates/${productId}`);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          templates: result.result,
        });
      }

      case 'mockup-task': {
        // Check mockup generation task status
        const taskKey = searchParams.get('task_key');
        if (!taskKey) {
          return NextResponse.json({ error: 'Task key required' }, { status: 400 });
        }
        const result = await printfulFetch(`/mockup-generator/task?task_key=${taskKey}`);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          task: result.result,
        });
      }

      case 'orders': {
        // List orders
        const status = searchParams.get('status');
        const endpoint = status ? `/orders?status=${status}` : '/orders';
        const result = await printfulFetch(endpoint);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          orders: result.result,
        });
      }

      case 'order': {
        // Get specific order
        const orderId = searchParams.get('id');
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }
        const result = await printfulFetch(`/orders/${orderId}`);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          order: result.result,
        });
      }

      case 'shipping-rates': {
        // Get shipping rates - requires POST with address
        return NextResponse.json(
          {
            error: 'Use POST method with address data for shipping rates',
          },
          { status: 400 }
        );
      }

      case 'store-info': {
        // Get store information
        const result = await printfulFetch('/stores');
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          stores: result.result,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[PRINTFUL] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Printful' }, { status: 500 });
  }
}

// POST /api/merch/printful - Multiple actions: create product, generate mockup, create order
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const body = await request.json();
    const action = body.action || 'create-product';

    switch (action) {
      // =====================
      // CREATE SYNC PRODUCT
      // =====================
      case 'create-product': {
        const {
          name,
          designUrl,
          productType,
          variants,
          placement = 'front',
        } = body as CreateProductRequest;

        if (!name || !designUrl || !productType || !variants?.length) {
          return NextResponse.json(
            { error: 'Missing required fields: name, designUrl, productType, variants' },
            { status: 400 }
          );
        }

        // Create sync product with Printful
        const syncProduct = {
          sync_product: {
            external_id: `rnrb-${session.user.id}-${Date.now()}`,
            name: name,
            thumbnail: designUrl,
          },
          sync_variants: variants.map((v) => ({
            variant_id: v.variantId,
            retail_price: v.retailPrice.toFixed(2),
            files: [
              {
                type: placement,
                url: designUrl,
              },
            ],
          })),
        };

        const result = await printfulFetch('/store/products', {
          method: 'POST',
          body: JSON.stringify(syncProduct),
        });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          product: result.result,
          message: 'Product created successfully! It will be available in your store shortly.',
        });
      }

      // =====================
      // GENERATE MOCKUP
      // =====================
      case 'generate-mockup': {
        const {
          productId,
          variantIds,
          designUrl,
          placement = 'front',
          format = 'jpg',
        } = body as MockupRequest & { format?: string };

        if (!productId || !variantIds?.length || !designUrl) {
          return NextResponse.json(
            { error: 'Missing required fields: productId, variantIds, designUrl' },
            { status: 400 }
          );
        }

        // Create mockup generation task
        const mockupRequest = {
          variant_ids: variantIds,
          format: format,
          files: [
            {
              placement: placement,
              image_url: designUrl,
              position: {
                area_width: 1800,
                area_height: 2400,
                width: 1800,
                height: 1800,
                top: 300,
                left: 0,
              },
            },
          ],
        };

        const result = await printfulFetch(`/mockup-generator/create-task/${productId}`, {
          method: 'POST',
          body: JSON.stringify(mockupRequest),
        });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          task: result.result,
          message: 'Mockup generation started. Use the task_key to check status.',
        });
      }

      // =====================
      // CREATE ORDER (For fulfillment after Stripe payment)
      // =====================
      case 'create-order': {
        const {
          recipient,
          items,
          externalId,
          retailCosts,
          confirmOrder = false,
        } = body as CreateOrderRequest & {
          externalId?: string;
          confirmOrder?: boolean;
        };

        if (!recipient || !items?.length) {
          return NextResponse.json(
            { error: 'Missing required fields: recipient, items' },
            { status: 400 }
          );
        }

        // Build order payload
        const orderPayload: Record<string, unknown> = {
          external_id: externalId || `rnrb-order-${session.user.id}-${Date.now()}`,
          shipping: 'STANDARD',
          recipient: {
            name: recipient.name,
            address1: recipient.address1,
            address2: recipient.address2 || '',
            city: recipient.city,
            state_code: recipient.state_code,
            country_code: recipient.country_code,
            zip: recipient.zip,
            email: recipient.email,
            phone: recipient.phone || '',
          },
          items: items.map((item) => ({
            ...(item.sync_variant_id && { sync_variant_id: item.sync_variant_id }),
            ...(item.variant_id && { variant_id: item.variant_id }),
            quantity: item.quantity,
            ...(item.retail_price && { retail_price: item.retail_price }),
            ...(item.files && { files: item.files }),
          })),
        };

        if (retailCosts) {
          orderPayload.retail_costs = retailCosts;
        }

        // Create draft order
        const createResult = await printfulFetch('/orders', {
          method: 'POST',
          body: JSON.stringify(orderPayload),
        });

        if (!createResult.success) {
          return NextResponse.json({ error: createResult.error }, { status: 500 });
        }

        const createdOrder = createResult.result as { id: number };

        // Optionally confirm order immediately
        if (confirmOrder && createdOrder?.id) {
          const confirmResult = await printfulFetch(`/orders/${createdOrder.id}/confirm`, {
            method: 'POST',
          });

          if (!confirmResult.success) {
            return NextResponse.json({
              success: true,
              order: createdOrder,
              confirmed: false,
              confirmError: confirmResult.error,
              message: 'Order created but confirmation failed. Order is in draft status.',
            });
          }

          return NextResponse.json({
            success: true,
            order: confirmResult.result,
            confirmed: true,
            message: 'Order created and confirmed for fulfillment!',
          });
        }

        return NextResponse.json({
          success: true,
          order: createdOrder,
          confirmed: false,
          message: 'Draft order created. Confirm to start fulfillment.',
        });
      }

      // =====================
      // CONFIRM ORDER
      // =====================
      case 'confirm-order': {
        const { orderId } = body;

        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const result = await printfulFetch(`/orders/${orderId}/confirm`, {
          method: 'POST',
        });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          order: result.result,
          message: 'Order confirmed and sent for fulfillment!',
        });
      }

      // =====================
      // CALCULATE SHIPPING RATES
      // =====================
      case 'shipping-rates': {
        const { recipient: shippingRecipient, items: shippingItems } = body;

        if (!shippingRecipient || !shippingItems?.length) {
          return NextResponse.json(
            { error: 'Missing required fields: recipient, items' },
            { status: 400 }
          );
        }

        const result = await printfulFetch('/shipping/rates', {
          method: 'POST',
          body: JSON.stringify({
            recipient: shippingRecipient,
            items: shippingItems,
          }),
        });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          rates: result.result,
        });
      }

      // =====================
      // ESTIMATE ORDER COSTS
      // =====================
      case 'estimate-costs': {
        const { recipient: estimateRecipient, items: estimateItems } = body;

        if (!estimateRecipient || !estimateItems?.length) {
          return NextResponse.json(
            { error: 'Missing required fields: recipient, items' },
            { status: 400 }
          );
        }

        const result = await printfulFetch('/orders/estimate-costs', {
          method: 'POST',
          body: JSON.stringify({
            recipient: estimateRecipient,
            items: estimateItems,
          }),
        });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          estimate: result.result,
        });
      }

      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[PRINTFUL] POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE /api/merch/printful?id=xxx - Delete sync product
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkRateLimit(standardLimiter, session.user.id);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const result = await printfulFetch(`/store/products/${productId}`, {
      method: 'DELETE',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('[PRINTFUL] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
