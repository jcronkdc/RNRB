'use client';

import { AnimatePresence, motion } from 'motion/react';
import { FileText, Sparkles, X, Check, AlertCircle } from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

import {
  smartParseLyrics,
  getSectionSummary,
  parseLyricsToBlocks,
  hasSectionMarkers,
  type ParsedSection,
} from '@/lib/lyrics-parser';

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';
  content: string;
  chordPlacements?: Array<{ wordIndex: number; lineIndex: number; chord: string }>;
};

type PasteLyricsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (blocks: SongBlock[], rawLyrics: string) => void;
};

export function PasteLyricsModal({ isOpen, onClose, onImport }: PasteLyricsModalProps) {
  const [lyrics, setLyrics] = useState('');
  const [preview, setPreview] = useState<ParsedSection[]>([]);
  const [hasMarkers, setHasMarkers] = useState(false);

  // Live preview parsing
  useEffect(() => {
    if (lyrics.trim()) {
      const sections = smartParseLyrics(lyrics);
      setPreview(sections);
      setHasMarkers(hasSectionMarkers(lyrics));
    } else {
      setPreview([]);
      setHasMarkers(false);
    }
  }, [lyrics]);

  const handleLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLyrics(e.target.value);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      const blocks = parseLyricsToBlocks(lyrics);
      onImport(blocks, lyrics);
      setLyrics('');
      onClose();
    }
  };

  const handleClose = () => {
    setLyrics('');
    onClose();
  };

  // Get section color
  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      verse: '#3B82F6',
      chorus: '#F59E0B',
      bridge: '#8B5CF6',
      'pre-chorus': '#10B981',
      intro: '#EC4899',
      outro: '#6366F1',
    };
    return colors[type] || '#6B7280';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b p-6"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.1))',
                }}
              >
                <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                  Paste Lyrics
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Auto-detects verses, choruses, bridges & more
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 transition hover:opacity-80"
              style={{ background: 'var(--panel)' }}
            >
              <X className="h-5 w-5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden p-6">
            {/* Input */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                Paste your lyrics
              </label>
              <textarea
                value={lyrics}
                onChange={handleLyricsChange}
                placeholder={`Paste your lyrics here...

Example formats:
[Verse 1]
First verse lyrics...

[Chorus]
Chorus lyrics...

Or just paste plain text - we'll auto-detect sections!`}
                className="flex-1 resize-none rounded-xl p-4 font-mono text-sm outline-hidden"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  minHeight: '300px',
                }}
                autoFocus
              />

              {/* Hint */}
              <div
                className="mt-3 flex items-start gap-2 rounded-lg p-3"
                style={{ background: 'var(--panel)' }}
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Pro tip:</strong> Use markers like
                  [Verse], [Chorus], [Bridge] for best results. We also detect (Chorus), VERSE:, and
                  other common formats.
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Preview
                </label>
                {preview.length > 0 && (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {getSectionSummary(preview)}
                  </span>
                )}
              </div>

              <div
                className="flex-1 overflow-y-auto rounded-xl p-4"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  minHeight: '300px',
                }}
              >
                {preview.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <FileText className="mb-3 h-10 w-10" style={{ color: 'var(--muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Paste lyrics to see preview
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!hasMarkers && (
                      <div
                        className="flex items-center gap-2 rounded-lg p-2 text-xs"
                        style={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        <span style={{ color: 'var(--text)' }}>
                          No markers detected - sections auto-detected based on patterns
                        </span>
                      </div>
                    )}

                    {preview.map((section, i) => {
                      const color = getColor(section.type);
                      return (
                        <div
                          key={section.id}
                          className="rounded-lg p-3"
                          style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className="rounded px-1.5 py-0.5 text-xs font-bold uppercase"
                              style={{ background: `${color}20`, color }}
                            >
                              {section.type.replace('-', ' ')}
                            </span>
                            {section.originalLabel && (
                              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                from "{section.originalLabel}"
                              </span>
                            )}
                          </div>
                          <p
                            className="line-clamp-3 whitespace-pre-wrap text-xs"
                            style={{ color: 'var(--text)' }}
                          >
                            {section.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t p-6"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            <button
              onClick={handleClose}
              className="rounded-xl px-6 py-2.5 text-sm font-medium transition"
              style={{ background: 'var(--background)', color: 'var(--text)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={preview.length === 0}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              <Check className="h-4 w-4" />
              Import {preview.length} Section{preview.length !== 1 ? 's' : ''}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
