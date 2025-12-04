export default function LabsLoading() {
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
              <div className="mb-1 h-3 w-20 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-36 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-72 animate-pulse rounded bg-white/5" />
        </div>
        {/* Featured Card skeleton */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 animate-pulse rounded-xl bg-white/5" />
            <div className="flex-1">
              <div className="h-7 w-64 animate-pulse rounded bg-white/5" />
              <div className="mt-2 h-5 w-full max-w-xl animate-pulse rounded bg-white/5" />
              <div className="mt-4 h-10 w-40 animate-pulse rounded-lg bg-white/5" />
            </div>
          </div>
        </div>
        {/* Lab Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 h-10 w-10 animate-pulse rounded-lg bg-white/5" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-white/5" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-white/5" />
              <div className="mt-4 h-9 w-28 animate-pulse rounded-lg bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
