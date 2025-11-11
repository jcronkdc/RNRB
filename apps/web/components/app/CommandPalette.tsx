'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent
} from 'react';
import { cn } from '@songforge/ui';
import { useRouter } from 'next/navigation';

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
}

interface CommandPaletteProps {
  commands?: CommandItem[];
  register?: (api: { open: () => void }) => void;
}

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function CommandPalette({ commands = [], register }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // System-wide dialog/navigation commands
  const systemCommands: CommandItem[] = useMemo(
    () => [
      {
        id: 'cp-new-project',
        label: 'New Project',
        action: () => window.dispatchEvent(new CustomEvent('ui:new-project'))
      },
      {
        id: 'cp-new-song',
        label: 'New Song',
        action: () => window.dispatchEvent(new CustomEvent('ui:new-song'))
      },
      {
        id: 'cp-new-split',
        label: 'New Split',
        action: () => window.dispatchEvent(new CustomEvent('ui:new-split'))
      },
      {
        id: 'cp-open-assets',
        label: 'Open Assets',
        action: () => router.push('/app/assets')
      }
    ], [router]
  );

  // Append system+custom commands for UI
  const filtered = useMemo(() => {
    const allCommands = [...systemCommands, ...commands];
    const needle = query.trim().toLowerCase();
    if (!needle) return allCommands;
    return allCommands.filter((c) => c.label.toLowerCase().includes(needle));
  }, [commands, systemCommands, query]);

  // Registration (e.g., to programmatically open palette)
  useEffect(() => {
    if (register) register({ open: () => setOpen(true) });
  }, [register]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleEscapeAndTab = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === 'Tab') {
        const focusables = panelRef.current
          ? Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
              (el) => !el.hasAttribute('disabled')
            )
          : [];
        if (!focusables.length) return;
        const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
        let nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex < 0) nextIndex = focusables.length - 1;
        if (nextIndex >= focusables.length) nextIndex = 0;
        focusables[nextIndex].focus();
        event.preventDefault();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscapeAndTab);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscapeAndTab);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);
  useEffect(() => { setActiveIndex(0); }, [query]);

  const runCommand = useCallback((command: CommandItem) => {
    setOpen(false);
    setTimeout(() => command.action(), 0);
  }, []);
  const handleKeyNavigation = useCallback((event: ReactKeyboardEvent<HTMLInputElement | HTMLDivElement>) => {
    if (!filtered.length) { if (event.key === 'Enter') event.preventDefault(); return; }
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((prev) => (prev + 1) % filtered.length); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length); }
    if (event.key === 'Enter') { event.preventDefault(); runCommand(filtered[activeIndex]); }
  }, [filtered, activeIndex, runCommand]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/60 px-4 py-20 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
      <div ref={panelRef} className="w-full max-w-lg rounded-3xl border border-border/60 bg-surface/95 shadow-soft" onKeyDown={handleKeyNavigation} onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-border/50 px-5 py-4">
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search commands" className="h-11 w-full rounded-xl border border-border/60 bg-surface px-4 text-sm text-brand-foreground shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" aria-label="Search commands" />
        </div>
        <div className="max-h-80 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">No matching commands yet.</p>
          ) : (
            <ul role="listbox" aria-activedescendant={filtered[activeIndex]?.id ?? undefined} className="space-y-1">
              {filtered.map((command, index) => (
                <li key={command.id}>
                  <button type="button" id={command.id} onClick={() => runCommand(command)} onMouseEnter={() => setActiveIndex(index)} className={cn('flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary', index === activeIndex ? 'bg-brand-primary/15 text-brand-foreground shadow-soft' : 'text-muted-foreground hover:bg-brand-primary/10 hover:text-brand-foreground')} role="option" aria-selected={index === activeIndex}>
                    <span>{command.label}</span>
                    {command.hint ? (<span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{command.hint}</span>) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
