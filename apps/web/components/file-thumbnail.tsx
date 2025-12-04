'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Music,
  FileText,
  Image as ImageIcon,
  File,
  FileAudio,
  Disc,
  Mic2,
  Radio,
  ScrollText,
  Piano,
  Folder,
  Play,
} from '@/components/ui/custom-icons';

import type { LibraryFileType } from '@/hooks/use-library';

interface FileThumbnailProps {
  url: string;
  name: string;
  type: LibraryFileType;
  mimeType: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPlayOverlay?: boolean;
  onClick?: () => void;
}

// File type icons mapping
const FILE_TYPE_ICONS: Record<LibraryFileType, React.ComponentType<{ className?: string }>> = {
  stem: Disc,
  demo: Music,
  sample: Mic2,
  loop: Radio,
  lyrics: ScrollText,
  chords: FileText,
  sheet_music: Piano,
  midi: FileAudio,
  image: ImageIcon,
  document: FileText,
  project: Folder,
  other: File,
};

// File type colors
const FILE_TYPE_COLORS: Record<LibraryFileType, string> = {
  stem: 'from-orange-500/20 to-red-500/20 text-orange-500',
  demo: 'from-blue-500/20 to-cyan-500/20 text-blue-500',
  sample: 'from-green-500/20 to-emerald-500/20 text-green-500',
  loop: 'from-purple-500/20 to-pink-500/20 text-purple-500',
  lyrics: 'from-violet-500/20 to-purple-500/20 text-violet-500',
  chords: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
  sheet_music: 'from-amber-500/20 to-yellow-500/20 text-amber-500',
  midi: 'from-cyan-500/20 to-teal-500/20 text-cyan-500',
  image: 'from-pink-500/20 to-rose-500/20 text-pink-500',
  document: 'from-emerald-500/20 to-green-500/20 text-emerald-500',
  project: 'from-gray-500/20 to-slate-500/20 text-gray-400',
  other: 'from-gray-500/20 to-slate-500/20 text-gray-400',
};

const SIZE_CLASSES = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const ICON_SIZE_CLASSES = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function FileThumbnail({
  url,
  name,
  type,
  mimeType,
  size = 'md',
  className = '',
  showPlayOverlay = false,
  onClick,
}: FileThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  const isImage = mimeType.startsWith('image/');
  const isAudio = mimeType.startsWith('audio/');

  const Icon = FILE_TYPE_ICONS[type] || File;
  const colorClass = FILE_TYPE_COLORS[type] || FILE_TYPE_COLORS.other;

  // Show actual image thumbnail for images
  if (isImage && !imageError) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl ${SIZE_CLASSES[size]} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <Image
          src={url}
          alt={name}
          fill
          className="object-cover transition-transform hover:scale-110"
          onError={() => setImageError(true)}
          sizes={size === 'sm' ? '40px' : size === 'md' ? '64px' : '96px'}
        />
      </div>
    );
  }

  // Show icon with gradient background for other types
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${colorClass} ${SIZE_CLASSES[size]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Icon className={ICON_SIZE_CLASSES[size]} />

      {/* Play overlay for audio files */}
      {showPlayOverlay && isAudio && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Play className="h-4 w-4 text-white" fill="white" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate a placeholder thumbnail data URL based on file type
 */
export function getPlaceholderThumbnail(type: LibraryFileType): string {
  // SVG placeholder with icon silhouette
  const colors: Record<LibraryFileType, { bg: string; icon: string }> = {
    stem: { bg: '#f97316', icon: '#fff' },
    demo: { bg: '#3b82f6', icon: '#fff' },
    sample: { bg: '#22c55e', icon: '#fff' },
    loop: { bg: '#a855f7', icon: '#fff' },
    lyrics: { bg: '#8b5cf6', icon: '#fff' },
    chords: { bg: '#6366f1', icon: '#fff' },
    sheet_music: { bg: '#f59e0b', icon: '#fff' },
    midi: { bg: '#06b6d4', icon: '#fff' },
    image: { bg: '#ec4899', icon: '#fff' },
    document: { bg: '#10b981', icon: '#fff' },
    project: { bg: '#6b7280', icon: '#fff' },
    other: { bg: '#6b7280', icon: '#fff' },
  };

  const { bg } = colors[type] || colors.other;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="${bg}" rx="8"/>
      <circle cx="32" cy="32" r="16" fill="rgba(255,255,255,0.2)"/>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
