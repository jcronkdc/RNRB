'use client';

/**
 * WORKSPACE CUSTOMIZER
 *
 * Allows users to personalize their workspace with:
 * - Custom header images
 * - Background colors/gradients
 * - Accent colors
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkspace } from './workspace-context';
import { Image, Palette, X, Upload, Check, Trash2, Sparkles } from '@/components/ui/custom-icons';

// Preset gradient options
const PRESET_GRADIENTS = [
  { id: 'rose', value: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', label: 'Rose' },
  { id: 'violet', value: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', label: 'Violet' },
  { id: 'blue', value: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', label: 'Blue' },
  { id: 'emerald', value: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', label: 'Emerald' },
  { id: 'amber', value: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', label: 'Amber' },
  { id: 'slate', value: 'linear-gradient(135deg, #475569 0%, #334155 100%)', label: 'Slate' },
  { id: 'sunset', value: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)', label: 'Sunset' },
  { id: 'ocean', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', label: 'Ocean' },
];

// Preset accent colors
const PRESET_ACCENTS = [
  { id: 'default', value: '', label: 'Default' },
  { id: 'rose', value: '#f43f5e', label: 'Rose' },
  { id: 'violet', value: '#8b5cf6', label: 'Violet' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'emerald', value: '#10b981', label: 'Emerald' },
  { id: 'amber', value: '#f59e0b', label: 'Amber' },
  { id: 'cyan', value: '#06b6d4', label: 'Cyan' },
  { id: 'pink', value: '#ec4899', label: 'Pink' },
];

interface WorkspaceCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceCustomizer({ isOpen, onClose }: WorkspaceCustomizerProps) {
  const { activeWorkspace, updateWorkspaceImage, updateWorkspaceColors, updateWorkspace } =
    useWorkspace();
  const [activeTab, setActiveTab] = useState<'image' | 'colors'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle image upload (using base64 for now - could integrate with blob storage)
  const handleUploadImage = useCallback(async () => {
    if (!activeWorkspace || !previewImage) return;

    setIsUploading(true);
    try {
      // For now, we'll use the base64 directly
      // In production, this would upload to blob storage and return a URL
      await updateWorkspaceImage(activeWorkspace.id, previewImage);
      setPreviewImage(null);
      onClose();
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [activeWorkspace, previewImage, updateWorkspaceImage, onClose]);

  // Handle removing image
  const handleRemoveImage = useCallback(async () => {
    if (!activeWorkspace) return;
    await updateWorkspaceImage(activeWorkspace.id, null);
  }, [activeWorkspace, updateWorkspaceImage]);

  // Handle gradient selection
  const handleGradientSelect = useCallback(
    async (gradient: string) => {
      if (!activeWorkspace) return;
      await updateWorkspaceColors(activeWorkspace.id, { backgroundColor: gradient });
    },
    [activeWorkspace, updateWorkspaceColors]
  );

  // Handle accent color selection
  const handleAccentSelect = useCallback(
    async (color: string) => {
      if (!activeWorkspace) return;
      await updateWorkspaceColors(activeWorkspace.id, { accentColor: color || undefined });
    },
    [activeWorkspace, updateWorkspaceColors]
  );

  // Handle clearing background
  const handleClearBackground = useCallback(async () => {
    if (!activeWorkspace) return;
    await updateWorkspaceColors(activeWorkspace.id, { backgroundColor: undefined });
  }, [activeWorkspace, updateWorkspaceColors]);

  if (!isOpen || !activeWorkspace) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: 'var(--panel)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'var(--accent-glow)' }}
              >
                <Palette className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                  Customize "{activeWorkspace.name}"
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Make it yours
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              style={{ color: 'var(--muted)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 pt-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === 'image' ? 'border-b-2' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                borderColor: activeTab === 'image' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'image' ? 'var(--accent)' : 'var(--text)',
              }}
            >
              <Image className="h-4 w-4" />
              Header Image
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === 'colors' ? 'border-b-2' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                borderColor: activeTab === 'colors' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'colors' ? 'var(--accent)' : 'var(--text)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Colors
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'image' && (
              <div className="space-y-4">
                {/* Current/Preview Image */}
                <div
                  className="relative aspect-3/1 overflow-hidden rounded-xl"
                  style={{ background: 'var(--surface)' }}
                >
                  {previewImage || activeWorkspace.headerImage ? (
                    <>
                      <img
                        src={previewImage || activeWorkspace.headerImage}
                        alt="Workspace header"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={previewImage ? () => setPreviewImage(null) : handleRemoveImage}
                        className="absolute top-2 right-2 rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <Image className="h-8 w-8" style={{ color: 'var(--muted)' }} />
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        No header image
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: 'var(--surface)',
                      border: '2px dashed var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    {previewImage ? 'Choose Different' : 'Upload Image'}
                  </button>

                  {previewImage && (
                    <button
                      onClick={handleUploadImage}
                      disabled={isUploading}
                      className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ background: 'var(--accent)' }}
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  )}
                </div>

                <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
                  Recommended: 1200x400px, max 5MB
                </p>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-6">
                {/* Background Gradients */}
                <div>
                  <h3 className="mb-3 font-medium" style={{ color: 'var(--text)' }}>
                    Background Gradient
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Clear option */}
                    <button
                      onClick={handleClearBackground}
                      className={`flex aspect-square items-center justify-center rounded-xl border-2 transition-all hover:scale-105 ${
                        !activeWorkspace.backgroundColor ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--surface)',
                      }}
                    >
                      <X className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                    </button>

                    {PRESET_GRADIENTS.map((gradient) => (
                      <button
                        key={gradient.id}
                        onClick={() => handleGradientSelect(gradient.value)}
                        className={`aspect-square rounded-xl transition-all hover:scale-105 ${
                          activeWorkspace.backgroundColor === gradient.value
                            ? 'ring-2 ring-offset-2'
                            : ''
                        }`}
                        style={{
                          background: gradient.value,
                        }}
                        title={gradient.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Colors */}
                <div>
                  <h3 className="mb-3 font-medium" style={{ color: 'var(--text)' }}>
                    Accent Color
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_ACCENTS.map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => handleAccentSelect(accent.value)}
                        className={`h-10 w-10 rounded-xl transition-all hover:scale-110 ${
                          (activeWorkspace.accentColor || '') === accent.value
                            ? 'ring-2 ring-offset-2'
                            : ''
                        }`}
                        style={{
                          background: accent.value || 'var(--accent)',
                        }}
                        title={accent.label}
                      >
                        {accent.id === 'default' && (
                          <span className="text-[10px] font-bold text-white">DEF</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
