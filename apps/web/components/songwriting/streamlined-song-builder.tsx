'use client';

import { Card, Button } from '@cronkwaters/ui';
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
  Sparkles,
  Copy,
  Check,
  Undo,
  Redo,
  RefreshCw,
  FileText,
} from 'lucide-react';
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

// Quick templates for common song structures
const SONG_TEMPLATES = [
  {
    name: 'Pop',
    icon: '🎤',
    structure: [
      'intro',
      'verse',
      'chorus',
      'verse',
      'chorus',
      'bridge',
      'chorus',
      'outro',
    ] as const,
  },
  {
    name: 'Rock',
    icon: '🎸',
    structure: [
      'intro',
      'verse',
      'chorus',
      'verse',
      'chorus',
      'bridge',
      'chorus',
      'chorus',
    ] as const,
  },
  {
    name: 'Ballad',
    icon: '🎹',
    structure: ['verse', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'] as const,
  },
  {
    name: 'Simple',
    icon: '🎵',
    structure: ['verse', 'chorus', 'verse', 'chorus'] as const,
  },
];

// Get block color
function getBlockColor(type: SongBlock['type']): string {
  return BLOCK_TYPES.find((b) => b.type === type)?.color || '#6B7280';
}

// Count words in content
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Sortable Block Component
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="group relative"
    >
      <div
        className="rounded-xl border transition-all"
        style={{
          background: `${color}08`,
          borderColor: isDragging ? color : `${color}30`,
          boxShadow: isDragging ? `0 8px 30px ${color}20` : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: isCollapsed ? 'none' : `1px solid ${color}20` }}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 opacity-40 transition hover:opacity-100 active:cursor-grabbing"
            style={{ background: `${color}20` }}
          >
            <GripVertical className="h-4 w-4" style={{ color }} />
          </div>

          {/* Type Label with switcher */}
          <div className="relative">
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
              style={{ background: `${color}20`, color }}
            >
              {block.type.replace('-', ' ')} {sectionNumber}
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Type switcher dropdown */}
            <AnimatePresence>
              {showTypeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg shadow-lg"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  {BLOCK_TYPES.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => {
                        onTypeChange(type.type);
                        setShowTypeMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:opacity-80"
                      style={{
                        background: block.type === type.type ? `${type.color}20` : 'transparent',
                        color: type.color,
                      }}
                    >
                      <div className="h-2 w-2 rounded-full" style={{ background: type.color }} />
                      {type.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Word count */}
          {wordCount > 0 && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </span>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded p-1.5 opacity-40 transition hover:opacity-100"
              style={{ background: `${color}10` }}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <ChevronDown className="h-3.5 w-3.5" style={{ color }} />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" style={{ color }} />
              )}
            </button>
            <button
              onClick={onDuplicate}
              className="rounded p-1.5 opacity-0 transition hover:opacity-80 group-hover:opacity-100"
              style={{ background: `${color}10` }}
              title="Duplicate section"
            >
              <Copy className="h-3.5 w-3.5" style={{ color }} />
            </button>
            <button
              onClick={onRemove}
              className="rounded p-1.5 text-red-400 opacity-0 transition hover:bg-red-500/10 group-hover:opacity-100"
              title="Remove section"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content - collapsible */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                <GranularChordEditor
                  content={block.content}
                  chordPlacements={block.chordPlacements || []}
                  onContentChange={onEdit}
                  onChordsChange={onChordsChange}
                  blockType={block.type}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed preview */}
        {isCollapsed && block.content && (
          <div className="px-4 pb-2">
            <p className="truncate text-xs italic" style={{ color: 'var(--muted)' }}>
              {block.content.split('\n')[0] || 'Empty section...'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Add Section Button (between blocks)
function AddSectionButton({
  onAdd,
  position,
}: {
  onAdd: (type: SongBlock['type']) => void;
  position: 'top' | 'middle' | 'bottom';
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-center py-2">
      {/* Line connector */}
      {position !== 'top' && (
        <div
          className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2"
          style={{ background: 'var(--border)' }}
        />
      )}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex flex-wrap justify-center gap-2 rounded-xl p-3"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            {BLOCK_TYPES.map((block) => (
              <button
                key={block.type}
                onClick={() => {
                  onAdd(block.type);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:scale-105"
                style={{ background: `${block.color}15`, color: block.color }}
              >
                <div className="h-2 w-2 rounded-full" style={{ background: block.color }} />
                {block.label}
              </button>
            ))}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ color: 'var(--muted)' }}
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium opacity-40 transition hover:opacity-100"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
          >
            <Plus className="h-3 w-3" />
            Add Section
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

export function StreamlinedSongBuilder({
  onSongChange,
  initialBlocks = [],
}: StreamlinedSongBuilderProps) {
  const [blocks, setBlocks] = useState<SongBlock[]>(initialBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<SongBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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

  // Update blocks with history
  const updateBlocks = useCallback(
    (newBlocks: SongBlock[]) => {
      setBlocks(newBlocks);
      saveToHistory(newBlocks);
      onSongChange?.(newBlocks);
    },
    [saveToHistory, onSongChange]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const restored = history[historyIndex - 1];
      setBlocks(restored);
      onSongChange?.(restored);
    }
  }, [historyIndex, history, onSongChange]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const restored = history[historyIndex + 1];
      setBlocks(restored);
      onSongChange?.(restored);
    }
  }, [historyIndex, history, onSongChange]);

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

  // Edit block content
  const editBlock = useCallback(
    (id: string, content: string) => {
      setBlocks((prev) => {
        const newBlocks = prev.map((b) => (b.id === id ? { ...b, content } : b));
        onSongChange?.(newBlocks);
        return newBlocks;
      });
    },
    [onSongChange]
  );

  // Update block chords
  const updateBlockChords = useCallback(
    (id: string, chordPlacements: ChordPlacement[]) => {
      setBlocks((prev) => {
        const newBlocks = prev.map((b) => (b.id === id ? { ...b, chordPlacements } : b));
        onSongChange?.(newBlocks);
        return newBlocks;
      });
    },
    [onSongChange]
  );

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

  // Apply template
  const applyTemplate = useCallback(
    (structure: readonly SongBlock['type'][]) => {
      const newBlocks: SongBlock[] = structure.map((type) => ({
        id: crypto.randomUUID(),
        type,
        content: '',
        chordPlacements: [],
      }));
      updateBlocks(newBlocks);
    },
    [updateBlocks]
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
    <div className="space-y-4">
      {/* Compact Toolbar */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {blocks.length} section{blocks.length !== 1 ? 's' : ''}
          </span>
          {allChords.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              • {allChords.length} chord{allChords.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="rounded-lg p-2 transition disabled:opacity-30"
            style={{ background: 'var(--background)' }}
            title="Undo (⌘Z)"
          >
            <Undo className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="rounded-lg p-2 transition disabled:opacity-30"
            style={{ background: 'var(--background)' }}
            title="Redo (⌘⇧Z)"
          >
            <Redo className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          </button>
          <button
            onClick={exportToClipboard}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition"
            style={{ background: 'var(--background)', color: 'var(--text)' }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        className="min-h-[500px] rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {blocks.length === 0 ? (
          // Empty state with templates
          <div className="flex flex-col items-center justify-center py-12">
            <div
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.1))',
              }}
            >
              <Music className="h-8 w-8" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Start Your Song
            </h3>
            <p className="mb-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
              Choose a template or add sections one by one
            </p>

            {/* Quick Templates */}
            <div className="mb-6 w-full max-w-md">
              <p
                className="mb-3 text-center text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                Quick Start Templates
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SONG_TEMPLATES.map((template) => (
                  <motion.button
                    key={template.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyTemplate(template.structure)}
                    className="flex flex-col items-center gap-1 rounded-xl px-4 py-3 transition"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-xl">{template.icon}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {template.name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {template.structure.length} sections
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Or add manually */}
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
              <div className="h-px w-12" style={{ background: 'var(--border)' }} />
              or start from scratch
              <div className="h-px w-12" style={{ background: 'var(--border)' }} />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {BLOCK_TYPES.slice(0, 3).map((block) => (
                <motion.button
                  key={block.type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addBlockAt(block.type, 0)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition"
                  style={{ background: `${block.color}15`, color: block.color }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {block.label}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
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

      {/* Key Analyzer (only shows when there are chords) */}
      {allChords.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <KeyAnalyzer chords={allChords} />
        </div>
      )}
    </div>
  );
}
