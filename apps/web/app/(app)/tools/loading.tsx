export default function ToolsLoading() {
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
              <div className="mb-1 h-3 w-28 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-36 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-80 animate-pulse rounded bg-white/5" />
        </div>
        {/* Tools Grid skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-white/5" />
                <div>
                  <div className="h-5 w-28 animate-pulse rounded bg-white/5" />
                  <div className="mt-1 h-3 w-20 animate-pulse rounded bg-white/5" />
                </div>
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-white/5" />
              <div className="mt-4 flex gap-2">
                <div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
                <div className="h-5 w-12 animate-pulse rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
