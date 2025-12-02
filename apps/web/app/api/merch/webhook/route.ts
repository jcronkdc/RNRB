import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@cronkwaters/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_MERCH_WEBHOOK_SECRET || '';

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

  // Retrieve line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  // Build order items
  const items = lineItems.data.map((item) => {
    const product = item.price?.product as Stripe.Product | undefined;
    return {
      productId: product?.id || 'unknown',
      name: product?.name || item.description || 'Unknown Product',
      quantity: item.quantity || 1,
      unitPrice: item.price?.unit_amount || 0,
      totalPrice: item.amount_total || 0,
    };
  });

  // Create order in database
  try {
    const order = await prisma.platformMerchOrder.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
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

    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(order);
  } catch (error) {
    console.error('Failed to create platform merch order:', error);
    throw error;
  }
}
