# React Error #418 Hydration Fix - Complete

## Problem

You were experiencing React Error #418, which is a hydration mismatch error. This occurs when:
1. The server renders HTML with one value
2. The client renders React components with a different value
3. React detects the mismatch and throws an error

## Root Causes Identified

### 1. **Locale-Dependent Date Formatting**
   - `toLocaleDateString()`, `toLocaleTimeString()`, and `toLocaleString()` produce different output based on:
     - Server locale settings vs. browser locale settings
     - Timezone differences between server and client
     - Language/region formatting preferences

### 2. **Client-Side Only Features**
   - Components using hooks like `useRequireAuth` that depend on client-side session data
   - Browser APIs that don't exist during server-side rendering

## Solutions Implemented

### 1. Safe Date Formatting Utilities (`/apps/web/lib/format-date.ts`)

Created consistent date/time formatting functions that produce the same output on both server and client:

- `formatDate(date)` - Returns "YYYY-MM-DD" format
- `formatDateLong(date)` - Returns "MMM DD, YYYY" format (e.g., "Jan 15, 2024")
- `formatDateFull(date)` - Returns "Month DD, YYYY" format (e.g., "January 15, 2024")
- `formatTime(date)` - Returns "HH:MM AM/PM" format
- `formatDateTime(date)` - Returns "MMM DD, YYYY at HH:MM AM/PM"
- `formatRelativeTime(timestamp)` - Returns "X minutes/hours/days ago"
- `formatDuration(ms)` - Returns "MM:SS" or "HH:MM:SS" format

**Key Benefit:** These functions use consistent logic and don't depend on locale settings.

### 2. ClientOnly Wrapper Component (`/apps/web/components/client-only.tsx`)

Created a wrapper component that only renders children on the client:

```typescript
<ClientOnly fallback={<div>Loading...</div>}>
  <ComponentThatUsesClientOnlyFeatures />
</ClientOnly>
```

**Use Cases:**
- Components that use browser-only APIs (window, document, etc.)
- Components that depend on client-side state before hydration
- Any component causing hydration mismatches

### 3. Updated Components

Fixed the following components to use safe date formatting:

1. **`/apps/web/components/comment-thread.tsx`**
   - Changed: Custom date formatting logic
   - To: `formatRelativeTime()` utility

2. **`/apps/web/components/notification-bell.tsx`**
   - Changed: `toLocaleDateString()` in `formatTimestamp()`
   - To: `formatRelativeTime()` utility

3. **`/apps/web/components/project-chat.tsx`**
   - Changed: `toLocaleTimeString()` with options
   - To: `formatTime()` utility

4. **`/apps/web/components/ably/chat-room.tsx`**
   - Changed: `toLocaleTimeString()`
   - To: `formatTime()` utility

5. **`/apps/web/components/songwriting/voice-memo-recorder.tsx`**
   - Changed: `toLocaleDateString()` for display
   - To: ISO format `toISOString().split('T')[0]`
   - Changed: `toLocaleString()` for memo names
   - To: `toISOString()` for consistent naming

## Additional Files to Fix

There are still ~18 more files using locale-dependent formatting. Priority files to fix next:

- `/apps/web/app/(app)/settings/billing/BillingDashboard.tsx`
- `/apps/web/app/projects/[slug]/songs/[songId]/page.tsx`
- `/apps/web/app/(app)/setlists/page.tsx`
- `/apps/web/app/shows/page.tsx`
- `/apps/web/app/venues/page.tsx`

Run this command to find all remaining instances:
```bash
grep -r "toLocaleDateString\|toLocaleTimeString\|toLocaleString" apps/web --include="*.tsx" --include="*.ts"
```

## How to Use in Your Code

### ✅ DO THIS:
```typescript
import { formatDate, formatTime, formatRelativeTime } from '@/lib/format-date';

// For dates
<span>{formatDate(myDate)}</span>

// For times
<span>{formatTime(myTimestamp)}</span>

// For relative times (like "5 minutes ago")
<span>{formatRelativeTime(timestamp)}</span>
```

### ❌ DON'T DO THIS:
```typescript
// NEVER use these directly in components that can be SSR'd:
<span>{new Date(myDate).toLocaleDateString()}</span>
<span>{new Date(myTime).toLocaleTimeString()}</span>
<span>{new Date(myDateTime).toLocaleString()}</span>
```

### For Client-Only Components:
```typescript
import { ClientOnly } from '@/components/client-only';

<ClientOnly fallback={<Skeleton />}>
  <ComponentUsingWindowOrDocument />
</ClientOnly>
```

## Testing the Fix

1. Clear your browser cache and cookies
2. Open the app in an incognito/private window
3. Check the browser console for the error `#418`
4. If the error persists, check which component is causing it by:
   - Looking at the stack trace
   - Searching for date formatting in that component
   - Applying the appropriate fix

## Prevention

To prevent this error in the future:

1. **Never use locale-dependent methods in SSR'd components:**
   - `toLocaleDateString()`
   - `toLocaleTimeString()`
   - `toLocaleString()`
   
2. **Always use the utilities from `/lib/format-date.ts`**

3. **For truly client-specific content:**
   - Wrap in `<ClientOnly>`
   - Or use `suppressHydrationWarning` on specific elements (use sparingly)

4. **Add a linting rule** (optional):
   ```json
   {
     "rules": {
       "no-restricted-properties": [
         "error",
         {
           "object": "Date",
           "property": "toLocaleDateString",
           "message": "Use formatDate() from @/lib/format-date instead"
         },
         {
           "object": "Date",
           "property": "toLocaleTimeString",
           "message": "Use formatTime() from @/lib/format-date instead"
         },
         {
           "object": "Date",
           "property": "toLocaleString",
           "message": "Use formatDateTime() from @/lib/format-date instead"
         }
       ]
     }
   }
   ```

## References

- [React Error #418 Documentation](https://react.dev/errors/418)
- [Next.js SSR Hydration](https://nextjs.org/docs/messages/react-hydration-error)
- [Date Formatting Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

