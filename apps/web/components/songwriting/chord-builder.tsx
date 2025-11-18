'use client';

import { useState } from 'react';
import { Card } from '@cronkwaters/ui';
import { Plus, X, Music, Sparkles } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
      className="rnrb-card p-4 bg-brand-primary/10 border-brand-primary/30 cursor-move hover:shadow-lg transition group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="w-5 h-5 text-brand-primary" />
          <div>
            <p className="font-bold text-xl text-brand-primary">{chord}</p>
            {duration && <p className="text-xs text-muted-foreground">{duration}</p>}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ChordBuilder({ onChange }: { onChange: (chords: ChordBlock[]) => void }) {
  const [chords, setChords] = useState<ChordBlock[]>([]);
  const [showChordPalette, setShowChordPalette] = useState(false);

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
      duration: '1 bar'
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Music className="w-5 h-5 text-brand-primary" />
            Chord Progression Builder
          </h3>
          <p className="text-sm text-muted-foreground">Drag blocks to reorder • Click chord to edit</p>
        </div>
        <button
          onClick={() => setShowChordPalette(!showChordPalette)}
          className="rnrb-button-primary px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Chord
        </button>
      </div>

      {/* Chord Palette */}
      {showChordPalette && (
        <Card className="p-6 rnrb-card bg-surface-muted">
          <h4 className="font-semibold mb-4">Choose a Chord</h4>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {COMMON_CHORDS.map((chord) => (
              <button
                key={chord}
                onClick={() => addChord(chord)}
                className="px-4 py-3 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded-lg font-bold text-brand-primary transition"
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

      {/* Chord Progression */}
      <Card className="p-6 rnrb-card min-h-[300px]">
        {chords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              No chords yet. Click "Add Chord" to start building your progression.
            </p>
            <p className="text-sm text-muted-foreground italic">
              "Every song starts with a single chord" 🎵
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
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {chords.map((chord) => (
                  <SortableChordBlock
                    key={chord.id}
                    {...chord}
                    onRemove={() => removeChord(chord.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {chords.length > 0 && (
        <div className="rnrb-card p-4 bg-green-500/5 border-green-500/20">
          <p className="text-sm font-medium text-brand-primary mb-1">Your Progression:</p>
          <p className="text-lg font-bold text-foreground">
            {chords.map(c => c.chord).join(' → ')}
          </p>
        </div>
      )}
    </div>
  );
}

