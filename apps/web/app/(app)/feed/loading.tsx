import { FeedSkeleton } from '@/components/loading-skeletons';

export default function FeedLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Logo skeleton */}
        <div className="mb-8 flex flex-col items-center">
          <div className="h-14 w-36 animate-pulse rounded-lg bg-white/5" />
        </div>
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="mb-4 h-1 w-12 rounded-full bg-white/10" />
          <div className="h-9 w-28 animate-pulse rounded bg-white/5" />
          <div className="mt-2 h-5 w-52 animate-pulse rounded bg-white/5" />
        </div>
        {/* Post composer skeleton */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/5" />
            <div className="flex-1">
              <div className="h-20 w-full animate-pulse rounded-lg bg-white/5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex gap-2">
              <div className="h-8 w-8 animate-pulse rounded bg-white/5" />
              <div className="h-8 w-8 animate-pulse rounded bg-white/5" />
              <div className="h-8 w-8 animate-pulse rounded bg-white/5" />
            </div>
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
          </div>
        </div>
        <FeedSkeleton count={5} />
      </div>
    </div>
  );
}
