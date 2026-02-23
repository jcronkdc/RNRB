import {
  DashboardStatsSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from '@/components/loading-skeletons';

export default function InstructorAnalyticsLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo skeleton */}
        <div className="mb-8 flex flex-col items-center">
          <div className="h-14 w-36 animate-pulse rounded-lg bg-white/5" />
        </div>
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="mb-3 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-white/5" />
            <div>
              <div className="mb-1 h-3 w-32 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-52 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-72 animate-pulse rounded bg-white/5" />
        </div>
        {/* Time range */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
        </div>
        {/* Stats */}
        <DashboardStatsSkeleton />
        {/* Charts */}
        <div className="my-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/2 p-6">
            <div className="mb-4 h-6 w-40 animate-pulse rounded bg-white/5" />
            <ChartSkeleton />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/2 p-6">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-white/5" />
            <ChartSkeleton />
          </div>
        </div>
        {/* Student engagement table */}
        <div>
          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-white/5" />
          <TableSkeleton rows={8} columns={5} />
        </div>
      </div>
    </div>
  );
}
