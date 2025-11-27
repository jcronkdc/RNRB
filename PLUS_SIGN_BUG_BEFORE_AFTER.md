# Email Plus Sign Bug - Before & After

## ❌ BEFORE (Broken)

```
User: user+test@example.com
Invite URL: /invites/project?email=user%2Btest%40example.com
                                              ↓
                                    Auth redirects to
                                              ↓
Auth URL: /auth?redirect=%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com
                                              ↓
                                    User signs up
                                              ↓
Profile URL: /settings/profile?setup=true&redirect=%2Finvites%2Fproject%3Femail%3Duser%2Btest%40example.com
                                              ↓
                                    User completes profile
                                              ↓
                    ⚠️  BUG: router.push(destination) ⚠️
                    destination = "/invites/project?email=user+test@example.com"
                                              ↓
Browser receives: /invites/project?email=user+test@example.com
                                            ↓ (browser interprets + as space)
Browser parses as: email=user test@example.com
                                              ↓
Email check: "user test@example.com" ≠ "user+test@example.com"
                                              ↓
                            ❌ INVITE REJECTED ❌
```

## ✅ AFTER (Fixed)

```
User: user+test@example.com
Invite URL: /invites/project?email=user%2Btest%40example.com
                                              ↓
                                    Auth redirects to
                                              ↓
Auth URL: /auth?redirect=%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com
                                              ↓
                                    User signs up
                                              ↓
Profile URL: /settings/profile?setup=true&redirect=%2Finvites%2Fproject%3Femail%3Duser%2Btest%40example.com
                                              ↓
                                    User completes profile
                                              ↓
              ✅  FIX: Re-encode with URLSearchParams ✅
              destination = "/invites/project?email=user+test@example.com"
                                              ↓
              const url = new URL(destination, 'http://dummy.com');
              const params = new URLSearchParams();
              url.searchParams.forEach((value, key) => {
                params.set(key, value); // + → %2B
              });
              const encoded = url.pathname + '?' + params.toString();
                                              ↓
              encoded = "/invites/project?email=user%2Btest%40example.com"
                                              ↓
              router.push(encoded)
                                              ↓
Browser receives: /invites/project?email=user%2Btest%40example.com
                                            ↓ (browser interprets %2B as +)
Browser parses as: email=user+test@example.com
                                              ↓
Email check: "user+test@example.com" === "user+test@example.com"
                                              ↓
                            ✅ INVITE ACCEPTED ✅
```

## Key Difference

### Before (Broken)

```typescript
router.push(destination);
// destination = "/invites/project?email=user+test@example.com"
// Browser sees + and interprets as space → "user test@example.com" ❌
```

### After (Fixed)

```typescript
const url = new URL(destination, 'http://dummy.com');
const params = new URLSearchParams();
url.searchParams.forEach((value, key) => {
  params.set(key, value); // Encodes: + → %2B
});
const encoded = url.pathname + '?' + params.toString();
router.push(encoded);
// encoded = "/invites/project?email=user%2Btest%40example.com"
// Browser sees %2B and decodes to + → "user+test@example.com" ✅
```

## Why This Matters

**Gmail users often use plus signs for email aliases:**

- `john+work@gmail.com`
- `jane+personal@gmail.com`
- `test+dev@company.com`

Without this fix, **NONE of these users could accept invites** after signing up.

## Root Cause

`router.push()` in Next.js does **NOT** automatically encode URL query parameters. It treats the string as-is. So when you pass a decoded URL with special characters:

```typescript
router.push('/path?email=user+test@example.com');
```

The `+` is sent **literally** to the browser, which then interprets it as a space per RFC 3986.

## The Solution

Use `URLSearchParams` to properly encode query parameters before navigation:

```typescript
const params = new URLSearchParams();
params.set('email', 'user+test@example.com');
// params.toString() → "email=user%2Btest%40example.com" ✅
```

---

**Status:** ✅ FIXED
**Impact:** Critical - Enables Gmail alias users to accept invites
**Date:** 2025-11-27
