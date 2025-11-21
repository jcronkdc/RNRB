# 🔐 Google OAuth Configuration Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com

2. **Create/Select Project:**
   - Click project dropdown (top left)
   - Create new project: "Rock N' Roll Basement" (or use existing)

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Rock N' Roll Basement - Production"

5. **Add Authorized Redirect URIs:**
   ```
   https://www.cronkwaters.com/api/auth/callback/google
   https://cronkwaters.com/api/auth/callback/google
   ```

6. **Copy Credentials:**
   - Client ID: (starts with something like `1234567890-abc...apps.googleusercontent.com`)
   - Client Secret: (random string like `GOCSPX-abc123...`)

### Step 2: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/justins-projects-d7153a8c/cronkwater/settings/environment-variables

2. **Add Variables:**
   
   **Variable 1:**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: (paste your Client ID)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: (paste your Client Secret)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **Click "Save"**

### Step 3: Redeploy

```bash
# Trigger redeploy to pick up new env vars
git commit --allow-empty -m "config: Add Google OAuth credentials"
git push origin main
```

Or use Vercel Dashboard:
- Go to "Deployments"
- Click "..." on latest deployment
- Click "Redeploy"

---

## ✅ Verification

After deployment completes:

1. **Visit:** https://www.cronkwaters.com/auth
2. **Click:** "Sign in with Google" button
3. **Expected:** Google OAuth consent screen appears
4. **After consent:** Redirects back to your dashboard

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Fix:** Double-check redirect URIs in Google Console match exactly:
```
https://www.cronkwaters.com/api/auth/callback/google
```

### Error: "OAuth client not configured"
**Fix:** Verify environment variables are set in Vercel and redeploy

### Error: "Access blocked: This app's request is invalid"
**Fix:** Enable Google+ API in Google Cloud Console

---

## 🧪 Current Status

**Build Output Shows:**
```javascript
{
  hasGoogleClientId: false,    // ← Currently missing
  hasGoogleClientSecret: false, // ← Currently missing
  hasEmailServer: false,
  hasEmailFrom: false
}
```

**After Fix:**
```javascript
{
  hasGoogleClientId: true,     // ✅ Fixed
  hasGoogleClientSecret: true, // ✅ Fixed
  hasEmailServer: false,       // Optional (magic links)
  hasEmailFrom: false          // Optional (magic links)
}
```

---

## 📋 Complete Environment Variables Checklist

**Required for Auth:**
- ✅ `DATABASE_URL` (already set - Neon/PostgreSQL)
- ✅ `NEXTAUTH_SECRET` (already set)
- ✅ `NEXTAUTH_URL` (should be `https://www.cronkwaters.com`)
- ❌ `GOOGLE_CLIENT_ID` **← NEED TO ADD**
- ❌ `GOOGLE_CLIENT_SECRET` **← NEED TO ADD**

**Optional (for other features):**
- `NEXT_PUBLIC_ABLY_CLIENT_ID` (real-time chat)
- `DAILY_API_KEY` (video calls)
- `EMAIL_SERVER` (magic links)
- `EMAIL_FROM` (magic links)

---

## 🎯 Next Steps After OAuth Config

1. ✅ Configure OAuth (this guide)
2. Test sign-in flow: https://www.cronkwaters.com/auth
3. Verify user record created in database
4. Test dashboard access after sign-in
5. Test sign-out

---

## 🔒 Security Notes

- **Never commit credentials to Git**
- **Use different OAuth clients for dev/staging/production**
- **Rotate secrets if accidentally exposed**
- **Monitor OAuth usage in Google Console**

---

**READY TO PROCEED:** Follow Step 1-3 above to complete OAuth setup!
