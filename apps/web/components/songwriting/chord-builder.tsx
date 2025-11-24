'use client';

import { Card } from '@cronkwaters/ui';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
 useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X, Music, Sparkles, GripVertical, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';

type ChordBlock = {
  id: string;
  chord: string;
  duration?: string;
};

const COMMON_CHORDS = [
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B',
  'Cm',
  'Dm',
  'Em',
  'Fm',
  'Gm',
  'Am',
  'Bm',
  'C7',
  'D7',
  'E7',
  'F7',
  'G7',
  'A7',
  'B7',
  'Cmaj7',
  'Dmaj7',
  'Emaj7',
  'Fmaj7',
  'Gmaj7',
  'Amaj7',
  'Bmaj7',
];

// Large block view component
function SortableChordBlock({
  id,
  chord,
  duration,
  onRemove,
}: ChordBlock & { onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rnrb-card border-brand-primary/30 from-brand-primary/10 to-brand-primary/5 hover:border-brand-primary/50 group relative cursor-move border-2 bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-2xl"
    >
      {/* Grip Indicator */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-30 transition group-hover:opacity-60">
        <div className="flex flex-col gap-0.5">
          <div className="bg-brand-primary h-1 w-1 rounded-full"></div>
          <div className="bg-brand-primary h-1 w-1 rounded-full"></div>
          <div className="bg-brand-primary h-1 w-1 rounded-full"></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
            <Music className="text-brand-primary h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-brand-primary mb-0.5 text-2xl font-bold">{chord}</p>
            {duration && <p className="text-muted-foreground text-xs font-medium">{duration}</p>}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Visual Connector */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-50">
        <div className="bg-brand-primary/30 h-6 w-0.5"></div>
      </div>
    </div>
  );
}

// Compact inline chord button component
function SortableChordButton({ id, chord, onRemove }: ChordBlock & { onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative inline-flex">
      <div
        {...attributes}
        {...listeners}
        className="font-display border-brand-primary/40 from-brand-primary/20 to-brand-primary/10 text-brand-primary hover:border-brand-primary/60 relative cursor-move rounded-xl border-2 bg-gradient-to-br px-4 py-3 text-lg font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg"
      >
        <GripVertical className="absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 opacity-0 transition group-hover:opacity-40" />
        <span className="px-1">{chord}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition hover:bg-red-600 group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function ChordBuilder({ onChange }: { onChange: (chords: ChordBlock[]) => void }) {
  const [chords, setChords] = useState<ChordBlock[]>([]);
  const [showChordPalette, setShowChordPalette] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'blocks'>('compact'); // Default to compact

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setChords((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        onChange(newOrder);
        return newOrder;
      });
    }
  };

  const addChord = (chord: string) => {
    const newChord: ChordBlock = {
      id: `chord-${Date.now()}`,
      chord,
      duration: viewMode === 'blocks' ? '1 bar' : undefined,
    };
    const updated = [...chords, newChord];
    setChords(updated);
    onChange(updated);
    setShowChordPalette(false);
  };

  const removeChord = (id: string) => {
    const updated = chords.filter((c) => c.id !== id);
    setChords(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <Music className="text-brand-primary h-5 w-5" />
            Chord Progression Builder
          </h3>
          <p className="text-muted-foreground text-sm">
            {viewMode === 'compact'
              ? 'Drag chord buttons to reorder • Click to add more'
              : 'Drag blocks to reorder • Click chord to edit'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="border-border/60 bg-surface/80 flex items-center gap-1 rounded-lg border p-1">
            <button
              onClick={() => setViewMode('compact')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'compact'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Compact inline view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Compact
            </button>
            <button
              onClick={() => setViewMode('blocks')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'blocks'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Large block view"
            >
              <List className="h-3.5 w-3.5" />
              Blocks
            </button>
          </div>
          <button
            onClick={() => setShowChordPalette(!showChordPalette)}
            className="rnrb-button-primary flex items-center gap-2 rounded-xl px-4 py-2 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Chord
          </button>
        </div>
      </div>

      {/* Chord Palette */}
      {showChordPalette && (
        <Card className="rnrb-card border-brand-primary/20 from-brand-primary/5 border-2 bg-gradient-to-br to-transparent p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h4 className="font-display mb-1 text-xl font-bold">Choose Your Chord</h4>
              <p className="text-muted-foreground text-sm">
                Click to add • 28 common chords available
              </p>
            </div>
            <button
              onClick={() => setShowChordPalette(false)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-7">
            {COMMON_CHORDS.map((chord) => (
              <button
                key={chord}
                onClick={() => addChord(chord)}
                className="font-display border-brand-primary/30 bg-brand-primary/10 text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/20 rounded-xl border-2 px-4 py-4 text-lg font-bold shadow-md transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                {chord}
              </button>
            ))}
          </div>
          <div className="rnrb-card mt-4 border-purple-500/20 bg-purple-500/5 p-3">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-purple-400" />
              Need suggestions? Ask AI in chat: "What chord goes after{' '}
              {chords[chords.length - 1]?.chord || 'Am'}?"
            </p>
          </div>
        </Card>
      )}

      {/* Chord Progression Workspace */}
      <Card className="rnrb-card from-surface to-surface-muted/50 min-h-[400px] bg-gradient-to-b p-8">
        {chords.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <div className="bg-brand-primary/10 mb-6 flex h-24 w-24 items-center justify-center rounded-2xl">
              <Music className="text-brand-primary h-12 w-12" />
            </div>
            <h3 className="font-display mb-3 text-2xl font-bold">Your Canvas Awaits</h3>
            <p className="text-muted-foreground mb-4 max-w-md text-lg">
              Click "Add Chord" above to start building your progression.
            </p>
            <p className="text-brand-primary text-sm font-medium italic">
              "Every song starts with a single chord"
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chords.map((c) => c.id)}
              strategy={viewMode === 'compact' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {viewMode === 'compact' ? (
                /* Compact inline view with wrapping */
                <div className="flex flex-wrap items-start gap-3">
                  {chords.map((chord) => (
                    <SortableChordButton
                      key={chord.id}
                      {...chord}
                      onRemove={() => removeChord(chord.id)}
                    />
                  ))}
                </div>
              ) : (
                /* Large block view - vertical stacking */
                <div className="space-y-3">
                  {chords.map((chord) => (
                    <SortableChordBlock
                      key={chord.id}
                      {...chord}
                      onRemove={() => removeChord(chord.id)}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {chords.length > 0 && (
        <div className="rnrb-card to-brand-primary/5 border-2 border-green-500/20 bg-gradient-to-r from-green-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
              <Music className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-brand-primary mb-2 text-sm font-semibold">Your Progression:</p>
              <p className="font-display text-foreground text-2xl font-bold leading-relaxed">
                {chords.map((c) => c.chord).join(' → ')}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                {chords.length} {chords.length === 1 ? 'chord' : 'chords'} •
                {viewMode === 'compact'
                  ? ' Drag buttons to reorder'
                  : ' Drag blocks above to reorder'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
