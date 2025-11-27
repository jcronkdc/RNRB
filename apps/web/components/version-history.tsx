'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Clock, GitBranch, Play, RotateCcw, Star, Trash2, Music, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Version = {
  id: string;
  versionNum: number;
  label: string | null;
  description: string | null;
  hasAudio: boolean;
  isPublished: boolean;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: string;
};

type VersionHistoryProps = {
  songId: string;
  onRestore?: (versionId: string) => void;
  onPlay?: (versionId: string) => void;
};

export function VersionHistory({ songId, onRestore, onPlay }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, [songId]);

  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/songs/${songId}/versions`);
      if (!response.ok) throw new Error('Failed to load versions');
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    const label = prompt('Version label (e.g., "Demo", "Final Mix"):');
    if (!label) return;

    const description = prompt('Description (optional):') || undefined;

    try {
      const response = await fetch(`/api/songs/${songId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, description }),
      });

      if (!response.ok) throw new Error('Failed to create version');

      await loadVersions();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore this version? Current state will be saved as a new version.')) return;

    try {
      const response = await fetch(`/api/songs/${songId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });

      if (!response.ok) throw new Error('Failed to restore version');

      alert('Version restored successfully!');
      onRestore?.(versionId);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePublish = async (versionId: string) => {
    try {
      const response = await fetch(`/api/songs/${songId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });

      if (!response.ok) throw new Error('Failed to publish version');

      await loadVersions();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm('Delete this version? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/songs/${songId}/versions/${versionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete version');

      await loadVersions();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading version history...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">Error: {error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-brand-primary" />
          <h2 className="text-xl font-semibold">Version History</h2>
        </div>
        <Button
          onClick={handleCreateVersion}
          className="rnrb-button-primary flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Save Version
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {versions.length === 0 ? (
          <Card className="p-8 text-center">
            <GitBranch className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="mb-2 text-muted-foreground">No versions saved yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Save Version" to create a snapshot of your current work
            </p>
          </Card>
        ) : (
          versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`p-4 transition-all ${
                  selectedVersion === version.id
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'hover:border-brand-primary/50'
                }`}
                onClick={() => setSelectedVersion(version.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Version Info */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
                      <span className="font-semibold text-brand-primary">
                        v{version.versionNum}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">
                          {version.label || `Version ${version.versionNum}`}
                        </h3>
                        {version.isPublished && (
                          <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                            <Star className="h-3 w-3 fill-current" />
                            Published
                          </span>
                        )}
                      </div>

                      {version.description && (
                        <p className="mb-2 text-sm text-muted-foreground">{version.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(version.createdAt).toLocaleDateString()} at{' '}
                          {new Date(version.createdAt).toLocaleTimeString()}
                        </span>
                        <span>by {version.createdBy.name || version.createdBy.email}</span>
                        {version.hasAudio && (
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            Has audio
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {version.hasAudio && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay?.(version.id);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Play
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(version.id);
                      }}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>

                    {!version.isPublished && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(version.id);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        Publish
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(version.id);
                      }}
                      className="flex items-center gap-1 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
