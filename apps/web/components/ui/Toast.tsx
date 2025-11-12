'use client';

import { cn } from '@songforge/ui';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const ToastContext = createContext<{ push: (msg: string, opts?: { tone?: Tone; ttlMs?: number }) => void } | undefined>(undefined);
type Tone = 'info' | 'success' | 'warn' | 'error';
interface ToastState {
  id: number;
  msg: string;
  tone: Tone;
  ttl: number;
}

const toneToClass: Record<Tone, string> = {
  info: 'border-border/70',
  success: 'border-success bg-success/10',
  warn: 'border-warning bg-warning/10',
  error: 'border-danger bg-danger/10'
};

interface ToastHostProps {
  toasts: ToastState[];
  onDismiss: (id: number) => void;
}

export function ToastHost({ toasts, onDismiss }: ToastHostProps) {
  // Remove toast after TTL
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(({ id, ttl }) =>
      setTimeout(() => onDismiss(id), ttl)
    );
    return () => timers.forEach((tid) => clearTimeout(tid));
  }, [toasts, onDismiss]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[99] flex flex-col items-end gap-3 sm:inset-x-10"
      style={{ width: 'auto' }}
      tabIndex={-1}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto mb-2 min-w-[200px] max-w-xs rounded-2xl border bg-surface px-4 py-3 text-sm shadow-soft transition motion-safe:translate-y-0 motion-safe:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
            toneToClass[t.tone] ?? toneToClass.info,
            'motion-safe:fade-in-enter',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{t.msg}</span>
            <button
              type="button"
              className="ml-2 rounded-full p-1 text-muted-foreground hover:text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              aria-label="Dismiss notification"
              tabIndex={0}
              onClick={() => onDismiss(t.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const setter = useContext(ToastContext);
  if (!setter) throw new Error('useToast() must be used under <ToastProvider>');
  return setter;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const nextId = useRef(1);
  
  const push = useCallback((msg: string, opts?: { tone?: Tone; ttlMs?: number }) => {
    setToasts((prev) => [
      ...prev,
      { id: nextId.current++, msg, tone: opts?.tone ?? 'info', ttl: opts?.ttlMs ?? 3000 }
    ]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      <ToastHost toasts={toasts} onDismiss={dismiss} />
      {children}
    </ToastContext.Provider>
  );
}
