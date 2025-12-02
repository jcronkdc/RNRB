# Printful Integration Guide

**Last Updated:** 2025-12-02  
**Status:** ✅ PRODUCTION READY

---

## Overview

Rock N' Roll Basement integrates with Printful to provide print-on-demand merchandise capabilities:

- Artists can design and sell custom merchandise
- Printful handles production, shipping, and fulfillment
- Zero inventory required - products are printed when ordered
- Artists set retail prices and keep profit margins

---

## Setup Requirements

### Environment Variables

Add these to your `.env` or Vercel environment variables:

```env
# Printful API Key (required)
PRINTFUL_API_KEY=your_printful_api_key

# Optional: Auto-confirm orders for immediate fulfillment
# Set to "true" to automatically confirm orders after payment
# Leave blank or "false" to review orders before confirming
PRINTFUL_AUTO_CONFIRM=false

# Optional: Enable/disable the merch store
NEXT_PUBLIC_MERCH_STORE_LIVE=true

# Stripe Merch Webhook Secret (for order processing)
STRIPE_MERCH_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Getting Your Printful API Key

1. Go to [Printful Dashboard](https://www.printful.com/dashboard)
2. Navigate to **Settings** → **API**
3. Click **Enable API Access**
4. Copy your API key
5. Add it to Vercel as `PRINTFUL_API_KEY`

---

## API Endpoints

### `/api/merch/printful`

#### GET Actions

| Action             | Description                              | Parameters            |
| ------------------ | ---------------------------------------- | --------------------- |
| `products`         | List sync products in your store         | -                     |
| `catalog`          | Get available Printful product catalog   | `category` (optional) |
| `categories`       | Get product categories                   | -                     |
| `product-details`  | Get variants and pricing for a product   | `id` (required)       |
| `printfiles`       | Get printfile info for mockup generation | `id` (required)       |
| `mockup-templates` | Get mockup templates for a product       | `id` (required)       |
| `mockup-task`      | Check mockup generation status           | `task_key` (required) |
| `orders`           | List Printful orders                     | `status` (optional)   |
| `order`            | Get specific order details               | `id` (required)       |
| `store-info`       | Get store information                    | -                     |

**Example:**

```javascript
// Fetch product catalog
const response = await fetch('/api/merch/printful?action=catalog');
const { catalog } = await response.json();

// Get product details
const response = await fetch('/api/merch/printful?action=product-details&id=71');
const { product } = await response.json();
```

#### POST Actions

| Action            | Description              | Body                                                    |
| ----------------- | ------------------------ | ------------------------------------------------------- |
| `create-product`  | Create a sync product    | name, designUrl, productType, variants, placement       |
| `generate-mockup` | Generate product mockup  | productId, variantIds, designUrl, placement, format     |
| `create-order`    | Create fulfillment order | recipient, items, externalId, retailCosts, confirmOrder |
| `confirm-order`   | Confirm a draft order    | orderId                                                 |
| `shipping-rates`  | Calculate shipping rates | recipient, items                                        |
| `estimate-costs`  | Estimate order costs     | recipient, items                                        |

**Example - Create Product:**

```javascript
const response = await fetch('/api/merch/printful', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create-product',
    name: 'My Band Logo Tee',
    designUrl: 'https://example.com/design.png',
    productType: 'tshirt',
    variants: [
      { variantId: 4011, retailPrice: 29.99 },
      { variantId: 4012, retailPrice: 29.99 },
    ],
    placement: 'front',
  }),
});
```

**Example - Generate Mockup:**

```javascript
const response = await fetch('/api/merch/printful', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generate-mockup',
    productId: 71, // Bella+Canvas 3001
    variantIds: [4011, 4012, 4013],
    designUrl: 'https://example.com/design.png',
    placement: 'front',
    format: 'jpg',
  }),
});
const { task } = await response.json();
// Poll task.task_key until status is 'completed'
```

---

## React Hook: `usePrintful`

Location: `apps/web/lib/merch/use-printful.ts`

```typescript
import { usePrintful } from '@/lib/merch/use-printful';

function MyComponent() {
  const {
    isLoading,
    error,
    fetchCatalog,
    fetchProductDetails,
    generateMockup,
    checkMockupStatus,
    createProduct,
    checkConnection,
  } = usePrintful();

  // Fetch catalog
  const catalog = await fetchCatalog();

  // Generate mockup
  const result = await generateMockup({
    productId: 71,
    variantIds: [4011, 4012],
    designUrl: 'https://...',
  });

  // Check connection
  const isConnected = await checkConnection();
}
```

---

## Popular Product IDs

| Product                     | ID  | Description                   |
| --------------------------- | --- | ----------------------------- |
| T-Shirt (Bella+Canvas 3001) | 71  | Most popular, soft unisex tee |
| T-Shirt (Gildan 5000)       | 5   | Budget-friendly cotton tee    |
| Hoodie                      | 380 | Unisex pullover hoodie        |
| Tank Top                    | 195 | Unisex tank                   |
| Poster                      | 1   | Enhanced matte paper poster   |
| Mug (11oz)                  | 19  | White glossy mug              |
| Stickers                    | 358 | Kiss-cut stickers             |
| Dad Hat                     | 206 | Yupoong Dad Hat               |
| Snapback                    | 207 | Yupoong Snapback              |
| Tote Bag                    | 83  | Economy tote                  |

---

## Order Flow

### 1. Customer Checkout

```
Customer adds items → Stripe Checkout → Payment completes
```

### 2. Webhook Processing

```
Stripe webhook → /api/merch/webhook → Creates DB order → Creates Printful order
```

### 3. Fulfillment

```
Printful receives order → Production → Shipping → Delivery
```

### Order Statuses

| Status       | Description                      |
| ------------ | -------------------------------- |
| `PENDING`    | Order created, awaiting payment  |
| `PAID`       | Payment received                 |
| `PROCESSING` | Sent to Printful for fulfillment |
| `SHIPPED`    | Order shipped                    |
| `DELIVERED`  | Order delivered                  |
| `CANCELLED`  | Order cancelled                  |
| `REFUNDED`   | Payment refunded                 |

---

## Revenue Model

| Party             | Share                               |
| ----------------- | ----------------------------------- |
| **Printful**      | Production cost (varies by product) |
| **RNRB Platform** | 15% of profit margin                |
| **Artist**        | 85% of profit margin                |

**Example:**

- Retail price: $29.99
- Production cost: $12.95
- Gross profit: $17.04
- RNRB fee (15%): $2.56
- **Artist profit: $14.48 per sale**

---

## Stripe Products Setup

Each product in your store needs Stripe Price IDs. You can create them:

1. **Manually in Stripe Dashboard:**
   - Go to Products → Add Product
   - Set name, description, price
   - Copy the Price ID (e.g., `price_1ABC...`)

2. **Via Stripe MCP Tool:**

   ```
   Use mcp_Stripe_create_product and mcp_Stripe_create_price
   ```

3. **Store Printful metadata:**
   - Add `printful_variant_id` to product metadata
   - Add `printful_sync_variant_id` if using sync products
   - Add `design_url` for dynamic printing

---

## Webhook Configuration

### Stripe Webhook Events

- `checkout.session.completed` - Creates order and triggers Printful fulfillment
- `checkout.session.expired` - Logs expired sessions
- `payment_intent.payment_failed` - Logs failed payments

### Printful Webhook Events (optional)

You can receive Printful webhooks at `/api/merch/printful/webhook` for:

- `package_shipped` - Order shipped
- `package_returned` - Package returned
- `order_created` - Order confirmed in Printful
- `order_failed` - Order failed

---

## Files Overview

| File                                | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `app/api/merch/printful/route.ts`   | Main Printful API integration            |
| `app/api/merch/webhook/route.ts`    | Stripe webhook + Printful order creation |
| `app/api/merch/checkout/route.ts`   | Stripe checkout session creation         |
| `app/api/merch/orders/route.ts`     | User order history                       |
| `app/(app)/merch/page.tsx`          | Store frontend                           |
| `app/(app)/merch/design/page.tsx`   | Merch designer                           |
| `lib/merch/use-printful.ts`         | React hook for Printful API              |
| `lib/merch/cart-context.tsx`        | Shopping cart state                      |
| `components/merch/product-card.tsx` | Product display component                |
| `components/merch/cart-drawer.tsx`  | Cart drawer component                    |

---

## Testing

### Local Development

1. Set up environment variables
2. Run `pnpm dev`
3. Visit `/merch` to see the store
4. Visit `/merch/design` to design products

### Testing Checkout

Use Stripe test mode with card: `4242 4242 4242 4242`

### Testing Printful

1. Use Printful sandbox/test mode if available
2. Create test products with `PRINTFUL_AUTO_CONFIRM=false`
3. Review orders in Printful dashboard before confirming

---

## Troubleshooting

| Issue                         | Solution                                     |
| ----------------------------- | -------------------------------------------- |
| "Printful API not configured" | Check `PRINTFUL_API_KEY` is set              |
| Mockup generation fails       | Ensure design URL is publicly accessible     |
| Order not in Printful         | Check webhook logs, verify `printfulOrderId` |
| Products not showing          | Verify `STORE_LIVE` is enabled               |

---

## Resources

- [Printful API Documentation](https://developers.printful.com/docs/)
- [Printful Product Catalog](https://www.printful.com/products)
- [Stripe Documentation](https://stripe.com/docs)
