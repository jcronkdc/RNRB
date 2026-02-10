'use client';

/**
 * Song Editor — The Writing Surface
 *
 * The core of the product. A text editor that feels like writing on paper.
 *
 * Design principles:
 * - Every click lands on the exact word you intended
 * - Generous line height (1.8) for readability
 * - Warm typography — the text feels like a lyric sheet, not a code editor
 * - Sections auto-detected from [Verse], [Chorus], etc. typed in text
 * - No toolbar competes with the writing
 * - The empty state is a blank page with a blinking cursor
 *
 * Technical approach:
 * - Uses native <textarea> per section for pixel-perfect cursor placement
 * - No contentEditable (unreliable click targets across browsers)
 * - Each section is an independent textarea so selections don't span sections
 * - Sections are rendered as a vertical list with subtle type indicators
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GripVertical, ChevronDown } from '@/components/ui/custom-icons';
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';

// ============================================
// Types
// ============================================

export type SectionType = 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro' | 'freeform';

export interface ChordAnnotation {
  /** Which line (0-indexed) the chord sits above */
  line: number;
  /** Character offset within the line where the chord starts */
  offset: number;
  /** The chord text (e.g., "G", "Am", "Cmaj7") */
  chord: string;
}

export interface SongSection {
  id: string;
  type: SectionType;
  content: string;
  chords?: ChordAnnotation[];
}

export interface SongEditorProps {
  /** Initial sections to render */
  initialSections?: SongSection[];
  /** Called when sections change (for auto-save) */
  onSectionsChange?: (sections: SongSection[]) => void;
  /** Song title */
  title?: string;
  /** Called when title changes */
  onTitleChange?: (title: string) => void;
  /** Read-only mode */
  readOnly?: boolean;
}

// ============================================
// Constants
// ============================================

const SECTION_TYPES: { type: SectionType; label: string; shortLabel: string }[] = [
  { type: 'verse', label: 'Verse', shortLabel: 'V' },
  { type: 'chorus', label: 'Chorus', shortLabel: 'C' },
  { type: 'bridge', label: 'Bridge', shortLabel: 'B' },
  { type: 'pre-chorus', label: 'Pre-Chorus', shortLabel: 'PC' },
  { type: 'intro', label: 'Intro', shortLabel: 'I' },
  { type: 'outro', label: 'Outro', shortLabel: 'O' },
];

const SECTION_COLORS: Record<SectionType, string> = {
  verse: '#3B82F6',
  chorus: '#F59E0B',
  bridge: '#8B5CF6',
  'pre-chorus': '#10B981',
  intro: '#EC4899',
  outro: '#6366F1',
  freeform: '#6B7280',
};

// Auto-detect section labels from typed text
const SECTION_PATTERNS: [RegExp, SectionType][] = [
  [/^\[?\s*verse\s*\d*\s*\]?\s*$/i, 'verse'],
  [/^\[?\s*chorus\s*\d*\s*\]?\s*$/i, 'chorus'],
  [/^\[?\s*bridge\s*\d*\s*\]?\s*$/i, 'bridge'],
  [/^\[?\s*pre[- ]?chorus\s*\d*\s*\]?\s*$/i, 'pre-chorus'],
  [/^\[?\s*intro\s*\]?\s*$/i, 'intro'],
  [/^\[?\s*outro\s*\]?\s*$/i, 'outro'],
];

function detectSectionType(line: string): SectionType | null {
  const trimmed = line.trim();
  for (const [pattern, type] of SECTION_PATTERNS) {
    if (pattern.test(trimmed)) return type;
  }
  return null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function getSectionNumber(sections: SongSection[], index: number): string {
  const section = sections[index];
  if (!section || section.type === 'freeform' || section.type === 'intro' || section.type === 'outro') return '';
  
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (sections[i].type === section.type) count++;
  }
  
  // Only show number if there are multiple of this type
  const totalOfType = sections.filter((s) => s.type === section.type).length;
  return totalOfType > 1 ? ` ${count}` : '';
}

// ============================================
// Section Component
// ============================================

const SectionEditor = memo(function SectionEditor({
  section,
  sectionLabel,
  onContentChange,
  onChordsChange,
  onTypeChange,
  onRemove,
  onKeyDown,
  autoFocus,
  readOnly,
}: {
  section: SongSection;
  sectionLabel: string;
  onContentChange: (content: string) => void;
  onChordsChange: (chords: ChordAnnotation[]) => void;
  onTypeChange: (type: SectionType) => void;
  onRemove: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
  readOnly?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chordLayerRef = useRef<HTMLDivElement>(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [editingChord, setEditingChord] = useState<{ line: number; offset: number } | null>(null);
  const [chordInputValue, setChordInputValue] = useState('');
  const color = SECTION_COLORS[section.type];

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
  }, [section.content]);

  // Auto-focus when newly created
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  return (
    <div className="group relative">
      {/* Section type indicator — left edge line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-full transition-opacity"
        style={{
          backgroundColor: color,
          opacity: section.type === 'freeform' ? 0 : 0.5,
        }}
      />

      {/* Section header — subtle label with adequate touch targets */}
      <div className="mb-1 ml-4 flex items-center gap-1">
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-white/5"
          style={{ color: color, opacity: section.type === 'freeform' ? 0.4 : 0.7 }}
        >
          {section.type === 'freeform' ? 'Section' : sectionLabel}
          <ChevronDown className="h-3 w-3" />
        </button>

        {/* Type menu */}
        <AnimatePresence>
          {showTypeMenu && (
            <>
              {/* Full-screen dismiss backdrop */}
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowTypeMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-4 top-10 z-30 overflow-hidden rounded-lg"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div className="p-1">
                  {SECTION_TYPES.map((st) => (
                    <button
                      key={st.type}
                      onClick={() => {
                        onTypeChange(st.type);
                        setShowTypeMenu(false);
                      }}
                      className="flex min-h-[40px] w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: SECTION_COLORS[st.type] }}
                      />
                      <span style={{ color: 'var(--text)' }}>{st.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Remove button — only visible on hover, minimum touch target */}
        <button
          onClick={onRemove}
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-100 hover:bg-white/5"
          style={{ color: 'var(--muted)' }}
          title="Remove section"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Chord overlay — sits above the textarea, pointer-events: none
          so all clicks pass through to the textarea below.
          Chords are positioned relative to text lines using line-height math. */}
      {section.chords && section.chords.length > 0 && (
        <div
          ref={chordLayerRef}
          className="pointer-events-none absolute"
          style={{
            top: '40px', // Below the section header
            left: '20px',
            right: '16px',
            fontSize: '12px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            lineHeight: '1.8',
            color: 'var(--accent)',
            opacity: 0.8,
          }}
        >
          {section.content.split('\n').map((line, lineIndex) => {
            const lineChords = (section.chords || []).filter((c) => c.line === lineIndex);
            if (lineChords.length === 0) return null;

            return (
              <div
                key={lineIndex}
                className="relative"
                style={{
                  height: '0',
                  // Position the chord line directly above the corresponding lyric line
                  // Each lyric line is 16px * 1.8 = 28.8px tall
                  // We offset upward by ~14px to sit above the text
                  top: `${lineIndex * 28.8 - 14}px`,
                }}
              >
                {lineChords.map((chord, ci) => (
                  <span
                    key={ci}
                    className="absolute whitespace-nowrap"
                    style={{
                      // Approximate character width for monospace positioning
                      // This is an approximation — Inter at 16px is ~8px per char
                      left: `${chord.offset * 8.2}px`,
                    }}
                  >
                    {chord.chord}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Chord input — appears when double-clicking above a word */}
      {editingChord && (
        <div
          className="absolute z-10"
          style={{
            top: `${40 + editingChord.line * 28.8 - 18}px`,
            left: `${20 + editingChord.offset * 8.2}px`,
          }}
        >
          <input
            type="text"
            value={chordInputValue}
            onChange={(e) => setChordInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (chordInputValue.trim()) {
                  const existing = (section.chords || []).filter(
                    (c) => !(c.line === editingChord.line && c.offset === editingChord.offset)
                  );
                  onChordsChange([...existing, { line: editingChord.line, offset: editingChord.offset, chord: chordInputValue.trim() }]);
                }
                setEditingChord(null);
                setChordInputValue('');
              }
              if (e.key === 'Escape') {
                setEditingChord(null);
                setChordInputValue('');
              }
              if (e.key === 'Backspace' && chordInputValue === '') {
                // Remove the chord at this position
                const existing = (section.chords || []).filter(
                  (c) => !(c.line === editingChord.line && c.offset === editingChord.offset)
                );
                onChordsChange(existing);
                setEditingChord(null);
              }
            }}
            onBlur={() => {
              if (chordInputValue.trim()) {
                const existing = (section.chords || []).filter(
                  (c) => !(c.line === editingChord.line && c.offset === editingChord.offset)
                );
                onChordsChange([...existing, { line: editingChord.line, offset: editingChord.offset, chord: chordInputValue.trim() }]);
              }
              setEditingChord(null);
              setChordInputValue('');
            }}
            autoFocus
            className="w-16 rounded border-0 px-1 py-0.5 text-xs font-semibold outline-none"
            style={{
              background: 'var(--panel)',
              color: 'var(--accent)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              caretColor: 'var(--accent)',
            }}
            placeholder="Chord"
          />
        </div>
      )}

      {/* The textarea — the actual writing surface */}
      {/* 
        Using native <textarea> because:
        1. Click/tap targets are pixel-accurate (browser handles it)
        2. Cursor placement is exact (no contentEditable quirks)
        3. Selection, copy/paste, undo/redo all work natively
        4. IME input (international keyboards) works correctly
        5. Accessibility (screen readers) works out of the box
      */}
      <textarea
        ref={textareaRef}
        value={section.content}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        placeholder="Start writing..."
        className="w-full resize-none border-0 bg-transparent outline-none"
        style={{
          color: 'var(--text)',
          fontSize: '16px',
          lineHeight: '1.8',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontWeight: 400,
          letterSpacing: '0.01em',
          caretColor: 'var(--accent)',
          minHeight: '72px',
          // Generous padding for click targets — especially important on touch
          // The padding IS the click target extension
          padding: '8px 16px 8px 16px',
          marginLeft: '4px', // Clear the left color bar
          // Prevent iOS zoom on focus (font-size >= 16px handles this)
        }}
        spellCheck
        autoCapitalize="sentences"
        autoCorrect="on"
        // Prevent iOS from adding special behaviors
        autoComplete="off"
        data-gramm="false" // Prevent Grammarly overlay interference
        data-gramm_editor="false"
        // Double-click to place a chord above the cursor position
        onDoubleClick={(e) => {
          if (readOnly) return;
          const textarea = e.currentTarget;
          const cursorPos = textarea.selectionStart;
          const textBefore = textarea.value.substring(0, cursorPos);
          const lastNewline = textBefore.lastIndexOf('\n');
          const line = textBefore.split('\n').length - 1;
          const offset = cursorPos - lastNewline - 1;

          // Find existing chord at this position
          const existingChord = (section.chords || []).find(
            (c) => c.line === line && Math.abs(c.offset - offset) < 3
          );

          setChordInputValue(existingChord?.chord || '');
          setEditingChord({ line, offset });
        }}
      />
    </div>
  );
});

// ============================================
// Main Editor Component
// ============================================

export function SongEditor({
  initialSections,
  onSectionsChange,
  title: initialTitle = '',
  onTitleChange,
  readOnly = false,
}: SongEditorProps) {
  const [sections, setSections] = useState<SongSection[]>(
    initialSections ?? [{ id: generateId(), type: 'freeform', content: '' }]
  );
  const [title, setTitle] = useState(initialTitle);
  const [newSectionIndex, setNewSectionIndex] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Notify parent of changes
  useEffect(() => {
    onSectionsChange?.(sections);
  }, [sections, onSectionsChange]);

  useEffect(() => {
    onTitleChange?.(title);
  }, [title, onTitleChange]);

  // Update section content
  const updateSectionContent = useCallback((id: string, content: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
  }, []);

  // Update section chords
  const updateSectionChords = useCallback((id: string, chords: ChordAnnotation[]) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, chords } : s))
    );
  }, []);

  // Change section type
  const changeSectionType = useCallback((id: string, type: SectionType) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, type } : s))
    );
  }, []);

  // Remove a section
  const removeSection = useCallback((id: string) => {
    setSections((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      // Always keep at least one section
      return filtered.length === 0
        ? [{ id: generateId(), type: 'freeform' as SectionType, content: '' }]
        : filtered;
    });
  }, []);

  // Add a new section after a specific index
  const addSection = useCallback((afterIndex: number, type: SectionType = 'freeform') => {
    const newId = generateId();
    setSections((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, {
        id: newId,
        type,
        content: '',
      });
      return next;
    });
    setNewSectionIndex(afterIndex + 1);
    setShowAddMenu(false);
    // Clear auto-focus after a tick
    setTimeout(() => setNewSectionIndex(null), 100);
  }, []);

  // Handle keyboard events in sections
  const handleSectionKeyDown = useCallback(
    (sectionId: string, e: KeyboardEvent<HTMLTextAreaElement>) => {
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      const target = e.currentTarget;

      // Cmd/Ctrl + Enter: add a new section after this one
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        addSection(sectionIndex, 'freeform');
        return;
      }

      // Enter at the end of a section that IS a section label
      // converts it and clears the text (e.g., type "[Verse]" + Enter)
      if (e.key === 'Enter' && !e.shiftKey) {
        const content = target.value;
        const cursorPos = target.selectionStart;
        const firstLine = content.split('\n')[0];
        const detectedType = detectSectionType(firstLine);

        if (detectedType && cursorPos === content.length && content.split('\n').length <= 1) {
          e.preventDefault();
          changeSectionType(sectionId, detectedType);
          updateSectionContent(sectionId, '');
          return;
        }
      }

      // Backspace at the start of an empty section removes it
      // and focuses the previous section
      if (e.key === 'Backspace') {
        if (target.selectionStart === 0 && target.selectionEnd === 0 && target.value === '') {
          e.preventDefault();
          if (sections.length > 1) {
            removeSection(sectionId);
          }
        }
      }

      // Tab: indent with 2 spaces (don't leave the editor)
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;

        if (e.shiftKey) {
          // Shift+Tab: remove leading spaces on current line
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const lineText = value.substring(lineStart);
          if (lineText.startsWith('  ')) {
            const newValue = value.substring(0, lineStart) + lineText.substring(2);
            updateSectionContent(sectionId, newValue);
            // Restore cursor position
            setTimeout(() => {
              target.selectionStart = target.selectionEnd = Math.max(start - 2, lineStart);
            }, 0);
          }
        } else {
          // Tab: insert 2 spaces
          const newValue = value.substring(0, start) + '  ' + value.substring(end);
          updateSectionContent(sectionId, newValue);
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + 2;
          }, 0);
        }
      }
    },
    [sections, addSection, changeSectionType, updateSectionContent, removeSection]
  );

  return (
    <div
      className="mx-auto w-full max-w-2xl"
      style={{ minHeight: '70vh' }}
    >
      {/* Title */}
      <div className="mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Song"
          readOnly={readOnly}
          className="w-full border-0 bg-transparent text-2xl font-light outline-none"
          style={{
            color: 'var(--text)',
            caretColor: 'var(--accent)',
            letterSpacing: '-0.01em',
            lineHeight: '1.4',
          }}
        />
        <div
          className="mt-2 h-px w-12"
          style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}
        />
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <SectionEditor
            key={section.id}
            section={section}
            sectionLabel={
              section.type === 'freeform'
                ? 'Section'
                : `${SECTION_TYPES.find((t) => t.type === section.type)?.label || section.type}${getSectionNumber(sections, index)}`
            }
            onContentChange={(content) => updateSectionContent(section.id, content)}
            onChordsChange={(chords) => updateSectionChords(section.id, chords)}
            onTypeChange={(type) => changeSectionType(section.id, type)}
            onRemove={() => removeSection(section.id)}
            onKeyDown={(e) => handleSectionKeyDown(section.id, e)}
            autoFocus={newSectionIndex === index}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Add section — floating button */}
      {!readOnly && (
        <div className="relative mt-6 flex justify-center" ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all hover:bg-white/5"
            style={{
              color: 'var(--muted)',
              border: '1px dashed var(--border)',
            }}
          >
            <Plus className="h-4 w-4" />
            Add section
          </button>

          <AnimatePresence>
            {showAddMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full z-20 mt-2 overflow-hidden rounded-xl"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="p-1.5">
                    {SECTION_TYPES.map((st) => (
                      <button
                        key={st.type}
                        onClick={() => addSection(sections.length - 1, st.type)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: SECTION_COLORS[st.type] }}
                        />
                        <span style={{ color: 'var(--text)' }}>{st.label}</span>
                      </button>
                    ))}
                    <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
                    <button
                      onClick={() => addSection(sections.length - 1, 'freeform')}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: SECTION_COLORS.freeform }}
                      />
                      <span style={{ color: 'var(--muted)' }}>Freeform</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
