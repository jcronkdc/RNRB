import { prisma } from '@cronkwaters/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  });
}

const webhookSecret = process.env.STRIPE_EMAIL_PRO_WEBHOOK_SECRET;

// Storage quota for Email Pro (10GB)
const EMAIL_PRO_STORAGE_QUOTA = BigInt(10 * 1024 * 1024 * 1024);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('[EMAIL-WEBHOOK] Missing signature or webhook secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[EMAIL-WEBHOOK] Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[EMAIL-WEBHOOK] Received event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Check if this is an Email Pro subscription
        if (session.metadata?.type !== 'email_pro') {
          console.log('[EMAIL-WEBHOOK] Not an Email Pro checkout, skipping');
          break;
        }

        const userId = session.metadata?.userId;
        if (!userId) {
          console.error('[EMAIL-WEBHOOK] No userId in session metadata');
          break;
        }

        // Get subscription details
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          console.error('[EMAIL-WEBHOOK] No subscription ID found');
          break;
        }

        // Update user with Email Pro subscription
        await prisma.user.update({
          where: { id: userId },
          data: {
            emailTier: 'PRO',
            emailProSubscriptionId: subscriptionId,
            emailProStatus: 'active',
            emailAccountsLimit: -1, // Unlimited
            emailStorageQuotaBytes: EMAIL_PRO_STORAGE_QUOTA,
          },
        });

        // Update any existing email account storage quota
        await prisma.emailAccount.updateMany({
          where: { userId },
          data: {
            storageQuotaBytes: EMAIL_PRO_STORAGE_QUOTA,
          },
        });

        console.log(`[EMAIL-WEBHOOK] Activated Email Pro for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user by subscription ID
        const user = await prisma.user.findFirst({
          where: { emailProSubscriptionId: subscription.id },
        });

        if (!user) {
          console.log('[EMAIL-WEBHOOK] No user found for subscription, might not be Email Pro');
          break;
        }

        // Update status based on subscription status
        const status = subscription.status;
        const isActive = status === 'active' || status === 'trialing';

        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailProStatus: status,
            emailTier: isActive ? 'PRO' : 'BASIC',
            emailAccountsLimit: isActive ? -1 : 1,
            emailStorageQuotaBytes: isActive
              ? EMAIL_PRO_STORAGE_QUOTA
              : BigInt(1 * 1024 * 1024 * 1024),
          },
        });

        console.log(`[EMAIL-WEBHOOK] Updated Email Pro status for user ${user.id}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user by subscription ID
        const user = await prisma.user.findFirst({
          where: { emailProSubscriptionId: subscription.id },
        });

        if (!user) {
          console.log('[EMAIL-WEBHOOK] No user found for deleted subscription');
          break;
        }

        // Downgrade to BASIC
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailTier: 'BASIC',
            emailProSubscriptionId: null,
            emailProStatus: 'canceled',
            emailAccountsLimit: 1,
            emailStorageQuotaBytes: BigInt(1 * 1024 * 1024 * 1024),
          },
        });

        // Downgrade email account storage (keep the account, just reduce quota)
        await prisma.emailAccount.updateMany({
          where: { userId: user.id },
          data: {
            storageQuotaBytes: BigInt(1 * 1024 * 1024 * 1024),
          },
        });

        console.log(`[EMAIL-WEBHOOK] Downgraded Email Pro for user ${user.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) break;

        const subscriptionId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;

        const user = await prisma.user.findFirst({
          where: { emailProSubscriptionId: subscriptionId },
        });

        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailProStatus: 'past_due',
          },
        });

        console.log(`[EMAIL-WEBHOOK] Payment failed for user ${user.id}`);
        break;
      }

      default:
        console.log(`[EMAIL-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[EMAIL-WEBHOOK] Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
