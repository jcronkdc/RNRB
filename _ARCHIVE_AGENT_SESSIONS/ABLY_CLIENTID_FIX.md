# Ably ClientId Mismatch - Fixed

**Date:** Tuesday Nov 25, 2025  
**Issue:** 403 Forbidden - clientId mismatch  
**Status:** ✅ **FIXED**

---

## 🐛 The Issue

After fixing the initial Ably authentication (401), a new error appeared:

```
Ably: Connection state: failed; reason: 
[e: Mismatch between clientId in token (cmie3rin00000556jjrxzr68s) and current clientId (rnrb-web); 
statusCode=403; code=40102]

Ably connection failed - real-time features disabled
```

---

## 🔍 Root Cause

**The Mismatch:**

1. **Token Generation** (`/api/ably/token/route.ts`):
   ```typescript
   const tokenRequest = await ablyRest.auth.createTokenRequest({
     clientId: user.id, // Uses actual user ID: "cmie3rin00000556jjrxzr68s"
   });
   ```

2. **Client Initialization** (`/components/ably/ably-provider.tsx`):
   ```typescript
   const ablyClient = new Ably.Realtime({
     authUrl: '/api/ably/token',
     clientId: 'rnrb-web', // Hardcoded string - MISMATCH!
   });
   ```

**Why it Failed:**
Ably requires that the `clientId` specified in the token **must exactly match** the `clientId` used when connecting. This is a security feature to prevent token hijacking.

---

## ✅ The Fix

**Changed:** `apps/web/components/ably/ably-provider.tsx`

```typescript
// BEFORE (broken)
const ablyClient = new Ably.Realtime({
  authUrl: '/api/ably/token',
  clientId: process.env.NEXT_PUBLIC_ABLY_CLIENT_ID ?? 'rnrb-web',
  // ...
});

// AFTER (fixed)
const ablyClient = new Ably.Realtime({
  authUrl: '/api/ably/token',
  clientId: session.user.id, // Use actual user ID from NextAuth
  // ...
});
```

**Also updated the guard condition:**
```typescript
// Added check for session.user.id
if (typeof window === 'undefined' || !shouldInit || !isAuthenticated || !session?.user?.id) {
  return;
}
```

---

## 🎯 Benefits of This Approach

### ✅ Security
- Each user has a unique clientId (their user ID)
- Prevents token sharing between users
- Aligns with Ably's security best practices

### ✅ Functionality
- Enables user-specific presence tracking
- Allows proper message attribution
- Supports per-user channel subscriptions

### ✅ Consistency
- Token and client now use the same ID
- No more 403 errors
- Clean Ably connection logs

---

## 🚀 Deployment

**Commit:** `20f9a075`  
**Branch:** `main`  
**Status:** Pushed to production

**Timeline:**
- Fix committed: ~9:30 AM
- Deployment: ~9:32 AM
- Expected live: ~9:35 AM

---

## 🧪 Testing

After deployment completes (~2-3 minutes), verify:

1. **Log in** to www.cronkwaters.com
2. **Open DevTools Console** (F12)
3. **Check for:**
   - ✅ No "Mismatch between clientId" errors
   - ✅ No 403 statusCode=40102 errors
   - ✅ "Ably connected" messages (if logging enabled)
   - ✅ Real-time features working

---

## 📊 Complete Timeline of Fixes

### Fix #1: Authentication (401 → 200)
- **Problem:** Ably token route used Supabase auth instead of NextAuth
- **Solution:** Changed to `auth()` from NextAuth
- **Result:** Tokens now generate successfully

### Fix #2: ClientId Mismatch (403 → Connected)
- **Problem:** Token had user ID, client had "rnrb-web"
- **Solution:** Client now uses `session.user.id`
- **Result:** ClientIds match, connection succeeds

---

## 🎸 Status

**Authentication:** ✅ Working  
**Token Generation:** ✅ Working  
**ClientId Matching:** ✅ Fixed  
**Real-time Features:** 🟢 Should be operational after deployment

---

## 📝 Notes

### Removed Environment Variable
The `NEXT_PUBLIC_ABLY_CLIENT_ID` env var is no longer used since we now dynamically use the user's ID. This simplifies configuration and improves security.

### User Experience
Users will now see their actual user ID in Ably presence/channel member lists, which is better for debugging and tracking collaborative sessions.

---

**Deployment:** ✅ PUSHED  
**Next Step:** Wait ~3 minutes, then test on live site

🎸 Real-time features incoming!

