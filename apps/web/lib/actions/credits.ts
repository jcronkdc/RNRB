'use server';

import { prisma } from '@cronkwaters/db';
import { type CreditType } from '@prisma/client';

import { getOrCreateStripeCustomer } from '@/lib/actions/subscriptions';
import { getCurrentUser } from '@/lib/session';
import { createOneTimeCheckoutSession } from '@/lib/stripe-subscriptions';

type CreditKind = 'ai' | 'video' | 'storage' | 'image';

const CREDIT_PRODUCTS = {
  // AI Credits
  ai_100: {
    label: '+100 AI Requests',
    type: 'ai' as CreditKind,
    amount: 100,
    priceEnv: 'STRIPE_PRICE_ID_AI_100',
    description: 'Extra AI requests that expire at the end of this cycle.',
  },

  // Video Packs (tiered for different use cases)
  video_120: {
    label: 'Starter Pack (2hr)',
    type: 'video' as CreditKind,
    amount: 120, // minutes
    priceEnv: 'STRIPE_PRICE_ID_VIDEO_120',
    description: 'Perfect for a quick band check-in or remote writing session.',
  },
  video_600: {
    label: 'Band Practice (10hr)',
    type: 'video' as CreditKind,
    amount: 600, // minutes
    priceEnv: 'STRIPE_PRICE_ID_VIDEO_600',
    description: 'Great for regular band rehearsals and writing sessions.',
  },
  video_1800: {
    label: 'Studio Sessions (30hr)',
    type: 'video' as CreditKind,
    amount: 1800, // minutes
    priceEnv: 'STRIPE_PRICE_ID_VIDEO_1800',
    description: 'For serious remote production, mixing sessions, and client work.',
  },

  // Image Credits
  image_25: {
    label: '+25 Image Credits',
    type: 'image' as CreditKind,
    amount: 25,
    priceEnv: 'STRIPE_PRICE_ID_IMAGE_25',
    description: 'Generate 25 additional album artworks this cycle.',
  },
  image_100: {
    label: '+100 Image Credits',
    type: 'image' as CreditKind,
    amount: 100,
    priceEnv: 'STRIPE_PRICE_ID_IMAGE_100',
    description: 'Best value! 100 album art generations for creative freedom.',
  },

  // Storage (permanent)
  storage_25: {
    label: '+25 GB Storage',
    type: 'storage' as CreditKind,
    amount: 25,
    priceEnv: 'STRIPE_PRICE_ID_STORAGE_25',
    description: 'Permanent storage expansion focused on affordability.',
  },
  storage_100: {
    label: '+100 GB Storage',
    type: 'storage' as CreditKind,
    amount: 100,
    priceEnv: 'STRIPE_PRICE_ID_STORAGE_100',
    description: 'Permanent storage expansion for growing studios.',
  },
  storage_250: {
    label: '+250 GB Storage',
    type: 'storage' as CreditKind,
    amount: 250,
    priceEnv: 'STRIPE_PRICE_ID_STORAGE_250',
    description: 'Best value add-on for large teams.',
  },
} as const;

export type CreditProductKey = keyof typeof CREDIT_PRODUCTS;

export async function createCreditCheckout(productKey: CreditProductKey) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error('Authentication required');
  }

  const product = CREDIT_PRODUCTS[productKey];
  if (!product) {
    throw new Error('Invalid credit type');
  }

  const priceId = process.env[product.priceEnv as keyof NodeJS.ProcessEnv];
  if (!priceId) {
    throw new Error(`${product.priceEnv} is not configured in environment variables`);
  }

  const customerId = await getOrCreateStripeCustomer();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const metadata: Record<string, string> = {
    userId: user.id,
    creditType: product.type,
    creditAmount: String(product.amount),
    creditLabel: product.label,
  };

  const session = await createOneTimeCheckoutSession(
    customerId,
    priceId,
    `${appUrl}/settings/usage?success=credits`,
    `${appUrl}/settings/usage?canceled=credits`,
    metadata
  );

  // Track pending purchase for auditing
  await prisma.creditPurchase.upsert({
    where: { stripeSessionId: session.id },
    update: {
      status: 'pending',
      userId: user.id,
      type: product.type as CreditType,
      unitAmount: product.amount,
      storageAmount: product.type === 'storage' ? product.amount : null,
      priceCents: session.amount_total ?? 0,
    },
    create: {
      userId: user.id,
      type: product.type as CreditType,
      unitAmount: product.amount,
      storageAmount: product.type === 'storage' ? product.amount : null,
      priceCents: session.amount_total ?? 0,
      stripeSessionId: session.id,
      status: 'pending',
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return session.url;
}
