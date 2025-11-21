'use client';

import { useState } from 'react';
import { Card } from '@cronkwaters/ui';
import { Plus, X, Music, Sparkles, GripVertical, LayoutGrid, List } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ChordBlock = {
  id: string;
  chord: string;
  duration?: string;
};

const COMMON_CHORDS = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',
  'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
  'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7'
];

// Large block view component
function SortableChordBlock({ id, chord, duration, onRemove }: ChordBlock & { onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

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
      className="relative rnrb-card p-6 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-2 border-brand-primary/30 cursor-move hover:shadow-2xl hover:border-brand-primary/50 transition-all duration-300 group"
    >
      {/* Grip Indicator */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition">
        <div className="flex flex-col gap-0.5">
          <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
          <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
          <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center">
            <Music className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-2xl text-brand-primary mb-0.5">{chord}</p>
            {duration && <p className="text-xs text-muted-foreground font-medium">{duration}</p>}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Connector */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-50">
        <div className="w-0.5 h-6 bg-brand-primary/30"></div>
      </div>
    </div>
  );
}

// Compact inline chord button component
function SortableChordButton({ id, chord, onRemove }: ChordBlock & { onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative inline-flex group"
    >
      <div
        {...attributes}
        {...listeners}
        className="relative px-4 py-3 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 border-2 border-brand-primary/40 rounded-xl font-display font-bold text-lg text-brand-primary cursor-move hover:shadow-lg hover:border-brand-primary/60 hover:scale-105 transition-all duration-200"
      >
        <GripVertical className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 opacity-0 group-hover:opacity-40 transition" />
        <span className="px-1">{chord}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow-lg"
      >
        <X className="w-3 h-3" />
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
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
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
      duration: viewMode === 'blocks' ? '1 bar' : undefined
    };
    const updated = [...chords, newChord];
    setChords(updated);
    onChange(updated);
    setShowChordPalette(false);
  };

  const removeChord = (id: string) => {
    const updated = chords.filter(c => c.id !== id);
    setChords(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Music className="w-5 h-5 text-brand-primary" />
            Chord Progression Builder
          </h3>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'compact' 
              ? 'Drag chord buttons to reorder • Click to add more'
              : 'Drag blocks to reorder • Click chord to edit'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-surface/80 border border-border/60 rounded-lg p-1">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition ${
                viewMode === 'compact'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Compact inline view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Compact
            </button>
            <button
              onClick={() => setViewMode('blocks')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition ${
                viewMode === 'blocks'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Large block view"
            >
              <List className="w-3.5 h-3.5" />
              Blocks
            </button>
          </div>
          <button
            onClick={() => setShowChordPalette(!showChordPalette)}
            className="rnrb-button-primary px-4 py-2 rounded-xl font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Chord
          </button>
        </div>
      </div>

      {/* Chord Palette */}
      {showChordPalette && (
        <Card className="p-8 rnrb-card bg-gradient-to-br from-brand-primary/5 to-transparent border-2 border-brand-primary/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl font-display font-bold mb-1">Choose Your Chord</h4>
              <p className="text-sm text-muted-foreground">Click to add • 28 common chords available</p>
            </div>
            <button
              onClick={() => setShowChordPalette(false)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {COMMON_CHORDS.map((chord) => (
              <button
                key={chord}
                onClick={() => addChord(chord)}
                className="px-4 py-4 bg-brand-primary/10 hover:bg-brand-primary/20 hover:scale-105 border-2 border-brand-primary/30 hover:border-brand-primary/50 rounded-xl font-display font-bold text-lg text-brand-primary transition-all duration-200 shadow-md hover:shadow-xl"
              >
                {chord}
              </button>
            ))}
          </div>
          <div className="mt-4 rnrb-card p-3 bg-purple-500/5 border-purple-500/20">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Need suggestions? Ask AI in chat: "What chord goes after {chords[chords.length - 1]?.chord || 'Am'}?"
            </p>
          </div>
        </Card>
      )}

      {/* Chord Progression Workspace */}
      <Card className="p-8 rnrb-card min-h-[400px] bg-gradient-to-b from-surface to-surface-muted/50">
        {chords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-24 h-24 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6">
              <Music className="w-12 h-12 text-brand-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">Your Canvas Awaits</h3>
            <p className="text-lg text-muted-foreground mb-4 max-w-md">
              Click "Add Chord" above to start building your progression.
            </p>
            <p className="text-sm text-brand-primary italic font-medium">
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
              items={chords.map(c => c.id)}
              strategy={viewMode === 'compact' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {viewMode === 'compact' ? (
                /* Compact inline view with wrapping */
                <div className="flex flex-wrap gap-3 items-start">
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
        <div className="rnrb-card p-6 bg-gradient-to-r from-green-500/5 to-brand-primary/5 border-2 border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-primary mb-2">Your Progression:</p>
              <p className="text-2xl font-display font-bold text-foreground leading-relaxed">
                {chords.map(c => c.chord).join(' → ')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {chords.length} {chords.length === 1 ? 'chord' : 'chords'} • 
                {viewMode === 'compact' ? ' Drag buttons to reorder' : ' Drag blocks above to reorder'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

