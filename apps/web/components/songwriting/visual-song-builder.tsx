'use client';

import { Card } from '@cronkwaters/ui';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Music, Sparkles, GripVertical, X } from 'lucide-react';
import { useState } from 'react';

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'chord' | 'custom';
  content: string;
  chord?: string;
  order: number;
};

type PaletteItem = {
  id: string;
  type: SongBlock['type'];
  label: string;
  icon: string;
};

const PALETTE_ITEMS: PaletteItem[] = [
  { id: 'verse', type: 'verse', label: 'Verse', icon: '📝' },
  { id: 'chorus', type: 'chorus', label: 'Chorus', icon: '🎵' },
  { id: 'bridge', type: 'bridge', label: 'Bridge', icon: '🌉' },
  { id: 'chord', type: 'chord', label: 'Chord', icon: '🎸' },
];

const COMMON_CHORDS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'];

function SortableSongBlock({
  block,
  onRemove,
  onEdit,
}: {
  block: SongBlock;
  onRemove: () => void;
  onEdit: (content: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'verse':
        return 'from-blue-500/10 to-blue-500/5 border-blue-500/30';
      case 'chorus':
        return 'from-brand-primary/10 to-brand-primary/5 border-brand-primary/30';
      case 'bridge':
        return 'from-purple-500/10 to-purple-500/5 border-purple-500/30';
      case 'chord':
        return 'from-green-500/10 to-green-500/5 border-green-500/30';
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-500/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`rnrb-card mb-4 bg-gradient-to-br p-6 ${getBlockColor(block.type)} group cursor-move border-2 transition-all hover:shadow-xl`}
    >
      <div className="flex items-start gap-4">
        <div {...listeners} className="flex-shrink-0 cursor-grab pt-1 active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
              {block.type}
            </span>
            <button
              onClick={onRemove}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {block.chord && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-brand-primary/30 bg-brand-primary/20 px-3 py-1">
              <Music className="h-3 w-3" />
              <span className="font-display font-bold text-brand-primary">{block.chord}</span>
            </div>
          )}

          <textarea
            value={block.content}
            onChange={(e) => onEdit(e.target.value)}
            placeholder={`Write your ${block.type} here...`}
            className="w-full resize-none rounded-lg border border-border/50 bg-surface/50 px-3 py-2 font-mono text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

export function VisualSongBuilder({
  onSongChange,
}: {
  onSongChange: (blocks: SongBlock[]) => void;
}) {
  const [songBlocks, setSongBlocks] = useState<SongBlock[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [selectedBlockForChord, setSelectedBlockForChord] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // If dragging from palette to canvas
    if (active.id.toString().startsWith('palette-')) {
      const paletteItem = PALETTE_ITEMS.find((item) => `palette-${item.id}` === active.id);
      if (paletteItem) {
        const newBlock: SongBlock = {
          id: `block-${Date.now()}`,
          type: paletteItem.type,
          content: '',
          order: songBlocks.length,
        };
        const updated = [...songBlocks, newBlock];
        setSongBlocks(updated);
        onSongChange(updated);
      }
      return;
    }

    // If reordering existing blocks
    if (active.id !== over.id) {
      setSongBlocks((blocks) => {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        const newOrder = arrayMove(blocks, oldIndex, newIndex);
        onSongChange(newOrder);
        return newOrder;
      });
    }
  };

  const removeBlock = (id: string) => {
    const updated = songBlocks.filter((b) => b.id !== id);
    setSongBlocks(updated);
    onSongChange(updated);
  };

  const editBlock = (id: string, content: string) => {
    const updated = songBlocks.map((b) => (b.id === id ? { ...b, content } : b));
    setSongBlocks(updated);
    onSongChange(updated);
  };

  const addChordToBlock = (blockId: string, chord: string) => {
    const updated = songBlocks.map((b) => (b.id === blockId ? { ...b, chord } : b));
    setSongBlocks(updated);
    onSongChange(updated);
    setShowChordPicker(false);
    setSelectedBlockForChord(null);
  };

  return (
    <div className="grid min-h-screen grid-cols-12 gap-6">
      {/* Left Sidebar - Palette */}
      <div className="col-span-12 lg:col-span-3">
        <Card className="rnrb-card sticky top-4 p-6">
          <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Building Blocks
          </h3>
          <p className="mb-6 text-xs text-muted-foreground">
            Drag blocks to the canvas to build your song structure
          </p>

          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="space-y-3">
              {PALETTE_ITEMS.map((item) => (
                <div
                  key={`palette-${item.id}`}
                  id={`palette-${item.id}`}
                  className="rnrb-card cursor-grab border-2 border-dashed border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 to-transparent p-4 transition-all hover:border-brand-primary/50 hover:shadow-lg active:cursor-grabbing"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">Drag to canvas →</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chord Quick Add */}
            <div className="mt-6 border-t border-border pt-6">
              <h4 className="mb-3 text-sm font-semibold">Quick Add Chords</h4>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_CHORDS.slice(0, 8).map((chord) => (
                  <button
                    key={chord}
                    onClick={() => {
                      const newBlock: SongBlock = {
                        id: `block-${Date.now()}`,
                        type: 'chord',
                        content: '',
                        chord,
                        order: songBlocks.length,
                      };
                      const updated = [...songBlocks, newBlock];
                      setSongBlocks(updated);
                      onSongChange(updated);
                    }}
                    className="rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm font-bold text-brand-primary transition hover:bg-brand-primary/20"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="rnrb-card border-2 border-brand-primary bg-brand-primary/20 p-4 opacity-50">
                  <p className="font-semibold">Dragging...</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className="rnrb-card mt-6 border-purple-500/20 bg-purple-500/5 p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-purple-400" />
              Ask AI in chat for chord suggestions and song structure help
            </p>
          </div>
        </Card>
      </div>

      {/* Right Canvas - Song Builder */}
      <div className="col-span-12 lg:col-span-9">
        <Card className="rnrb-card min-h-[800px] p-8">
          <div className="mb-6">
            <h2 className="font-display mb-2 text-2xl font-bold">Your Song</h2>
            <p className="text-muted-foreground">
              Drag blocks from the left to build your song structure. Reorder by dragging blocks up
              or down.
            </p>
          </div>

          {songBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-gradient-to-b from-surface-muted/30 to-transparent py-24 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-primary/10">
                <Music className="h-12 w-12 text-brand-primary" />
              </div>
              <h3 className="font-display mb-3 text-2xl font-bold">Start Building Your Song</h3>
              <p className="mb-2 max-w-md text-lg text-muted-foreground">
                Drag blocks from the left palette to create your song structure.
              </p>
              <p className="text-sm italic text-brand-primary">
                "Every great song starts with a simple structure"
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={songBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {songBlocks.map((block) => (
                  <SortableSongBlock
                    key={block.id}
                    block={block}
                    onRemove={() => removeBlock(block.id)}
                    onEdit={(content) => editBlock(block.id, content)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {songBlocks.length > 0 && (
            <div className="rnrb-card mt-8 border-2 border-green-500/20 bg-gradient-to-r from-green-500/5 to-brand-primary/5 p-6">
              <h4 className="mb-3 font-semibold text-brand-primary">Song Structure:</h4>
              <p className="font-display text-lg text-foreground">
                {songBlocks
                  .map((b) => b.type.charAt(0).toUpperCase() + b.type.slice(1))
                  .join(' → ')}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {songBlocks.length} sections • Drag to reorder
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
