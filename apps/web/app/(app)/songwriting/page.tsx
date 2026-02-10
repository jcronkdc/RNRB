'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { SongEditor, type SongSection } from '@/components/songwriting/song-editor';
import { TalkbackStrip } from '@/components/songwriting/talkback-strip';
import { InviteCollaborator } from '@/components/songwriting/invite-collaborator';
import { UserPlus } from '@/components/ui/custom-icons';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function SongwritingPage() {
  useRequireAuth();
  const { data: session } = useSession();
  const user = session?.user;
  const [songId, setSongId] = useState<string | null>(null);
  const [initialTitle, setInitialTitle] = useState('Untitled Song');
  const [initialSections, setInitialSections] = useState<SongSection[] | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const [collaborators, setCollaborators] = useState<Array<{ userId: string; userName: string; userColor: string }>>([]);
  const [showInvite, setShowInvite] = useState(false);

  // Create or load a song on first load
  useEffect(() => {
    if (!user?.id || songId) return;

    // Check URL for a song ID (e.g., /songwriting?id=xxx)
    const params = new URLSearchParams(window.location.search);
    const existingSongId = params.get('id');

    if (existingSongId) {
      // Load existing song
      const loadSong = async () => {
        try {
          const response = await fetch(`/api/songs/${existingSongId}`);
          if (response.ok) {
            const { song } = await response.json();
            setSongId(song.id);
            setInitialTitle(song.title || 'Untitled Song');
            // Parse lyrics into sections if they exist
            if (song.lyrics) {
              const sections = parseLyricsToSections(song.lyrics);
              setInitialSections(sections);
            }
          }
        } catch (error) {
          console.error('Failed to load song:', error);
        }
      };
      loadSong();
    } else {
      // Create new song
      const createSong = async () => {
        try {
          const response = await fetch('/api/songs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Untitled Song',
              status: 'draft',
              visibility: 'private',
            }),
          });

          if (response.ok) {
            const { song } = await response.json();
            setSongId(song.id);
            // Update URL without full navigation
            window.history.replaceState({}, '', `/songwriting?id=${song.id}`);
          }
        } catch (error) {
          console.error('Failed to create song:', error);
        }
      };
      createSong();
    }
  }, [user?.id, songId]);

  // Debounced auto-save
  const autoSave = useCallback(
    async (data: { title?: string; lyrics?: string }) => {
      if (!songId) return;

      const dataString = JSON.stringify(data);
      if (dataString === lastSavedRef.current) return;

      setSaveStatus('saving');

      try {
        const response = await fetch(`/api/songs/${songId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          lastSavedRef.current = dataString;
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    },
    [songId]
  );

  // Handle sections change with debounced save
  const handleSectionsChange = useCallback(
    (sections: SongSection[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      const lyrics = sectionsToLyrics(sections);
      saveTimerRef.current = setTimeout(() => autoSave({ lyrics }), 2000);
    },
    [autoSave]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => autoSave({ title }), 2000);
    },
    [autoSave]
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="px-6 py-12">
        {/* Save status — tiny LED indicator */}
        <div className="fixed right-6 top-20 z-10 flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full transition-colors duration-500"
            style={{
              backgroundColor:
                saveStatus === 'saving'
                  ? 'var(--gold)'
                  : saveStatus === 'saved'
                    ? 'var(--sage)'
                    : saveStatus === 'error'
                      ? '#EF4444'
                      : 'transparent',
            }}
          />
          {saveStatus === 'saving' && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Saving...
            </span>
          )}
        </div>

        {/* Invite button — always available */}
        {songId && (
          <div className="fixed right-6 top-28 z-10 flex items-center gap-2">
            {/* Collaborator avatars */}
            {collaborators.map((c, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: c.userColor }}
                title={c.userName}
              >
                {c.userName.charAt(0).toUpperCase()}
              </div>
            ))}

            {/* Invite button */}
            <button
              onClick={() => setShowInvite(true)}
              className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all hover:bg-white/5"
              style={{
                border: '1px dashed var(--border)',
                color: 'var(--muted)',
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Invite</span>
            </button>
          </div>
        )}

        {/* Invite panel */}
        {songId && (
          <InviteCollaborator
            songId={songId}
            songTitle={initialTitle}
            isOpen={showInvite}
            onClose={() => setShowInvite(false)}
          />
        )}

        {/* The writing surface */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          // Add bottom padding when talkback strip is visible
          style={{ paddingBottom: collaborators.length > 0 ? '72px' : '0' }}
        >
          <SongEditor
            title={initialTitle}
            initialSections={initialSections}
            onTitleChange={handleTitleChange}
            onSectionsChange={handleSectionsChange}
          />
        </motion.div>
      </div>

      {/* The Room — talkback strip */}
      {songId && user && (
        <TalkbackStrip
          songId={songId}
          userId={user.id}
          userName={user.name || user.email?.split('@')[0] || 'You'}
          userColor="#e85d3b"
          collaborators={collaborators}
        />
      )}
    </div>
  );
}

// ============================================
// Helpers: parse lyrics <-> sections
// ============================================

function parseLyricsToSections(lyrics: string): SongSection[] {
  const sections: SongSection[] = [];
  // Split on section headers like [Verse], [Chorus], etc.
  const parts = lyrics.split(/\n*(\[[^\]]+\])\n*/);

  let currentType: SongSection['type'] = 'freeform';

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check if this part is a section header
    const headerMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (headerMatch) {
      const label = headerMatch[1].toLowerCase().trim();
      if (label.startsWith('verse')) currentType = 'verse';
      else if (label.startsWith('chorus')) currentType = 'chorus';
      else if (label.startsWith('bridge')) currentType = 'bridge';
      else if (label.startsWith('pre-chorus') || label.startsWith('pre chorus')) currentType = 'pre-chorus';
      else if (label.startsWith('intro')) currentType = 'intro';
      else if (label.startsWith('outro')) currentType = 'outro';
      else currentType = 'freeform';
      continue;
    }

    // This is content — create a section
    sections.push({
      id: Math.random().toString(36).substring(2, 10),
      type: currentType,
      content: trimmed,
    });
    currentType = 'freeform'; // Reset after using
  }

  return sections.length > 0 ? sections : [{ id: Math.random().toString(36).substring(2, 10), type: 'freeform', content: '' }];
}

function sectionsToLyrics(sections: SongSection[]): string {
  return sections
    .map((s) => {
      const label = s.type !== 'freeform'
        ? `[${s.type.charAt(0).toUpperCase() + s.type.slice(1)}]\n`
        : '';
      return `${label}${s.content}`;
    })
    .join('\n\n');
}
