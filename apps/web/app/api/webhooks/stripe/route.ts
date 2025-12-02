import { prisma } from '@cronkwaters/db';
import { type CreditType } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { sendEmail, emailTemplates } from '@/lib/email';
import { verifyWebhookSignature } from '@/lib/stripe-subscriptions';

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

      case 'payment_intent.succeeded':
        await handleMerchPaymentSucceeded(event.data.object as Stripe.PaymentIntent);
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

// Email Pro storage quota (10GB)
const EMAIL_PRO_STORAGE_QUOTA = BigInt(10 * 1024 * 1024 * 1024);

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Check if this is an Email Pro subscription
    if (subscription.metadata?.type === 'email_pro') {
      await handleEmailProSubscriptionUpdate(subscription);
      return;
    }

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
 * Handle Email Pro subscription updates
 */
async function handleEmailProSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('Email Pro subscription missing userId in metadata');
      return;
    }

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailTier: isActive ? 'PRO' : 'BASIC',
        emailProSubscriptionId: subscription.id,
        emailProStatus: subscription.status,
        emailAccountsLimit: isActive ? -1 : 1,
        emailStorageQuotaBytes: isActive ? EMAIL_PRO_STORAGE_QUOTA : BigInt(1 * 1024 * 1024 * 1024),
      },
    });

    // Update any existing email account storage quota
    if (isActive) {
      await prisma.emailAccount.updateMany({
        where: { userId },
        data: {
          storageQuotaBytes: EMAIL_PRO_STORAGE_QUOTA,
        },
      });
    }

    console.log(`✅ Email Pro subscription ${subscription.status} for user ${userId}`);
  } catch (error) {
    console.error('Error handling Email Pro subscription update:', error);
    throw error;
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Check if this is an Email Pro subscription
    if (subscription.metadata?.type === 'email_pro') {
      await handleEmailProSubscriptionDeleted(subscription);
      return;
    }

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
 * Handle Email Pro subscription deleted
 */
async function handleEmailProSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      // Try to find by subscription ID
      const user = await prisma.user.findFirst({
        where: { emailProSubscriptionId: subscription.id },
      });

      if (!user) {
        console.error('User not found for Email Pro subscription:', subscription.id);
        return;
      }

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

      // Downgrade email account storage
      await prisma.emailAccount.updateMany({
        where: { userId: user.id },
        data: {
          storageQuotaBytes: BigInt(1 * 1024 * 1024 * 1024),
        },
      });

      console.log(`✅ Email Pro subscription canceled for user ${user.id}`);
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailTier: 'BASIC',
        emailProSubscriptionId: null,
        emailProStatus: 'canceled',
        emailAccountsLimit: 1,
        emailStorageQuotaBytes: BigInt(1 * 1024 * 1024 * 1024),
      },
    });

    // Downgrade email account storage
    await prisma.emailAccount.updateMany({
      where: { userId },
      data: {
        storageQuotaBytes: BigInt(1 * 1024 * 1024 * 1024),
      },
    });

    console.log(`✅ Email Pro subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Error handling Email Pro subscription deletion:', error);
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
 * Handle credit purchases, masterclass enrollments, merch orders, and Email Pro subscriptions
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};

    // Check if this is an Email Pro subscription checkout
    if (metadata.type === 'email_pro' && session.mode === 'subscription') {
      await handleEmailProCheckoutCompleted(session);
      return;
    }

    if (session.mode !== 'payment') {
      return;
    }

    // Check if this is a masterclass enrollment
    if (metadata.type === 'masterclass_enrollment') {
      await handleMasterclassEnrollmentCompleted(session);
      return;
    }

    // Check if this is a merch order
    if (metadata.orderId) {
      await handleMerchCheckoutCompleted(session);
      return;
    }

    // Handle credit purchases
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

    // Apply credits based on type
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
    } else if (creditType === 'image') {
      await prisma.user.update({
        where: { id: userId },
        data: { imageCreditsBonus: { increment: creditAmount } },
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

/**
 * Handle merch checkout completion
 * This handler extracts customer details from the checkout session.
 * It's safe to call multiple times and preserves existing data.
 */
async function handleMerchCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const orderId = metadata.orderId;
    const orderNumber = metadata.orderNumber;

    if (!orderId) {
      console.warn('Merch checkout session missing orderId', session.id);
      return;
    }

    // Get current order to check existing data
    const existingOrder = await prisma.merchOrder.findUnique({
      where: { id: orderId },
      select: {
        customerEmail: true,
        customerName: true,
        shippingAddress: true,
        paymentStatus: true,
        stripePaymentIntentId: true,
      },
    });

    if (!existingOrder) {
      console.warn('Merch order not found:', orderId);
      return;
    }

    // Get customer details from Stripe session
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // Note: In Stripe API 2025-02-24.acacia, shipping_details was moved to collected_information.shipping_details
    // The top-level shipping_details field was fully removed in 2025-03-31.basil
    // Use type assertion since the SDK types may not reflect this change yet
    const collectedInfo = (
      session as unknown as {
        collected_information?: { shipping_details?: { address?: Stripe.Address } };
      }
    ).collected_information;
    const shippingAddress = collectedInfo?.shipping_details?.address;

    // Build update data - only update fields that have values or need to be set
    // Preserve existing customer details if new values are missing (race condition protection)
    // Use Record type to allow dynamic updates while maintaining type safety with Prisma
    const updateData: Record<string, unknown> = {};

    // Always update payment status if not already paid
    if (existingOrder.paymentStatus !== 'paid') {
      updateData.status = 'confirmed';
      updateData.paymentStatus = 'paid';
      updateData.paidAt = new Date();
    }

    // CRITICAL: Always update customer details from checkout session when available
    // This ensures customer details are captured regardless of webhook order.
    // If payment_intent.succeeded fired first and set paymentStatus to 'paid',
    // we still need to capture customer details from checkout.session.completed.

    // Update customer email - always use checkout session value if available
    // This overwrites any existing value to ensure we have the most up-to-date info from Stripe
    if (customerEmail) {
      updateData.customerEmail = customerEmail;
    }
    // Note: We don't set to null if missing - preserve existing value as fallback

    // Update customer name - always use checkout session value if available
    if (customerName) {
      updateData.customerName = customerName;
    }
    // Note: We don't set to null if missing - preserve existing value as fallback

    // Update shipping address - always use checkout session value if available
    if (shippingAddress) {
      updateData.shippingAddress = {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || null,
        city: shippingAddress.city,
        state: shippingAddress.state || null,
        postalCode: shippingAddress.postal_code,
        country: shippingAddress.country,
      };
    }
    // Note: We don't set to null if missing - preserve existing value as fallback

    // Always update if we have any changes OR if we have customer details to capture
    // This ensures customer details are saved even if payment status was already set by payment_intent.succeeded
    const hasCustomerDetails = customerEmail || customerName || shippingAddress;
    const hasUpdates = Object.keys(updateData).length > 0;

    if (hasUpdates) {
      await prisma.merchOrder.update({
        where: { id: orderId },
        data: updateData,
      });

      if (hasCustomerDetails) {
        console.log(
          `✅ Merch order ${orderNumber} updated with customer details${existingOrder.paymentStatus === 'paid' ? ' (payment already confirmed)' : ' and payment confirmed'}`
        );
      } else {
        console.log(`✅ Merch order ${orderNumber} payment status updated`);
      }
    } else if (hasCustomerDetails) {
      // This shouldn't happen, but log if we have customer details but didn't update
      console.warn(
        `⚠️ Merch order ${orderNumber} has customer details in session but updateData is empty`
      );
    } else {
      console.log(
        `ℹ️ Merch order ${orderNumber} already has all customer details and payment confirmed`
      );
    }
  } catch (error) {
    console.error('Error handling merch checkout completed:', error);
    throw error;
  }
}

/**
 * Handle successful payment intent for merch orders
 * This handler ONLY updates payment-related fields (status, paymentStatus, stripePaymentIntentId).
 * Customer details (email, name, shipping address) are handled by handleMerchCheckoutCompleted
 * since they're only available in the checkout session, not the payment intent.
 *
 * This event may fire before or after checkout.session.completed - both handlers are idempotent.
 */
async function handleMerchPaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata || {};
    const orderId = metadata.orderId;

    // Check if this is a merch order (has orderId in metadata)
    if (!orderId) {
      // Not a merch order (could be a credit purchase or subscription), skip
      return;
    }

    // Find order by ID from payment intent metadata
    const order = await prisma.merchOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        stripePaymentIntentId: true,
      },
    });

    if (!order) {
      console.warn(
        'Merch order not found for payment_intent:',
        paymentIntent.id,
        'orderId:',
        orderId
      );
      return;
    }

    // Build update data - only payment-related fields
    // Use Record type to allow dynamic updates while maintaining type safety with Prisma
    const updateData: Record<string, unknown> = {};

    // Update payment status if not already paid
    // Note: Customer details are NOT updated here - they come from checkout.session.completed
    if (order.paymentStatus !== 'paid') {
      updateData.status = 'confirmed';
      updateData.paymentStatus = 'paid';
      updateData.paidAt = new Date();
      updateData.stripePaymentIntentId = paymentIntent.id;

      await prisma.merchOrder.update({
        where: { id: order.id },
        data: updateData,
      });

      console.log(`✅ Merch order ${order.orderNumber} payment confirmed via payment_intent`);
    } else if (!order.stripePaymentIntentId) {
      // Order already paid but missing payment intent ID - update it
      // This handles the case where checkout.session.completed fired first
      await prisma.merchOrder.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      console.log(`✅ Merch order ${order.orderNumber} payment intent ID updated`);
    } else {
      console.log(`ℹ️ Merch order ${order.orderNumber} already has payment intent ID`);
    }
  } catch (error) {
    console.error('Error handling merch payment succeeded:', error);
    // Don't throw - this is a backup handler and shouldn't fail the webhook
  }
}

/**
 * Handle masterclass enrollment payment completion
 */
async function handleMasterclassEnrollmentCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const masterclassId = metadata.masterclassId;
    const userId = metadata.userId;
    const instructorId = metadata.instructorId;
    const instructorShare = Number(metadata.instructorShare || 0);
    const platformShare = Number(metadata.platformShare || 0);

    if (!masterclassId || !userId) {
      console.warn('Masterclass enrollment session missing metadata', session.id);
      return;
    }

    // Find pending enrollment
    const enrollment = await prisma.masterclassEnrollment.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (!enrollment) {
      console.error('Enrollment not found for session:', session.id);
      return;
    }

    // Get masterclass for access period
    const masterclass = await prisma.masterclass.findUnique({
      where: { id: masterclassId },
      select: { accessDays: true, lessonCount: true, title: true },
    });

    if (!masterclass) {
      console.error('Masterclass not found:', masterclassId);
      return;
    }

    // Activate enrollment
    await prisma.masterclassEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'active',
        stripePaymentIntentId: session.payment_intent as string,
        accessStartsAt: new Date(),
        accessEndsAt: masterclass.accessDays
          ? new Date(Date.now() + masterclass.accessDays * 24 * 60 * 60 * 1000)
          : null,
        totalLessons: masterclass.lessonCount,
        instructorShare: instructorShare / 100,
        platformShare: platformShare / 100,
      },
    });

    // Update masterclass stats
    await prisma.masterclass.update({
      where: { id: masterclassId },
      data: {
        enrollmentCount: { increment: 1 },
        revenue: { increment: (session.amount_total || 0) / 100 },
      },
    });

    // Update instructor stats
    if (instructorId) {
      await prisma.masterclassInstructor.update({
        where: { id: instructorId },
        data: {
          totalStudents: { increment: 1 },
          totalEarnings: { increment: instructorShare / 100 },
        },
      });
    }

    console.log(`✅ Masterclass enrollment activated for user ${userId} in "${masterclass.title}"`);

    // Send enrollment confirmation email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user) {
      // TODO: Add email template for masterclass enrollment
      console.log(
        `📧 Would send enrollment confirmation to ${user.email} for "${masterclass.title}"`
      );
    }
  } catch (error) {
    console.error('Error handling masterclass enrollment:', error);
    throw error;
  }
}

/**
 * Handle Email Pro checkout completion
 */
async function handleEmailProCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('Email Pro checkout missing userId in metadata');
      return;
    }

    const subscriptionId = session.subscription as string;

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailTier: 'PRO',
        emailProSubscriptionId: subscriptionId,
        emailProStatus: 'active',
      },
    });

    // Update any existing email accounts to PRO storage
    await prisma.emailAccount.updateMany({
      where: { userId },
      data: {
        storageQuotaBytes: EMAIL_PRO_STORAGE_QUOTA,
      },
    });

    console.log(`✅ Email Pro activated for user ${userId}`);

    // Send confirmation email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user) {
      await sendEmail({
        to: user.email,
        subject: '🎸 Welcome to Email Pro!',
        text: `Hey ${user.name || 'there'}!\n\nYour Email Pro subscription is now active. You now have:\n\n• 10GB storage\n• Unlimited @rnrb.me accounts\n• Priority email delivery\n• Advanced filtering\n\nEnjoy your professional email!\n\n- The RNRB Team`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">🎸 Welcome to Email Pro!</h1>
            <p>Hey ${user.name || 'there'}!</p>
            <p>Your Email Pro subscription is now active. You now have:</p>
            <ul>
              <li>📦 <strong>10GB storage</strong></li>
              <li>📧 <strong>Unlimited @rnrb.me accounts</strong></li>
              <li>🚀 <strong>Priority email delivery</strong></li>
              <li>🔧 <strong>Advanced filtering</strong></li>
            </ul>
            <p>Enjoy your professional email!</p>
            <p>- The RNRB Team</p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error('Error handling Email Pro checkout:', error);
    throw error;
  }
}
