/**
 * Collaborative Song Hook
 *
 * Wraps Yjs document + Ably provider + Awareness into a clean React API.
 * Replaces use-collaborative-lyrics.ts with proper CRDT sync.
 *
 * Usage:
 *   const { doc, awareness, lyrics, title, isConnected, collaborators } =
 *     useCollaborativeSong({ songId, userId, userName });
 *
 *   // Read lyrics
 *   console.log(lyrics); // reactive string
 *
 *   // Edit lyrics (through Yjs text type — triggers sync automatically)
 *   doc.getText('lyrics').insert(0, 'New first line\n');
 *
 *   // Set cursor position
 *   awareness.setLocalStateField('cursor', { position: 42 });
 */

import { useAbly } from 'ably/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';

import { YjsAblyProvider } from '@/lib/yjs-ably-provider';

export interface CollaboratorInfo {
  userId: string;
  userName: string;
  userColor: string;
  cursor?: {
    position: number;
    selection?: { start: number; end: number };
  };
  isActive: boolean;
  lastSeen: number;
}

interface UseCollaborativeSongOptions {
  songId: string;
  userId: string;
  userName: string;
  userColor?: string;
  enabled?: boolean;
}

// Consistent color from userId
function generateColor(userId: string): string {
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

export function useCollaborativeSong({
  songId,
  userId,
  userName,
  userColor,
  enabled = true,
}: UseCollaborativeSongOptions) {
  const ablyClient = useAbly();
  const providerRef = useRef<YjsAblyProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);

  const [lyrics, setLyrics] = useState('');
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);

  const color = userColor || generateColor(userId);

  // Initialize Yjs doc and provider
  useEffect(() => {
    if (!enabled || !songId || !userId) return;

    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    docRef.current = doc;
    awarenessRef.current = awareness;

    // Create the provider
    const provider = new YjsAblyProvider({
      doc,
      ablyClient: ablyClient as any,
      channelName: `song:${songId}`,
      songId,
      awareness,
      persistInterval: 10000,
    });
    providerRef.current = provider;

    // Set our awareness state
    provider.setAwarenessState({
      userId,
      userName,
      userColor: color,
      isActive: true,
      lastSeen: Date.now(),
    });

    setIsConnected(true);

    // Listen for lyrics changes
    const lyricsText = doc.getText('lyrics');
    const titleText = doc.getText('title');

    const updateLyrics = () => setLyrics(lyricsText.toString());
    const updateTitle = () => setTitle(titleText.toString());

    lyricsText.observe(updateLyrics);
    titleText.observe(updateTitle);

    // Set initial values
    updateLyrics();
    updateTitle();

    // Listen for awareness changes (collaborators)
    const updateCollaborators = () => {
      const states = awareness.getStates();
      const collabs: CollaboratorInfo[] = [];

      states.forEach((state, clientId) => {
        if (clientId === doc.clientID) return; // Skip self
        const user = state.user as CollaboratorInfo | undefined;
        if (user) {
          collabs.push({
            ...user,
            isActive: Date.now() - (user.lastSeen || 0) < 30000,
          });
        }
      });

      setCollaborators(collabs);
    };

    awareness.on('update', updateCollaborators);

    // Cleanup
    return () => {
      lyricsText.unobserve(updateLyrics);
      titleText.unobserve(updateTitle);
      awareness.off('update', updateCollaborators);
      provider.destroy();
      doc.destroy();
      providerRef.current = null;
      docRef.current = null;
      awarenessRef.current = null;
      setIsConnected(false);
    };
  }, [songId, userId, userName, color, enabled, ablyClient]);

  // Keep awareness "lastSeen" fresh
  useEffect(() => {
    if (!enabled || !providerRef.current) return;

    const interval = setInterval(() => {
      providerRef.current?.setAwarenessState({
        userId,
        userName,
        userColor: color,
        isActive: true,
        lastSeen: Date.now(),
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [enabled, userId, userName, color]);

  // Update cursor position in awareness
  const setCursor = useCallback((position: number, selection?: { start: number; end: number }) => {
    if (!awarenessRef.current) return;

    awarenessRef.current.setLocalStateField('cursor', {
      position,
      selection,
    });
  }, []);

  // Get the Yjs text types for direct manipulation
  const getLyricsText = useCallback((): Y.Text | null => {
    return docRef.current?.getText('lyrics') || null;
  }, []);

  const getTitleText = useCallback((): Y.Text | null => {
    return docRef.current?.getText('title') || null;
  }, []);

  // Force persist (for version saves, etc.)
  const forcePersist = useCallback(async () => {
    await providerRef.current?.persistState();
  }, []);

  return {
    // Reactive state
    lyrics,
    title,
    isConnected,
    collaborators,

    // Yjs primitives (for direct document manipulation)
    doc: docRef.current,
    awareness: awarenessRef.current,

    // Helpers
    getLyricsText,
    getTitleText,
    setCursor,
    forcePersist,

    // User info
    userColor: color,
  };
}
