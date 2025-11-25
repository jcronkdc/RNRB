# MASTER_TRUTH

**Agent:** 127 | **Prev:** 126 | **Date:** 2025-11-25  
**Status:** ✅ LIVE https://www.cronkwaters.com (HTTP 200)

---

## ⚡ CURRENT STATE

### ✅ WORKS
- `pnpm build` → 3.9s (turbo cache)
- Auth: Supabase (Google OAuth + Password) - middleware redirects correctly
- DB: Neon PostgreSQL (us-west-2) via Prisma 5.22.0
- Stack: Next.js 15.5.6 | tRPC 11 | React Query 5.62.7

### ❌ PRODUCTION GAPS
- Test account (`test@cronkwaters.com`) not in prod DB
- PostHog disabled (key missing)

### 🟡 LOCAL DEV ONLY
- `.env.local` file (copy from `ENV_TEMPLATE.md`)
- AI keys, Ably, Daily.co

---

## 🏗️ ARCHITECTURE

```
/packages/auth     - NextAuth v5 (5 files)
/packages/db       - Prisma (1302 lines, 40+ models)
/packages/trpc     - API routers (13 files)
/packages/ui       - React components (31 files)
/apps/web          - Next.js App Router (73 routes)
```

**Build:** turbo → db → ui → web

---

## 📊 COMMANDS

```bash
pnpm build                   # MUST pass before deploy
git push origin main         # Auto-deploy (~3min)
pnpm prisma:generate         # After schema changes

# Nuclear reset
rm -rf apps/web/.next node_modules/.cache/turbo && pnpm install && pnpm build
```

---

## 🧪 TEST CYCLE

1. `pnpm build` (MUST pass)
2. Production check: `curl -I https://www.cronkwaters.com`
3. Browser test: Auth redirect, console errors
4. Full checklist: `HUMAN_TEST_CHECKLIST.md` (73 routes)

---

## 🔧 MCP EXTENSIONS

- **Neon:** DB queries, migrations, schema
- **Vercel:** Deployments, logs, env
- **Prisma:** Schema introspection
- **Browser:** E2E testing, snapshots

---

## 🔥 GOTCHAS

1. NO `Math.random()` / `Date.now()` in SSR (hydration errors)
2. Middleware: Cookie check ONLY (no `auth()` import)
3. Prisma: Auto-generate in build, manual after schema edits
4. Monorepo: Changes in `/packages/*` need full rebuild
5. Local dev: Copy `ENV_TEMPLATE.md` → `apps/web/.env.local`

---

## 🚨 RECOVERY

**Build Fails:**
```bash
rm -rf apps/web/.next node_modules/.cache/turbo && pnpm build
```

**Auth Issues:**
- Vercel env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Neon DB: Check not paused
- Code: `middleware.ts` cookie check

---

## 📚 REFERENCE DOCS

- `DESIGN_SYSTEM.md` - IMMUTABLE (NO EMOJIS in UI)
- `DATABASE_SCHEMA.md` - 40+ models, relationships
- `PATHWAYS_VERIFIED.md` - Auth, data, build flows
- `HUMAN_TEST_CHECKLIST.md` - 73 routes
- `ENV_TEMPLATE.md` - Local dev setup
- `docs/setup-guides/` - OAuth, Stripe, etc.

---

## 🐜 ANT COLONY RULES

1. **ONE MASTER_TRUTH** - This file only
2. **BRUTAL HONESTY** - Actual state, not desired
3. **CLEAN BUILD** - No shortcuts, TODOs, placeholders
4. **HUMAN TEST** - After every change
5. **MYCELIAL FLOW** - Logical pathways
6. **TOKEN TRACKING** - Every response (ALERT @ 180K)

---

**Last Verified:** 2025-11-25 (Agent 127)  
**Build:** ✅ 3.9s  
**Production:** ✅ LIVE  
**Auth Tested:** ✅ Middleware redirect works  
**Next Agent:** Continue testing with valid credentials
