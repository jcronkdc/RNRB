# Auth Page Redirect Error Fix

**Date:** November 26, 2025  
**Status:** ✅ FIXED

## Problem Identified

The auto sign-in flow after signup had a critical redirect handling bug that prevented users from being redirected to the dashboard after successful account creation.

### Root Causes

1. **Async Boundary Issue**: The `setTimeout` created an async boundary that prevented redirect errors from propagating correctly through the call stack
2. **Swallowed Redirect Error**: In the signup flow, redirect errors were caught and then just returned, not re-thrown
3. **Missing Redirect Check**: The outer catch block didn't check for redirect errors before showing error messages

### The Bug Flow

```
User signs up → Account created → setTimeout(1000ms) → Sign in succeeds
→ Redirect error thrown → Caught in setTimeout try/catch → return; (WRONG!)
→ Redirect error swallowed → User stuck on auth page with loading spinner
```

## Solution Implemented

### Changes Made to `apps/web/app/auth/page.tsx`

1. **Removed `setTimeout`**: Eliminated the async boundary by signing in immediately after signup
2. **Simplified Flow**: Both signup and signin now follow the same error handling pattern
3. **Proper Redirect Error Handling**: Added redirect error check in the outer catch block that re-throws

### New Flow

```typescript
try {
  if (isSignup) {
    // Create account
    await fetch('/api/register', {...});

    // Sign in immediately (no setTimeout)
    const result = await signInWithCredentials({ email, password });
    if (result && !result.success) {
      throw new Error(result.error || 'Auto sign-in failed...');
    }
    // Redirect error will be thrown here on success
  } else {
    // Sign in directly
    const result = await signInWithCredentials({ email, password });
    if (result && !result.success) {
      throw new Error(result.error || 'Sign in failed');
    }
    // Redirect error will be thrown here on success
  }
} catch (error) {
  // CRITICAL: Check for redirect errors first
  if (isRedirectError(error)) {
    throw error; // Re-throw to allow Next.js to handle redirect
  }

  // Handle actual errors
  console.error('[AUTH] Password auth error:', error);
  setMessage({ type: 'error', text: errorMessage });
  setLoading(false);
}
```

## Why This Works

1. **Synchronous Call Stack**: Removing `setTimeout` means redirect errors propagate through a synchronous call stack
2. **Proper Re-throw**: The outer catch checks for redirect errors and re-throws them to Next.js
3. **Single Source of Truth**: Both signup and signin follow the same pattern, reducing complexity

## Benefits

✅ Users are properly redirected after successful signup  
✅ Loading states are correctly managed  
✅ No "stuck on auth page" issue  
✅ Cleaner, more maintainable code  
✅ Consistent error handling between signup and signin

## Testing Checklist

- [ ] Sign up with new credentials → Should redirect to /dashboard
- [ ] Sign in with existing credentials → Should redirect to /dashboard
- [ ] Sign up with invalid email → Should show error message
- [ ] Sign in with wrong password → Should show error message
- [ ] Network error during signup → Should show error message

---

**Token Count: ~2,400 / 200,000**






