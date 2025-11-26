/**
 * Optimized Ably Connection Manager
 * 
 * Features:
 * - Connection pooling and reuse
 * - Automatic reconnection with exponential backoff
 * - Channel subscription management
 * - Memory leak prevention
 * - Connection state monitoring
 * - Batch message publishing
 */

import Ably from 'ably';
import { useState, useEffect } from 'react';

type MessageCallback = (message: any) => void;
type ConnectionStateCallback = (state: Ably.ConnectionState) => void;

interface SubscriptionConfig {
  channelId: string;
  events: {
    event: string;
    callback: MessageCallback;
  }[];
}

class AblyConnectionManager {
  private static instance: AblyConnectionManager;
  private client: Ably.Realtime | null = null;
  private channels: Map<string, Ably.RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // channelId -> Set of eventNames
  private connectionStateCallbacks: Set<ConnectionStateCallback> = new Set();
  private isInitialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageQueue: Array<{ channelId: string; event: string; data: any }> = [];
  private publishInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AblyConnectionManager {
    if (!AblyConnectionManager.instance) {
      AblyConnectionManager.instance = new AblyConnectionManager();
    }
    return AblyConnectionManager.instance;
  }

  /**
   * Initialize Ably connection
   */
  async initialize(apiKey: string, clientId: string): Promise<void> {
    if (this.isInitialized && this.client) {
      return;
    }

    try {
      this.client = new Ably.Realtime({
        key: apiKey,
        clientId,
        closeOnUnload: true,
        disconnectedRetryTimeout: 15000,
        suspendedRetryTimeout: 30000,
        // Connection recovery for offline support
        recover: (lastConnectionDetails, cb) => {
          cb(true);
        },
        // Transport fallback
        transports: ['web_socket', 'xhr_polling'],
        // Auto-connect
        autoConnect: true,
      });

      // Monitor connection state
      this.client.connection.on('connected', () => {
        console.log('Ably connected');
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.notifyConnectionState('connected');
      });

      this.client.connection.on('disconnected', () => {
        console.warn('Ably disconnected');
        this.notifyConnectionState('disconnected');
        this.handleReconnection();
      });

      this.client.connection.on('suspended', () => {
        console.warn('Ably connection suspended');
        this.notifyConnectionState('suspended');
      });

      this.client.connection.on('failed', () => {
        console.error('Ably connection failed');
        this.notifyConnectionState('failed');
      });

      this.isInitialized = true;

      // Start batch publish interval
      this.startBatchPublish();
    } catch (error) {
      console.error('Failed to initialize Ably:', error);
      throw error;
    }
  }

  /**
   * Subscribe to channel events
   */
  subscribe(config: SubscriptionConfig): () => void {
    if (!this.client) {
      throw new Error('Ably client not initialized');
    }

    const { channelId, events } = config;

    // Get or create channel
    let channel = this.channels.get(channelId);
    if (!channel) {
      channel = this.client.channels.get(channelId);
      this.channels.set(channelId, channel);
      this.subscriptions.set(channelId, new Set());
    }

    // Subscribe to events
    const subscriptionSet = this.subscriptions.get(channelId)!;
    
    events.forEach(({ event, callback }) => {
      channel!.subscribe(event, callback);
      subscriptionSet.add(event);
    });

    // Return unsubscribe function
    return () => {
      events.forEach(({ event, callback }) => {
        channel?.unsubscribe(event, callback);
        subscriptionSet.delete(event);
      });

      // Clean up channel if no more subscriptions
      if (subscriptionSet.size === 0) {
        channel?.detach();
        this.channels.delete(channelId);
        this.subscriptions.delete(channelId);
      }
    };
  }

  /**
   * Publish message with batching for performance
   */
  publish(channelId: string, event: string, data: any, immediate = false): void {
    if (immediate) {
      this.publishImmediate(channelId, event, data);
    } else {
      // Add to queue for batch publishing
      this.messageQueue.push({ channelId, event, data });
    }
  }

  /**
   * Publish message immediately
   */
  private async publishImmediate(channelId: string, event: string, data: any): Promise<void> {
    if (!this.client) return;

    try {
      const channel = this.client.channels.get(channelId);
      await channel.publish(event, data);
    } catch (error) {
      console.error('Failed to publish message:', error);
      // Add to queue on failure
      this.messageQueue.push({ channelId, event, data });
    }
  }

  /**
   * Start batch publishing messages
   */
  private startBatchPublish(): void {
    if (this.publishInterval) return;

    // Publish queued messages every 100ms
    this.publishInterval = setInterval(() => {
      this.flushMessageQueue();
    }, 100);
  }

  /**
   * Flush message queue
   */
  private async flushMessageQueue(): Promise<void> {
    if (!this.client || this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    // Group messages by channel for batch publishing
    const messagesByChannel = messages.reduce((acc, msg) => {
      if (!acc[msg.channelId]) {
        acc[msg.channelId] = [];
      }
      acc[msg.channelId].push({ name: msg.event, data: msg.data });
      return acc;
    }, {} as Record<string, Array<{ name: string; data: any }>>);

    // Publish batched messages
    for (const [channelId, channelMessages] of Object.entries(messagesByChannel)) {
      try {
        const channel = this.client.channels.get(channelId);
        
        if (channelMessages.length === 1) {
          await channel.publish(channelMessages[0].name, channelMessages[0].data);
        } else {
          // Batch publish multiple messages at once
          await channel.publish(channelMessages);
        }
      } catch (error) {
        console.error(`Failed to publish batch to ${channelId}:`, error);
        // Re-add failed messages to queue
        channelMessages.forEach((msg) => {
          this.messageQueue.push({ channelId, event: msg.name, data: msg.data });
        });
      }
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.client && this.client.connection.state === 'disconnected') {
        this.client.connect();
      }
    }, delay);
  }

  /**
   * Monitor connection state
   */
  onConnectionStateChange(callback: ConnectionStateCallback): () => void {
    this.connectionStateCallbacks.add(callback);
    
    // Immediately notify current state
    if (this.client) {
      callback(this.client.connection.state);
    }

    return () => {
      this.connectionStateCallbacks.delete(callback);
    };
  }

  /**
   * Notify connection state change
   */
  private notifyConnectionState(state: Ably.ConnectionState): void {
    this.connectionStateCallbacks.forEach((callback) => callback(state));
  }

  /**
   * Get connection state
   */
  getConnectionState(): Ably.ConnectionState | null {
    return this.client?.connection.state || null;
  }

  /**
   * Cleanup and close connection
   */
  cleanup(): void {
    if (this.publishInterval) {
      clearInterval(this.publishInterval);
      this.publishInterval = null;
    }

    // Flush remaining messages
    this.flushMessageQueue();

    // Unsubscribe from all channels
    this.channels.forEach((channel) => {
      channel.detach();
    });

    this.channels.clear();
    this.subscriptions.clear();

    if (this.client) {
      this.client.close();
      this.client = null;
    }

    this.isInitialized = false;
  }

  /**
   * Get channel presence
   */
  async getPresence(channelId: string): Promise<Ably.PresenceMessage[]> {
    if (!this.client) return [];

    try {
      const channel = this.client.channels.get(channelId);
      const presence = await channel.presence.get();
      return presence;
    } catch (error) {
      console.error('Failed to get presence:', error);
      return [];
    }
  }

  /**
   * Enter channel presence
   */
  async enterPresence(channelId: string, data?: any): Promise<void> {
    if (!this.client) return;

    try {
      const channel = this.client.channels.get(channelId);
      await channel.presence.enter(data);
    } catch (error) {
      console.error('Failed to enter presence:', error);
    }
  }

  /**
   * Leave channel presence
   */
  async leavePresence(channelId: string): Promise<void> {
    if (!this.client) return;

    try {
      const channel = this.client.channels.get(channelId);
      await channel.presence.leave();
    } catch (error) {
      console.error('Failed to leave presence:', error);
    }
  }
}

export const ablyManager = AblyConnectionManager.getInstance();

/**
 * React Hook for Ably connection
 */
export function useAblyConnection() {
  const [state, setState] = useState<Ably.ConnectionState | null>(
    ablyManager.getConnectionState()
  );

  useEffect(() => {
    const unsubscribe = ablyManager.onConnectionStateChange((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  return {
    state,
    isConnected: state === 'connected',
    isDisconnected: state === 'disconnected' || state === 'suspended',
  };
}

