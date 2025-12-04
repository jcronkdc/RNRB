/**
 * Comprehensive Loading Skeleton Components
 *
 * Provides beautiful, contextual loading states that match the actual UI
 * Much better UX than showing generic spinners!
 */

import { cn } from '@cronkwaters/ui';

// Base skeleton component with shimmer animation
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-lg bg-white/5', className)} {...props} />;
}

// Revenue/Transaction skeleton
export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="text-right">
        <Skeleton className="ml-auto h-5 w-20" />
        <Skeleton className="ml-auto mt-1 h-3 w-16" />
      </div>
    </div>
  );
}

export function RevenueListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionSkeleton key={i} />
      ))}
    </div>
  );
}

// Revenue chart skeleton
export function ChartSkeleton() {
  return (
    <div className="h-40 w-full space-y-2">
      <div className="flex h-32 items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 60 + 40}%` }} />
        ))}
      </div>
      <div className="flex justify-between px-2">
        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
          <Skeleton key={i} className="h-3 w-4" />
        ))}
      </div>
    </div>
  );
}

// Feed/Post skeleton
export function PostSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      {/* Actions */}
      <div className="mt-4 flex gap-6 border-t border-white/5 pt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

// Message/Conversation skeleton
export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function InboxSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}

// Library/File skeleton
export function FileCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function LibrarySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <FileCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Masterclass/Course skeleton
export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function MasterclassSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Stats/Dashboard skeleton
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Project/Song skeleton
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function ProjectsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/5 py-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === 0 ? 'w-1/4' : i === columns - 1 ? 'w-20' : 'flex-1')}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4 border-b border-white/10 pb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-3', i === 0 ? 'w-1/4' : i === columns - 1 ? 'w-20' : 'flex-1')}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

// Full page skeleton
export function PageSkeleton({
  title = true,
  stats = false,
  content = 'grid',
}: {
  title?: boolean;
  stats?: boolean;
  content?: 'grid' | 'list' | 'table';
}) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      )}
      {stats && <DashboardStatsSkeleton />}
      {content === 'grid' && <ProjectsSkeleton />}
      {content === 'list' && <RevenueListSkeleton />}
      {content === 'table' && <TableSkeleton />}
    </div>
  );
}

// Notification skeleton
export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function NotificationsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

// Settings section skeleton
export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// User profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

// User card skeleton (for friends, discover, etc.)
export function UserCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      {/* Tags/instruments */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function UsersSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Simple user list skeleton (compact, for sidebars)
export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Calendar skeleton (month view)
export function CalendarSkeleton() {
  return (
    <div className="min-h-[600px] space-y-4">
      {/* Header - Days of week */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Skeleton key={day} className="h-8 rounded" />
        ))}
      </div>
      {/* Calendar grid - 5 weeks */}
      {Array.from({ length: 5 }).map((_, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div
              key={dayIndex}
              className="min-h-[100px] rounded-lg border border-white/5 bg-white/[0.02] p-2"
            >
              <Skeleton className="mb-2 h-5 w-6" />
              {/* Random events */}
              {Math.random() > 0.6 && <Skeleton className="mb-1 h-4 w-full rounded" />}
              {Math.random() > 0.7 && <Skeleton className="h-4 w-3/4 rounded" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Show/Event card skeleton
export function ShowCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function ShowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ShowCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// CREDITS / BILLING PAGE SKELETON
// ============================================

export function CreditsProgressBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
    </div>
  );
}

export function CreditsSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Hero Section */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Logo placeholder */}
          <div className="mb-8 flex flex-col items-center">
            <Skeleton className="h-16 w-40" />
            <Skeleton className="mt-4 h-8 w-64" />
            <Skeleton className="mt-2 h-5 w-32" />
          </div>
          {/* Header */}
          <div className="mb-4 h-1 w-16 rounded-full bg-white/10" />
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-9 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-96" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        {/* Plan Card */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="mt-1 h-4 w-40" />
              <div className="mt-2 flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
          {/* Usage Grid */}
          <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-6 md:grid-cols-4">
            <CreditsProgressBarSkeleton />
            <CreditsProgressBarSkeleton />
            <CreditsProgressBarSkeleton />
            <CreditsProgressBarSkeleton />
          </div>
        </div>

        {/* What Uses Credits Card */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-white/5 py-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Boxes */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-28" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="mb-2 h-4 w-full" />
            ))}
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-28" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="mb-2 h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STUDIO PAGE SKELETON
// ============================================

export function QuickActionCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div>
          <Skeleton className="mb-1 h-5 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export function StudioToolCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-1 h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

export function StudioSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header Section */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <Skeleton className="h-14 w-36" />
          </div>
          {/* Title */}
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-1 h-7 w-44" />
            </div>
          </div>
          <Skeleton className="h-5 w-80" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Quick Actions Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-36" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-4">
          <QuickActionCardSkeleton />
          <QuickActionCardSkeleton />
          <QuickActionCardSkeleton />
          <QuickActionCardSkeleton />
        </div>

        {/* Studio Tools Section */}
        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Skeleton className="mb-2 h-8 w-32" />
              <Skeleton className="h-5 w-56" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StudioToolCardSkeleton />
            <StudioToolCardSkeleton />
            <StudioToolCardSkeleton />
            <StudioToolCardSkeleton />
          </div>
        </div>

        {/* Studio Overview Card */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <Skeleton className="mb-4 h-9 w-64" />
          <Skeleton className="mb-6 h-5 w-full max-w-2xl" />
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
              <Skeleton className="mb-3 h-5 w-40" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="mb-2 h-4 w-full" />
              ))}
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <Skeleton className="mb-3 h-5 w-48" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="mb-2 h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COLLABORATION HUB SKELETON
// ============================================

export function CollaborationStatSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
      <Skeleton className="h-7 w-12" />
      <Skeleton className="mt-1 h-4 w-20" />
      <Skeleton className="mt-1 h-3 w-16" />
    </div>
  );
}

export function CollaborationSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Skeleton className="h-14 w-36" />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
              <div className="mb-2 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-9 w-48" />
              </div>
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <CollaborationStatSkeleton />
          <CollaborationStatSkeleton />
          <CollaborationStatSkeleton />
          <CollaborationStatSkeleton />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
              </div>
              {/* Activity items */}
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="mt-1 h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Who's Online */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Network Health */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="pt-2">
                  <Skeleton className="mb-2 h-3 w-12" />
                  <Skeleton className="mb-2 h-10 w-full rounded-lg" />
                  <Skeleton className="mb-2 h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MEET / VIDEO CALL SKELETON
// ============================================

export function MeetSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Skeleton className="h-14 w-36" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-1 h-7 w-40" />
            </div>
          </div>
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Meeting Options */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* New Meeting Card */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
            <Skeleton className="mb-4 h-14 w-14 rounded-xl" />
            <Skeleton className="mb-2 h-7 w-40" />
            <Skeleton className="mb-6 h-5 w-full" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* Join Meeting Card */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
            <Skeleton className="mb-4 h-14 w-14 rounded-xl" />
            <Skeleton className="mb-2 h-7 w-32" />
            <Skeleton className="mb-6 h-5 w-full" />
            <Skeleton className="mb-3 h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="mt-12">
          <Skeleton className="mb-4 h-7 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LIVE STREAMING SKELETON
// ============================================

export function LiveStreamSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Skeleton className="h-14 w-36" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1 h-7 w-36" />
            </div>
          </div>
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Live Now Section */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
              >
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <div className="mt-2 flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Streaming Card */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="mb-6 h-5 w-full max-w-xl" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-1 h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MERCH PAGE SKELETON
// ============================================

export function MerchProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-3 h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function MerchSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex flex-col items-center">
            <Skeleton className="h-14 w-36" />
          </div>
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1 h-7 w-32" />
            </div>
          </div>
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MerchProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MARKETPLACE SKELETON
// ============================================

export function MarketplaceListingSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-4 flex items-start gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="mb-2 h-4 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex flex-col items-center">
            <Skeleton className="h-14 w-36" />
          </div>
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-1 h-7 w-40" />
            </div>
          </div>
          <Skeleton className="h-5 w-72" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="ml-auto h-10 w-36 rounded-lg" />
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <MarketplaceListingSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPPORTUNITIES SKELETON
// ============================================

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-2/3" />
        </div>
      </div>
      <div className="flex items-center gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="ml-auto h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function OpportunitiesSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex flex-col items-center">
            <Skeleton className="h-14 w-36" />
          </div>
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-1 h-7 w-40" />
            </div>
          </div>
          <Skeleton className="h-5 w-80" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="ml-auto h-10 w-40 rounded-lg" />
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <OpportunityCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD SKELETON
// ============================================

export function DashboardWidgetSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-1 h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Skeleton className="h-14 w-36" />
        </div>

        {/* Welcome Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <DashboardWidgetSkeleton />
            <DashboardWidgetSkeleton />
          </div>
          <div className="space-y-6">
            <DashboardWidgetSkeleton />
            <DashboardWidgetSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
