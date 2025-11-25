# MASTER_TRUTH

**Agent:** 126 | **Prev:** 125 | **Date:** 2025-11-25  
**Status:** ✅ LIVE https://www.cronkwaters.com (HTTP 200)

---

## ⚡ CURRENT STATE

### ✅ WORKS
- `pnpm build` → 3.9s (turbo cache) | 5.8min (full)
- Auth: NextAuth v5 (Google OAuth + Password)
- DB: Neon PostgreSQL (us-west-2) via Prisma 5.22.0
- Stack: Next.js 15.5.6 | tRPC 11 | React Query 5.62.7

### ❌ MISSING LOCALLY
- `.env.local` file (copy from `ENV_TEMPLATE.md`)
- AI keys, Ably, Daily.co, PostHog (features disabled)

### 🟡 NON-BLOCKING
- Prisma 7.0.1 available (major version - requires migration)
- `.next/types/validator.ts` error (React 18/19, build passes)

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
pnpm dev                     # Dev server (:3000)
pnpm build                   # MUST pass before deploy
pnpm prisma:generate         # After schema changes
git push origin main         # Auto-deploy (~3min)

# Nuclear
rm -rf apps/web/.next node_modules/.cache/turbo node_modules && pnpm install && pnpm prisma:generate && pnpm build
```

---

## 🧪 TEST AFTER EVERY CHANGE

1. `pnpm build` passes
2. Homepage loads (200)
3. Auth: Sign in → Dashboard → Sign out
4. Console: No critical errors

**Full test:** `HUMAN_TEST_CHECKLIST.md`

---

## 🔧 MCP EXTENSIONS (USE THEM)

- **Neon MCP:** DB queries, schema, migrations
- **Vercel MCP:** Deployments, logs, env vars
- **Prisma MCP:** Schema introspection
- **Browser MCP:** E2E testing

---

## 🔥 GOTCHAS

1. NO `Math.random()` / `Date.now()` in SSR (hydration errors)
2. Middleware: Cookie check ONLY (no `auth()` import)
3. Prisma: Auto-generate in build, manual after schema edits
4. Monorepo: Changes in `/packages/*` need full rebuild
5. Local dev: Copy `ENV_TEMPLATE.md` → `apps/web/.env.local`

---

## 🚨 RECOVERY

### Build Fails
```bash
rm -rf apps/web/.next node_modules/.cache/turbo
pnpm install && pnpm prisma:generate && pnpm build
```

### Auth Broken
1. Check Vercel: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
2. Verify Neon DB not paused
3. Check middleware.ts

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

**Last Verified:** 2025-11-25  
**Build:** ✅ 3.9s  
**Production:** ✅ LIVE  
**Next Agent:** Clean build continues
