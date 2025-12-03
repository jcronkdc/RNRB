/**
 * Audio Annotations Hook
 *
 * Timestamped comments on the waveform.
 * Everyone can leave feedback at specific moments.
 *
 * Features:
 * - Add annotations at timestamps
 * - Real-time sync across users
 * - Reply threads on annotations
 * - Color-coded by user
 * - Annotation markers on waveform
 */

import type { Message } from 'ably';
import { useChannel, useConnectionStateListener } from 'ably/react';
import { useCallback, useEffect, useState } from 'react';

export type AudioAnnotation = {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number; // Position in audio (seconds)
  content: string;
  createdAt: number;
  replies: AnnotationReply[];
  resolved: boolean;
};

export type AnnotationReply = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
};

export type AnnotationAction = {
  type: 'create' | 'reply' | 'resolve' | 'delete';
  annotation: AudioAnnotation;
  reply?: AnnotationReply;
};

type UseAudioAnnotationsOptions = {
  channelName: string;
  userId: string;
  userName: string;
  userColor?: string;
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

export function useAudioAnnotations({
  channelName,
  userId,
  userName,
  userColor,
  enabled = true,
}: UseAudioAnnotationsOptions) {
  const [annotations, setAnnotations] = useState<AudioAnnotation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Channel for annotation actions
  const { publish, channel } = useChannel(channelName, 'annotation-action', (message: Message) => {
    if (!enabled) return;
    const action = message.data as AnnotationAction;

    setAnnotations((prev) => {
      switch (action.type) {
        case 'create':
          return [...prev, action.annotation].sort((a, b) => a.timestamp - b.timestamp);

        case 'reply':
          return prev.map((a) =>
            a.id === action.annotation.id && action.reply
              ? { ...a, replies: [...a.replies, action.reply] }
              : a
          );

        case 'resolve':
          return prev.map((a) =>
            a.id === action.annotation.id ? { ...a, resolved: action.annotation.resolved } : a
          );

        case 'delete':
          return prev.filter((a) => a.id !== action.annotation.id);

        default:
          return prev;
      }
    });
  });

  // Fetch history on mount
  useEffect(() => {
    if (!channel || !enabled) return;

    const fetchHistory = async () => {
      try {
        const result = await channel.history({ limit: 100 });
        if (result) {
          const historicalAnnotations = new Map<string, AudioAnnotation>();

          // Process history in chronological order
          const items = result.items.reverse();
          for (const item of items) {
            if (item.name === 'annotation-action') {
              const action = item.data as AnnotationAction;

              switch (action.type) {
                case 'create':
                  historicalAnnotations.set(action.annotation.id, action.annotation);
                  break;
                case 'reply':
                  const existing = historicalAnnotations.get(action.annotation.id);
                  if (existing && action.reply) {
                    existing.replies = [...existing.replies, action.reply];
                  }
                  break;
                case 'resolve':
                  const toResolve = historicalAnnotations.get(action.annotation.id);
                  if (toResolve) {
                    toResolve.resolved = action.annotation.resolved;
                  }
                  break;
                case 'delete':
                  historicalAnnotations.delete(action.annotation.id);
                  break;
              }
            }
          }

          setAnnotations(
            Array.from(historicalAnnotations.values()).sort((a, b) => a.timestamp - b.timestamp)
          );
        }
      } catch (err) {
        console.error('Failed to fetch annotation history:', err);
      }
    };

    fetchHistory();
  }, [channel, enabled]);

  // Create an annotation
  const createAnnotation = useCallback(
    (timestamp: number, content: string) => {
      if (!publish || !enabled) return;

      const annotation: AudioAnnotation = {
        id: `${userId}-${Date.now()}`,
        userId,
        userName,
        userColor: color,
        timestamp,
        content,
        createdAt: Date.now(),
        replies: [],
        resolved: false,
      };

      // Optimistic update
      setAnnotations((prev) => [...prev, annotation].sort((a, b) => a.timestamp - b.timestamp));

      const action: AnnotationAction = {
        type: 'create',
        annotation,
      };

      publish({ name: 'annotation-action', data: action });

      return annotation.id;
    },
    [userId, userName, color, enabled, publish]
  );

  // Reply to an annotation
  const replyToAnnotation = useCallback(
    (annotationId: string, content: string) => {
      if (!publish || !enabled) return;

      const annotation = annotations.find((a) => a.id === annotationId);
      if (!annotation) return;

      const reply: AnnotationReply = {
        id: `${userId}-${Date.now()}`,
        userId,
        userName,
        content,
        createdAt: Date.now(),
      };

      // Optimistic update
      setAnnotations((prev) =>
        prev.map((a) => (a.id === annotationId ? { ...a, replies: [...a.replies, reply] } : a))
      );

      const action: AnnotationAction = {
        type: 'reply',
        annotation,
        reply,
      };

      publish({ name: 'annotation-action', data: action });
    },
    [userId, userName, annotations, enabled, publish]
  );

  // Resolve/unresolve an annotation
  const toggleResolved = useCallback(
    (annotationId: string) => {
      if (!publish || !enabled) return;

      const annotation = annotations.find((a) => a.id === annotationId);
      if (!annotation) return;

      const updatedAnnotation = { ...annotation, resolved: !annotation.resolved };

      // Optimistic update
      setAnnotations((prev) => prev.map((a) => (a.id === annotationId ? updatedAnnotation : a)));

      const action: AnnotationAction = {
        type: 'resolve',
        annotation: updatedAnnotation,
      };

      publish({ name: 'annotation-action', data: action });
    },
    [annotations, enabled, publish]
  );

  // Delete an annotation
  const deleteAnnotation = useCallback(
    (annotationId: string) => {
      if (!publish || !enabled) return;

      const annotation = annotations.find((a) => a.id === annotationId);
      if (!annotation) return;

      // Only allow deleting own annotations
      if (annotation.userId !== userId) return;

      // Optimistic update
      setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));

      const action: AnnotationAction = {
        type: 'delete',
        annotation,
      };

      publish({ name: 'annotation-action', data: action });
    },
    [userId, annotations, enabled, publish]
  );

  // Get annotations at a specific time range
  const getAnnotationsInRange = useCallback(
    (startTime: number, endTime: number) => {
      return annotations.filter((a) => a.timestamp >= startTime && a.timestamp <= endTime);
    },
    [annotations]
  );

  // Get annotations by user
  const getAnnotationsByUser = useCallback(
    (targetUserId: string) => {
      return annotations.filter((a) => a.userId === targetUserId);
    },
    [annotations]
  );

  // Get unresolved annotations count
  const unresolvedCount = annotations.filter((a) => !a.resolved).length;

  return {
    annotations,
    isConnected,
    error,
    unresolvedCount,
    createAnnotation,
    replyToAnnotation,
    toggleResolved,
    deleteAnnotation,
    getAnnotationsInRange,
    getAnnotationsByUser,
    userColor: color,
  };
}
