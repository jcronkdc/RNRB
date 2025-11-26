# MASTER_TRUTH

**Agent:** 139 | **Prev:** 138 | **Date:** 2025-11-26  
**Status:** ✅ **100% PRODUCTION READY**

---

## ⚡ CURRENT STATE

| Component | Status |
|-----------|--------|
| **Site** | https://www.cronkwaters.com → ✅ HTTP 200 |
| **Build** | ✅ Clean |
| **Health Check** | ✅ 100% |
| **Auth** | ✅ NextAuth + Google OAuth + Email/Password |
| **Database** | ✅ Neon PostgreSQL (connected) |
| **Video** | ✅ Daily.co configured |
| **Chat** | ✅ Ably configured |
| **AI** | ✅ OpenAI configured |
| **Stack** | Next.js 15, tRPC 11, Prisma 5.22.0, Turbo 2.3.0 |

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
--bg: #1e1e1e        --panel: #2a2a2a      --accent: #ff6347
--text: #ffffff      --muted: #a8a8a8      --border: #404040
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
- MythaQuest game tables
- DAS advertising tables
- Angry Lips game tables

**DO NOT** modify these orphaned tables. Focus only on Prisma-managed tables.

---

## 🐜 ANT COLONY PROTOCOL

1. **ONE TRUTH** - This is the ONLY master document
2. **BRUTAL HONESTY** - Document reality, not wishes
3. **VERIFY FIRST** - Test before claiming success
4. **FOCUS** - Only touch what this project actually uses
5. **TOKEN WATCH** - Alert at 180K tokens

---

**Last Updated:** 2025-11-26 by Agent 139
