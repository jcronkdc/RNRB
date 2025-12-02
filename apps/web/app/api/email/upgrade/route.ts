import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Email Pro Price ID from Stripe
const EMAIL_PRO_PRICE_ID = process.env.STRIPE_EMAIL_PRO_PRICE_ID;

/**
 * POST /api/email/upgrade
 * Create a Stripe Checkout session for Email Pro subscription
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        emailTier: true,
        emailProSubscriptionId: true,
        emailProStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has Email Pro
    if (user.emailProStatus === 'active') {
      return NextResponse.json({ error: 'You already have Email Pro active' }, { status: 400 });
    }

    // User needs to be a paid member first
    if (user.subscriptionTier === 'free' || user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        {
          error: 'Email Pro requires a paid membership',
          upgradeRequired: true,
          message: 'Please upgrade to a paid membership first to access Email Pro',
        },
        { status: 403 }
      );
    }

    if (!EMAIL_PRO_PRICE_ID) {
      console.error('[EMAIL-PRO] Missing STRIPE_EMAIL_PRO_PRICE_ID');
      return NextResponse.json({ error: 'Email Pro is not configured' }, { status: 500 });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Checkout Session for Email Pro subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: EMAIL_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com'}/settings/email?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com'}/settings/email?upgrade=cancelled`,
      subscription_data: {
        metadata: {
          userId: user.id,
          type: 'email_pro',
        },
      },
      metadata: {
        userId: user.id,
        type: 'email_pro',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('[EMAIL-PRO] Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

/**
 * GET /api/email/upgrade
 * Get current Email Pro subscription status
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        emailTier: true,
        emailProSubscriptionId: true,
        emailProStatus: true,
        emailAccountsLimit: true,
        emailStorageQuotaBytes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine eligibility
    const isPaidMember =
      ['creator', 'studio'].includes(user.subscriptionTier) && user.subscriptionStatus === 'active';

    const hasEmailPro = user.emailProStatus === 'active';

    return NextResponse.json({
      currentTier: user.emailTier,
      hasEmailPro,
      isPaidMember,
      canUpgrade: isPaidMember && !hasEmailPro,
      benefits: {
        basic: {
          accounts: 1,
          storage: '1GB',
          price: 'Included with membership',
        },
        pro: {
          accounts: 'Unlimited',
          storage: '10GB',
          price: '$3/month',
          features: [
            '10GB storage per account',
            'Multiple email aliases',
            'Priority email delivery',
            'Advanced filtering rules',
            'Priority support',
          ],
        },
      },
    });
  } catch (error) {
    console.error('[EMAIL-PRO] Status error:', error);
    return NextResponse.json({ error: 'Failed to get upgrade status' }, { status: 500 });
  }
}
