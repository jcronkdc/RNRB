'use client';

/**
 * Version Snapshot Manager Component
 *
 * UI for managing song versions
 * Save milestones, restore to any point, compare versions
 *
 * Features:
 * - Create named snapshots
 * - View all versions with timeline
 * - Restore to snapshot
 * - Delete snapshots
 * - Compare snapshots
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  RotateCcw,
  Trash2,
  GitBranch,
  Clock,
  Edit2,
  Check,
  X,
  GitCompare,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

import { useVersionSnapshots } from '@/hooks/use-version-snapshots';

interface VersionSnapshotManagerProps {
  songId: string;
  currentUserId: string;
  onRestore?: (snapshotId: string) => void;
  onCompare?: (snapshot1Id: string, snapshot2Id: string) => void;
  className?: string;
}

export function VersionSnapshotManager({
  songId,
  currentUserId,
  onRestore,
  onCompare,
  className = '',
}: VersionSnapshotManagerProps) {
  const {
    snapshots,
    loading,
    error,
    latestSnapshot,
    publishedSnapshot,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    updateSnapshot,
  } = useVersionSnapshots({ songId, currentUserId });

  const [isCreating, setIsCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleCreateSnapshot = async () => {
    if (!newLabel.trim()) return;

    try {
      await createSnapshot(newLabel, newDescription || undefined);
      setIsCreating(false);
      setNewLabel('');
      setNewDescription('');
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    }
  };

  const handleRestore = async (snapshotId: string) => {
    if (!confirm('Restore song to this version? Current state will be saved as a new snapshot.')) {
      return;
    }

    try {
      await restoreSnapshot(snapshotId);
      if (onRestore) {
        onRestore(snapshotId);
      }
    } catch (error) {
      console.error('Failed to restore:', error);
    }
  };

  const handleDelete = async (snapshotId: string) => {
    if (!confirm('Delete this snapshot permanently?')) return;

    try {
      await deleteSnapshot(snapshotId);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = async (snapshotId: string) => {
    if (!editLabel.trim()) return;

    try {
      await updateSnapshot(snapshotId, {
        label: editLabel,
        description: editDescription || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const toggleCompareSelection = (snapshotId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(snapshotId)) {
        return prev.filter((id) => id !== snapshotId);
      }
      if (prev.length < 4) {
        // Max 4 versions to compare
        return [...prev, snapshotId];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2 && onCompare) {
      onCompare(selectedForCompare[0], selectedForCompare[1]);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-lg border border-border bg-surface p-6 ${className}`}>
        <p className="text-center text-muted-foreground">Loading versions...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border bg-surface ${className}`}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <GitBranch className="h-5 w-5 text-brand-primary" />
              Version History
            </h3>
            <p className="text-sm text-muted-foreground">
              {snapshots.length} {snapshots.length === 1 ? 'version' : 'versions'} saved
            </p>
          </div>
          <div className="flex gap-2">
            {selectedForCompare.length >= 2 && (
              <Button onClick={handleCompare} variant="default" size="sm">
                <GitCompare className="h-4 w-4" />
                <span>Compare ({selectedForCompare.length})</span>
              </Button>
            )}
            <Button onClick={() => setIsCreating(true)} variant="default" size="sm">
              <Save className="h-4 w-4" />
              <span>Save Snapshot</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Create Snapshot Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border p-4"
          >
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="snapshot-name"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Snapshot Name *
                </label>
                <input
                  id="snapshot-name"
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Demo Ready, Final Mix, Pre-Producer Review"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-hidden placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label
                  htmlFor="snapshot-description"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Description (optional)
                </label>
                <textarea
                  id="snapshot-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-hidden placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setNewLabel('');
                    setNewDescription('');
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSnapshot}
                  disabled={!newLabel.trim()}
                  variant="default"
                  size="sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Snapshot</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snapshots Timeline */}
      <div className="max-h-[600px] space-y-3 overflow-y-auto p-4">
        <AnimatePresence>
          {snapshots.map((snapshot, index) => {
            const isLatest = snapshot.id === latestSnapshot?.id;
            const isPublished = snapshot.id === publishedSnapshot?.id;
            const isSelected = selectedForCompare.includes(snapshot.id);

            return (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`rounded-lg border border-border p-4 transition ${
                  isSelected ? 'border-brand-primary bg-brand-primary/5' : 'bg-surface-muted'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Version Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {/* Version number badge */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-bold text-brand-primary">
                        v{snapshot.versionNum}
                      </div>

                      {/* Label */}
                      {editingId === snapshot.id ? (
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm text-foreground"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <h4 className="flex items-center gap-2 font-semibold text-foreground">
                            {snapshot.label || `Version ${snapshot.versionNum}`}
                            {isLatest && (
                              <span className="rounded-full bg-brand-primary/20 px-2 py-0.5 text-xs font-medium text-brand-primary">
                                Latest
                              </span>
                            )}
                            {isPublished && (
                              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600">
                                Published
                              </span>
                            )}
                          </h4>
                          {snapshot.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {snapshot.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(snapshot.createdAt).toLocaleString()}
                      </span>
                      <span>by {snapshot.createdByName}</span>
                      {snapshot.tempo && <span>{snapshot.tempo} BPM</span>}
                      {snapshot.key && <span>Key: {snapshot.key}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    {editingId === snapshot.id ? (
                      <>
                        <Button onClick={() => handleEdit(snapshot.id)} size="sm" variant="default">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button onClick={() => setEditingId(null)} size="sm" variant="secondary">
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => toggleCompareSelection(snapshot.id)}
                          size="sm"
                          variant={isSelected ? 'default' : 'secondary'}
                          title="Select for comparison"
                        >
                          <GitCompare className="h-3 w-3" />
                        </Button>
                        {!isLatest && (
                          <Button
                            onClick={() => handleRestore(snapshot.id)}
                            size="sm"
                            variant="secondary"
                            title="Restore to this version"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setEditingId(snapshot.id);
                            setEditLabel(snapshot.label || '');
                            setEditDescription(snapshot.description || '');
                          }}
                          size="sm"
                          variant="secondary"
                          title="Edit metadata"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(snapshot.id)}
                          size="sm"
                          variant="secondary"
                          title="Delete snapshot"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {snapshots.length === 0 && (
          <div className="py-12 text-center">
            <GitBranch className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No snapshots saved yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create snapshots to save important milestones
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="border-t border-border p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
