import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy-initialize Stripe to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

interface CartItem {
  productId: string;
  quantity: number;
  variant?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain, items, customerEmail } = body as {
      subdomain: string;
      items: CartItem[];
      customerEmail?: string;
    };

    if (!subdomain || !items?.length) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get site
    const site = await prisma.musicianSite.findUnique({
      where: { subdomain },
      include: { user: true },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Get products
    const productIds = items.map((i) => i.productId);
    const products = await prisma.merchProduct.findMany({
      where: {
        id: { in: productIds },
        siteId: site.id,
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 });
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const variantString = item.variant
        ? ` (${Object.entries(item.variant)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')})`
        : '';

      return {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: product.name + variantString,
            description: product.description || undefined,
            images: (product.images as string[]).slice(0, 1),
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Create order in database (pending)
    const order = await prisma.merchOrder.create({
      data: {
        siteId: site.id,
        orderNumber,
        customerEmail: customerEmail || 'pending@checkout.com',
        customerName: 'Pending',
        billingAddress: {},
        subtotal,
        total: subtotal,
        status: 'pending',
        paymentStatus: 'pending',
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: product.id,
              productName: product.name,
              productImage: (product.images as string[])[0] || null,
              variantInfo: item.variant || null,
              unitPrice: product.price,
              quantity: item.quantity,
              total: Number(product.price) * item.quantity,
            };
          }) as any, // Cast to bypass Prisma type inference issues with nested creates
        },
      },
    });

    // Determine success and cancel URLs
    const baseUrl =
      site.customDomain && site.domainVerified
        ? `https://${site.customDomain}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/s/${subdomain}`;

    // Create Stripe Checkout Session
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}?order=success&id=${order.id}`,
      cancel_url: `${baseUrl}?order=canceled`,
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
        siteId: site.id,
        orderNumber,
      },
      // Copy metadata to payment intent so payment_intent.succeeded can look up the order
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          siteId: site.id,
          orderNumber,
        },
      },
      shipping_address_collection: {
        allowed_countries: [
          'US',
          'CA',
          'GB',
          'AU',
          'NZ',
          'DE',
          'FR',
          'ES',
          'IT',
          'NL',
          'BE',
          'AT',
          'CH',
          'JP',
        ],
      },
      billing_address_collection: 'required',
    });

    // Note: payment_intent is null immediately after session creation in Stripe API 2025-02-24.acacia
    // The payment_intent will be stored by the checkout.session.completed webhook handler
    // when the customer completes payment

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      orderId: order.id,
      orderNumber,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
