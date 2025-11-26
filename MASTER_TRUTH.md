# MASTER_TRUTH

# MASTER_TRUTH

**Agent:** 132 | **Prev:** 131 | **Date:** 2025-11-26  
**Status:** ✅ PRODUCTION FIXED - BUILD CLEAN

---

## ⚡ CURRENT STATE (VERIFIED)

### ✅ PRODUCTION STATUS
- **Site:** https://www.cronkwaters.com → ✅ LIVE (HTTP 200)
- **Latest Commit:** `162560a8` (deployed & working)
- **Build:** ✅ Clean (tRPC provider fixed)
- **Auth:** Supabase + Google OAuth → ✅ Working
- **DB:** Neon PostgreSQL (us-west-2) → ✅ Connected
- **Stack:** Next.js 15.5.6, tRPC 11, Prisma 5.22.0, Turbo 2.3.0

### 🚨 KNOWN ISSUES (Non-Blocking)

1. **Ably Real-Time** - Configuration warning (app works normally)
2. **PostHog Analytics** - Disabled (no key set)

### 🔧 CRITICAL FIX (Agent 132)
- **Problem:** "Unable to find tRPC Context" - Songwriting page crashed
- **Root Cause:** TRPCReactProvider completely missing from layout
- **Solution:** Created provider component + added to layout hierarchy
- **Status:** ✅ Fixed and deployed
- **Files Changed:**
  - Created: `apps/web/components/providers/trpc-provider.tsx`
  - Modified: `apps/web/app/layout.tsx` (added tRPC provider wrapper)

### 📋 FEATURES LIVE
- Songwriting Tool (4 tabs: Structure, Chords, Lyrics, Copyright)
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
3. **Middleware:** Cookie check only (no `auth()` import)
4. **Server Components:** NO `Math.random()` or `Date.now()`
5. **Design System:** Follow `DESIGN_SYSTEM.md` (NO emojis in UI)
6. **Testing:** Always verify on Vercel (local builds unreliable)
7. **Monorepo:** Changes in `/packages/*` require full rebuild

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

**Last Updated:** 2025-11-26 by Agent 132  
**Latest Commit:** `e8d60b2d` (docs update)  
**Build Status:** ✅ Clean  
**Token Count:** ~58K / 200K (29% used)
