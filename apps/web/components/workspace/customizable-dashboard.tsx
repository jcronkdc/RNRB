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

        {/* Promotional Banners (hidden in edit mode and controllable per workspace) */}
        {!isEditMode && (
          <>
            {/* Merch Store Banner - controllable via workspace settings */}
            {activeWorkspace?.settings?.showMerchBanner !== false && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6"
              >
                <Link href="/my-merch">
                  <div
                    className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                      borderColor: 'rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                        >
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                              Sell Your Own Merch
                            </h3>
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-bold"
                              style={{ background: 'var(--gold)', color: '#000' }}
                            >
                              FREE
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Design custom T-shirts, hoodies & more. Keep 85% of profits.
                          </p>
                        </div>
                      </div>
                      <span
                        className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#000',
                        }}
                      >
                        Start Selling →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.section>
            )}

            {/* Email Banner - controllable via workspace settings */}
            {activeWorkspace?.settings?.showEmailBanner !== false && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mb-6"
              >
                <Link href="/settings/email">
                  <div
                    className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                      borderColor: 'rgba(56, 189, 248, 0.2)',
                    }}
                  >
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                          style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
                        >
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                              Get Your @rnrb.me Email
                            </h3>
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-bold"
                              style={{ background: '#38bdf8', color: '#000' }}
                            >
                              INCLUDED
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Professional email for musicians. yourname@rnrb.me
                          </p>
                        </div>
                      </div>
                      <span
                        className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                          color: '#000',
                        }}
                      >
                        Get Email →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.section>
            )}
          </>
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

        {/* Install App Card (hidden in edit mode) */}
        {!isEditMode && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <div
              className="overflow-hidden rounded-2xl border"
              style={{
                borderColor: 'rgba(34, 197, 94, 0.3)',
                background:
                  'linear-gradient(135deg, var(--panel) 0%, rgba(34, 197, 94, 0.05) 100%)',
              }}
            >
              <div className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Download className="h-6 w-6" style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                      Install Rock N' Roll Basement
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Get the app for quick access & offline use
                    </p>
                  </div>
                </div>
                <InstallAppButton variant="prominent" />
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
