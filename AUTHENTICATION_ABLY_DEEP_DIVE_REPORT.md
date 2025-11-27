# Authentication & Ably Deep Dive Analysis Report

**Date:** 2025-11-27  
**Scope:** Authentication pathways and Ably real-time connection patterns  
**Status:** Code Analysis Complete - Issues Identified

---

## EXECUTIVE SUMMARY

This report identifies **critical architectural issues** in both authentication flows and Ably real-time connection management. The codebase shows:

- **Authentication:** Multiple redirect encoding patterns, potential session fixation risks, and inconsistent auth checks
- **Ably:** **6+ different client creation patterns** causing connection leaks, resource exhaustion, and inconsistent behavior

---

## 🔴 CRITICAL ISSUES

### 1. MULTIPLE ABLY CLIENT CREATION PATTERNS (HIGH SEVERITY)

**Problem:** The codebase has **6 different patterns** for creating Ably clients, leading to:

- Multiple simultaneous connections per user
- Connection leaks and resource exhaustion
- Inconsistent error handling
- Token request flooding

**Locations:**

#### Pattern 1: Shared Client (`apps/web/hooks/use-ably-client.ts`)

```typescript
// ✅ GOOD: Shared singleton pattern
let sharedAblyClient: Realtime | null = null;
```

**Status:** Well-designed but **not used consistently**

#### Pattern 2: Activity Feed (`apps/web/hooks/use-activity-feed.ts:108`)

```typescript
// ❌ BAD: Creates new client per hook instance
const ablyClient = new Ably.Realtime({
  authCallback: async (tokenParams, callback) => { ... }
});
```

**Issue:** Creates separate connection, bypasses shared client

#### Pattern 3: Messages Hook (`apps/web/hooks/use-messages.ts:169`)

```typescript
// ❌ BAD: Uses NEXT_PUBLIC_ABLY_API_KEY directly
const client = new Ably.Realtime({
  key: ablyKey, // Direct API key usage
});
```

**Issue:**

- Uses public API key (security risk)
- Creates separate connection
- No token refresh mechanism

#### Pattern 4: Enhanced Presence (`apps/web/hooks/use-enhanced-presence.ts:127`)

```typescript
// ❌ BAD: Creates new client per presence instance
const ablyClient = new Ably.Realtime({
  authUrl: '/api/ably/token',
  clientId: userData.userId,
});
```

**Issue:** Creates separate connection for each presence channel

#### Pattern 5: Ably Provider (`apps/web/components/ably/ably-provider.tsx:181`)

```typescript
// ⚠️ PARTIAL: React provider pattern but creates new client
const ablyClient = new Ably.Realtime({
  authCallback: async (tokenParams, callback) => { ... }
});
```

**Issue:** Creates client at provider level, but hooks bypass it

#### Pattern 6: Ably Manager (`apps/web/lib/ably-manager.ts:57`)

```typescript
// ⚠️ UNUSED: Singleton manager exists but not integrated
this.client = new Ably.Realtime({
  key: apiKey, // Uses API key directly
});
```

**Issue:** Well-designed singleton but **not used anywhere**

**Impact:**

- User with 3 components = 3+ Ably connections
- Each connection = separate token request
- Token endpoint gets flooded
- Browser resource exhaustion (ERR_INSUFFICIENT_RESOURCES)

**Recommendation:**

1. Standardize on `use-ably-client.ts` shared client pattern
2. Remove all direct `new Ably.Realtime()` calls
3. Update all hooks to use `useAblyClient(userId)` hook
4. Delete unused `ably-manager.ts` or integrate it properly

---

### 2. CIRCUIT BREAKER DUPLICATION (MEDIUM SEVERITY)

**Problem:** Two separate circuit breaker implementations with different logic:

**Location 1:** `apps/web/lib/ably-circuit-breaker.ts`

- Global state management
- Used by some hooks

**Location 2:** `apps/web/components/ably/ably-provider.tsx:22-67`

- Inline circuit breaker
- Different thresholds and reset times

**Issues:**

- Inconsistent failure thresholds
- State not shared between implementations
- Can lead to false positives/negatives

**Recommendation:**

- Consolidate to single circuit breaker in `ably-circuit-breaker.ts`
- Import and use everywhere

---

### 3. AUTHENTICATION REDIRECT ENCODING (MEDIUM SEVERITY)

**Problem:** Multiple encoding/decoding patterns for redirect URLs:

**Location:** `apps/web/app/auth/page.tsx`

**Issues Found:**

1. **Line 22-24:** Redirect param encoding

```typescript
const forgotPasswordHref = `/auth/reset${
  redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''
}`;
```

✅ **GOOD:** Proper encoding

2. **Line 40:** Nested redirect encoding

```typescript
return `/settings/profile?setup=true&redirect=${encodeURIComponent(target)}`;
```

⚠️ **RISK:** If `target` is already encoded, double encoding occurs

3. **Line 68-72:** Manual redirect handling

```typescript
if (result.url) {
  window.location.href = result.url;
  return;
}
window.location.href = redirectTarget;
```

⚠️ **RISK:** Bypasses NextAuth redirect handling, potential for open redirect

**Additional Locations:**

- `apps/web/app/auth/reset/page.tsx:27` - Similar encoding pattern
- `apps/web/app/auth/callback/route.ts:22` - Error encoding

**Recommendation:**

- Centralize redirect URL sanitization
- Add validation to prevent double encoding
- Use NextAuth's built-in redirect handling where possible

---

### 4. SESSION TOKEN ROTATION LOGIC (LOW-MEDIUM SEVERITY)

**Location:** `packages/auth/src/auth.ts:141-156`

**Issue:** Token rotation happens every 60 minutes, but:

```typescript
const ROTATION_INTERVAL = 60 * 60 * 1000; // 1 hour
if (tokenWithExtras.rotatedAt && Date.now() - tokenWithExtras.rotatedAt > ROTATION_INTERVAL) {
  tokenWithExtras.jti = crypto.randomBytes(32).toString('hex');
  tokenWithExtras.rotatedAt = Date.now();
}
```

**Problems:**

- Rotation happens in JWT callback (on every request)
- No rate limiting on rotation
- Could cause token churn if many requests come in

**Recommendation:**

- Move rotation to scheduled job or on-demand refresh endpoint
- Add rate limiting

---

### 5. MIDDLEWARE AUTH CHECK (LOW SEVERITY)

**Location:** `apps/web/middleware.ts:103-109`

**Issue:** Uses cookie check instead of proper auth verification:

```typescript
const sessionCookie = request.cookies.get(
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'
);
const hasSession = !!sessionCookie;
```

**Problems:**

- Cookie presence ≠ valid session
- No token validation
- Edge Runtime limitation (can't use auth() directly)

**Recommendation:**

- Add token validation endpoint called from middleware
- Or accept limitation and add server-side validation on protected routes

---

## 🟡 MODERATE ISSUES

### 6. ABLY TOKEN ENDPOINT ERROR HANDLING

**Location:** `apps/web/app/api/ably/token/route.ts`

**Issues:**

- No rate limiting on token requests
- Multiple simultaneous requests can overwhelm endpoint
- No caching of tokens (each request creates new token)

**Recommendation:**

- Add rate limiting (e.g., 10 requests/minute per user)
- Cache tokens for short duration (30 seconds)
- Return 429 Too Many Requests when rate limited

---

### 7. CLEANUP INCONSISTENCIES

**Multiple Locations:**

**Good Example:** `apps/web/hooks/use-activity-feed.ts:204-232`

```typescript
return () => {
  mounted = false;
  if (connectionHandler && connectionClient) {
    try {
      connectionClient.connection.off('connected', connectionHandler);
    } catch {
      /* ignore */
    }
  }
  // ... proper cleanup
};
```

**Bad Example:** `apps/web/hooks/use-messages.ts:232-239`

```typescript
return () => {
  if (channelRef.current) {
    channelRef.current.unsubscribe();
  }
  if (ablyRef.current) {
    ablyRef.current.close();
  }
};
```

**Issue:** No error handling, no mounted check

**Recommendation:**

- Standardize cleanup pattern
- Always wrap in try/catch
- Check mounted state before cleanup

---

### 8. PRESENCE UPDATE FREQUENCY

**Location:** `apps/web/hooks/use-enhanced-presence.ts:254-319`

**Issue:** Activity detection triggers presence updates on every mouse/keyboard event:

```typescript
window.addEventListener('mousemove', resetActivityTimers);
window.addEventListener('keydown', resetActivityTimers);
window.addEventListener('click', resetActivityTimers);
window.addEventListener('scroll', resetActivityTimers);
```

**Problems:**

- High frequency presence updates
- Can flood Ably channels
- No debouncing

**Recommendation:**

- Debounce presence updates (max 1 update per 2 seconds)
- Batch updates
- Only update on significant state changes

---

## 🟢 MINOR ISSUES / OBSERVATIONS

### 9. INCONSISTENT ERROR HANDLING

- Some hooks use circuit breaker, others don't
- Different error messages for same failures
- Some errors are swallowed silently

### 10. TYPE SAFETY

- Some Ably types use `any`
- Missing null checks in some places
- Inconsistent error types

---

## 📊 IMPACT ASSESSMENT

### Authentication Issues

- **Severity:** Medium
- **User Impact:** Redirect failures, potential open redirect vulnerabilities
- **Frequency:** Low-Medium (affects auth flows)

### Ably Issues

- **Severity:** High
- **User Impact:** Connection failures, resource exhaustion, poor performance
- **Frequency:** High (affects all real-time features)

---

## 🎯 PRIORITY RECOMMENDATIONS

### Immediate (P0)

1. **Consolidate Ably client creation** - Use single shared client pattern
2. **Fix connection leaks** - Update all hooks to use shared client
3. **Add rate limiting** - Token endpoint rate limiting

### Short-term (P1)

4. **Consolidate circuit breakers** - Single implementation
5. **Fix redirect encoding** - Centralize and validate
6. **Improve cleanup** - Standardize cleanup patterns

### Medium-term (P2)

7. **Optimize presence updates** - Add debouncing
8. **Improve error handling** - Consistent patterns
9. **Add monitoring** - Track connection metrics

---

## 📍 FILE REFERENCE SUMMARY

### Authentication Files

- `packages/auth/src/auth.ts` - Core auth config
- `apps/web/app/auth/page.tsx` - Auth form with redirects
- `apps/web/middleware.ts` - Route protection
- `apps/web/lib/session.ts` - Session utilities

### Ably Files (Issues Found)

- `apps/web/hooks/use-ably-client.ts` - ✅ Shared client (GOOD)
- `apps/web/hooks/use-activity-feed.ts` - ❌ Creates own client
- `apps/web/hooks/use-messages.ts` - ❌ Creates own client
- `apps/web/hooks/use-enhanced-presence.ts` - ❌ Creates own client
- `apps/web/components/ably/ably-provider.tsx` - ⚠️ Provider pattern
- `apps/web/lib/ably-manager.ts` - ⚠️ Unused singleton
- `apps/web/lib/ably-circuit-breaker.ts` - ✅ Circuit breaker (GOOD)
- `apps/web/app/api/ably/token/route.ts` - Token endpoint

---

## 🔍 TESTING RECOMMENDATIONS

1. **Connection Leak Test:**
   - Open app with 5+ components using Ably
   - Check browser DevTools → Network → WS connections
   - Should see only 1 WebSocket connection

2. **Token Flood Test:**
   - Rapidly mount/unmount components using Ably
   - Monitor `/api/ably/token` endpoint
   - Should see rate limiting kick in

3. **Redirect Encoding Test:**
   - Test with URLs containing special characters: `user+test@example.com`
   - Test nested redirects
   - Verify no double encoding

4. **Cleanup Test:**
   - Navigate between pages rapidly
   - Check for console errors
   - Verify no connection leaks

---

## 📝 CONCLUSION

The codebase shows **architectural inconsistencies** in both authentication and Ably patterns. The most critical issue is **multiple Ably client creation patterns** leading to connection leaks and resource exhaustion.

**Key Actions:**

1. Standardize on shared Ably client (`use-ably-client.ts`)
2. Remove all direct `new Ably.Realtime()` calls
3. Consolidate circuit breakers
4. Add rate limiting to token endpoint
5. Centralize redirect URL handling

**Estimated Effort:**

- P0 Issues: 2-3 days
- P1 Issues: 1-2 days
- P2 Issues: 1 day

**Total:** ~4-6 days of focused refactoring

---

**Report Generated:** 2025-11-27  
**Next Steps:** Prioritize P0 issues, create implementation plan
