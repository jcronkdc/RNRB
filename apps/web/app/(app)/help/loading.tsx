export default function HelpLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Logo skeleton */}
        <div className="mb-8 flex flex-col items-center">
          <div className="h-14 w-36 animate-pulse rounded-lg bg-white/5" />
        </div>
        {/* Header skeleton */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-10 w-48 animate-pulse rounded bg-white/5" />
          <div className="mx-auto h-6 w-96 animate-pulse rounded bg-white/5" />
        </div>
        {/* Search skeleton */}
        <div className="mx-auto mb-12 h-14 w-full max-w-xl animate-pulse rounded-xl bg-white/5" />
        {/* Help Categories Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/2 p-6">
              <div className="mb-4 h-12 w-12 animate-pulse rounded-lg bg-white/5" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-white/5" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 w-full animate-pulse rounded bg-white/5" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
