'use client';

import { AnimatePresence, motion } from 'motion/react';
import { GitBranch, Save, Sparkles, X } from '@/components/ui/custom-icons';
import { useState } from 'react';

type SaveVersionModalProps = {
  songId: string | undefined;
  isOpen: boolean;
  onClose: () => void;
  onVersionSaved: () => void;
};

const QUICK_LABELS = [
  { label: 'Demo', description: 'Early draft or demo recording' },
  { label: 'Work In Progress', description: 'Still being worked on' },
  { label: 'Ready for Review', description: 'Ready for feedback' },
  { label: 'Final Mix', description: 'Completed mix' },
  { label: 'Radio Edit', description: 'Shortened radio version' },
  { label: 'Acoustic Version', description: 'Stripped down acoustic' },
  { label: 'Live Version', description: 'Live performance recording' },
  { label: 'Remix', description: 'Remixed version' },
];

export function SaveVersionModal({
  songId,
  isOpen,
  onClose,
  onVersionSaved,
}: SaveVersionModalProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [makePublished, setMakePublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!songId) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/songs/${songId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim() || undefined,
          description: description.trim() || undefined,
          makePublished,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save version');
      }

      onVersionSaved();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save version');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setLabel('');
    setDescription('');
    setMakePublished(false);
    setError(null);
    onClose();
  };

  const selectQuickLabel = (quickLabel: string) => {
    setLabel(quickLabel);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b p-6"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.1))',
                }}
              >
                <GitBranch className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                  Save Version
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Create a snapshot of your current song
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 transition hover:opacity-80"
              style={{ background: 'var(--panel)' }}
            >
              <X className="h-5 w-5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div
                className="mb-4 rounded-xl p-4"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}
              >
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Quick Labels */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                <Sparkles className="mr-1 inline h-4 w-4" style={{ color: 'var(--accent)' }} />
                Quick Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_LABELS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => selectQuickLabel(item.label)}
                    className="rounded-lg px-3 py-1.5 text-sm transition"
                    style={{
                      background: label === item.label ? 'var(--accent)' : 'var(--panel)',
                      color: label === item.label ? 'white' : 'var(--text)',
                      border: `1px solid ${label === item.label ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                    title={item.description}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Label */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                Version Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Demo, Final Mix, Acoustic Version"
                className="w-full rounded-xl px-4 py-3 text-sm outline-hidden transition focus:ring-2"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                Leave blank for auto-numbering (Version 1, Version 2, etc.)
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what changed in this version..."
                rows={3}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-hidden transition focus:ring-2"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                e.g., "Added bridge section, changed chorus melody"
              </p>
            </div>

            {/* Publish Option */}
            <div
              className="mb-6 flex items-center gap-3 rounded-xl p-4"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setMakePublished(!makePublished)}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{
                  background: makePublished ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <motion.div
                  className="absolute top-1 h-4 w-4 rounded-full bg-white"
                  animate={{ left: makePublished ? '1.5rem' : '0.25rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Set as Published Version
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Mark this as the official "live" version of your song
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div
              className="mb-6 rounded-xl p-4"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 99, 71, 0.1), rgba(255, 215, 0, 0.05))',
                border: '1px solid rgba(255, 99, 71, 0.2)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--text)' }}>Pro tip:</strong> Save versions before
                making major changes. You can always restore any previous version from the Version
                History panel.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 border-t p-6"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition"
              style={{ background: 'var(--background)', color: 'var(--text)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !songId}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Version
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
