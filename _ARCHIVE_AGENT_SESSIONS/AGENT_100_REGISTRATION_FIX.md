# 🍄 AGENT 100 — REGISTRATION API 500 ERROR FIX

**Date:** 2025-11-24  
**Issue:** Registration endpoint returns `{"error":"Failed to create account"}` (HTTP 500)  
**Root Cause:** **DATABASE_URL environment variable missing or invalid in Vercel production**

---

## 🔍 DIAGNOSIS

### What's Working ✅
1. **bcryptjs dependency** installed successfully in production (`+ bcryptjs 3.0.3`)
2. **Build passes** (67 pages generated, Next.js 15.5.6)
3. **Code is correct** (`apps/web/app/api/auth/register/route.ts` imports bcryptjs properly)
4. **Prisma schema valid** (User model has correct fields with auto-managed `updatedAt`)

### The BLOCKAGE 🔴
**Vercel production environment is missing the real `DATABASE_URL`.**

**Evidence:**
- Local `.env.local` contains placeholder: `DATABASE_URL=postgresql://neondb_owner:npg_placeholder@...`
- Registration endpoint attempts `await prisma.user.create(...)` 
- Prisma cannot connect to database → throws error
- Route catches error → returns 500 status

---

## ✅ THE FIX (USER ACTION REQUIRED)

### Step 1: Get Your Real Neon Database Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project (likely named "neondb" or similar)
3. Click **Connection Details** or **Connection String**
4. Copy the **full connection string** (format: `postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`)

**Example format:**
```
postgresql://neondb_owner:YOUR_REAL_PASSWORD@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

### Step 2: Add DATABASE_URL to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project: **cronkwater** (or search "cronkwaters")
3. Click **Settings** → **Environment Variables**
4. Add/Update the following variable:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:YOUR_REAL_PASSWORD@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require` | ✅ Production ✅ Preview ✅ Development |

5. Click **Save**

---

### Step 3: Redeploy Production

After adding `DATABASE_URL`:

**Option A: Push to trigger auto-deploy:**
```bash
cd /Users/justincronk/Desktop/CronkWaters
git commit --allow-empty -m "chore: trigger redeploy with DATABASE_URL"
git push origin main
```

**Option B: Manual redeploy in Vercel Dashboard:**
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **"⋯"** → **"Redeploy"**

---

### Step 4: Verify Fix

Wait 2-3 minutes for deployment, then test:

```bash
curl -X POST https://www.cronkwaters.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"agent100test@cronkwaters.com","password":"TestPassword123!","name":"Agent 100"}' \
  -v
```

**Expected Response:**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "...",
    "email": "agent100test@cronkwaters.com",
    "name": "Agent 100",
    "createdAt": "2025-11-24T..."
  }
}
```

**Status Code:** `201 Created` (NOT 500)

---

## 🔒 SECURITY NOTE

**NEVER commit the real `DATABASE_URL` to git.**  
Keep it ONLY in:
- Vercel Environment Variables (production)
- Local `.env.local` file (ignored by git via `.gitignore`)

---

## 🐜 TOKYO ANT PATHWAY — REGISTRATION FLOW

### Before Fix (BLOCKED):
```
User → POST /api/auth/register
  ↓
  import bcrypt from 'bcryptjs';  ✅ WORKS
  ↓
  const hashedPassword = await bcrypt.hash(password, 10);  ✅ WORKS
  ↓
  await prisma.user.create({ ... })  ❌ FAILS (no DATABASE_URL)
  ↓
  Prisma Error: "Cannot connect to database"
  ↓
  500 Internal Server Error
```

### After Fix (FLOWING):
```
User → POST /api/auth/register
  ↓
  import bcrypt from 'bcryptjs';  ✅
  ↓
  const hashedPassword = await bcrypt.hash(password, 10);  ✅
  ↓
  await prisma.user.create({ email, password: hashedPassword, ... })  ✅
  ↓
  Database writes user record successfully
  ↓
  201 Created with user data
```

---

## 📋 NEXT STEPS AFTER FIX

1. ✅ **Add DATABASE_URL to Vercel** (Steps 1-3 above)
2. ✅ **Test registration endpoint** (Step 4 above)
3. 🧪 **Run HUMAN_TEST_CHECKLIST.md** (sign-in/sign-up flows)
4. 📄 **Update MASTER_TRUTH.md** (mark bcryptjs + DATABASE_URL as resolved)
5. 🔒 **Rotate security credentials** (if old ones still in use — see MASTER_TRUTH BLOCKER #1)

---

**AGENT 100 COMPLETE**  
**Status:** 🟡 WAITING FOR USER ACTION (DATABASE_URL configuration)  
**Estimated Time:** 5-10 minutes (Steps 1-4)

