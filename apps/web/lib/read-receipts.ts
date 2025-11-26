/**
 * Read Receipts Manager with Batching
 * 
 * Features:
 * - Batch read receipt updates to reduce database writes
 * - Debounced updates (only when user stops scrolling)
 * - Intersection Observer for visible messages
 * - Automatic sync with server
 * - Memory-efficient tracking
 */

import { useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

interface ReadReceiptOptions {
  channelId: string;
  userId: string;
  onMarkAsRead?: (messageIds: string[]) => void;
}

class ReadReceiptManager {
  private static instance: ReadReceiptManager;
  private pendingReceipts: Map<string, Set<string>> = new Map(); // channelId -> Set of messageIds
  private syncTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 2000; // 2 seconds

  private constructor() {}

  static getInstance(): ReadReceiptManager {
    if (!ReadReceiptManager.instance) {
      ReadReceiptManager.instance = new ReadReceiptManager();
    }
    return ReadReceiptManager.instance;
  }

  /**
   * Mark message as read
   */
  markAsRead(channelId: string, messageId: string): void {
    if (!this.pendingReceipts.has(channelId)) {
      this.pendingReceipts.set(channelId, new Set());
    }
    
    this.pendingReceipts.get(channelId)!.add(messageId);
    
    // Schedule sync
    this.scheduleSyncDebounced();
  }

  /**
   * Mark multiple messages as read
   */
  markMultipleAsRead(channelId: string, messageIds: string[]): void {
    if (!this.pendingReceipts.has(channelId)) {
      this.pendingReceipts.set(channelId, new Set());
    }
    
    const channelReceipts = this.pendingReceipts.get(channelId)!;
    messageIds.forEach(id => channelReceipts.add(id));
    
    // Schedule sync
    this.scheduleSyncDebounced();
  }

  /**
   * Schedule sync with debouncing
   */
  private scheduleSyncDebounced = debounce(() => {
    this.syncPendingReceipts();
  }, this.BATCH_DELAY);

  /**
   * Sync pending receipts to server
   */
  private async syncPendingReceipts(): Promise<void> {
    if (this.pendingReceipts.size === 0) return;

    const receiptsToSync = new Map(this.pendingReceipts);
    this.pendingReceipts.clear();

    try {
      // Batch update all channels
      const promises = Array.from(receiptsToSync.entries()).map(
        async ([channelId, messageIds]) => {
          if (messageIds.size === 0) return;

          await fetch('/api/chat/read-receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelId,
              messageIds: Array.from(messageIds),
            }),
          });
        }
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to sync read receipts:', error);
      
      // Re-add failed receipts back to queue
      receiptsToSync.forEach((messageIds, channelId) => {
        if (!this.pendingReceipts.has(channelId)) {
          this.pendingReceipts.set(channelId, new Set());
        }
        const existingReceipts = this.pendingReceipts.get(channelId)!;
        messageIds.forEach(id => existingReceipts.add(id));
      });
      
      // Retry after delay
      setTimeout(() => this.syncPendingReceipts(), 5000);
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    await this.syncPendingReceipts();
  }

  /**
   * Get pending receipt count
   */
  getPendingCount(): number {
    let total = 0;
    this.pendingReceipts.forEach((ids) => {
      total += ids.size;
    });
    return total;
  }
}

export const readReceiptManager = ReadReceiptManager.getInstance();

/**
 * React Hook for tracking visible messages and marking as read
 */
export function useReadReceipts({ channelId, userId, onMarkAsRead }: ReadReceiptOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleMessagesRef = useRef<Set<string>>(new Set());
  const observedElementsRef = useRef<Map<Element, string>>(new Map()); // element -> messageId

  // Initialize Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageId = observedElementsRef.current.get(entry.target);
          if (!messageId) return;

          if (entry.isIntersecting) {
            // Message is visible
            if (!visibleMessagesRef.current.has(messageId)) {
              visibleMessagesRef.current.add(messageId);
              
              // Mark as read after 1 second of visibility
              setTimeout(() => {
                if (visibleMessagesRef.current.has(messageId)) {
                  readReceiptManager.markAsRead(channelId, messageId);
                  onMarkAsRead?.([messageId]);
                }
              }, 1000);
            }
          } else {
            // Message is no longer visible
            visibleMessagesRef.current.delete(messageId);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // 50% of message must be visible
      }
    );

    return () => {
      observerRef.current?.disconnect();
      observedElementsRef.current.clear();
    };
  }, [channelId, onMarkAsRead]);

  /**
   * Observe a message element
   */
  const observeMessage = useCallback((element: Element | null, messageId: string) => {
    if (!element || !observerRef.current) return;

    // Unobserve previous element with same ID
    observedElementsRef.current.forEach((id, el) => {
      if (id === messageId && el !== element) {
        observerRef.current?.unobserve(el);
        observedElementsRef.current.delete(el);
      }
    });

    // Observe new element
    observedElementsRef.current.set(element, messageId);
    observerRef.current.observe(element);
  }, []);

  /**
   * Unobserve a message element
   */
  const unobserveMessage = useCallback((element: Element) => {
    if (!observerRef.current) return;
    
    const messageId = observedElementsRef.current.get(element);
    if (messageId) {
      visibleMessagesRef.current.delete(messageId);
      observedElementsRef.current.delete(element);
      observerRef.current.unobserve(element);
    }
  }, []);

  /**
   * Force sync pending receipts
   */
  const syncReceipts = useCallback(async () => {
    await readReceiptManager.forceSync();
  }, []);

  return {
    observeMessage,
    unobserveMessage,
    syncReceipts,
  };
}

/**
 * Batch mark messages as read
 */
export async function batchMarkMessagesAsRead(
  channelId: string,
  messageIds: string[]
): Promise<void> {
  if (messageIds.length === 0) return;

  try {
    await fetch('/api/chat/read-receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId,
        messageIds,
      }),
    });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    throw error;
  }
}



