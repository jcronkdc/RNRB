import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma, Prisma } from '@cronkwaters/db';
import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret =
  process.env.STRIPE_MERCH_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';
const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '17319056';

/**
 * Artist Merch Webhook Handler
 *
 * Processes Stripe webhook events for artist merchandise:
 * - Creates orders in database with revenue split
 * - Sends orders to Printful for fulfillment
 * - Updates product sales stats
 */

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[ARTIST-MERCH-WEBHOOK] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only process artist merch orders
      if (session.metadata?.type === 'artist_merch') {
        await handleArtistMerchOrder(session);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[ARTIST-MERCH-WEBHOOK] Handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ART-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function handleArtistMerchOrder(session: Stripe.Checkout.Session) {
  const artistId = session.metadata?.artistId;
  const customerId = session.metadata?.customerId;
  const orderItemsJson = session.metadata?.orderItems;

  if (!artistId || !orderItemsJson) {
    console.error('[ARTIST-MERCH-WEBHOOK] Missing metadata');
    return;
  }

  // Check for existing order (idempotency)
  const existingOrder = await prisma.artistMerchOrder.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingOrder) {
    console.log('[ARTIST-MERCH-WEBHOOK] Order already exists:', existingOrder.orderNumber);
    return;
  }

  // Parse order items from metadata
  const orderItems = JSON.parse(orderItemsJson) as {
    pid: string;
    vid?: string;
    qty: number;
    price: number;
    base: number;
    fee: number;
  }[];

  // Fetch product details for fulfillment
  const productIds = orderItems.map((i) => i.pid);
  const products = await prisma.artistMerchProduct.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  // Calculate revenue split
  let totalPlatformFees = 0;
  let totalArtistEarnings = 0;
  let totalPrintfulCost = 0;

  const orderLineItems = orderItems.map((item) => {
    const product = products.find((p) => p.id === item.pid);
    const variant = item.vid ? product?.variants.find((v) => v.id === item.vid) : null;

    const totalPrice = item.price * item.qty;
    const printfulCost = item.base * item.qty;
    const profit = totalPrice - printfulCost;
    const platformFee = Math.round(profit * (item.fee / 100));
    const artistEarning = profit - platformFee;

    totalPlatformFees += platformFee;
    totalArtistEarnings += artistEarning;
    totalPrintfulCost += printfulCost;

    return {
      productId: item.pid,
      variantId: item.vid || null,
      artistId,
      quantity: item.qty,
      unitPrice: item.price,
      totalPrice,
      printfulCost,
      platformFee,
      artistEarning,
      productName: product?.name || 'Unknown Product',
      variantName: variant ? [variant.size, variant.color].filter(Boolean).join(' / ') : null,
      designUrl: product?.designUrl,
    };
  });

  const orderNumber = generateOrderNumber();

  // Create order in database
  const order = await prisma.artistMerchOrder.create({
    data: {
      orderNumber,
      customerId: customerId !== 'guest' ? customerId : null,
      customerEmail: session.customer_details?.email || '',
      customerName: session.customer_details?.name,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string | undefined,
      shippingName: session.shipping_details?.name,
      shippingAddress:
        (session.shipping_details?.address as unknown as Prisma.InputJsonValue) || null,
      shippingMethod: 'standard',
      shippingCost: session.shipping_cost?.amount_total || 0,
      subtotal: session.amount_subtotal || 0,
      platformFees: totalPlatformFees,
      artistEarnings: totalArtistEarnings,
      printfulCost: totalPrintfulCost,
      tax: session.total_details?.amount_tax || 0,
      total: session.amount_total || 0,
      status: 'PAID',
      paymentStatus: 'succeeded',
      paidAt: new Date(),
      items: {
        create: orderLineItems,
      },
    },
    include: { items: true },
  });

  console.log('[ARTIST-MERCH-WEBHOOK] Order created:', order.orderNumber);

  // Update product sales stats
  for (const item of orderLineItems) {
    await prisma.artistMerchProduct.update({
      where: { id: item.productId },
      data: {
        salesCount: { increment: item.quantity },
        totalRevenue: { increment: item.totalPrice },
      },
    });
  }

  // Send to Printful for fulfillment
  if (process.env.PRINTFUL_API_KEY && session.shipping_details?.address) {
    const printfulResult = await createPrintfulOrder(order, orderLineItems, session);

    if (printfulResult.success) {
      await prisma.artistMerchOrder.update({
        where: { id: order.id },
        data: {
          status: 'PROCESSING',
          printfulOrderId: printfulResult.orderId,
        },
      });
      console.log('[ARTIST-MERCH-WEBHOOK] Printful order created:', printfulResult.orderId);
    } else {
      console.error('[ARTIST-MERCH-WEBHOOK] Printful order failed:', printfulResult.error);
    }
  }
}

async function createPrintfulOrder(
  order: { id: string; orderNumber: string },
  items: {
    productId: string;
    variantId: string | null;
    quantity: number;
    unitPrice: number;
    designUrl?: string | null;
  }[],
  session: Stripe.Checkout.Session
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Printful API not configured' };
  }

  // Fetch products to get Printful variant IDs
  const products = await prisma.artistMerchProduct.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { variants: true },
  });

  // Build Printful order items
  const printfulItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : product.variants[0];

      if (!variant) return null;

      return {
        variant_id: variant.printfulVariantId,
        quantity: item.quantity,
        retail_price: (item.unitPrice / 100).toFixed(2),
        files: product.designUrl
          ? [
              {
                type: product.placement || 'front',
                url: product.designUrl,
              },
            ]
          : [],
      };
    })
    .filter(Boolean);

  if (printfulItems.length === 0) {
    return { success: false, error: 'No valid Printful items' };
  }

  const shippingAddress = session.shipping_details?.address;

  const printfulOrder = {
    external_id: order.orderNumber,
    shipping: 'STANDARD',
    recipient: {
      name: session.shipping_details?.name || '',
      address1: shippingAddress?.line1 || '',
      address2: shippingAddress?.line2 || '',
      city: shippingAddress?.city || '',
      state_code: shippingAddress?.state || '',
      country_code: shippingAddress?.country || 'US',
      zip: shippingAddress?.postal_code || '',
      email: session.customer_details?.email || '',
      phone: session.customer_details?.phone || '',
    },
    items: printfulItems,
  };

  try {
    const response = await fetchWithTimeout(
      `${PRINTFUL_API_URL}/orders`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-PF-Store-Id': PRINTFUL_STORE_ID,
        },
        body: JSON.stringify(printfulOrder),
      },
      TIMEOUTS.STANDARD
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Printful API error' };
    }

    const createdOrder = data.result as { id: number };

    // Auto-confirm if enabled
    if (process.env.PRINTFUL_AUTO_CONFIRM === 'true' && createdOrder?.id) {
      await fetchWithTimeout(
        `${PRINTFUL_API_URL}/orders/${createdOrder.id}/confirm`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
        TIMEOUTS.STANDARD
      );
    }

    return { success: true, orderId: createdOrder?.id?.toString() };
  } catch (error) {
    console.error('[PRINTFUL] Order creation error:', error);
    return { success: false, error: 'Failed to create Printful order' };
  }
}
