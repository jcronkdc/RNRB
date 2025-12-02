#!/bin/bash
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎸 Rock N Roll Basement - Stripe Price Creator"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Paste your Stripe SECRET KEY and press Enter:"
echo "(starts with sk_live_...)"
echo ""
read -r STRIPE_KEY

if [ -z "$STRIPE_KEY" ]; then
  echo "❌ No key provided"
  exit 1
fi

echo ""
echo "📦 Creating Creator subscription price (\$17.99/month)..."
CREATOR_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_KEY}:" \
  -d product=prod_TX12F2WtOUcA1s \
  -d unit_amount=1799 \
  -d currency=usd \
  -d "recurring[interval]"=month)

CREATOR_PRICE_ID=$(echo "$CREATOR_RESPONSE" | grep -oE '"id":"price_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CREATOR_PRICE_ID" ]; then
  echo "❌ Error:"
  echo "$CREATOR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATOR_RESPONSE"
  exit 1
else
  echo "✅ Created: $CREATOR_PRICE_ID"
fi

echo ""
echo "📦 Creating Studio subscription price (\$34.99/month)..."
STUDIO_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_KEY}:" \
  -d product=prod_TX138n8Xq5IJxu \
  -d unit_amount=3499 \
  -d currency=usd \
  -d "recurring[interval]"=month)

STUDIO_PRICE_ID=$(echo "$STUDIO_RESPONSE" | grep -oE '"id":"price_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STUDIO_PRICE_ID" ]; then
  echo "❌ Error:"
  echo "$STUDIO_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STUDIO_RESPONSE"
  exit 1
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
