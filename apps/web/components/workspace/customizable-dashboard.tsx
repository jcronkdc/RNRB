'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { useWorkspace } from './workspace-context';
import { WorkspaceTabs } from './workspace-tabs';
import { WorkspaceGrid } from './workspace-grid';
import { WorkspaceCreatorModal } from './workspace-creator-modal';
import { ToolCatalogModal } from './tool-catalog-modal';
import { AIWorkspaceChat } from './ai-workspace-chat';
import { WorkspaceCustomizer } from './workspace-customizer';
import { WorkshopWelcome, DailySpark } from '@/components/workshop';
import { InstallAppButton } from '@/components/install-app-button';
import {
  Loader2,
  ShoppingBag,
  Mail,
  Download,
  Briefcase,
  Palette,
  Image,
} from '@/components/ui/custom-icons';

/**
 * CustomizableDashboard
 *
 * The main dashboard with user-owned workspace customization.
 * Users can create workspaces, add/remove tools, and arrange them.
 */
export function CustomizableDashboard() {
  const { status } = useSession();
  const { activeWorkspace, isLoading, isEditMode, preferences } = useWorkspace();

  // Modal states
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="absolute inset-0 animate-ping rounded-full opacity-20"
              style={{ background: 'var(--accent)' }}
            />
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
          <p style={{ color: 'var(--muted)' }}>Opening your workshop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Subtle ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full blur-[150px]"
          style={{ background: 'var(--accent-glow)', opacity: 0.3 }}
        />
        <div
          className="absolute -right-64 top-1/3 h-[400px] w-[400px] rounded-full blur-[150px]"
          style={{ background: 'var(--gold-dim)', opacity: 0.2 }}
        />
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-7xl px-4 py-6">
        {/* Welcome Header */}
        {preferences?.showWelcome && <WorkshopWelcome className="mb-6" />}

        {/* Custom Workspace Header (if user has set a background) */}
        {activeWorkspace?.headerImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 h-32 overflow-hidden rounded-2xl"
          >
            <img
              src={activeWorkspace.headerImage}
              alt={`${activeWorkspace.name} header`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h2 className="text-2xl font-bold text-white">{activeWorkspace.name}</h2>
            </div>
          </motion.div>
        )}

        {/* Custom Background Gradient (if set and no image) */}
        {activeWorkspace?.backgroundColor && !activeWorkspace?.headerImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 flex h-24 items-center overflow-hidden rounded-2xl px-6"
            style={{ background: activeWorkspace.backgroundColor }}
          >
            <h2 className="text-xl font-bold text-white drop-shadow-lg">{activeWorkspace.name}</h2>
          </motion.div>
        )}

        {/* Workspace Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <WorkspaceTabs onCreateWorkspace={() => setIsCreatorOpen(true)} />
        </motion.section>

        {/* Edit Mode Banner */}
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-xl border-2 border-dashed p-4"
            style={{ borderColor: 'var(--accent)', background: 'var(--accent-glow)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--text)' }}>
                    Editing "{activeWorkspace?.name}"
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Drag tools to reorder • Click size buttons to resize • Add new tools below
                  </p>
                </div>
              </div>
              {/* Customize workspace button */}
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                <Image className="h-4 w-4" />
                Customize Look
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Workspace Tools (takes 2 columns) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div
              className="overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                  {activeWorkspace?.name || 'Your Toolbox'}
                </h2>
              </div>
              <div className="p-4">
                <WorkspaceGrid onOpenCatalog={() => setIsCatalogOpen(true)} />
              </div>
            </div>
          </motion.section>

          {/* Right Column: Daily Spark + Opportunities */}
          <div className="space-y-6">
            {/* Daily Spark */}
            {!isEditMode && <DailySpark />}

            {/* Opportunities */}
            {!isEditMode && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
                >
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                      <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                        Opportunities
                      </h2>
                    </div>
                    <Link
                      href="/opportunities"
                      className="text-sm font-medium hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Browse all →
                    </Link>
                  </div>
                  <div className="space-y-4 p-5 text-center">
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Gigs, collaborations, sync placements—they're out there waiting.
                    </p>
                    <Link href="/settings/profile">
                      <button
                        className="w-full rounded-xl px-6 py-3 font-semibold transition-all hover:scale-[1.02]"
                        style={{
                          background: 'var(--accent)',
                          color: 'var(--text)',
                        }}
                      >
                        Complete Your Profile
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.section>
            )}
          </div>
        </div>

        {/* Discover More Section - Subtle promotional links at bottom */}
        {!isEditMode && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6"
          >
            <div
              className="overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Explore More Features
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
                {/* Merch Link */}
                {activeWorkspace?.settings?.showMerchBanner !== false && (
                  <Link href="/my-merch">
                    <div
                      className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.01]"
                      style={{ background: 'var(--surface)' }}
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                        style={{ background: 'rgba(245, 158, 11, 0.15)' }}
                      >
                        <ShoppingBag className="h-5 w-5" style={{ color: '#f59e0b' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          Sell Merch
                        </div>
                        <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                          Keep 85% of profits
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Email Link */}
                {activeWorkspace?.settings?.showEmailBanner !== false && (
                  <Link href="/settings/email">
                    <div
                      className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.01]"
                      style={{ background: 'var(--surface)' }}
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                        style={{ background: 'rgba(56, 189, 248, 0.15)' }}
                      >
                        <Mail className="h-5 w-5" style={{ color: '#38bdf8' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          @rnrb.me Email
                        </div>
                        <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                          Professional email included
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Install App Link */}
                <div
                  className="group flex items-center gap-3 rounded-xl p-3 transition-all"
                  style={{ background: 'var(--surface)' }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Download className="h-5 w-5" style={{ color: '#22c55e' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Install App
                    </div>
                    <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                      Quick access & offline
                    </p>
                  </div>
                  <InstallAppButton variant="minimal" />
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Footer tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm italic" style={{ color: 'var(--muted)' }}>
            "The only way to do great work is to love what you do." — Keep creating.
          </p>
        </motion.div>
      </div>

      {/* Modals */}
      <WorkspaceCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onCreated={() => setIsCatalogOpen(true)}
      />

      {activeWorkspace && (
        <ToolCatalogModal
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
        />
      )}

      {/* Workspace Customizer Modal */}
      <WorkspaceCustomizer isOpen={isCustomizerOpen} onClose={() => setIsCustomizerOpen(false)} />

      {/* AI Workspace Builder Chat */}
      <AIWorkspaceChat />
    </div>
  );
}
