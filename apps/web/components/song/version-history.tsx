'use client';

import { useState } from 'react';
import { Clock, RotateCcw, GitBranch, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Version History Sidebar
 * Shows all saved versions of song
 * Click to preview, restore, or compare
 */

interface SongVersion {
  id: string;
  versionNumber: number;
  title: string;
  lyrics: string;
  chords?: string;
  structure?: string;
  createdAt: Date;
  createdByName: string;
  snapshotReason?: string;
}

interface VersionHistoryProps {
  songId: string;
  versions: SongVersion[];
  currentVersion: number;
  onRestore: (versionId: string) => void;
  onPreview: (versionId: string) => void;
  onCompare: (versionId1: string, versionId2: string) => void;
}

export default function VersionHistory({
  songId,
  versions,
  currentVersion,
  onRestore,
  onPreview,
  onCompare
}: VersionHistoryProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const toggleCompareSelection = (versionId: string) => {
    if (selectedForCompare.includes(versionId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== versionId));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, versionId]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      onCompare(selectedForCompare[0], selectedForCompare[1]);
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  };

  return (
    <div className="rnrb-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          Version History
        </h3>
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
            compareMode 
              ? 'bg-brand-primary text-brand-primary-foreground' 
              : 'border border-border hover:border-brand-primary'
          }`}
        >
          {compareMode ? 'COMPARING' : 'COMPARE'}
        </button>
      </div>

      {compareMode && (
        <div className="mb-4 p-3 bg-brand-primary/5 rounded border border-brand-primary/30">
          <p className="text-xs text-muted-foreground mb-2">
            Select 2 versions to compare
          </p>
          {selectedForCompare.length === 2 && (
            <button
              onClick={handleCompare}
              className="w-full px-4 py-2 bg-brand-primary text-brand-primary-foreground rounded text-sm font-semibold"
            >
              COMPARE SELECTED
            </button>
          )}
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {sortedVersions.map((version, index) => {
            const isCurrent = version.versionNumber === currentVersion;
            const isSelected = selectedForCompare.includes(version.id);
            const isExpanded = expandedVersion === version.id;

            return (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg transition-all ${
                  isCurrent ? 'border-brand-primary bg-brand-primary/5' :
                  isSelected ? 'border-blue-500 bg-blue-500/5' :
                  'border-border hover:border-border-muted'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompareSelection(version.id)}
                          disabled={selectedForCompare.length >= 2 && !isSelected}
                          className="mr-2"
                        />
                      )}
                      
                      <div className="inline-block">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            V{version.versionNumber}
                            {isCurrent && <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded">CURRENT</span>}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                        
                        {version.createdByName && (
                          <p className="text-xs text-muted-foreground">
                            by {version.createdByName}
                          </p>
                        )}
                        
                        {version.snapshotReason && (
                          <p className="text-xs text-brand-primary mt-1">
                            {version.snapshotReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {!compareMode && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setExpandedVersion(isExpanded ? null : version.id)}
                          title="Preview"
                          className="p-1.5 hover:bg-surface rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              if (confirm(`Restore to version ${version.versionNumber}? Current changes will be saved as a new version.`)) {
                                onRestore(version.id);
                              }
                            }}
                            title="Restore this version"
                            className="p-1.5 hover:bg-surface rounded transition-colors text-brand-primary"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-border"
                    >
                      <div className="bg-surface/50 rounded p-3 font-mono text-xs">
                        <p className="text-muted-foreground mb-1">
                          {version.lyrics.split('\n').length} lines
                        </p>
                        <p className="text-foreground/70 line-clamp-4">
                          {version.lyrics.substring(0, 200)}...
                        </p>
                      </div>
                      
                      {!isCurrent && (
                        <button
                          onClick={() => {
                            if (confirm(`Restore to version ${version.versionNumber}?`)) {
                              onRestore(version.id);
                            }
                          }}
                          className="mt-2 w-full px-4 py-2 bg-brand-primary text-brand-primary-foreground rounded text-sm font-semibold"
                        >
                          <RotateCcw className="w-3 h-3 inline mr-2" />
                          RESTORE THIS VERSION
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {versions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No version history yet</p>
            <p className="text-xs">Versions auto-save every 5 minutes</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-muted/20 rounded text-xs text-muted-foreground">
        <p className="font-semibold mb-1">Auto-Snapshot:</p>
        <p>• Every 5 minutes if changes detected</p>
        <p>• Before major operations (restructure, accept suggestions)</p>
        <p>• Keeps last 50 versions</p>
      </div>
    </div>
  );
}
