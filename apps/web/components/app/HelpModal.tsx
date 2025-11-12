'use client';

import { Button } from '@songforge/ui';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { usePlatformKey } from './usePlatformKey';

interface HelpModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SHORTCUTS = [
  {
    label: 'Command Palette',
    keys: (modifier: string) => `${modifier} + K`
  },
  {
    label: 'Open Help',
    keys: () => '?'
  },
  {
    label: 'Go to Projects',
    keys: () => 'g then p'
  },
  {
    label: 'Focus Search',
    keys: () => '/'
  }
];

export default function HelpModal({ open: controlledOpen, onOpenChange }: HelpModalProps) {
  const modifier = usePlatformKey();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isControlled = typeof controlledOpen === 'boolean';
  const resolvedOpen = isControlled ? controlledOpen : open;

  const setResolvedOpen = useCallback(
    (value: boolean) => {
      if (isControlled) {
        onOpenChange?.(value);
      } else {
        setOpen(value);
        onOpenChange?.(value);
      }
    },
    [isControlled, onOpenChange]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        setResolvedOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setResolvedOpen]);

  useEffect(() => {
    if (!resolvedOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setResolvedOpen(false);
      }
    };

    const previousActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      previousActive?.focus?.();
    };
  }, [resolvedOpen, setResolvedOpen]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        setResolvedOpen(false);
      }
    },
    [setResolvedOpen]
  );

  const handleOverlayKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        setResolvedOpen(false);
      }
    },
    [setResolvedOpen]
  );

  const items = useMemo(
    () => SHORTCUTS.map((shortcut) => ({
      label: shortcut.label,
      keys: shortcut.keys(modifier)
    })),
    [modifier]
  );

  if (!resolvedOpen) return null;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      tabIndex={-1}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg space-y-6 rounded-3xl border border-border/60 bg-surface/95 p-8 shadow-soft"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="help-modal-title" className="text-2xl font-semibold text-brand-foreground">
              Help & Shortcuts
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Navigate faster with keyboard shortcuts or jump to key areas of the workspace.
            </p>
          </div>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setResolvedOpen(false)}
          >
            Close
          </Button>
        </div>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">
            Shortcuts
          </h3>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.label} className="flex items-center justify-between rounded-2xl border border-border/40 bg-surface/80 px-4 py-3">
                <span className="text-sm text-brand-foreground">{item.label}</span>
                <span className="font-mono text-xs uppercase text-muted-foreground">{item.keys}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">
            Links
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/projects">Projects</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/donate">Donate</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
