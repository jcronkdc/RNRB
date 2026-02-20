'use server';

import { prisma } from '@cronkwaters/db';
import { revalidatePath } from 'next/cache';
import type Stripe from 'stripe';

import { getCurrentUser } from '@/lib/session';
import {
  createStripeCustomer,
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscription,
  cancelSubscription as stripeCancelSubscription,
  reactivateSubscription as stripeReactivateSubscription,
} from '@/lib/stripe-subscriptions';

/**
 * Get current user's subscription details
 */
export async function getUserSubscription() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartedAt: true,
        subscriptionEndsAt: true,
        subscriptionCanceledAt: true,
        subscriptionRenewsAt: true,
      },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    return dbUser;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

/**
 * Get or create Stripe customer for current user
 */
export async function getOrCreateStripeCustomer() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
      },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // If user already has Stripe customer ID, return it
    if (dbUser.stripeCustomerId) {
      return dbUser.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await createStripeCustomer(dbUser.email, dbUser.name);

    // Save customer ID to database
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  } catch (error) {
    console.error('Error getting/creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create checkout session for subscription upgrade
 */
export async function createSubscriptionCheckout(tier: 'creator' | 'studio'): Promise<string> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const customerId = await getOrCreateStripeCustomer();

    // Get price ID from environment
    const priceId =
      tier === 'creator' ? process.env.STRIPE_PRICE_ID_CREATOR : process.env.STRIPE_PRICE_ID_STUDIO;

    if (!priceId) {
      throw new Error(`Price ID for ${tier} tier is not configured`);
    }

    const { getBaseUrl } = await import('@/lib/get-base-url');
    const appUrl = getBaseUrl();

    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${appUrl}/settings/billing?success=true`,
      `${appUrl}/settings/billing?canceled=true`,
      user.id
    );

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return session.url;
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(): Promise<string> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!dbUser?.stripeCustomerId) {
      throw new Error('No Stripe customer found. Please subscribe first.');
    }

    const { getBaseUrl } = await import('@/lib/get-base-url');
    const appUrl = getBaseUrl();

    const session = await createCustomerPortalSession(
      dbUser.stripeCustomerId,
      `${appUrl}/settings/billing`
    );

    if (!session.url) {
      throw new Error('Failed to create portal session URL');
    }

    return session.url;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
}

/**
 * Get subscription details with live Stripe data
 */
export async function getSubscriptionDetails() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartedAt: true,
        subscriptionEndsAt: true,
        subscriptionCanceledAt: true,
        subscriptionRenewsAt: true,
      },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    // If user has active subscription, get live data from Stripe
    let stripeSubscription: Stripe.Subscription | null = null;
    if (dbUser.stripeSubscriptionId) {
      try {
        stripeSubscription = await getSubscription(dbUser.stripeSubscriptionId);
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
        // Continue with database data only
      }
    }

    return {
      ...dbUser,
      stripeSubscription,
    };
  } catch (error) {
    console.error('Error getting subscription details:', error);
    throw error;
  }
}

/**
 * Cancel user's subscription
 */
export async function cancelUserSubscription() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        stripeSubscriptionId: true,
      },
    });

    if (!dbUser?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    // Cancel in Stripe (at period end)
    const subscription = await stripeCancelSubscription(dbUser.stripeSubscriptionId);

    // Update database
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        subscriptionCanceledAt: new Date(),
        subscriptionStatus: subscription.status,
      },
    });

    revalidatePath('/settings/billing');

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateUserSubscription() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        stripeSubscriptionId: true,
      },
    });

    if (!dbUser?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    // Reactivate in Stripe
    const subscription = await stripeReactivateSubscription(dbUser.stripeSubscriptionId);

    // Update database
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        subscriptionCanceledAt: null,
        subscriptionStatus: subscription.status,
      },
    });

    revalidatePath('/settings/billing');

    return { success: true };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
}

/**
 * Check if user has access to tier features
 */
export async function checkSubscriptionAccess(
  requiredTier: 'free' | 'creator' | 'studio'
): Promise<boolean> {
  try {
    const subscription = await getUserSubscription();

    const tierHierarchy = {
      free: 0,
      creator: 1,
      studio: 2,
    };

    const userTierLevel =
      tierHierarchy[subscription.subscriptionTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier];

    return userTierLevel >= requiredTierLevel;
  } catch (error) {
    console.error('Error checking subscription access:', error);
    return false;
  }
}
