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

export interface SongSection {
  id: string;
  type: SectionType;
  content: string;
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
  onTypeChange,
  onRemove,
  onKeyDown,
  autoFocus,
  readOnly,
}: {
  section: SongSection;
  sectionLabel: string;
  onContentChange: (content: string) => void;
  onTypeChange: (type: SectionType) => void;
  onRemove: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
  readOnly?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
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

      {/* Section header — subtle, appears on hover or when section has a type */}
      <div className="mb-1 ml-4 flex items-center gap-2">
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-all hover:bg-white/5"
          style={{ color: color, opacity: section.type === 'freeform' ? 0.4 : 0.7 }}
        >
          {section.type === 'freeform' ? 'Section' : sectionLabel}
          <ChevronDown className="h-3 w-3" />
        </button>

        {/* Type menu */}
        <AnimatePresence>
          {showTypeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-4 top-6 z-20 overflow-hidden rounded-lg"
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
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: SECTION_COLORS[st.type] }}
                    />
                    <span style={{ color: 'var(--text)' }}>{st.label}</span>
                  </button>
                ))}
              </div>
              {/* Dismiss backdrop */}
              <div
                className="fixed inset-0 -z-10"
                onClick={() => setShowTypeMenu(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remove button — only visible on hover */}
        <button
          onClick={onRemove}
          className="rounded-md p-0.5 opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-100"
          style={{ color: 'var(--muted)' }}
          title="Remove section"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* The textarea — the actual writing surface */}
      <textarea
        ref={textareaRef}
        value={section.content}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        placeholder="Start writing..."
        className="w-full resize-none border-0 bg-transparent py-1 pl-4 pr-2 outline-none"
        style={{
          color: 'var(--text)',
          fontSize: '16px',
          lineHeight: '1.8',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontWeight: 400,
          letterSpacing: '0.01em',
          caretColor: 'var(--accent)',
          minHeight: '60px',
          // Ensure the textarea click target is generous
          // No padding tricks — the textarea IS the click target
        }}
        spellCheck
        autoCapitalize="sentences"
        autoCorrect="on"
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

      // Enter at the end of a section that starts with a section label
      // creates a new section of that type
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.currentTarget;
        const content = target.value;
        const cursorPos = target.selectionStart;

        // Check if the first line is a section label
        const firstLine = content.split('\n')[0];
        const detectedType = detectSectionType(firstLine);

        if (detectedType && cursorPos === content.length && content.split('\n').length <= 1) {
          // The user typed "[Verse]" and pressed Enter — convert this section
          e.preventDefault();
          changeSectionType(sectionId, detectedType);
          updateSectionContent(sectionId, '');
          return;
        }
      }

      // Backspace at the start of an empty section removes it
      if (e.key === 'Backspace') {
        const target = e.currentTarget;
        if (target.selectionStart === 0 && target.selectionEnd === 0 && target.value === '') {
          e.preventDefault();
          if (sections.length > 1) {
            removeSection(sectionId);
          }
        }
      }
    },
    [sections, changeSectionType, updateSectionContent, removeSection]
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
