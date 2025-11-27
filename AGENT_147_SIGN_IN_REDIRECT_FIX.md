# Agent 147: Sign-In Redirect & Profile Setup UX Fix

**Agent:** 147 | **Previous Agent:** 146 | **Date:** 2025-11-27  
**Status:** ✅ **COMPLETE**

---

## Problem Summary

### Issue 1: Profile Setup UX (NEW - FIXED)

When new users signed up and were redirected to `/settings/profile?setup=true` for first-time profile setup, they saw the **full app layout** including:

- Sidebar navigation
- Top bar
- Command palette
- AI Assistant widget
- All app chrome

This created a **cluttered, unfocused experience** during initial onboarding when users should see a clean, minimal interface focused only on profile setup.

**Root Cause:** The `AppLayout` component used `usePathname()` which doesn't include query parameters, so it couldn't detect the `setup=true` parameter to provide a minimal layout.

### Issue 2: Sign-In Redirect (PREVIOUSLY FIXED BY AGENT 146)

After successful sign-in, users weren't being redirected to the dashboard. This was already fixed by Agent 146.

---

## Solution Implemented

### AppLayout Minimal Mode for Profile Setup

Modified `/apps/web/components/app-layout.tsx`:

1. **Added `useSearchParams()`** to read query parameters
2. **Added profile setup detection:**

   ```typescript
   const isProfileSetup = pathname === '/settings/profile' && searchParams.get('setup') === 'true';
   ```

3. **Added minimal layout mode:**

   ```typescript
   // Minimal layout for profile setup - clean, focused, no distractions
   if (isProfileSetup) {
     return (
       <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
         {children}
       </div>
     );
   }
   ```

4. **Wrapped in Suspense** to handle `useSearchParams()` boundary:
   ```typescript
   export function AppLayout(props: AppLayoutProps) {
     return (
       <Suspense fallback={<LoadingSpinner />}>
         <AppLayoutContent {...props} />
       </Suspense>
     );
   }
   ```

---

## What This Fixes

### Before (Cluttered)

```
┌─────────────────────────────────────────────┐
│ Top Bar with nav, search, notifications    │
├───────────┬─────────────────────────────────┤
│           │                                 │
│ Sidebar   │  Profile Setup Form             │
│ - Home    │  (competing with all the UI)    │
│ - Projects│                                 │
│ - Shows   │                                 │
│ - Tours   │                                 │
│ - Studio  │                                 │
│ - Library │                                 │
│           │                                 │
│           │  [AI Assistant Widget]          │
│           │  [Command Palette]              │
└───────────┴─────────────────────────────────┘
```

### After (Clean & Focused)

```
┌─────────────────────────────────────────────┐
│                                             │
│         Profile Setup Form                  │
│         (full width, centered, clean)       │
│                                             │
│         No distractions                     │
│         No navigation                       │
│         No extra widgets                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## User Flow

1. **New user signs up** at `/auth`
2. **Auto sign-in** with `isNewUser: true` flag
3. **Redirect** to `/settings/profile?setup=true`
4. **AppLayout detects** `setup=true` parameter
5. **Renders minimal layout** - only the profile form, no app chrome
6. **User completes profile**
7. **Redirect** to `/dashboard` with full app layout

---

## Files Modified

### `/apps/web/components/app-layout.tsx`

- Added `useSearchParams` import
- Added `Suspense` import
- Created `AppLayoutContent` component with setup detection
- Wrapped export in `Suspense` boundary
- Added minimal layout mode for profile setup

**Lines Changed:** ~30 lines  
**Breaking Changes:** None  
**Linter Errors:** 0

---

## Testing Checklist

### Manual Testing Required

1. **New User Sign-Up Flow:**
   - [ ] Go to `/auth`
   - [ ] Create new account
   - [ ] Verify redirect to `/settings/profile?setup=true`
   - [ ] **Verify NO sidebar navigation visible**
   - [ ] **Verify NO top bar visible**
   - [ ] **Verify clean, centered profile setup form**
   - [ ] Fill out profile information
   - [ ] Click "Save Profile"
   - [ ] Verify redirect to `/dashboard`
   - [ ] **Verify full app layout NOW appears** (sidebar, top bar, etc.)

2. **Existing User Profile Edit:**
   - [ ] Sign in as existing user
   - [ ] Go to `/settings/profile` (no `?setup=true`)
   - [ ] **Verify full app layout IS visible** (sidebar, top bar)
   - [ ] Edit profile
   - [ ] Save changes
   - [ ] Verify no redirect (stays on profile page)

3. **Direct URL Access:**
   - [ ] While signed in, manually visit `/settings/profile?setup=true`
   - [ ] **Verify minimal layout appears**
   - [ ] Change URL to `/settings/profile`
   - [ ] **Verify full layout appears**

### Edge Cases

4. **Session Loading State:**
   - [ ] Hard refresh on `/settings/profile?setup=true`
   - [ ] Verify loading spinner shows
   - [ ] Verify minimal layout renders after load

5. **Unauthenticated Access:**
   - [ ] Sign out
   - [ ] Try to access `/settings/profile?setup=true`
   - [ ] Verify redirect to `/auth`

---

## Technical Details

### Why Suspense?

`useSearchParams()` requires a Suspense boundary in Next.js App Router. Without it, you get:

```
Error: useSearchParams() should be wrapped in a suspense boundary
```

The Suspense fallback provides a loading state while the component initializes.

### Why Not Middleware?

We could detect `setup=true` in middleware, but that would:

1. Require passing state through URL or cookies
2. Add complexity to the middleware layer
3. Make the layout less self-contained

The current solution keeps the layout logic self-contained and easy to understand.

### Performance Impact

**Negligible.** The `useSearchParams()` call is very fast, and the Suspense boundary only shows during initial load (which already has a loading state).

---

## Future Enhancements

### Potential Improvements

1. **Skip Setup for Google OAuth Users:**
   - Pre-populate profile from Google data
   - Optional setup vs. required setup

2. **Progress Indicator:**
   - Show "Step 1 of 3" during setup
   - Guide users through multi-step onboarding

3. **Setup Wizard:**
   - Welcome screen
   - Profile setup
   - Preferences
   - Quick tour

4. **Skip for Now:**
   - Allow users to skip initial setup
   - Prompt them later with a banner

---

## Related Files

### Profile Setup Flow

- `/apps/web/app/auth/page.tsx` - Sign-up form (sets `isNewUser: true`)
- `/apps/web/app/actions/auth.ts` - Auth actions (handles `isNewUser` flag)
- `/packages/auth/src/auth.ts` - NextAuth config (manages `profileCompleted`)
- `/apps/web/app/(app)/settings/profile/page.tsx` - Profile setup page
- `/packages/db/prisma/schema.prisma` - User model (has `profileCompleted` field)

### Layout System

- `/apps/web/components/app-layout.tsx` - Main layout (NOW detects setup mode)
- `/apps/web/components/sidebar-nav.tsx` - Sidebar (hidden during setup)
- `/apps/web/components/top-bar.tsx` - Top bar (hidden during setup)

---

## Verification

### Expected Behavior

✅ **New users see clean, focused profile setup**  
✅ **Existing users see full app layout when editing profile**  
✅ **No layout "flash" or hydration errors**  
✅ **Smooth transition after profile completion**

### What to Look For

❌ **Red Flags:**

- Sidebar visible during setup
- Top bar visible during setup
- AI Assistant widget during setup
- Layout shifts or flashing
- Suspense fallback stuck loading

✅ **Good Signs:**

- Clean, centered form during setup
- Full layout after completion
- Smooth transitions
- No console errors

---

## Rollback Plan

If issues occur, revert these changes:

```bash
git checkout HEAD~1 -- apps/web/components/app-layout.tsx
```

The previous version works but shows cluttered UI during setup. Not ideal, but functional.

---

## Summary

This fix improves the **first-time user experience** by providing a clean, focused interface during profile setup. No more distracting sidebars, navigation, or widgets when users are trying to complete their initial onboarding.

**Impact:**

- Better UX for new users
- Less cognitive load during setup
- Professional, polished onboarding flow
- No performance impact
- No breaking changes

**Status:** ✅ **Ready for Testing**

---

**Token Count: ~42,000 / 200,000 (21% used)**
