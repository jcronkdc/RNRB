import { TableSkeleton } from '@/components/loading-skeletons';

export default function MerchOrdersLoading() {
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
              <div className="mb-1 h-3 w-24 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-36 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-64 animate-pulse rounded bg-white/5" />
        </div>
        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          <div className="h-10 w-20 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
        </div>
        {/* Orders table */}
        <TableSkeleton rows={10} columns={6} />
      </div>
    </div>
  );
}
