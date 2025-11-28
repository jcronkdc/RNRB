import { prisma } from '@cronkwaters/db';
import { CreditType } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { verifyWebhookSignature } from '@/lib/stripe-subscriptions';
import { sendEmail, emailTemplates } from '@/lib/email';

// Disable body parsing - we need the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found in headers');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Stripe webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event.data.object as Stripe.Subscription);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Determine tier from price ID
    const priceId = subscription.items.data[0]?.price.id;
    let tier = 'free';

    if (priceId === process.env.STRIPE_PRICE_ID_CREATOR) {
      tier = 'creator';
    } else if (priceId === process.env.STRIPE_PRICE_ID_STUDIO) {
      tier = 'studio';
    }

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionTier: tier,
        subscriptionStatus: subscription.status,
        subscriptionStartedAt: new Date(subscription.created * 1000),
        subscriptionEndsAt: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        subscriptionRenewsAt: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        subscriptionCanceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    });

    console.log('✅ Subscription updated for user:', user.email, '→', tier);
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Move user back to free tier
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: new Date(),
      },
    });

    console.log('✅ Subscription deleted for user:', user.email);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true, name: true, subscriptionTier: true },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    console.log('✅ Payment succeeded for user:', user.email);

    // Send payment success email
    const amount = invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : '0.00';
    const nextBillingDate = invoice.lines.data[0]?.period?.end
      ? new Date(invoice.lines.data[0].period.end * 1000).toLocaleDateString()
      : undefined;

    const emailOptions = emailTemplates.paymentSuccess({
      email: user.email,
      userName: user.name || 'User',
      amount,
      subscriptionTier: user.subscriptionTier || 'free',
      nextBillingDate,
    });

    const emailResult = await sendEmail(emailOptions);
    if (!emailResult.success) {
      console.warn('Failed to send payment success email:', emailResult.error);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Update subscription status to past_due
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    });

    console.log('⚠️ Payment failed for user:', user.email);

    // Send payment failed email
    const amount = invoice.amount_due ? (invoice.amount_due / 100).toFixed(2) : '0.00';
    const retryDate = invoice.next_payment_attempt
      ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
      : undefined;

    const emailOptions = emailTemplates.paymentFailed({
      email: user.email,
      userName: user.name || 'User',
      amount,
      subscriptionTier: user.subscriptionTier || 'free',
      retryDate,
    });

    const emailResult = await sendEmail(emailOptions);
    if (!emailResult.success) {
      console.warn('Failed to send payment failed email:', emailResult.error);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

/**
 * Handle trial ending soon
 */
async function handleTrialEnding(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true, name: true, subscriptionTier: true },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    console.log('⏰ Trial ending soon for user:', user.email);

    // Send trial ending email
    const trialEndDate = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toLocaleDateString()
      : new Date().toLocaleDateString();

    const emailOptions = emailTemplates.trialEnding({
      email: user.email,
      userName: user.name || 'User',
      trialEndDate,
      subscriptionTier: user.subscriptionTier || 'free',
    });

    const emailResult = await sendEmail(emailOptions);
    if (!emailResult.success) {
      console.warn('Failed to send trial ending email:', emailResult.error);
    }
  } catch (error) {
    console.error('Error handling trial ending:', error);
    throw error;
  }
}

/**
 * Handle credit purchases (one-time checkout sessions)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    if (session.mode !== 'payment') {
      return;
    }

    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const creditType = metadata.creditType as 'ai' | 'video' | 'storage' | undefined;
    const creditAmount = Number(metadata.creditAmount || 0);

    if (!userId || !creditType || !creditAmount) {
      console.warn('Checkout session missing credit metadata', session.id);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      console.error('User not found for credit purchase:', userId);
      return;
    }

    // Apply credits
    if (creditType === 'ai') {
      await prisma.user.update({
        where: { id: userId },
        data: { aiRequestsBonus: { increment: creditAmount } },
      });
    } else if (creditType === 'video') {
      await prisma.user.update({
        where: { id: userId },
        data: { videoMinutesBonus: { increment: creditAmount } },
      });
    } else if (creditType === 'storage') {
      await prisma.user.update({
        where: { id: userId },
        data: { storageBonusGB: { increment: creditAmount } },
      });
    }

    await prisma.creditPurchase.upsert({
      where: { stripeSessionId: session.id },
      update: {
        status: 'fulfilled',
        fulfilledAt: new Date(),
        priceCents: session.amount_total ?? 0,
        type: creditType as CreditType,
        unitAmount: creditAmount,
        storageAmount: creditType === 'storage' ? creditAmount : null,
      },
      create: {
        userId,
        type: creditType as CreditType,
        unitAmount: creditAmount,
        storageAmount: creditType === 'storage' ? creditAmount : null,
        priceCents: session.amount_total ?? 0,
        stripeSessionId: session.id,
        status: 'fulfilled',
        fulfilledAt: new Date(),
      },
    });

    console.log(`✅ Applied ${creditAmount} ${creditType} credits to user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}
