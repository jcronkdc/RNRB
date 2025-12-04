import { UsersSkeleton } from '@/components/loading-skeletons';

export default function NetworkLoading() {
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
        {/* Stats skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-white/5" />
              <div className="h-8 w-16 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
        <UsersSkeleton count={9} />
      </div>
    </div>
  );
}
