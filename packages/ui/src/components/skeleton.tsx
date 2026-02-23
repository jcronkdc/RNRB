import * as React from 'react';

import { cn } from '../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shimmer = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-surface-muted/80',
        shimmer &&
          "after:bg-linear-to-r after:absolute after:inset-0 after:-translate-x-full after:from-transparent after:via-white/40 after:to-transparent after:content-[''] motion-safe:after:animate-[shimmer_1.8s_infinite]",
        className
      )}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type { SkeletonProps };
