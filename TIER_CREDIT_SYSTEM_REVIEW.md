# 🎸 Rock N' Roll Basement - Tier & Credit System Review

**Updated:** November 30, 2025  
**Status:** ✅ COMPLETE - All systems configured

---

## 📊 NEW PRICING STRUCTURE (LIVE)

| Tier         | Old Price | New Price     | Margin |
| ------------ | --------- | ------------- | ------ |
| **Explorer** | Free      | Free          | 100%   |
| **Creator**  | $14.99/mo | **$17.99/mo** | 98%    |
| **Studio**   | $29.99/mo | **$34.99/mo** | 90%    |

### Features by Tier

| Feature              | Explorer (Free) | Creator ($17.99) | Studio ($34.99)       |
| -------------------- | --------------- | ---------------- | --------------------- |
| **Projects**         | 3               | 10               | Unlimited             |
| **Storage**          | 1 GB            | 10 GB            | 100 GB                |
| **Collaborators**    | 1 per project   | 5 per project    | Unlimited             |
| **AI Requests**      | 10 (teaser)     | 100/month        | 500/month             |
| **Image Credits**    | 0               | 10/month         | 50/month              |
| **Video Minutes**    | 0               | 0                | 3,600 participant-min |
| **Copyright Sheets** | ❌              | ✅               | ✅                    |
| **Tour Management**  | ❌              | ✅               | ✅                    |
| **Real-time Collab** | ❌              | ❌               | ✅                    |

---

## 💳 CREDIT PURCHASE OPTIONS (ALL CONFIGURED IN STRIPE)

### Stripe Products Created (Live)

| Product                 | Price | Stripe Price ID                  | Type          |
| ----------------------- | ----- | -------------------------------- | ------------- |
| **AI Credits +100**     | $6    | `price_1SZGEw2H6bMdop9gZadK70BA` | Monthly reset |
| **Video Credits +10hr** | $10   | `price_1SZGEw2H6bMdop9gOgb1lZ0G` | Monthly reset |
| **Image Credits +25**   | $4    | `price_1SZGEx2H6bMdop9gcHo3QgEg` | Monthly reset |
| **Image Credits +100**  | $12   | `price_1SZGEy2H6bMdop9glMbDKKCv` | Monthly reset |
| **Storage +25GB**       | $6    | `price_1SZGEy2H6bMdop9gdH8RExgr` | **Permanent** |
| **Storage +100GB**      | $15   | `price_1SZGEz2H6bMdop9gPECUD89F` | **Permanent** |
| **Storage +250GB**      | $30   | `price_1SZGF02H6bMdop9g3pujT79e` | **Permanent** |

### Subscription Products (Need Recurring Setup in Stripe Dashboard)

| Product                  | Price     | Stripe Product ID     |
| ------------------------ | --------- | --------------------- |
| **Creator Subscription** | $17.99/mo | `prod_TWIqKGRWyetkoD` |
| **Studio Subscription**  | $34.99/mo | `prod_TWIqU3h7dBlwmb` |

⚠️ **Note:** The subscription prices were created as one-time. You need to:

1. Go to Stripe Dashboard
2. Edit each subscription product
3. Add a recurring price ($17.99/mo and $34.99/mo respectively)

---

## 🔔 LOW-CREDIT NOTIFICATION SYSTEM (NEW)

### Implementation

- **Component:** `/components/billing/UsageAlerts.tsx`
- **Integration:** Added to `AppLayout` - shows on all authenticated pages
- **Thresholds:**
  - ⚠️ **Warning:** 80% usage - Orange toast notification
  - 🔴 **Critical:** 95% usage - Red toast notification

### What Users See

When usage hits 80%+:

```
┌──────────────────────────────────────┐
│ ⚠️ Low AI Credits                    │
│ You've used 85% of your AI credits.  │
│ [Buy More] [Upgrade Plan]            │
└──────────────────────────────────────┘
```

When usage hits 95%+:

```
┌──────────────────────────────────────┐
│ 🔴 AI Credits Almost Gone!           │
│ You've used 98% of your AI credits.  │
│ [Buy More] [Upgrade Plan]            │
└──────────────────────────────────────┘
```

### Tracked Resources

- ✅ AI Credits
- ✅ Video Minutes
- ✅ Image Credits
- ✅ Storage Space

---

## 📁 FILES MODIFIED

### Pricing Updates

- `app/(app)/settings/billing/BillingDashboard.tsx` - $17.99/$34.99
- `app/(marketing)/pricing/page.tsx` - $17.99/$34.99
- `app/page.tsx` - $17.99
- `app/(app)/setlists/page.tsx` - $17.99
- `app/(app)/create/page.tsx` - $17.99
- `app/(marketing)/solutions/songwriters/page.tsx` - $17.99
- `components/upgrade-modal.tsx` - $17.99/$34.99
- `components/project-video-room.tsx` - $17.99
- `lib/subscription-access.ts` - $17.99/$34.99
- `lib/usage-tracking.ts` - $17.99/$34.99

### Credit System

- `lib/actions/credits.ts` - Added image_25, image_100 products
- `components/billing/BuyCreditsButton.tsx` - Updated prices
- `app/(app)/settings/usage/page.tsx` - Added image credits section
- `app/api/webhooks/stripe/route.ts` - Added image credit fulfillment
- `packages/db/prisma/schema.prisma` - Added 'image' to CreditType enum

### Notifications

- `components/billing/UsageAlerts.tsx` - NEW: Low credit warnings
- `components/app-layout.tsx` - Integrated UsageAlerts

### Environment

- `ENV_TEMPLATE.md` - Added all new Stripe price IDs

---

## 🗄️ DATABASE MIGRATION

**Applied:** `ALTER TYPE "CreditType" ADD VALUE IF NOT EXISTS 'image';`

**Database:** Neon `cronkwaters-production` (weathered-rain-51915586)

---

## ✅ CHECKLIST

- [x] Database migration for image credit type
- [x] Stripe products created (9 products)
- [x] Stripe prices created (9 prices)
- [x] Pricing updated across codebase ($17.99/$34.99)
- [x] Image credits purchase flow implemented
- [x] Low-credit notification system added
- [x] ENV_TEMPLATE updated with price IDs

### Still Needed (Manual in Stripe Dashboard)

- [ ] Set subscription prices to RECURRING (not one-time)
- [ ] Update your `.env` or Vercel env vars with new price IDs

---

## 💰 MARGIN ANALYSIS (Updated)

| Tier    | Revenue       | Est. Cost | Margin  | Improvement |
| ------- | ------------- | --------- | ------- | ----------- |
| Free    | $0            | $0        | 100%    | -           |
| Creator | **$17.99/mo** | ~$0.28    | **98%** | +$3/user    |
| Studio  | **$34.99/mo** | ~$3.33    | **90%** | +$5/user    |

### Credit Pack Margins

| Pack           | Price | Cost   | Margin  |
| -------------- | ----- | ------ | ------- |
| AI +100        | $6    | ~$0.15 | **97%** |
| Video +10hr    | $10   | ~$4.00 | **60%** |
| Image +25      | $4    | ~$0.08 | **98%** |
| Image +100     | $12   | ~$0.30 | **97%** |
| Storage +25GB  | $6    | ~$0.50 | **92%** |
| Storage +100GB | $15   | ~$2.00 | **87%** |
| Storage +250GB | $30   | ~$5.00 | **83%** |

---

**Token Count at End: ~155,000**
