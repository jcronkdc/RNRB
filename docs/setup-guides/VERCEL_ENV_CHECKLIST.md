# 🔐 Vercel Environment Variables Checklist

**Project:** cronkwater  
**Team:** Cronk Companies (team_WeBoOSXWzKGtRgHXfRURkxyZ)  
**Production URL:** https://www.cronkwaters.com

---

## ✅ How to Verify

1. Go to: https://vercel.com/team_WeBoOSXWzKGtRgHXfRURkxyZ/cronkwater/settings/environment-variables
2. Check that ALL of these variables exist and are set to Production environment:

---

## 📋 REQUIRED ENVIRONMENT VARIABLES

### Database & Core

- [ ] **DATABASE_URL** - Neon PostgreSQL connection string
  - Format: `postgresql://user:pass@host/dbname?sslmode=require`
  - Must point to Neon database

### Authentication

- [ ] **NEXTAUTH_SECRET** - Encryption key for sessions
  - Generate with: `openssl rand -base64 32`
  - Must be 32+ characters

- [ ] **NEXTAUTH_URL** - Production URL
  - **Must be:** `https://www.cronkwaters.com`
  - ⚠️ NO trailing slash, NO newlines

- [ ] **GOOGLE_CLIENT_ID** - Google OAuth Client ID
  - From: https://console.cloud.google.com/apis/credentials
  - Format: `XXXXXXXXX.apps.googleusercontent.com`

- [ ] **GOOGLE_CLIENT_SECRET** - Google OAuth Client Secret
  - From same location as client ID
  - Keep secure!

### Collaboration Services

- [ ] **DAILY_API_KEY** - Daily.co API key for video rooms
  - From: https://dashboard.daily.co
  - Format: Usually starts with `d_`

- [ ] **ABLY_API_KEY** - Ably real-time chat key
  - From: https://ably.com/dashboard
  - Format: `AppID.KeyID:KeySecret`

### Public Environment Variables

- [ ] **NEXT_PUBLIC_SITE_URL** - Public site URL
  - **Must be:** `https://www.cronkwaters.com`
  - Used for metadata, sitemaps, Open Graph

- [ ] **NEXT_PUBLIC_ABLY_CLIENT_ID** - Public Ably client identifier
  - Default: `rnrb-web`
  - Can be any string

### Optional (Email Features)

- [ ] **EMAIL_SERVER_URL** - SMTP server for magic links (optional)
  - Format: `smtp://user:pass@smtp.example.com:587`
  - Required only if using email authentication

- [ ] **EMAIL_FROM** - From address for auth emails (optional)
  - Format: `Rock N' Roll Basement <noreply@cronkwaters.com>`
  - Required only if using email authentication

### Optional (AI Features)

- [ ] **OPENAI_API_KEY** - For GPT-4 lyrics generation (optional)
  - Format: `sk-...`
  - Required only if using AI songwriting

- [ ] **ELEVENLABS_API_KEY** - For voice synthesis (optional)
  - Required only if using voice features

---

## 🧪 How to Test After Setting

After updating any environment variable in Vercel:

1. **Vercel will automatically redeploy** - Wait for deployment to finish
2. **Test the feature** that depends on that variable:
   - `DATABASE_URL` → Try signing in
   - `GOOGLE_CLIENT_ID/SECRET` → Try Google OAuth
   - `DAILY_API_KEY` → Try starting a video room
   - `ABLY_API_KEY` → Try sending a chat message
   - `NEXT_PUBLIC_SITE_URL` → Check Open Graph tags

3. **Check errors:**
   - Go to: https://vercel.com/justins-projects-d7153a8c/cronkwater/logs
   - Filter by "Error"
   - Look for missing env var errors

---

## 🚨 Common Issues

### Issue: "NEXTAUTH_URL has trailing newline"

**Fix:** Edit the variable, remove ANY spaces/newlines at end, save

### Issue: "redirect_uri_mismatch" on Google OAuth

**Fix:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   - `https://www.cronkwaters.com/api/auth/callback/google`
   - `https://cronkwaters.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for dev)

### Issue: Daily.co rooms fail to create

**Check:**

- `DAILY_API_KEY` is set in Vercel
- API key is valid (not expired)
- Daily.co account has available room quota

### Issue: Ably chat not working

**Check:**

- `ABLY_API_KEY` is set in Vercel
- API key format is correct: `AppID.KeyID:KeySecret`
- Ably account is active

---

## ✅ Verification Complete When:

- [ ] All required variables exist in Vercel dashboard
- [ ] Production deployment succeeded with no env var errors
- [ ] Human test passed: Sign in with Google works
- [ ] Human test passed: Create project works
- [ ] Human test passed: Video collaboration works
- [ ] Human test passed: Chat messaging works

---

**Last Updated:** 2025-11-20 @ Agent 42
