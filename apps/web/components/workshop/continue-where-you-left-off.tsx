'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Music, Clock, ChevronRight } from 'lucide-react';

interface LastActivity {
  type: 'song' | 'project' | 'collaboration' | 'practice';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  lastEditedAt: Date;
  progress?: number;
  collaborators?: number;
}

interface ContinueWhereYouLeftOffProps {
  className?: string;
}

/**
 * Continue Where You Left Off
 *
 * Shows the musician their most recent work so they can dive right back in
 * Creates continuity - "we remember what you were working on"
 */
export function ContinueWhereYouLeftOff({ className = '' }: ContinueWhereYouLeftOffProps) {
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastActivity = async () => {
      try {
        const res = await fetch('/api/ecosystem/last-activity');
        if (res.ok) {
          const data = await res.json();
          if (data.activity) {
            setLastActivity(data.activity);
          }
        }
      } catch (error) {
        console.error('Failed to fetch last activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastActivity();
  }, []);

  if (loading) {
    return (
      <div
        className={`animate-pulse rounded-2xl border p-5 ${className}`}
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        <div className="mb-3 h-4 w-32 rounded" style={{ background: 'var(--border)' }} />
        <div className="mb-2 h-6 w-48 rounded" style={{ background: 'var(--border)' }} />
        <div className="h-4 w-64 rounded" style={{ background: 'var(--border)' }} />
      </div>
    );
  }

  if (!lastActivity) {
    return null; // Don't show if there's nothing to continue
  }

  const timeAgo = getTimeAgo(lastActivity.lastEditedAt);
  const encouragement = getEncouragement(lastActivity.type, lastActivity.progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Link href={lastActivity.href}>
        <div
          className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:border-[var(--accent)]"
          style={{
            borderColor: 'var(--border)',
            background: 'linear-gradient(135deg, var(--panel) 0%, var(--bg-elevated) 100%)',
          }}
        >
          {/* Subtle glow on hover */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(ellipse at center, var(--accent-glow), transparent 70%)',
            }}
          />

          {/* Content */}
          <div className="relative p-5">
            {/* Header */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                📍 Where you left off
              </span>
              <span className="text-xs" style={{ color: 'var(--muted-soft)' }}>
                • {timeAgo}
              </span>
            </div>

            {/* Main content */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Title */}
                <h3
                  className="truncate text-lg font-semibold transition-colors group-hover:text-[var(--accent)]"
                  style={{ color: 'var(--text)' }}
                >
                  "{lastActivity.title}"
                </h3>

                {/* Subtitle / Context */}
                {lastActivity.subtitle && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {lastActivity.subtitle}
                  </p>
                )}

                {/* Encouragement */}
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                  {encouragement}
                </p>
              </div>

              {/* Continue button */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>

            {/* Progress bar if applicable */}
            {lastActivity.progress !== undefined && lastActivity.progress > 0 && (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Progress</span>
                  <span style={{ color: 'var(--text)' }}>{lastActivity.progress}%</span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full"
                  style={{ background: 'var(--border)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lastActivity.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                </div>
              </div>
            )}

            {/* Collaborators indicator */}
            {lastActivity.collaborators && lastActivity.collaborators > 0 && (
              <div
                className="mt-3 flex items-center gap-2 text-xs"
                style={{ color: 'var(--muted)' }}
              >
                <span className="flex -space-x-2">
                  {[...Array(Math.min(3, lastActivity.collaborators))].map((_, i) => (
                    <div
                      key={i}
                      className="flex h-5 w-5 items-center justify-center rounded-full border-2 text-[8px]"
                      style={{
                        borderColor: 'var(--panel)',
                        background: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      👤
                    </div>
                  ))}
                </span>
                <span>
                  {lastActivity.collaborators} collaborator
                  {lastActivity.collaborators > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Accent line at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ background: 'var(--accent)' }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

// Helper functions
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 172800) return 'yesterday';
  return `${Math.floor(seconds / 86400)} days ago`;
}

function getEncouragement(type: string, progress?: number): string {
  const encouragements = {
    song: [
      'That melody was going somewhere...',
      'The muse is waiting.',
      "Let's finish what we started.",
      'Your song misses you.',
    ],
    project: ['Momentum is everything.', 'One step closer to done.', 'Keep the vision alive.'],
    collaboration: [
      'Your collaborator might be online.',
      'Two heads are better than one.',
      'Keep the conversation going.',
    ],
    practice: ['Every minute counts.', 'The streak continues...', 'Consistency builds mastery.'],
  };

  if (progress && progress > 75) {
    return "Almost there. Let's finish this.";
  }

  const options = encouragements[type as keyof typeof encouragements] || encouragements.song;
  return options[Math.floor(Math.random() * options.length)];
}
