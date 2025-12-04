import { ToursListSkeleton } from '@/components/tours/loading-skeletons';

export default function ToursLoading() {
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
              <div className="h-7 w-40 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-72 animate-pulse rounded bg-white/5" />
        </div>
        {/* Tabs skeleton */}
        <div className="mb-8 flex gap-2">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="ml-auto h-10 w-36 animate-pulse rounded-lg bg-white/5" />
        </div>
        <ToursListSkeleton count={6} />
      </div>
    </div>
  );
}
