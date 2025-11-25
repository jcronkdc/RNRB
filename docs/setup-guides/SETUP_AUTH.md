# 🔐 Authentication Setup Guide

## CRITICAL: Missing NextAuth Tables Fixed

**Status:** ✅ Prisma schema updated with NextAuth models (Account, Session, VerificationToken)

## Required Environment Variables

### For Local Development

Create `/apps/web/.env.local` with:

```bash
# Database - REQUIRED
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# NextAuth - REQUIRED
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth - REQUIRED for Google Sign-In
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Magic Link - OPTIONAL (recommended: Resend)
# Resend: https://resend.com/api-keys
EMAIL_SERVER_URL="smtp://resend:re_YOUR_API_KEY@smtp.resend.com:587"
EMAIL_FROM="onboarding@resend.dev"  # Use this for testing without domain

# Ably - OPTIONAL (for real-time messaging)
ABLY_API_KEY="your-ably-api-key"
NEXT_PUBLIC_ABLY_CLIENT_ID="your-ably-client-id"

# Daily.co - OPTIONAL (for video/streaming)
DAILY_API_KEY="your-daily-api-key"
```

### For Production (Vercel)

Add the same variables in:
**Vercel Dashboard → Project Settings → Environment Variables → Production**

**IMPORTANT:** Update `NEXTAUTH_URL` to your production URL:

```bash
NEXTAUTH_URL="https://your-domain.vercel.app"
```

## Database Setup

1. **Apply Migrations:**

```bash
cd packages/db
pnpm prisma migrate deploy
```

2. **Verify Tables Created:**

```bash
pnpm prisma studio
```

Check for these tables:

- ✅ Account
- ✅ Session
- ✅ VerificationToken
- ✅ User (with emailVerified field)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
4. Copy Client ID and Secret to `.env.local`

## Testing Auth Locally

```bash
# From project root
pnpm install
cd apps/web
pnpm dev
```

Visit: `http://localhost:3000/auth`

Test flows:

- ✅ Click "Continue with Google"
- ✅ Enter email for magic link
- ✅ Check error messages if keys missing

## Common Issues

### "No provider for email"

→ Add `EMAIL_SERVER_URL` and `EMAIL_FROM`

### "OAuth error"

→ Check Google Console redirect URIs match exactly

### "Database error"

→ Run `prisma migrate deploy` in packages/db

### "NEXTAUTH_SECRET not found"

→ Generate with: `openssl rand -base64 32`

## Production Checklist

- [ ] DATABASE_URL points to production database
- [ ] NEXTAUTH_SECRET is secure (32+ chars)
- [ ] NEXTAUTH_URL matches production URL
- [ ] Google OAuth redirect URIs include production URL
- [ ] Prisma migrations applied to production database
- [ ] Test sign-in flow on production
- [ ] Test sign-out flow
- [ ] Verify session persistence
- [ ] Check Vercel function logs for errors

## Files Modified

- ✅ `packages/db/prisma/schema.prisma` - Added NextAuth models
- ✅ `packages/auth/src/auth.ts` - Uses PrismaAdapter (was missing tables)
- ✅ `apps/web/app/auth/page.tsx` - Sign-in page exists
- ✅ `apps/web/app/api/auth/[...nextauth]/route.ts` - Auth handler exists

## Next Steps

1. Create `.env.local` with your database URL
2. Run migrations: `cd packages/db && pnpm prisma migrate deploy`
3. Set up Google OAuth credentials
4. Test locally: `cd apps/web && pnpm dev`
5. Deploy to Vercel with production env vars
6. Test auth on production
