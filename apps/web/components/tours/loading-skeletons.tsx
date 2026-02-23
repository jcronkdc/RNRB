/**
 * Skeleton loading components for tours and shows
 */

export function TourCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-white/5"></div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/5"></div>
        </div>
        <div className="h-8 w-20 animate-pulse rounded bg-white/5"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-white/5"></div>
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/5"></div>
      </div>
      <div className="mt-4 border-t border-white/5 pt-4">
        <div className="flex gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-white/5"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-white/5"></div>
        </div>
      </div>
    </div>
  );
}

export function ShowCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-white/5"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 animate-pulse rounded-full bg-white/5"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-white/5"></div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-white/5"></div>
        <div className="h-4 w-5/6 animate-pulse rounded bg-white/5"></div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/5"></div>
      </div>
      <div className="mt-4 border-t border-white/5 pt-4">
        <div className="flex gap-3">
          <div className="h-4 w-20 animate-pulse rounded bg-white/5"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-white/5"></div>
        </div>
      </div>
    </div>
  );
}

export function ToursListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <TourCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ShowsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ShowCardSkeleton key={i} />
      ))}
    </div>
  );
}
