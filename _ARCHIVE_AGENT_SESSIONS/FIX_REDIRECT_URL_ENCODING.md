# Redirect URL Encoding Fix

**Issue Fixed:** Profile setup redirect was breaking email parameters with `+` character

**Date:** November 27, 2025  
**Files Changed:** 
- `apps/web/app/(app)/settings/profile/page.tsx`
- `apps/web/app/(app)/settings/profile/__tests__/redirect-handling.test.ts`

## Problem

The code received a decoded redirect URL from `searchParams.get()` and passed it directly to `router.push()` with a comment claiming "Next.js router will handle encoding properly." However, `router.push()` does NOT automatically re-encode query parameter values.

### Example Scenario

When a user with email `user+test@example.com` gets invited to a project:

1. **Invite page** creates redirect: `/invites/project?email=user%2Btest%40example.com`
2. **Auth page** receives it as redirect param, encodes it for profile setup
3. **Profile page** receives decoded value from `searchParams.get('redirect')`: `/invites/project?email=user%2Btest@example.com`
4. **OLD CODE BUG**: Passed it directly to `router.push()`
5. **Browser interprets** `+` as space per RFC 3986
6. **Result**: Email becomes `user test@example.com` (BROKEN ❌)

## Solution

Use the **URL constructor pattern** to properly re-encode the URL before passing to `router.push()`:

```typescript
// Before (BROKEN):
router.push(destination);

// After (FIXED):
try {
  const url = new URL(destination, 'http://placeholder.com');
  const reEncodedPath = url.pathname + url.search + url.hash;
  router.push(reEncodedPath);
} catch {
  router.push('/dashboard'); // Fallback
}
```

### How It Works

1. `new URL()` parses the decoded URL and properly identifies query parameters
2. The URL object's `.search` property automatically re-encodes special characters
3. Reconstructing `pathname + search + hash` gives us a properly encoded URL
4. `router.push()` receives URL with `+` correctly encoded as `%2B`

## Test Coverage

Added/updated tests in `redirect-handling.test.ts`:

- ✅ Single encoding (no double-decoding)
- ✅ Special character preservation (`+`, `&`, `=`, `?`, `#`, space)
- ✅ Multiple query parameters
- ✅ Hash fragments
- ✅ Email addresses with `+` character

## Verification Steps

To manually verify the fix works:

```bash
# 1. Start dev server
pnpm dev

# 2. Create test account with + in email
# Register with: user+test@example.com

# 3. Create invite link with email parameter
# URL: /invites/my-project?email=user%2Btest%40example.com

# 4. Sign up → Profile Setup → Redirect to invite
# Verify email parameter remains: user+test@example.com (not "user test@example.com")
```

## Key Takeaway

**Next.js searchParams.get() ALWAYS returns decoded values.**

When passing these to `router.push()`, you MUST use the URL constructor pattern to re-encode query parameters. The router does NOT handle encoding automatically.

**Pattern to remember:**
```typescript
const url = new URL(destination, 'http://placeholder.com');
const reEncodedPath = url.pathname + url.search + url.hash;
router.push(reEncodedPath);
```

---

**Status:** ✅ FIXED  
**Build:** No breaking changes  
**Linting:** All clean

