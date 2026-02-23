'use client';

import { AnimatePresence, motion } from 'motion/react';
import { StickyNote, Plus, X, Save, Trash2 } from '@/components/ui/custom-icons';
import { useState, useCallback } from 'react';

type Note = {
  id: string;
  sectionId: string;
  content: string;
  color: string;
  createdAt: Date;
};

type SectionNotesProps = {
  sectionId: string;
  sectionName: string;
  notes: Note[];
  onAddNote: (sectionId: string, content: string, color: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  className?: string;
};

const NOTE_COLORS = [
  { name: 'Yellow', value: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.4)' },
  { name: 'Orange', value: 'rgba(255, 99, 71, 0.15)', border: 'rgba(255, 99, 71, 0.4)' },
  { name: 'Blue', value: 'rgba(99, 179, 237, 0.15)', border: 'rgba(99, 179, 237, 0.4)' },
  { name: 'Green', value: 'rgba(72, 187, 120, 0.15)', border: 'rgba(72, 187, 120, 0.4)' },
  { name: 'Purple', value: 'rgba(159, 122, 234, 0.15)', border: 'rgba(159, 122, 234, 0.4)' },
];

export function SectionNotes({
  sectionId,
  sectionName,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  className = '',
}: SectionNotesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const sectionNotes = notes.filter((n) => n.sectionId === sectionId);

  const handleAddNote = useCallback(() => {
    if (newNoteContent.trim()) {
      onAddNote(sectionId, newNoteContent.trim(), selectedColor.value);
      setNewNoteContent('');
      setIsAdding(false);
    }
  }, [sectionId, newNoteContent, selectedColor, onAddNote]);

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      onUpdateNote(editingNoteId, editContent.trim());
    }
    setEditingNoteId(null);
    setEditContent('');
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Notes for {sectionName}
          </span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:opacity-80"
            style={{ background: 'var(--panel)', color: 'var(--text)' }}
          >
            <Plus className="h-3 w-3" />
            Add Note
          </button>
        )}
      </div>

      {/* Add new note form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden rounded-lg p-3"
            style={{ background: selectedColor.value, border: `1px solid ${selectedColor.border}` }}
          >
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add a note about this section..."
              rows={2}
              autoFocus
              className="mb-2 w-full resize-none rounded-lg bg-transparent p-2 text-sm outline-hidden"
              style={{ color: 'var(--text)' }}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className="h-5 w-5 rounded-full transition"
                    style={{
                      background: color.value,
                      border: `2px solid ${selectedColor.name === color.name ? color.border : 'transparent'}`,
                    }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="rounded-lg px-2 py-1 text-xs"
                  style={{ color: 'var(--muted)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing notes */}
      <div className="space-y-2">
        {sectionNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group relative rounded-lg p-2"
            style={{
              background: note.color,
              border: `1px solid ${note.color.replace('0.15', '0.4')}`,
            }}
          >
            {editingNoteId === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  autoFocus
                  className="mb-2 w-full resize-none rounded bg-transparent p-1 text-sm outline-hidden"
                  style={{ color: 'var(--text)' }}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p
                  className="cursor-pointer text-sm"
                  style={{ color: 'var(--text)' }}
                  onClick={() => startEditing(note)}
                >
                  {note.content}
                </p>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="absolute right-1 top-1 rounded p-1 opacity-0 transition group-hover:opacity-100"
                  style={{ background: 'var(--background)' }}
                >
                  <X className="h-3 w-3" style={{ color: 'var(--muted)' }} />
                </button>
              </>
            )}
          </motion.div>
        ))}

        {sectionNotes.length === 0 && !isAdding && (
          <p className="text-center text-xs italic" style={{ color: 'var(--muted)' }}>
            No notes yet
          </p>
        )}
      </div>
    </div>
  );
}

// Inline note indicator (for showing on section blocks)
export function NoteIndicator({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs transition hover:opacity-80"
      style={{ background: 'rgba(255, 215, 0, 0.2)', color: 'var(--accent)' }}
    >
      <StickyNote className="h-3 w-3" />
      {count}
    </button>
  );
}

// Hook for managing notes state
export function useNotes(initialNotes: Note[] = []) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const addNote = useCallback((sectionId: string, content: string, color: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      sectionId,
      content,
      color,
      createdAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
  }, []);

  const updateNote = useCallback((noteId: string, content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, content } : n)));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const getNotesForSection = useCallback(
    (sectionId: string) => notes.filter((n) => n.sectionId === sectionId),
    [notes]
  );

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNotesForSection,
  };
}
