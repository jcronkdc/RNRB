# 💳 SUBSCRIPTION SETUP GUIDE - FINAL STEPS

**Status:** Infrastructure 95% Complete - Just needs Stripe configuration  
**Time Required:** 15 minutes  
**Agent:** 58 - 2025-11-22

---

## ✅ WHAT'S ALREADY DONE

The subscription infrastructure is fully built and ready to go:

- ✅ **Stripe SDK** - Installed and configured (`stripe@^17.4.0`)
- ✅ **Subscription Library** - All helper functions ready (`lib/stripe-subscriptions.ts`)
- ✅ **Webhook Handler** - Auto-sync subscriptions (`/api/webhooks/stripe`)
- ✅ **Server Actions** - Checkout, portal, management (`lib/actions/subscriptions.ts`)
- ✅ **Billing Dashboard** - Full UI at `/settings/billing`
- ✅ **Database Schema** - 8 subscription fields added to User model
- ✅ **Production Build** - Clean compile (0 errors)

---

## 🎯 WHAT YOU NEED TO DO (6 Steps - 15 minutes)

### **STEP 1: Run Database Migration** (1 minute)

The Prisma schema has new subscription fields that need to be added to your production database.

**Option A: Using Neon Console (Recommended)**

1. Go to https://console.neon.tech
2. Select your CronkWaters database
3. Click "SQL Editor"
4. Run this migration:

```sql
-- Add subscription fields to User table
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionEndsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionCanceledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionRenewsAt" TIMESTAMP(3);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "User_stripeSubscriptionId_idx" ON "User"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "User_subscriptionTier_idx" ON "User"("subscriptionTier");
```

5. Click "Run" - should complete in < 1 second

**Option B: Using Prisma Migrate**

```bash
# Set your production DATABASE_URL in terminal
export DATABASE_URL="your_neon_connection_string"

# Run migration
cd packages/db
pnpm prisma migrate deploy
```

---

### **STEP 2: Get Stripe API Keys** (2 minutes)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_...`)
3. Go to https://dashboard.stripe.com/test/webhooks/create
4. Click "Add endpoint"
5. Set URL: `https://www.cronkwaters.com/api/webhooks/stripe`
6. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Click "Add endpoint"
8. Copy your **Signing secret** (starts with `whsec_...`)

---

### **STEP 3: Add Environment Variables to Vercel** (2 minutes)

1. Go to https://vercel.com/cronkwaters/settings/environment-variables
2. Add these 3 variables:

| Name                      | Value                       | Environment |
| ------------------------- | --------------------------- | ----------- |
| `STRIPE_SECRET_KEY`       | `sk_test_...` (from Step 2) | Production  |
| `STRIPE_WEBHOOK_SECRET`   | `whsec_...` (from Step 2)   | Production  |
| `STRIPE_PRICE_ID_CREATOR` | _(from Step 4)_             | Production  |
| `STRIPE_PRICE_ID_STUDIO`  | _(from Step 4)_             | Production  |

3. Click "Save" for each

---

### **STEP 4: Create Stripe Products** (5 minutes)

1. Go to https://dashboard.stripe.com/test/products/create

**Product 1: Creator Plan**

- Name: `Creator`
- Description: `Professional music creation tools`
- Pricing:
  - Price: `$9.99` USD
  - Billing period: `Monthly` (or `Yearly` at `$99/year`)
  - Payment type: `Recurring`
- Click "Save product"
- **Copy the Price ID** (starts with `price_...`) and add to Vercel as `STRIPE_PRICE_ID_CREATOR`

**Product 2: Studio Plan**

- Name: `Studio`
- Description: `Full studio capabilities with collaboration`
- Pricing:
  - Price: `$29.99` USD
  - Billing period: `Monthly` (or `Yearly` at `$299/year`)
  - Payment type: `Recurring`
- Click "Save product"
- **Copy the Price ID** (starts with `price_...`) and add to Vercel as `STRIPE_PRICE_ID_STUDIO`

---

### **STEP 5: Redeploy to Production** (2 minutes)

After adding the environment variables, trigger a new deployment:

1. Go to https://vercel.com/cronkwaters/deployments
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete (~30 seconds)

Or push a git commit:

```bash
git add .
git commit -m "feat: subscription system ready for production"
git push origin main
```

---

### **STEP 6: Test Subscription Flow** (3 minutes)

1. **Go to Billing Page:**
   - Navigate to https://www.cronkwaters.com/settings/billing
   - You should see your current plan (Free) and upgrade options

2. **Test Checkout:**
   - Click "Upgrade" on Creator or Studio plan
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
   - Click "Subscribe"

3. **Verify Webhook:**
   - Check webhook logs in Stripe Dashboard
   - Should see `customer.subscription.created` event
   - Check your database - User record should have:
     - `stripeCustomerId` populated
     - `stripeSubscriptionId` populated
     - `subscriptionTier` = "creator" or "studio"
     - `subscriptionStatus` = "active"

4. **Test Customer Portal:**
   - Go back to `/settings/billing`
   - Click "Manage Subscription"
   - Should open Stripe Customer Portal
   - You can cancel, update payment method, view invoices

✅ **If all tests pass, subscriptions are LIVE!**

---

## 🎨 SUBSCRIPTION TIERS

The system supports 3 tiers (configured in code):

| Tier        | Price     | Features                                   |
| ----------- | --------- | ------------------------------------------ |
| **Free**    | $0/mo     | Basic songwriting, limited collaboration   |
| **Creator** | $9.99/mo  | Pro tools, unlimited collaboration         |
| **Studio**  | $29.99/mo | Full studio, video calls, priority support |

---

## 🔐 SECURITY NOTES

- ✅ **Webhook Signature Verification** - All webhooks verified with `STRIPE_WEBHOOK_SECRET`
- ✅ **Server-Side Only** - All Stripe operations in server actions (not exposed to client)
- ✅ **Idempotent Webhooks** - Safe to retry, won't duplicate subscriptions
- ✅ **Error Handling** - Graceful fallbacks on Stripe API failures

---

## 📊 HOW IT WORKS

### **User Upgrades:**

```
1. User clicks "Upgrade" button
2. Server action creates Stripe Customer (if needed)
3. Server action creates Checkout Session
4. User redirects to Stripe Checkout
5. User completes payment
6. Stripe sends webhook: customer.subscription.created
7. Webhook handler updates User record in database
8. User redirected back to /settings/billing (now shows active subscription)
```

### **Subscription Updates:**

```
1. Stripe sends webhook: customer.subscription.updated
2. Webhook handler updates User record (status, tier, renewal date)
3. User sees changes immediately in billing dashboard
```

### **User Cancels:**

```
1. User clicks "Manage Subscription"
2. Opens Stripe Customer Portal
3. User clicks "Cancel subscription"
4. Stripe sends webhook: customer.subscription.updated (cancel_at_period_end = true)
5. Webhook handler updates User record
6. Subscription remains active until period end
7. At period end: Stripe sends customer.subscription.deleted
8. Webhook handler downgrades user to free tier
```

---

## 🐛 TROUBLESHOOTING

### **Build Errors**

- ✅ Already fixed - build compiles cleanly
- If you see errors, run: `cd apps/web && pnpm install && pnpm run build`

### **Database Migration Fails**

- Check `DATABASE_URL` is correct
- Verify Neon database is accessible
- Run migration manually using SQL (Option A above)

### **Webhook Not Working**

- Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe Dashboard
- Check webhook logs in Stripe Dashboard
- Test webhook locally: Use Stripe CLI `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### **Checkout Session Fails**

- Verify `STRIPE_SECRET_KEY` is correct
- Check `STRIPE_PRICE_ID_*` variables match your Stripe products
- Look for errors in Vercel logs

---

## 📁 KEY FILES

### **Backend:**

- `apps/web/lib/stripe-subscriptions.ts` - Stripe SDK wrapper (225 lines)
- `apps/web/lib/actions/subscriptions.ts` - Server actions (372 lines)
- `apps/web/app/api/webhooks/stripe/route.ts` - Webhook handler (250 lines)

### **Frontend:**

- `apps/web/app/(app)/settings/billing/page.tsx` - Billing page
- `apps/web/app/(app)/settings/billing/BillingDashboard.tsx` - UI component

### **Database:**

- `packages/db/prisma/schema.prisma` - User model with subscription fields

---

## 🚀 GOING TO PRODUCTION (Real Money)

When ready to accept real payments:

1. **Switch to Live Mode in Stripe Dashboard**
2. **Get Live API Keys:**
   - Live Secret Key (starts with `sk_live_...`)
   - Live Webhook Secret (starts with `whsec_live_...`)
3. **Update Vercel Environment Variables:**
   - Replace test keys with live keys
   - Update `STRIPE_PRICE_ID_*` with live price IDs
4. **Create Live Products in Stripe:**
   - Same as test mode, but in "Live" mode
5. **Test with Real Card** (small amount):
   - Use your own card to test real payment flow
   - Immediately cancel to avoid charges
6. **Monitor:**
   - Watch Vercel logs for errors
   - Check Stripe Dashboard for successful payments
   - Verify database updates correctly

---

## ✅ CHECKLIST

Before launching subscriptions:

- [ ] Database migration applied to production
- [ ] `STRIPE_SECRET_KEY` added to Vercel
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] Stripe webhook endpoint created and pointing to production URL
- [ ] Creator product created in Stripe
- [ ] Studio product created in Stripe
- [ ] `STRIPE_PRICE_ID_CREATOR` added to Vercel
- [ ] `STRIPE_PRICE_ID_STUDIO` added to Vercel
- [ ] Redeployed to production
- [ ] Tested checkout flow with test card
- [ ] Verified webhook fired and updated database
- [ ] Tested customer portal (cancel/update)
- [ ] Checked Vercel logs for errors
- [ ] Checked Stripe logs for successful events

---

**END OF SETUP GUIDE** | Agent 58 | 2025-11-22

**Status:** 🎉 Infrastructure complete - ready for 15-minute Stripe setup!






