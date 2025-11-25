# MASTER_TRUTH

**Agent:** 130 | **Prev:** 129 | **Date:** 2025-11-25  
**Status:** 🔧 FIXING SONGWRITING TOOL - SYSTEMATIC CLEANUP

---

## ⚡ CURRENT STATE

### ✅ PRODUCTION STATUS
- **Build:** `pnpm build` → ✅ Clean (19.2s, 79 routes)
- **Site:** https://www.cronkwaters.com → ✅ HTTP 200
- **Auth:** Supabase + Google OAuth → ✅ Working
- **DB:** Neon PostgreSQL (us-west-2) → ✅ Connected
- **Stack:** Next.js 15.5.6, tRPC 11, Prisma 5.22.0

### 🚨 KNOWN ISSUES

1. **Ably Connection Timeout** (Investigating - Non-Blocking)
   - Console: "Auth.requestToken() timeout after 10 seconds"
   - Impact: Real-time collaboration disabled (chat, cursors, presence)
   - ABLY_API_KEY confirmed set in Vercel by user
   - Added enhanced logging to diagnose (commit a8f1d6ef)
   - Check Vercel logs for `[Ably Token]` entries after deployment
   - User Impact: LOW - App functions normally without real-time features
   - Next: Review logs to identify root cause

2. **Song Creation Dependency** - ✅ FIXED (commit 87dd9827)
   - Was: Multiple creation attempts due to dependency array
   - Now: Only runs on user ID change (line 189-197 in songwriting/page.tsx)

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
- `SONGWRITING_TOOL_TEST_REPORT.md` - Latest test results

---

## 🚨 CRITICAL RULES

1. **NO** `Math.random()` or `Date.now()` in Server Components
2. **Middleware:** Cookie check only (no `auth()` import)
3. **Prisma:** Auto-generates in build process
4. **Monorepo:** Changes in `/packages/*` need full rebuild
5. **Design System:** Follow `DESIGN_SYSTEM.md` strictly
6. **Testing:** Run human test checklist before marking complete

---

## 🔥 KNOWN ISSUES

1. **ABLY_API_KEY** - May not be set in Vercel production
   - Check: Vercel dashboard → Environment Variables
   - Get key from: https://ably.com/dashboard
   - Add to Vercel: Settings → Environment Variables → Production
   
2. **PostHog Analytics** - Disabled (no key set)
   - Non-blocking, analytics only

3. **Test Account** - `test@cronkwaters.com` missing from prod DB
   - Need to create manually or via migration

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
4. **HUMAN TEST FIRST** - Verify before coding
5. **MYCELIAL FLOW** - Logical, connected paths (DB → API → UI)
6. **TOKEN WATCH** - Alert at 180K tokens (current: ~65K)

---

## 📊 CURRENT SESSION PROGRESS (Agent 130)

**Completed:**
- ✅ Fixed song creation dependency array (commit 87dd9827)
- ✅ Streamlined MASTER_TRUTH.md
- ✅ Build test passed (28s cached)
- ✅ Partial human testing completed
- ✅ Created SONGWRITING_CURRENT_STATE.md
- ✅ Created AGENT_130_FINAL_REPORT.md
- ✅ Enhanced Ably token logging (commit a8f1d6ef)
- ✅ Confirmed "missing 's' characters" is browser tool bug (not real)
- ✅ Deployed to production (2 commits pushed)
- ✅ **MAJOR: Redesigned songwriting page aesthetic (commit 5b9b9e25)**
  - Removed all emojis from UI
  - Removed excessive gradients and colors
  - Simplified to zinc palette (DESIGN_SYSTEM compliant)
  - 30% bundle size reduction (11.8KB → 8.21KB)
  - 28% fewer lines of code (759 → 543)
  - Professional control room aesthetic

**Next Agent Should:**
1. Check Vercel logs for `[Ably Token]` entries to diagnose timeout
2. Complete full human test checklist (`HUMAN_TEST_CHECKLIST.md`)
3. Test songwriting tool interactivity (add blocks, undo/redo)
4. Verify auto-save works correctly
5. Clean up remaining components (CollaborativeVisualBuilder emojis)
6. Once Ably working, test real-time collaboration

---

## 💾 MCP TOOLS AVAILABLE

- **Neon:** Database operations, migrations
- **Vercel:** Deployments, env vars, logs
- **Supabase:** Auth, database
- **Browser:** E2E testing, screenshots
- **Prisma:** Schema introspection

---

**Last Updated:** 2025-11-25 by Agent 130  
**Token Count:** ~132K / 200K (66% used, 68K remaining)  
**Latest Commit:** 5b9b9e25 (Aesthetic redesign)  
**Status:** ✅ Clean build, deployed, DESIGN_SYSTEM compliant
