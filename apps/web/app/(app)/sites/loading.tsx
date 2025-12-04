export default function SitesLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
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
          <div className="h-5 w-80 animate-pulse rounded bg-white/5" />
        </div>
        {/* Site Preview skeleton */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="h-64 w-full animate-pulse bg-white/5" />
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-7 w-48 animate-pulse rounded bg-white/5" />
              <div className="h-9 w-28 animate-pulse rounded-lg bg-white/5" />
            </div>
            <div className="h-5 w-full animate-pulse rounded bg-white/5" />
            <div className="mt-1 h-5 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
        </div>
        {/* Template Selection skeleton */}
        <div className="mb-4 h-7 w-40 animate-pulse rounded bg-white/5" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <div className="h-40 w-full animate-pulse bg-white/5" />
              <div className="p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
