import {
  DashboardStatsSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from '@/components/loading-skeletons';

export default function LiveAnalyticsLoading() {
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
              <div className="mb-1 h-3 w-36 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-48 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-80 animate-pulse rounded bg-white/5" />
        </div>
        {/* Time range selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
        </div>
        {/* Stats */}
        <DashboardStatsSkeleton />
        {/* Viewer chart */}
        <div className="my-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-white/5" />
          <ChartSkeleton />
        </div>
        {/* Top streams table */}
        <div>
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-white/5" />
          <TableSkeleton rows={6} columns={6} />
        </div>
      </div>
    </div>
  );
}
