# UX Polish Audit - Rock N' Roll Basement

**Date:** December 3, 2025  
**Focus:** Loading, Error, and Empty States

---

## Executive Summary

| State Type         | Component Exists | Usage Rate          | Status          |
| ------------------ | ---------------- | ------------------- | --------------- |
| **Loading States** | ✅ Yes           | 78/100+ files (78%) | 🟢 Good         |
| **Error States**   | ✅ Yes           | 77/100+ files (77%) | 🟢 Good         |
| **Empty States**   | ✅ Yes           | 3/100+ files (3%)   | 🔴 **Critical** |

### Key Findings:

1. **Empty States Component Exists** but is only used in 3 files:
   - `apps/web/app/(app)/library/page.tsx`
   - `apps/web/app/(app)/messages/page.tsx`
   - `apps/web/app/(app)/songs/page.tsx`

2. **Many pages have custom empty states** (reinventing the wheel):
   - Tours page - custom empty state
   - Shows calendar - NO empty state
   - Feed page - custom empty state
   - Explore page - custom empty state

3. **Inconsistent patterns** across the app:
   - Some use custom inline markup
   - Some use nothing at all
   - Only 3 use the reusable component

---

## Priority Fixes

### High Priority (User-Facing, High Traffic)

| Page              | Missing State                      | Impact                     | Fix Priority |
| ----------------- | ---------------------------------- | -------------------------- | ------------ |
| `/shows/calendar` | Empty state                        | High - main gig feature    | **P0**       |
| `/tours`          | Uses custom (should use component) | Medium - code duplication  | **P1**       |
| `/feed`           | Uses custom                        | Medium - social engagement | **P1**       |
| `/explore`        | Uses custom                        | Medium - discovery         | **P1**       |
| `/discover`       | Uses custom                        | Medium - user growth       | **P1**       |
| `/social/friends` | Unknown                            | Medium - social            | **P2**       |
| `/marketplace`    | Unknown                            | Medium - revenue           | **P2**       |
| `/masterclasses`  | Unknown                            | Medium - revenue           | **P2**       |

### Medium Priority (Feature Pages)

| Page             | Missing State | Impact                       |
| ---------------- | ------------- | ---------------------------- |
| `/setlists`      | Unknown       | Medium - performance feature |
| `/collaboration` | Unknown       | Medium - core feature        |
| `/revenue`       | Unknown       | Low - power users only       |
| `/opportunities` | Unknown       | Low - future feature         |

### Low Priority (Settings, Admin)

| Page           | Missing State | Impact              |
| -------------- | ------------- | ------------------- |
| `/settings/*`  | Partial       | Low - rare use      |
| `/labs/*`      | Unknown       | Low - experimental  |
| `/affiliate/*` | Unknown       | Low - niche feature |

---

## Recommended Pattern

### 1. Use the Existing Component

```typescript
import { EmptyState, LoadingState } from '@/components/empty-states';

// Loading
if (loading) {
  return <LoadingState message="Loading shows..." />;
}

// Error
if (error) {
  return (
    <EmptyState
      type="error"
      title="Failed to load shows"
      description={error.message}
      actionLabel="Try Again"
      onAction={retry}
    />
  );
}

// Empty
if (shows.length === 0) {
  return (
    <EmptyState
      type="projects" // or relevant type
      title="No shows yet"
      description="Create your first show to start tracking gigs"
      actionLabel="Create Show"
      actionHref="/shows/new"
    />
  );
}
```

### 2. Add New Types if Needed

Current types in `empty-states.tsx`:

- `projects`
- `tracks`
- `library`
- `search`
- `collaborations`
- `messages`
- `analytics`
- `error`
- `offline`

**Add these:**

- `shows` - For gig calendar
- `tours` - For tour management
- `setlists` - For setlist builder
- `marketplace` - For services marketplace
- `masterclasses` - For courses

---

## Quick Wins (Can Fix in <5min Each)

1. **Shows Calendar** - Add empty state for no shows
2. **Tours Page** - Replace custom empty state with component
3. **Feed Page** - Replace custom empty state with component
4. **Explore Page** - Replace custom empty state with component

---

## Standards Going Forward

### Rule 1: Always Handle 3 States

Every list/data page MUST handle:

1. **Loading** - Show `<LoadingState />` or skeleton
2. **Error** - Show `<EmptyState type="error" />`
3. **Empty** - Show `<EmptyState type={relevant} />`

### Rule 2: Use the Component

DON'T reinvent empty states. Use `<EmptyState />`.

### Rule 3: Make it Helpful

Empty states should:

- Explain WHY it's empty
- Show HOW to fill it
- Provide a CTA button

**Bad:**

```typescript
{items.length === 0 && <div>No items</div>}
```

**Good:**

```typescript
{items.length === 0 && (
  <EmptyState
    type="projects"
    title="No projects yet"
    description="Create your first project to start collaborating"
    actionLabel="Create Project"
    actionHref="/projects/new"
  />
)}
```

---

## Implementation Plan

### Phase 1: Critical Fixes (Today)

1. Add empty state to shows calendar
2. Standardize tours page
3. Standardize feed page

### Phase 2: Feature Pages (Tomorrow)

4. Fix explore, discover, marketplace
5. Fix social pages (friends, messages)
6. Fix masterclasses

### Phase 3: Audit Remaining (This Week)

7. Check all /app/(app) pages
8. Ensure 100% coverage

---

## Success Metrics

- ✅ 100% of list pages have empty states
- ✅ 0 custom empty state implementations (all use component)
- ✅ Consistent UX across entire app
- ✅ Users know what to do when starting fresh

---

**Next Steps:** Apply fixes to P0 and P1 pages.
