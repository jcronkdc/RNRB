'use client';

import { motion } from 'framer-motion';
import { Share2, Sparkles } from 'lucide-react';

import { useShareMilestone, MilestoneType } from './share-milestone-modal';

interface ShareProgressButtonProps {
  type: MilestoneType;
  title: string;
  description?: string;
  // Related entities
  songId?: string;
  songTitle?: string;
  projectId?: string;
  projectName?: string;
  showId?: string;
  showName?: string;
  tourId?: string;
  tourName?: string;
  // Media
  audioUrl?: string;
  imageUrl?: string;
  // Stats
  stats?: Record<string, string | number>;
  // Styling
  variant?: 'default' | 'minimal' | 'celebration' | 'icon-only';
  className?: string;
}

export function ShareProgressButton({
  type,
  title,
  description,
  songId,
  songTitle,
  projectId,
  projectName,
  showId,
  showName,
  tourId,
  tourName,
  audioUrl,
  imageUrl,
  stats,
  variant = 'default',
  className = '',
}: ShareProgressButtonProps) {
  const { openShareModal } = useShareMilestone();

  const handleClick = () => {
    openShareModal({
      type,
      title,
      description,
      songId,
      songTitle,
      projectId,
      projectName,
      showId,
      showName,
      tourId,
      tourName,
      audioUrl,
      imageUrl,
      stats,
    });
  };

  if (variant === 'icon-only') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white ${className}`}
        title="Share progress"
      >
        <Share2 className="h-4 w-4" />
      </motion.button>
    );
  }

  if (variant === 'minimal') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white ${className}`}
      >
        <Share2 className="h-4 w-4" />
        Share
      </motion.button>
    );
  }

  if (variant === 'celebration') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-pink-700 hover:shadow-orange-500/30 ${className}`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.3),transparent_60%)]" />
        <span className="relative flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Share This Milestone! 🎉
        </span>
      </motion.button>
    );
  }

  // Default variant
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-orange-500/30 hover:bg-white/10 ${className}`}
    >
      <Share2 className="h-4 w-4" />
      Share Progress
    </motion.button>
  );
}

// Celebration prompt that appears after completing something
interface CelebrationPromptProps {
  type: MilestoneType;
  title: string;
  description?: string;
  onDismiss: () => void;
  songId?: string;
  projectId?: string;
  audioUrl?: string;
  imageUrl?: string;
  stats?: Record<string, string | number>;
}

export function CelebrationPrompt({
  type,
  title,
  description,
  onDismiss,
  songId,
  projectId,
  audioUrl,
  imageUrl,
  stats,
}: CelebrationPromptProps) {
  const { openShareModal } = useShareMilestone();

  const handleShare = () => {
    openShareModal({
      type,
      title,
      description,
      songId,
      projectId,
      audioUrl,
      imageUrl,
      stats,
    });
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-5 shadow-2xl">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <h3 className="font-semibold text-white">Congratulations!</h3>
          </div>
          <p className="mb-4 text-sm text-white/70">{title}</p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-pink-700"
            >
              <Share2 className="h-4 w-4" />
              Share the News!
            </motion.button>
            <button
              onClick={onDismiss}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
