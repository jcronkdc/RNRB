/**
 * Yjs Sync Provider over Ably
 *
 * Uses Ably pub/sub as the transport layer for Yjs document updates.
 * Yjs handles conflict resolution (CRDT). Ably handles message delivery.
 *
 * Features:
 * - Document sync via Yjs update protocol
 * - Awareness protocol (cursors, presence, selection)
 * - Late-joiner state sync via HTTP fallback
 * - Automatic reconnection
 * - Clean disconnection
 *
 * Architecture:
 *   Client A edits -> Yjs generates update -> Ably publishes -> Client B receives -> Yjs applies
 *   Late joiner -> HTTP GET /api/songs/:id/yjs -> applies full state -> then subscribes to Ably
 */

import type { Realtime, RealtimeChannel } from 'ably';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness';
import * as Y from 'yjs';

export interface YjsAblyProviderOptions {
  /** The Yjs document to sync */
  doc: Y.Doc;
  /** Ably Realtime client instance */
  ablyClient: Realtime;
  /** Channel name for this document (e.g., "song:abc123") */
  channelName: string;
  /** Song ID for HTTP state persistence */
  songId: string;
  /** Awareness instance for cursor/presence sync */
  awareness?: Awareness;
  /** Auth token cookie for HTTP requests */
  /** How often to persist state to server (ms). Default: 10000 */
  persistInterval?: number;
}

export class YjsAblyProvider {
  doc: Y.Doc;
  awareness: Awareness;

  private ablyClient: Realtime;
  private channel: RealtimeChannel;
  private songId: string;
  private persistInterval: number;
  private persistTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private isSynced = false;
  private pendingUpdates: Uint8Array[] = [];

  // Track whether we should persist (are we the "leader"?)
  private isLeader = false;
  private lastDocState: string = '';

  // Store listener references for proper cleanup
  private docUpdateHandler: ((update: Uint8Array, origin: unknown) => void) | null = null;
  private awarenessUpdateHandler:
    | ((changes: { added: number[]; updated: number[]; removed: number[] }) => void)
    | null = null;
  private awarenessLeaderHandler: (() => void) | null = null;

  constructor(options: YjsAblyProviderOptions) {
    this.doc = options.doc;
    this.ablyClient = options.ablyClient;
    this.songId = options.songId;
    this.persistInterval = options.persistInterval ?? 10000;

    // Set up awareness
    this.awareness = options.awareness ?? new Awareness(this.doc);

    // Get or create the Ably channel
    this.channel = this.ablyClient.channels.get(options.channelName);

    // Start syncing
    this.init();
  }

  private async init() {
    try {
      // Step 1: Load persisted state from server (for late joiners)
      await this.loadPersistedState();

      // Step 2: Subscribe to Ably for real-time updates
      await this.subscribeToUpdates();

      // Step 3: Set up local change listeners
      this.setupLocalListeners();

      // Step 4: Start periodic persistence
      this.startPersistence();

      // Step 5: Determine leader (first connected client persists)
      this.determineLeader();

      this.isSynced = true;

      // Apply any updates that arrived while we were loading
      for (const update of this.pendingUpdates) {
        Y.applyUpdate(this.doc, update, 'ably');
      }
      this.pendingUpdates = [];
    } catch (error) {
      console.error('[YjsAbly] Initialization error:', error);
    }
  }

  /**
   * Load the persisted Yjs document state from the server
   */
  private async loadPersistedState() {
    try {
      const response = await fetch(`/api/songs/${this.songId}/yjs`);
      if (!response.ok) return;

      const data = await response.json();
      if (data.hasState && data.documentState) {
        const stateUpdate = Uint8Array.from(atob(data.documentState), (c) => c.charCodeAt(0));
        Y.applyUpdate(this.doc, stateUpdate, 'server');
      }
    } catch (error) {
      console.warn('[YjsAbly] Failed to load persisted state:', error);
      // Non-fatal — we can still sync via Ably
    }
  }

  /**
   * Subscribe to Ably channel for document updates and awareness
   */
  private async subscribeToUpdates() {
    // Document updates
    await this.channel.subscribe('yjs-update', (message) => {
      if (this.isDestroyed) return;

      const update = Uint8Array.from(atob(message.data.update), (c) => c.charCodeAt(0));

      // Skip our own updates (Ably delivers to all subscribers including sender)
      if (message.clientId === this.ablyClient.auth.clientId) return;

      if (this.isSynced) {
        Y.applyUpdate(this.doc, update, 'ably');
      } else {
        this.pendingUpdates.push(update);
      }
    });

    // Awareness updates (cursors, presence)
    await this.channel.subscribe('yjs-awareness', (message) => {
      if (this.isDestroyed) return;
      if (message.clientId === this.ablyClient.auth.clientId) return;

      const update = Uint8Array.from(atob(message.data.update), (c) => c.charCodeAt(0));
      applyAwarenessUpdate(this.awareness, update, 'ably');
    });

    // State sync requests (when a new client needs the full state)
    await this.channel.subscribe('yjs-sync-request', async (message) => {
      if (this.isDestroyed) return;
      if (message.clientId === this.ablyClient.auth.clientId) return;

      // Respond with our full state
      const stateUpdate = Y.encodeStateAsUpdate(this.doc);
      const encoded = btoa(String.fromCharCode(...stateUpdate));

      this.channel.publish('yjs-sync-response', {
        update: encoded,
        targetClientId: message.clientId,
      });
    });

    // State sync responses
    await this.channel.subscribe('yjs-sync-response', (message) => {
      if (this.isDestroyed) return;

      // Only accept responses targeted at us
      if (message.data.targetClientId !== this.ablyClient.auth.clientId) return;

      const update = Uint8Array.from(atob(message.data.update), (c) => c.charCodeAt(0));
      Y.applyUpdate(this.doc, update, 'sync-response');
    });

    // Request a sync from any existing clients
    this.channel.publish('yjs-sync-request', {
      clientId: this.ablyClient.auth.clientId,
    });
  }

  /**
   * Set up listeners for local document and awareness changes
   */
  private setupLocalListeners() {
    // When the local doc changes, broadcast to Ably
    this.docUpdateHandler = (update: Uint8Array, origin: unknown) => {
      if (this.isDestroyed) return;
      // Don't re-broadcast updates we received from Ably or server
      if (origin === 'ably' || origin === 'server' || origin === 'sync-response') return;

      const encoded = btoa(String.fromCharCode(...update));
      this.channel.publish('yjs-update', { update: encoded });
    };
    this.doc.on('update', this.docUpdateHandler);

    // When awareness changes, broadcast to Ably
    this.awarenessUpdateHandler = ({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      if (this.isDestroyed) return;

      const changedClients = added.concat(updated).concat(removed);
      const awarenessUpdate = encodeAwarenessUpdate(this.awareness, changedClients);
      const encoded = btoa(String.fromCharCode(...awarenessUpdate));

      this.channel.publish('yjs-awareness', { update: encoded });
    };
    this.awareness.on('update', this.awarenessUpdateHandler);
  }

  /**
   * Persist the document state to the server periodically
   */
  private startPersistence() {
    this.persistTimer = setInterval(() => {
      if (this.isDestroyed || !this.isLeader) return;
      this.persistState();
    }, this.persistInterval);
  }

  /**
   * Determine if this client should be the persistence leader.
   * Simple strategy: the first client in the presence set is the leader.
   */
  private determineLeader() {
    // Check presence to see who's connected
    const states = this.awareness.getStates();
    const clientIds = Array.from(states.keys()).sort();

    // The lowest client ID is the leader
    this.isLeader = clientIds.length === 0 || clientIds[0] === this.doc.clientID;

    // Re-evaluate when awareness changes
    this.awarenessLeaderHandler = () => {
      const currentStates = this.awareness.getStates();
      const currentIds = Array.from(currentStates.keys()).sort();
      this.isLeader = currentIds.length === 0 || currentIds[0] === this.doc.clientID;
    };
    this.awareness.on('update', this.awarenessLeaderHandler);
  }

  /**
   * Persist the current document state to the server
   */
  async persistState() {
    if (this.isDestroyed) return;

    try {
      const stateUpdate = Y.encodeStateAsUpdate(this.doc);
      const stateVector = Y.encodeStateVector(this.doc);
      const encoded = btoa(String.fromCharCode(...stateUpdate));
      const encodedVector = btoa(String.fromCharCode(...stateVector));

      // Check if state actually changed
      if (encoded === this.lastDocState) return;
      this.lastDocState = encoded;

      // Extract human-readable content from the Yjs doc for the Song model
      const lyrics = this.doc.getText('lyrics')?.toString() || undefined;
      const title = this.doc.getText('title')?.toString() || undefined;

      await fetch(`/api/songs/${this.songId}/yjs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentState: encoded,
          stateVector: encodedVector,
          lyrics,
          title,
          activeUsers: Array.from(this.awareness.getStates().keys()).map(String),
        }),
      });
    } catch (error) {
      console.warn('[YjsAbly] Failed to persist state:', error);
    }
  }

  /**
   * Set local awareness state (cursor position, user info, etc.)
   */
  setAwarenessState(state: Record<string, unknown>) {
    this.awareness.setLocalStateField('user', state);
  }

  /**
   * Check if the provider is synced
   */
  get synced(): boolean {
    return this.isSynced;
  }

  /**
   * Clean up: unsubscribe, remove listeners, persist final state
   */
  async destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Persist final state before leaving
    if (this.isLeader) {
      await this.persistState();
    }

    // Clear persistence timer
    if (this.persistTimer) {
      clearInterval(this.persistTimer);
      this.persistTimer = null;
    }

    // Remove awareness state
    removeAwarenessStates(this.awareness, [this.doc.clientID], 'local');

    // Unsubscribe from Ably
    this.channel.unsubscribe();

    // Remove doc listeners (using stored references so they actually detach)
    if (this.docUpdateHandler) {
      this.doc.off('update', this.docUpdateHandler);
    }
    if (this.awarenessUpdateHandler) {
      this.awareness.off('update', this.awarenessUpdateHandler);
    }
    if (this.awarenessLeaderHandler) {
      this.awareness.off('update', this.awarenessLeaderHandler);
    }
  }
}
