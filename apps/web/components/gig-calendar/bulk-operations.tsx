'use client';

/**
 * BULK OPERATIONS COMPONENT
 * 
 * Multi-select and bulk actions for shows:
 * - Bulk delete
 * - Bulk status update
 * - Bulk export
 * - Bulk add to tour
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface BulkOperationsProps {
  selectedShows: Set<string>;
  shows: Array<{
    id: string;
    name: string;
    [key: string]: unknown;
  }>;
  onClearSelection: () => void;
  onDelete: (showIds: string[]) => Promise<void>;
  onUpdateStatus: (showIds: string[], status: string) => Promise<void>;
  onExport: (showIds: string[]) => void;
  onAddToTour?: (showIds: string[], tourId: string) => Promise<void>;
}

export function BulkOperations({
  selectedShows,
  shows,
  onClearSelection,
  onDelete,
  onUpdateStatus,
  onExport,
  onAddToTour,
}: BulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{
    type: 'delete' | 'status';
    status?: string;
  } | null>(null);

  const selectedCount = selectedShows.size;

  if (selectedCount === 0) return null;

  const selectedShowsData = shows.filter((show) => selectedShows.has(show.id));

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete(Array.from(selectedShows));
      onClearSelection();
    } finally {
      setIsProcessing(false);
      setShowConfirm(null);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setIsProcessing(true);
    try {
      await onUpdateStatus(Array.from(selectedShows), status);
      onClearSelection();
    } finally {
      setIsProcessing(false);
      setShowConfirm(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="bg-background rnrb-card flex items-center gap-4 rounded-2xl border-2 border-brand-primary p-4 shadow-2xl">
            {/* Count */}
            <div className="flex items-center gap-2">
              <div className="bg-brand-primary/20 text-brand-primary flex h-10 w-10 items-center justify-center rounded-full font-bold">
                {selectedCount}
              </div>
              <span className="text-sm font-medium">
                {selectedCount === 1 ? 'show' : 'shows'} selected
              </span>
            </div>

            {/* Divider */}
            <div className="border-border h-8 w-px" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Status Updates */}
              <Button
                onClick={() => handleUpdateStatus('confirmed')}
                disabled={isProcessing}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Confirm</span>
              </Button>

              <Button
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={isProcessing}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>

              {/* Export */}
              <Button
                onClick={() => onExport(Array.from(selectedShows))}
                disabled={isProcessing}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              {/* Delete */}
              <Button
                onClick={() => setShowConfirm({ type: 'delete' })}
                disabled={isProcessing}
                size="sm"
                variant="outline"
                className="flex items-center gap-1 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>

              {/* Divider */}
              <div className="border-border h-8 w-px" />

              {/* Clear */}
              <Button
                onClick={onClearSelection}
                disabled={isProcessing}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background max-w-md rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-red-500/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Confirm Action</h3>
                  <p className="text-muted-foreground text-sm">
                    This action affects {selectedCount} {selectedCount === 1 ? 'show' : 'shows'}
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 mb-6 max-h-48 overflow-y-auto rounded-lg p-3">
                {selectedShowsData.slice(0, 5).map((show) => (
                  <div key={show.id} className="text-sm">
                    • {show.name}
                  </div>
                ))}
                {selectedShowsData.length > 5 && (
                  <div className="text-muted-foreground text-xs">
                    + {selectedShowsData.length - 5} more
                  </div>
                )}
              </div>

              {showConfirm.type === 'delete' && (
                <p className="text-muted-foreground mb-6 text-sm">
                  Are you sure you want to delete these shows? This action cannot be undone.
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowConfirm(null)}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={showConfirm.type === 'delete' ? handleDelete : () => {}}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

