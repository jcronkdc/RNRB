'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnly - Prevents hydration mismatches for client-side only content
 * 
 * This component only renders its children after the component has mounted
 * on the client, preventing SSR hydration errors.
 * 
 * Use cases:
 * - Components that use browser-only APIs (window, document, localStorage)
 * - Content that must differ between server and client
 * - Third-party widgets that don't support SSR
 * 
 * @example
 * ```tsx
 * <ClientOnly fallback={<Skeleton />}>
 *   <ComponentUsingWindowAPI />
 * </ClientOnly>
 * ```
 * 
 * Note: Prefer using SSR-safe utilities (like formatDate) when possible.
 * Only use ClientOnly when truly necessary.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
