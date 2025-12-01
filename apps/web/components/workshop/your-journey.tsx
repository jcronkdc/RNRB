'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { journeyMilestones, getMilestoneMessage } from '@/lib/workshop-voice';

interface UserStats {
  songCount?: number;
  profileComplete?: boolean;
  collaborationCount?: number;
  practiceStreak?: number;
  showsPlayed?: number;
  hasWebsite?: boolean;
  totalRevenue?: number;
}

interface YourJourneyProps {
  userStats?: UserStats;
  className?: string;
  compact?: boolean;
}

/**
 * Your Journey Component
 *
 * Shows the musician where they are on their creative path
 * "You're becoming the musician you want to be"
 */
export function YourJourney({ userStats = {}, className = '', compact = false }: YourJourneyProps) {
  const [stats, setStats] = useState<UserStats>(userStats);
  const [expanded, setExpanded] = useState(false);

  // Fetch stats if not provided
  useEffect(() => {
    if (Object.keys(userStats).length === 0) {
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/ecosystem/stats');
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Failed to fetch journey stats:', error);
        }
      };
      fetchStats();
    }
  }, [userStats]);

  // Calculate completed milestones
  const completedMilestones = journeyMilestones.filter((m) => m.completed(stats));
  const nextMilestone = journeyMilestones.find((m) => !m.completed(stats));
  const progress = (completedMilestones.length / journeyMilestones.length) * 100;

  if (compact) {
    return (
      <CompactJourney
        completedCount={completedMilestones.length}
        totalCount={journeyMilestones.length}
        nextMilestone={nextMilestone}
        className={className}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
            Your Journey
          </h3>
          <span
            className="rounded-full px-2 py-1 text-xs font-medium"
            style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}
          >
            {completedMilestones.length}/{journeyMilestones.length} complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--accent), var(--gold))',
            }}
          />
        </div>
      </div>

      {/* Next milestone highlight */}
      {nextMilestone && (
        <div
          className="px-5 py-4"
          style={{
            background: 'var(--accent-glow)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <Circle className="h-4 w-4" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Next: {nextMilestone.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {nextMilestone.encouragement}
              </p>
            </div>
            <ChevronRight className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          </div>
        </div>
      )}

      {/* Milestone list */}
      <div className="px-5 py-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="mb-3 flex w-full items-center justify-between text-left text-sm font-medium"
          style={{ color: 'var(--muted)' }}
        >
          <span>{expanded ? 'Hide' : 'Show'} all milestones</span>
          <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="h-4 w-4" />
          </motion.span>
        </button>

        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-3">
            {journeyMilestones.map((milestone, index) => {
              const isCompleted = milestone.completed(stats);
              const isCurrent = milestone === nextMilestone;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                    isCurrent ? 'bg-[var(--accent-glow)]' : ''
                  }`}
                >
                  {/* Status icon */}
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-[var(--sage)]'
                        : isCurrent
                          ? 'border-2 border-[var(--accent)]'
                          : 'border border-[var(--border)]'
                    }`}
                    style={{
                      color: isCompleted ? 'white' : 'var(--muted)',
                    }}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: isCurrent ? 'var(--accent)' : 'var(--border)',
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm ${isCompleted ? 'line-through' : ''}`}
                    style={{
                      color: isCompleted
                        ? 'var(--muted)'
                        : isCurrent
                          ? 'var(--text)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {milestone.label}
                  </span>

                  {/* Completed badge */}
                  {isCompleted && (
                    <span className="ml-auto text-xs" style={{ color: 'var(--sage)' }}>
                      ✓
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Encouragement footer */}
      <div
        className="px-5 py-3 text-center text-xs"
        style={{
          background: 'var(--bg-elevated)',
          color: 'var(--muted)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {completedMilestones.length === 0
          ? 'Every journey starts with a single step'
          : completedMilestones.length === journeyMilestones.length
            ? "🎉 You've completed all milestones! You're a true artist."
            : `${journeyMilestones.length - completedMilestones.length} milestones to go. You've got this.`}
      </div>
    </motion.div>
  );
}

/**
 * Compact journey display for headers/sidebars
 */
function CompactJourney({
  completedCount,
  totalCount,
  nextMilestone,
  className = '',
}: {
  completedCount: number;
  totalCount: number;
  nextMilestone?: (typeof journeyMilestones)[number];
  className?: string;
}) {
  const progress = (completedCount / totalCount) * 100;

  return (
    <Link href="/dashboard#journey">
      <div
        className={`group rounded-xl border p-3 transition-all hover:border-[var(--accent)] ${className}`}
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Your Journey
          </span>
          <span className="text-xs" style={{ color: 'var(--gold)' }}>
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Mini progress bar */}
        <div
          className="mb-2 h-1 overflow-hidden rounded-full"
          style={{ background: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--gold))',
            }}
          />
        </div>

        {nextMilestone && (
          <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
            Next: {nextMilestone.label}
          </p>
        )}
      </div>
    </Link>
  );
}
