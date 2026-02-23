'use client';

/**
 * Live Chord Annotation Component
 *
 * Multiple musicians annotate chords in real-time.
 * See who added which chord and discuss alternatives.
 */

import { motion, AnimatePresence } from 'motion/react';
import {
  Music2,
  Plus,
  Trash2,
  Undo,
  Redo,
  MessageSquare,
  ThumbsUp,
  Check,
  Users,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';
import { useState, useCallback } from 'react';

import { useLiveChordAnnotation, type ChordAnnotation } from '@/hooks/use-live-chord-annotation';

// Common chord library
const CHORD_LIBRARY = {
  major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  minor: ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'],
  seventh: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7'],
  majSeventh: ['Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7'],
  minSeventh: ['Am7', 'Bm7', 'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7'],
  sus: ['Csus2', 'Csus4', 'Dsus2', 'Dsus4', 'Gsus2', 'Gsus4'],
};

interface LiveChordAnnotationProps {
  channelName: string;
  userId: string;
  userName: string;
  userColor?: string;
  lyrics: string;
}

export function LiveChordAnnotation({
  channelName,
  userId,
  userName,
  userColor,
  lyrics,
}: LiveChordAnnotationProps) {
  const {
    annotations,
    suggestions,
    isConnected,
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
    canUndo,
    canRedo,
  } = useLiveChordAnnotation({
    channelName,
    userId,
    userName,
    userColor,
  });

  const [selectedPosition, setSelectedPosition] = useState<{
    lineIndex: number;
    wordIndex: number;
  } | null>(null);
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [expandedAnnotation, setExpandedAnnotation] = useState<string | null>(null);
  const [newSuggestion, setNewSuggestion] = useState({ chord: '', reason: '' });

  // Parse lyrics into lines
  const lines = lyrics.split('\n');

  // Handle word click to add chord
  const handleWordClick = (lineIndex: number, wordIndex: number) => {
    setSelectedPosition({ lineIndex, wordIndex });
    setShowChordPicker(true);
  };

  // Add chord at selected position
  const handleAddChord = (chord: string) => {
    if (!selectedPosition) return;
    addChord(selectedPosition.lineIndex, selectedPosition.wordIndex, chord);
    setShowChordPicker(false);
    setSelectedPosition(null);
  };

  // Render a line with chord annotations
  const renderLine = (line: string, lineIndex: number) => {
    const lineChords = getChordsForLine(lineIndex);
    const words = line.split(' ');

    // Check if it's a section header
    const isSectionHeader = /^\[.+\]$/.test(line.trim());

    if (isSectionHeader) {
      return (
        <div
          key={lineIndex}
          className="mb-2 mt-6 text-sm font-bold uppercase tracking-wider"
          style={{ color: 'var(--accent)' }}
        >
          {line}
        </div>
      );
    }

    if (!line.trim()) {
      return <div key={lineIndex} className="h-6" />;
    }

    return (
      <div key={lineIndex} className="mb-4">
        {/* Chord row */}
        <div className="flex flex-wrap gap-1" style={{ minHeight: 28 }}>
          {words.map((word, wordIndex) => {
            const chord = lineChords.find((c) => c.wordIndex === wordIndex);
            const isSelected =
              selectedPosition?.lineIndex === lineIndex &&
              selectedPosition?.wordIndex === wordIndex;

            return (
              <div key={wordIndex} className="relative" style={{ minWidth: word.length * 10 + 8 }}>
                {chord ? (
                  <button
                    onClick={() =>
                      setExpandedAnnotation(expandedAnnotation === chord.id ? null : chord.id)
                    }
                    className="rounded px-2 py-0.5 text-sm font-bold transition-all hover:scale-105"
                    style={{
                      background: `${chord.userColor}30`,
                      color: chord.userColor,
                      border: `1px solid ${chord.userColor}50`,
                    }}
                  >
                    {chord.chord}
                  </button>
                ) : (
                  <button
                    onClick={() => handleWordClick(lineIndex, wordIndex)}
                    className={`h-6 w-full rounded opacity-0 transition-opacity hover:opacity-100 ${
                      isSelected ? 'opacity-100' : ''
                    }`}
                    style={{
                      background: 'var(--accent-soft)',
                      border: '1px dashed var(--accent)',
                    }}
                  >
                    <Plus className="mx-auto h-3 w-3" style={{ color: 'var(--accent)' }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Lyrics row */}
        <div className="flex flex-wrap gap-1">
          {words.map((word, wordIndex) => (
            <span
              key={wordIndex}
              className="cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-white/5"
              style={{ color: 'var(--text)' }}
              onClick={() => handleWordClick(lineIndex, wordIndex)}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent-soft)' }}
          >
            <Music2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              Live Chord Annotation
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {isConnected ? (
                <>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                  {annotations.length} chords annotated
                </>
              ) : (
                'Connecting...'
              )}
            </p>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Redo">
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lyrics with Chords */}
      <div className="p-6">{lines.map((line, index) => renderLine(line, index))}</div>

      {/* Chord Picker Modal */}
      <AnimatePresence>
        {showChordPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowChordPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 font-semibold" style={{ color: 'var(--text)' }}>
                Select Chord
              </h3>

              {Object.entries(CHORD_LIBRARY).map(([category, chords]) => (
                <div key={category} className="mb-4">
                  <h4
                    className="mb-2 text-xs font-medium uppercase"
                    style={{ color: 'var(--muted)' }}
                  >
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {chords.map((chord) => (
                      <button
                        key={chord}
                        onClick={() => handleAddChord(chord)}
                        className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:scale-105"
                        style={{
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {chord}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setShowChordPicker(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Annotation (suggestions, alternatives) */}
      <AnimatePresence>
        {expandedAnnotation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {(() => {
              const annotation = annotations.find((a) => a.id === expandedAnnotation);
              if (!annotation) return null;

              const annotationSuggestions = getSuggestionsForAnnotation(annotation.id);

              return (
                <div className="p-6">
                  {/* Current Chord */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-xl px-4 py-2 text-xl font-bold"
                        style={{
                          background: `${annotation.userColor}30`,
                          color: annotation.userColor,
                        }}
                      >
                        {annotation.chord}
                      </span>
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text)' }}>
                          Added by {annotation.userName}
                        </p>
                        {annotation.alternatives && annotation.alternatives.length > 0 && (
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            Common follows: {annotation.alternatives.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {annotation.userId === userId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeChord(annotation.id);
                            setExpandedAnnotation(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {annotationSuggestions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                        Suggestions
                      </h4>
                      <div className="space-y-2">
                        {annotationSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="flex items-center justify-between rounded-xl p-3"
                            style={{ background: 'var(--bg)' }}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="rounded-lg px-3 py-1 font-bold"
                                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                              >
                                {suggestion.suggestedChord}
                              </span>
                              <div>
                                <p className="text-sm" style={{ color: 'var(--text)' }}>
                                  {suggestion.userName}
                                </p>
                                {suggestion.reason && (
                                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                    {suggestion.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => voteOnSuggestion(annotation.id, suggestion.id)}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm"
                                style={{
                                  background: suggestion.votes.includes(userId)
                                    ? 'var(--accent-soft)'
                                    : 'transparent',
                                  color: suggestion.votes.includes(userId)
                                    ? 'var(--accent)'
                                    : 'var(--muted)',
                                }}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {suggestion.votes.length}
                              </button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => acceptSuggestion(annotation.id, suggestion.id)}
                              >
                                <Check className="mr-1 h-3 w-3" />
                                Use
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Suggestion */}
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg)' }}>
                    <h4
                      className="mb-2 flex items-center gap-2 text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Suggest Alternative
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSuggestion.chord}
                        onChange={(e) =>
                          setNewSuggestion({ ...newSuggestion, chord: e.target.value })
                        }
                        placeholder="Chord (e.g., Am7)"
                        className="w-24 rounded-lg px-3 py-2 text-sm"
                        style={{
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <input
                        type="text"
                        value={newSuggestion.reason}
                        onChange={(e) =>
                          setNewSuggestion({ ...newSuggestion, reason: e.target.value })
                        }
                        placeholder="Why? (optional)"
                        className="flex-1 rounded-lg px-3 py-2 text-sm"
                        style={{
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newSuggestion.chord) {
                            suggestChord(
                              annotation.id,
                              newSuggestion.chord,
                              newSuggestion.reason || undefined
                            );
                            setNewSuggestion({ chord: '', reason: '' });
                          }
                        }}
                        disabled={!newSuggestion.chord}
                      >
                        Suggest
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Collaborators */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {annotations.length} chord{annotations.length !== 1 ? 's' : ''} • Click words to add
          chords
        </span>
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3" style={{ color: 'var(--muted)' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {new Set(annotations.map((a) => a.userId)).size} contributor
            {new Set(annotations.map((a) => a.userId)).size !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
