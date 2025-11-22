#!/bin/bash

# Quick script to run migration with Vercel environment
# Usage: ./migrate.sh

echo "🔍 Pulling DATABASE_URL from Vercel..."

# Pull env var from Vercel
DATABASE_URL=$(vercel env pull --yes 2>/dev/null && cat .vercel/.env.local | grep DATABASE_URL | cut -d '=' -f2-)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Could not get DATABASE_URL from Vercel"
  echo "💡 Run manually:"
  echo "   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
  echo "   2. Copy DATABASE_URL value"
  echo "   3. Run: export DATABASE_URL='your-value-here'"
  echo "   4. Run: cd packages/db && pnpm prisma db push"
  exit 1
fi

echo "✅ Got DATABASE_URL from Vercel"
echo "🚀 Running migration..."

cd packages/db
DATABASE_URL="$DATABASE_URL" pnpm prisma db push

echo "✅ Migration complete!"

