#!/usr/bin/env npx ts-node
/**
 * RNRB Merch Store - Stripe Webhook Setup Script
 *
 * Run this script to automatically create the webhook endpoint in Stripe:
 *   npx ts-node scripts/setup-stripe-webhook.ts
 *
 * Or with environment variables:
 *   STRIPE_SECRET_KEY=sk_live_xxx WEBHOOK_URL=https://yourdomain.com npx ts-node scripts/setup-stripe-webhook.ts
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error(
    '   Usage: STRIPE_SECRET_KEY=sk_live_xxx npx ts-node scripts/setup-stripe-webhook.ts'
  );
  process.exit(1);
}
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://rocknrollbasement.com';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
});

async function setupWebhook() {
  console.log('🔧 Setting up Stripe webhook for RNRB Merch Store...\n');

  const webhookUrl = `${WEBHOOK_URL}/api/merch/webhook`;

  // Events we need to listen for
  const enabledEvents: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'checkout.session.expired',
  ];

  try {
    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const existing = existingWebhooks.data.find((w) => w.url === webhookUrl);

    if (existing) {
      console.log('⚠️  Webhook already exists!');
      console.log(`   ID: ${existing.id}`);
      console.log(`   URL: ${existing.url}`);
      console.log(`   Status: ${existing.status}`);
      console.log('\n📋 To get the signing secret, visit:');
      console.log(`   https://dashboard.stripe.com/webhooks/${existing.id}`);
      return;
    }

    // Create new webhook endpoint
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: enabledEvents,
      description: 'RNRB Platform Merch Store - Order fulfillment webhook',
      metadata: {
        created_by: 'setup-script',
        purpose: 'merch-store',
      },
    });

    console.log('✅ Webhook created successfully!\n');
    console.log('📋 Webhook Details:');
    console.log(`   ID: ${webhook.id}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Status: ${webhook.status}`);
    console.log(`   Events: ${enabledEvents.join(', ')}`);
    console.log(`\n🔑 Signing Secret: ${webhook.secret}`);
    console.log('\n⚠️  IMPORTANT: Copy the signing secret above and add it to your .env.local:');
    console.log(`   STRIPE_MERCH_WEBHOOK_SECRET=${webhook.secret}`);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('❌ Stripe Error:', error.message);
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

setupWebhook();
