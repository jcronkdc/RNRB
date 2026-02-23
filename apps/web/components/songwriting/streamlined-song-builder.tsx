'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Music,
  Copy,
  Check,
  Undo,
  Redo,
  FileText,
} from '@/components/ui/custom-icons';
import { useState, useCallback, memo, useRef, useEffect } from 'react';

import { GranularChordEditor } from './granular-chord-editor';
import { KeyAnalyzer } from './key-analyzer';

type ChordPlacement = {
  wordIndex: number;
  lineIndex: number;
  chord: string;
};

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';
  content: string;
  chordPlacements?: ChordPlacement[];
};

const BLOCK_TYPES = [
  { type: 'verse' as const, label: 'Verse', color: '#3B82F6', description: 'Main story' },
  { type: 'chorus' as const, label: 'Chorus', color: '#F59E0B', description: 'Hook/refrain' },
  { type: 'bridge' as const, label: 'Bridge', color: '#8B5CF6', description: 'Contrast section' },
  { type: 'pre-chorus' as const, label: 'Pre-Chorus', color: '#10B981', description: 'Build up' },
  { type: 'intro' as const, label: 'Intro', color: '#EC4899', description: 'Opening' },
  { type: 'outro' as const, label: 'Outro', color: '#6366F1', description: 'Ending' },
];

// Get block color
function getBlockColor(type: SongBlock['type']): string {
  return BLOCK_TYPES.find((b) => b.type === type)?.color || '#6B7280';
}

// Count words in content
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Sortable Block Component - COMPACT
const SortableBlock = memo(function SortableBlock({
  block,
  sectionNumber,
  onEdit,
  onRemove,
  onChordsChange,
  onDuplicate,
  onTypeChange,
}: {
  block: SongBlock;
  sectionNumber: number;
  onEdit: (content: string) => void;
  onRemove: () => void;
  onChordsChange: (placements: ChordPlacement[]) => void;
  onDuplicate: () => void;
  onTypeChange: (newType: SongBlock['type']) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const color = getBlockColor(block.type);
  const wordCount = countWords(block.content);

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="group relative"
    >
      <div
        className="rounded-lg border transition-all"
        style={{
          background: `${color}06`,
          borderColor: isDragging ? color : `${color}25`,
          boxShadow: isDragging ? `0 4px 20px ${color}15` : 'none',
        }}
      >
        {/* Header - Compact */}
        <div
          className="flex items-center gap-1.5 px-2 py-1.5"
          style={{ borderBottom: isCollapsed ? 'none' : `1px solid ${color}15` }}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-0.5 opacity-30 transition hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" style={{ color }} />
          </div>

          {/* Type Label with switcher */}
          <div className="relative">
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition hover:opacity-80"
              style={{ background: `${color}20`, color }}
            >
              {block.type.replace('-', ' ')} {sectionNumber}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>

            {/* Type switcher dropdown */}
            <AnimatePresence>
              {showTypeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  className="absolute left-0 top-full z-20 mt-0.5 w-28 overflow-hidden rounded-md shadow-lg"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  {BLOCK_TYPES.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => {
                        onTypeChange(type.type);
                        setShowTypeMenu(false);
                      }}
                      className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-[10px] transition hover:opacity-80"
                      style={{
                        background: block.type === type.type ? `${type.color}20` : 'transparent',
                        color: type.color,
                      }}
                    >
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: type.color }}
                      />
                      {type.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Word count - inline */}
          {wordCount > 0 && (
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
              {wordCount}w
            </span>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions - Compact */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded p-1 opacity-30 transition hover:opacity-100"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <ChevronDown className="h-3 w-3" style={{ color }} />
              ) : (
                <ChevronUp className="h-3 w-3" style={{ color }} />
              )}
            </button>
            <button
              onClick={onDuplicate}
              className="rounded p-1 opacity-0 transition hover:opacity-80 group-hover:opacity-60"
              title="Duplicate section"
            >
              <Copy className="h-3 w-3" style={{ color }} />
            </button>
            <button
              onClick={onRemove}
              className="rounded p-1 text-red-400 opacity-0 transition hover:bg-red-500/10 group-hover:opacity-60"
              title="Remove section"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Content - collapsible, reduced padding */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-2 pb-2 pt-1">
                <GranularChordEditor
                  content={block.content}
                  chordPlacements={block.chordPlacements || []}
                  onContentChange={onEdit}
                  onChordsChange={onChordsChange}
                  blockType={block.type as 'verse' | 'chorus' | 'bridge'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed preview */}
        {isCollapsed && block.content && (
          <div className="px-2 pb-1.5">
            <p className="truncate text-[10px] italic" style={{ color: 'var(--muted)' }}>
              {block.content.split('\n')[0] || 'Empty section...'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Add Section Button (between blocks) - COMPACT
function AddSectionButton({
  onAdd,
  position,
}: {
  onAdd: (type: SongBlock['type']) => void;
  position: 'top' | 'middle' | 'bottom';
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-center py-0.5">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex flex-wrap items-center justify-center gap-1 rounded-lg p-1.5"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            {BLOCK_TYPES.map((block) => (
              <button
                key={block.type}
                onClick={() => {
                  onAdd(block.type);
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition hover:scale-105"
                style={{ background: `${block.color}15`, color: block.color }}
              >
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: block.color }} />
                {block.label}
              </button>
            ))}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded px-2 py-1 text-[10px]"
              style={{ color: 'var(--muted)' }}
            >
              ✕
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] opacity-20 transition hover:opacity-70"
            style={{
              background: 'var(--panel)',
              border: '1px dashed var(--border)',
              color: 'var(--muted)',
            }}
          >
            <Plus className="h-2.5 w-2.5" />
            Add
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Component
type StreamlinedSongBuilderProps = {
  onSongChange?: (blocks: SongBlock[]) => void;
  initialBlocks?: SongBlock[];
};

type EditorMode = 'blocks' | 'freeform';

export function StreamlinedSongBuilder({
  onSongChange,
  initialBlocks = [],
}: StreamlinedSongBuilderProps) {
  const [blocks, setBlocks] = useState<SongBlock[]>(initialBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<SongBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('freeform');
  const [freeformText, setFreeformText] = useState('');

  // Sync blocks when initialBlocks changes (e.g., when template is selected)
  const initialBlocksRef = useRef(initialBlocks);
  useEffect(() => {
    // Only update if initialBlocks actually changed (compare by length and IDs)
    const currentIds = initialBlocksRef.current.map((b) => b.id).join(',');
    const newIds = initialBlocks.map((b) => b.id).join(',');
    if (currentIds !== newIds) {
      setBlocks(initialBlocks);
      setHistory([initialBlocks]);
      setHistoryIndex(0);
      initialBlocksRef.current = initialBlocks;
      // Also update freeform text when blocks change externally
      if (initialBlocks.length > 0) {
        setFreeformText(blocksToText(initialBlocks));
      }
    }
  }, [initialBlocks]);

  // Convert blocks to plain text (preserves section labels)
  const blocksToText = useCallback((blocksArray: SongBlock[]): string => {
    if (blocksArray.length === 0) return '';
    return blocksArray
      .map((b) => {
        const label = `[${b.type.toUpperCase().replace('-', ' ')}]`;
        return `${label}\n${b.content}`;
      })
      .join('\n\n');
  }, []);

  // Convert plain text to blocks (smart parsing - preserves block IDs when possible)
  const textToBlocks = useCallback(
    (text: string, existingBlocks: SongBlock[] = []): SongBlock[] => {
      if (!text.trim()) return [];

      const lines = text.split('\n');
      const newBlocks: SongBlock[] = [];
      let currentBlock: { type: SongBlock['type']; content: string[] } | null = null;

      const sectionRegex = /^\[([A-Z\s\-]+)\]$/i;

      for (const line of lines) {
        const match = line.match(sectionRegex);
        if (match) {
          // Save previous block
          if (currentBlock) {
            const content = currentBlock.content.join('\n').trim();
            // Try to find matching existing block to preserve ID
            const existingIndex = newBlocks.length;
            const existingBlock = existingBlocks[existingIndex];
            newBlocks.push({
              id: existingBlock?.id || crypto.randomUUID(),
              type: currentBlock.type,
              content,
              chordPlacements: existingBlock?.chordPlacements || [],
            });
          }
          // Start new block
          const typeRaw = match[1].toLowerCase().replace(/\s+/g, '-');
          const validTypes: SongBlock['type'][] = [
            'verse',
            'chorus',
            'bridge',
            'pre-chorus',
            'intro',
            'outro',
          ];
          const type = validTypes.includes(typeRaw as SongBlock['type'])
            ? (typeRaw as SongBlock['type'])
            : 'verse';
          currentBlock = { type, content: [] };
        } else if (currentBlock) {
          currentBlock.content.push(line);
        } else if (line.trim()) {
          // Text before any section header - create a verse
          currentBlock = { type: 'verse', content: [line] };
        }
      }

      // Don't forget last block
      if (currentBlock) {
        const content = currentBlock.content.join('\n').trim();
        const existingIndex = newBlocks.length;
        const existingBlock = existingBlocks[existingIndex];
        newBlocks.push({
          id: existingBlock?.id || crypto.randomUUID(),
          type: currentBlock.type,
          content,
          chordPlacements: existingBlock?.chordPlacements || [],
        });
      }

      return newBlocks;
    },
    []
  );

  // Keep freeform text in sync when blocks change (from block editing)
  const syncFreeformFromBlocks = useCallback(
    (blocksArray: SongBlock[]) => {
      const newText = blocksToText(blocksArray);
      setFreeformText(newText);
    },
    [blocksToText]
  );

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Save to history
  const saveToHistory = useCallback(
    (newBlocks: SongBlock[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newBlocks);
        return newHistory.slice(-50); // Keep last 50 states
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  // Handle mode switch - instant sync
  const switchMode = useCallback(
    (newMode: EditorMode) => {
      if (newMode === editorMode) return;

      if (newMode === 'freeform') {
        // Switching to freeform: ensure text is synced from blocks
        syncFreeformFromBlocks(blocks);
      } else {
        // Switching to blocks: parse text to blocks (preserving IDs where possible)
        const parsedBlocks = textToBlocks(freeformText, blocks);
        if (parsedBlocks.length > 0) {
          setBlocks(parsedBlocks);
          saveToHistory(parsedBlocks);
          onSongChange?.(parsedBlocks);
        }
      }
      setEditorMode(newMode);
    },
    [
      editorMode,
      blocks,
      freeformText,
      syncFreeformFromBlocks,
      textToBlocks,
      saveToHistory,
      onSongChange,
    ]
  );

  // Handle freeform text change - parse to blocks in real-time
  const handleFreeformChange = useCallback(
    (text: string) => {
      setFreeformText(text);
      // Parse to blocks in real-time for syncing with parent (preserve existing block IDs)
      const parsedBlocks = textToBlocks(text, blocks);
      setBlocks(parsedBlocks);
      onSongChange?.(parsedBlocks);
    },
    [textToBlocks, blocks, onSongChange]
  );

  // Update blocks with history AND sync freeform text
  const updateBlocks = useCallback(
    (newBlocks: SongBlock[]) => {
      setBlocks(newBlocks);
      saveToHistory(newBlocks);
      onSongChange?.(newBlocks);
      // Keep freeform in sync
      syncFreeformFromBlocks(newBlocks);
    },
    [saveToHistory, onSongChange, syncFreeformFromBlocks]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const restored = history[historyIndex - 1];
      setBlocks(restored);
      setFreeformText(blocksToText(restored));
      onSongChange?.(restored);
    }
  }, [historyIndex, history, onSongChange, blocksToText]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const restored = history[historyIndex + 1];
      setBlocks(restored);
      setFreeformText(blocksToText(restored));
      onSongChange?.(restored);
    }
  }, [historyIndex, history, onSongChange, blocksToText]);

  // Add block at position
  const addBlockAt = useCallback(
    (type: SongBlock['type'], index: number) => {
      const newBlock: SongBlock = {
        id: crypto.randomUUID(),
        type,
        content: '',
        chordPlacements: [],
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index, 0, newBlock);
      updateBlocks(newBlocks);
    },
    [blocks, updateBlocks]
  );

  // Edit block content - called on every keystroke
  // Note: We don't save to history on every keystroke (would be too many states)
  // But we DO need to sync with parent for the Preview tab
  const editBlock = useCallback((id: string, content: string) => {
    setBlocks((prev) => {
      const newBlocks = prev.map((b) => (b.id === id ? { ...b, content } : b));
      return newBlocks;
    });
  }, []);

  // Sync blocks to parent AND freeform text whenever blocks change
  const blocksRef = useRef(blocks);
  useEffect(() => {
    // Only sync if blocks actually changed (not just on mount)
    if (blocksRef.current !== blocks) {
      onSongChange?.(blocks);
      // Keep freeform text in sync when in blocks mode
      if (editorMode === 'blocks' && blocks.length > 0) {
        setFreeformText(blocksToText(blocks));
      }
    }
    blocksRef.current = blocks;
  }, [blocks, onSongChange, editorMode, blocksToText]);

  // Update block chords
  const updateBlockChords = useCallback((id: string, chordPlacements: ChordPlacement[]) => {
    setBlocks((prev) => {
      const newBlocks = prev.map((b) => (b.id === id ? { ...b, chordPlacements } : b));
      return newBlocks;
    });
  }, []);

  // Remove block
  const removeBlock = useCallback(
    (id: string) => {
      const newBlocks = blocks.filter((b) => b.id !== id);
      updateBlocks(newBlocks);
    },
    [blocks, updateBlocks]
  );

  // Duplicate block
  const duplicateBlock = useCallback(
    (id: string) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const original = blocks[index];
      const duplicate: SongBlock = {
        ...original,
        id: crypto.randomUUID(),
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, duplicate);
      updateBlocks(newBlocks);
    },
    [blocks, updateBlocks]
  );

  // Change block type
  const changeBlockType = useCallback(
    (id: string, newType: SongBlock['type']) => {
      const newBlocks = blocks.map((b) => (b.id === id ? { ...b, type: newType } : b));
      updateBlocks(newBlocks);
    },
    [blocks, updateBlocks]
  );

  // Calculate section number for each block
  const getSectionNumber = useCallback(
    (blockId: string) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return 1;
      const sameTypeBefore = blocks.filter(
        (b, i) =>
          b.type === block.type && blocks.indexOf(blocks.find((bb) => bb.id === blockId)!) > i
      );
      return sameTypeBefore.length + 1;
    },
    [blocks]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        const newBlocks = arrayMove(blocks, oldIndex, newIndex);
        updateBlocks(newBlocks);
      }
    },
    [blocks, updateBlocks]
  );

  // Export to clipboard
  const exportToClipboard = useCallback(async () => {
    const text = blocks.map((b) => `[${b.type.toUpperCase()}]\n${b.content}`).join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [blocks]);

  // Get all chords for key analysis
  const allChords = blocks.flatMap((b) => b.chordPlacements?.map((p) => p.chord) || []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="space-y-2">
      {/* Compact Toolbar - Smaller */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div
            className="flex items-center gap-0.5 rounded-lg p-0.5"
            style={{ background: 'var(--background)' }}
          >
            <button
              onClick={() => switchMode('freeform')}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition"
              style={{
                background: editorMode === 'freeform' ? 'var(--accent)' : 'transparent',
                color: editorMode === 'freeform' ? 'white' : 'var(--muted)',
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Freeform
            </button>
            <button
              onClick={() => switchMode('blocks')}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition"
              style={{
                background: editorMode === 'blocks' ? 'var(--accent)' : 'transparent',
                color: editorMode === 'blocks' ? 'white' : 'var(--muted)',
              }}
            >
              <GripVertical className="h-3.5 w-3.5" />
              Blocks
            </button>
          </div>

          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            {blocks.length} section{blocks.length !== 1 ? 's' : ''}
          </span>
          {allChords.length > 0 && (
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
              • {allChords.length} chord{allChords.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {editorMode === 'blocks' && (
            <>
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="rounded p-1.5 transition disabled:opacity-30"
                style={{ background: 'var(--background)' }}
                title="Undo (⌘Z)"
              >
                <Undo className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="rounded p-1.5 transition disabled:opacity-30"
                style={{ background: 'var(--background)' }}
                title="Redo (⌘⇧Z)"
              >
                <Redo className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
              </button>
            </>
          )}
          <button
            onClick={exportToClipboard}
            className="flex items-center gap-1 rounded px-2 py-1.5 text-xs font-medium transition"
            style={{ background: 'var(--background)', color: 'var(--text)' }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Canvas - Reduced padding, shorter min-height */}
      <div
        className="min-h-[350px] rounded-lg p-3"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {editorMode === 'freeform' ? (
          // FREEFORM MODE - Simple text editor with clear guidance
          <div className="h-full space-y-3">
            {/* How It Works Guide - Always visible */}
            <div
              className="rounded-lg p-4"
              style={{
                background:
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                >
                  <FileText className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} />
                </div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  How Freeform Mode Works
                </h4>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Left: Instructions */}
                <div className="space-y-2">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                    <strong style={{ color: 'var(--text)' }}>Just type naturally!</strong> Use
                    section markers in brackets to organize your song. Each marker starts a new
                    section.
                  </p>

                  {/* Quick Insert Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
                      Quick insert:
                    </span>
                    {BLOCK_TYPES.map((block) => (
                      <button
                        key={block.type}
                        onClick={() => {
                          const marker = `[${block.type.toUpperCase().replace('-', ' ')}]\n`;
                          const newText = freeformText
                            ? freeformText + (freeformText.endsWith('\n') ? '\n' : '\n\n') + marker
                            : marker;
                          handleFreeformChange(newText);
                        }}
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium transition hover:scale-105"
                        style={{ background: `${block.color}20`, color: block.color }}
                      >
                        [{block.label.toUpperCase()}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Example */}
                <div
                  className="rounded-md p-2.5 text-[11px] leading-relaxed"
                  style={{
                    background: 'var(--background)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    color: 'var(--muted)',
                  }}
                >
                  <div style={{ color: '#3B82F6' }}>[VERSE]</div>
                  <div>Walking down this road alone</div>
                  <div>Searching for a place called home</div>
                  <div className="mt-1.5" style={{ color: '#F59E0B' }}>
                    [CHORUS]
                  </div>
                  <div>But I keep moving on...</div>
                </div>
              </div>

              {/* Tip about switching modes */}
              <p className="mt-3 text-[10px]" style={{ color: 'var(--muted)' }}>
                <strong>Tip:</strong> Switch to{' '}
                <span style={{ color: 'var(--accent)' }}>Blocks mode</span> anytime to drag and
                reorder sections, add chords to specific words, or duplicate sections. Your work
                syncs automatically!
              </p>
            </div>

            {/* Editor Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                    Your Lyrics
                  </span>
                  {blocks.length > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}
                    >
                      {blocks.length} section{blocks.length !== 1 ? 's' : ''} detected
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {freeformText.length} characters
                </span>
              </div>
              <textarea
                value={freeformText}
                onChange={(e) => handleFreeformChange(e.target.value)}
                placeholder={`Start typing your song here...\n\nExample:\n[VERSE]\nYour first verse lyrics go here\nAdd as many lines as you want\n\n[CHORUS]\nYour catchy chorus goes here\n\n[VERSE]\nYour second verse...\n\n[BRIDGE]\nSomething different to break it up\n\n[CHORUS]\nRepeat that chorus!`}
                className="min-h-[350px] w-full resize-y rounded-lg border-0 p-4 text-sm leading-relaxed outline-hidden transition focus:ring-2"
                style={{
                  background: 'var(--background)',
                  color: 'var(--text)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                }}
                autoFocus
              />
            </div>
          </div>
        ) : blocks.length === 0 ? (
          // Empty state with templates for BLOCK MODE - COMPACT
          <div className="flex flex-col items-center justify-center py-6">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.1))',
              }}
            >
              <Music className="h-6 w-6" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="mb-1 text-base font-semibold" style={{ color: 'var(--text)' }}>
              Build Your Song Structure
            </h3>
            <p className="mb-4 text-center text-xs" style={{ color: 'var(--muted)' }}>
              Add sections and drag to reorder
            </p>

            {/* Add sections - Compact */}
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {BLOCK_TYPES.map((block) => (
                <motion.button
                  key={block.type}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addBlockAt(block.type, 0)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                  style={{ background: `${block.color}15`, color: block.color }}
                >
                  <Plus className="h-3 w-3" />
                  {block.label}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          // BLOCK MODE - Drag and drop
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-0.5">
                {/* Top add button */}
                <AddSectionButton position="top" onAdd={(type) => addBlockAt(type, 0)} />

                {blocks.map((block, index) => (
                  <div key={block.id}>
                    <SortableBlock
                      block={block}
                      sectionNumber={getSectionNumber(block.id)}
                      onEdit={(content) => editBlock(block.id, content)}
                      onRemove={() => removeBlock(block.id)}
                      onChordsChange={(placements) => updateBlockChords(block.id, placements)}
                      onDuplicate={() => duplicateBlock(block.id)}
                      onTypeChange={(newType) => changeBlockType(block.id, newType)}
                    />
                    <AddSectionButton
                      position={index === blocks.length - 1 ? 'bottom' : 'middle'}
                      onAdd={(type) => addBlockAt(type, index + 1)}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>

            {/* Drag overlay */}
            <DragOverlay>
              {activeId ? (
                <div
                  className="rounded-xl border-2 p-4 shadow-2xl"
                  style={{
                    background: 'var(--panel)',
                    borderColor: getBlockColor(
                      blocks.find((b) => b.id === activeId)?.type || 'verse'
                    ),
                    transform: 'rotate(2deg)',
                  }}
                >
                  <span className="text-sm font-bold uppercase" style={{ color: 'var(--accent)' }}>
                    {blocks.find((b) => b.id === activeId)?.type}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Key Analyzer (only shows when there are chords) - Compact */}
      {allChords.length > 0 && (
        <div
          className="rounded-lg p-2"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <KeyAnalyzer chords={allChords} />
        </div>
      )}
    </div>
  );
}
