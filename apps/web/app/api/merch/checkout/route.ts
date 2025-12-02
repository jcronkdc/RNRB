import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

// Products with real Stripe Price IDs
const SAMPLE_PRODUCTS: Record<string, { name: string; price: number; stripePriceId: string }> = {
  'rnrb-tee-black': {
    name: 'RNRB Classic Logo Tee',
    price: 2999,
    stripePriceId: 'price_1SZhxv2H6bMdop9gJSsCr3lH',
  },
  'rnrb-hoodie-black': {
    name: 'RNRB Hoodie',
    price: 6499,
    stripePriceId: 'price_1SZhxv2H6bMdop9gJ37b71Xr',
  },
  'rnrb-cap': {
    name: 'RNRB Snapback Cap',
    price: 3499,
    stripePriceId: 'price_1SZhxw2H6bMdop9gq5fJq9g3',
  },
  'rnrb-pick-tin': {
    name: 'RNRB Guitar Picks (12-Pack)',
    price: 1299,
    stripePriceId: 'price_1SZhxx2H6bMdop9gvwoLERDx',
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = SAMPLE_PRODUCTS[item.productId];

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      // Use Stripe Price ID (all products have one configured)
      lineItems.push({
        price: product.stripePriceId,
        quantity: item.quantity,
      });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/merch/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/merch/checkout`,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 599,
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 10,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1499,
              currency: 'usd',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 2,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
      automatic_tax: {
        enabled: false, // Enable when you have tax settings configured
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
