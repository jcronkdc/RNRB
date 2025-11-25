# MASTER_TRUTH

**Agent:** 129 | **Prev:** 128 | **Date:** 2025-11-25  
**Status:** 🚧 BUILDING WORLD-CLASS FEATURES

---

## ⚡ SYSTEM STATE

### ✅ PRODUCTION STABLE
- Build: `pnpm build` → Working (all 73 routes)
- Site: https://www.cronkwaters.com (HTTP 200)
- Auth: Supabase password + Google OAuth ✅
- DB: Neon PostgreSQL (us-west-2) ✅
- Stack: Next.js 15.5.6, tRPC 11, Prisma 5.22.0

### 🚀 PHASE 1: DATABASE FOUNDATION - COMPLETE
**Goal:** Build the best music project tool in the world

#### ✅ NEW MODELS ADDED (2025-11-25)
1. **SongVersion** - Git-like version control for songs
   - Track v1, v2, v3... with labels ("Demo", "Final Mix")
   - Snapshot lyrics, chords, audio at each version
   - Compare versions, rollback, cherry-pick changes
   
2. **SongTrack** - Professional multi-track/stems management
   - Separate tracks (vocals, guitar, drums, bass)
   - Waveform visualization data
   - Mix controls (volume, pan, solo, mute)
   - 16 track types (vocal_lead, guitar_electric, drums, etc.)
   
3. **Enhanced SongSplit** - Smart revenue & copyright
   - PRO affiliation (BMI, ASCAP, SESAC)
   - IPI numbers, publisher info
   - Payment tracking ($earned, payout methods)
   - Digital signatures & dispute resolution
   - 5 split types (writing, production, performance, master, publishing)
   
4. **ProjectMilestone** - Timeline & roadmap
   - Gantt-style project management
   - Dependencies, blocking issues
   - Progress tracking (0-100%)
   - Priority levels
   
5. **ProjectView** - Smart file organization
   - Saved filters ("All in C major >120 BPM")
   - Custom sorting
   - Like email filters for songs
   
6. **ProjectReference** - Mood boards & inspiration
   - Attach Spotify links, YouTube videos
   - Reference tracks for "the vibe"
   - Tagging system
   
7. **ProjectInsight** - AI analysis
   - Completion score (0-100)
   - Blockers detection
   - Velocity trends
   - Quality metrics

### ❌ KNOWN ISSUES
- Test account (test@cronkwaters.com) missing from production DB  
- PostHog analytics disabled (no key)

---

## 🏗️ STACK

```
/packages/db    → Prisma 5.22.0 (1302 lines, 40+ models)
/packages/trpc  → API layer (13 routers)
/packages/ui    → React components (31 files)
/apps/web       → Next.js App Router (73 routes)
```

**Build Order:** db → ui → web (turbo)

---

## 📊 CORE COMMANDS

```bash
pnpm build              # Must pass before deploy
git push origin main    # Auto-deploy (~3min)
pnpm prisma:generate    # After schema changes
```

**Nuclear Reset:**
```bash
rm -rf apps/web/.next node_modules/.cache/turbo && pnpm build
```

---

## 🧪 TEST PROTOCOL

1. `pnpm build` → Must pass
2. `curl -I https://www.cronkwaters.com` → HTTP 200
3. Browser test: Auth page, console errors
4. Full suite: `HUMAN_TEST_CHECKLIST.md`

---

## 🔧 MCP TOOLS AVAILABLE

- **Neon:** DB queries, migrations, schema
- **Vercel:** Deployments, logs, env vars
- **Prisma:** Schema introspection
- **Browser:** E2E testing, snapshots
- **Supabase:** Auth, database operations

---

## 🔥 CRITICAL RULES

1. NO `Math.random()` / `Date.now()` in SSR
2. Middleware: Cookie check only (no `auth()` import)
3. Prisma: Auto-generates in build
4. Monorepo: Changes in `/packages/*` need full rebuild
5. Design: Follow `DESIGN_SYSTEM.md` (IMMUTABLE)

---

## 🚨 RECOVERY PROCEDURES

**Build Fails:**
```bash
rm -rf apps/web/.next node_modules/.cache/turbo && pnpm build
```

**Auth Issues:**
- Check Vercel env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Check Neon DB not paused
- Review `middleware.ts` cookie logic

---

## 📚 DOCS

- `DESIGN_SYSTEM.md` - Immutable UI rules
- `DATABASE_SCHEMA.md` - Schema reference
- `HUMAN_TEST_CHECKLIST.md` - Test suite
- `ENV_TEMPLATE.md` - Local dev setup

---

## 🐜 ANT COLONY PROTOCOL

1. **ONE TRUTH** - This file is the only source
2. **BRUTAL HONESTY** - Document actual state only
3. **NO SHORTCUTS** - Clean builds, no placeholders
4. **HUMAN TEST FIRST** - Verify before coding
5. **MYCELIAL FLOW** - Logical, connected paths
6. **TOKEN WATCH** - Track usage, alert @ 180K

---

**Verified:** 2025-11-25 17:33 UTC  
**Build:** ✅ 3.9s cached  
**Live:** ✅ HTTP 200  
**Auth:** ✅ Page renders  
**Console:** ✅ Clean (PostHog warning expected)  
**Next:** Create test account in prod DB
