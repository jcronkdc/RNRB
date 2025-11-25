# MASTER_TRUTH - CRONKWATERS

**Agent:** 123 (Current) | **Previous:** 122  
**Production:** https://www.cronkwaters.com  
**Date:** 2025-11-25  
**Status:** 🟢 PRODUCTION LIVE | ✅ BUILD PASSING

---

## ⚡ CURRENT STATE

### ✅ WORKING
- **Build:** `pnpm build` PASSES (8.4s turbo cached)
- **Production:** LIVE at https://www.cronkwaters.com
- **Auth:** NextAuth v5 (Google OAuth + Password) via `packages/auth`
- **Database:** Neon PostgreSQL + Prisma 5.22.0
- **Real-time:** Ably WebSockets configured
- **Video:** Daily.co configured
- **Middleware:** 33.9 kB edge-compatible

### 🟡 KNOWN ISSUES
- **1 TypeScript error:** `.next/types/validator.ts` (React 18/19 mismatch) - NON-BLOCKING, build passes

### ✅ AGENT 122 FIXES
- **Hydration Error #418:** Fixed `Math.random()` in `apps/web/app/page.tsx` → deterministic values

---

## 🏗️ STACK

```
Next.js 15.0.0 (App Router)
  ↓
NextAuth v5.0.0-beta.30
  ↓
tRPC v11.0.0-rc.502
  ↓
Prisma 5.22.0 → Neon PostgreSQL
  ↓
Ably + Daily.co
```

**Core:**
- Next.js 15.0.0 | React 18.3.1 | TypeScript 5.6.3
- Turborepo + pnpm@9.11.0
- Tailwind 3.4.14 + Framer Motion 11.0.5

**Workspace Packages:**
- `@cronkwaters/auth` - NextAuth v5 config
- `@cronkwaters/db` - Prisma client + schema
- `@cronkwaters/trpc` - tRPC routers
- `@cronkwaters/ui` - Shared components
- `@rnrb/web` - Main Next.js app

---

## 🎯 KEY FILES

**Auth:**
- `packages/auth/src/auth.ts` - NextAuth config
- `apps/web/middleware.ts` - Edge auth check (33.9 kB)

**Database:**
- `packages/db/prisma/schema.prisma` - DB schema

**App:**
- `apps/web/app/layout.tsx` - Root layout
- `apps/web/app/page.tsx` - Homepage (hydration fixed)
- `apps/web/components/app-layout.tsx` - App shell

**Features:**
- `apps/web/app/songwriting/` - Collaborative songwriting
- `apps/web/app/projects/` - Project management
- `apps/web/components/setlist-builder.tsx` - Setlist generator

---

## 📊 COMMANDS

```bash
# Development
pnpm dev              # Port 3000

# Production
pnpm build            # ✅ PASSING
pnpm typecheck        # 🟡 1 non-blocking error
pnpm lint             # ⚠️ Warnings (non-blocking)

# Database
pnpm prisma:generate  # After schema changes
pnpm prisma:studio    # DB GUI

# Deploy
git push origin main  # Auto-deploys to Vercel (~2-3min)
```

---

## 🔐 ENV VARS (REQUIRED)

**Auth:**
- `NEXTAUTH_SECRET` ✅
- `NEXTAUTH_URL` ✅
- `GOOGLE_CLIENT_ID` ✅
- `GOOGLE_CLIENT_SECRET` ✅

**Database:**
- `DATABASE_URL` ✅

**Real-time (Optional):**
- `ABLY_API_KEY` ✅
- `DAILY_API_KEY` ✅

**AI (Optional):**
- `OPENAI_API_KEY` ❌
- `XAI_API_KEY` ❌

**Analytics (Optional):**
- `NEXT_PUBLIC_POSTHOG_KEY` ❌

**Payments:**
- `STRIPE_SECRET_KEY` ✅

---

## 🧪 HUMAN TEST

**Before Work:**
1. `pnpm build` → verify passing
2. Check production → https://www.cronkwaters.com
3. Test auth flow → sign in/out
4. Check console → no critical errors

**After Work:**
1. `pnpm build` → verify still passing
2. Deploy → `git push origin main`
3. Wait 3min → check production
4. Update MASTER_TRUTH

**Detailed Checklist:** `HUMAN_TEST_CHECKLIST.md`

---

## 🐜 ANT PRINCIPLES

1. **ONE MASTER_TRUTH** - This file only, never duplicate
2. **BRUTAL HONESTY** - Say what's broken, no sugarcoating
3. **CLEAN BUILD** - No shortcuts, no placeholders
4. **HUMAN TEST** - Test like a real user, regularly
5. **MYCELIAL FLOW** - Auth → DB → UI → Real-time
6. **TOKEN TRACKING** - Alert at 180K, switch at 200K

---

## 📌 CRITICAL FACTS

**Works:**
- Production live, build passing, auth functional, DB connected
- Hydration fixed (Agent 122)

**Broken:**
- Nothing production-blocking

**Optional/Missing:**
- PostHog (needs key)
- AI features (needs OpenAI/XAI keys)
- Subscription enforcement (Stripe configured but not enforced)

**Next Steps:**
1. Full human test checklist
2. Test songwriting end-to-end
3. Test project creation
4. Verify subscription gating
5. Test community discovery

---

## 🎨 UI RULES (IMMUTABLE)

**Source:** `DESIGN_SYSTEM.md`

**Non-Negotiable:**
1. NO EMOJIS in UI (docs only)
2. NO ICONS unless necessary
3. NO CHEESY ELEMENTS
4. TYPOGRAPHY FIRST
5. DARK MODE (#09090b background)

**Colors:**
- zinc-950 (#09090b) - Primary background
- zinc-900 (#18181b) - Cards
- zinc-800 (#27272a) - Borders
- white / zinc-300 - Text
- blue-500 (#3b82f6) - Accents

**Fonts:**
- Oswald - Headings
- Permanent Marker - Brand/user names
- Inter - Body
- JetBrains Mono - Technical

---

## 🧬 DATABASE

**Schema:** `packages/db/prisma/schema.prisma`

**Core Models:**
- `User` - Auth + subscription
- `Account` / `Session` - NextAuth
- `Org` - Organizations
- `Project` - Projects
- `Song` - Songs (lyrics, chords)
- `Setlist` - Setlists
- `Show` / `Venue` / `Tour` - Live performance
- `CommunityTrack` - Published songs
- `Subscription` - Stripe
- `Message` - User messaging

**Version:** Prisma 5.22.0 (upgrade available: 7.0.1)

---

## 🔥 GOTCHAS

1. **Hydration:** Watch `Math.random()` / `Date.now()` in SSR
2. **TypeScript:** `.next/types/validator.ts` error is cosmetic
3. **Prisma:** Run `pnpm prisma:generate` after schema changes
4. **Monorepo:** Changes to `packages/*` need rebuild
5. **Env Vars:** Local in `apps/web/.env.local`, prod in Vercel

---

## 🚨 RECOVERY

**Build Breaks:**
```bash
rm -rf apps/web/.next node_modules/.cache/turbo
rm -rf node_modules && pnpm install
pnpm prisma:generate
```

**Auth Breaks:**
- Check `DATABASE_URL`, `NEXTAUTH_SECRET`
- Verify Prisma client generated
- Check Neon DB reachable

**Deploy Fails:**
- Check Vercel logs
- Verify env vars in Vercel dashboard
- Check Node version (18.x+)

---

## 📊 TOKEN TRACKING

**Agent:** 123  
**Tokens Used:** ~54K / 200K  
**Remaining:** ~146K  
**Alert:** 180K  

**Approaching 200K:**
1. Alert user IMMEDIATELY
2. Update MASTER_TRUTH
3. List incomplete tasks
4. Prepare handoff

---

## 📚 SUPPORTING DOCS

**Reference Only (DO NOT duplicate):**
- `HUMAN_TEST_CHECKLIST.md` - Testing guide
- `DESIGN_SYSTEM.md` - UI rules (IMMUTABLE)
- `LOCAL_DEV_SETUP.md` - Env setup
- `GOOGLE_OAUTH_SETUP.md` - OAuth config
- `VERCEL_ENV_CHECKLIST.md` - Vercel vars
- `COLLABORATIVE_ARCHITECTURE.md` - Multi-user
- `PERFORMANCE_GUIDE.md` - Performance
- `README_DEPLOYMENT.md` - Deployment

---

**Last Updated:** 2025-11-25 by Agent 123  
**Build:** ✅ PASSING | **Production:** ✅ LIVE | **Hydration:** ✅ FIXED
