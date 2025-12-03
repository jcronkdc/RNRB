'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from './workspace-context';
import {
  X,
  Home,
  Music4,
  Users,
  Calendar,
  Briefcase,
  Radio,
  Mic2,
  LayoutDashboard,
  MapPin,
  BookOpen,
  Sparkles,
  Guitar,
  Target,
  type IconProps,
} from '@/components/ui/custom-icons';

// Available icons for workspace customization
const AVAILABLE_ICONS: { key: string; icon: React.ComponentType<IconProps>; label: string }[] = [
  { key: 'layout', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'music', icon: Music4, label: 'Music' },
  { key: 'studio', icon: Mic2, label: 'Studio' },
  { key: 'collab', icon: Users, label: 'Collaboration' },
  { key: 'calendar', icon: Calendar, label: 'Calendar' },
  { key: 'business', icon: Briefcase, label: 'Business' },
  { key: 'live', icon: Radio, label: 'Live' },
  { key: 'tour', icon: MapPin, label: 'Tour' },
  { key: 'learn', icon: BookOpen, label: 'Learning' },
  { key: 'tools', icon: Guitar, label: 'Tools' },
  { key: 'focus', icon: Target, label: 'Focus' },
  { key: 'home', icon: Home, label: 'Home' },
];

// Preset workspace templates
const WORKSPACE_PRESETS = [
  {
    name: 'Songwriting',
    icon: 'music',
    description: 'Focus on writing and creating music',
  },
  {
    name: 'Recording Studio',
    icon: 'studio',
    description: 'For recording and production sessions',
  },
  {
    name: 'Collaboration Hub',
    icon: 'collab',
    description: 'Work with other musicians',
  },
  {
    name: 'Tour Command',
    icon: 'tour',
    description: 'Manage shows and touring',
  },
  {
    name: 'Business Central',
    icon: 'business',
    description: 'Career and monetization',
  },
  {
    name: 'Live Performance',
    icon: 'live',
    description: 'Streaming and live shows',
  },
];

interface WorkspaceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (workspaceId: string) => void;
}

export function WorkspaceCreatorModal({ isOpen, onClose, onCreated }: WorkspaceCreatorModalProps) {
  const { createWorkspace } = useWorkspace();
  const [step, setStep] = useState<'choose' | 'custom'>('choose');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('layout');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const workspace = await createWorkspace(name.trim(), selectedIcon);
      onCreated?.(workspace.id);
      handleClose();
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePresetSelect = async (preset: (typeof WORKSPACE_PRESETS)[0]) => {
    setIsCreating(true);
    try {
      const workspace = await createWorkspace(preset.name, preset.icon);
      onCreated?.(workspace.id);
      handleClose();
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep('choose');
    setName('');
    setSelectedIcon('layout');
    onClose();
  };

  const handleStartCustom = () => {
    setStep('custom');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl"
          style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {step === 'choose' ? 'Create Workspace' : 'Name Your Workspace'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {step === 'choose'
                  ? 'Choose a template or create your own'
                  : 'Give it a name and pick an icon'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 transition-colors hover:bg-[var(--panel-hover)]"
            >
              <X className="h-5 w-5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 'choose' ? (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Preset Templates */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Quick Start Templates
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {WORKSPACE_PRESETS.map((preset) => {
                        const IconComponent =
                          AVAILABLE_ICONS.find((i) => i.key === preset.icon)?.icon ||
                          LayoutDashboard;
                        return (
                          <motion.button
                            key={preset.name}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePresetSelect(preset)}
                            disabled={isCreating}
                            className="group flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-[var(--accent)]"
                            style={{
                              background: 'var(--surface)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <div
                              className="rounded-lg p-2 transition-transform group-hover:scale-110"
                              style={{ background: 'var(--panel)' }}
                            >
                              <IconComponent
                                className="h-5 w-5"
                                style={{ color: 'var(--accent)' }}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                                {preset.name}
                              </h4>
                              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                {preset.description}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
                    </div>
                    <div className="relative flex justify-center">
                      <span
                        className="px-3 text-sm"
                        style={{ background: 'var(--panel)', color: 'var(--muted)' }}
                      >
                        or
                      </span>
                    </div>
                  </div>

                  {/* Custom Workspace Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleStartCustom}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      Create Custom Workspace
                    </span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Name Input */}
                  <div className="mb-6">
                    <label
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., My Writing Room"
                      autoFocus
                      className="w-full rounded-xl border px-4 py-3 outline-none transition-colors focus:border-[var(--accent)]"
                      style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && name.trim()) {
                          handleCreate();
                        }
                      }}
                    />
                    <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                      Tip: Name it after what you'll use it for
                    </p>
                  </div>

                  {/* Icon Selection */}
                  <div className="mb-6">
                    <label
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      Choose an Icon
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVAILABLE_ICONS.map(({ key, icon: IconComponent, label }) => (
                        <button
                          key={key}
                          onClick={() => setSelectedIcon(key)}
                          title={label}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                            selectedIcon === key
                              ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                              : 'border-transparent hover:bg-[var(--panel-hover)]'
                          }`}
                        >
                          <IconComponent
                            className="h-5 w-5"
                            style={{
                              color: selectedIcon === key ? 'var(--accent)' : 'var(--muted)',
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('choose')}
                      className="flex-1 rounded-xl border px-4 py-3 font-medium transition-colors hover:bg-[var(--panel-hover)]"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!name.trim() || isCreating}
                      className="flex-1 rounded-xl px-4 py-3 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                      }}
                    >
                      {isCreating ? 'Creating...' : 'Create Workspace'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
