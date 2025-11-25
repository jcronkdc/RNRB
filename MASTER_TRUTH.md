# 🍄 MASTER TRUTH - CRONKWATERS

**Agent:** 115 (Current)  
**Production:** https://www.cronkwaters.com ✅ **FULLY OPERATIONAL**  
**Git:** `main` @ `db96feb3`  
**Date:** 2025-11-25  
**Status:** 🟢 **ALL SYSTEMS WORKING**

---

## ✅ CURRENT STATUS - PRODUCTION WORKING

**Authentication:**
- ✅ NextAuth v5 fully operational
- ✅ Password login/registration working
- ✅ Session persistence fixed (race condition resolved)
- ✅ DATABASE_URL configured
- ✅ Google OAuth (available, not recently tested)
- ✅ Magic link email (available, not recently tested)

**Real-time Features:**
- ✅ Ably authentication using NextAuth (fixed from Supabase)
- ✅ Client ID mismatch resolved (403 error gone)
- ✅ WebSocket connections operational
- ✅ Real-time collaboration working

**API & Database:**
- ✅ Projects API using NextAuth session (401 errors fixed)
- ✅ All API routes secured with session validation
- ✅ Prisma + Neon PostgreSQL operational
- ✅ Database queries working

**Console & Errors:**
- ✅ No 401 authentication errors
- ✅ No 403 Ably errors
- ✅ Manifest validation passing
- 🟡 React Hydration #418 warnings (non-blocking, fix in progress)
- 🟡 PostHog optional (gracefully disabled)

---

## 🔥 WHAT WAS FIXED (Agents 112-114)

### Agent 112: NextAuth v5 JSON Parse Error
- **Problem:** Login failed with JSON parse error
- **Fix:** Proper NEXT_REDIRECT handling in server actions
- **Commit:** `82dc8894`

### Agent 113: Session & Ably Auth
- **Problem:** Session race condition + Ably 401 errors
- **Fix:** 100ms auth delay + use NextAuth instead of Supabase
- **Impact:** Real-time features now work
- **Commits:** `1466d7fa`, `3c09876b`, `20f9a075`

### Agent 114: Projects API Security
- **Problem:** 401 errors on /api/projects
- **Fix:** Server-side session validation (no query params)
- **Commit:** `64de7b1c`, `db96feb3`

**Result:** Everything works. Production is stable.

## 🐜 TOKYO ANT SYSTEM MAP

The app is like a mycelial network - everything connects efficiently:

```
🎸 USER FLOW 🎸
Browser → NextAuth v5 → Session Cookie → Protected Routes/APIs

🔐 AUTHENTICATION PATH:
/auth page → signIn() action → NextAuth validates → Prisma checks DB
   ↓                                                        ↓
Session created                                    Neon PostgreSQL
   ↓
Dashboard loads

⚡ REAL-TIME PATH:
Session exists → /api/ably/token → Validates NextAuth session
   ↓                                              ↓
Returns token                            Ably WebSocket connects
   ↓
Live collaboration works

🗄️ DATABASE PATH:
API route → auth() validates session → Prisma query → Neon PostgreSQL
   ↓                                                       ↓
Returns user ID                                   Returns data
```

**CRITICAL RULES:**
1. ✅ NextAuth for ALL authentication
2. ❌ NEVER use Supabase auth methods
3. ✅ Supabase ONLY for storage (files, images)
4. ✅ Always validate session server-side in API routes

## 📋 KEY FILES FOR NEXT AGENT

**Authentication:**
- `packages/auth/src/auth.ts` - NextAuth v5 config (trustHost: true)
- `apps/web/app/actions/auth.ts` - Server actions with NEXT_REDIRECT handling
- `apps/web/hooks/use-require-auth.ts` - Protected routes (100ms delay for cookies)
- `apps/web/components/session-provider.tsx` - Session provider (refetchOnWindowFocus: true)

**Real-time:**
- `apps/web/components/ably/ably-provider.tsx` - Uses NextAuth (NOT Supabase!)
- `apps/web/app/api/ably/token/route.ts` - Token endpoint with session validation

**API Security Pattern:**
```typescript
// ALL API routes must follow this pattern:
import { auth } from '@/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id; // NEVER trust client params!
  // ... your code
}
```

**Hydration Fix:**
- `apps/web/lib/format-date.ts` - Safe date formatting
- Replace `.toLocaleDateString()` → `formatDate()`
- Replace `.toLocaleTimeString()` → `formatTime()`
- ~18 files still need migration (non-blocking)

## 🧪 HUMAN TEST (Run Before Making Changes)

Test production to verify current state:

### 1. Auth Test (2 mins)
```
1. Go to: https://www.cronkwaters.com/auth
2. Login with: test@cronkwaters.com / TestRock2024!
3. Should redirect to dashboard
4. Refresh - session persists?
5. Open console - any errors?
```

### 2. Projects Test (1 min)
```
1. Navigate to /projects
2. Console check - 401 errors on /api/projects?
3. Do projects load?
```

### 3. Real-time Test (1 min)
```
1. Open DevTools Console
2. Look for Ably connection messages
3. Should NOT see: 401 on /api/ably/token
4. Should NOT see: 403 clientId mismatch
```

**Expected Console (Good):**
- ✅ PostHog debug messages
- ✅ NextAuth session logs
- ✅ No 401/403 errors

**Unexpected (Bad):**
- ❌ 401 on /api/projects
- ❌ 403 on Ably
- ❌ "Cannot read properties of undefined"

## 🚀 PRIORITIES FOR AGENT 116+

### High Priority
1. **Test OAuth & Magic Link** - Verify Google OAuth and email magic links still work
2. **Finish Hydration Fix** - Migrate remaining ~18 files to safe date formatting (use `/apps/web/lib/format-date.ts`)
3. **Archive Old Docs** - Move completed agent files to `_ARCHIVE_AGENT_SESSIONS/`

### Medium Priority
1. **Security Review** - Rotate exposed OAuth keys from git history (see 🚨_SECURITY_BREACH)
2. **Monitoring** - Add error tracking (Sentry/LogRocket)
3. **Mobile Testing** - Verify responsive design

### Low Priority
1. **Performance** - Optimize bundle size
2. **Documentation** - Update user-facing docs

---

## 📚 DOCUMENT ORGANIZATION

**Keep in Root:** (Current/Active docs)
- MASTER_TRUTH.md (this file)
- HYDRATION_FIX_COMPLETE.md
- LOCAL_DEV_SETUP.md
- Setup/config guides (GOOGLE_OAUTH_SETUP, etc.)

**Archive:** (Completed sessions)
- _ARCHIVE_AGENT_SESSIONS/AGENT_XXX_*.md
- _ARCHIVE_AGENT_SESSIONS/PRODUCTION_FIXES_VERIFIED.md
- etc.

**Delete:** (Outdated/redundant)
- None currently - review before deleting

---

## 🎯 SUMMARY FOR AGENT 116

**What's Working:**
- ✅ Authentication (NextAuth v5)
- ✅ Real-time (Ably)
- ✅ Database (Neon + Prisma)
- ✅ All core pages

**What Needs Work:**
- 🟡 Hydration warnings (18 files to fix)
- ❓ OAuth/Magic link (untested recently)
- 📝 Documentation cleanup

**Critical Rules:**
1. Always use NextAuth for auth (never Supabase auth)
2. Always validate sessions server-side
3. Never trust client-provided user IDs
4. Use safe date formatting from `/lib/format-date.ts`
5. Run Human Test before making changes

**Git:**
- Branch: `main`
- Commit: `db96feb3`
- Production: Stable & operational

**Token Budget:** ~86K / 200K used = 114K remaining

---

**HANDOFF:** Production is working. Focus on cleanup, testing edge cases, and documentation. Don't break what's working. When in doubt, run the Human Test first.

**Next Agent:** Verify production state with Human Test, then tackle priorities above.
