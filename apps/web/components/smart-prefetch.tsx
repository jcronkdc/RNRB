'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, ComponentProps, ReactNode } from 'react';

/**
 * SmartLink - Link component with intelligent prefetching
 *
 * Uses IntersectionObserver to prefetch routes only when they become visible,
 * reducing unnecessary network requests while maintaining fast navigation.
 *
 * Features:
 * - Viewport-based prefetching (prefetch when link enters viewport)
 * - Priority prefetching (immediate prefetch for critical links)
 * - Hover prefetching fallback (for non-visible links)
 * - Respects user's data-saver preferences
 */
type SmartLinkProps = ComponentProps<typeof Link> & {
  /**
   * Priority level for prefetching:
   * - 'high': Prefetch immediately when visible
   * - 'low': Prefetch with delay when visible
   * - 'hover': Only prefetch on hover (default for less important links)
   */
  priority?: 'high' | 'low' | 'hover';
  children: ReactNode;
};

export function SmartLink({ href, priority = 'low', children, ...props }: SmartLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const prefetchedRef = useRef(false);

  useEffect(() => {
    const link = linkRef.current;
    if (!link || priority === 'hover') return;

    // Check if user prefers reduced data usage
    if ('connection' in navigator) {
      const connection = navigator.connection as NetworkInformation;
      if (connection?.saveData) {
        return; // Don't prefetch if data saver is enabled
      }
    }

    // Create intersection observer for viewport-based prefetching
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefetchedRef.current) {
            const delay = priority === 'high' ? 0 : 150;

            setTimeout(() => {
              if (!prefetchedRef.current) {
                router.prefetch(href.toString());
                prefetchedRef.current = true;
              }
            }, delay);
          }
        });
      },
      {
        rootMargin: '50px', // Prefetch slightly before link enters viewport
        threshold: 0,
      }
    );

    observer.observe(link);

    return () => observer.disconnect();
  }, [href, priority, router]);

  // Hover prefetch for 'hover' priority
  const handleMouseEnter = () => {
    if (!prefetchedRef.current) {
      router.prefetch(href.toString());
      prefetchedRef.current = true;
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      onMouseEnter={priority === 'hover' ? handleMouseEnter : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * NetworkInformation type for Connection API
 */
interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
  downlink?: number;
}

/**
 * PrefetchOnHover - Wrapper that prefetches children links on hover
 * Useful for menus and dropdowns where links aren't immediately visible
 */
export function PrefetchOnHover({ children, hrefs }: { children: ReactNode; hrefs: string[] }) {
  const router = useRouter();
  const prefetchedRef = useRef<Set<string>>(new Set());

  const handleMouseEnter = () => {
    hrefs.forEach((href) => {
      if (!prefetchedRef.current.has(href)) {
        router.prefetch(href);
        prefetchedRef.current.add(href);
      }
    });
  };

  return <div onMouseEnter={handleMouseEnter}>{children}</div>;
}

/**
 * usePrefetch - Hook for programmatic prefetching
 */
export function usePrefetch() {
  const router = useRouter();
  const prefetchedRef = useRef<Set<string>>(new Set());

  const prefetch = (href: string) => {
    if (!prefetchedRef.current.has(href)) {
      router.prefetch(href);
      prefetchedRef.current.add(href);
    }
  };

  const prefetchMultiple = (hrefs: string[]) => {
    hrefs.forEach(prefetch);
  };

  return { prefetch, prefetchMultiple };
}

/**
 * PrefetchOnIdle - Prefetch routes during browser idle time
 * Perfect for prefetching likely navigation targets
 */
export function PrefetchOnIdle({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();

  useEffect(() => {
    if (!('requestIdleCallback' in window)) return;

    const idleCallback = window.requestIdleCallback(
      () => {
        hrefs.forEach((href) => {
          router.prefetch(href);
        });
      },
      { timeout: 2000 }
    );

    return () => window.cancelIdleCallback(idleCallback);
  }, [hrefs, router]);

  return null;
}
