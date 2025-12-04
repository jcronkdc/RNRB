'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from '@/components/ui/custom-icons';
import { useEffect, useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: 'text-green-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: 'text-yellow-400',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = icons[toast.type];
  const color = colors[toast.type];
  // Use ref to avoid re-running effect when onRemove changes
  const onRemoveRef = useRef(onRemove);
  onRemoveRef.current = onRemove;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemoveRef.current();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration]); // Only depend on toast.id and duration

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-start gap-3 rounded-lg border ${color.bg} ${color.border} p-4 shadow-lg`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${color.icon}`} />
      <p className={`flex-1 text-sm font-medium ${color.text}`}>{toast.message}</p>
      <button onClick={onRemove} className="text-gray-400 transition-colors hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastNotification({ toasts, onRemove }: ToastNotificationProps) {
  // Memoize the remove handler to prevent unnecessary re-renders
  const handleRemove = useCallback(
    (id: string) => {
      onRemove(id);
    },
    [onRemove]
  );

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={() => handleRemove(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}-${Date.now()}`;
    const newToast: Toast = { id, type, message, duration };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => addToast('success', message, duration),
    [addToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => addToast('error', message, duration),
    [addToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => addToast('warning', message, duration),
    [addToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => addToast('info', message, duration),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
