# MASTER_TRUTH

**Agent:** 124 | **Prev:** 123 | **Date:** 2025-11-25  
**Prod:** https://www.cronkwaters.com | **Status:** ✅ LIVE  
**Token Count:** ~62K / 200K (**ALERT at 180K - price doubles at 200K**)

---

## ⚡ CURRENT STATE (BRUTAL TRUTH)

### ✅ WORKING
- **Build:** `pnpm build` PASSES (4.7s with turbo cache)
- **Production:** LIVE at https://www.cronkwaters.com (HTTP 200)
- **Auth:** NextAuth v5 (Google OAuth + Password) - cookie-based
- **Database:** Neon PostgreSQL (us-west-2)
- **Middleware:** 33.9 kB Edge Runtime (session cookie check only)
- **Schema:** Prisma 5.22.0 - 1302 lines, 40+ models

### 🟡 NON-BLOCKING
- `.next/types/validator.ts` TypeScript error (React 18/19 mismatch - build still passes)

### ❌ MISSING (Features Disabled)
- **No .env.local file** in `apps/web/` (relies on Vercel env vars in prod)
- `OPENAI_API_KEY` / `XAI_API_KEY` - AI features disabled
- `NEXT_PUBLIC_POSTHOG_KEY` - Analytics disabled
- Real-time features: Ably WebSockets / Daily.co video (env keys not in local dev)

---

## 🏗️ STACK

```
Next.js 15.0.0 (App Router) → NextAuth v5 → tRPC v11 → Prisma 5.22.0 → Neon PostgreSQL
```

### Monorepo Structure
```
/packages/auth     - NextAuth config (auth.ts)
/packages/db       - Prisma schema (40+ models)
/packages/trpc     - API routers (13 files)
/packages/ui       - Shared components
/apps/web          - Main Next.js app
```

---

## 🎯 CRITICAL PATHWAYS (Mycelial Flow)

### 1. Auth Flow
```
middleware.ts (Edge) → checks session cookie → redirects if needed
↓
auth.ts (NextAuth v5) → Credentials + Google OAuth
↓
Neon DB → User, Account, Session tables
```

### 2. Database Schema (40+ Models)
**Core:** User, Org, Project, Song, Setlist, Show, Asset  
**Auth:** Account, Session, VerificationToken  
**Collab:** ProjectMember, Invitation, SongCollaborator  
**Community:** CommunityTrack, TrackLike, TrackPlay, TrackComment, UserFollow  
**Business:** Subscription, Transaction, SongSplit, License

### 3. Build Process
```
pnpm build → turbo → packages/db build → packages/ui → apps/web → Next.js build
```

---

## 📊 COMMANDS (Essential)

```bash
# Development
pnpm dev                     # Port 3000 (turbo runs all packages)
pnpm build                   # Must pass before deploy (9min first run, 5s cached)
pnpm prisma:generate         # After schema.prisma changes

# Deployment
git push origin main         # Triggers Vercel deploy (~3min)

# Recovery
rm -rf apps/web/.next node_modules/.cache/turbo node_modules && pnpm install && pnpm prisma:generate
```

---

## 🧪 HUMAN TEST PROTOCOL

**Frequency:** After EVERY significant change (not optional)

**Quick Test (2 minutes):**
1. `pnpm build` - must pass
2. https://www.cronkwaters.com - must load (HTTP 200)
3. Test auth flow: Sign in → Dashboard → Sign out
4. Console: No critical errors

**Full Test:** See `HUMAN_TEST_CHECKLIST.md` (413 lines)

---

## 🐜 ANT COLONY PRINCIPLES (Non-Negotiable)

1. **ONE MASTER_TRUTH** - This file only (no duplicates)
2. **BRUTAL HONESTY** - Document actual state, not desired state
3. **CLEAN BUILD** - No placeholders, no "TODO", no shortcuts
4. **HUMAN TEST** - Test like real user after every change
5. **MYCELIAL FLOW** - Logical pathways (Auth → DB → UI → Real-time)
6. **TOKEN ALERT** - Update count every response, warn at 180K

---

## 🔥 GOTCHAS (Lessons Learned)

1. **Hydration Errors:** Never use `Math.random()` / `Date.now()` in SSR components
2. **Middleware:** Cannot import `auth()` in Edge Runtime (stream errors)
3. **Prisma:** Always run `pnpm prisma:generate` after schema changes
4. **Monorepo:** Changes in `/packages/*` require app rebuild
5. **Env Vars:** Local `.env.local` missing - features rely on Vercel prod env

---

## 🚨 RECOVERY PROCEDURES

### Build Fails
```bash
rm -rf apps/web/.next node_modules/.cache/turbo
pnpm install && pnpm prisma:generate && pnpm build
```

### Auth Broken
- Check `DATABASE_URL` in Vercel env vars
- Check `NEXTAUTH_SECRET` exists
- Check `NEXTAUTH_URL` = `https://www.cronkwaters.com`
- Verify Neon DB connection (not paused)

### Deploy Fails
- Check Vercel logs for error
- Verify build passes locally first
- Check env vars in Vercel dashboard
- Ensure Node.js 18+ in Vercel settings

---

## 📚 REFERENCE DOCS (Do NOT Duplicate Content)

**Testing:** `HUMAN_TEST_CHECKLIST.md` (413 lines)  
**Design:** `DESIGN_SYSTEM.md` (NO EMOJIS in UI, zinc-950 dark mode)  
**Setup:** `LOCAL_DEV_SETUP.md`, `GOOGLE_OAUTH_SETUP.md`, `VERCEL_ENV_CHECKLIST.md`  
**Architecture:** `COLLABORATIVE_ARCHITECTURE.md`, `SIMPLIFIED_COLLABORATION_MODEL.md`

**Total Docs:** ~124KB (4414 lines across 24 .md files) - **CONSOLIDATION NEEDED**

---

## 📈 SESSION TRACKING

| Agent | Date | Key Changes |
|-------|------|-------------|
| 124 | 2025-11-25 | Streamlined MASTER_TRUTH, added brutal honesty |
| 123 | 2025-11-25 | Reduced from 384→118 lines |
| 122 | 2025-11-25 | Fixed hydration error #418 |
| 121 | 2025-11-25 | Cookie-based auth in middleware |

---

**Last Verified:** 2025-11-25 13:12 PST  
**Build:** ✅ PASSING (4.7s turbo)  
**Production:** ✅ LIVE (HTTP 200)  
**Next Agent:** Continue clean build, no shortcuts
