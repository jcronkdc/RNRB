# 🔧 Complete Environment Variables Recovery Script

## STEP 1: Extract Local Environment Variables

Run this in your terminal to see what env vars exist locally:

```powershell
cd /Users/justincronk/Desktop/CronkWaters/apps/web

# Check for .env.local
if (Test-Path .env.local) {
    Write-Host "✅ Found .env.local - Contents:"
    Write-Host "=" * 60
    Get-Content .env.local
    Write-Host "=" * 60
} else {
    Write-Host "❌ No .env.local found in apps/web/"
}

# Also check root directory
cd ../..
if (Test-Path .env.local) {
    Write-Host "✅ Found root .env.local - Contents:"
    Write-Host "=" * 60
    Get-Content .env.local
    Write-Host "=" * 60
}
```

---

## STEP 2: Add ALL Variables to Vercel

**Method A: Vercel Dashboard (Easiest)**

Go to: https://vercel.com/justins-projects-d7153a8c/web/settings/environment-variables

Add these **CRITICAL** variables (copy from your local .env.local):

### 🔴 TIER 1: CRITICAL (Site won't work without these)

1. **DATABASE_URL**
   - Value: `postgresql://...` (from Neon/Supabase)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **NEXTAUTH_SECRET**
   - Value: (random secret string)
   - Generate: `openssl rand -base64 32` or from your .env.local
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **NEXTAUTH_URL**
   - Value: `https://www.cronkwaters.com`
   - Environments: ✅ Production
   - Value: `https://${VERCEL_URL}` (for Preview)
   - Value: `http://localhost:3000` (for Development)

4. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://lzfzkrylexsarpxypktt.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: (from Supabase Dashboard → API → anon/public key)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

### 🟡 TIER 2: IMPORTANT (Features won't work without these)

6. **DAILY_API_KEY**
   - Value: (from Daily.co dashboard)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

7. **ABLY_API_KEY**
   - Value: (from Ably dashboard)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

8. **OPENROUTER_API_KEY**
   - Value: (from OpenRouter dashboard)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

9. **GOOGLE_CLIENT_ID**
   - Value: (from Google Cloud Console)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

10. **GOOGLE_CLIENT_SECRET**
    - Value: (from Google Cloud Console)
    - Environments: ✅ Production, ✅ Preview, ✅ Development

### 🟢 TIER 3: OPTIONAL (Nice to have)

11. **RESEND_API_KEY**
    - Value: (from Resend dashboard)
    - For email sending

12. **STRIPE_SECRET_KEY**
    - Value: (from Stripe dashboard)
    - For payments

13. **STRIPE_WEBHOOK_SECRET**
    - Value: (from Stripe dashboard)
    - For payment webhooks

---

## STEP 3: Verify Variables Added

```powershell
cd /Users/justincronk/Desktop/CronkWaters
vercel env ls
```

You should see ~15 variables listed for Production, Preview, and Development.

---

## STEP 4: Trigger Rebuild

```bash
cd /Users/justincronk/Desktop/CronkWaters

# Option A: Empty commit (fastest)
git commit --allow-empty -m "fix: Add all missing environment variables to Vercel"
git push origin main

# Option B: Force deploy via CLI
vercel --prod
```

---

## STEP 5: Verify Health

Wait 2-3 minutes for build, then check:

```powershell
# Check health endpoint
curl https://www.cronkwaters.com/api/health | ConvertFrom-Json

# Should see:
# {
#   "status": "healthy",
#   "healthPercentage": 100,
#   "checks": { "database": { "connected": true }, ... }
# }
```

---

## 🔍 HOW THIS HAPPENED

**Timeline of Failure:**

1. **Agent 1-83:** Site worked LOCALLY (had .env.local file)
2. **Agent 84:** Added PostHog vars to Vercel (only 2 vars!)
3. **Agent 85:** Optimized database (but never checked production env!)
4. **Agent 86 (ME):** Discovered catastrophic failure

**Root Cause:**

- Vercel project was created but **environment variables were NEVER migrated**
- All agents tested locally (where .env.local exists)
- No agent ran production health checks
- MASTER_TRUTH falsely claimed "100% OPERATIONAL"

**Lesson for Next Agent:**

- ✅ ALWAYS verify production environment variables FIRST
- ✅ ALWAYS test `/api/health` in production BEFORE claiming success
- ✅ NEVER trust MASTER_TRUTH - verify everything
- ✅ Local working ≠ Production working

---

## 📊 Expected Results After Fix

**Before (Current):**
- Health: 0%
- Database: Disconnected
- Auth: Broken
- Features: None working

**After (Goal):**
- Health: 100%
- Database: Connected ✅
- Auth: Working ✅
- Video: Working ✅
- Chat: Working ✅
- AI: Working ✅

---

**Created by:** Agent 86  
**Date:** 2025-11-24  
**Severity:** 🔴 CRITICAL

