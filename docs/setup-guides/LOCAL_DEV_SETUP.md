# 🔑 Local Development Environment Setup

## Step 1: Create .env.local File

In the `apps/web/` directory, create a file named `.env.local` with these contents:

```bash
# OpenAI API Key (REQUIRED for AI features)
OPENAI_API_KEY=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

# Database (copy from Vercel)
DATABASE_URL=<your-neon-database-url>

# Supabase (copy from Vercel)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-key>

# Auth (copy from Vercel)
NEXTAUTH_SECRET=<your-nextauth-secret>
NEXTAUTH_URL=http://localhost:3000

# OAuth (copy from Vercel)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Collaboration Services (copy from Vercel)
DAILY_API_KEY=<your-daily-api-key>
ABLY_API_KEY=<your-ably-api-key>

# Public Variables
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ABLY_CLIENT_ID=rnrb-web

# Development Settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

## Step 2: Copy Other Values from Vercel

Go to Vercel Dashboard → Settings → Environment Variables and copy the values for:

- DATABASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- DAILY_API_KEY
- ABLY_API_KEY

Replace the `<your-...>` placeholders with the actual values.

## Step 3: Restart Dev Server

```bash
cd apps/web
pnpm dev
```

Now local development will have AI features enabled!
