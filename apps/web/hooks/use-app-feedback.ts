'use client';

import { useCallback, useState } from 'react';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  text: string;
}

/**
 * Unified feedback hook — replaces alert(), confirm(), and bare console.error patterns.
 *
 * Usage:
 *   const { feedback, showSuccess, showError, confirm, dismiss } = useAppFeedback();
 *
 *   // Instead of alert('Saved!')
 *   showSuccess('Saved!');
 *
 *   // Instead of if (confirm('Delete?'))
 *   const ok = await confirm('Delete this song?');
 *   if (ok) { ... }
 *
 *   // Wrap API calls with automatic error feedback
 *   try { await fetch(...); showSuccess('Done'); }
 *   catch { showError('Failed to save. Please try again.'); }
 */
export function useAppFeedback() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [confirmState, setConfirmState] = useState<{
    text: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const dismiss = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const show = useCallback(
    (type: FeedbackType, text: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setMessages((prev) => [...prev.slice(-4), { id, type, text }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const showSuccess = useCallback((text: string) => show('success', text), [show]);
  const showError = useCallback((text: string) => show('error', text, 6000), [show]);
  const showInfo = useCallback((text: string) => show('info', text), [show]);

  const confirm = useCallback((text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ text, resolve });
    });
  }, []);

  const handleConfirm = useCallback(
    (value: boolean) => {
      if (confirmState) {
        confirmState.resolve(value);
        setConfirmState(null);
      }
    },
    [confirmState]
  );

  return {
    messages,
    confirmState,
    showSuccess,
    showError,
    showInfo,
    confirm,
    handleConfirm,
    dismiss,
  };
}
