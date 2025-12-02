#!/bin/bash

# Load env vars from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

echo "Creating Stripe recurring prices..."
echo "Using key: ${STRIPE_SECRET_KEY:0:20}..."

# Creator Price ($17.99/month)
echo -e "\n📦 Creating Creator price..."
CREATOR_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d product=prod_TX12F2WtOUcA1s \
  -d unit_amount=1799 \
  -d currency=usd \
  -d "recurring[interval]"=month)

CREATOR_PRICE_ID=$(echo $CREATOR_RESPONSE | grep -o 'price_[a-zA-Z0-9]*' | head -1)
echo "✅ Creator Price ID: $CREATOR_PRICE_ID"

# Studio Price ($34.99/month)
echo -e "\n📦 Creating Studio price..."
STUDIO_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d product=prod_TX138n8Xq5IJxu \
  -d unit_amount=3499 \
  -d currency=usd \
  -d "recurring[interval]"=month)

STUDIO_PRICE_ID=$(echo $STUDIO_RESPONSE | grep -o 'price_[a-zA-Z0-9]*' | head -1)
echo "✅ Studio Price ID: $STUDIO_PRICE_ID"

echo -e "\n\n🎉 Done! Add these to Vercel:"
echo "STRIPE_PRICE_ID_CREATOR=$CREATOR_PRICE_ID"
echo "STRIPE_PRICE_ID_STUDIO=$STUDIO_PRICE_ID"
