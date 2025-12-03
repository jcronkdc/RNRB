/**
 * STRIPE USER UTILITIES
 *
 * Secure Stripe access scoped to authenticated users.
 * NEVER expose raw Stripe queries to users - always scope by their customer ID.
 *
 * Usage:
 *   import { getUserStripeData, getUserSubscription, getUserInvoices } from '@/lib/stripe-user';
 *
 *   // In API routes:
 *   const { subscription } = await getUserStripeData(userId);
 *   const invoices = await getUserInvoices(userId, { limit: 10 });
 */

import { prisma } from '@cronkwaters/db';
import Stripe from 'stripe';

import { AppError } from '@/lib/errors';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * Get user's Stripe customer ID (required for all Stripe operations)
 * Throws AppError if user not found or no Stripe customer ID
 */
export async function getStripeCustomerId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  if (!user.stripeCustomerId) {
    throw AppError.badRequest('User has no billing account');
  }

  return user.stripeCustomerId;
}

/**
 * Get or create a Stripe customer for a user
 * Safe to call multiple times - idempotent
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  // Return existing customer ID
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      userId: user.id,
    },
  });

  // Save customer ID to database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ============================================
// SUBSCRIPTION DATA (Scoped to User)
// ============================================

export interface UserSubscriptionData {
  hasSubscription: boolean;
  subscription: Stripe.Subscription | null;
  tier: 'free' | 'creator' | 'studio';
  status: Stripe.Subscription.Status | 'none';
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Get user's subscription details
 * Returns safe, scoped data - never exposes other users' info
 */
export async function getUserSubscription(userId: string): Promise<UserSubscriptionData> {
  let customerId: string;

  try {
    customerId = await getStripeCustomerId(userId);
  } catch {
    // User has no Stripe customer - return free tier
    return {
      hasSubscription: false,
      subscription: null,
      tier: 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  // Fetch subscriptions for THIS customer only
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 1,
  });

  const subscription = subscriptions.data[0] || null;

  if (!subscription) {
    return {
      hasSubscription: false,
      subscription: null,
      tier: 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  // Determine tier from price ID
  const priceId = subscription.items.data[0]?.price.id;
  let tier: 'free' | 'creator' | 'studio' = 'free';

  if (priceId === process.env.STRIPE_PRICE_ID_CREATOR) {
    tier = 'creator';
  } else if (priceId === process.env.STRIPE_PRICE_ID_STUDIO) {
    tier = 'studio';
  }

  return {
    hasSubscription: true,
    subscription,
    tier,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

// ============================================
// INVOICE DATA (Scoped to User)
// ============================================

export interface UserInvoice {
  id: string;
  number: string | null;
  status: Stripe.Invoice.Status | null;
  amount: number;
  currency: string;
  created: Date;
  pdfUrl: string | null;
  hostedInvoiceUrl: string | null;
}

/**
 * Get user's invoice history
 * Returns sanitized invoice data - never exposes internal Stripe IDs
 */
export async function getUserInvoices(
  userId: string,
  options: { limit?: number; startingAfter?: string } = {}
): Promise<{ invoices: UserInvoice[]; hasMore: boolean }> {
  let customerId: string;

  try {
    customerId = await getStripeCustomerId(userId);
  } catch {
    return { invoices: [], hasMore: false };
  }

  const { limit = 10, startingAfter } = options;

  // Fetch invoices for THIS customer only
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: limit + 1, // Fetch one extra to check if there are more
    starting_after: startingAfter,
  });

  const hasMore = invoices.data.length > limit;
  const invoiceData = invoices.data.slice(0, limit);

  return {
    invoices: invoiceData.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount: inv.amount_paid / 100,
      currency: inv.currency.toUpperCase(),
      created: new Date(inv.created * 1000),
      pdfUrl: inv.invoice_pdf,
      hostedInvoiceUrl: inv.hosted_invoice_url,
    })),
    hasMore,
  };
}

// ============================================
// PAYMENT METHOD DATA (Scoped to User)
// ============================================

export interface UserPaymentMethod {
  id: string;
  type: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
}

/**
 * Get user's payment methods
 * Returns sanitized card data - only safe fields
 */
export async function getUserPaymentMethods(userId: string): Promise<UserPaymentMethod[]> {
  let customerId: string;

  try {
    customerId = await getStripeCustomerId(userId);
  } catch {
    return [];
  }

  // Get customer's default payment method
  const customer = await stripe.customers.retrieve(customerId);
  const defaultPaymentMethodId =
    typeof customer !== 'string' && !customer.deleted
      ? typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings?.default_payment_method?.id
      : null;

  // Fetch payment methods for THIS customer only
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    type: pm.type,
    brand: pm.card?.brand || null,
    last4: pm.card?.last4 || null,
    expMonth: pm.card?.exp_month || null,
    expYear: pm.card?.exp_year || null,
    isDefault: pm.id === defaultPaymentMethodId,
  }));
}

// ============================================
// BILLING PORTAL (Scoped to User)
// ============================================

/**
 * Create a billing portal session for the user
 * Allows user to manage their own subscription securely
 */
export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

// ============================================
// CHECKOUT SESSION (Scoped to User)
// ============================================

/**
 * Create a checkout session for upgrading subscription
 * Scoped to the authenticated user
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string }> {
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  if (!session.url) {
    throw AppError.internal('Failed to create checkout session');
  }

  return { url: session.url };
}

// ============================================
// STRIPE CONNECT (For Artist Payouts - Scoped to User)
// ============================================

/**
 * Get user's Stripe Connect account status
 * For artists receiving payouts
 */
export async function getUserConnectAccount(
  userId: string
): Promise<{ hasAccount: boolean; accountId: string | null; status: string | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeConnectAccountId: true },
  });

  if (!user?.stripeConnectAccountId) {
    return { hasAccount: false, accountId: null, status: null };
  }

  const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);

  return {
    hasAccount: true,
    accountId: account.id,
    status: account.charges_enabled ? 'active' : 'pending',
  };
}
