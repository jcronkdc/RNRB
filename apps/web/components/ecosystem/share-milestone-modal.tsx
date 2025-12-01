'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Music,
  Mic2,
  Target,
  Calendar,
  Award,
  Sparkles,
  Users,
  Globe,
  Lock,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Types of milestones that can be shared
export type MilestoneType =
  | 'song_started'
  | 'song_completed'
  | 'song_version'
  | 'project_started'
  | 'project_milestone'
  | 'project_completed'
  | 'collaboration_started'
  | 'practice_streak'
  | 'show_announced'
  | 'show_completed'
  | 'tour_announced'
  | 'gear_acquired'
  | 'recording_completed'
  | 'custom';

interface MilestoneData {
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
  // Stats (for display)
  stats?: Record<string, string | number>;
}

interface ShareMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: MilestoneData;
  onShared?: () => void;
}

const milestoneIcons: Record<MilestoneType, any> = {
  song_started: Music,
  song_completed: Award,
  song_version: Music,
  project_started: Sparkles,
  project_milestone: Target,
  project_completed: Award,
  collaboration_started: Users,
  practice_streak: Target,
  show_announced: Calendar,
  show_completed: Mic2,
  tour_announced: Globe,
  gear_acquired: Music,
  recording_completed: Mic2,
  custom: Share2,
};

const milestoneColors: Record<MilestoneType, string> = {
  song_started: 'from-pink-500 to-rose-600',
  song_completed: 'from-emerald-500 to-green-600',
  song_version: 'from-purple-500 to-violet-600',
  project_started: 'from-blue-500 to-indigo-600',
  project_milestone: 'from-orange-500 to-amber-600',
  project_completed: 'from-emerald-500 to-green-600',
  collaboration_started: 'from-cyan-500 to-blue-600',
  practice_streak: 'from-yellow-500 to-orange-600',
  show_announced: 'from-violet-500 to-purple-600',
  show_completed: 'from-pink-500 to-rose-600',
  tour_announced: 'from-indigo-500 to-blue-600',
  gear_acquired: 'from-gray-500 to-slate-600',
  recording_completed: 'from-red-500 to-rose-600',
  custom: 'from-orange-500 to-red-600',
};

const milestoneMessages: Record<MilestoneType, string> = {
  song_started: "I'm working on something new! 🎵",
  song_completed: 'Just finished a new song! 🎉',
  song_version: 'New version of a song ready! 🎧',
  project_started: 'Started a new project! 🚀',
  project_milestone: 'Hit a major milestone! 🎯',
  project_completed: 'Project complete! 🏆',
  collaboration_started: 'New collaboration started! 🤝',
  practice_streak: 'Keeping the streak alive! 🔥',
  show_announced: 'New show announced! 📅',
  show_completed: 'Just played an amazing show! 🎤',
  tour_announced: 'Tour dates announced! 🌎',
  gear_acquired: 'New gear day! 🎸',
  recording_completed: 'Fresh recording complete! 🎙️',
  custom: 'Sharing an update! ✨',
};

export function ShareMilestoneModal({
  isOpen,
  onClose,
  milestone,
  onShared,
}: ShareMilestoneModalProps) {
  const [message, setMessage] = useState(milestoneMessages[milestone.type] || '');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const Icon = milestoneIcons[milestone.type] || Share2;
  const colorGradient = milestoneColors[milestone.type] || 'from-orange-500 to-red-600';

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Create activity event
      const activityResponse = await fetch('/api/ecosystem/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: milestone.type,
          title: milestone.title,
          description: message,
          visibility,
          songId: milestone.songId,
          projectId: milestone.projectId,
          showId: milestone.showId,
          tourId: milestone.tourId,
          metadata: {
            ...milestone.stats,
            audioUrl: includeAudio ? milestone.audioUrl : null,
            imageUrl: milestone.imageUrl,
          },
        }),
      });

      if (!activityResponse.ok) {
        throw new Error('Failed to create activity');
      }

      // Also create a feed post for social visibility
      const postResponse = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `${message}\n\n${milestone.description || milestone.title}`,
          contentType: includeAudio && milestone.audioUrl ? 'audio' : 'text',
          audioUrl: includeAudio ? milestone.audioUrl : null,
          visibility: visibility === 'private' ? 'private' : 'public',
          tags: [milestone.type.replace('_', '')],
          metadata: {
            milestoneType: milestone.type,
            songId: milestone.songId,
            projectId: milestone.projectId,
          },
        }),
      });

      if (postResponse.ok) {
        onShared?.();
        onClose();
      }
    } catch (error) {
      console.error('Error sharing milestone:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colorGradient}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Share Your Progress</h2>
                  <p className="text-sm text-white/50">Let the world know!</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="border-b border-white/10 bg-white/[0.02] p-6">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`rounded-full bg-gradient-to-r ${colorGradient} px-3 py-1 text-xs font-medium text-white`}
                  >
                    {milestone.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{milestone.title}</h3>
                {milestone.description && (
                  <p className="mt-1 text-sm text-white/70">{milestone.description}</p>
                )}
                {milestone.stats && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {Object.entries(milestone.stats).map(([key, value]) => (
                      <span key={key} className="text-xs text-white/50">
                        <span className="font-medium text-white">{value}</span> {key}
                      </span>
                    ))}
                  </div>
                )}
                {milestone.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-lg">
                    <Image
                      src={milestone.imageUrl}
                      alt={milestone.title}
                      width={400}
                      height={200}
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-6">
              <label className="mb-2 block text-sm font-medium text-white/70">Add a message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something about this milestone..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                rows={3}
              />

              {/* Options */}
              <div className="mt-4 space-y-3">
                {/* Visibility */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Who can see this?</span>
                  <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                    {[
                      { value: 'public', icon: Globe, label: 'Everyone' },
                      { value: 'followers', icon: Users, label: 'Followers' },
                      { value: 'private', icon: Lock, label: 'Only me' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setVisibility(option.value as any)}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                          visibility === option.value
                            ? 'bg-white/15 text-white'
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <option.icon className="h-3.5 w-3.5" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include Audio */}
                {milestone.audioUrl && (
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 transition-all hover:bg-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <Music className="h-5 w-5 text-white/50" />
                      <span className="text-sm text-white/70">Include audio preview</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeAudio}
                      onChange={(e) => setIncludeAudio(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing || !message.trim()}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Hook to easily trigger the share modal from anywhere
import { create } from 'zustand';

interface ShareMilestoneStore {
  isOpen: boolean;
  milestone: MilestoneData | null;
  openShareModal: (milestone: MilestoneData) => void;
  closeShareModal: () => void;
}

export const useShareMilestone = create<ShareMilestoneStore>((set) => ({
  isOpen: false,
  milestone: null,
  openShareModal: (milestone) => set({ isOpen: true, milestone }),
  closeShareModal: () => set({ isOpen: false, milestone: null }),
}));

// Provider component to add to app layout
export function ShareMilestoneProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, milestone, closeShareModal } = useShareMilestone();

  return (
    <>
      {children}
      {milestone && (
        <ShareMilestoneModal isOpen={isOpen} onClose={closeShareModal} milestone={milestone} />
      )}
    </>
  );
}
