/**
 * Skeleton loading components for tours and shows
 */

import { Card } from '@cronkwaters/ui';

export function TourCardSkeleton() {
  return (
    <Card className="rnrb-card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="h-8 w-20 bg-muted rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex gap-4">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      </div>
    </Card>
  );
}

export function ShowCardSkeleton() {
  return (
    <Card className="rnrb-card p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 bg-muted rounded-full"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex gap-3">
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
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





