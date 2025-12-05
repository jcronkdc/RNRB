import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { handleApiError } from '@/lib/errors';
import { checkStrictLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';

// Lazy initialization to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

// POST - Create Stripe Connect account and onboarding link
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkStrictLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const user = await requireAuth();

    // Get instructor profile
    const instructor = await prisma.masterclassInstructor.findUnique({
      where: { userId: user.id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'You must be an instructor to set up payouts' },
        { status: 403 }
      );
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.cronkwaters.com';

    const stripe = getStripe();

    // If already has account, create account link for dashboard
    if (instructor.stripeAccountId) {
      // Check if onboarding is complete
      const account = await stripe.accounts.retrieve(instructor.stripeAccountId);

      if (account.details_submitted) {
        // Create dashboard link
        const loginLink = await stripe.accounts.createLoginLink(instructor.stripeAccountId);
        return NextResponse.json({ dashboardUrl: loginLink.url });
      }

      // Continue onboarding
      const accountLink = await stripe.accountLinks.create({
        account: instructor.stripeAccountId,
        refresh_url: `${origin}/masterclasses/instructor/settings?refresh=true`,
        return_url: `${origin}/masterclasses/instructor/settings?connected=true`,
        type: 'account_onboarding',
      });

      return NextResponse.json({ onboardingUrl: accountLink.url });
    }

    // Get user email
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create new Connected Account
    const account = await stripe.accounts.create({
      type: 'express',
      email: dbUser.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: instructor.displayName,
        product_description: `Masterclass instructor on CronkWaters - ${instructor.headline || 'Music education'}`,
        url: `${origin}/masterclasses/instructors/${instructor.id}`,
      },
      metadata: {
        instructorId: instructor.id,
        userId: user.id,
        platform: 'cronkwaters',
      },
    });

    // Save account ID
    await prisma.masterclassInstructor.update({
      where: { id: instructor.id },
      data: { stripeAccountId: account.id },
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/masterclasses/instructor/settings?refresh=true`,
      return_url: `${origin}/masterclasses/instructor/settings?connected=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ onboardingUrl: accountLink.url });
  } catch (error) {
    return handleApiError(error, { route: '/api/instructors/stripe-connect', method: 'POST' });
  }
}

// GET - Get Stripe Connect account status
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const instructor = await prisma.masterclassInstructor.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        payoutPercentage: true,
        totalEarnings: true,
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'You must be an instructor to check payout status' },
        { status: 403 }
      );
    }

    if (!instructor.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
      });
    }

    // Get account details from Stripe
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(instructor.stripeAccountId);

    // Update onboarded status if changed
    if (account.details_submitted && !instructor.stripeOnboarded) {
      await prisma.masterclassInstructor.update({
        where: { id: instructor.id },
        data: { stripeOnboarded: true },
      });
    }

    // Get balance
    let balance = null;
    if (account.details_submitted) {
      try {
        balance = await stripe.balance.retrieve({
          stripeAccount: instructor.stripeAccountId,
        });
      } catch (e) {
        console.warn('Could not retrieve balance:', e);
      }
    }

    return NextResponse.json({
      connected: true,
      onboarded: account.details_submitted,
      accountId: instructor.stripeAccountId,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutPercentage: instructor.payoutPercentage,
      totalEarnings: instructor.totalEarnings,
      balance: balance
        ? {
            available: balance.available.map((b) => ({
              amount: b.amount / 100,
              currency: b.currency.toUpperCase(),
            })),
            pending: balance.pending.map((b) => ({
              amount: b.amount / 100,
              currency: b.currency.toUpperCase(),
            })),
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/instructors/stripe-connect', method: 'GET' });
  }
}
