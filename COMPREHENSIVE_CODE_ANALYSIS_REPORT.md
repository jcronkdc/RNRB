# CRONKWATERS - MASTER TRUTH DOCUMENT

**Last Updated:** 2025-11-26  
**Health Score:** 7.5/10 🟡 (Improved from 7.0 after auth cleanup)

---

## 🔐 AUTHENTICATION STATUS

### SINGLE AUTH SYSTEM: NextAuth v5 ✅

**Auth is NOW unified** - use NextAuth ONLY for all authentication.

```typescript
// API Routes - use requireAuth() from lib/session.ts
import { requireAuth } from '@/lib/session';

export async function GET() {
  const user = await requireAuth(); // Throws 401 if not authenticated
  // user.id is the NextAuth user ID
}

// Pages - use getCurrentUser() for optional auth
import { getCurrentUser } from '@/lib/session';

const user = await getCurrentUser(); // Returns null if not authenticated

// Client Components - use useSession from next-auth/react
import { useSession, signOut } from 'next-auth/react';

const { data: session } = useSession();
```

### ⚠️ REMAINING SUPABASE AUTH CLEANUP NEEDED

These files still import from `@/lib/supabase` for auth (need migration):

| File                                  | Status      | Fix                        |
| ------------------------------------- | ----------- | -------------------------- |
| `lib/actions/credits.ts`              | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/usage/summary/route.ts`      | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/chat/voice-message/route.ts` | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/chat/messages/route.ts`      | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/rooms/voice/route.ts`        | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/invites/send/route.ts`       | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/daily/rooms/route.ts`        | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/upload/audio/route.ts`       | ❌ Supabase | Change to `requireAuth()`  |
| `app/api/ai/*` routes                 | ❌ Supabase | Change to `requireAuth()`  |
| `components/UserMenu.tsx`             | ❌ Supabase | Change to `useSession()`   |
| `components/sidebar-nav.tsx`          | ❌ Supabase | Change to NextAuth signOut |

### Supabase Now Storage-Only

`lib/supabase.ts` is now configured for **file storage only**:

- No auth session management
- Use for: `uploadFile()`, `getPublicUrl()`, `deleteFile()`
- Do NOT use for: `getCurrentUser()`, `signOut()` (these were removed)

---

## 📁 ARCHITECTURE SUMMARY

```
CronkWaters/
├── apps/web/              # Next.js 15 App Router
│   ├── app/              # Routes & pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & helpers
│   │   ├── session.ts    # ✅ Auth utilities (NextAuth)
│   │   ├── supabase.ts   # Storage only (NOT for auth)
│   │   ├── errors.ts     # Standardized error handling
│   │   └── db.ts         # Prisma client
│   └── auth.ts           # Re-exports from @cronkwaters/auth
├── packages/
│   ├── auth/             # NextAuth v5 configuration
│   ├── db/               # Prisma schema (50 models, 2133 lines)
│   ├── trpc/             # Type-safe API layer
│   └── ui/               # Shared components
```

---

## 🔴 CRITICAL ISSUES (In Priority Order)

### 1. Build Errors Ignored ⚠️ CRITICAL

```javascript
// next.config.mjs
{
  eslint: { ignoreDuringBuilds: true },    // 🔴 REMOVE
  typescript: { ignoreBuildErrors: true }   // 🔴 REMOVE
}
```

**Action Required:** Remove these flags and fix all type/lint errors.

### 2. TypeScript Strict Mode Disabled ⚠️ CRITICAL

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false // 🔴 Change to true
  }
}
```

### 3. Rate Limiting Missing on Most Routes

**Routes WITH rate limiting:** `/api/assistant/chat`, `/api/ai/*`  
**Routes WITHOUT:** `/api/projects`, `/api/songs`, `/api/library/upload`, `/api/setlists/*`

### 4. Input Validation Missing

Most API routes parse `req.json()` without Zod validation. Use `lib/validations.ts` pattern.

---

## ✅ WORKING SYSTEMS

| System           | Status     | Notes                                         |
| ---------------- | ---------- | --------------------------------------------- |
| NextAuth v5      | ✅ Working | Google OAuth, Password, Email (if configured) |
| Prisma ORM       | ✅ Working | 50 models, proper indexes                     |
| tRPC             | ✅ Working | Type-safe API layer                           |
| Supabase Storage | ✅ Working | File uploads only                             |
| Stripe Billing   | ✅ Working | Subscriptions + credits                       |
| Ably Real-time   | ✅ Working | Collaboration features                        |

---

## 📊 CODEBASE METRICS

- **Total Files:** ~500+ TypeScript/TSX
- **Database Models:** 50
- **API Routes:** 79+
- **Components:** 100+
- **Test Coverage:** <5% (Vitest configured but minimal tests)

---

## 🛠️ IMMEDIATE NEXT STEPS

1. **Complete Supabase auth cleanup** - Migrate remaining 15+ files to NextAuth
2. **Enable strict TypeScript** - Fix type errors incrementally
3. **Remove build ignore flags** - Fix all lint/type errors
4. **Add rate limiting** - Protect remaining API routes
5. **Add tests** - Start with auth and critical API routes

---

## 🔑 ENV VARS REQUIRED

```env
# Auth (Required)
NEXTAUTH_SECRET=        # 32+ char secret
NEXTAUTH_URL=           # Your app URL

# Database (Required)
DATABASE_URL=           # PostgreSQL connection string

# OAuth (Optional but recommended)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email Magic Links (Optional)
EMAIL_SERVER_URL=       # SMTP connection string
EMAIL_FROM=             # sender@example.com

# Storage (Required for file uploads)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Payments (Required for billing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI Features (Required for AI)
ANTHROPIC_API_KEY=

# Real-time (Required for collaboration)
ABLY_API_KEY=

# Video Calls (Optional)
DAILY_API_KEY=
```

---

## 📝 RECENT CHANGES LOG

### 2025-11-26: Auth Unification

- ✅ Removed Supabase auth from `/app/auth/page.tsx` - now uses NextAuth only
- ✅ Updated `/app/auth/callback/route.ts` - simplified for NextAuth
- ✅ Cleaned `/lib/supabase.ts` - removed all auth functions, storage-only now
- ✅ Fixed `/lib/subscription-access.ts` - uses `getCurrentUser()` from session
- ✅ Fixed `/lib/usage-tracking.ts` - uses `getCurrentUser()` from session
- ✅ Fixed `/components/top-bar.tsx` - uses NextAuth `useSession` and `signOut`

---

**This document is the SINGLE source of truth. Keep it updated.**
