export default function CreateLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
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
          <div className="h-5 w-64 animate-pulse rounded bg-white/5" />
        </div>
        {/* Create Options Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
              <div className="mb-4 h-14 w-14 animate-pulse rounded-xl bg-white/5" />
              <div className="h-7 w-40 animate-pulse rounded bg-white/5" />
              <div className="mt-2 h-5 w-full animate-pulse rounded bg-white/5" />
              <div className="mt-1 h-5 w-3/4 animate-pulse rounded bg-white/5" />
              <div className="mt-6 h-11 w-full animate-pulse rounded-lg bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
