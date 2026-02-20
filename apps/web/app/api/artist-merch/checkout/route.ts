import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@cronkwaters/db';
import { auth } from '@/auth';
import { getBaseUrl } from '@/lib/get-base-url';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

/**
 * Artist Merch Checkout API
 *
 * Creates Stripe checkout sessions for artist merchandise purchases.
 * Handles revenue split between platform and artist.
 */

interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 });
    }

    const session = await auth();
    const body = await request.json();
    const { items, artistUsername } = body as { items: CheckoutItem[]; artistUsername: string };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!artistUsername) {
      return NextResponse.json({ error: 'Artist username required' }, { status: 400 });
    }

    // Find the artist
    const artist = await prisma.user.findFirst({
      where: { username: { equals: artistUsername, mode: 'insensitive' } },
      select: { id: true, name: true, username: true },
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Fetch all products and calculate totals
    const productIds = items.map((i) => i.productId);
    const products = await prisma.artistMerchProduct.findMany({
      where: {
        id: { in: productIds },
        artistId: artist.id,
        isPublished: true,
        status: 'ACTIVE',
      },
      include: {
        variants: true,
      },
    });

    if (products.length === 0) {
      return NextResponse.json({ error: 'No valid products found' }, { status: 400 });
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: {
      productId: string;
      variantId?: string;
      quantity: number;
      unitPrice: number;
      productName: string;
      variantName?: string;
      artistId: string;
      basePrice: number;
      platformFeePercent: number;
    }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      let price = product.retailPrice;
      let variantName: string | undefined;

      // Check for variant-specific pricing
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          price = variant.retailPrice;
          variantName = [variant.size, variant.color].filter(Boolean).join(' / ');
        }
      }

      // Add to Stripe line items (create price on-the-fly)
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: variantName || product.description || undefined,
            images: product.mockupUrl ? [product.mockupUrl] : undefined,
            metadata: {
              artistId: artist.id,
              productId: product.id,
              variantId: item.variantId || '',
            },
          },
          unit_amount: price,
        },
        quantity: item.quantity,
      });

      // Track for order creation
      orderItems.push({
        productId: product.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: price,
        productName: product.name,
        variantName,
        artistId: artist.id,
        basePrice: product.basePrice,
        platformFeePercent: product.platformFeePercent,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
    }

    // Calculate totals for metadata
    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${getBaseUrl()}/u/${artistUsername}/merch?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/u/${artistUsername}/merch`,
      customer_email: session?.user?.email || undefined,
      metadata: {
        type: 'artist_merch',
        artistId: artist.id,
        artistUsername: artist.username || '',
        customerId: session?.user?.id || 'guest',
        orderItems: JSON.stringify(
          orderItems.map((i) => ({
            pid: i.productId,
            vid: i.variantId,
            qty: i.quantity,
            price: i.unitPrice,
            base: i.basePrice,
            fee: i.platformFeePercent,
          }))
        ),
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'NL', 'SE', 'NO', 'DK', 'FI'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 599, currency: 'usd' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1499, currency: 'usd' },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 4 },
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[ARTIST-CHECKOUT] Error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
