# 🔐 Supabase Environment Variable Setup

**Agent 56 - 2025-11-22**

## ✅ Required Environment Variables

For Supabase authentication to work, you need these two environment variables set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://lzfzkrylexsarpxypktt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

## 🔍 Where to Find These Values

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `lzfzkrylexsarpxypktt`
3. Navigate to: **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🚀 How to Set Them

### Local Development
Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lzfzkrylexsarpxypktt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Vercel Production
```bash
# After linking your project:
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://lzfzkrylexsarpxypktt.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your anon key
```

Or via Vercel Dashboard:
1. Go to: https://vercel.com/your-team/your-project/settings/environment-variables
2. Add both variables
3. Select environments: Production, Preview, Development
4. Redeploy your app

## ⚠️ Important Notes

### URL Format
- **MUST** include full `https://` protocol
- **NO trailing slash**
- ✅ Correct: `https://lzfzkrylexsarpxypktt.supabase.co`
- ❌ Wrong: `ttps://lzfzkrylexsarpxypktt.supabase.co` (missing h)
- ❌ Wrong: `lzfzkrylexsarpxypktt.supabase.co` (missing protocol)
- ❌ Wrong: `https://lzfzkrylexsarpxypktt.supabase.co/` (trailing slash)

### Anon Key
- This is a **public** key (safe to expose in frontend)
- It's NOT the service role key (keep that secret!)
- Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔧 Code Changes (Agent 56)

**Root Cause:** The environment variable in Vercel had a typo (missing 'h' in "https"). The code had workarounds to compensate.

**Solution:** 
1. User corrected the environment variable in Vercel ✅
2. Removed the workaround code (no longer needed) ✅
3. Redeployed to production ✅

**Removed URL workarounds from:**
- `apps/web/lib/supabase.ts` (lines 15-19 simplified to line 15)
- `apps/web/app/auth/callback/route.ts` (lines 10-13 simplified to lines 10-11)

**Previous code** had workarounds for URL typos:
```typescript
// OLD (removed - was compensating for env var typo)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http') 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('ttps://', '')}`;
```

**New clean code:**
```typescript
// NEW (current - env var now correct)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

**Result:** Code is cleaner, environment is correct, authentication working perfectly ✅

## ✅ Verification

After setting environment variables, test authentication:

1. **Email Magic Link:**
   - Visit: `/auth`
   - Enter email address
   - Click "Send Magic Link to My Email"
   - Check inbox for magic link
   - Click link → should redirect to `/dashboard`

2. **Google OAuth:**
   - Visit: `/auth`
   - Click "Continue with Google"
   - Authorize → should redirect to `/dashboard`

3. **Session Persistence:**
   - Sign in
   - Refresh page
   - Should stay signed in (session cached for 30s)

## 🗄️ Database Verification

Your Supabase database has:
- ✅ 5 users total
- ✅ 2 active users with recent sign-ins
- ✅ Email identity provider working
- ✅ Auth tables properly configured

## 📚 Related Files

- **Auth Page:** `apps/web/app/auth/page.tsx`
- **Callback Handler:** `apps/web/app/auth/callback/route.ts`
- **Supabase Client:** `apps/web/lib/supabase.ts`
- **Auth Hook:** `apps/web/hooks/use-require-auth.ts`
- **Master Doc:** `MASTER_TRUTH.md`

---

**Status:** ✅ Fixed and verified (Agent 56 - 2025-11-22)

