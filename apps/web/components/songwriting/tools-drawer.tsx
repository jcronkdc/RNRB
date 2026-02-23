'use client';

/**
 * Tools Drawer — Musician's Toolbox
 *
 * A side panel that slides in from the right edge of the editor.
 * Contains tools that serve the writing without competing with it.
 *
 * Tools available:
 * - Copyright & Splits (the Nashville differentiator)
 * - Save Version (with auto-generated context label)
 *
 * Future tools (from existing components, re-enabled when ready):
 * - Metronome
 * - Key Transposer
 * - Rhyming dictionary
 * - Chord reference
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  GitBranch,
  Wrench,
} from '@/components/ui/custom-icons';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import heavy components
const CopyrightManager = dynamic(
  () => import('./copyright-manager').then((m) => m.CopyrightManager),
  { ssr: false }
);

interface ToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  songId?: string;
  songTitle?: string;
  /** Collaborators for auto-populating splits */
  collaborators?: Array<{ userId: string; name: string; email: string }>;
  ownerName?: string;
  /** Callback when copyright info changes */
  onCopyrightUpdate?: (info: any) => void;
  /** Callback to save a version */
  onSaveVersion?: () => void;
}

type ToolTab = 'splits' | 'version';

export function ToolsDrawer({
  isOpen,
  onClose,
  songId,
  songTitle,
  collaborators,
  ownerName,
  onCopyrightUpdate,
  onSaveVersion,
}: ToolsDrawerProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>('splits');

  const tabs: { id: ToolTab; label: string; icon: typeof Shield }[] = [
    { id: 'splits', label: 'Splits', icon: Shield },
    { id: 'version', label: 'Versions', icon: GitBranch },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col"
            style={{
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div
              className="flex h-14 items-center justify-between px-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Tools
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {activeTab === 'splits' && songId && (
                <CopyrightManager
                  songId={songId}
                  songTitle={songTitle}
                  collaborators={collaborators}
                  ownerName={ownerName}
                  onUpdate={onCopyrightUpdate || (() => {})}
                />
              )}

              {activeTab === 'version' && (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Save a snapshot of your song as it is right now.
                  </p>
                  <button
                    onClick={onSaveVersion}
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-all"
                    style={{ background: 'var(--accent)' }}
                  >
                    <GitBranch className="h-4 w-4" />
                    Save Version
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
