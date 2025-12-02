#!/bin/bash

echo "🔐 Paste your Stripe SECRET KEY (starts with sk_live_) and press Enter:"
read -r STRIPE_KEY

echo ""
echo "📦 Creating Creator price (\$17.99/month)..."
CREATOR_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_KEY}:" \
  -d product=prod_TX12F2WtOUcA1s \
  -d unit_amount=1799 \
  -d currency=usd \
  -d "recurring[interval]"=month)

CREATOR_PRICE_ID=$(echo "$CREATOR_RESPONSE" | grep -o '"id":"price_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CREATOR_PRICE_ID" ]; then
  echo "❌ Error creating Creator price:"
  echo "$CREATOR_RESPONSE" | grep -o '"message":"[^"]*"'
else
  echo "✅ Creator Price ID: $CREATOR_PRICE_ID"
fi

echo ""
echo "📦 Creating Studio price (\$34.99/month)..."
STUDIO_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_KEY}:" \
  -d product=prod_TX138n8Xq5IJxu \
  -d unit_amount=3499 \
  -d currency=usd \
  -d "recurring[interval]"=month)

STUDIO_PRICE_ID=$(echo "$STUDIO_RESPONSE" | grep -o '"id":"price_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STUDIO_PRICE_ID" ]; then
  echo "❌ Error creating Studio price:"
  echo "$STUDIO_RESPONSE" | grep -o '"message":"[^"]*"'
else
  echo "✅ Studio Price ID: $STUDIO_PRICE_ID"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Add these to Vercel Environment Variables:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STRIPE_PRICE_ID_CREATOR=$CREATOR_PRICE_ID"
echo "STRIPE_PRICE_ID_STUDIO=$STUDIO_PRICE_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
