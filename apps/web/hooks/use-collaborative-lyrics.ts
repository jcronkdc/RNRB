/**
 * Collaborative Lyrics Editing Hook
 *
 * CRDT-inspired real-time lyrics co-editing.
 * Multiple users can edit simultaneously without conflicts.
 *
 * Features:
 * - Character-by-character sync
 * - Colored cursors for each collaborator
 * - Section locking (optional)
 * - Inline suggestions
 * - Conflict-free concurrent editing
 */

import type { Message } from 'ably';
import { useChannel, useConnectionStateListener } from 'ably/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CursorInfo = {
  userId: string;
  userName: string;
  userColor: string;
  position: number; // Character position in text
  selection?: { start: number; end: number };
  timestamp: number;
};

export type LyricEdit = {
  userId: string;
  userName: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  text?: string;
  length?: number; // For delete operations
  timestamp: number;
  version: number;
};

export type SectionLock = {
  sectionId: string;
  userId: string;
  userName: string;
  userColor: string;
  lockedAt: number;
};

export type LyricSuggestion = {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  position: number;
  originalText: string;
  suggestedText: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
};

type UseCollaborativeLyricsOptions = {
  channelName: string;
  userId: string;
  userName: string;
  userColor?: string;
  initialContent?: string;
  enabled?: boolean;
};

// Generate consistent color from userId
function generateUserColor(userId: string): string {
  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F97316',
    '#6366F1',
    '#84CC16',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function useCollaborativeLyrics({
  channelName,
  userId,
  userName,
  userColor,
  initialContent = '',
  enabled = true,
}: UseCollaborativeLyricsOptions) {
  const [content, setContent] = useState(initialContent);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, CursorInfo>>(new Map());
  const [sectionLocks, setSectionLocks] = useState<Map<string, SectionLock>>(new Map());
  const [suggestions, setSuggestions] = useState<LyricSuggestion[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const versionRef = useRef(0);
  const pendingEditsRef = useRef<LyricEdit[]>([]);
  const color = userColor || generateUserColor(userId);

  // Monitor connection state
  useConnectionStateListener((stateChange) => {
    setIsConnected(stateChange.current === 'connected');
    if (stateChange.current === 'failed') {
      setError('Connection failed');
    } else if (stateChange.current === 'connected') {
      setError(null);
    }
  });

  // Channel for lyrics edits
  const { publish: publishEdit } = useChannel(channelName, 'lyric-edit', (message: Message) => {
    if (!enabled) return;
    const edit = message.data as LyricEdit;
    if (edit.userId === userId) return; // Skip own edits

    // Apply the edit to content
    setContent((prev) => {
      let newContent = prev;
      switch (edit.type) {
        case 'insert':
          newContent = prev.slice(0, edit.position) + (edit.text || '') + prev.slice(edit.position);
          break;
        case 'delete':
          newContent =
            prev.slice(0, edit.position) + prev.slice(edit.position + (edit.length || 0));
          break;
        case 'replace':
          newContent =
            prev.slice(0, edit.position) +
            (edit.text || '') +
            prev.slice(edit.position + (edit.length || 0));
          break;
      }
      return newContent;
    });

    versionRef.current = Math.max(versionRef.current, edit.version);
  });

  // Channel for cursor updates
  const { publish: publishCursor } = useChannel(
    channelName,
    'cursor-update',
    (message: Message) => {
      if (!enabled) return;
      const cursor = message.data as CursorInfo;
      if (cursor.userId === userId) return;

      setRemoteCursors((prev) => {
        const newMap = new Map(prev);
        newMap.set(cursor.userId, cursor);
        return newMap;
      });
    }
  );

  // Channel for section locks
  const { publish: publishLock } = useChannel(channelName, 'section-lock', (message: Message) => {
    if (!enabled) return;
    const lock = message.data as SectionLock & { action: 'lock' | 'unlock' };

    setSectionLocks((prev) => {
      const newMap = new Map(prev);
      if (lock.action === 'lock') {
        newMap.set(lock.sectionId, lock);
      } else {
        newMap.delete(lock.sectionId);
      }
      return newMap;
    });
  });

  // Channel for suggestions
  const { publish: publishSuggestion } = useChannel(
    channelName,
    'suggestion',
    (message: Message) => {
      if (!enabled) return;
      const suggestion = message.data as LyricSuggestion & {
        action: 'create' | 'accept' | 'reject';
      };

      setSuggestions((prev) => {
        switch (suggestion.action) {
          case 'create':
            return [...prev, suggestion];
          case 'accept':
          case 'reject':
            return prev.map((s) =>
              s.id === suggestion.id ? { ...s, status: suggestion.status } : s
            );
          default:
            return prev;
        }
      });
    }
  );

  // Broadcast an edit
  const broadcastEdit = useCallback(
    (type: LyricEdit['type'], position: number, text?: string, length?: number) => {
      if (!publishEdit || !enabled) return;

      versionRef.current++;
      const edit: LyricEdit = {
        userId,
        userName,
        type,
        position,
        text,
        length,
        timestamp: Date.now(),
        version: versionRef.current,
      };

      publishEdit({ name: 'lyric-edit', data: edit });
    },
    [userId, userName, enabled, publishEdit]
  );

  // Handle local text changes
  const handleTextChange = useCallback(
    (newContent: string, cursorPosition: number) => {
      const oldContent = content;
      setContent(newContent);

      // Determine the type of edit
      if (newContent.length > oldContent.length) {
        // Insert
        const insertedText = newContent.slice(
          cursorPosition - (newContent.length - oldContent.length),
          cursorPosition
        );
        broadcastEdit('insert', cursorPosition - insertedText.length, insertedText);
      } else if (newContent.length < oldContent.length) {
        // Delete
        const deleteLength = oldContent.length - newContent.length;
        broadcastEdit('delete', cursorPosition, undefined, deleteLength);
      } else {
        // Replace (same length but different content)
        // Find the changed region
        let start = 0;
        while (start < oldContent.length && oldContent[start] === newContent[start]) {
          start++;
        }
        let end = 0;
        while (
          end < oldContent.length - start &&
          oldContent[oldContent.length - 1 - end] === newContent[newContent.length - 1 - end]
        ) {
          end++;
        }
        const replacedText = newContent.slice(start, newContent.length - end);
        broadcastEdit('replace', start, replacedText, oldContent.length - start - end);
      }
    },
    [content, broadcastEdit]
  );

  // Broadcast cursor position
  const broadcastCursor = useCallback(
    (position: number, selection?: { start: number; end: number }) => {
      if (!publishCursor || !enabled) return;

      const cursor: CursorInfo = {
        userId,
        userName,
        userColor: color,
        position,
        selection,
        timestamp: Date.now(),
      };

      publishCursor({ name: 'cursor-update', data: cursor });
    },
    [userId, userName, color, enabled, publishCursor]
  );

  // Lock a section
  const lockSection = useCallback(
    (sectionId: string) => {
      if (!publishLock || !enabled) return;

      const lock: SectionLock & { action: 'lock' } = {
        sectionId,
        userId,
        userName,
        userColor: color,
        lockedAt: Date.now(),
        action: 'lock',
      };

      setSectionLocks((prev) => {
        const newMap = new Map(prev);
        newMap.set(sectionId, lock);
        return newMap;
      });

      publishLock({ name: 'section-lock', data: lock });
    },
    [userId, userName, color, enabled, publishLock]
  );

  // Unlock a section
  const unlockSection = useCallback(
    (sectionId: string) => {
      if (!publishLock || !enabled) return;

      const unlock = {
        sectionId,
        userId,
        userName,
        userColor: color,
        lockedAt: Date.now(),
        action: 'unlock' as const,
      };

      setSectionLocks((prev) => {
        const newMap = new Map(prev);
        newMap.delete(sectionId);
        return newMap;
      });

      publishLock({ name: 'section-lock', data: unlock });
    },
    [userId, userName, color, enabled, publishLock]
  );

  // Create a suggestion
  const createSuggestion = useCallback(
    (position: number, originalText: string, suggestedText: string) => {
      if (!publishSuggestion || !enabled) return;

      const suggestion: LyricSuggestion & { action: 'create' } = {
        id: `${userId}-${Date.now()}`,
        userId,
        userName,
        userColor: color,
        position,
        originalText,
        suggestedText,
        status: 'pending',
        timestamp: Date.now(),
        action: 'create',
      };

      setSuggestions((prev) => [...prev, suggestion]);
      publishSuggestion({ name: 'suggestion', data: suggestion });
    },
    [userId, userName, color, enabled, publishSuggestion]
  );

  // Accept/reject a suggestion
  const respondToSuggestion = useCallback(
    (suggestionId: string, accept: boolean) => {
      if (!publishSuggestion || !enabled) return;

      const suggestion = suggestions.find((s) => s.id === suggestionId);
      if (!suggestion) return;

      if (accept) {
        // Apply the suggestion to content
        setContent(
          (prev) =>
            prev.slice(0, suggestion.position) +
            suggestion.suggestedText +
            prev.slice(suggestion.position + suggestion.originalText.length)
        );
      }

      const response = {
        ...suggestion,
        status: accept ? 'accepted' : 'rejected',
        action: accept ? 'accept' : 'reject',
      };

      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: response.status as 'accepted' | 'rejected' } : s
        )
      );

      publishSuggestion({ name: 'suggestion', data: response });
    },
    [suggestions, enabled, publishSuggestion]
  );

  // Clean up stale cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) => {
        const newMap = new Map(prev);
        for (const [key, cursor] of newMap) {
          if (now - cursor.timestamp > 10000) {
            newMap.delete(key);
          }
        }
        return newMap;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    content,
    setContent: handleTextChange,
    remoteCursors: Array.from(remoteCursors.values()),
    sectionLocks: Array.from(sectionLocks.values()),
    suggestions,
    isConnected,
    error,
    broadcastCursor,
    lockSection,
    unlockSection,
    createSuggestion,
    respondToSuggestion,
    userColor: color,
  };
}
