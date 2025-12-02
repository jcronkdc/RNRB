import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';
import { prisma } from '@cronkwaters/db';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_MERCH_WEBHOOK_SECRET || '';
const PRINTFUL_API_URL = 'https://api.printful.com';

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
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Generate order number: RNRB-XXXXXX
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, I, 0, 1 to avoid confusion
  let result = 'RNRB-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Check if order already exists (idempotency)
  const existingOrder = await prisma.platformMerchOrder.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingOrder) {
    console.log('Order already exists:', existingOrder.id);
    return;
  }

  // Retrieve line items with product metadata
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  // Build order items with Printful variant info
  const items = lineItems.data.map((item) => {
    const product = item.price?.product as Stripe.Product | undefined;
    return {
      productId: product?.id || 'unknown',
      name: product?.name || item.description || 'Unknown Product',
      quantity: item.quantity || 1,
      unitPrice: item.price?.unit_amount || 0,
      totalPrice: item.amount_total || 0,
      // Printful variant ID stored in product metadata
      printfulVariantId: product?.metadata?.printful_variant_id,
      printfulSyncVariantId: product?.metadata?.printful_sync_variant_id,
      designUrl: product?.metadata?.design_url,
    };
  });

  const orderNumber = generateOrderNumber();

  // Create order in database
  try {
    const order = await prisma.platformMerchOrder.create({
      data: {
        userId,
        orderNumber,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string | undefined,
        status: 'PAID',
        paymentStatus: 'succeeded',
        subtotal: session.amount_subtotal || 0,
        shippingCost: session.shipping_cost?.amount_total || 0,
        tax: session.total_details?.amount_tax || 0,
        total: session.amount_total || 0,
        currency: session.currency || 'usd',
        customerEmail: session.customer_details?.email || '',
        customerName: session.customer_details?.name || undefined,
        shippingName: session.shipping_details?.name || undefined,
        shippingAddress: session.shipping_details?.address
          ? session.shipping_details.address
          : undefined,
        shippingMethod: session.shipping_cost?.shipping_rate ? 'standard' : undefined,
        items: items,
        paidAt: new Date(),
      },
    });

    console.log('Platform merch order created:', order.id, order.orderNumber);

    // =====================
    // CREATE PRINTFUL ORDER FOR FULFILLMENT
    // =====================
    if (session.shipping_details?.address && process.env.PRINTFUL_API_KEY) {
      const printfulResult = await createPrintfulOrder(session, items, orderNumber);

      if (printfulResult.success) {
        // Update order with Printful order ID
        await prisma.platformMerchOrder.update({
          where: { id: order.id },
          data: {
            status: 'PROCESSING',
            printfulOrderId: printfulResult.printfulOrderId,
          },
        });
        console.log('Printful order created:', printfulResult.printfulOrderId);
      } else {
        console.error('Failed to create Printful order:', printfulResult.error);
        // Order is still valid, just needs manual Printful submission
      }
    }

    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(order);
  } catch (error) {
    console.error('Failed to create platform merch order:', error);
    throw error;
  }
}

// Create Printful order for fulfillment
async function createPrintfulOrder(
  session: Stripe.Checkout.Session,
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    printfulVariantId?: string;
    printfulSyncVariantId?: string;
    designUrl?: string;
  }>,
  orderNumber: string
): Promise<{ success: boolean; printfulOrderId?: string; error?: string }> {
  const shippingAddress = session.shipping_details?.address;
  const customerDetails = session.customer_details;

  if (!shippingAddress) {
    return { success: false, error: 'No shipping address' };
  }

  // Build Printful order items
  const printfulItems = items
    .filter((item) => item.printfulVariantId || item.printfulSyncVariantId)
    .map((item) => {
      const baseItem: Record<string, unknown> = {
        quantity: item.quantity,
        retail_price: (item.unitPrice / 100).toFixed(2),
      };

      // Use sync variant if available (pre-created product), otherwise use catalog variant
      if (item.printfulSyncVariantId) {
        baseItem.sync_variant_id = parseInt(item.printfulSyncVariantId);
      } else if (item.printfulVariantId) {
        baseItem.variant_id = parseInt(item.printfulVariantId);
        // If using catalog variant, need to include design file
        if (item.designUrl) {
          baseItem.files = [
            {
              type: 'front',
              url: item.designUrl,
            },
          ];
        }
      }

      return baseItem;
    });

  // Skip if no Printful items (might be non-POD products)
  if (printfulItems.length === 0) {
    console.log('No Printful items in order, skipping fulfillment');
    return { success: true };
  }

  // Build Printful order payload
  const printfulOrder = {
    external_id: orderNumber,
    shipping: 'STANDARD',
    recipient: {
      name: session.shipping_details?.name || customerDetails?.name || '',
      address1: shippingAddress.line1 || '',
      address2: shippingAddress.line2 || '',
      city: shippingAddress.city || '',
      state_code: shippingAddress.state || '',
      country_code: shippingAddress.country || 'US',
      zip: shippingAddress.postal_code || '',
      email: customerDetails?.email || '',
      phone: customerDetails?.phone || '',
    },
    items: printfulItems,
    retail_costs: {
      currency: session.currency?.toUpperCase() || 'USD',
      subtotal: ((session.amount_subtotal || 0) / 100).toFixed(2),
      shipping: ((session.shipping_cost?.amount_total || 0) / 100).toFixed(2),
      tax: ((session.total_details?.amount_tax || 0) / 100).toFixed(2),
    },
  };

  // Create the order
  const createResult = await printfulFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(printfulOrder),
  });

  if (!createResult.success) {
    return { success: false, error: createResult.error };
  }

  const createdOrder = createResult.result as { id: number };

  // Auto-confirm the order to start fulfillment
  // (Only do this if you want immediate fulfillment - otherwise leave as draft for review)
  const autoConfirm = process.env.PRINTFUL_AUTO_CONFIRM === 'true';

  if (autoConfirm && createdOrder?.id) {
    const confirmResult = await printfulFetch(`/orders/${createdOrder.id}/confirm`, {
      method: 'POST',
    });

    if (!confirmResult.success) {
      console.warn('Order created but confirmation failed:', confirmResult.error);
      // Still return success - order exists, just needs manual confirmation
    }
  }

  return {
    success: true,
    printfulOrderId: createdOrder?.id?.toString(),
  };
}
