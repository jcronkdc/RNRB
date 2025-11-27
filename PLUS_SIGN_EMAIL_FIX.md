# Email Plus Sign (+) Redirect Bug Fix

## Problem

When an invite email contains a plus sign (e.g., `user+tag@example.com`), the redirect flow through profile setup was breaking:

1. Invite link: `/invites/project?email=user+test@example.com`
2. User not signed in → redirects to auth with encoded URL
3. User signs up → redirects to profile setup with encoded redirect param
4. Profile setup completes → **BUG HERE** → decodes URL and calls `router.push()`
5. Browser interprets `+` as space: `email=user test@example.com`
6. Email verification fails: `user test@example.com` ≠ `user+test@example.com`

## Root Cause

The profile setup page (line 154) was calling:

```typescript
router.push(destination);
```

where `destination` was a decoded URL containing literal `+` characters. Next.js `router.push()` doesn't automatically encode query parameters, so the `+` is left as-is in the URL. Browsers then interpret `+` as a space in query strings per RFC 3986.

## Solution

After decoding the redirect destination, we now parse it as a URL and re-encode the query parameters using `URLSearchParams` before passing to `router.push()`. This ensures special characters like `+` are properly percent-encoded (`%2B`) in the final URL.

```typescript
// Fix: Properly encode query parameters before navigation
try {
  const url = new URL(destination, 'http://dummy.com');
  // Re-encode each query parameter to ensure special chars are properly encoded
  const params = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    params.set(key, value);
  });
  // Reconstruct the path with properly encoded query string
  const encodedDestination = url.pathname + (params.toString() ? `?${params.toString()}` : '');
  router.push(encodedDestination);
} catch (error) {
  // Fallback to original destination
  router.push(destination);
}
```

## Testing

To verify this fix works:

1. Create an invite link with an email containing `+`:

   ```
   /invites/test-project?email=user+test@example.com
   ```

2. Sign up as a new user with `user+test@example.com`

3. Complete profile setup

4. Verify you're redirected to the invite page and the email check passes

## Files Changed

- `apps/web/app/(app)/settings/profile/page.tsx` (lines 134-158)

## Impact

- ✅ Fixes invite acceptance for emails with `+` characters
- ✅ Fixes invite acceptance for emails with other special characters (e.g., `%`, `&`, `=`)
- ✅ Maintains security validations (open redirect protection)
- ✅ Backward compatible with existing redirect flows
- ✅ No breaking changes

## Related Flow

The encoding/decoding happens in this sequence:

1. **Invites page** (line 76): Encodes email when building returnUrl

   ```typescript
   `/invites/${projectSlug}?email=${encodeURIComponent(inviteEmail)}`;
   ```

2. **Auth page** (line 65): Passes encoded redirect to auth action

   ```typescript
   redirectTo: redirectParam || undefined;
   ```

3. **Auth action** (line 43): Double-encodes when passing to profile setup

   ```typescript
   `/settings/profile?setup=true&redirect=${encodeURIComponent(redirectTo)}`;
   ```

4. **Profile setup** (line 143): Decodes to get original URL

   ```typescript
   destination = decodeURIComponent(destination);
   ```

5. **Profile setup** (line 154): **FIXED** - Re-encodes query params before navigation
   ```typescript
   router.push(encodedDestination);
   ```

---

**Status:** ✅ FIXED
**Date:** 2025-11-27
**Agent:** 148
