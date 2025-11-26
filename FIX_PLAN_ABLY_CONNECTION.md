# FIX PLAN: Ably Connection Failure (Production Blocker)

**Created**: November 25, 2025  
**Priority**: 🚨 CRITICAL - SHOWSTOPPER  
**Status**: Ready to implement

---

## Problem Statement

The songwriting tool is completely unusable due to:
1. **"Connecting..."** indicator stuck forever
2. **6+ "Failed to create song" error toasts** spamming the UI
3. **Ably real-time service** failing to authenticate (10s timeouts)
4. **Users cannot create songs** - core functionality broken

---

## Root Cause Analysis

### Issue #1: Environment Variable Mismatch

**Location**: `ENV_TEMPLATE.md` line 44 vs `apps/web/app/api/ably/token/route.ts` line 6

```markdown
# ENV_TEMPLATE.md (WRONG)
NEXT_PUBLIC_ABLY_KEY="your-ably-key"
```

```typescript
// apps/web/app/api/ably/token/route.ts (EXPECTS)
const ablyApiKey = process.env.ABLY_API_KEY;
```

**Problem**: Variable name mismatch causes API route to always return 503 "ABLY_API_KEY is not configured"

### Issue #2: Song Auto-Creation on Page Load

**Location**: `apps/web/app/(app)/songwriting/page.tsx` lines 188-197

```typescript
// Create song on first load if user is authenticated
useEffect(() => {
  if (user && !songData.id) {
    createSong({
      title: songTitle,
      status: 'draft',
      visibility: 'private',
    }).catch(console.error);
  }
}, [user, songData.id]);
```

**Problem**: The dependency array `[user, songData.id]` causes this to run multiple times if either changes, potentially creating multiple songs or retrying on failure.

### Issue #3: Ably Provider Initialization

**Location**: `apps/web/components/ably/ably-provider.tsx` lines 29-38

The Ably client tries to connect to `/api/ably/token` which returns 503 because `ABLY_API_KEY` is not set, causing:
- Connection timeouts
- Infinite retry attempts
- "Connecting..." stuck forever

---

##  THE FIX (Clean, No Shortcuts)

### Step 1: Fix Environment Variable Documentation

**File**: `ENV_TEMPLATE.md`

**Change line 44 from:**
```markdown
NEXT_PUBLIC_ABLY_KEY="your-ably-key"
```

**To:**
```markdown
ABLY_API_KEY="your-ably-key-here"
```

**Why**: Match what the code actually expects

### Step 2: Verify Vercel Environment Variables

**Action**: Check if `ABLY_API_KEY` is set in Vercel production environment

**If missing**:
- Go to https://ably.com/dashboard
- Get API key
- Add to Vercel: `vercel env add ABLY_API_KEY`

### Step 3: Improve Ably Provider Error Handling

**File**: `apps/web/components/ably/ably-provider.tsx`

**Current behavior**: Silently fails and shows "Connecting..." forever

**Fix**: Add timeout and fallback

```typescript
useEffect(() => {
  // Only initialize if authenticated and shouldInit is true
  if (typeof window === 'undefined' || !shouldInit || !isAuthenticated || !session?.user?.id) {
    return;
  }

  // Add connection timeout
  const connectionTimeout = setTimeout(() => {
    console.warn('Ably connection timeout - continuing without real-time features');
    setHasError(true);
  }, 15000); // 15 second timeout

  try {
    const ablyClient = new Ably.Realtime({
      authUrl: '/api/ably/token',
      authMethod: 'GET',
      clientId: session.user.id,
      echoMessages: false,
      closeOnUnload: true,
      transportParams: {
        remainPresentFor: 60,
      },
    });

    // Handle connection events
    ablyClient.connection.on('connected', () => {
      clearTimeout(connectionTimeout);
      setHasError(false);
    });

    ablyClient.connection.on('failed', () => {
      clearTimeout(connectionTimeout);
      console.warn('Ably connection failed - real-time features disabled');
      setHasError(true);
    });

    ablyClient.connection.on('disconnected', () => {
      console.warn('Ably disconnected - attempting reconnect...');
    });

    setClient(ablyClient);

    return () => {
      clearTimeout(connectionTimeout);
      ablyClient.close();
    };
  } catch (error) {
    clearTimeout(connectionTimeout);
    console.warn('Ably client initialization failed:', error);
    setHasError(true);
    return undefined;
  }
}, [shouldInit, isAuthenticated, session?.user?.id]);
```

### Step 4: Fix Connection Status Component

**File**: `apps/web/components/ably/connection-status.tsx`

**Add timeout for "Connecting..." state:**

```typescript
'use client';

import { useConnectionStateListener } from 'ably/react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  useConnectionStateListener((stateChange) => {
    setIsConnected(stateChange.current === 'connected');
    if (stateChange.current === 'connected') {
      setConnectionTimeout(false);
    }
  });

  // Set timeout for stuck connections
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected) {
        setConnectionTimeout(true);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [isConnected]);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-green-500" />
        <span className="text-xs text-gray-400">Live</span>
      </div>
    );
  }

  if (connectionTimeout) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span className="text-xs text-yellow-500">Offline Mode</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <WifiOff className="h-4 w-4 text-gray-500" />
      <span className="text-xs text-gray-500">Connecting...</span>
    </div>
  );
}
```

### Step 5: Fix Song Creation Dependency Array

**File**: `apps/web/app/(app)/songwriting/page.tsx` lines 188-197

**Problem**: The dependency array could cause multiple creation attempts

**Fix**:
```typescript
// Create song on first load if user is authenticated
useEffect(() => {
  if (user && !songData.id) {
    createSong({
      title: songTitle,
      status: 'draft',
      visibility: 'private',
    }).catch((err) => {
      console.error('Failed to create initial song:', err);
      // Don't show toast here - useSongAutoSave handles error toasts
    });
  }
}, [user?.id, songData.id, createSong]); // More specific dependencies
```

### Step 6: Add Toast Deduplication

**File**: `apps/web/components/toast-notification.tsx`

**Add logic to prevent duplicate error toasts from stacking**

---

## Implementation Order

1. ✅ **Fix ENV_TEMPLATE.md** - Correct variable name
2. ✅ **Verify/Add ABLY_API_KEY in Vercel** - Check production environment
3. ✅ **Update Ably Provider** - Add connection timeout and better error handling
4. ✅ **Update Connection Status** - Show "Offline Mode" instead of stuck "Connecting..."
5. ✅ **Fix Song Creation Effect** - Prevent multiple creation attempts
6. ✅ **Add Toast Deduplication** - Prevent error spam

---

## Testing Checklist

After implementing fixes:

- [ ] "Connecting..." resolves to either "Live" or "Offline Mode" within 15 seconds
- [ ] No "Failed to create song" error toasts appear
- [ ] Song is created successfully on page load
- [ ] If Ably is down, app continues to work in offline mode
- [ ] Real-time features gracefully degrade when Ably unavailable
- [ ] Only ONE error toast shows per error type

---

## Expected Outcome

**Before Fix:**
- ❌ Stuck on "Connecting..." forever
- ❌ 6+ "Failed to create song" errors
- ❌ Cannot use app at all

**After Fix:**
- ✅ Shows "Live" (if Ably works) OR "Offline Mode" (if Ably down) within 15s
- ✅ Song creates successfully regardless of Ably status
- ✅ App fully functional even without real-time features
- ✅ Clean error messaging (max 1 toast per error)

---

## Ready to Implement?

All code changes identified. No shortcuts. Clean build approach. Ready for your approval to proceed with implementation.





