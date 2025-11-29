/**
 * Ably Manager
 *
 * Centralized Ably connection management with:
 * - Connection pooling
 * - Circuit breaker integration
 * - Typed event subscriptions
 * - Batch message publishing
 *
 * Usage:
 * ```typescript
 * import { ablyManager, useAblyConnection } from '@/lib/ably-manager';
 *
 * // Initialize (once per app)
 * await ablyManager.initialize(apiKey, userId);
 *
 * // Subscribe to events
 * const unsubscribe = ablyManager.subscribe({
 *   channelId: 'chat:project:123',
 *   events: [{ event: 'message', callback: (msg) => {...} }]
 * });
 *
 * // Publish messages
 * ablyManager.publish('chat:project:123', 'message', { content: 'Hello' });
 * ```
 */

import Ably from 'ably';
import { useEffect, useState } from 'react';

import {
  canUseAbly,
  recordAblyFailure,
  recordAblySuccess,
  disableAblyPermanently,
} from './ably-circuit-breaker';

// ============================================================================
// TYPES
// ============================================================================

interface AblySubscription {
  channelId: string;
  events: Array<{
    event: string;
    callback: (message: Ably.Message) => void;
  }>;
}

interface PublishBatch {
  channelId: string;
  event: string;
  data: unknown;
}

// ============================================================================
// SINGLETON MANAGER
// ============================================================================

class AblyManager {
  private client: Ably.Realtime | null = null;
  private channels: Map<string, Ably.RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<() => void>> = new Map();
  private publishQueue: PublishBatch[] = [];
  private publishTimeout: ReturnType<typeof setTimeout> | null = null;
  private isInitialized = false;
  private userId: string | null = null;

  // Connection state
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed' = 'disconnected';
  private connectionListeners: Set<(state: string) => void> = new Set();

  /**
   * Initialize the Ably client
   */
  async initialize(apiKey: string, userId: string): Promise<boolean> {
    if (this.isInitialized && this.client) {
      return true;
    }

    if (!canUseAbly()) {
      console.log('[AblyManager] Circuit breaker open - not initializing');
      return false;
    }

    this.userId = userId;
    this.connectionState = 'connecting';
    this.notifyConnectionListeners();

    try {
      // Fetch initial token
      const token = await this.fetchToken();
      if (!token) {
        this.connectionState = 'failed';
        this.notifyConnectionListeners();
        return false;
      }

      this.client = new Ably.Realtime({
        authCallback: async (tokenParams, callback) => {
          if (!canUseAbly()) {
            callback(
              { code: 40000, statusCode: 400, message: 'Circuit breaker open' } as Ably.ErrorInfo,
              null
            );
            return;
          }
          const newToken = await this.fetchToken();
          if (newToken) {
            callback(null, newToken);
          } else {
            callback(
              { code: 40000, statusCode: 400, message: 'Failed to fetch token' } as Ably.ErrorInfo,
              null
            );
          }
        },
        clientId: userId,
        echoMessages: false,
        closeOnUnload: true,
        disconnectedRetryTimeout: 15000,
        suspendedRetryTimeout: 30000,
        transports: ['web_socket'],
        autoConnect: true,
      });

      // Set up connection listeners
      this.client.connection.on('connected', () => {
        this.connectionState = 'connected';
        this.isInitialized = true;
        recordAblySuccess();
        this.notifyConnectionListeners();
        console.log('[AblyManager] Connected');
      });

      this.client.connection.on('disconnected', () => {
        this.connectionState = 'disconnected';
        this.notifyConnectionListeners();
        console.warn('[AblyManager] Disconnected');
      });

      this.client.connection.on('failed', () => {
        this.connectionState = 'failed';
        recordAblyFailure('Connection failed');
        this.notifyConnectionListeners();
        console.error('[AblyManager] Connection failed');
      });

      return true;
    } catch (error) {
      console.error('[AblyManager] Initialization error:', error);
      recordAblyFailure('Initialization failed');
      this.connectionState = 'failed';
      this.notifyConnectionListeners();
      return false;
    }
  }

  /**
   * Fetch authentication token
   */
  private async fetchToken(): Promise<Ably.TokenRequest | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/ably/token', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });

      clearTimeout(timeoutId);

      if (response.status === 503) {
        disableAblyPermanently('ABLY_API_KEY not configured');
        return null;
      }

      if (response.status === 401) {
        console.log('[AblyManager] Not authenticated');
        return null;
      }

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const token = await response.json();
      recordAblySuccess();
      return token;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      recordAblyFailure(message);
      return null;
    }
  }

  /**
   * Get or create a channel
   */
  private getChannel(channelId: string): Ably.RealtimeChannel | null {
    if (!this.client) return null;

    let channel = this.channels.get(channelId);
    if (!channel) {
      channel = this.client.channels.get(channelId);
      this.channels.set(channelId, channel);
    }
    return channel;
  }

  /**
   * Subscribe to channel events
   */
  subscribe(options: AblySubscription): () => void {
    const { channelId, events } = options;
    const channel = this.getChannel(channelId);

    if (!channel) {
      console.warn('[AblyManager] Cannot subscribe - not initialized');
      return () => {};
    }

    const handlers: Array<{ event: string; handler: (msg: Ably.Message) => void }> = [];

    events.forEach(({ event, callback }) => {
      const handler = (message: Ably.Message) => callback(message);
      channel.subscribe(event, handler);
      handlers.push({ event, handler });
    });

    const unsubscribe = () => {
      handlers.forEach(({ event, handler }) => {
        channel.unsubscribe(event, handler);
      });
    };

    // Track subscription
    if (!this.subscriptions.has(channelId)) {
      this.subscriptions.set(channelId, new Set());
    }
    this.subscriptions.get(channelId)?.add(unsubscribe);

    return unsubscribe;
  }

  /**
   * Publish a message (batched for performance)
   */
  publish(channelId: string, event: string, data: unknown): void {
    this.publishQueue.push({ channelId, event, data });

    // Batch publish with small delay
    if (this.publishTimeout) {
      clearTimeout(this.publishTimeout);
    }

    this.publishTimeout = setTimeout(() => {
      this.flushPublishQueue();
    }, 50); // 50ms batching window
  }

  /**
   * Flush the publish queue
   */
  private async flushPublishQueue(): Promise<void> {
    if (this.publishQueue.length === 0) return;

    const batch = [...this.publishQueue];
    this.publishQueue = [];

    // Group by channel for efficiency
    const byChannel = new Map<string, PublishBatch[]>();
    batch.forEach((item) => {
      if (!byChannel.has(item.channelId)) {
        byChannel.set(item.channelId, []);
      }
      byChannel.get(item.channelId)?.push(item);
    });

    // Publish each channel's messages
    for (const [channelId, messages] of byChannel) {
      const channel = this.getChannel(channelId);
      if (!channel) continue;

      for (const msg of messages) {
        try {
          await channel.publish(msg.event, msg.data);
        } catch (error) {
          console.error('[AblyManager] Publish error:', error);
        }
      }
    }
  }

  /**
   * Add connection state listener
   */
  onConnectionChange(callback: (state: string) => void): () => void {
    this.connectionListeners.add(callback);
    // Immediately call with current state
    callback(this.connectionState);
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  /**
   * Notify all connection listeners
   */
  private notifyConnectionListeners(): void {
    this.connectionListeners.forEach((listener) => {
      listener(this.connectionState);
    });
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    // Unsubscribe all
    this.subscriptions.forEach((unsubs) => {
      unsubs.forEach((unsub) => unsub());
    });
    this.subscriptions.clear();
    this.channels.clear();

    // Close client
    if (this.client) {
      this.client.close();
      this.client = null;
    }

    this.isInitialized = false;
    this.connectionState = 'disconnected';
    this.notifyConnectionListeners();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const ablyManager = new AblyManager();

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * React hook for Ably connection state
 */
export function useAblyConnection() {
  const [connectionState, setConnectionState] = useState(ablyManager.getConnectionState());

  useEffect(() => {
    const unsubscribe = ablyManager.onConnectionChange((state) => {
      setConnectionState(state);
    });

    return unsubscribe;
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isDisconnected: connectionState === 'disconnected' || connectionState === 'failed',
    isFailed: connectionState === 'failed',
  };
}
