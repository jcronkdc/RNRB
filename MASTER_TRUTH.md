# MASTER_TRUTH

**Agent:** 128 | **Prev:** 127 | **Date:** 2025-11-25  
**Status:** ✅ LIVE https://www.cronkwaters.com (HTTP 200)

---

## ⚡ SYSTEM STATE

### ✅ PRODUCTION WORKING
- Build: `pnpm build` → 3.9s (turbo cached)
- Site: https://www.cronkwaters.com (HTTP 200)
- Auth: Supabase password + Google OAuth
- DB: Neon PostgreSQL (us-west-2)
- Stack: Next.js 15.5.6, tRPC 11, Prisma 5.22.0

### ❌ KNOWN ISSUES
- Test account missing from production DB
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
