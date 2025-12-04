import { InboxSkeleton } from '@/components/loading-skeletons';

export default function MessagesLoading() {
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
              <div className="mb-1 h-3 w-20 animate-pulse rounded bg-white/5" />
              <div className="h-7 w-32 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-52 animate-pulse rounded bg-white/5" />
        </div>
        {/* Messages layout skeleton */}
        <div className="flex gap-6">
          {/* Conversations list */}
          <div className="w-80 shrink-0 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-white/5" />
            <InboxSkeleton count={8} />
          </div>
          {/* Message view */}
          <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex h-[600px] flex-col">
              <div className="mb-4 flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-white/5" />
                <div>
                  <div className="h-5 w-32 animate-pulse rounded bg-white/5" />
                  <div className="mt-1 h-3 w-24 animate-pulse rounded bg-white/5" />
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="h-10 flex-1 animate-pulse rounded-lg bg-white/5" />
                <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
