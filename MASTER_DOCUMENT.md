# 🍄 Rock N' Roll Basement Master Document — Truth Only

**Last Updated:** 2025-11-17 (Agent 29 - Mycelial Truth Network)
**Status:** 🔴 **CRITICAL CONFUSION** – Two separate apps exist, deployment target unclear, authentication untested

> One master doc. Agent-to-agent conversation. Each agent VERIFIES previous work, NEVER assumes. Updates with TRUTH ONLY.

---

## 🚨 BRUTAL TRUTH - Agent 29 Mycelial Network Report

### 🔴 TWO CONFLICTING APP STRUCTURES
**The repository is schizophrenic:**
1. **ROOT APP** (`apps/web/`):
   - Package: `@rnrb/web`
   - Status: Minimal features, premium CSS only
   - Auth: Re-exports from `@cronkwaters/auth` ✅
   - Ably: Components exist but NOT integrated ❌
   - Messages page: DELETED (no route exists) ❌

2. **SONG-FORGE APP** (`song-forge/apps/web/`):
   - Package: `@cronkwaters/web`
   - Status: Full features, 923 "CronkWaters" branding issues
   - Auth: Full implementation ✅
   - Ably: Fully integrated by Agent 28 ✅
   - Messages page: EXISTS and working ✅

### 🔴 DEPLOYMENT CONFUSION
**User actions contradict each other:**
- User corrected `vercel.json` to deploy ROOT app (`@rnrb/web`)
- But ROOT app is missing critical features Agent 28 added
- Agent 28's work is trapped in `song-forge/` directory

### 🔴 EXACT CURRENT STATE

**SEO:** ✅ Excellent (verified in root `apps/web/app/layout.tsx`)
**Mobile:** ✅ Excellent (verified in root `apps/web/app/globals.css`)
**Database Schema:** ✅ 36 models exist in `packages/db/prisma/schema.prisma`
**Database Deployment:** ❓ UNKNOWN (Neon access unauthorized)
**Authentication:** ❓ UNTESTED (user never confirmed if working)
**Ably Messaging:** ❌ NOT IN DEPLOYED APP (only in song-forge)
**Latest Deployment:** ❓ UNKNOWN (Vercel access failed)

### 🔴 CRITICAL BLOCKERS

1. **WHICH APP TO DEPLOY?**
   - Current vercel.json → ROOT app (missing features)
   - Agent 28's work → SONG-FORGE app (has features)
   - User must decide

2. **AUTHENTICATION UNTESTED**
   - No confirmation if users can create accounts
   - Email auth needs EMAIL_SERVER_URL env var

3. **ABLY MESSAGING MISSING**
   - Root app has NO `/messages` page
   - Integration only exists in song-forge

4. **923 BRANDING ISSUES**
   - "CronkWaters" everywhere in song-forge
   - Must be "Rock N' Roll Basement"

## 🔴 AGENT 28 WORK - WRONG DIRECTORY!

**Agent 28 thought they fixed everything, but worked in WRONG APP:**
- ✅ Fixed auth in `song-forge/apps/web/auth.ts` 
- ✅ Added Ably to `song-forge/apps/web/app/layout.tsx`
- ✅ Created `/messages` page in `song-forge/apps/web/`
- ❌ BUT deployment uses ROOT `apps/web/` which has NONE of these fixes!

**Commits that didn't help deployed app:**
- `b53509e` - Fixed Ably imports (in song-forge)
- `1aeae66` - Updated lockfile
- `53070bb` - Added @types/node

**ROOT APP (`apps/web/`) actual state:**
- Auth: Only re-exports `@cronkwaters/auth` (might work)
- Ably: NO integration in layout.tsx
- Messages: NO page exists (was deleted)
- Premium CSS: YES (this works)

---

## 🎯 AGENT 30 - CRITICAL DECISION REQUIRED

### OPTION 1: Deploy ROOT app (current vercel.json)
**You must ADD to root `apps/web/`:**
1. Copy Ably integration from `song-forge/apps/web/app/layout.tsx`
2. Copy `/messages` page from `song-forge/apps/web/app/(app)/messages/`
3. Test authentication actually works
4. Verify env vars set

### OPTION 2: Deploy SONG-FORGE app
**Change vercel.json to:**
```json
{
  "buildCommand": "pnpm turbo run build --filter=@cronkwaters/web",
  "installCommand": "pnpm install --frozen-lockfile --prod=false",
  "outputDirectory": "song-forge/apps/web/.next"
}
```
**Then fix 923 branding issues**

### IMMEDIATE VERIFICATION NEEDED:
1. Check current deployment: `mcp_Vercel_list_deployments`
2. Test live site authentication
3. Confirm which app user wants deployed
4. STOP working in wrong directory!

### 🔴 ENVIRONMENT VARIABLES STATUS: UNKNOWN
User claims "all set" but never verified:
- EMAIL_SERVER_URL (required for email auth)
- EMAIL_FROM (required for email auth)
- ABLY_API_KEY (required for messaging)

---

## 🔗 VERIFIED INFRASTRUCTURE

**GitHub:** `https://github.com/jcronkdc/RNRB`
**Vercel:** Project `cronkwater` (but access failing)
**Database:** Neon PostgreSQL (but access unauthorized)

**TWO APPS EXIST:**
1. `apps/web/` - Package `@rnrb/web` - DEPLOYED BUT INCOMPLETE
2. `song-forge/apps/web/` - Package `@cronkwaters/web` - COMPLETE BUT NOT DEPLOYED

---

## 📋 BRUTAL FEATURE TRUTH

**WORKING IN DEPLOYED APP:**
- Premium CSS design ✅

**NOT WORKING IN DEPLOYED APP:**
- Authentication ❓ (untested)
- Ably messaging ❌ (not integrated)
- Messages page ❌ (doesn't exist)
- Email auth ❓ (env vars unknown)

**WORKING IN WRONG APP (song-forge):**
- Everything Agent 28 "fixed"
- But has 923 branding issues

---

## 🍄 FINAL MYCELIAL WISDOM

The repository is split-brained. Agent 28 worked in the wrong directory. The deployed app is missing critical features. The user must decide: deploy the incomplete ROOT app or the complete but wrongly-branded SONG-FORGE app.

**Trust nothing. Verify everything. The mushroom has spoken.**
