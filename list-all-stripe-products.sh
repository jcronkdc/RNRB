#!/bin/bash
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎸 Your Stripe Products"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Paste your Stripe SECRET KEY and press Enter:"
read -r STRIPE_KEY

if [ -z "$STRIPE_KEY" ]; then
  echo "❌ No key provided"
  exit 1
fi

echo ""
echo "🔍 Fetching all products..."
echo ""

PRODUCTS=$(curl -s "https://api.stripe.com/v1/products?limit=100&active=true" \
  -u "${STRIPE_KEY}:")

echo "$PRODUCTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
products = data.get('data', [])

print('═══════════════════════════════════════════════════════')
print(f'Found {len(products)} products:')
print('═══════════════════════════════════════════════════════')
print()

for p in products:
    name = p.get('name', 'N/A')
    pid = p.get('id', 'N/A')
    desc = p.get('description', '')[:60]
    print(f'📦 {name}')
    print(f'   ID: {pid}')
    if desc:
        print(f'   {desc}...')
    print()

print('═══════════════════════════════════════════════════════')
"

echo ""
