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

# 2FA Encryption Key (for TOTP secrets)

# Generate with: openssl rand -hex 32

# Falls back to NEXTAUTH_SECRET if not set

TWO_FACTOR_ENCRYPTION_KEY="your-2fa-encryption-key"

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

# EMAIL CONFIGURATION (for all email features)

# ============================================

# Resend API (production-grade email)

# Get from: https://resend.com/api-keys

RESEND*API_KEY="re*..."

# Business Email Addresses (customize to your domain)

NEWSLETTER_FROM_EMAIL="Rock N' Roll Basement <newsletter@rnrb.me>"
SUPPORT_EMAIL="Rock N' Roll Basement Support <support@rnrb.me>"
SUPPORT_REPLY_TO="support@rnrb.me"
INFO_EMAIL="info@rnrb.me"
NOREPLY_EMAIL="Rock N' Roll Basement <noreply@rnrb.me>"

# Stalwart Mail Server (for user email accounts - Email Pro feature)

# See EMAIL_SETUP_GUIDE.md for full configuration

STALWART_API_URL="http://mail.rnrb.me:8080"
STALWART_ADMIN_USER="admin"
STALWART_ADMIN_PASSWORD="your-admin-password"
STALWART_API_KEY="your-api-key"

# Email Sync Secret (for standalone webmail app sync)

# Generate with: openssl rand -hex 32

# Used to authenticate sync requests from the standalone email client

EMAIL_SYNC_SECRET="your-email-sync-secret"

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

# Credit Add-Ons (one-time purchases) - RNRB Account - Dec 2, 2025

# AI Credits: $6 for 100 requests

STRIPE_PRICE_ID_AI_100="price_1SZzNPFiQRCfkKrvIVzjFbT1"

# Video Packs (usage-based, not subscription)

# Starter: $5 for 2 hours (120 min)

STRIPE_PRICE_ID_VIDEO_120="price_1SZzNQFiQRCfkKrvbpPjFrD6"

# Band Practice: $20 for 10 hours (600 min)

STRIPE_PRICE_ID_VIDEO_600="price_1SZzNRFiQRCfkKrvV8jVNvoZ"

# Studio Sessions: $50 for 30 hours (1800 min)

STRIPE_PRICE_ID_VIDEO_1800="price_1SZzNSFiQRCfkKrvZKUs6vW0"

# Image Credits: $4 for 25, $12 for 100

STRIPE_PRICE_ID_IMAGE_25="price_1SZzNSFiQRCfkKrvj65e48OJ"
STRIPE_PRICE_ID_IMAGE_100="price_1SZzNTFiQRCfkKrvtmQugqXh"

# Stem Separation Credits (AI-powered vocal/instrument isolation)

# 10 credits: $2.99 (~$0.30/credit) - Casual users

# 25 credits: $5.99 (~$0.24/credit) - Regular users

# 50 credits: $9.99 (~$0.20/credit) - Power users

STRIPE_PRICE_ID_STEM_10="price_1Sa0NjFiQRCfkKrvzNdPaOB7"
STRIPE_PRICE_ID_STEM_25="price_1Sa0NkFiQRCfkKrvQ5uaQbW0"
STRIPE_PRICE_ID_STEM_50="price_1Sa0NkFiQRCfkKrvjomR05tp"

# Storage Credits: $6/25GB, $15/100GB, $30/250GB (permanent)

STRIPE_PRICE_ID_STORAGE_25="price_1SZzNUFiQRCfkKrvaW7JVZuw"
STRIPE_PRICE_ID_STORAGE_100="price_1SZzNUFiQRCfkKrvCMfsoYj2"
STRIPE_PRICE_ID_STORAGE_250="price_1SZzNVFiQRCfkKrvVLEqxyuq"

# ============================================

# MCP SERVER (Remote AI Tools)

# ============================================

# API key for MCP server to authenticate with main app

# Generate with: openssl rand -hex 32

# Must match RNRB_API_KEY in the MCP server's wrangler secrets

MCP_SERVER_API_KEY="your-mcp-server-api-key"

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
