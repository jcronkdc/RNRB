'use client';

/**
 * Safe Ably Wrapper Component
 *
 * Wraps components that use ably/react hooks to prevent crashes
 * when the Ably provider doesn't have a client available.
 *
 * Usage:
 * <SafeAblyWrapper fallback={<DisconnectedState />}>
 *   <ComponentUsingAblyHooks />
 * </SafeAblyWrapper>
 */

import { type ReactNode } from 'react';

import { useAblyAvailable } from './ably-provider';

interface SafeAblyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** If true, shows fallback when disconnected (not just unavailable) */
  requireConnected?: boolean;
}

/**
 * Wrapper that only renders children when Ably is available
 * Prevents crashes from ably/react hooks being called outside provider
 */
export function SafeAblyWrapper({
  children,
  fallback = null,
  requireConnected = false,
}: SafeAblyWrapperProps) {
  const { isAvailable, isConnected, hasError } = useAblyAvailable();

  // If Ably isn't available, don't render children that might use ably/react hooks
  if (!isAvailable || hasError) {
    return <>{fallback}</>;
  }

  // Optionally require connected state
  if (requireConnected && !isConnected) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Default fallback for when Ably is unavailable
 */
export function AblyUnavailableFallback({
  message = 'Real-time features unavailable',
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
      <div className="h-2 w-2 rounded-full bg-gray-400" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Connection status indicator fallback
 */
export function DisconnectedFallback() {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500">
      <div className="h-2 w-2 rounded-full bg-gray-400" />
      <span>Offline</span>
    </div>
  );
}
