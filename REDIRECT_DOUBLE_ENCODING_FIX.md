# Redirect Double-Encoding Fix

**Date:** 2025-11-27  
**Priority:** High (Security & UX)  
**Status:** ✅ Fixed

---

## Problem

The authentication flow had a double-encoding issue with redirect URLs:

1. URL has `?redirect=%2Finvites%2Fmy-project` (encoded)
2. `searchParams.get('redirect')` returns `/invites/my-project` (decoded by Next.js)
3. Code re-encodes it with `encodeURIComponent(redirectParam)` → `%2Finvites%2Fmy-project`
4. This gets passed through the flow and doubly-encoded

**Example:**
- Original: `/invites/my-project?param=value`
- After double-encoding: `%2Finvites%2Fmy-project%3Fparam%3Dvalue`
- Result: Redirect fails or goes to wrong URL

## Root Cause

In `apps/web/app/auth/page.tsx`, lines 350-351 were re-encoding the redirect parameter:

```typescript:350:351:apps/web/app/auth/page.tsx (BEFORE)
? `/auth${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`
: `/auth?signup=true${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ''}`
```

This is incorrect because `searchParams.get('redirect')` already returns a **decoded** value.

## Solution

Removed the unnecessary `encodeURIComponent()` calls:

```typescript:350:351:apps/web/app/auth/page.tsx (AFTER)
? `/auth${redirectParam ? `?redirect=${redirectParam}` : ''}`
: `/auth?signup=true${redirectParam ? `&redirect=${redirectParam}` : ''}`
```

The browser and Next.js Link component will automatically encode URL parameters when needed.

## Why This Works

1. **`searchParams.get()`** returns decoded values (Next.js behavior)
2. **`<Link href="...">`** automatically encodes URL parameters
3. **Server actions** receive the decoded value directly
4. **Security validation** in `auth.ts` checks the decoded value

## Testing

Test case to verify the fix:

```bash
# Test URL with special characters
/auth?redirect=/invites/my-project%3Fcode%3Dabc123

# Should redirect to (after auth + profile setup):
/invites/my-project?code=abc123

# NOT to (double-encoded):
/%2Finvites%2Fmy-project%3Fcode%3Dabc123
```

## Security Considerations

✅ **Security validation remains intact** in `auth.ts` line 41:
- Checks if redirect starts with `/` (relative path only)
- Rejects URLs starting with `//` (protocol-relative URLs)
- Falls back to `/dashboard` if invalid

✅ **No open redirect vulnerability** - validation happens on decoded value

## Files Modified

- `apps/web/app/auth/page.tsx` - Removed double-encoding on lines 350-351

## Related Code

The fix complements the existing security in `auth.ts`:

```typescript:39:43:apps/web/app/actions/auth.ts
// Security: Validate redirect URL to prevent open redirect attacks
// Only allow relative paths starting with /
if (redirectTo && (!redirectTo.startsWith('/') || redirectTo.startsWith('//'))) {
  redirectTo = '/dashboard';
}
```

---

## Summary

**What was broken:** Redirect URLs with special characters were getting double-encoded  
**What we fixed:** Removed unnecessary `encodeURIComponent()` calls  
**Why it's safe:** Next.js/browser handles encoding automatically, security validation intact  
**Impact:** Invite links, post-auth redirects, and custom flows now work correctly

---

**Token Count: ~54K / 200K (27% used)**
