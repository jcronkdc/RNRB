'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, RefreshCw } from '@/components/ui/custom-icons';
import { getDailySpark } from '@/lib/workshop-voice';

interface DailySparkProps {
  className?: string;
  onComplete?: () => void;
}

/**
 * Daily Spark Component
 *
 * A daily creative prompt that gives musicians a reason to return
 * Creates ritual and habit - "I wonder what today's spark is"
 */
export function DailySpark({ className = '', onComplete }: DailySparkProps) {
  const [spark, setSpark] = useState(getDailySpark());
  const [completed, setCompleted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  // Check if already completed today (stored in localStorage)
  useEffect(() => {
    const today = new Date().toDateString();
    const completedDate = localStorage.getItem('dailySparkCompleted');
    if (completedDate === today) {
      setCompleted(true);
    }
  }, []);

  const handleComplete = () => {
    const today = new Date().toDateString();
    localStorage.setItem('dailySparkCompleted', today);
    setCompleted(true);
    setCelebrating(true);

    // Subtle celebration
    setTimeout(() => setCelebrating(false), 2000);

    if (onComplete) {
      onComplete();
    }
  };

  const categoryColors = {
    create: 'var(--accent)',
    learn: 'var(--sky)',
    connect: 'var(--gold)',
    reflect: 'var(--sage)',
  };

  const categoryIcons = {
    create: '♪',
    learn: '',
    connect: '🤝',
    reflect: '💭',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${className}`}
      style={{
        borderColor: completed ? 'var(--sage)' : 'var(--border)',
        background: completed
          ? 'linear-gradient(135deg, var(--sage-dim), var(--panel))'
          : 'linear-gradient(135deg, var(--accent-glow), var(--panel))',
      }}
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ background: 'rgba(123, 145, 120, 0.9)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <p className="text-lg font-medium text-white">Beautiful!</p>
              <p className="text-sm text-white/80">You showed up today.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles
              className="h-5 w-5"
              style={{ color: completed ? 'var(--sage)' : 'var(--accent)' }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Today's Spark
            </span>
          </div>

          {/* Category badge */}
          <span
            className="rounded-full px-2 py-1 text-xs"
            style={{
              background: `${categoryColors[spark.category as keyof typeof categoryColors]}20`,
              color: categoryColors[spark.category as keyof typeof categoryColors],
            }}
          >
            {categoryIcons[spark.category as keyof typeof categoryIcons]} {spark.category}
          </span>
        </div>

        {/* The prompt */}
        <p className="mb-4 text-base leading-relaxed" style={{ color: 'var(--text)' }}>
          {spark.prompt}
        </p>

        {/* Action button */}
        {!completed ? (
          <button
            onClick={handleComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            <Check className="h-4 w-4" />I did it!
          </button>
        ) : (
          <div
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-center text-sm font-medium"
            style={{
              background: 'var(--sage-dim)',
              color: 'var(--sage)',
            }}
          >
            <Check className="h-4 w-4" />
            Completed today
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div
        className="px-5 py-3 text-center text-xs"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--muted)',
        }}
      >
        {completed
          ? 'Come back tomorrow for a new spark'
          : 'Small actions lead to big breakthroughs'}
      </div>
    </motion.div>
  );
}

/**
 * Mini spark for sidebar/header
 */
export function SparkIndicator({ completed }: { completed?: boolean }) {
  const spark = getDailySpark();

  return (
    <div
      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--panel-hover)]"
      title={spark.prompt}
    >
      <Sparkles className="h-4 w-4" style={{ color: completed ? 'var(--sage)' : 'var(--gold)' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {completed ? 'Spark done' : 'Daily Spark'}
      </span>
      {!completed && (
        <span
          className="h-2 w-2 animate-pulse rounded-full"
          style={{ background: 'var(--gold)' }}
        />
      )}
    </div>
  );
}
