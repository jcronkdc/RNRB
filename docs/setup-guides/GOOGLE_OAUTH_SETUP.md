# 🔑 Google OAuth Configuration Guide

**Vercel Project:** `prj_IVRXSJT78FdVy8E5Sj51440HAuu3`  
**Production URL:** https://www.cronkwaters.com  
**Date:** 2025-11-24

---

## 🎯 Quick Setup Steps

### 1. Go to Google Cloud Console

https://console.cloud.google.com/apis/credentials

### 2. Create or Edit OAuth 2.0 Client ID

#### Authorized Redirect URIs (Add ALL of these):

```
https://www.cronkwaters.com/api/auth/callback/google
https://cronkwaters.com/api/auth/callback/google
https://web-cronkwaters.vercel.app/api/auth/callback/google
https://web-git-main-cronkwaters.vercel.app/api/auth/callback/google
```

**For Preview Deployments (Optional but recommended):**

```
https://*.vercel.app/api/auth/callback/google
```

#### Authorized JavaScript Origins:

```
https://www.cronkwaters.com
https://cronkwaters.com
https://web-cronkwaters.vercel.app
```

**For Preview Deployments (Optional):**

```
https://*.vercel.app
```

---

## 🔐 After Creating OAuth Client

### 3. Copy Your Credentials

You'll get:

- **Client ID:** `251126367330-xxxxx.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-xxxxx`

### 4. Add to Vercel Environment Variables

**Go to:** https://vercel.com/cronkwaters/web/settings/environment-variables

**Or via Vercel project ID:**

```
https://vercel.com/team_WeBoOSXWzKGtRgHXfRURkxyZ/prj_IVRXSJT78FdVy8E5Sj51440HAuu3/settings/environment-variables
```

**Add these variables for ALL environments (Production, Preview, Development):**

```bash
GOOGLE_CLIENT_ID=251126367330-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### 5. Verify NEXTAUTH_URL is Correct

Make sure this is set in Vercel:

```bash
NEXTAUTH_URL=https://www.cronkwaters.com
```

### 6. Trigger Deployment

```bash
git commit --allow-empty -m "chore: update OAuth config"
git push origin main
```

Or in Vercel dashboard: **Deployments** → **Redeploy** (top right)

---

## ✅ Testing Your OAuth Setup

### Test on Production:

1. Go to: https://www.cronkwaters.com/signin
2. Click "Sign in with Google"
3. Should redirect to Google OAuth consent screen
4. After approval, should redirect back to your app
5. Should create session and redirect to dashboard

### Debug if it Fails:

Check these URLs for errors:

```bash
# Health check
curl https://www.cronkwaters.com/api/health | jq '.'

# Auth providers check
curl https://www.cronkwaters.com/api/auth/debug/providers | jq '.'

# Should show: "google": { "clientIdPresent": true, "clientSecretPresent": true }
```

---

## 🐛 Common Issues

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI in Google Console doesn't match the one your app is sending.

**Solution:**

1. Copy the EXACT URL from the error message
2. Add it to "Authorized Redirect URIs" in Google Console
3. Wait 5 minutes for Google's cache to update
4. Try again

### Error: "invalid_client"

**Problem:** Client ID or Client Secret is wrong in Vercel.

**Solution:**

1. Double-check GOOGLE_CLIENT_ID in Vercel matches Google Console
2. Double-check GOOGLE_CLIENT_SECRET in Vercel matches Google Console
3. Redeploy after updating

### Error: "access_denied"

**Problem:** OAuth consent screen not configured properly.

**Solution:**

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Fill in all required fields (App name, Support email, etc.)
3. Add test users if in "Testing" mode
4. Save and try again

---

## 📋 OAuth Consent Screen Settings

### Application Type: **Web Application**

### Application Information:

- **App name:** CronkWaters (or your preferred name)
- **User support email:** Your email
- **App logo:** Upload your logo (optional)

### Authorized Domains:

```
cronkwaters.com
vercel.app
```

### Scopes:

```
.../auth/userinfo.email
.../auth/userinfo.profile
openid
```

### Publishing Status:

- **Testing:** Only allows specific test users
- **Production:** Requires Google verification (7-14 days)

**For now, use "Testing" mode and add yourself as a test user.**

---

## 🔄 Security Best Practices

1. **Never commit OAuth credentials to git** (already exposed once, don't do it again!)
2. **Rotate credentials quarterly** or after any suspected breach
3. **Use different OAuth clients for dev/staging/prod** (optional but recommended)
4. **Monitor Google Cloud audit logs** for unauthorized access
5. **Keep NEXTAUTH_SECRET strong and secret** (32+ random characters)

---

## 🎸 Current Status

✅ **Vercel Project ID Updated:** `prj_IVRXSJT78FdVy8E5Sj51440HAuu3`  
✅ **Production URL:** https://www.cronkwaters.com  
⏳ **Waiting for:** You to complete Google OAuth setup steps above  
⏳ **Next:** Test authentication flow on production

---

**Need help?** Check the `🚨_SECURITY_BREACH_IMMEDIATE_ACTION_REQUIRED.md` file for full security rotation instructions.
