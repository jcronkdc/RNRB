/**
 * Cursor Overlay Component
 *
 * Renders remote user cursors on top of collaborative workspaces
 * Shows real-time cursor positions with smooth animations
 *
 * Features:
 * - Smooth cursor movement (60fps updates)
 * - User name labels
 * - Color-coded per user
 * - Click animation ripple
 * - Fade out on idle
 *
 * Usage:
 * <CursorOverlay cursors={remoteCursors} />
 */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2 } from '@/components/ui/custom-icons';

import { type CursorPosition } from '@/hooks/use-collaborative-cursors';

type CursorOverlayProps = {
  cursors: CursorPosition[];
};

export function CursorOverlay({ cursors }: CursorOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-9999">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <RemoteCursor key={cursor.userId} cursor={cursor} />
        ))}
      </AnimatePresence>
    </div>
  );
}

type RemoteCursorProps = {
  cursor: CursorPosition;
};

function RemoteCursor({ cursor }: RemoteCursorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: cursor.isIdle ? 0 : 1,
        scale: 1,
        x: cursor.x,
        y: cursor.y,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className="absolute left-0 top-0"
      style={{
        transformOrigin: 'top left',
      }}
    >
      {/* Cursor Icon */}
      <div className="relative">
        <MousePointer2
          className="h-6 w-6 drop-shadow-lg"
          style={{
            color: cursor.userColor,
            fill: cursor.userColor,
            strokeWidth: 1,
            stroke: '#000',
          }}
        />

        {/* User Name Label */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute left-2 top-6 whitespace-nowrap"
        >
          <div
            className="rounded-md px-2 py-1 text-xs font-medium text-white shadow-lg"
            style={{
              backgroundColor: cursor.userColor,
            }}
          >
            {cursor.userName}
          </div>
        </motion.div>

        {/* Click Ripple Animation */}
        {cursor.isClick && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute left-0 top-0 h-6 w-6 rounded-full border-2"
            style={{
              borderColor: cursor.userColor,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
