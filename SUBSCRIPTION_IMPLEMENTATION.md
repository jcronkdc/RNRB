# 🚀 SUBSCRIPTION MANAGEMENT IMPLEMENTATION GUIDE

**Agent 57 - 2025-11-22 - COMPLETE STEP-BY-STEP**

---

## 🎯 **IMPLEMENTATION PLAN**

**Approach:** Stripe Customer Portal (Fastest & Most Reliable)

**Timeline:** 1 day

**What Users Will Be Able To Do:**

- ✅ View current subscription plan
- ✅ Upgrade from Free → Creator → Studio
- ✅ Downgrade Studio → Creator → Free
- ✅ Cancel subscription (access until period ends)
- ✅ Update payment methods
- ✅ View billing history & invoices
- ✅ Download invoice PDFs

---

## 📋 **PHASE 1: STRIPE SETUP (30 minutes)**

### **Step 1: Create Stripe Products**

1. Go to: https://dashboard.stripe.com/products
2. Create three products:

**Product 1: Creator**

```
Name: Creator Plan
Description: For serious musicians and small teams
Price: $9.99 USD / month
Billing: Recurring monthly
```

**Product 2: Studio**

```
Name: Studio Plan
Description: For labels, studios, and power users
Price: $29.99 USD / month
Billing: Recurring monthly
```

**Note:** Don't create "Explorer" - that's your free tier (no Stripe needed)

3. **Save the Price IDs:**

```
STRIPE_PRICE_ID_CREATOR=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_STUDIO=price_xxxxxxxxxxxxx
```

### **Step 2: Get Stripe API Keys**

1. Go to: https://dashboard.stripe.com/apikeys
2. Copy:
   - **Publishable key** (starts with `pk_live_` or `pk_test_`)
   - **Secret key** (starts with `sk_live_` or `sk_test_`)

### **Step 3: Enable Customer Portal**

1. Go to: https://dashboard.stripe.com/settings/billing/portal
2. Click **"Activate test link"** (or create portal configuration)
3. Configure:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing information
   - ✅ Allow customers to cancel subscriptions (at period end)
   - ✅ Show payment history
4. Save configuration

---

## 📋 **PHASE 2: DATABASE SETUP (15 minutes)**

### **Step 1: Update Prisma Schema**

Add subscription fields to your User model:

```prisma
// packages/db/prisma/schema.prisma

model User {
  id                      String                  @id @default(cuid())
  email                   String                  @unique
  emailVerified           DateTime?
  name                    String?
  image                   String?

  // ... existing fields ...

  // NEW: Stripe subscription fields
  stripeCustomerId        String?                 @unique
  stripeSubscriptionId    String?                 @unique
  subscriptionStatus      String?                 // active, canceled, past_due, trialing
  subscriptionTier        String                  @default("free") // free, creator, studio
  subscriptionStartedAt   DateTime?
  subscriptionEndsAt      DateTime?
  subscriptionCanceledAt  DateTime?

  // ... rest of existing fields ...

  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
  @@index([subscriptionStatus])
}
```

### **Step 2: Run Migration**

```bash
cd packages/db
npx prisma migrate dev --name add_subscription_fields
npx prisma generate
```

---

## 📋 **PHASE 3: ENVIRONMENT VARIABLES (5 minutes)**

Add to your `.env.local` and Vercel:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Price IDs
STRIPE_PRICE_ID_CREATOR=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_STUDIO=price_xxxxxxxxxxxxx

# Stripe Webhook Secret (we'll get this in Phase 5)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 📋 **PHASE 4: CODE IMPLEMENTATION (2-3 hours)**

### **File 1: Stripe Utility Functions**

Create: `apps/web/lib/stripe-subscriptions.ts`

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function createStripeCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      app: 'cronkwaters',
    },
  });
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return await stripe.checkout.sessions.create({
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
      app: 'cronkwaters',
    },
  });
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  // Cancel at period end (user keeps access until then)
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export { stripe };
```

### **File 2: Server Actions**

Create: `apps/web/lib/actions/subscriptions.ts`

```typescript
'use server';

import { prisma } from '@cronkwaters/db';
import { revalidatePath } from 'next/cache';
import {
  createStripeCustomer,
  createCheckoutSession,
  createCustomerPortalSession,
} from '@/lib/stripe-subscriptions';

export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await createStripeCustomer(email, name);

  // Save to database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  tier: 'creator' | 'studio',
  name?: string
) {
  const customerId = await getOrCreateStripeCustomer(userId, email, name);

  const priceId =
    tier === 'creator' ? process.env.STRIPE_PRICE_ID_CREATOR! : process.env.STRIPE_PRICE_ID_STUDIO!;

  const session = await createCheckoutSession(
    customerId,
    priceId,
    `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`
  );

  return session.url;
}

export async function createBillingPortalLink(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    throw new Error('No Stripe customer found. Please subscribe first.');
  }

  const session = await createCustomerPortalSession(
    user.stripeCustomerId,
    `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
  );

  return session.url;
}

export async function getUserSubscription(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionStartedAt: true,
      subscriptionEndsAt: true,
      subscriptionCanceledAt: true,
    },
  });
}
```

### **File 3: Billing Settings Page**

Create: `apps/web/app/(app)/settings/billing/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserSubscription, createBillingPortalLink } from '@/lib/actions/subscriptions';
import { BillingDashboard } from './BillingDashboard';

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth');
  }

  const subscription = await getUserSubscription(session.user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      <BillingDashboard
        userId={session.user.id}
        userEmail={session.user.email!}
        userName={session.user.name}
        subscription={subscription}
      />
    </div>
  );
}
```

### **File 4: Billing Dashboard Component**

Create: `apps/web/app/(app)/settings/billing/BillingDashboard.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cronkwaters/ui';
import { Check, Crown, Zap, ExternalLink, CreditCard } from 'lucide-react';
import { createSubscriptionCheckout, createBillingPortalLink } from '@/lib/actions/subscriptions';

interface BillingDashboardProps {
  userId: string;
  userEmail: string;
  userName?: string | null;
  subscription: {
    subscriptionTier: string;
    subscriptionStatus: string | null;
    subscriptionStartedAt: Date | null;
    subscriptionEndsAt: Date | null;
    subscriptionCanceledAt: Date | null;
  } | null;
}

export function BillingDashboard({ userId, userEmail, userName, subscription }: BillingDashboardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const currentTier = subscription?.subscriptionTier || 'free';
  const status = subscription?.subscriptionStatus;
  const isCanceled = subscription?.subscriptionCanceledAt !== null;

  const handleUpgrade = async (tier: 'creator' | 'studio') => {
    setIsLoading(tier);
    try {
      const checkoutUrl = await createSubscriptionCheckout(userId, userEmail, tier, userName);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading('portal');
    try {
      const portalUrl = await createBillingPortalLink(userId);
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold capitalize">{currentTier} Plan</p>
            {status && (
              <p className="text-sm text-muted-foreground mt-1">
                Status: <span className="capitalize">{status}</span>
              </p>
            )}
            {isCanceled && subscription?.subscriptionEndsAt && (
              <p className="text-sm text-orange-500 mt-1">
                Access until {new Date(subscription.subscriptionEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {currentTier !== 'free' && (
            <Button
              onClick={handleManageBilling}
              disabled={isLoading === 'portal'}
              variant="outline"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading === 'portal' ? 'Loading...' : 'Manage Billing'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className={`border rounded-xl p-6 ${currentTier === 'free' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <h3 className="text-lg font-semibold mb-2">Explorer</h3>
            <p className="text-3xl font-bold mb-4">Free</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>1 Active Project</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Basic Audio Upload (5MB)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Community Support</span>
              </li>
            </ul>
            {currentTier === 'free' && (
              <Button disabled className="w-full">Current Plan</Button>
            )}
          </div>

          {/* Creator Plan */}
          <div className={`border rounded-xl p-6 ${currentTier === 'creator' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Creator</h3>
            </div>
            <p className="text-3xl font-bold mb-4">
              $9.99<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Unlimited Projects</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Pro Audio Upload (500MB)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>50GB Cloud Storage</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Email Support</span>
              </li>
            </ul>
            {currentTier === 'creator' ? (
              <Button disabled className="w-full">Current Plan</Button>
            ) : (
              <Button
                onClick={() => handleUpgrade('creator')}
                disabled={isLoading === 'creator'}
                className="w-full"
              >
                {isLoading === 'creator' ? 'Loading...' : 'Upgrade to Creator'}
              </Button>
            )}
          </div>

          {/* Studio Plan */}
          <div className={`border rounded-xl p-6 ${currentTier === 'studio' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Studio</h3>
            </div>
            <p className="text-3xl font-bold mb-4">
              $29.99<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Everything in Creator</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Lossless Audio Upload</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>500GB Cloud Storage</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Priority Support</span>
              </li>
            </ul>
            {currentTier === 'studio' ? (
              <Button disabled className="w-full">Current Plan</Button>
            ) : (
              <Button
                onClick={() => handleUpgrade('studio')}
                disabled={isLoading === 'studio'}
                className="w-full"
              >
                {isLoading === 'studio' ? 'Loading...' : 'Upgrade to Studio'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Manage Billing Section */}
      {currentTier !== 'free' && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Your Subscription</h2>
          <p className="text-muted-foreground mb-4">
            Update payment methods, view invoices, or cancel your subscription through our secure billing portal.
          </p>
          <Button
            onClick={handleManageBilling}
            disabled={isLoading === 'portal'}
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {isLoading === 'portal' ? 'Loading...' : 'Open Billing Portal'}
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 **PHASE 5: WEBHOOK HANDLER (1 hour)**

### **File: Stripe Webhook Route**

Create: `apps/web/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';
import { stripe } from '@/lib/stripe-subscriptions';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded:', invoice.id);
        // Handle successful payment (already handled by subscription.updated)
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
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
      subscriptionCanceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'free',
      subscriptionStatus: 'canceled',
      subscriptionCanceledAt: new Date(),
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  // TODO: Send email notification to user
  console.log('Payment failed for user:', user.email);
}
```

### **Configure Webhook in Stripe**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://www.cronkwaters.com/api/webhooks/stripe`
4. **Events to send:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **Copy the webhook signing secret** (starts with `whsec_`)
7. **Add to .env:** `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

---

## 📋 **PHASE 6: ADD TO SETTINGS NAV (5 minutes)**

Update your settings navigation to include billing:

```typescript
// apps/web/components/SettingsNav.tsx or similar

const settingsNav = [
  { name: 'Profile', href: '/settings', icon: User },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard }, // ADD THIS
  { name: 'Artist Profile', href: '/settings/artist-profile', icon: Music },
  // ... other items
];
```

---

## 📋 **PHASE 7: DEPLOY & TEST (30 minutes)**

### **Deployment Checklist:**

- [ ] 1. Commit all code changes
- [ ] 2. Push to GitHub
- [ ] 3. Deploy to Vercel
- [ ] 4. Add environment variables to Vercel:
  ```
  STRIPE_SECRET_KEY
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_PRICE_ID_CREATOR
  STRIPE_PRICE_ID_STUDIO
  STRIPE_WEBHOOK_SECRET
  NEXT_PUBLIC_APP_URL (https://www.cronkwaters.com)
  ```
- [ ] 5. Test webhook endpoint is accessible
- [ ] 6. Redeploy after adding env vars

### **Testing Checklist:**

- [ ] 1. Sign in to app
- [ ] 2. Go to `/settings/billing`
- [ ] 3. Click "Upgrade to Creator"
- [ ] 4. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
- [ ] 5. Verify subscription shows as "creator" in dashboard
- [ ] 6. Click "Manage Billing"
- [ ] 7. Verify Stripe portal opens
- [ ] 8. Test canceling subscription
- [ ] 9. Verify access continues until period end

---

## 🎯 **WHAT USERS WILL SEE**

### **1. Settings → Billing Page:**

```
┌─────────────────────────────────────┐
│ Current Plan                        │
│ Creator Plan                        │
│ Status: Active                      │
│ [Manage Billing →]                  │
└─────────────────────────────────────┘

Available Plans:
┌────────┐  ┌────────┐  ┌────────┐
│ Free   │  │ Creator│  │ Studio │
│ $0     │  │ $9.99  │  │ $29.99 │
│        │  │[Current]│  │[Upgrade]│
└────────┘  └────────┘  └────────┘
```

### **2. Stripe Customer Portal:**

When users click "Manage Billing", they'll see Stripe's portal with:

- Current subscription details
- Payment method management
- Billing history
- Invoice downloads
- Cancel subscription option

---

## 🚀 **ESTIMATED TIMELINE**

| Phase     | Task                  | Time           |
| --------- | --------------------- | -------------- |
| 1         | Stripe Setup          | 30 min         |
| 2         | Database Schema       | 15 min         |
| 3         | Environment Variables | 5 min          |
| 4         | Code Implementation   | 2-3 hours      |
| 5         | Webhook Handler       | 1 hour         |
| 6         | Settings Navigation   | 5 min          |
| 7         | Deploy & Test         | 30 min         |
| **TOTAL** | **~5 hours**          | **1 work day** |

---

## ✅ **POST-IMPLEMENTATION CHECKLIST**

After everything is live:

- [ ] Test free → creator upgrade
- [ ] Test creator → studio upgrade
- [ ] Test studio → creator downgrade
- [ ] Test subscription cancellation
- [ ] Test payment method update
- [ ] Verify invoices generate correctly
- [ ] Test failed payment handling
- [ ] Verify webhook events are received
- [ ] Check database updates correctly
- [ ] Test on mobile devices

---

## 🎉 **BONUS: FEATURES TO ADD LATER**

Once basic subscriptions work, consider:

1. **Usage-based billing** - AI credits, storage limits
2. **Annual plans** - 20% discount for yearly
3. **Team seats** - Additional users per subscription
4. **Trial periods** - 14-day free trial
5. **Promo codes** - Discount coupons
6. **Referral program** - Credit for referrals

---

## 🆘 **SUPPORT & RESOURCES**

**Stripe Documentation:**

- Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

**Test Cards:**

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`

**Need Help?**

- Stripe Support: https://support.stripe.com
- Stripe Discord: https://stripe.com/discord

---

**READY TO BUILD?** 🚀

Follow the phases in order, and you'll have a complete subscription system in one day!

Let me know when you're ready to start, and I can help with any specific phase! 🎸








