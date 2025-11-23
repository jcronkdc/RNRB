/**
 * Collaborative Song Suggestions Hook
 *
 * Suggestion-based editing workflow for songwriting collaboration
 * Prevents conflicts: Users propose changes, song owner accepts/rejects
 * Real-time sync via Ably
 *
 * Mycelial Pathway:
 * User suggests edit → Ably broadcasts → All see suggestion → Owner accepts → Master updates → All sync
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Realtime } from 'ably';
import type * as Ably from 'ably';

export type LyricSuggestion = {
  id: string;
  blockId: string; // Which song block (verse/chorus/bridge)
  lineIndex?: number;
  wordIndex?: number;
  type: 'word' | 'line' | 'chord';
  originalValue: string;
  suggestedValue: string;
  userId: string;
  userName: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
};

type ChordSuggestion = {
  id: string;
  blockId: string;
  lineIndex: number;
  wordIndex: number;
  chord: string;
  userId: string;
  userName: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
};

type UseSongSuggestionsOptions = {
  channelName: string;
  userId: string;
  userName: string;
  isOwner: boolean; // Only owners can accept/reject
  enabled: boolean;
};

export function useSongSuggestions({
  channelName,
  userId,
  userName,
  isOwner,
  enabled,
}: UseSongSuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<Map<string, LyricSuggestion>>(new Map());
  const [chordSuggestions, setChordSuggestions] = useState<Map<string, ChordSuggestion>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ablyRef = useRef<Realtime | null>(null);
  const channelRef = useRef<Types.RealtimeChannelCallbacks | null>(null);

  // Initialize Ably connection
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const initAbly = async () => {
      try {
        const response = await fetch('/api/ably/token');
        if (response.status === 503) {
          console.info('Ably not configured - suggestions disabled');
          return;
        }

        if (!response.ok) throw new Error('Failed to get Ably token');

        const ablyClient = new Realtime({
          authUrl: '/api/ably/token',
          clientId: userId,
        });

        if (!mounted) {
          ablyClient.close();
          return;
        }

        ablyRef.current = ablyClient;
        const channel = ablyClient.channels.get(channelName);
        channelRef.current = channel;

        // Subscribe to suggestion events
        channel.subscribe('suggestion-created', (message) => {
          if (!mounted) return;
          const suggestion: LyricSuggestion = message.data;

          setSuggestions((prev) => new Map(prev).set(suggestion.id, suggestion));
        });

        channel.subscribe('suggestion-accepted', (message) => {
          if (!mounted) return;
          const { suggestionId } = message.data;

          setSuggestions((prev) => {
            const newMap = new Map(prev);
            const suggestion = newMap.get(suggestionId);
            if (suggestion) {
              newMap.set(suggestionId, { ...suggestion, status: 'accepted' });
            }
            return newMap;
          });

          // Remove accepted suggestion after 2 seconds (time to see green highlight)
          setTimeout(() => {
            setSuggestions((prev) => {
              const newMap = new Map(prev);
              newMap.delete(suggestionId);
              return newMap;
            });
          }, 2000);
        });

        channel.subscribe('suggestion-rejected', (message) => {
          if (!mounted) return;
          const { suggestionId } = message.data;

          setSuggestions((prev) => {
            const newMap = new Map(prev);
            const suggestion = newMap.get(suggestionId);
            if (suggestion) {
              newMap.set(suggestionId, { ...suggestion, status: 'rejected' });
            }
            return newMap;
          });

          // Remove rejected suggestion after 1 second (fade out)
          setTimeout(() => {
            setSuggestions((prev) => {
              const newMap = new Map(prev);
              newMap.delete(suggestionId);
              return newMap;
            });
          }, 1000);
        });

        // Chord suggestions
        channel.subscribe('chord-suggested', (message) => {
          if (!mounted) return;
          const suggestion: ChordSuggestion = message.data;
          setChordSuggestions((prev) => new Map(prev).set(suggestion.id, suggestion));
        });

        channel.subscribe('chord-accepted', (message) => {
          if (!mounted) return;
          const { suggestionId } = message.data;

          setTimeout(() => {
            setChordSuggestions((prev) => {
              const newMap = new Map(prev);
              newMap.delete(suggestionId);
              return newMap;
            });
          }, 2000);
        });

        channel.subscribe('chord-rejected', (message) => {
          if (!mounted) return;
          const { suggestionId } = message.data;

          setTimeout(() => {
            setChordSuggestions((prev) => {
              const newMap = new Map(prev);
              newMap.delete(suggestionId);
              return newMap;
            });
          }, 1000);
        });

        setIsConnected(true);
      } catch (err) {
        console.error('Suggestions sync error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      }
    };

    initAbly();

    return () => {
      mounted = false;
      channelRef.current?.unsubscribe();
      ablyRef.current?.close();
      setSuggestions(new Map());
      setChordSuggestions(new Map());
      setIsConnected(false);
    };
  }, [channelName, userId, enabled]);

  // Create lyric suggestion
  const suggestLyricChange = useCallback(
    (
      blockId: string,
      originalValue: string,
      suggestedValue: string,
      lineIndex?: number,
      wordIndex?: number
    ) => {
      if (!channelRef.current) return;

      const suggestion: LyricSuggestion = {
        id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blockId,
        lineIndex,
        wordIndex,
        type: wordIndex !== undefined ? 'word' : 'line',
        originalValue,
        suggestedValue,
        userId,
        userName,
        timestamp: Date.now(),
        status: 'pending',
      };

      // Add locally (optimistic)
      setSuggestions((prev) => new Map(prev).set(suggestion.id, suggestion));

      // Broadcast to collaborators
      channelRef.current.publish('suggestion-created', suggestion);
    },
    [userId, userName]
  );

  // Create chord suggestion
  const suggestChord = useCallback(
    (blockId: string, lineIndex: number, wordIndex: number, chord: string) => {
      if (!channelRef.current) return;

      const suggestion: ChordSuggestion = {
        id: `chord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blockId,
        lineIndex,
        wordIndex,
        chord,
        userId,
        userName,
        timestamp: Date.now(),
        status: 'pending',
      };

      // Add locally
      setChordSuggestions((prev) => new Map(prev).set(suggestion.id, suggestion));

      // Broadcast
      channelRef.current.publish('chord-suggested', suggestion);
    },
    [userId, userName]
  );

  // Accept suggestion (owner only)
  const acceptSuggestion = useCallback(
    (suggestionId: string) => {
      if (!channelRef.current || !isOwner) return;

      const suggestion = suggestions.get(suggestionId);
      if (!suggestion) return;

      // Update status locally
      setSuggestions((prev) => {
        const newMap = new Map(prev);
        const s = newMap.get(suggestionId);
        if (s) {
          newMap.set(suggestionId, { ...s, status: 'accepted' });
        }
        return newMap;
      });

      // Broadcast acceptance
      channelRef.current.publish('suggestion-accepted', { suggestionId });

      return suggestion; // Return to apply change to master
    },
    [suggestions, isOwner]
  );

  // Reject suggestion (owner only)
  const rejectSuggestion = useCallback(
    (suggestionId: string) => {
      if (!channelRef.current || !isOwner) return;

      // Update status locally
      setSuggestions((prev) => {
        const newMap = new Map(prev);
        const s = newMap.get(suggestionId);
        if (s) {
          newMap.set(suggestionId, { ...s, status: 'rejected' });
        }
        return newMap;
      });

      // Broadcast rejection
      channelRef.current.publish('suggestion-rejected', { suggestionId });
    },
    [isOwner]
  );

  // Accept chord suggestion
  const acceptChordSuggestion = useCallback(
    (suggestionId: string) => {
      if (!channelRef.current || !isOwner) return;

      const suggestion = chordSuggestions.get(suggestionId);
      if (!suggestion) return;

      // Broadcast acceptance
      channelRef.current.publish('chord-accepted', { suggestionId });

      return suggestion;
    },
    [chordSuggestions, isOwner]
  );

  // Reject chord suggestion
  const rejectChordSuggestion = useCallback(
    (suggestionId: string) => {
      if (!channelRef.current || !isOwner) return;

      channelRef.current.publish('chord-rejected', { suggestionId });

      setTimeout(() => {
        setChordSuggestions((prev) => {
          const newMap = new Map(prev);
          newMap.delete(suggestionId);
          return newMap;
        });
      }, 1000);
    },
    [isOwner]
  );

  // Get suggestions for a specific block
  const getSuggestionsForBlock = useCallback(
    (blockId: string) => {
      return Array.from(suggestions.values()).filter((s) => s.blockId === blockId);
    },
    [suggestions]
  );

  const getChordSuggestionsForBlock = useCallback(
    (blockId: string) => {
      return Array.from(chordSuggestions.values()).filter((s) => s.blockId === blockId);
    },
    [chordSuggestions]
  );

  return {
    // State
    suggestions: Array.from(suggestions.values()),
    chordSuggestions: Array.from(chordSuggestions.values()),
    isConnected,
    error,
    isOwner,

    // Actions
    suggestLyricChange,
    suggestChord,
    acceptSuggestion,
    rejectSuggestion,
    acceptChordSuggestion,
    rejectChordSuggestion,

    // Helpers
    getSuggestionsForBlock,
    getChordSuggestionsForBlock,
  };
}
