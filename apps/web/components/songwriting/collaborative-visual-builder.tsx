'use client';

import { Card } from '@cronkwaters/ui';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Music } from 'lucide-react';
import { useState } from 'react';

import { GranularChordEditor } from './granular-chord-editor';
import { KeyAnalyzer } from './key-analyzer';

type ChordPlacement = {
  wordIndex: number;
  lineIndex: number;
  chord: string;
};

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge';
  content: string;
  chordPlacements?: ChordPlacement[];
};

const PALETTE_BLOCKS = [
  { type: 'verse' as const, label: 'VERSE', icon: '📝' },
  { type: 'chorus' as const, label: 'CHORUS', icon: '🎵' },
  { type: 'bridge' as const, label: 'BRIDGE', icon: '🌉' },
];

function SortableBlock({
  block,
  onEdit,
  onRemove,
  onChordsChange,
}: {
  block: SongBlock;
  onEdit: (content: string) => void;
  onRemove: () => void;
  onChordsChange: (chordPlacements: ChordPlacement[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const getColor = () => {
    switch (block.type) {
      case 'verse':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'chorus':
        return 'border-orange-500/30 bg-orange-500/5';
      case 'bridge':
        return 'border-purple-500/30 bg-purple-500/5';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative mb-4 rounded border p-4 ${getColor()}`}
    >
      <div className="flex gap-3">
        <div {...attributes} {...listeners} className="cursor-grab pt-1 active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-zinc-600" />
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
              {block.type}
            </span>
            <button
              onClick={onRemove}
              className="opacity-0 text-red-400 hover:text-red-300 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <GranularChordEditor
            content={block.content}
            chordPlacements={block.chordPlacements || []}
            onContentChange={onEdit}
            onChordsChange={onChordsChange}
            blockType={block.type}
          />
        </div>
      </div>
    </div>
  );
}

export function CollaborativeVisualBuilder({
  onSongChange,
  currentUser,
}: {
  projectSlug: string;
  onSongChange?: (blocks: SongBlock[]) => void;
  currentUser: {
    userId: string;
    userName: string;
    userEmail?: string;
    avatar?: string;
  };
}) {
  const [blocks, setBlocks] = useState<SongBlock[]>([]);
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Extract all chords for key analyzer
  const allChords = blocks.flatMap(block => 
    (block.chordPlacements || []).map(p => p.chord)
  );

  const addBlock = (type: SongBlock['type']) => {
    const newBlock: SongBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    onSongChange?.(updated);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((items) => {
      const oldIndex = items.findIndex((b) => b.id === active.id);
      const newIndex = items.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      onSongChange?.(reordered);
      return reordered;
    });
  };

  const editBlock = (id: string, content: string) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, content } : b));
    setBlocks(updated);
    onSongChange?.(updated);
  };

  const updateBlockChords = (id: string, chordPlacements: ChordPlacement[]) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, chordPlacements } : b));
    setBlocks(updated);
    onSongChange?.(updated);
  };

  const removeBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    onSongChange?.(updated);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Sidebar: Blocks Palette */}
      <div className="col-span-12 lg:col-span-3">
        <div className="sticky top-4 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-white">
              Building Blocks
            </h3>
            <div className="space-y-2">
              {PALETTE_BLOCKS.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addBlock(item.type)}
                  className="w-full rounded border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-3 text-left transition hover:border-zinc-600 hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <p className="font-mono text-sm font-semibold uppercase text-white">
                        {item.label}
                      </p>
                      <p className="font-mono text-xs text-zinc-500">Click to add</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Key Analyzer */}
          {allChords.length > 0 && <KeyAnalyzer chords={allChords} />}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="col-span-12 lg:col-span-9">
        <Card className="min-h-[600px] border-zinc-800 bg-zinc-900/50 p-8">
          <h2 className="mb-6 font-mono text-xl font-bold uppercase tracking-wider text-white">
            Song Structure
          </h2>

          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded border-2 border-dashed border-zinc-800 py-24">
              <Music className="mb-4 h-16 w-16 text-zinc-700" />
              <h3 className="mb-2 font-mono text-lg font-bold uppercase text-white">
                Start Building
              </h3>
              <p className="font-mono text-sm text-zinc-500">
                Click blocks on the left to add them
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onEdit={(content) => editBlock(block.id, content)}
                    onRemove={() => removeBlock(block.id)}
                    onChordsChange={(chordPlacements) =>
                      updateBlockChords(block.id, chordPlacements)
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </Card>
      </div>
    </div>
  );
}
