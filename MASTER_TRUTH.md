# MASTER_TRUTH

**Agent:** 123 | **Prev:** 122 | **Date:** 2025-11-25  
**Prod:** https://www.cronkwaters.com | **Status:** ✅ LIVE & PASSING

---

## ⚡ STATE

**✅ Working:**
- Build: `pnpm build` PASSES (9m33s)
- Prod: LIVE, no hydration errors (Agent 122 fixed)
- Auth: NextAuth v5 (Google + Password)
- DB: Neon PostgreSQL + Prisma 5.22.0
- Real-time: Ably WebSockets ✅ | Video: Daily.co ✅
- Middleware: 33.9 kB edge

**🟡 Non-Blocking:**
- 1 TS error: `.next/types/validator.ts` (React 18/19 mismatch)

**❌ Missing (Non-Critical):**
- `OPENAI_API_KEY` / `XAI_API_KEY` (AI disabled)
- `NEXT_PUBLIC_POSTHOG_KEY` (analytics off)

---

## 🏗️ STACK

```
Next.js 15.0.0 → NextAuth v5 → tRPC v11 → Prisma 5.22.0 → Neon PostgreSQL
```

**Monorepo Packages:**
- `@cronkwaters/auth` - NextAuth config
- `@cronkwaters/db` - Prisma schema
- `@cronkwaters/trpc` - API routers
- `@cronkwaters/ui` - Shared components
- `@rnrb/web` - Main app

---

## 🎯 KEY FILES

**Auth Flow:** `packages/auth/src/auth.ts` → `apps/web/middleware.ts` (33.9 kB)  
**DB:** `packages/db/prisma/schema.prisma` (User, Project, Song, Setlist, Show, Subscription)  
**Pages:** `apps/web/app/page.tsx` (homepage, hydration FIXED ✅)  
**Features:** `/songwriting` (AI assist) | `/projects` (collab) | `/setlist-builder`

---

## 📊 COMMANDS

```bash
pnpm dev                 # Local (port 3000)
pnpm build               # Prod build (must pass before deploy)
pnpm prisma:generate     # After schema edits
git push origin main     # Deploy to Vercel (~3min)
```

---

## 🧪 HUMAN TEST

**Before:** `pnpm build` → check https://www.cronkwaters.com → test auth  
**After:** `pnpm build` → deploy → wait 3min → test prod → update this doc  
**Detailed:** `HUMAN_TEST_CHECKLIST.md` (413 lines)

---

## 🐜 ANT PRINCIPLES

1. **ONE MASTER_TRUTH** - This file only
2. **BRUTAL HONESTY** - Never lie about state
3. **CLEAN BUILD** - No shortcuts, placeholders, or "TODO"
4. **HUMAN TEST** - Test like real user after every change
5. **MYCELIAL FLOW** - Auth → DB → UI → Real-time (logical pathways)
6. **TOKEN ALERT** - Warn at 180K, switch at 200K (price doubles)

---

## 🔥 GOTCHAS

1. **Hydration:** Never use `Math.random()` / `Date.now()` in SSR (page.tsx FIXED ✅)
2. **Prisma:** Run `pnpm prisma:generate` after schema changes
3. **Monorepo:** `packages/*` changes need app rebuild
4. **Env:** Local = `apps/web/.env.local` | Prod = Vercel dashboard

---

## 🚨 RECOVERY

**Build breaks:**
```bash
rm -rf apps/web/.next node_modules/.cache/turbo node_modules
pnpm install && pnpm prisma:generate
```

**Auth breaks:** Check `DATABASE_URL`, `NEXTAUTH_SECRET`, Neon DB connection  
**Deploy fails:** Check Vercel logs, env vars, Node v18+

---

## 📊 TOKEN TRACKING

**Current:** ~68K / 200K | **Alert:** 180K | **Next Agent:** 200K

---

## 📚 DOCS

**DO NOT DUPLICATE** - Reference only:
- `HUMAN_TEST_CHECKLIST.md` - 413-line test guide
- `DESIGN_SYSTEM.md` - IMMUTABLE UI rules (NO EMOJIS in UI, typography-first, zinc-950 dark)
- `LOCAL_DEV_SETUP.md`, `GOOGLE_OAUTH_SETUP.md`, `VERCEL_ENV_CHECKLIST.md`

---

**Updated:** 2025-11-25 @ Agent 123 | **Build:** ✅ | **Prod:** ✅ | **Hydration:** ✅ FIXED
