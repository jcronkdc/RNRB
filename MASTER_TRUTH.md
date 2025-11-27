# MASTER_TRUTH

**Agent:** 151 | **Prev:** 150 | **Date:** 2025-11-27  
**Status:** 🟠 **Production credentials sign-in/reg still broken until latest commit is deployed** • ✅ **Marketing + dashboard mobile sweep landed (Agent 151)**

---

## ⚡ CURRENT STATE

| Component           | Status                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| **Site**            | https://www.cronkwaters.com → ✅ HTTP 200 LIVE                           |
| **Build**           | ✅ Clean - Deployed 2025-11-27 (Website Builder)                         |
| **Health Check**    | ✅ 100%                                                                  |
| **Dashboard**       | ✅ All 4 stats displaying - Verified in prod                             |
| **Auth**            | 🟠 Credentials sign-in/reg fix committed (Agent 151) – redeploy required |
| **Auth Redirect**   | ✅ Sign-in → Dashboard flow fixed (Agent 147)                            |
| **URL Plus Signs**  | ✅ Email + signs preserved in redirects (148)                            |
| **Profile Setup**   | ✅ Minimal layout for first-time setup                                   |
| **Suspense**        | ✅ All useSearchParams() wrapped (FIXED 148)                             |
| **Database**        | ✅ Neon PostgreSQL (connected)                                           |
| **Video**           | ✅ Daily.co configured                                                   |
| **Chat**            | ✅ Ably configured                                                       |
| **AI**              | ✅ OpenAI configured                                                     |
| **Stack**           | Next.js 15, tRPC 11, Prisma 5.22.0, Turbo 2.3.0                          |
| **Onboarding**      | ✅ Clean, focused first-time user experience                             |
| **Notifications**   | ✅ Notification Bell functional in TopBar                                |
| **Landing Page**    | ✅ Updated with all 75+ features (Agent 147)                             |
| **Navigation**      | ✅ Dashboard access from UserMenu                                        |
| **Website Builder** | ✅ LIVE - World-class musician website builder                           |
| **Mobile**          | ✅ Landing + solutions + builder + usage widgets responsive (Agent 151)  |

---

## 🔄 LATEST CHANGES (Agent 151 – Credentials Sign-In Fix)

**Problem:** Password sign-in and the post-registration auto-login both failed in production. Users only saw “An unexpected error occurred,” which effectively blocked all new or returning users.

**Root Cause:**

1. The `signInWithCredentials` server action assumed NextAuth would throw an `AuthError`. In reality the thrown value was a plain object, so every failure path fell into the generic “unexpected error” clause.
2. Because authentication lived inside a server action, the `/auth` page had no client-side fallback—the POST to `/auth` always bubbled up as a 500, even for valid credentials.

**Fix (committed, not yet deployed):**

- Removed the server-action dependency. The `/auth` form now calls `signIn('credentials', { redirect: false, redirectTo })` from `next-auth/react`, sanitizes redirect targets, and shows accurate inline errors.
- Sign-up still goes through `/api/register`, but new accounts are forced through `/settings/profile?setup=true` (with the original destination preserved via `redirect=`) before they can hit invites/projects.
- Error messaging differentiates invalid credentials from real server errors, so QA can see real failure reasons.

### Mobile Responsiveness & Reduced Motion (Agent 151)

- Landing hero stats, `/solutions/*` hero stats, `/sites` analytics cards, builder photo grids, and dashboard usage widgets now fall back to single-column stacks on narrow screens (`apps/web/app/page.tsx`, `apps/web/app/(marketing)/solutions/*`, `apps/web/app/(app)/sites/page.tsx`, `apps/web/components/site-builder/sections/PhotoGallerySection.tsx`, `apps/web/components/usage-components.tsx`).
- Added `prefers-reduced-motion` handling in `apps/web/app/globals.css` so animated notes, gradient rings, and particle systems disable automatically on mobile users who opt out of motion (better accessibility + battery life).
- Verified landing, solutions, `/sites`, `/sites/edit`, `/sites` empty state, and dashboard usage widgets at 320/390/414px via Chrome responsive tools—no overflow, tap targets ≥44px, and typography remains legible.

**Testing:** `pnpm build` (Nov 27, 19:43 UTC) ✅ (re-run after current changes)

**Deployment:** Not deployed yet—production login remains broken until this commit is shipped. After deployment, run the human test: create a throwaway account, confirm it redirects to profile setup, and log back in with `test@cronkwaters.com / TestRock2024!`.

## 🔥 ACTIVE ISSUES & NEXT STEPS

1. **🚨 Deploy credentials fix:** `pnpm build && git push origin main` then verify production login + onboarding (see human test above). Until then, production sign-in is broken.
2. **Rate limiting coverage gap:** Only a handful of API routes use `apps/web/lib/rate-limit.ts`. Critical routes without protection: `/api/assistant/chat`, `/api/projects/*`, `/api/songs/*`, `/api/chat/messages`, `/api/ably/token`, `/api/sites/*`. Plan: extract a reusable middleware/helper and enforce limits on all write-heavy or AI-cost endpoints.
3. **Request timeout handling:** External `fetch` calls (Daily.co, Spotify, dictionary APIs, etc.) are still missing `AbortController` timeouts. Need to add a shared helper (e.g., `withTimeout(fetchPromise)`) to prevent hung requests from exhausting serverless concurrency.
4. **Follow-up audits:** JSON.parse + timer cleanup sweeps are partially complete (3/67 JSON.parse call sites hardened, 4/6 localStorage try/catch). Continue auditing using `ULTRA_DEEP_ANALYSIS_REPORT.md` as the source of truth.

---

## 🎸 WHAT THIS IS

**Rock N Roll Basement (RNRB)** - An all-in-one platform for musicians replacing:

- Splice + BandLab (collaboration)
- SongSpace + Setlist Helper (setlists)
- Notion + Trello (project management)
- Songtrust + DistroKid (copyright)

---

## 📋 FEATURE PILLARS

- **Songwriting Studio:** version control, multi-track stems, lyrics/chords editor, ISWC/ISRC tracking, AI suggestions.
- **Live & Touring:** smart setlists, gig calendar, tour routing, venue database, real-time fan engagement tools.
- **Collaboration:** Daily.co video (50 seats), Ably/Yjs real-time editing, chat with reactions, pinned comments, voice memos.
- **Business Stack:** split sheets, royalty tracking, Stripe subscription tiers, usage metering, licensing workflows.
- **Website Builder:** Quick Start auto-sites, 8 templates (NOIR → FUTURA), section editor, custom domains + SSL, analytics, contact + mailing list forms.

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

## 🚀 DEPLOYMENT SNAPSHOT

- **Latest production deploy:** 2025-11-26 (`5fa74740` – Agent 143 settings navigation fix) with clean build (~65s).
- **Current prod reality:** credentials sign-in/reg remains broken until the Agent 151 auth fix + mobile sweep land in production. Marketing/mobile tweaks from this session are not live yet.
- **Action:** after `pnpm build` passes locally, push to `main`, watch Vercel deploy, then run the human test (create account → profile setup → re-login) using `test@cronkwaters.com / TestRock2024!`.
