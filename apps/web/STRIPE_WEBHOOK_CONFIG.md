# 🎸 RNRB Merch Store - Stripe Webhook Setup

## Quick Setup (30 seconds)

### 1. Go to Stripe Dashboard

Open: **https://dashboard.stripe.com/webhooks**

### 2. Click "Add endpoint" (or "Add destination")

### 3. Copy-Paste This Configuration:

**Endpoint URL:**

```
https://rocknrollbasement.com/api/merch/webhook
```

**Description:**

```
RNRB Platform Merch Store - Order fulfillment
```

**Events to select (check all these):**

- ✅ `checkout.session.completed`
- ✅ `checkout.session.async_payment_succeeded`
- ✅ `checkout.session.async_payment_failed`
- ✅ `checkout.session.expired`

### 4. Click "Add endpoint"

### 5. Copy the Signing Secret

After creating, click "Reveal" next to the signing secret.
Copy the value that starts with `whsec_...`

### 6. Add to your .env.local

Edit: `apps/web/.env.local`

Find this line:

```
STRIPE_MERCH_WEBHOOK_SECRET=
```

Replace with:

```
STRIPE_MERCH_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### 7. Restart dev server

```bash
cd apps/web && pnpm dev
```

---

## ✅ You're Done!

The merch store webhook is now configured and ready to:

- Create orders when customers complete checkout
- Track payment status
- Handle failed/expired sessions

## 🚀 Enable the Store

When ready to go live, edit `apps/web/app/(app)/merch/page.tsx`:

```typescript
const STORE_LIVE = true; // Change from false
```
