# MASTER_TRUTH

**Agent:** 138 | **Prev:** 137 | **Date:** 2025-11-26  
**Status:** ✅ PRODUCTION LIVE

---

## ⚡ CURRENT STATE

| Component | Status |
|-----------|--------|
| **Site** | https://www.cronkwaters.com → ✅ HTTP 200 |
| **Build** | ✅ Clean |
| **Auth** | Supabase + Google OAuth |
| **DB** | Neon PostgreSQL (us-west-2) |
| **Stack** | Next.js 15.5.6, tRPC 11, Prisma 5.22.0, Turbo 2.3.0 |

---

## 🏗️ ARCHITECTURE

```
/packages/db     → Prisma 5.22.0 (50 models)
/packages/trpc   → 13 routers
/packages/ui     → 31 components
/apps/web        → 79 routes (Next.js App Router)
```

**Build:** `db → ui → web` (turbo pipeline)

**Layout:**
```
RootLayout (Server) → TRPCReactProvider (Client)
  → (app)/Layout (Client) → AppLayout → SidebarNav + children
```

---

## 🎨 DESIGN SYSTEM

```css
--bg: #1e1e1e        --panel: #2a2a2a      --accent: #ff6347
--text: #ffffff      --muted: #a8a8a8      --border: #404040
--radius: 16px       --radius-sm: 8px
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
pnpm dev                    # Port 3000
git push origin main        # Deploy (~3min)
pnpm prisma:generate        # After schema changes
```

**Nuclear Reset:**
```bash
rm -rf apps/web/.next node_modules/.cache/turbo && pnpm install
```

---

## 🚨 KNOWN ISSUES

1. **Daily.co Webhook** - Not configured → `https://www.cronkwaters.com/api/webhooks/daily`
2. **PostHog** - Disabled (no key)
3. **ANTHROPIC_API_KEY** - Required in Vercel for AI Assistant

---

## 📋 FEATURES

**Core:** Songwriting Tool, Version Control, Stems Mixer, Copyright Manager, Projects, AI Insights

**World-Class:** Smart Setlist (5D scoring), Gig Calendar (4 views), Tour Analytics

**Protection:** AI Rate Limiting, Storage Quotas, Usage Dashboard, Credit Add-Ons

---

## 🐜 ANT COLONY PROTOCOL

1. ONE TRUTH - This is the ONLY master document
2. BRUTAL HONESTY - Document reality
3. VERIFY FIRST - Test before claiming success
4. MYCELIAL FLOW - DB → API → UI → TEST
5. TOKEN WATCH - Alert at 180K tokens

---

**Last Updated:** 2025-11-26 by Agent 138  
**Token Count:** Session ~15K / 200K (7.5%)
