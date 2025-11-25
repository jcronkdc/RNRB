# 🍄 MASTER_TRUTH - CRONKWATERS

**Agent:** 117 (Current)  
**Production:** https://www.cronkwaters.com  
**Git:** `main` @ latest  
**Date:** 2025-11-25  
**Status:** 🟢 **DEV SERVER RUNNING** - All systems operational

---

## 🎯 CURRENT STATUS

### ✅ Working Systems
- **Auth**: NextAuth v5 with password + OAuth + magic link
- **Database**: Neon PostgreSQL via Prisma
- **Real-time**: Ably WebSocket with NextAuth integration
- **API**: All routes secured with server-side `auth()`
- **Build**: Storybook (port 6006) + Next.js dev server operational

### 🔧 Recent Fixes (Agent 116-117)
- Storybook ESM/CommonJS conflict resolved (used .cjs configs)
- Removed conflicting postcss.config.cjs file
- Auth redirect error handling improved
- Hydration fixes deployed (23 files updated with SSR-safe date formatting)

---

## 🐜 TOKYO ANT NETWORK FLOW

```
USER → Next.js 15 App
  ↓
🔐 AUTH: /auth → signIn() → NextAuth validates → Session
  ↓
🗄️ DATABASE: Neon PostgreSQL (Prisma ORM)
  ↓
⚡ REALTIME (optional): /api/ably/token → Ably WebSocket
  ↓
🎵 FEATURES: Projects, Songs, Collaboration, AI Tools
```

**Critical Rules:**
1. NextAuth for ALL authentication (never Supabase auth)
2. Always validate session server-side: `await auth()`
3. Never trust client-provided user IDs
4. Use SSR-safe date formatting from `/lib/format-date.ts`

---

## 📋 KEY PATTERNS

### Auth API Pattern (ALWAYS FOLLOW)
```typescript
import { auth } from '@/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id; // NEVER from query params!
  // ... your code
}
```

### SSR-Safe Date Formatting
```typescript
import { formatDate, formatTime, formatDateTime } from '@/lib/format-date';

// ✅ USE THESE:
formatDate(date)       // YYYY-MM-DD
formatDateLong(date)   // Jan 15, 2024
formatTime(date)       // 3:45 PM  
formatDateTime(date)   // Jan 15, 2024 at 3:45 PM

// ❌ NEVER USE (causes hydration errors):
date.toLocaleDateString()
date.toLocaleTimeString()
```

---

## 🧪 HUMAN TEST PROTOCOL

Run regularly (especially after changes):

### 1. Auth Test (3 mins)
```
1. Visit: https://www.cronkwaters.com/auth  
2. Login: test@cronkwaters.com / TestRock2024!
3. Should redirect to /dashboard
4. Refresh - session persists?
5. Console - any errors?
```

### 2. Projects API Test (1 min)
```
1. Navigate to /projects  
2. Console: Look for 401 on /api/projects
3. Projects load successfully?
```

### 3. Real-time Test (1 min)
```
1. Open DevTools Console
2. Look for Ably connection messages  
3. Should NOT see 401 or 403 errors
```

**Expected Console:**
- PostHog: "API key not configured" (harmless)
- NO 401/403 errors

---

## 🚀 PRIORITIES FOR NEXT AGENT

### IMMEDIATE
1. Run Human Test on production
2. Verify all auth flows working
3. Check for any console errors

### HIGH PRIORITY
1. Archive old agent session docs (keep last 3 only)
2. Security audit - rotate exposed OAuth keys
3. Test mobile responsiveness

### MEDIUM PRIORITY
1. Add error monitoring (Sentry/LogRocket)
2. Performance optimization
3. Upgrade Storybook to v10 (currently v8.6.14, v10 available)

---

## 📚 FILE STRUCTURE

**Keep in Root:**
- `MASTER_TRUTH.md` (this file - single source of truth)
- `LOCAL_DEV_SETUP.md`
- `GOOGLE_OAUTH_SETUP.md`
- Last 3 agent session docs for context

**Archive Rest:**
- Move older `AGENT_*` docs to `_ARCHIVE_AGENT_SESSIONS/`

---

## ⚠️ KNOWN ISSUES

**None currently blocking development**

Minor warnings:
- Storybook: CommonJS deprecated with Vite (works fine, can upgrade later)
- Storybook: No .mdx story files found (expected, we use .tsx)

---

## 🤝 HANDOFF TO NEXT AGENT

**Current State:**
- Dev server running successfully (Storybook on :6006)
- All core systems operational
- Clean codebase, no blocking issues

**Immediate Actions:**
1. Run Human Test on https://www.cronkwaters.com
2. Verify production auth working
3. Check console for errors
4. Archive old documentation

**When in Doubt:**
- Run Human Test first
- Check this MASTER_TRUTH
- Don't break what's working

---

**Last Updated:** 2025-11-25 by Agent 117  
**Token Budget:** ~67K / 200K used (133K remaining)  
**Status:** 🟢 All systems go
