/**
 * Shared Ably Client Hook
 *
 * SOLVES: Multiple simultaneous Ably connections causing token timeouts
 *
 * HOW IT WORKS:
 * - This hook consumes the shared client from AblyProvider context
 * - There is ONLY ONE Ably connection for the entire app
 * - AblyProvider (in layout.tsx) creates and manages the connection
 * - All hooks use this single shared connection
 *
 * IMPORTANT: Do NOT create new Ably.Realtime instances anywhere!
 * Always use this hook or useAblyClientContext from AblyProvider.
 */

import type { Realtime } from 'ably';

import { useAblyClientContext } from '@/components/ably/ably-provider';

type AblyStatus = 'disconnected' | 'connecting' | 'connected' | 'unavailable' | 'error';

/**
 * Hook to use shared Ably client from AblyProvider
 *
 * @param userId - Optional user ID (for backwards compatibility, but client is already initialized with user from session)
 * @returns The shared Ably client and connection status
 *
 * @example
 * ```tsx
 * const { client, isConnected, status, error } = useAblyClient(userId);
 *
 * if (!client || !isConnected) return <Loading />;
 *
 * // Use the shared client
 * const channel = client.channels.get('my-channel');
 * ```
 */
export function useAblyClient(userId?: string | undefined) {
  // Get the shared client from AblyProvider context
  // This is the ONLY Ably client in the entire app
  const context = useAblyClientContext();

  // If userId is not provided, return disconnected state
  // This preserves backwards compatibility with hooks that conditionally enable Ably
  if (!userId) {
    return {
      client: null,
      status: 'disconnected' as AblyStatus,
      error: null,
      isConnected: false,
      isAvailable: false,
    };
  }

  return {
    client: context.client,
    status: context.status,
    error: context.error,
    isConnected: context.isConnected,
    isAvailable: context.isAvailable,
  };
}

/**
 * Force close the shared Ably client (for testing or manual cleanup)
 * @deprecated This is a no-op now. The client is managed by AblyProvider.
 */
export function closeSharedAblyClient() {
  console.warn(
    '[useAblyClient] closeSharedAblyClient is deprecated - client is managed by AblyProvider'
  );
}
