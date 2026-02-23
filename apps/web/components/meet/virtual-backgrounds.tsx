'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Palette, Sparkles, X, Check, Upload, Trash2 } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

// Predefined background options
const PRESET_BACKGROUNDS = [
  {
    id: 'none',
    name: 'None',
    type: 'none' as const,
    preview: null,
  },
  {
    id: 'blur-light',
    name: 'Light Blur',
    type: 'blur-sm' as const,
    value: 'light',
    preview: '🌫️',
  },
  {
    id: 'blur-medium',
    name: 'Medium Blur',
    type: 'blur-sm' as const,
    value: 'medium',
    preview: '🌫️',
  },
  {
    id: 'blur-heavy',
    name: 'Heavy Blur',
    type: 'blur-sm' as const,
    value: 'heavy',
    preview: '🌫️',
  },
  {
    id: 'studio-dark',
    name: 'Studio Dark',
    type: 'image' as const,
    url: '/backgrounds/studio-dark.jpg',
    preview: '🎬',
  },
  {
    id: 'studio-light',
    name: 'Studio Light',
    type: 'image' as const,
    url: '/backgrounds/studio-light.jpg',
    preview: '🎙️',
  },
  {
    id: 'concert',
    name: 'Concert',
    type: 'image' as const,
    url: '/backgrounds/concert.jpg',
    preview: '♪',
  },
  {
    id: 'nature',
    name: 'Nature',
    type: 'image' as const,
    url: '/backgrounds/nature.jpg',
    preview: '🌿',
  },
  {
    id: 'office',
    name: 'Office',
    type: 'image' as const,
    url: '/backgrounds/office.jpg',
    preview: '🏢',
  },
  {
    id: 'abstract',
    name: 'Abstract',
    type: 'image' as const,
    url: '/backgrounds/abstract.jpg',
    preview: '🎨',
  },
  {
    id: 'space',
    name: 'Space',
    type: 'image' as const,
    url: '/backgrounds/space.jpg',
    preview: '🌌',
  },
  {
    id: 'gradient-purple',
    name: 'Purple Gradient',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: '◆',
  },
  {
    id: 'gradient-blue',
    name: 'Blue Gradient',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    preview: '◆',
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset',
    type: 'gradient' as const,
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: '🌅',
  },
];

interface VirtualBackgroundsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (background: BackgroundOption | null) => void;
  currentBackground?: string | null;
}

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'none' | 'blur-sm' | 'image' | 'gradient';
  url?: string;
  value?: string;
}

export function VirtualBackgrounds({
  isOpen,
  onClose,
  onSelect,
  currentBackground,
}: VirtualBackgroundsProps) {
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentBackground || 'none');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    (background: BackgroundOption) => {
      setSelectedId(background.id);
      onSelect(background.type === 'none' ? null : background);
    },
    [onSelect]
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      setIsUploading(true);

      try {
        // Convert to data URL for local preview
        const reader = new FileReader();
        reader.onload = () => {
          const newBackground: BackgroundOption = {
            id: `custom-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            type: 'image',
            url: reader.result as string,
          };
          setCustomBackgrounds((prev) => [...prev, newBackground]);
          handleSelect(newBackground);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Failed to upload background:', error);
        alert('Failed to upload background');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [handleSelect]
  );

  const handleDeleteCustom = useCallback(
    (id: string) => {
      setCustomBackgrounds((prev) => prev.filter((bg) => bg.id !== id));
      if (selectedId === id) {
        setSelectedId('none');
        onSelect(null);
      }
    },
    [selectedId, onSelect]
  );

  const allBackgrounds = [...PRESET_BACKGROUNDS, ...customBackgrounds];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-violet-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Virtual Backgrounds</h2>
                  <p className="text-sm text-white/50">Customize your video background</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(80vh-140px)] overflow-y-auto p-5">
              {/* Categories */}
              <div className="space-y-6">
                {/* Blur Options */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
                    <Palette className="h-4 w-4" />
                    Blur Effects
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {allBackgrounds
                      .filter((bg) => bg.type === 'none' || bg.type === 'blur-sm')
                      .map((background) => (
                        <BackgroundCard
                          key={background.id}
                          background={background as BackgroundOption}
                          isSelected={selectedId === background.id}
                          onSelect={handleSelect}
                        />
                      ))}
                  </div>
                </div>

                {/* Image Backgrounds */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
                    <ImageIcon className="h-4 w-4" />
                    Image Backgrounds
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {allBackgrounds
                      .filter((bg) => bg.type === 'image')
                      .map((background) => (
                        <BackgroundCard
                          key={background.id}
                          background={background as BackgroundOption}
                          isSelected={selectedId === background.id}
                          onSelect={handleSelect}
                          isCustom={background.id.startsWith('custom-')}
                          onDelete={
                            background.id.startsWith('custom-') ? handleDeleteCustom : undefined
                          }
                        />
                      ))}

                    {/* Upload Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 transition-colors hover:border-purple-400/50 disabled:opacity-50"
                    >
                      <Upload className="h-5 w-5 text-white/50" />
                      <span className="text-xs text-white/50">
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Gradient Backgrounds */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
                    <Palette className="h-4 w-4" />
                    Gradients
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {allBackgrounds
                      .filter((bg) => bg.type === 'gradient')
                      .map((background) => (
                        <BackgroundCard
                          key={background.id}
                          background={background as BackgroundOption}
                          isSelected={selectedId === background.id}
                          onSelect={handleSelect}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
              <button
                onClick={onClose}
                className="px-4 py-2 text-white/70 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-purple-500 px-5 py-2 font-medium text-white transition-colors hover:bg-purple-600"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BackgroundCardProps {
  background: BackgroundOption;
  isSelected: boolean;
  onSelect: (background: BackgroundOption) => void;
  isCustom?: boolean;
  onDelete?: (id: string) => void;
}

function BackgroundCard({
  background,
  isSelected,
  onSelect,
  isCustom,
  onDelete,
}: BackgroundCardProps) {
  const getPreviewStyle = () => {
    if (background.type === 'none') {
      return { backgroundColor: '#1a1a2e' };
    }
    if (background.type === 'blur-sm') {
      return {
        backgroundColor: '#1a1a2e',
        filter:
          background.value === 'light'
            ? 'blur(4px)'
            : background.value === 'medium'
              ? 'blur(8px)'
              : 'blur(16px)',
      };
    }
    if (background.type === 'gradient') {
      return { background: background.value };
    }
    if (background.type === 'image' && background.url) {
      return {
        backgroundImage: `url(${background.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  return (
    <div className="group relative">
      <button
        onClick={() => onSelect(background)}
        className={`relative aspect-video w-full overflow-hidden rounded-xl transition-all ${
          isSelected
            ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900'
            : 'hover:ring-1 hover:ring-white/30'
        }`}
      >
        {/* Preview */}
        <div className="absolute inset-0" style={getPreviewStyle()}>
          {(background.type === 'none' || background.type === 'blur-sm') && (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              {background.type === 'none' ? '×' : '~'}
            </div>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </button>

      {/* Name */}
      <p className="mt-1.5 truncate text-center text-xs text-white/60">{background.name}</p>

      {/* Delete button for custom backgrounds */}
      {isCustom && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(background.id);
          }}
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3 text-white" />
        </button>
      )}
    </div>
  );
}

export default VirtualBackgrounds;
