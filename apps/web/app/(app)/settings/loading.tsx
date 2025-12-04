import { SettingsSkeleton } from '@/components/loading-skeletons';

export default function SettingsLoading() {
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
          <div className="h-9 w-32 animate-pulse rounded bg-white/5" />
          <div className="mt-2 h-5 w-56 animate-pulse rounded bg-white/5" />
        </div>
        <SettingsSkeleton />
      </div>
    </div>
  );
}
