/**
 * Stripe Mock Utilities
 *
 * Provides mock implementations and helpers for testing Stripe integration.
 */

import { vi } from 'vitest';

/**
 * Mock Stripe API client
 */
export function createMockStripe() {
  return {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
          payment_intent: 'pi_test_123',
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          payment_status: 'paid',
          customer_details: {
            email: 'customer@example.com',
            name: 'Test Customer',
          },
          shipping_details: null,
          metadata: {},
        }),
        list: vi.fn().mockResolvedValue({ data: [] }),
      },
    },
    customers: {
      create: vi.fn().mockResolvedValue({
        id: 'cus_test_123',
        email: 'customer@example.com',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'cus_test_123',
        email: 'customer@example.com',
        subscriptions: { data: [] },
      }),
      update: vi.fn().mockResolvedValue({
        id: 'cus_test_123',
      }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    subscriptions: {
      create: vi.fn().mockResolvedValue(createMockSubscription()),
      retrieve: vi.fn().mockResolvedValue(createMockSubscription()),
      update: vi.fn().mockResolvedValue(createMockSubscription()),
      cancel: vi.fn().mockResolvedValue({
        ...createMockSubscription(),
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
      }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_payment_method',
        client_secret: 'pi_test_123_secret',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
      confirm: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
    },
    invoices: {
      retrieve: vi.fn().mockResolvedValue(createMockInvoice()),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    prices: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'price_test_123',
        unit_amount: 999,
        currency: 'usd',
      }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    products: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'prod_test_123',
        name: 'Test Product',
      }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://billing.stripe.com/test',
        }),
      },
    },
  };
}

/**
 * Create a mock Stripe subscription
 */
export function createMockSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_test_123',
    object: 'subscription',
    customer: 'cus_test_123',
    status: 'active',
    items: {
      data: [
        {
          id: 'si_test_123',
          price: {
            id: 'price_creator',
            product: 'prod_creator',
            unit_amount: 1499,
            currency: 'usd',
          },
        },
      ],
    },
    current_period_start: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    created: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    canceled_at: null,
    cancel_at_period_end: false,
    trial_start: null,
    trial_end: null,
    metadata: {},
    default_payment_method: 'pm_test_123',
    ...overrides,
  };
}

/**
 * Create a mock Stripe invoice
 */
export function createMockInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: 'in_test_123',
    object: 'invoice',
    customer: 'cus_test_123',
    subscription: 'sub_test_123',
    status: 'paid',
    amount_paid: 1499,
    amount_due: 1499,
    currency: 'usd',
    lines: {
      data: [
        {
          period: {
            start: Math.floor(Date.now() / 1000),
            end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      ],
    },
    created: Math.floor(Date.now() / 1000),
    next_payment_attempt: null,
    ...overrides,
  };
}

/**
 * Create a mock Stripe payment intent
 */
export function createMockPaymentIntent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pi_test_123',
    object: 'payment_intent',
    amount: 1499,
    currency: 'usd',
    status: 'succeeded',
    customer: 'cus_test_123',
    metadata: {},
    payment_method: 'pm_test_123',
    created: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

/**
 * Create a mock Stripe checkout session
 */
export function createMockCheckoutSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cs_test_123',
    object: 'checkout.session',
    mode: 'payment',
    status: 'complete',
    payment_status: 'paid',
    amount_total: 1499,
    currency: 'usd',
    customer: 'cus_test_123',
    customer_details: {
      email: 'customer@example.com',
      name: 'Test Customer',
    },
    payment_intent: 'pi_test_123',
    metadata: {},
    url: 'https://checkout.stripe.com/test',
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    ...overrides,
  };
}

/**
 * Create a mock Stripe webhook event
 */
export function createMockWebhookEvent(type: string, data: Record<string, unknown>) {
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: `req_${Math.random().toString(36).slice(2)}`,
      idempotency_key: null,
    },
    api_version: '2025-02-24.acacia',
  };
}

/**
 * Common webhook event creators
 */
export const webhookEvents = {
  subscriptionCreated: (subscription = createMockSubscription()) =>
    createMockWebhookEvent('customer.subscription.created', subscription),

  subscriptionUpdated: (subscription = createMockSubscription()) =>
    createMockWebhookEvent('customer.subscription.updated', subscription),

  subscriptionDeleted: (subscription = createMockSubscription({ status: 'canceled' })) =>
    createMockWebhookEvent('customer.subscription.deleted', subscription),

  invoicePaymentSucceeded: (invoice = createMockInvoice()) =>
    createMockWebhookEvent('invoice.payment_succeeded', invoice),

  invoicePaymentFailed: (invoice = createMockInvoice({ status: 'open' })) =>
    createMockWebhookEvent('invoice.payment_failed', invoice),

  checkoutSessionCompleted: (session = createMockCheckoutSession()) =>
    createMockWebhookEvent('checkout.session.completed', session),

  paymentIntentSucceeded: (paymentIntent = createMockPaymentIntent()) =>
    createMockWebhookEvent('payment_intent.succeeded', paymentIntent),

  trialWillEnd: (
    subscription = createMockSubscription({
      trial_end: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60,
    })
  ) => createMockWebhookEvent('customer.subscription.trial_will_end', subscription),
};

export type MockStripe = ReturnType<typeof createMockStripe>;

export default createMockStripe;
