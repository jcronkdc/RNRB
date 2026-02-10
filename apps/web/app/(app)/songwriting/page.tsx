'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { SongEditor, type SongSection } from '@/components/songwriting/song-editor';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function SongwritingPage() {
  useRequireAuth();
  const { data: session } = useSession();
  const [songId, setSongId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  // Create a song on first load
  useEffect(() => {
    if (!session?.user?.id || songId) return;

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
        }
      } catch (error) {
        console.error('Failed to create song:', error);
      }
    };

    createSong();
  }, [session?.user?.id, songId]);

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

      // Convert sections to lyrics string
      const lyrics = sections
        .map((s) => {
          const label = s.type !== 'freeform'
            ? `[${s.type.charAt(0).toUpperCase() + s.type.slice(1)}]\n`
            : '';
          return `${label}${s.content}`;
        })
        .join('\n\n');

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

        {/* The writing surface */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SongEditor
            title="Untitled Song"
            onTitleChange={handleTitleChange}
            onSectionsChange={handleSectionsChange}
          />
        </motion.div>
      </div>
    </div>
  );
}
