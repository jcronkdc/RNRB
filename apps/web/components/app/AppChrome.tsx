'use client';

import { Button } from '@cronkwater/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { AppErrorBoundary } from './AppErrorBoundary';
import CommandPalette from './CommandPalette';
import HelpModal from './HelpModal';
import { OnboardingTour } from './OnboardingTour';
import SearchInput from './SearchInput';
import Sidebar, { APP_NAV_ITEMS } from './Sidebar';
import { usePlatformKey } from './usePlatformKey';
import { ToastProvider } from '../ui/Toast';

interface AppChromeProps {
  title: string;
  userName?: string | null;
  userEmail?: string | null;
  children: ReactNode;
}

const findNewProjectButton = () => {
  return (
    document.querySelector<HTMLButtonElement>('button[data-command="new-project"]') ??
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
      (btn) => btn.textContent?.trim().toLowerCase() === 'new project'
    ) ??
    null
  );
};

export default function AppChrome({ title, userName, userEmail, children }: AppChromeProps) {
  const router = useRouter();
  const platformKey = usePlatformKey();
  const [helpOpen, setHelpOpen] = useState(false);
  const [keySequence, setKeySequence] = useState<string>('');

  useEffect(() => {
    if (!keySequence) return;
    const timeout = setTimeout(() => setKeySequence(''), 600);
    return () => clearTimeout(timeout);
  }, [keySequence]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        const searchInput = document.querySelector<HTMLInputElement>('[data-search="true"]');
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
          return;
        }
      }

      if (event.key.toLowerCase() === 'g') {
        setKeySequence('g');
        return;
      }

      if (keySequence === 'g' && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setKeySequence('');
        router.push('/app/projects');
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [keySequence, router]);

  const focusNewProject = useCallback(() => {
    const button = findNewProjectButton();
    if (button) {
      button.focus();
      button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    router.push('/app/projects');
  }, [router]);

  const commands = useMemo(
    () => [
      {
        id: 'command-new-project',
        label: 'New Project',
        hint: 'Focus button',
        action: focusNewProject
      },
      {
        id: 'command-go-projects',
        label: 'Go to Projects',
        action: () => router.push('/app/projects')
      },
      {
        id: 'command-go-home',
        label: 'Go to Home',
        action: () => router.push('/')
      }
    ],
    [focusNewProject, router]
  );

  return (
    <ToastProvider>
      <OnboardingTour />
      <div className="min-h-screen bg-background text-brand-foreground">
        <CommandPalette commands={commands} />
        <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
        <div className="flex flex-col md:flex-row">
          <Sidebar userName={userName} userEmail={userEmail} data-tour="sidebar" />

          <div className="flex min-h-screen flex-1 flex-col">
            <nav className="shadow-soft/30 sticky top-0 z-30 flex items-center gap-4 border-b border-border/60 bg-surface/80 px-4 py-3 backdrop-blur md:hidden">
              <Link
                href="/app/projects"
                className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground"
              >
                CronkWater
              </Link>
              <div className="flex flex-1 items-center gap-2 overflow-x-auto text-xs font-medium">
                {APP_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3 py-1 text-muted-foreground transition hover:text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            <header className="shadow-soft/20 relative border-b border-border/60 bg-gradient-to-br from-surface/90 to-surface-muted/50 px-6 py-8 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-30">
                <div className="sf-bg-gradient" />
              </div>
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="xs:flex-row xs:items-center xs:gap-6 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-primary">Workspace</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-foreground">{title}</h1>
                    <p className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      Quick actions
                      <kbd className="rounded-lg border-2 border-border/60 bg-surface px-2.5 py-1 font-bold text-brand-foreground shadow-soft">
                        {platformKey}K
                      </kbd>
                    </p>
                  </div>
                  <div className="xs:self-center min-w-0 max-w-[13rem] flex-1 self-start" data-tour="search">
                    <SearchInput placeholder="Search…" />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hidden md:inline-flex"
                    onClick={() => setHelpOpen(true)}
                  >
                    Help
                  </Button>
                  <span className="hidden md:inline">Signed in as</span>
                  <span className="rounded-full border border-border/60 px-3 py-1 text-brand-foreground">
                    {userName ?? 'CronkWater Member'}
                  </span>
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Share
                  </Button>
                  <Button size="sm" className="hidden md:inline-flex">
                    New project
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 px-6 py-10 sm:px-10">
              <AppErrorBoundary>
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">{children}</div>
              </AppErrorBoundary>
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
