'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X, Check, AlertTriangle, Info } from '@/components/ui/custom-icons';

interface FeedbackMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ConfirmState {
  text: string;
}

const ICONS = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: 'var(--sage-muted)', icon: 'var(--sage)', border: 'var(--sage)' },
  error: { bg: 'rgba(220, 38, 38, 0.1)', icon: 'var(--error)', border: 'var(--error)' },
  info: { bg: 'var(--sky-muted)', icon: 'var(--sky)', border: 'var(--sky)' },
};

export function FeedbackToasts({
  messages,
  onDismiss,
}: {
  messages: FeedbackMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {messages.map((msg) => {
          const Icon = ICONS[msg.type];
          const colors = COLORS[msg.type];
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ background: colors.bg }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: colors.icon }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{msg.text}</p>
              <button
                onClick={() => onDismiss(msg.id)}
                className="ml-2 shrink-0 rounded p-0.5 transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function ConfirmDialog({
  text,
  onConfirm,
  onCancel,
}: {
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-xl border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{text}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/[0.03]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
