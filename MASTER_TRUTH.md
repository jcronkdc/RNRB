# MASTER_TRUTH

**Agent:** 132 | **Prev:** 131 | **Date:** 2025-11-26  
**Status:** ✅ SONGWRITING PAGE FIXED - PRODUCTION CLEAN

---

## ⚡ CURRENT STATE (VERIFIED)

### ✅ PRODUCTION STATUS
- **Site:** https://www.cronkwaters.com → ✅ LIVE (HTTP 200)
- **Songwriting:** https://www.cronkwaters.com/songwriting → ✅ WORKING
- **Latest Commit:** `b1e52e25` (deployed & verified)
- **Build:** ✅ Clean 
- **Auth:** Supabase + Google OAuth → ✅ Working
- **DB:** Neon PostgreSQL (us-west-2) → ✅ Connected
- **Stack:** Next.js 15.5.6, tRPC 11, Prisma 5.22.0, Turbo 2.3.0

### 🚨 KNOWN ISSUES (Non-Blocking)

1. **Ably Real-Time** - Configuration warnings (app works normally)
   - `closeOnUnload` and session recovery mutually exclusive
   - Impact: None - warnings only, features work
2. **PostHog Analytics** - Disabled (no key set)

### 🔧 CRITICAL FIXES (Agent 132)

**Issue Reported:** "Site crashes when I click songwriting tool"

**Two Fixes Required:**

#### Fix 1: localStorage Key Conflict
- **Symptom:** Initial error showed `ReferenceError: setShowOnboarding is not defined`
- **Root Cause:** Conflicting localStorage keys between page and OnboardingTour component
  - Page used: `'songwriting-tour-completed'`
  - Component used: `'onboarding-tour-completed'`
- **Solution:** Unified all localStorage keys to `'onboarding-tour-completed'`
- **Files Changed:** `apps/web/app/(app)/songwriting/page.tsx`
- **Commit:** `9d1c5ea6`

#### Fix 2: tRPC Context Chain Broken
- **Symptom:** "Unable to find tRPC Context" error
- **Root Cause:** Server Component between Client Component provider and consumer breaks React Context
  - Structure was: `RootLayout (Server) → TRPCReactProvider (Client) → (app)/Layout (Server) → AppLayout (Client) → TopBar (uses tRPC)`
  - The Server Component `(app)/Layout` broke the context chain
- **Solution:** Added `'use client'` directive to `(app)/layout.tsx` to make it a Client Component
- **Why This Works:** Maintains unbroken Client Component chain from provider to consumer
- **Files Changed:** `apps/web/app/(app)/layout.tsx`
- **Commit:** `b1e52e25`

**Testing:** ✅ Verified page loads without errors on production

### 📋 FEATURES LIVE
- Songwriting Tool (4 tabs: Structure, Chords, Lyrics, Copyright) ← **NOW WORKING**
- Version Control (Git for music)
- Stems Mixer (DAW-grade)
- Copyright Manager (Legal splits, PDF generation)
- Project Management (Milestones, Gantt charts)
- AI Insights (OpenRouter powered)

---

## 🏗️ ARCHITECTURE

```
/packages/db     → Prisma 5.22.0 (50 models, 2006 lines)
/packages/trpc   → 13 routers, 20+ endpoints
/packages/ui     → 31 components
/apps/web        → 79 routes (Next.js App Router)
```

**Build Order:** `db → ui → web` (turbo pipeline)

**Layout Hierarchy (CRITICAL):**
```
RootLayout (layout.tsx) - Server Component
  ├── TRPCReactProvider - Client Component
  │   └── (app)/Layout - Client Component ← MUST be Client Component!
  │       └── AppLayout - Client Component
  │           ├── TopBar (uses tRPC hooks)
  │           └── SidebarNav
  │           └── children (pages)
```

---

## 🔧 ESSENTIAL COMMANDS

```bash
# Development
pnpm dev                    # Port 3000

# Deployment  
git push origin main        # Auto-deploy (~3min)

# Prisma
pnpm prisma:generate        # After schema changes

# Nuclear Reset (if needed)
rm -rf apps/web/.next node_modules/.cache/turbo && pnpm install
```

---

## 🚨 CRITICAL RULES

1. **Imports:** `@cronkwaters/db` NOT `@repo/db`
2. **tRPC:** `router` NOT `createTRPCRouter`
3. **React Context:** NO Server Components between Client provider and consumer
4. **Middleware:** Cookie check only (no `auth()` import)
5. **Server Components:** NO `Math.random()` or `Date.now()`
6. **Design System:** Follow `DESIGN_SYSTEM.md` (NO emojis in UI)
7. **Testing:** Always verify on Vercel (local builds unreliable)
8. **Monorepo:** Changes in `/packages/*` require full rebuild

---

## 🚨 RECOVERY PROCEDURES

### Songwriting Page Crashes
1. Check browser console for exact error
2. If "tRPC Context" error:
   - Verify `(app)/layout.tsx` has `'use client'` directive
   - Check layout hierarchy - no Server Components between provider and consumers
3. If localStorage errors:
   - Check all localStorage keys are consistent
   - `OnboardingTour` uses `'onboarding-tour-completed'`

### Build Fails Locally (But Vercel Works)
```bash
# This is OK - just push to Vercel
git push origin main
```

### Auth Issues
1. Check Vercel env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
2. Verify Neon DB not paused
3. Check middleware.ts cookie logic

---

## 📚 KEY DOCS

- `DESIGN_SYSTEM.md` - UI/UX rules (IMMUTABLE)
- `DATABASE_SCHEMA.md` - Schema reference
- `HUMAN_TEST_CHECKLIST.md` - Test protocol
- `ENV_TEMPLATE.md` - Environment vars

---

## 🐜 ANT COLONY PROTOCOL

1. **ONE TRUTH** - This is the ONLY master document
2. **BRUTAL HONESTY** - Document reality, not wishes
3. **NO SHORTCUTS** - Clean builds, real testing
4. **VERIFY FIRST** - Test before claiming success
5. **MYCELIAL FLOW** - Follow logical paths: DB → API → UI → TEST
6. **TOKEN WATCH** - Alert at 180K tokens (20K buffer)

---

## 💾 MCP TOOLS AVAILABLE

- **Neon:** Database ops, migrations, schema compare
- **Vercel:** Deployments, logs, env vars
- **Supabase:** Auth, database queries
- **Browser:** E2E testing, screenshots, snapshots
- **Prisma:** Schema introspection

---

## 📊 SESSION SUMMARY (Agent 132)

**Task:** Fix songwriting page crash

**What We Found:**
1. localStorage key conflict masked deeper tRPC context issue
2. Server Component in layout chain broke React Context for tRPC
3. Error messages were misleading (initially showed setShowOnboarding, then tRPC context)

**What We Fixed:**
1. ✅ Unified localStorage keys to `'onboarding-tour-completed'`
2. ✅ Made `(app)/layout.tsx` a Client Component to preserve context chain
3. ✅ Verified fix on production - page loads without errors

**Commits:**
- `9d1c5ea6` - localStorage key fix
- `b1e52e25` - tRPC context fix

**Next Agent Should:**
1. Continue with normal development
2. If songwriting page issues recur, check:
   - Browser console for exact error
   - Layout hierarchy for Server Components breaking context
   - localStorage key consistency

---

**Last Updated:** 2025-11-26 by Agent 132  
**Latest Commit:** `b1e52e25` (songwriting page fixed)  
**Build Status:** ✅ Clean  
**Token Count:** ~115K / 200K (58% used, 85K remaining)
