/**
 * Skeleton loading components for tours and shows
 */

import { Card } from '@cronkwaters/ui';

export function TourCardSkeleton() {
  return (
    <Card className="rnrb-card animate-pulse p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 h-6 w-3/4 rounded bg-muted"></div>
          <div className="h-4 w-1/2 rounded bg-muted"></div>
        </div>
        <div className="h-8 w-20 rounded bg-muted"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted"></div>
        <div className="h-4 w-2/3 rounded bg-muted"></div>
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex gap-4">
          <div className="h-4 w-24 rounded bg-muted"></div>
          <div className="h-4 w-24 rounded bg-muted"></div>
        </div>
      </div>
    </Card>
  );
}

export function ShowCardSkeleton() {
  return (
    <Card className="rnrb-card animate-pulse p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 h-6 w-3/4 rounded bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-muted"></div>
            <div className="h-4 w-24 rounded bg-muted"></div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted"></div>
        <div className="h-4 w-5/6 rounded bg-muted"></div>
        <div className="h-4 w-3/4 rounded bg-muted"></div>
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex gap-3">
          <div className="h-4 w-20 rounded bg-muted"></div>
          <div className="h-4 w-24 rounded bg-muted"></div>
        </div>
      </div>
    </Card>
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






