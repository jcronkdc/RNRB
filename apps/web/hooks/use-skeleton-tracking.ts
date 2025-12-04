'use client';

/**
 * useSkeletonTracking Hook
 *
 * Automatically track skeleton → content transition performance
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading } = useQuery(...);
 *   useSkeletonTracking('MyComponent', isLoading);
 *
 *   if (isLoading) return <MySkeleton />;
 *   return <MyContent data={data} />;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';

export function useSkeletonTracking(componentName: string, isLoading: boolean) {
  const startTimeRef = useRef<number | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Skip if not in browser or already tracked
    if (typeof window === 'undefined' || hasTrackedRef.current) return;

    // Start timing when loading begins
    if (isLoading && startTimeRef.current === null) {
      startTimeRef.current = performance.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️  Skeleton started: ${componentName}`);
      }
    }

    // End timing when loading completes
    if (!isLoading && startTimeRef.current !== null) {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;

      // Mark as tracked
      hasTrackedRef.current = true;

      // Log performance
      if (process.env.NODE_ENV === 'development') {
        const emoji = duration < 200 ? '🟢' : duration < 500 ? '🟡' : '🔴';
        console.log(`${emoji} Skeleton → Content: ${componentName} (${duration.toFixed(0)}ms)`);

        // Warn if slow
        if (duration > 1000) {
          console.warn(
            `⚠️ Slow skeleton transition: ${componentName} took ${duration.toFixed(0)}ms`
          );
        }
      }

      // Send to analytics in production
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        // Example: Send to your analytics
        // window.gtag?.('event', 'skeleton_transition', {
        //   component: componentName,
        //   duration,
        //   category: 'performance',
        // });
      }

      // Reset for potential re-renders
      startTimeRef.current = null;
    }
  }, [componentName, isLoading]);
}

/**
 * Alternative: Simpler hook that just logs when skeleton is shown
 */
export function useSkeletonLogger(componentName: string, isLoading: boolean) {
  useEffect(() => {
    if (isLoading && process.env.NODE_ENV === 'development') {
      console.log(`🎨 Showing skeleton: ${componentName}`);
    }
  }, [componentName, isLoading]);
}

/**
 * Hook to measure time to first meaningful paint (skeleton appearance)
 */
export function useSkeletonFMP(componentName: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const paintTime = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🎨 Skeleton painted: ${componentName} at ${paintTime.toFixed(0)}ms`);
    }

    // Mark the paint time
    performance.mark(`skeleton-${componentName}-paint`);
  }, [componentName]);
}

export default useSkeletonTracking;
