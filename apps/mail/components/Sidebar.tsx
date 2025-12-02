'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  Send,
  FileText,
  Archive,
  Trash2,
  AlertCircle,
  Tag,
  Plus,
  Settings,
  LogOut,
  Mail,
  ChevronDown,
  Folder,
  Search,
  PenSquare,
} from 'lucide-react';
import { useAuthStore, useMailStore, useComposeStore } from '@/lib/store';
import clsx from 'clsx';

const FOLDER_ICONS: Record<string, typeof Inbox> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  archive: Archive,
  trash: Trash2,
  junk: AlertCircle,
};

export default function Sidebar() {
  const { email, logout } = useAuthStore();
  const { mailboxes, selectedMailboxId, selectMailbox } = useMailStore();
  const { openCompose } = useComposeStore();
  const [showFolders, setShowFolders] = useState(true);

  const systemFolders = mailboxes.filter((m) => m.role);
  const customFolders = mailboxes.filter((m) => !m.role);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-rnrb-border bg-rnrb-panel">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-rnrb-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rnrb-orange to-rnrb-gold">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h1 className="font-display font-bold text-white">RNRB Mail</h1>
          <p className="truncate text-xs text-rnrb-muted">{email}</p>
        </div>
      </div>

      {/* Compose Button */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openCompose()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rnrb-orange to-amber-500 py-3 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl hover:shadow-rnrb-orange/20"
        >
          <PenSquare className="h-5 w-5" />
          Compose
        </motion.button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rnrb-muted" />
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full rounded-lg border border-rnrb-border bg-rnrb-black py-2 pl-10 pr-4 text-sm text-white placeholder-rnrb-muted transition-colors focus:border-rnrb-orange focus:outline-none"
          />
        </div>
      </div>

      {/* Folders */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* System Folders */}
        <div className="space-y-1">
          {systemFolders.map((folder) => {
            const Icon = FOLDER_ICONS[folder.role || ''] || Folder;
            const isSelected = selectedMailboxId === folder.id;

            return (
              <button
                key={folder.id}
                onClick={() => selectMailbox(folder.id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  isSelected
                    ? 'bg-rnrb-orange/10 text-rnrb-orange'
                    : 'text-rnrb-text hover:bg-rnrb-border/50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 truncate font-medium">{folder.name}</span>
                {folder.unreadEmails > 0 && (
                  <span
                    className={clsx(
                      'min-w-[1.5rem] rounded-full px-2 py-0.5 text-center text-xs font-bold',
                      isSelected ? 'bg-rnrb-orange text-white' : 'bg-rnrb-border text-rnrb-text'
                    )}
                  >
                    {folder.unreadEmails}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Folders */}
        {customFolders.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowFolders(!showFolders)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-rnrb-muted hover:text-rnrb-text"
            >
              <ChevronDown
                className={clsx('h-4 w-4 transition-transform', !showFolders && '-rotate-90')}
              />
              Labels
            </button>
            {showFolders && (
              <div className="mt-1 space-y-1">
                {customFolders.map((folder) => {
                  const isSelected = selectedMailboxId === folder.id;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => selectMailbox(folder.id)}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                        isSelected
                          ? 'bg-rnrb-orange/10 text-rnrb-orange'
                          : 'text-rnrb-text hover:bg-rnrb-border/50'
                      )}
                    >
                      <Tag className="h-4 w-4" />
                      <span className="flex-1 truncate text-sm">{folder.name}</span>
                      {folder.unreadEmails > 0 && (
                        <span className="text-xs text-rnrb-muted">{folder.unreadEmails}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-rnrb-border p-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-rnrb-muted transition-colors hover:bg-rnrb-border/50 hover:text-rnrb-text">
          <Settings className="h-5 w-5" />
          <span className="text-sm">Settings</span>
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-rnrb-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
