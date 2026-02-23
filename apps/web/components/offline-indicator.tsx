'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOfflineStatus } from '@/hooks/use-online-status';

/**
 * Offline indicator that appears when the user loses internet connection
 * Shows pending actions count and syncs automatically when back online
 */
export function OfflineIndicator() {
  const { isOffline, wasOffline, isOnline, pendingActionsCount, syncPendingActions } =
    useOfflineStatus();

  // Show "back online" message briefly after reconnecting
  const showReconnected = wasOffline && isOnline;

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="fixed left-0 right-0 top-0 z-9999 flex items-center justify-center gap-3 px-4 py-2"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
          }}
        >
          {/* Pulsing dot */}
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>

          {/* Message */}
          <span className="text-sm font-medium text-white">
            You're offline
            {pendingActionsCount > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {pendingActionsCount} pending {pendingActionsCount === 1 ? 'change' : 'changes'}
              </span>
            )}
          </span>

          {/* Info icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/70"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </motion.div>
      )}

      {/* "Back online" toast */}
      {showReconnected && !isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="fixed left-0 right-0 top-0 z-9999 flex items-center justify-center gap-3 px-4 py-2"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-white">
            Back online!
            {pendingActionsCount > 0 && ' Syncing changes...'}
          </span>

          {pendingActionsCount > 0 && (
            <button
              onClick={syncPendingActions}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/30"
            >
              Sync Now
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mini offline indicator for corners/headers
 */
export function OfflineIndicatorMini() {
  const { isOffline } = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
      style={{
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      Offline
    </div>
  );
}
