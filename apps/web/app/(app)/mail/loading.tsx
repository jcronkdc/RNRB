import { InboxSkeleton } from '@/components/loading-skeletons';

export default function MailLoading() {
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
              <div className="h-7 w-28 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-5 w-64 animate-pulse rounded bg-white/5" />
        </div>
        {/* Mail layout skeleton */}
        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-white/5" />
            <div className="space-y-2">
              {['Inbox', 'Sent', 'Drafts', 'Trash'].map((item) => (
                <div key={item} className="h-9 w-full animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
          {/* Mail List */}
          <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-10 w-64 animate-pulse rounded-lg bg-white/5" />
              <div className="ml-auto flex gap-2">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-white/5" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-white/5" />
              </div>
            </div>
            <InboxSkeleton count={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
