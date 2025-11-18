'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Music2, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { transposeAllChords } from '@/lib/transpose-chords';

/**
 * Chord + Lyrics Editor
 * Click above any line to add chords (A, Bb, C#m, etc.)
 * AI suggests chord progressions for sections
 * Auto-transposes chords when key changes
 * Mobile-friendly touch interface
 */

interface ChordPosition {
  lineIndex: number;
  position: number; // Character position in line
  chord: string; // e.g. "Am", "G", "C", "Bb", "F#m"
}

interface ChordLyricsEditorProps {
  songId: string;
  initialLyrics: string;
  initialChords?: ChordPosition[];
  songKey?: string;
  onSave?: (lyrics: string, chords: ChordPosition[]) => void;
  onChordClick?: (chord: string, lineIndex: number, position: number) => void;
  onWordSelect?: (word: string, lineIndex: number, wordIndex: number) => void; // NEW: Make words clickable for rhymes
}

export default function ChordLyricsEditor({
  songId,
  initialLyrics,
  initialChords = [],
  songKey,
  onSave,
  onChordClick,
  onWordSelect,
}: ChordLyricsEditorProps) {
  const [lyrics, setLyrics] = useState(initialLyrics);
  const [chords, setChords] = useState<ChordPosition[]>(initialChords);
  const [editingChord, setEditingChord] = useState<{ lineIndex: number; position: number } | null>(null);
  const [chordInput, setChordInput] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ start: number; end: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileActiveLine, setMobileActiveLine] = useState<number | null>(null);
  const previousKey = useRef<string | undefined>(songKey);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-transpose chords when key changes
  useEffect(() => {
    if (songKey && previousKey.current && songKey !== previousKey.current && chords.length > 0) {
      const transposed = transposeAllChords(chords, previousKey.current, songKey);
      setChords(transposed);
    }
    previousKey.current = songKey;
  }, [songKey]);

  const lines = lyrics.split('\n');

  // Get chords for a specific line
  const getChordsForLine = (lineIndex: number) => {
    return chords.filter(c => c.lineIndex === lineIndex).sort((a, b) => a.position - b.position);
  };

  // Add or update chord
  const setChord = (lineIndex: number, position: number, chord: string) => {
    if (!chord.trim()) {
      // Remove chord
      setChords(chords.filter(c => !(c.lineIndex === lineIndex && c.position === position)));
      return;
    }

    const existing = chords.findIndex(c => c.lineIndex === lineIndex && c.position === position);
    if (existing >= 0) {
      // Update existing
      const updated = [...chords];
      updated[existing] = { lineIndex, position, chord: chord.trim() };
      setChords(updated);
    } else {
      // Add new
      setChords([...chords, { lineIndex, position, chord: chord.trim() }]);
    }
  };

  // Get AI chord suggestions for a section
  const getAISuggestions = async (sectionType: 'verse' | 'chorus' | 'bridge') => {
    setAiSuggesting(true);
    
    try {
      const response = await fetch('/api/ai/suggest-chords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: songKey || 'C',
          sectionType,
          lyrics: selectedSection 
            ? lines.slice(selectedSection.start, selectedSection.end + 1).join('\n')
            : '',
        }),
      });

      if (!response.ok) throw new Error('AI suggestion failed');

      const { suggestions } = await response.json();
      
      // Apply suggested chords
      if (suggestions && selectedSection) {
        const newChords = [...chords];
        suggestions.forEach((chord: string, index: number) => {
          const lineIndex = selectedSection.start + index;
          if (lineIndex <= selectedSection.end) {
            newChords.push({ lineIndex, position: 0, chord });
          }
        });
        setChords(newChords);
      }
    } catch (error) {
      console.error('AI chord suggestion error:', error);
    } finally {
      setAiSuggesting(false);
    }
  };

  // Save changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onSave) {
        onSave(lyrics, chords);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [lyrics, chords]);

  // Handle chord input submission
  const handleChordSubmit = (lineIndex: number, position: number) => {
    if (chordInput.trim()) {
      setChord(lineIndex, position, chordInput);
    }
    setChordInput('');
    setEditingChord(null);
  };

  return (
    <div className="space-y-4">
      {/* AI Chord Suggestions Toolbar */}
      {selectedSection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rnrb-card bg-brand-primary/5 border-brand-primary/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>
                Lines {selectedSection.start + 1}-{selectedSection.end + 1} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => getAISuggestions('verse')}
                disabled={aiSuggesting}
                className="px-3 py-1.5 bg-surface hover:bg-surface-muted rounded text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3 inline mr-1" />
                VERSE CHORDS
              </button>
              <button
                onClick={() => getAISuggestions('chorus')}
                disabled={aiSuggesting}
                className="px-3 py-1.5 bg-surface hover:bg-surface-muted rounded text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3 inline mr-1" />
                CHORUS CHORDS
              </button>
              <button
                onClick={() => getAISuggestions('bridge')}
                disabled={aiSuggesting}
                className="px-3 py-1.5 bg-surface hover:bg-surface-muted rounded text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3 inline mr-1" />
                BRIDGE CHORDS
              </button>
              <button
                onClick={() => setSelectedSection(null)}
                className="px-3 py-1.5 text-muted-foreground hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lyrics with Chords */}
      <div className="rnrb-card p-6 font-mono text-sm">
        <div className="space-y-6">
          {lines.map((line, lineIndex) => {
            const lineChords = getChordsForLine(lineIndex);
            const isBlank = line.trim() === '';
            const isSectionHeader = line.match(/^(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus)/i);
            
            return (
              <div key={lineIndex} className="group relative">
                {/* Chord Row */}
                <div className="relative h-6 mb-1">
                  {/* Existing chords */}
                  {lineChords.map((chordPos, chordIdx) => (
                    <button
                      key={chordIdx}
                      onClick={() => {
                        setEditingChord({ lineIndex, position: chordPos.position });
                        setChordInput(chordPos.chord);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (onChordClick) {
                          onChordClick(chordPos.chord, lineIndex, chordPos.position);
                        }
                      }}
                      style={{ position: 'absolute', left: `${chordPos.position * 0.6}ch` }}
                      className="px-2 py-0.5 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded text-xs font-bold text-brand-primary transition-colors cursor-pointer"
                      title="Left-click: Edit | Right-click: Explore alternatives"
                    >
                      {chordPos.chord}
                    </button>
                  ))}
                  
                  {/* Add chord button - mobile or desktop */}
                  {isMobile ? (
                    mobileActiveLine === lineIndex && (
                      <button
                        onClick={() => setEditingChord({ lineIndex, position: 0 })}
                        className="absolute left-0 top-0 px-3 py-1 bg-brand-primary text-brand-primary-foreground rounded text-xs font-semibold"
                      >
                        + ADD CHORD
                      </button>
                    )
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingChord({ lineIndex, position: 0 })}
                        className="absolute left-0 top-0 text-xs text-muted-foreground hover:text-brand-primary"
                      >
                        + Add Chord
                      </button>
                    </div>
                  )}
                </div>

                {/* Lyrics Line */}
                <div 
                  className="flex items-center gap-2"
                  onClick={() => isMobile && setMobileActiveLine(mobileActiveLine === lineIndex ? null : lineIndex)}
                >
                  <input
                    type="checkbox"
                    checked={selectedSection !== null && lineIndex >= selectedSection.start && lineIndex <= selectedSection.end}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (!selectedSection) {
                          setSelectedSection({ start: lineIndex, end: lineIndex });
                        } else {
                          setSelectedSection({
                            start: Math.min(selectedSection.start, lineIndex),
                            end: Math.max(selectedSection.end, lineIndex),
                          });
                        }
                      } else {
                        setSelectedSection(null);
                      }
                    }}
                    className={isMobile ? 'w-4 h-4' : 'w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity'}
                  />
                  
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => {
                      const newLines = [...lines];
                      newLines[lineIndex] = e.target.value;
                      setLyrics(newLines.join('\n'));
                    }}
                    onDoubleClick={(e) => {
                      if (!onWordSelect) return;
                      
                      const input = e.target as HTMLInputElement;
                      const clickPosition = input.selectionStart || 0;
                      const words = line.split(/\s+/);
                      let charCount = 0;
                      let wordIndex = 0;
                      
                      for (let i = 0; i < words.length; i++) {
                        charCount += words[i].length;
                        if (clickPosition <= charCount) {
                          wordIndex = i;
                          break;
                        }
                        charCount += 1; // Space
                      }
                      
                      const selectedWord = words[wordIndex]?.replace(/[.,!?;:]/g, '').toLowerCase();
                      if (selectedWord && selectedWord.length > 1) {
                        onWordSelect(selectedWord, lineIndex, wordIndex);
                      }
                    }}
                    className={`flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 ${
                      isSectionHeader ? 'font-bold text-brand-primary uppercase text-xs tracking-wider' :
                      isBlank ? 'text-muted-foreground/30' :
                      'text-foreground'
                    }`}
                    placeholder={isBlank ? '(blank line)' : 'Lyrics...'}
                    title="Double-click any word to find rhymes"
                  />
                </div>

                {/* Chord Input Modal */}
                <AnimatePresence>
                  {editingChord?.lineIndex === lineIndex && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-0 mt-1 z-10 p-3 bg-surface border border-brand-primary/50 rounded-lg shadow-xl"
                      style={{ left: `${editingChord.position * 0.6}ch` }}
                    >
                      <input
                        type="text"
                        value={chordInput}
                        onChange={(e) => setChordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleChordSubmit(lineIndex, editingChord.position);
                          } else if (e.key === 'Escape') {
                            setEditingChord(null);
                            setChordInput('');
                          }
                        }}
                        placeholder="C, Am, G7, Bb..."
                        autoFocus
                        className="w-24 px-2 py-1 bg-background border border-border rounded text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                      />
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => handleChordSubmit(lineIndex, editingChord.position)}
                          className="px-2 py-1 bg-brand-primary text-brand-primary-foreground rounded text-xs"
                        >
                          Set
                        </button>
                        <button
                          onClick={() => {
                            setEditingChord(null);
                            setChordInput('');
                          }}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p><strong>Add Chords:</strong> {isMobile ? 'Tap any line → Tap "+ ADD CHORD"' : 'Hover over any line → Click "+ Add Chord"'}</p>
        <p><strong>Edit Chords:</strong> {isMobile ? 'Tap' : 'Click'} any existing chord to change it</p>
        <p><strong>AI Suggestions:</strong> Select lines (checkbox) → {isMobile ? 'Tap' : 'Click'} "Verse/Chorus/Bridge Chords"</p>
        <p><strong>Auto-Transpose:</strong> Change song key in sidebar → All chords update automatically</p>
        <p><strong>Examples:</strong> C, Am, G, Dm, F, Bb, C#m, Abmaj7, Dsus4, F#m7</p>
      </div>
    </div>
  );
}
