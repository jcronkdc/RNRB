/**
 * Collaborative Project Settings Hook
 *
 * Real-time settings sync with optimistic UI updates
 * Field-level locking to prevent conflicts
 * Ably presence + change broadcasting
 *
 * NOW USES: Shared Ably client from AblyProvider (NO separate connections!)
 *
 * Mycelial Pathway:
 * User edits field → Optimistic update → Ably broadcasts → Server saves → Other clients update
 */

import type Ably from 'ably';
import type { RealtimeChannel } from 'ably';
import { useEffect, useState, useCallback, useRef } from 'react';

import { useAblyClient } from './use-ably-client';

export type ProjectSettings = {
  name: string;
  description: string;
  tagline?: string;
  coverImage?: string;
  visibility: 'private' | 'org' | 'public';
};

type FieldLock = {
  field: keyof ProjectSettings;
  userId: string;
  userName: string;
  timestamp: number;
};

type SettingsChange = {
  field: keyof ProjectSettings;
  value: unknown;
  userId: string;
  userName: string;
  timestamp: number;
};

type UseCollaborativeSettingsOptions = {
  channelName: string;
  userId: string;
  userName: string;
  initialSettings: ProjectSettings;
  onUpdate: (settings: Partial<ProjectSettings>) => Promise<void>;
  enabled: boolean;
};

export function useCollaborativeSettings({
  channelName,
  userId,
  userName,
  initialSettings,
  onUpdate,
  enabled,
}: UseCollaborativeSettingsOptions) {
  const [settings, setSettings] = useState<ProjectSettings>(initialSettings);
  const [activeEditors, setActiveEditors] = useState<Map<string, string>>(new Map()); // userId -> userName
  const [fieldLocks, setFieldLocks] = useState<Map<keyof ProjectSettings, FieldLock>>(new Map());
  const [pendingChanges, setPendingChanges] = useState<Map<keyof ProjectSettings, SettingsChange>>(
    new Map()
  );

  // Use shared Ably client from AblyProvider (NO separate connections!)
  const { client: ablyClient, isConnected } = useAblyClient(enabled ? userId : undefined);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const saveTimerRef = useRef<Map<keyof ProjectSettings, NodeJS.Timeout>>(new Map());

  // Initialize channel when shared client is ready
  useEffect(() => {
    if (!enabled || !ablyClient || !isConnected) return;

    let mounted = true;

    try {
      const channel = ablyClient.channels.get(channelName);
      channelRef.current = channel;

      // Subscribe to settings changes
      channel.subscribe('setting-changed', (message: Ably.Message) => {
        if (!mounted) return;
        const change: SettingsChange = message.data;

        // Don't apply our own changes (already optimistically updated)
        if (change.userId === userId) return;

        setSettings((prev) => ({
          ...prev,
          [change.field]: change.value,
        }));

        // Remove pending change if it exists
        setPendingChanges((prev) => {
          const newMap = new Map(prev);
          newMap.delete(change.field);
          return newMap;
        });
      });

      // Subscribe to field locks
      channel.subscribe('field-locked', (message: Ably.Message) => {
        if (!mounted) return;
        const lock: FieldLock = message.data;
        setFieldLocks((prev) => new Map(prev).set(lock.field, lock));
      });

      channel.subscribe('field-unlocked', (message: Ably.Message) => {
        if (!mounted) return;
        const { field } = message.data;
        setFieldLocks((prev) => {
          const newMap = new Map(prev);
          newMap.delete(field);
          return newMap;
        });
      });

      // Presence tracking
      channel.presence.enter({ userName });

      channel.presence.subscribe('enter', (member: Ably.PresenceMessage) => {
        if (!mounted) return;
        setActiveEditors((prev) =>
          new Map(prev).set(member.clientId, member.data?.userName || 'Unknown')
        );
      });

      channel.presence.subscribe('leave', (member: Ably.PresenceMessage) => {
        if (!mounted) return;
        setActiveEditors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(member.clientId);
          return newMap;
        });

        // Release any field locks held by this user
        setFieldLocks((prev) => {
          const newMap = new Map(prev);
          for (const [field, lock] of newMap.entries()) {
            if (lock.userId === member.clientId) {
              newMap.delete(field);
            }
          }
          return newMap;
        });
      });
    } catch (error) {
      console.error('Collaborative settings error:', error);
    }

    // Cleanup - only unsubscribe, don't close shared client
    return () => {
      mounted = false;

      // Clear all save timers
      saveTimerRef.current.forEach((timer) => clearTimeout(timer));

      if (channelRef.current) {
        try {
          channelRef.current.presence.leave();
          channelRef.current.presence.unsubscribe();
          channelRef.current.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
    };
  }, [channelName, userId, userName, enabled, ablyClient, isConnected]);

  // Lock field when user starts editing
  const lockField = useCallback(
    (field: keyof ProjectSettings) => {
      if (!channelRef.current) return;

      const lock: FieldLock = {
        field,
        userId,
        userName,
        timestamp: Date.now(),
      };

      channelRef.current.publish('field-locked', lock);
      setFieldLocks((prev) => new Map(prev).set(field, lock));
    },
    [userId, userName]
  );

  // Unlock field when user stops editing
  const unlockField = useCallback((field: keyof ProjectSettings) => {
    if (!channelRef.current) return;

    channelRef.current.publish('field-unlocked', { field });
    setFieldLocks((prev) => {
      const newMap = new Map(prev);
      newMap.delete(field);
      return newMap;
    });
  }, []);

  // Update field with optimistic UI and debounced save
  const updateField = useCallback(
    (field: keyof ProjectSettings, value: unknown) => {
      // Optimistic update
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Track pending change
      const change: SettingsChange = {
        field,
        value,
        userId,
        userName,
        timestamp: Date.now(),
      };
      setPendingChanges((prev) => new Map(prev).set(field, change));

      // Clear existing save timer for this field
      const existingTimer = saveTimerRef.current.get(field);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Debounced save (2 seconds)
      const timer = setTimeout(async () => {
        try {
          // Save to server
          await onUpdate({ [field]: value });

          // Broadcast to collaborators
          if (channelRef.current) {
            await channelRef.current.publish('setting-changed', change);
          }

          // Remove from pending
          setPendingChanges((prev) => {
            const newMap = new Map(prev);
            newMap.delete(field);
            return newMap;
          });

          console.log(`✅ Saved ${field}:`, value);
        } catch (error) {
          console.error(`Failed to save ${field}:`, error);

          // Revert optimistic update on error
          setSettings((prev) => ({
            ...prev,
            [field]: initialSettings[field],
          }));
        }
      }, 2000);

      saveTimerRef.current.set(field, timer);
    },
    [userId, userName, onUpdate, initialSettings]
  );

  // Check if field is locked by another user
  const isFieldLocked = useCallback(
    (field: keyof ProjectSettings): boolean => {
      const lock = fieldLocks.get(field);
      return lock !== undefined && lock.userId !== userId;
    },
    [fieldLocks, userId]
  );

  // Get who is locking a field
  const getFieldLocker = useCallback(
    (field: keyof ProjectSettings): string | null => {
      const lock = fieldLocks.get(field);
      return lock && lock.userId !== userId ? lock.userName : null;
    },
    [fieldLocks, userId]
  );

  // Check if field has pending changes
  const isFieldPending = useCallback(
    (field: keyof ProjectSettings): boolean => {
      return pendingChanges.has(field);
    },
    [pendingChanges]
  );

  return {
    settings,
    isConnected,
    activeEditors: Array.from(activeEditors.entries()).map(([id, name]) => ({ id, name })),
    lockField,
    unlockField,
    updateField,
    isFieldLocked,
    getFieldLocker,
    isFieldPending,
  };
}
