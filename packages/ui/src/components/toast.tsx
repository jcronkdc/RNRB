import * as ToastPrimitive from '@radix-ui/react-toast';
import * as React from 'react';

import { Button } from './button';
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

const ToastProvider: React.FC<React.PropsWithChildren<{ duration?: number }>> = ({
  children,
  duration = 4000
}) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const notify = React.useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, duration, variant: 'default', ...toast }]);
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
      <ToastPrimitive.Provider swipeDirection="right" duration={duration}>
        {children}
        {toasts.map(({ id, title, description, action, duration: itemDuration, variant }) => (
          <Toast
            key={id}
            id={id}
            title={title}
            description={description}
            action={action}
            duration={itemDuration ?? duration}
            variant={variant}
            onOpenChange={(open) => {
              if (!open) dismiss(id);
            }}
          />
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

interface ToastProps extends Omit<ToastPrimitive.ToastProps, 'title'> {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastVariant;
}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  ({ className, title, description, action, variant = 'default', ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full min-w-[320px] max-w-sm items-center justify-between gap-4 overflow-hidden rounded-md border border-border bg-background p-4 text-foreground shadow-md transition-all data-[swipe=end]:translate-x-[100%] data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:animate-in data-[state=open]:fade-in-80',
        variant === 'destructive' && 'border-red-400 bg-red-100 text-red-900',
        className
      )}
      {...props}
    >
      <div className="grid gap-1">
        {title ? <ToastPrimitive.Title className="text-sm font-semibold">{title}</ToastPrimitive.Title> : null}
        {description ? (
          <ToastPrimitive.Description className="text-sm text-brand-muted-foreground">
            {description}
          </ToastPrimitive.Description>
        ) : null}
      </div>
      {action}
      <ToastPrimitive.Close asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full" aria-label="Close">
          ×
        </Button>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
);
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-4 right-4 z-[999] flex max-h-screen w-full flex-col gap-2 outline-none',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export { ToastProvider, ToastViewport, Toast, ToastPrimitive };
