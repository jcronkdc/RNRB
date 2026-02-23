'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

export type ToastVariant = 'default' | 'destructive';

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastItem[];
  notify: (toast: Omit<ToastItem, 'id'>) => string;
  dismiss: (id?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  duration?: number;
}

function ToastProvider({ children, duration = 4000 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const notify = React.useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, duration, variant: 'default', ...toast }]);

      // Auto dismiss after duration
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, toast.duration ?? duration);

      return id;
    },
    [duration]
  );

  const dismiss = React.useCallback((id?: string) => {
    if (!id) {
      setToasts([]);
      return;
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
      <ToastViewport>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProps extends ToastItem {
  onDismiss?: () => void;
  className?: string;
}

function Toast({
  title,
  description,
  action,
  variant = 'default',
  onDismiss,
  className,
}: ToastProps) {
  return (
    <div
      role="alert"
      className={cn(
        'group pointer-events-auto relative flex w-full min-w-[320px] max-w-sm items-center justify-between gap-4 overflow-hidden rounded-md border border-border bg-background p-4 text-foreground shadow-md transition-all animate-in fade-in-80 slide-in-from-bottom-5',
        variant === 'destructive' && 'border-red-400 bg-red-100 text-red-900',
        className
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm text-brand-muted-foreground">{description}</div>}
      </div>
      {action}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-hidden focus:ring-2 group-hover:opacity-100"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

interface ToastViewportProps {
  children: React.ReactNode;
  className?: string;
}

function ToastViewport({ children, className }: ToastViewportProps) {
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-999 flex max-h-screen w-full flex-col gap-2 outline-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

// Re-export for backwards compatibility (empty object, no Radix primitives)
export const ToastPrimitive = {};

export { ToastProvider, ToastViewport, Toast };
