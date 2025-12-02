'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Inbox,
  Send,
  FileText,
  Archive,
  Trash2,
  AlertCircle,
  Tag,
  Settings,
  LogOut,
  PenSquare,
  Sun,
  Moon,
  ChevronDown,
  Folder,
  Star,
} from 'lucide-react';
import { useAuthStore, useMailStore, useComposeStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import clsx from 'clsx';

const FOLDER_ICONS: Record<string, typeof Inbox> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  archive: Archive,
  trash: Trash2,
  junk: AlertCircle,
  flagged: Star,
};

export default function Sidebar() {
  const { email, logout } = useAuthStore();
  const { mailboxes, selectedMailboxId, selectMailbox } = useMailStore();
  const { openCompose } = useComposeStore();
  const { resolvedTheme, setTheme } = useThemeStore();
  const [showLabels, setShowLabels] = useState(true);

  const systemFolders = mailboxes.filter((m) => m.role);
  const customFolders = mailboxes.filter((m) => !m.role);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside
      className="transition-theme flex h-full w-56 flex-col border-r"
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <a href="https://rnrb.pro" target="_blank" rel="noopener noreferrer">
          <Image
            src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-dark.png'}
            alt="RNRB"
            width={80}
            height={28}
            className="opacity-90 transition-opacity hover:opacity-100"
          />
        </a>
        <button
          onClick={toggleTheme}
          className="rounded-md p-1.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Compose Button - ProtonMail style */}
      <div className="p-3">
        <button
          onClick={() => openCompose()}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <PenSquare className="h-4 w-4" />
          New message
        </button>
      </div>

      {/* Folders */}
      <nav className="flex-1 overflow-y-auto px-2">
        <div className="space-y-0.5">
          {systemFolders.map((folder) => {
            const Icon = FOLDER_ICONS[folder.role || ''] || Folder;
            const isSelected = selectedMailboxId === folder.id;

            return (
              <button
                key={folder.id}
                onClick={() => selectMailbox(folder.id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  isSelected && 'font-medium'
                )}
                style={{
                  background: isSelected ? 'var(--accent-light)' : 'transparent',
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{folder.name}</span>
                {folder.unreadEmails > 0 && (
                  <span
                    className="min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-medium"
                    style={{
                      background: isSelected ? 'var(--accent)' : 'var(--border)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {folder.unreadEmails}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Labels */}
        {customFolders.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronDown
                className={clsx('h-3 w-3 transition-transform', !showLabels && '-rotate-90')}
              />
              Labels
            </button>
            {showLabels && (
              <div className="mt-1 space-y-0.5">
                {customFolders.map((folder) => {
                  const isSelected = selectedMailboxId === folder.id;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => selectMailbox(folder.id)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm transition-colors"
                      style={{
                        background: isSelected ? 'var(--accent-light)' : 'transparent',
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      <Tag className="h-3.5 w-3.5" />
                      <span className="flex-1 truncate">{folder.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
        {/* User info */}
        <div className="mb-2 rounded-md px-3 py-2" style={{ background: 'var(--bg-secondary)' }}>
          <p className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
            {email?.split('@')[0]}
          </p>
          <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
            @{email?.split('@')[1]}
          </p>
        </div>

        <div className="flex gap-1">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors"
            style={{ color: 'var(--text-muted)', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--panel-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
          <button
            onClick={logout}
            className="flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors"
            style={{ color: 'var(--text-muted)', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--panel-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
