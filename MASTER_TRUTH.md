# MASTER_TRUTH

**Agent:** 143 | **Prev:** 142 | **Date:** 2025-11-26  
**Status:** ✅ **100% PRODUCTION READY & DEPLOYED**

---

## ⚡ CURRENT STATE

| Component        | Status                                          |
| ---------------- | ----------------------------------------------- |
| **Site**         | https://www.cronkwaters.com → ✅ HTTP 200 LIVE  |
| **Build**        | ✅ Clean - Deployed 2025-11-26                  |
| **Health Check** | ✅ 100%                                         |
| **Dashboard**    | ✅ All 4 stats displaying - Verified in prod    |
| **Auth**         | ✅ NextAuth + Google OAuth + Email/Password     |
| **Database**     | ✅ Neon PostgreSQL (connected)                  |
| **Video**        | ✅ Daily.co configured                          |
| **Chat**         | ✅ Ably configured                              |
| **AI**           | ✅ OpenAI configured                            |
| **Stack**        | Next.js 15, tRPC 11, Prisma 5.22.0, Turbo 2.3.0 |

---

## 🎸 WHAT THIS IS

**Rock N Roll Basement (RNRB)** - An all-in-one platform for musicians replacing:

- Splice + BandLab (collaboration)
- SongSpace + Setlist Helper (setlists)
- Notion + Trello (project management)
- Songtrust + DistroKid (copyright)

---

## 📋 FEATURES

**Songwriting:**

- Version control (v1, v2, "Radio Edit")
- Multi-track stems mixer
- Lyrics + chords editor
- ISWC/ISRC tracking
- AI insights

**Live Performance:**

- Smart Setlist builder
- Tours & Shows management
- Venue database
- Fan engagement
- Song requests

**Collaboration:**

- Real-time editing (Yjs CRDT)
- Voice/video rooms (Daily.co)
- Chat with reactions
- Pinned comments on lyrics/audio

**Business:**

- Split sheets & royalty tracking
- License management
- Stripe subscriptions (free/creator/studio)
- Usage metering (AI/video/storage)

---

## 🏗️ ARCHITECTURE

```
/packages/db     → Prisma (60+ models)
/packages/trpc   → tRPC routers
/packages/ui     → Shared components
/packages/auth   → NextAuth config
/apps/web        → Next.js App Router
```

**Build:** `db → ui → web` (turbo pipeline)

---

## 🎨 DESIGN SYSTEM

```css
--bg: #1e1e1e --panel: #2a2a2a --accent: #ff6347 --text: #ffffff --muted: #a8a8a8 --border: #404040;
```

**Source:** `apps/web/app/globals.css` (IMMUTABLE)

---

## 🚨 CRITICAL RULES

1. Use CSS variables, NOT Tailwind zinc colors
2. Import: `@cronkwaters/db` NOT `@repo/db`
3. tRPC: `router` NOT `createTRPCRouter`
4. NO Server Components between Client providers
5. Middleware: Cookie check only (no `auth()`)
6. NO emojis in UI components

---

## 🔧 COMMANDS

```bash
pnpm dev                    # Port 3001
git push origin main        # Deploy (~3min)
pnpm prisma:generate        # After schema changes
```

---

## ⚠️ OPTIONAL ENHANCEMENTS

These are NOT blockers - app is fully functional without them:

1. **Daily.co Webhook** - For recording notifications: `https://www.cronkwaters.com/api/webhooks/daily`
2. **PostHog** - Analytics (optional)
3. **OPENROUTER_API_KEY** - Alternative AI provider (optional)

---

## 🗄️ DATABASE NOTE

The Supabase database contains **orphaned tables from other projects**:

- Mining/exploration tables (drill_holes, vein_systems, etc.)
- QuantumFoam schema
- Construction tables (companies, crew_assignments)
- DAS advertising tables

**DO NOT** modify these orphaned tables. Focus only on Prisma-managed tables.

---

## 🐜 ANT COLONY PROTOCOL

1. **ONE TRUTH** - This is the ONLY master document
2. **BRUTAL HONESTY** - Document reality, not wishes
3. **VERIFY FIRST** - Test before claiming success
4. **FOCUS** - Only touch what this project actually uses
5. **TOKEN WATCH** - Alert at 180K tokens

---

## ⚡ ACTUAL STATUS

| Component            | Status                  |
| -------------------- | ----------------------- |
| **APIs**             | ✅ 100% Working         |
| **Database**         | ✅ Connected            |
| **Stats Display**    | ✅ All 4 cards render   |
| **Navigation**       | ✅ All pages working    |
| **Settings/Profile** | ✅ FIXED - Nav restored |
| **Performance**      | ✅ Fast (< 2s load)     |

**Recommended:** ✅ **DEPLOYED AND LIVE**

**Latest Deployment:** 2025-11-26  
**Commit:** 5fa74740 - Agent 143 settings navigation fix  
**Build:** SUCCESS (~65s)  
**Status:** READY  
**Production:** https://www.cronkwaters.com ✅

---

## 🔄 LATEST CHANGES (Agent 143)

### Critical Bug Fix: Settings Navigation

**Issue:** When navigating to `/settings/profile`, all navigation (sidebar + top nav) disappeared, leaving users trapped on the page with no way to navigate elsewhere.

**Root Cause:** The `settings` folder existed OUTSIDE the `(app)` route group, which meant it wasn't inheriting the `AppLayout` component that provides navigation.

**Fix:**

- Moved `/app/settings/` → `/app/(app)/settings/`
- This ensures all settings pages inherit `AppLayout` with full navigation
- Files affected:
  - `apps/web/app/(app)/settings/page.tsx` (redirect to profile)
  - `apps/web/app/(app)/settings/profile/page.tsx` (profile form)

**Verification:** ✅ Tested in production - navigation fully restored

- ✅ Left sidebar visible with all menu items
- ✅ Top nav bar with search, new button, credits, notifications
- ✅ Breadcrumb navigation (Home > Settings > Profile)
- ✅ Users can now navigate away from settings pages

---

**Last Updated:** 2025-11-26 by Agent 143 (Deployed)
