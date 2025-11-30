# ============================================

# CRONKWATERS LOCAL DEVELOPMENT ENVIRONMENT

# ============================================

# Copy this file to apps/web/.env.local and fill in your values

# NEVER commit .env.local to git (it's in .gitignore)

# ============================================

# DATABASE (REQUIRED)

# ============================================

# Get from: https://console.neon.tech (us-west-2 region)

DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# ============================================

# NEXTAUTH (REQUIRED FOR AUTH)

# ============================================

# Generate with: openssl rand -base64 32

NEXTAUTH_SECRET="your-secret-here-minimum-32-chars"

# Local dev URL (change if using different port)

NEXTAUTH_URL="http://localhost:3000"

# ============================================

# GOOGLE OAUTH (OPTIONAL - for Google Sign In)

# ============================================

# Get from: https://console.cloud.google.com/apis/credentials

# Project: "RNR Basement" (prj_IVRXSJT78FdVy8E5Sj51440HAuu3)

GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================

# AI FEATURES (OPTIONAL)

# ============================================

# OpenAI API Key (for AI songwriting features)

OPENAI_API_KEY="sk-..."

# X.AI API Key (alternative AI provider)

XAI_API_KEY="xai-..."

# ============================================

# REAL-TIME COLLABORATION (OPTIONAL)

# ============================================

# Ably WebSockets (multi-cursor, presence, chat)

# Get from: https://ably.com/dashboard

ABLY_API_KEY="your-ably-key-here"

# Daily.co Video (HD video calls, screen sharing)

# Get from: https://dashboard.daily.co

NEXT_PUBLIC_DAILY_API_KEY="your-daily-api-key"
NEXT_PUBLIC_DAILY_DOMAIN="your-domain.daily.co"
DAILY_WEBHOOK_SECRET="your-daily-webhook-secret"

# ============================================

# ANALYTICS (OPTIONAL)

# ============================================

# PostHog Analytics

# Get from: https://posthog.com

NEXT*PUBLIC_POSTHOG_KEY="phc*..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# ============================================

# EMAIL (OPTIONAL - for magic links)

# ============================================

# Resend API (production-grade email)

# Get from: https://resend.com/api-keys

RESEND*API_KEY="re*..."

# ============================================

# PAYMENTS (OPTIONAL - for subscriptions)

# ============================================

# Stripe API Keys

# Get from: https://dashboard.stripe.com/apikeys

STRIPE*SECRET_KEY="sk_test*..."
NEXT*PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test*..."
STRIPE*WEBHOOK_SECRET="whsec*..."
STRIPE_PRICE_ID_CREATOR="price_creator_monthly"
STRIPE_PRICE_ID_STUDIO="price_studio_monthly"

# Credit Add-Ons (one-time purchases)

# AI Credits: $6 for 100 requests

STRIPE_PRICE_ID_AI_100="price_1SZGEw2H6bMdop9gZadK70BA"

# Video Credits: $10 for 10 hours

STRIPE_PRICE_ID_VIDEO_600="price_1SZGEw2H6bMdop9gOgb1lZ0G"

# Image Credits: $4 for 25, $12 for 100

STRIPE_PRICE_ID_IMAGE_25="price_1SZGEx2H6bMdop9gcHo3QgEg"
STRIPE_PRICE_ID_IMAGE_100="price_1SZGEy2H6bMdop9glMbDKKCv"

# Storage Credits: $6/25GB, $15/100GB, $30/250GB (permanent)

STRIPE_PRICE_ID_STORAGE_25="price_1SZGEy2H6bMdop9gdH8RExgr"
STRIPE_PRICE_ID_STORAGE_100="price_1SZGEz2H6bMdop9gPECUD89F"
STRIPE_PRICE_ID_STORAGE_250="price_1SZGF02H6bMdop9g3pujT79e"

# ============================================

# SETUP INSTRUCTIONS

# ============================================

# 1. Copy this file: cp ENV_TEMPLATE.md apps/web/.env.local

# 2. Fill in DATABASE_URL and NEXTAUTH_SECRET (minimum required)

# 3. Add other keys as needed for features you want to test

# 4. Run: pnpm prisma:generate

# 5. Run: pnpm dev

# 6. Visit: http://localhost:3000

# ============================================

# TROUBLESHOOTING

# ============================================

# - Build fails: rm -rf .next && pnpm install && pnpm prisma:generate

# - Auth broken: Check DATABASE_URL connection & NEXTAUTH_SECRET exists

# - DB schema out of sync: pnpm prisma:generate

# - See MASTER_TRUTH.md for full recovery procedures
