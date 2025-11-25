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
NEXT_PUBLIC_ABLY_KEY="your-ably-key"

# Daily.co Video (HD video calls, screen sharing)
# Get from: https://dashboard.daily.co
NEXT_PUBLIC_DAILY_API_KEY="your-daily-api-key"
NEXT_PUBLIC_DAILY_DOMAIN="your-domain.daily.co"

# ============================================
# ANALYTICS (OPTIONAL)
# ============================================
# PostHog Analytics
# Get from: https://posthog.com
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# ============================================
# EMAIL (OPTIONAL - for magic links)
# ============================================
# Resend API (production-grade email)
# Get from: https://resend.com/api-keys
RESEND_API_KEY="re_..."

# ============================================
# PAYMENTS (OPTIONAL - for subscriptions)
# ============================================
# Stripe API Keys
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

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

