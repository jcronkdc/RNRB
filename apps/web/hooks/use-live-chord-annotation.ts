/**
 * Live Chord Annotation Hook
 *
 * Multiple musicians annotate chords in real-time.
 * See who added which chord and discuss alternatives.
 *
 * Features:
 * - Add chords at word/line positions
 * - Real-time sync across users
 * - User attribution with colors
 * - Chord suggestions/alternatives
 * - Undo/redo support
 */

import type { Message } from 'ably';
import { useChannel, useConnectionStateListener } from 'ably/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type ChordAnnotation = {
  id: string;
  lineIndex: number;
  wordIndex: number; // -1 for start of line
  chord: string;
  userId: string;
  userName: string;
  userColor: string;
  createdAt: number;
  alternatives?: string[]; // Suggested alternative chords
};

export type ChordSuggestion = {
  id: string;
  annotationId: string;
  suggestedChord: string;
  reason?: string;
  userId: string;
  userName: string;
  votes: string[]; // User IDs who upvoted
  createdAt: number;
};

export type ChordAction = {
  type: 'add' | 'remove' | 'update' | 'suggest' | 'vote';
  annotation?: ChordAnnotation;
  suggestion?: ChordSuggestion;
  userId: string;
  userName: string;
  timestamp: number;
};

type UseLiveChordAnnotationOptions = {
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

// Common chord progressions for suggestions
const COMMON_PROGRESSIONS: Record<string, string[]> = {
  C: ['Am', 'F', 'G', 'Dm', 'Em'],
  Am: ['C', 'F', 'G', 'Dm', 'E'],
  G: ['C', 'D', 'Em', 'Am', 'Bm'],
  D: ['G', 'A', 'Bm', 'Em', 'F#m'],
  E: ['A', 'B', 'C#m', 'F#m', 'G#m'],
  A: ['D', 'E', 'F#m', 'Bm', 'C#m'],
  F: ['C', 'Bb', 'Am', 'Dm', 'Gm'],
};

export function useLiveChordAnnotation({
  channelName,
  userId,
  userName,
  userColor,
  enabled = true,
}: UseLiveChordAnnotationOptions) {
  const [annotations, setAnnotations] = useState<ChordAnnotation[]>([]);
  const [suggestions, setSuggestions] = useState<Map<string, ChordSuggestion[]>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Undo/redo stacks
  const undoStackRef = useRef<ChordAction[]>([]);
  const redoStackRef = useRef<ChordAction[]>([]);

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

  // Channel for chord actions
  const { publish, channel } = useChannel(channelName, 'chord-action', (message: Message) => {
    if (!enabled) return;
    const action = message.data as ChordAction;

    switch (action.type) {
      case 'add':
        if (action.annotation) {
          setAnnotations((prev) => [...prev, action.annotation!]);
        }
        break;

      case 'remove':
        if (action.annotation) {
          setAnnotations((prev) => prev.filter((a) => a.id !== action.annotation!.id));
        }
        break;

      case 'update':
        if (action.annotation) {
          setAnnotations((prev) =>
            prev.map((a) => (a.id === action.annotation!.id ? action.annotation! : a))
          );
        }
        break;

      case 'suggest':
        if (action.suggestion) {
          setSuggestions((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(action.suggestion!.annotationId) || [];
            newMap.set(action.suggestion!.annotationId, [...existing, action.suggestion!]);
            return newMap;
          });
        }
        break;

      case 'vote':
        if (action.suggestion) {
          setSuggestions((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(action.suggestion!.annotationId) || [];
            newMap.set(
              action.suggestion!.annotationId,
              existing.map((s) => (s.id === action.suggestion!.id ? action.suggestion! : s))
            );
            return newMap;
          });
        }
        break;
    }
  });

  // Fetch history on mount
  useEffect(() => {
    if (!channel || !enabled) return;

    const fetchHistory = async () => {
      try {
        const result = await channel.history({ limit: 200 });
        if (result) {
          const annotationMap = new Map<string, ChordAnnotation>();
          const suggestionMap = new Map<string, ChordSuggestion[]>();

          const items = result.items.reverse();
          for (const item of items) {
            if (item.name === 'chord-action') {
              const action = item.data as ChordAction;

              switch (action.type) {
                case 'add':
                  if (action.annotation) {
                    annotationMap.set(action.annotation.id, action.annotation);
                  }
                  break;
                case 'remove':
                  if (action.annotation) {
                    annotationMap.delete(action.annotation.id);
                  }
                  break;
                case 'update':
                  if (action.annotation) {
                    annotationMap.set(action.annotation.id, action.annotation);
                  }
                  break;
                case 'suggest':
                  if (action.suggestion) {
                    const existing = suggestionMap.get(action.suggestion.annotationId) || [];
                    suggestionMap.set(action.suggestion.annotationId, [
                      ...existing,
                      action.suggestion,
                    ]);
                  }
                  break;
                case 'vote':
                  if (action.suggestion) {
                    const existing = suggestionMap.get(action.suggestion.annotationId) || [];
                    suggestionMap.set(
                      action.suggestion.annotationId,
                      existing.map((s) => (s.id === action.suggestion!.id ? action.suggestion! : s))
                    );
                  }
                  break;
              }
            }
          }

          setAnnotations(Array.from(annotationMap.values()));
          setSuggestions(suggestionMap);
        }
      } catch (err) {
        console.error('Failed to fetch chord history:', err);
      }
    };

    fetchHistory();
  }, [channel, enabled]);

  // Add a chord annotation
  const addChord = useCallback(
    (lineIndex: number, wordIndex: number, chord: string) => {
      if (!publish || !enabled) return;

      const annotation: ChordAnnotation = {
        id: `${userId}-${Date.now()}`,
        lineIndex,
        wordIndex,
        chord,
        userId,
        userName,
        userColor: color,
        createdAt: Date.now(),
        alternatives: COMMON_PROGRESSIONS[chord.replace(/[m7sus2add9#b]/g, '')] || [],
      };

      // Optimistic update
      setAnnotations((prev) => [...prev, annotation]);

      const action: ChordAction = {
        type: 'add',
        annotation,
        userId,
        userName,
        timestamp: Date.now(),
      };

      // Add to undo stack
      undoStackRef.current.push(action);
      redoStackRef.current = [];

      publish({ name: 'chord-action', data: action });

      return annotation.id;
    },
    [userId, userName, color, enabled, publish]
  );

  // Remove a chord annotation
  const removeChord = useCallback(
    (annotationId: string) => {
      if (!publish || !enabled) return;

      const annotation = annotations.find((a) => a.id === annotationId);
      if (!annotation) return;

      // Optimistic update
      setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));

      const action: ChordAction = {
        type: 'remove',
        annotation,
        userId,
        userName,
        timestamp: Date.now(),
      };

      // Add to undo stack
      undoStackRef.current.push(action);
      redoStackRef.current = [];

      publish({ name: 'chord-action', data: action });
    },
    [annotations, userId, userName, enabled, publish]
  );

  // Update a chord
  const updateChord = useCallback(
    (annotationId: string, newChord: string) => {
      if (!publish || !enabled) return;

      const annotation = annotations.find((a) => a.id === annotationId);
      if (!annotation) return;

      const updatedAnnotation: ChordAnnotation = {
        ...annotation,
        chord: newChord,
        alternatives: COMMON_PROGRESSIONS[newChord.replace(/[m7sus2add9#b]/g, '')] || [],
      };

      // Optimistic update
      setAnnotations((prev) => prev.map((a) => (a.id === annotationId ? updatedAnnotation : a)));

      const action: ChordAction = {
        type: 'update',
        annotation: updatedAnnotation,
        userId,
        userName,
        timestamp: Date.now(),
      };

      // Add to undo stack
      undoStackRef.current.push({ ...action, annotation }); // Store old annotation for undo
      redoStackRef.current = [];

      publish({ name: 'chord-action', data: action });
    },
    [annotations, userId, userName, enabled, publish]
  );

  // Suggest an alternative chord
  const suggestChord = useCallback(
    (annotationId: string, suggestedChord: string, reason?: string) => {
      if (!publish || !enabled) return;

      const suggestion: ChordSuggestion = {
        id: `${userId}-${Date.now()}`,
        annotationId,
        suggestedChord,
        reason,
        userId,
        userName,
        votes: [userId], // Creator auto-votes
        createdAt: Date.now(),
      };

      // Optimistic update
      setSuggestions((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(annotationId) || [];
        newMap.set(annotationId, [...existing, suggestion]);
        return newMap;
      });

      const action: ChordAction = {
        type: 'suggest',
        suggestion,
        userId,
        userName,
        timestamp: Date.now(),
      };

      publish({ name: 'chord-action', data: action });
    },
    [userId, userName, enabled, publish]
  );

  // Vote on a suggestion
  const voteOnSuggestion = useCallback(
    (annotationId: string, suggestionId: string) => {
      if (!publish || !enabled) return;

      const annotationSuggestions = suggestions.get(annotationId);
      if (!annotationSuggestions) return;

      const suggestion = annotationSuggestions.find((s) => s.id === suggestionId);
      if (!suggestion) return;

      // Toggle vote
      const newVotes = suggestion.votes.includes(userId)
        ? suggestion.votes.filter((v) => v !== userId)
        : [...suggestion.votes, userId];

      const updatedSuggestion: ChordSuggestion = {
        ...suggestion,
        votes: newVotes,
      };

      // Optimistic update
      setSuggestions((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(annotationId) || [];
        newMap.set(
          annotationId,
          existing.map((s) => (s.id === suggestionId ? updatedSuggestion : s))
        );
        return newMap;
      });

      const action: ChordAction = {
        type: 'vote',
        suggestion: updatedSuggestion,
        userId,
        userName,
        timestamp: Date.now(),
      };

      publish({ name: 'chord-action', data: action });
    },
    [suggestions, userId, userName, enabled, publish]
  );

  // Accept a suggestion (replace the chord)
  const acceptSuggestion = useCallback(
    (annotationId: string, suggestionId: string) => {
      const annotationSuggestions = suggestions.get(annotationId);
      if (!annotationSuggestions) return;

      const suggestion = annotationSuggestions.find((s) => s.id === suggestionId);
      if (!suggestion) return;

      updateChord(annotationId, suggestion.suggestedChord);
    },
    [suggestions, updateChord]
  );

  // Get chords for a specific line
  const getChordsForLine = useCallback(
    (lineIndex: number) => {
      return annotations
        .filter((a) => a.lineIndex === lineIndex)
        .sort((a, b) => a.wordIndex - b.wordIndex);
    },
    [annotations]
  );

  // Get suggestions for an annotation
  const getSuggestionsForAnnotation = useCallback(
    (annotationId: string) => {
      return suggestions.get(annotationId) || [];
    },
    [suggestions]
  );

  // Undo last action
  const undo = useCallback(() => {
    const lastAction = undoStackRef.current.pop();
    if (!lastAction || !publish || !enabled) return;

    // Invert the action
    let inverseAction: ChordAction;

    switch (lastAction.type) {
      case 'add':
        inverseAction = { ...lastAction, type: 'remove' };
        setAnnotations((prev) => prev.filter((a) => a.id !== lastAction.annotation!.id));
        break;
      case 'remove':
        inverseAction = { ...lastAction, type: 'add' };
        setAnnotations((prev) => [...prev, lastAction.annotation!]);
        break;
      case 'update':
        // lastAction.annotation contains the OLD annotation for undo
        inverseAction = { ...lastAction, type: 'update' };
        setAnnotations((prev) =>
          prev.map((a) => (a.id === lastAction.annotation!.id ? lastAction.annotation! : a))
        );
        break;
      default:
        return;
    }

    redoStackRef.current.push(lastAction);
    publish({ name: 'chord-action', data: inverseAction });
  }, [enabled, publish]);

  // Redo last undone action
  const redo = useCallback(() => {
    const lastAction = redoStackRef.current.pop();
    if (!lastAction || !publish || !enabled) return;

    undoStackRef.current.push(lastAction);

    // Re-apply the action
    switch (lastAction.type) {
      case 'add':
        setAnnotations((prev) => [...prev, lastAction.annotation!]);
        break;
      case 'remove':
        setAnnotations((prev) => prev.filter((a) => a.id !== lastAction.annotation!.id));
        break;
      case 'update':
        setAnnotations((prev) =>
          prev.map((a) => (a.id === lastAction.annotation!.id ? lastAction.annotation! : a))
        );
        break;
    }

    publish({ name: 'chord-action', data: lastAction });
  }, [enabled, publish]);

  return {
    annotations,
    suggestions: Object.fromEntries(suggestions),
    isConnected,
    error,
    addChord,
    removeChord,
    updateChord,
    suggestChord,
    voteOnSuggestion,
    acceptSuggestion,
    getChordsForLine,
    getSuggestionsForAnnotation,
    undo,
    redo,
    canUndo: undoStackRef.current.length > 0,
    canRedo: redoStackRef.current.length > 0,
    userColor: color,
  };
}
