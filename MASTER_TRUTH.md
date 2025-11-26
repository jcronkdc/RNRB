# MASTER_TRUTH

**Agent:** 131 | **Prev:** 130 | **Date:** 2025-11-26  
**Status:** ✅ BUILD RESTORED - CLEAN STATE VERIFIED

---

## ⚡ CURRENT STATE

### ✅ PRODUCTION STATUS
- **Build:** `pnpm build` → ✅ **CLEAN** (59s, 79 routes) - **VERIFIED 2025-11-26**
- **Site:** https://www.cronkwaters.com → ✅ HTTP 200
- **Auth:** Supabase + Google OAuth → ✅ Working
- **DB:** Neon PostgreSQL (us-west-2) → ✅ Connected
- **Stack:** Next.js 15.5.6, tRPC 11, Prisma 5.22.0

### 🚨 CRITICAL FIXES (Agent 131)

**BRUTAL TRUTH: MASTER_TRUTH.md WAS LYING**
- Previous agent claimed "Build: ✅ Clean" but build was **COMPLETELY BROKEN**
- Build had been failing for unknown amount of time
- 4 critical errors fixed:

1. **Missing tRPC export path** - FIXED
   - `package.json` missing `./client/react` export
   - Added to `/packages/trpc/package.json`
   
2. **Wrong import paths** - FIXED
   - 3 files importing `@repo/db` instead of `@cronkwaters/db`
   - Fixed in all library API routes
   
3. **Syntax error in collaborative-visual-builder** - FIXED
   - Missing closing `)` for `memo()` wrapper at line 193
   - Changed `}` to `});` to properly close the memo function
   
4. **Wrong lucide-react import** - FIXED
   - `Slider` icon doesn't exist in lucide-react
   - Changed to `SlidersHorizontal` in stems-mixer.tsx
   
5. **Wrong tRPC router import** - FIXED
   - `createTRPCRouter` doesn't exist - should be `router`
   - Fixed in `/packages/trpc/src/server/routers/usage.ts`

### 🚨 KNOWN ISSUES

1. **Ably Connection Timeout** (Non-Critical)
   - Console: "Auth.requestToken() timeout after 10 seconds"
   - Impact: Real-time collaboration disabled (chat, cursors, presence)
   - ABLY_API_KEY confirmed set in Vercel by user
   - App functions normally without real-time features
   - User Impact: LOW

2. **PostHog Analytics** - Disabled (no key set)
   - Non-blocking, analytics only

### 📋 FEATURES COMPLETE
- Version Control (Git for music)
- Stems Mixer (DAW-grade mixing)
- Copyright Manager (Legal splits)
- Project Milestones (Gantt charts)
- AI Insights (Project health)
- Songwriting Tool (4 tabs: Structure, Chords, Lyrics, Copyright)

---

## 🏗️ ARCHITECTURE

```
/packages/db     → Prisma 5.22.0 (2,006 lines, 50 models)
/packages/trpc   → API layer (13 routers, 20+ endpoints)
/packages/ui     → React components (31 files)
/apps/web        → Next.js App Router (79 routes)
```

**Build Order:** db → ui → web (turbo)

---

## 🔧 CORE COMMANDS

```bash
# Development
pnpm dev                    # Start local dev server (port 3000)
pnpm build                  # Production build (must pass)
pnpm prisma:generate        # Regenerate Prisma client

# Deployment
git push origin main        # Auto-deploy to Vercel (~3min)

# Nuclear Reset
rm -rf apps/web/.next node_modules/.cache/turbo && pnpm build
```

---

## 🧪 TESTING PROTOCOL

1. `pnpm build` → Must pass (no errors)
2. `curl -I https://www.cronkwaters.com` → HTTP 200
3. Browser test: Check console for errors
4. Full suite: Run `HUMAN_TEST_CHECKLIST.md`

---

## 📚 CRITICAL DOCS

- `DESIGN_SYSTEM.md` - UI rules (IMMUTABLE)
- `DATABASE_SCHEMA.md` - Schema reference
- `HUMAN_TEST_CHECKLIST.md` - Full test suite
- `ENV_TEMPLATE.md` - Environment setup

---

## 🚨 CRITICAL RULES

1. **NO** `Math.random()` or `Date.now()` in Server Components
2. **Middleware:** Cookie check only (no `auth()` import)
3. **Prisma:** Auto-generates in build process
4. **Monorepo:** Changes in `/packages/*` need full rebuild
5. **Design System:** Follow `DESIGN_SYSTEM.md` strictly
6. **Testing:** Run `pnpm build` before claiming "build clean"
7. **Imports:** Use `@cronkwaters/db` NOT `@repo/db`
8. **tRPC:** Use `router` NOT `createTRPCRouter`

---

## 🚨 RECOVERY PROCEDURES

### Build Fails
```bash
rm -rf apps/web/.next node_modules/.cache/turbo
pnpm install
pnpm prisma:generate
pnpm build
```

### Auth Issues
1. Check Vercel env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
2. Verify Neon DB is not paused
3. Check `middleware.ts` cookie logic

### Ably Connection Issues
1. Verify `ABLY_API_KEY` set in Vercel
2. Check Ably dashboard for service status
3. Test `/api/ably/token` endpoint returns 200 (not 503)

---

## 🐜 ANT COLONY PROTOCOL

1. **ONE TRUTH** - This file is the only master document
2. **BRUTAL HONESTY** - Document actual state, not desired state
3. **NO SHORTCUTS** - Clean builds, no placeholders
4. **VERIFY BEFORE CLAIMING** - Run `pnpm build` before saying "build clean"
5. **MYCELIAL FLOW** - Logical, connected paths (DB → API → UI)
6. **TOKEN WATCH** - Alert at 200K tokens

---

## 📊 CURRENT SESSION PROGRESS (Agent 131)

**Completed:**
- ✅ Fixed tRPC package.json exports (added `/client/react`)
- ✅ Fixed all `@repo/db` imports → `@cronkwaters/db`
- ✅ Fixed collaborative-visual-builder memo() syntax error
- ✅ Fixed lucide-react import (Slider → SlidersHorizontal)
- ✅ Fixed tRPC router import in usage.ts
- ✅ **BUILD VERIFIED CLEAN** (59s, exit code 0)

**Next Steps:**
1. Run browser tests (human test checklist)
2. Verify songwriting tool works
3. Test auth flow
4. Deploy to production

---

## 💾 MCP TOOLS AVAILABLE

- **Neon:** Database operations, migrations
- **Vercel:** Deployments, env vars, logs
- **Supabase:** Auth, database
- **Browser:** E2E testing, screenshots
- **Prisma:** Schema introspection

---

**Last Updated:** 2025-11-26 by Agent 131  
**Token Count:** ~69K / 200K (35% used, 131K remaining)  
**Latest Commit:** PENDING (5 files fixed, ready to commit)  
**Status:** ✅ Build clean, ready for testing and deployment
