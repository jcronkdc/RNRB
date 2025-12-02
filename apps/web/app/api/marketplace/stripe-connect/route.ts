/**
 * Stripe Connect for Marketplace
 *
 * Handles provider onboarding to receive payments
 * Platform takes 5-10% fee on each transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

/**
 * POST - Create Stripe Connect account and onboarding link
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Create a provider profile first' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rocknrollbasement.com';

    // Create or retrieve Stripe Connect account
    let accountId = provider.stripeConnectId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: provider.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: provider.displayName,
          product_description: 'Music production and audio services',
          mcc: '7929', // Bands, Orchestras, Entertainers
        },
        metadata: {
          providerId: provider.id,
          userId: session.user.id,
        },
      });

      accountId = account.id;

      await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: { stripeConnectId: accountId },
      });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/marketplace/providers/${provider.slug}/edit?stripe=refresh`,
      return_url: `${baseUrl}/marketplace/providers/${provider.slug}/edit?stripe=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    });
  } catch (error) {
    console.error('[STRIPE_CONNECT] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * GET - Check Stripe Connect status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider?.stripeConnectId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
      });
    }

    const account = await stripe.accounts.retrieve(provider.stripeConnectId);

    const isOnboarded = account.details_submitted && account.charges_enabled;

    // Update provider if onboarding status changed
    if (isOnboarded !== provider.stripeConnectOnboarded) {
      await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: {
          stripeConnectOnboarded: isOnboarded,
          isActive: isOnboarded, // Activate when onboarded
        },
      });
    }

    return NextResponse.json({
      connected: true,
      onboarded: isOnboarded,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      accountId: provider.stripeConnectId,
    });
  } catch (error) {
    console.error('[STRIPE_CONNECT] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
