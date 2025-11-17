import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "../lib/cn";
import { Button } from "./button";

type ToastActionElement = React.ReactElement<typeof ToastPrimitive.Action>;

export interface ToastOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  action?: ToastActionElement;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

const generateId = () => Math.random().toString(36).slice(2, 11);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastOptions[]>([]);

  const toast = React.useCallback((options: ToastOptions) => {
    setToasts((current) => {
      const id = options.id ?? generateId();
      const next = { ...options, id };
      return [...current.filter((item) => item.id !== id), next];
    });
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastViewport />
        {toasts.map(({ id = generateId(), title, description, duration = 5000, action }) => (
          <ToastPrimitive.Root
            key={id}
            duration={duration}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(id);
              }
            }}
            className={cn(
              "group pointer-events-auto relative flex w-[360px] flex-col gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white p-4 shadow-lg transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full dark:border-neutral-800 dark:bg-neutral-950"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {title ? (
                  <ToastPrimitive.Title className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                    {title}
                  </ToastPrimitive.Title>
                ) : null}
                {description ? (
                  <ToastPrimitive.Description className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              <ToastPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-neutral-500 hover:text-neutral-700"
                >
                  <span className="sr-only">Dismiss</span>
                  ×
                </Button>
              </ToastPrimitive.Close>
            </div>
            {action ? (
              <div className="flex justify-end">
                {React.cloneElement(action, {
                  className: cn("mt-2", action.props.className)
                })}
              </div>
            ) : null}
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = "ToastProvider";

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex w-full max-w-[380px] flex-col gap-3 p-4 outline-none sm:bottom-4 sm:right-4",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const ToastAction = ToastPrimitive.Action;

const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider />");
  }
  return context;
};

export { ToastProvider, ToastViewport, ToastPrimitive as Toast, ToastAction, useToast };

