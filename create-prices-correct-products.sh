#!/bin/bash
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎸 Rock N Roll Basement - Stripe Price Creator"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "First, let's see what products you have..."
echo ""
echo "Paste your Stripe SECRET KEY and press Enter:"
read -r STRIPE_KEY

if [ -z "$STRIPE_KEY" ]; then
  echo "❌ No key provided"
  exit 1
fi

echo ""
echo "🔍 Listing your products..."
curl -s https://api.stripe.com/v1/products?limit=20 \
  -u "${STRIPE_KEY}:" | grep -E '"name":|"id":"prod_' | head -20

echo ""
echo ""
echo "📝 Enter the Product ID for CREATOR (e.g., prod_xxxxx):"
read -r CREATOR_PRODUCT_ID

echo "📝 Enter the Product ID for STUDIO (e.g., prod_xxxxx):"
read -r STUDIO_PRODUCT_ID

echo ""
echo "📦 Creating Creator subscription price (\$17.99/month)..."
CREATOR_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_KEY}:" \
  -d product="${CREATOR_PRODUCT_ID}" \
  -d unit_amount=1799 \
  -d currency=usd \
  -d "recurring[interval]"=month)

CREATOR_PRICE_ID=$(echo "$CREATOR_RESPONSE" | grep -oE '"id":"price_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CREATOR_PRICE_ID" ]; then
  echo "❌ Error:"
  echo "$CREATOR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATOR_RESPONSE"
else
  echo "✅ Created: $CREATOR_PRICE_ID"
fi

echo ""
echo "📦 Creating Studio subscription price (\$34.99/month)..."
STUDIO_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_KEY}:" \
  -d product="${STUDIO_PRODUCT_ID}" \
  -d unit_amount=3499 \
  -d currency=usd \
  -d "recurring[interval]"=month)

STUDIO_PRICE_ID=$(echo "$STUDIO_RESPONSE" | grep -oE '"id":"price_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STUDIO_PRICE_ID" ]; then
  echo "❌ Error:"
  echo "$STUDIO_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STUDIO_RESPONSE"
else
  echo "✅ Created: $STUDIO_PRICE_ID"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎉 SUCCESS! Add these to Vercel:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "STRIPE_PRICE_ID_CREATOR=$CREATOR_PRICE_ID"
echo "STRIPE_PRICE_ID_STUDIO=$STUDIO_PRICE_ID"
echo ""
echo "═══════════════════════════════════════════════════════"
