# URL Encoding - The CORRECT Fix

**Agent:** 148  
**Date:** November 27, 2025  
**Status:** ✅ **VERIFIED CORRECT**

---

## The Correct Implementation

The file `apps/web/app/(app)/settings/profile/page.tsx` currently has the **CORRECT** implementation using the URL constructor:

```typescript
try {
  const url = new URL(destination, 'http://placeholder.com');
  const reEncodedPath = url.pathname + url.search + url.hash;
  router.push(reEncodedPath);
} catch (error) {
  console.warn('[PROFILE] Failed to parse redirect URL:', error);
  router.push('/dashboard');
}
```

---

## Why This Is Correct

### Key Insight: searchParams.get() Decodes ONE Level

When you call `searchParams.get('redirect')`, Next.js/React decodes the parameter value **once**:

```
URL: ?redirect=%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com
                           ↓ searchParams.get() decodes ONCE
Result: /invites/project?email=user%2Btest%40example.com
                                       ↑ Still %2B (not literal +)
```

**Important:** The query parameters within the redirect URL are STILL encoded (`%2B`, `%40`), just one level less than before.

---

## Why Manual Re-Encoding Would Be WRONG

If we manually split and re-encode with `encodeURIComponent`:

```typescript
// ❌ WRONG APPROACH
queryString.split('&').forEach(pair => {
  const [key, value = ''] = pair.split('=');
  const encodedValue = encodeURIComponent(value); // DOUBLE-ENCODES!
  // value is "user%2Btest%40example.com"
  // encodedValue becomes "user%252Btest%2540example.com" ❌❌❌
});
```

**Result:** `%2B` → `%252B` (double-encoded!) which breaks the URL.

---

## Why URL Constructor Works

The URL constructor **parses** the URL and preserves the encoding:

```typescript
const url = new URL('/invites/project?email=user%2Btest%40example.com', 'http://placeholder.com');
// url.search = "?email=user%2Btest%40example.com" ✅
// Encoding is preserved correctly!
```

The URL object:
1. Parses the input URL
2. Correctly identifies what's encoded and what's not
3. Preserves the encoding when you access `.pathname`, `.search`, `.hash`
4. Does NOT double-encode

---

## Test Results

### Test: What happens after searchParams.get()?

**Input URL:**  
`?redirect=%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com`

**After searchParams.get('redirect'):**  
`/invites/project?email=user%2Btest%40example.com`  
(Note: Still has `%2B`, not literal `+`)

**Manual re-encoding (WRONG):**  
`/invites/project?email=user%252Btest%2540example.com`  
❌ Double-encoded!

**URL constructor (CORRECT):**  
`/invites/project?email=user%2Btest%40example.com`  
✅ Preserves correct encoding!

---

## The Complete Picture

```
Step 1: User clicks invite link
┌────────────────────────────────────────────────────────────┐
│ /auth?signup=true&redirect=%2Finvites%2Fproject%3F...     │
│                                                            │
│ redirect param is double-encoded (once for being a query  │
│ param, once for the nested query string)                  │
└────────────────────────────────────────────────────────────┘
                        ↓
Step 2: Auth page → Profile setup
┌────────────────────────────────────────────────────────────┐
│ /settings/profile?setup=true&redirect=%2Finvites%2F...    │
│                                                            │
│ redirect param still double-encoded                        │
└────────────────────────────────────────────────────────────┘
                        ↓
Step 3: Profile page reads searchParams.get('redirect')
┌────────────────────────────────────────────────────────────┐
│ /invites/project?email=user%2Btest%40example.com          │
│                                                            │
│ ONE level of decoding happened (by searchParams.get)      │
│ Query params are still encoded: %2B, %40                  │
└────────────────────────────────────────────────────────────┘
                        ↓
Step 4: Use URL constructor to preserve encoding
┌────────────────────────────────────────────────────────────┐
│ const url = new URL(destination, 'http://placeholder.com');│
│ router.push(url.pathname + url.search + url.hash);        │
│                                                            │
│ URL constructor preserves the encoding correctly           │
│ Result: /invites/project?email=user%2Btest%40example.com  │
└────────────────────────────────────────────────────────────┘
                        ↓
Step 5: Browser parses final URL
┌────────────────────────────────────────────────────────────┐
│ Invite page receives: email=user+test@example.com         │
│                                                            │
│ Browser decodes %2B → +, %40 → @                          │
│ Perfect! ✅                                                │
└────────────────────────────────────────────────────────────┘
```

---

## Conclusion

The **current implementation** using `new URL()` is **CORRECT** and should NOT be changed.

### Why It Works:
1. ✅ Parses the URL correctly
2. ✅ Preserves existing encoding
3. ✅ Does NOT double-encode
4. ✅ Handles edge cases gracefully

### Why Manual Re-Encoding Would Fail:
1. ❌ Would double-encode already-encoded characters
2. ❌ `%2B` would become `%252B`
3. ❌ Browser would decode to wrong characters
4. ❌ Email addresses would be corrupted

---

**The code is already correct. No changes needed to the encoding logic.**

---

**Token Count:** 94,800 / 200,000 (47.4% used)  
**Status:** ✅ **VERIFIED - Current implementation is correct**

