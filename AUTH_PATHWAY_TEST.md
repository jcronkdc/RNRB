# 🔐 Authentication Pathway Testing Guide

**Created:** 2025-11-22 @ Agent 55  
**Purpose:** Comprehensive guide to test and verify all authentication pathways  
**Commit:** `54adb570`

---

## 🎯 Testing Objective

Verify that the songwriting page properly detects authenticated users and shows/hides the CollaborativeVisualBuilder accordingly.

---

## 🧪 Test Cases

### **Test 1: Unauthenticated User Flow**

**Steps:**

1. Open browser in incognito/private mode
2. Navigate to https://www.cronkwaters.com/songwriting
3. Open Developer Console (F12)
4. Click "Song Structure" tab

**Expected Console Output:**

```
🔐 useRequireAuth: Starting auth check
🔐 useRequireAuth: Getting session from Supabase
🔐 useRequireAuth: No session found
🎸 Songwriting Page - Auth State: {
  user: null,
  loading: false,
  hasUser: false,
  activeView: 'structure'
}
```

**Expected UI:**

- ✅ Loading indicator shows briefly ("Loading authentication...")
- ✅ Auth prompt appears with "Sign In to Collaborate" message
- ✅ Orange button "Sign In to Continue" is visible
- ✅ No CollaborativeVisualBuilder component renders

---

### **Test 2: Authenticated User Flow**

**Steps:**

1. Sign in at https://www.cronkwaters.com/auth
2. Navigate to /songwriting
3. Open Developer Console (F12)
4. Click "Song Structure" tab

**Expected Console Output:**

```
🔐 useRequireAuth: Starting auth check
🔐 useRequireAuth: Getting session from Supabase
🔐 useRequireAuth: User authenticated {
  id: "...",
  email: "user@example.com"
}
🎸 Songwriting Page - Auth State: {
  user: { id: "...", email: "user@example.com" },
  loading: false,
  hasUser: true,
  activeView: 'structure'
}
```

**Expected UI:**

- ✅ Loading indicator shows briefly ("Loading authentication...")
- ✅ CollaborativeVisualBuilder loads and displays
- ✅ Building blocks palette visible (Verse, Chorus, Bridge)
- ✅ Drag-and-drop functionality works
- ✅ PresenceIndicator shows in header (your user badge)
- ✅ No "Sign In" prompt visible

---

### **Test 3: Session Expiry During Use**

**Steps:**

1. Sign in and go to /songwriting
2. In another tab, sign out at /auth
3. Return to /songwriting tab
4. Refresh the page

**Expected Behavior:**

- ✅ Page refreshes and detects no session
- ✅ Console shows "No session found"
- ✅ Auth prompt appears
- ✅ CollaborativeVisualBuilder hides

---

### **Test 4: Supabase Client Initialization**

**Steps:**

1. Check console on page load
2. Look for any Supabase errors

**Expected Console Output (if properly configured):**

```
🔐 useRequireAuth: Starting auth check
🔐 useRequireAuth: Getting session from Supabase
```

**If Supabase NOT configured:**

```
🔐 useRequireAuth: Supabase client not initialized
Missing Supabase environment variables
```

---

### **Test 5: Cache Performance**

**Steps:**

1. Sign in and visit /songwriting
2. Note page load time
3. Navigate to /dashboard
4. Return to /songwriting within 30 seconds
5. Observe loading behavior

**Expected Behavior:**

- ✅ First load: Shows loading indicator briefly
- ✅ Return within 30s: Instant load (cache hit)
- ✅ Console shows auth check completing quickly

---

## 🔧 Debugging Common Issues

### **Issue: Blank screen on structure view when signed in**

**Diagnosis:**
Check console for these logs:

```
🎸 Songwriting Page - Auth State
```

**If you see:**

- `loading: true` (stuck) → Auth hook not completing
- `user: null` when signed in → Session not being retrieved
- No logs → Page not rendering at all

**Solutions:**

1. Check Supabase environment variables (`.env.local`):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. Check localStorage for session:
   - Open DevTools → Application → Local Storage
   - Look for `sb-xxxxx-auth-token`

3. Force refresh cache:
   - Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

### **Issue: "Supabase client not initialized" error**

**Diagnosis:**
Check console for:

```
🔐 useRequireAuth: Supabase client not initialized
Missing Supabase environment variables
```

**Solutions:**

1. Verify `.env.local` has correct values
2. Restart dev server: `pnpm dev` in `apps/web`
3. Check `apps/web/lib/supabase.ts` for URL correction logic

---

### **Issue: Auth prompt shows but I'm signed in**

**Diagnosis:**
This means `user` is null despite being authenticated.

**Check:**

1. Console logs show "No session found"
2. localStorage has no session token
3. Session may have expired

**Solutions:**

1. Sign out completely and sign in again
2. Clear browser cookies and localStorage
3. Check Supabase dashboard for user status

---

## 📊 Success Criteria

Authentication pathways are working correctly if:

- ✅ Unauthenticated users see auth prompt on structure view
- ✅ Authenticated users see CollaborativeVisualBuilder
- ✅ Console logs show correct auth state
- ✅ No errors in console during auth check
- ✅ Loading states display smoothly
- ✅ Cache improves performance on repeated loads

---

## 🚀 Next Steps After Testing

**If all tests pass:**

1. Remove verbose console logging (optional, helps with debugging)
2. Consider adding error boundary for auth failures
3. Add retry logic for failed auth checks

**If tests fail:**

1. Share console logs with specific error messages
2. Check Supabase dashboard for user and project status
3. Verify environment variables in Vercel dashboard
4. Check browser network tab for failed API calls

---

## 📝 Environment Checklist

Before testing, verify:

- [ ] `.env.local` has Supabase credentials
- [ ] Supabase project is active (not paused)
- [ ] User account exists in Supabase Auth
- [ ] RLS policies allow read access
- [ ] Browser allows localStorage (not in private mode with restrictions)
- [ ] No adblockers blocking Supabase requests

---

**Last Updated:** 2025-11-22  
**Status:** Ready for testing  
**Commit:** `54adb570` - Auth debugging and loading states added
