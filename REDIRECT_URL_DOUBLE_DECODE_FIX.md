# Redirect URL Double-Decoding Fix

## Issue Summary

**Date:** November 27, 2025  
**Priority:** High (Data Corruption)  
**Status:** ✅ FIXED

## Problem Description

The redirect URL handling was performing unnecessary `decodeURIComponent()` calls on already-decoded strings from `searchParams.get()`. This caused **double-decoding** which corrupted special characters in URLs, particularly the `+` character in email addresses.

### Real-World Impact

**Example: Invite link with email**
```
Original email: user+test@example.com
Encoded in URL: user%2Btest%40example.com

After double-decoding:
❌ Corrupted to: user test@example.com (+ became space)
```

This broke invite flows where users with `+` in their email addresses couldn't accept project invitations.

## Root Cause

Next.js `searchParams.get()` **automatically decodes** URL-encoded values. The code was then calling `decodeURIComponent()` again, causing double-decoding.

### The Flow (Before Fix)

1. **Invite page** → Creates URL with encoded email:
   ```typescript
   const returnUrl = `/invites/project?email=${encodeURIComponent('user+test@example.com')}`;
   // Result: /invites/project?email=user%2Btest%40example.com
   
   router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
   // Result: /auth?redirect=%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com
   ```

2. **Auth page** → Receives decoded value:
   ```typescript
   const redirectParam = searchParams.get('redirect');
   // Next.js returns: /invites/project?email=user%2Btest@example.com (ALREADY DECODED)
   ```

3. **Auth action** → Encodes for profile setup:
   ```typescript
   redirectTo = `/settings/profile?setup=true&redirect=${encodeURIComponent(redirectParam)}`;
   // Result: /settings/profile?setup=true&redirect=%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com
   ```

4. **Profile page** → Receives decoded value:
   ```typescript
   const redirectAfterSetup = searchParams.get('redirect');
   // Next.js returns: /invites/project?email=user%2Btest@example.com (ALREADY DECODED)
   ```

5. **Profile page (BUG)** → Double-decodes:
   ```typescript
   ❌ const decodedKey = decodeURIComponent(key);      // WRONG!
   ❌ const decodedValue = decodeURIComponent(value);  // WRONG!
   // Result: /invites/project?email=user+test@example.com
   ```

6. **URL parsing** → Interprets `+` as space:
   ```typescript
   new URL('http://localhost/invites/project?email=user+test@example.com')
   // searchParams.get('email') returns: "user test@example.com" ❌ CORRUPTED!
   ```

## The Fix

### Changed Files

1. **`apps/web/app/(app)/settings/profile/page.tsx`** (lines 139-147)

**Before:**
```typescript
// Complex logic with unnecessary decoding
const decodedKey = decodeURIComponent(key);    // ❌ DOUBLE DECODE
const decodedValue = decodeURIComponent(value); // ❌ DOUBLE DECODE
// ... complex reconstruction logic
```

**After:**
```typescript
// Simple and correct - use decoded value as-is
if (destination.startsWith('/') && !destination.startsWith('//')) {
  // Note: destination is already decoded by searchParams.get()
  // Just push it directly - Next.js router will handle encoding properly
  router.push(destination);
} else {
  router.push('/dashboard');
}
```

## Key Insight

> **Next.js `searchParams.get()` ALWAYS returns decoded values.**
> 
> You should **NEVER** call `decodeURIComponent()` on these values.
> 
> When passing them to `router.push()`, use them as-is—the router handles encoding internally.

## Encoding/Decoding Rules

### ✅ DO

```typescript
// 1. Get already-decoded value from searchParams
const redirect = searchParams.get('redirect'); // Already decoded by Next.js

// 2. Use it directly with router
router.push(redirect); // Router handles encoding

// 3. When passing as query param, encode it
router.push(`/auth?redirect=${encodeURIComponent(redirect)}`);

// 4. When building URLs, encode each parameter value
const url = `/invites/project?email=${encodeURIComponent(email)}`;
```

### ❌ DON'T

```typescript
// 1. Don't decode searchParams values
const redirect = decodeURIComponent(searchParams.get('redirect')); // ❌ WRONG!

// 2. Don't encode entire URLs with query strings
const url = `/invites/project?email=${email}`;
router.push(`/auth?redirect=${encodeURIComponent(url)}`); // ✅ This is OK
// But then DON'T decode it again when you receive it

// 3. Don't forget to encode individual parameter values
const url = `/invites/project?email=${email}`; // ❌ WRONG if email has special chars
```

## Testing

Comprehensive test suite added: `apps/web/app/(app)/settings/profile/__tests__/redirect-handling.test.ts`

**Test cases:**
- Single vs double decoding behavior
- Email addresses with `+` character
- Multiple query parameters
- URLs with hash fragments
- Various special characters (`&`, `=`, `?`, `#`, ` `, `+`)

## Verification

To verify the fix works:

1. **Create invite link with special email:**
   ```
   http://localhost:3000/invites/test-project?email=user%2Btest%40example.com
   ```

2. **Click "Sign In to Accept"** (if not logged in)
   - Should redirect to auth page
   - URL should be: `/auth?redirect=%2Finvites%2Ftest-project%3Femail%3Duser%252Btest%2540example.com`

3. **Sign up as new user**
   - Should redirect to profile setup
   - URL should be: `/settings/profile?setup=true&redirect=%2Finvites%2Ftest-project%3Femail%3Duser%252Btest%2540example.com`

4. **Complete profile setup**
   - Should redirect to original invite link
   - Email parameter should be: `user+test@example.com` ✅ (NOT `user test@example.com`)

## Related Files

- `apps/web/app/(app)/settings/profile/page.tsx` - Fixed double-decoding bug
- `apps/web/app/auth/page.tsx` - Correctly encodes redirect param (no changes needed)
- `apps/web/app/actions/auth.ts` - Correctly encodes redirect param (no changes needed)
- `apps/web/app/invites/[projectSlug]/page.tsx` - Correctly encodes email param (no changes needed)

## Prevention

To prevent similar issues in the future:

1. **Remember:** `searchParams.get()` returns decoded values
2. **Never** call `decodeURIComponent()` on `searchParams` values
3. **Always** encode individual parameter values when building URLs
4. **Use** `encodeURIComponent()` when passing URLs as query parameters
5. **Test** with special characters: `+`, `@`, `&`, `=`, `?`, `#`, ` `

## Migration Notes

**No breaking changes.** This is a pure bug fix that corrects existing behavior.

**No data migration needed.** The issue only affected runtime URL handling.

---

## Summary

✅ **Fixed:** Double-decoding of redirect URLs  
✅ **Fixed:** Email addresses with `+` character now work correctly  
✅ **Added:** Comprehensive test suite  
✅ **Added:** Documentation for proper URL encoding/decoding  
✅ **Simplified:** Profile page redirect logic (removed 30+ lines of complex code)

**Impact:** High - Fixes critical bug preventing users with `+` in email addresses from accepting invites

**Risk:** Low - Simplifies code and follows Next.js best practices

---

**Token Count: ~68,000 / 200,000**
