'use client';

import {
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
  Crop,
  Sun,
  Contrast,
  Palette,
  Maximize,
  Check,
  RefreshCw,
  Zap,
  Eye,
  SlidersHorizontal,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface AIImageEnhancerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (enhancedUrl: string) => void;
}

type EnhancementType =
  | 'auto'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'sharpen'
  | 'blur_bg'
  | 'crop_smart';

interface Enhancement {
  id: EnhancementType;
  name: string;
  description: string;
  icon: React.ElementType;
  premium?: boolean;
}

const ENHANCEMENTS: Enhancement[] = [
  {
    id: 'auto',
    name: 'AI Auto-Enhance',
    description: 'Let AI optimize everything',
    icon: Sparkles,
  },
  { id: 'brightness', name: 'Fix Lighting', description: 'Brighten or darken image', icon: Sun },
  { id: 'contrast', name: 'Enhance Contrast', description: 'Make colors pop', icon: Contrast },
  { id: 'saturation', name: 'Color Boost', description: 'Enhance or mute colors', icon: Palette },
  { id: 'sharpen', name: 'Sharpen', description: 'Increase clarity', icon: Maximize },
  {
    id: 'blur_bg',
    name: 'Blur Background',
    description: 'Focus on the subject',
    icon: Eye,
    premium: true,
  },
  {
    id: 'crop_smart',
    name: 'Smart Crop',
    description: 'AI-powered cropping',
    icon: Crop,
    premium: true,
  },
];

const CROP_PRESETS = [
  { id: '1:1', label: 'Square', ratio: 1 },
  { id: '16:9', label: 'Landscape', ratio: 16 / 9 },
  { id: '9:16', label: 'Portrait', ratio: 9 / 16 },
  { id: '4:3', label: 'Standard', ratio: 4 / 3 },
  { id: '3:2', label: 'Photo', ratio: 3 / 2 },
  { id: 'hero', label: 'Hero Banner', ratio: 21 / 9 },
];

export function AIImageEnhancer({ isOpen, onClose, imageUrl, onSave }: AIImageEnhancerProps) {
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 0,
  });
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleEnhance = async (type: EnhancementType) => {
    setIsProcessing(true);
    setSelectedEnhancement(type);

    try {
      // For demo, we'll simulate the enhancement
      // In production, this would call an AI image processing API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate AI suggestions
      const newSuggestions: string[] = [];
      if (type === 'auto') {
        newSuggestions.push(
          'Increased brightness by 15% for better visibility',
          'Enhanced contrast to make colors pop',
          'Applied subtle sharpening for clarity'
        );
        setAdjustments({
          brightness: 115,
          contrast: 110,
          saturation: 105,
          sharpness: 15,
        });
      }
      setSuggestions(newSuggestions);

      // In production, this would be the actual enhanced image URL
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error('Enhancement error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdjustmentChange = (key: keyof typeof adjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpness: 0,
    });
    setPreviewUrl(null);
    setSelectedEnhancement(null);
    setSuggestions([]);
  };

  const handleSave = () => {
    // In production, this would save the enhanced image
    onSave(previewUrl || imageUrl);
    onClose();
  };

  // Calculate CSS filter string from adjustments
  const filterStyle = {
    filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="presentation"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="flex h-[85vh] w-full max-w-6xl overflow-hidden rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {/* Left Panel - Image Preview */}
        <div className="flex flex-1 flex-col" style={{ background: 'var(--bg)' }}>
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-pink-500">
                <ImageIcon size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: 'var(--text)' }}>
                  AI Image Enhancer
                </h2>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Optimize your images with AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              style={{ color: 'var(--muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Image Preview Area */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
            {isProcessing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50">
                <Loader2 size={48} className="mb-4 animate-spin text-orange-500" />
                <p style={{ color: 'var(--text)' }}>Enhancing your image...</p>
              </div>
            )}

            <div className="relative max-h-full max-w-full overflow-hidden rounded-xl shadow-2xl">
              {/* Before/After comparison would go here */}
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-[60vh] max-w-full object-contain"
                style={filterStyle}
              />

              {/* Crop overlay would go here */}
              {selectedCrop && (
                <div className="absolute inset-0 border-2 border-dashed border-orange-500 bg-black/20" />
              )}
            </div>
          </div>

          {/* Adjustment Sliders */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Manual Adjustments
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { key: 'brightness' as const, label: 'Brightness', icon: Sun, min: 50, max: 150 },
                { key: 'contrast' as const, label: 'Contrast', icon: Contrast, min: 50, max: 150 },
                {
                  key: 'saturation' as const,
                  label: 'Saturation',
                  icon: Palette,
                  min: 0,
                  max: 200,
                },
                { key: 'sharpness' as const, label: 'Sharpness', icon: Maximize, min: 0, max: 100 },
              ].map((adj) => (
                <div key={adj.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor={`adj-${adj.key}`}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--muted)' }}
                    >
                      <adj.icon size={12} />
                      {adj.label}
                    </label>
                    <span className="text-xs" style={{ color: 'var(--text)' }}>
                      {adjustments[adj.key]}%
                    </span>
                  </div>
                  <input
                    id={`adj-${adj.key}`}
                    type="range"
                    min={adj.min}
                    max={adj.max}
                    value={adjustments[adj.key]}
                    onChange={(e) => handleAdjustmentChange(adj.key, parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Enhancements */}
        <div
          className="w-80 shrink-0 overflow-y-auto"
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          {/* AI Enhancements */}
          <div className="p-4">
            <h3
              className="mb-4 flex items-center gap-2 font-semibold"
              style={{ color: 'var(--text)' }}
            >
              <Sparkles size={16} className="text-orange-500" />
              AI Enhancements
            </h3>
            <div className="space-y-2">
              {ENHANCEMENTS.map((enhancement) => (
                <button
                  key={enhancement.id}
                  onClick={() => handleEnhance(enhancement.id)}
                  disabled={isProcessing}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                    selectedEnhancement === enhancement.id
                      ? 'ring-2 ring-orange-500'
                      : 'hover:bg-white/5'
                  }`}
                  style={{
                    background:
                      selectedEnhancement === enhancement.id ? 'rgba(249,115,22,0.2)' : 'var(--bg)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: 'var(--panel)' }}
                  >
                    <enhancement.icon size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        {enhancement.name}
                      </span>
                      {enhancement.premium && (
                        <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-xs text-orange-400">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                      {enhancement.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Crop Presets */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <h3
              className="mb-4 flex items-center gap-2 font-semibold"
              style={{ color: 'var(--text)' }}
            >
              <Crop size={16} className="text-orange-500" />
              Crop Presets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {CROP_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedCrop(selectedCrop === preset.id ? null : preset.id)}
                  className={`rounded-lg p-2 text-center transition-all ${
                    selectedCrop === preset.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                  style={{
                    background: selectedCrop === preset.id ? 'rgba(249,115,22,0.2)' : 'var(--bg)',
                  }}
                >
                  <div
                    className="mx-auto mb-1 rounded"
                    style={{
                      width: preset.ratio > 1 ? '40px' : `${40 * preset.ratio}px`,
                      height: preset.ratio > 1 ? `${40 / preset.ratio}px` : '40px',
                      background: 'var(--panel)',
                      border: '2px solid var(--border)',
                    }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text)' }}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <h3
                className="mb-4 flex items-center gap-2 font-semibold"
                style={{ color: 'var(--text)' }}
              >
                <Zap size={16} className="text-orange-500" />
                AI Applied
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg p-2"
                    style={{ background: 'var(--bg)' }}
                  >
                    <Check size={14} className="mt-0.5 shrink-0 text-green-500" />
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            className="sticky bottom-0 p-4"
            style={{ background: 'var(--panel)', borderTop: '1px solid var(--border)' }}
          >
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-colors hover:bg-white/10"
                style={{ background: 'var(--bg)', color: 'var(--text)' }}
              >
                <RefreshCw size={16} />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                }}
              >
                <Check size={16} />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
