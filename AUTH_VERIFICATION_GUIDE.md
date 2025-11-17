# 🔐 Authentication Verification Guide

## 🎯 Current Status

**Database:** ✅ READY - All NextAuth tables created, RLS enabled
**Code:** ✅ READY - Prisma schema updated, build successful, deployed
**Testing:** ⚠️ PENDING - Needs manual verification of environment variables and Google OAuth

---

## 📋 Step-by-Step Verification Checklist

### 1️⃣ Verify Google Cloud Console OAuth Configuration

**Go to:** https://console.cloud.google.com/apis/credentials

1. Find your OAuth 2.0 Client ID
2. Click to edit it
3. Under "Authorized redirect URIs", verify these are present:

```
https://www.cronkwaters.com/api/auth/callback/google
https://cronkwater-justins-projects-d7153a8c.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

4. If any are missing, add them and save
5. **Note:** Changes may take 5-10 minutes to propagate

**Status:** [ ] Completed

---

### 2️⃣ Verify Vercel Environment Variables

**Go to:** https://vercel.com/dashboard → cronkwater project → Settings → Environment Variables

Verify these are set for **Production** environment:

| Variable | Expected Value | Status |
|----------|----------------|--------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | [ ] |
| `NEXTAUTH_SECRET` | Random 32+ character string | [ ] |
| `NEXTAUTH_URL` | `https://www.cronkwaters.com` | [ ] |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | [ ] |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | [ ] |
| `EMAIL_SERVER_URL` | SMTP URL for magic links (optional) | [ ] |
| `EMAIL_FROM` | Email sender address (optional) | [ ] |

**Generate NEXTAUTH_SECRET if missing:**
```bash
openssl rand -base64 32
```

**If you make changes:** Redeploy the application for changes to take effect.

**Status:** [ ] Completed

---

### 3️⃣ Test Authentication Flow (Production)

**URL:** https://www.cronkwaters.com/auth

1. **Google OAuth Test:**
   - [ ] Click "Continue with Google" button
   - [ ] Redirected to Google sign-in page
   - [ ] Select Google account
   - [ ] Redirected back to www.cronkwaters.com homepage
   - [ ] User is signed in (check for profile/avatar in nav)

2. **Email Magic Link Test (if configured):**
   - [ ] Enter email address
   - [ ] Click "Sign in with Email"
   - [ ] Receive email with magic link
   - [ ] Click link in email
   - [ ] Redirected to homepage
   - [ ] User is signed in

**Status:** [ ] Completed

---

### 4️⃣ Check for Errors in Vercel Logs

**Run:**
```bash
vercel logs www.cronkwaters.com --since 1h
```

**Look for:**
- ❌ "OAuth error"
- ❌ "Database connection failed"
- ❌ "Prisma" errors
- ❌ "NEXTAUTH_SECRET" errors
- ❌ Any 500 errors during auth callback

**If you see errors:** Copy them and check the master document for troubleshooting steps.

**Status:** [ ] Completed

---

### 5️⃣ Verify Database Records

After successful sign-in, check if records were created:

**Via Supabase Dashboard or SQL:**
```sql
-- Check if user was created
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 1;

-- Check if account was linked
SELECT * FROM "Account" ORDER BY id DESC LIMIT 1;

-- Check if session was created
SELECT * FROM "Session" WHERE "userId" = (SELECT id FROM "User" ORDER BY "createdAt" DESC LIMIT 1);
```

**Expected:**
- [ ] User record exists with email and name
- [ ] Account record exists with provider='google'
- [ ] Session record may or may not exist (depends on JWT vs database sessions)

**Status:** [ ] Completed

---

## 🚨 Common Issues & Solutions

### Issue: "Application error: a server-side exception has occurred"

**Possible Causes:**
1. Google OAuth redirect URI mismatch
2. Missing NEXTAUTH_SECRET
3. Database connection failed
4. Invalid GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET

**Solution:**
- Check Vercel logs for specific error
- Verify all environment variables are set
- Confirm Google OAuth redirect URIs match exactly

### Issue: Google OAuth redirects to error page

**Possible Causes:**
1. Redirect URI not authorized in Google Cloud Console
2. Client ID or secret mismatch

**Solution:**
- Double-check Google Cloud Console redirect URIs
- Regenerate client secret if necessary
- Wait 5-10 minutes after making changes

### Issue: Database errors during auth

**Possible Causes:**
1. DATABASE_URL is incorrect
2. Database is down or unreachable
3. Missing tables (should be fixed now)

**Solution:**
- Verify DATABASE_URL in Vercel env vars
- Test database connection
- Check Supabase/Neon database status

---

## 📊 Final Verification Matrix

| Component | Status | Notes |
|-----------|--------|-------|
| Database Tables | ✅ READY | Account, Session, User, VerificationToken exist |
| RLS Policies | ✅ ENABLED | Security hardened |
| Prisma Schema | ✅ UPDATED | Both packages updated |
| Build | ✅ SUCCESS | No errors |
| Deployment | ✅ DEPLOYED | Commit 1482fee pushed |
| Google OAuth Config | ⚠️ VERIFY | Check redirect URIs |
| Vercel Env Vars | ⚠️ VERIFY | Check all required vars |
| Auth Flow Test | ⚠️ PENDING | Manual test required |

---

## ✅ Success Criteria

Authentication is **FULLY WORKING** when:

1. ✅ User can click "Continue with Google" without errors
2. ✅ Google OAuth redirects back successfully
3. ✅ User record is created in database
4. ✅ Account record links Google profile to user
5. ✅ User sees their name/avatar in navigation
6. ✅ User can sign out and sign in again
7. ✅ No errors in Vercel logs
8. ✅ RLS policies protect user data

---

## 🔄 Next Steps After Verification

Once auth is working:

1. [ ] Test email magic link authentication
2. [ ] Test sign-out flow
3. [ ] Test protected routes
4. [ ] Add user profile page
5. [ ] Add organization/membership features
6. [ ] Configure session expiration
7. [ ] Set up proper error pages for auth failures

---

**Last Updated:** 2025-11-17 (Agent 32)
**Status:** Database Ready - Awaiting Environment Variable Verification

