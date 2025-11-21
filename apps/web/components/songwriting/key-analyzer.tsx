'use client';

import { useMemo, memo } from 'react';
import { Music, TrendingUp, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectKey, type KeySuggestion } from '@/lib/music-theory/key-detector';

interface KeyAnalyzerProps {
  chords: string[];
  className?: string;
}

export const KeyAnalyzer = memo(function KeyAnalyzer({ chords, className = '' }: KeyAnalyzerProps) {
  const suggestions = useMemo(() => {
    return detectKey(chords);
  }, [chords]);

  if (chords.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border-2 border-dashed border-border/40 bg-surface/30 p-6 text-center ${className}`}
      >
        <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Add chords to detect your song's key automatically
        </p>
      </motion.div>
    );
  }

  const topSuggestion = suggestions[0];
  const otherSuggestions = suggestions.slice(1, 3);

  if (!topSuggestion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl border-2 border-border/40 bg-surface/30 p-6 ${className}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-yellow-500" />
          <p className="font-semibold text-yellow-600 dark:text-yellow-400">
            Unable to detect key
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Try adding more chords or using common progressions (I-IV-V, ii-V-I)
        </p>
      </motion.div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400 border-green-500/50 bg-green-500/10';
    if (confidence >= 60) return 'text-blue-600 dark:text-blue-400 border-blue-500/50 bg-blue-500/10';
    if (confidence >= 40) return 'text-yellow-600 dark:text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    return 'text-orange-600 dark:text-orange-400 border-orange-500/50 bg-orange-500/10';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Very Confident';
    if (confidence >= 60) return 'Confident';
    if (confidence >= 40) return 'Possible';
    return 'Uncertain';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 ${className}`}
      layout
    >
      {/* Main Key Detection */}
      <motion.div
        layout
        className={`rounded-xl border-2 ${getConfidenceColor(topSuggestion.confidence)} p-6 shadow-lg`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg"
            >
              <Music className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Detected Key
              </p>
              <motion.h3
                key={topSuggestion.key}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold font-display"
              >
                {topSuggestion.key}
              </motion.h3>
            </div>
          </div>
          
          <div className="text-right">
            <motion.div
              key={topSuggestion.confidence}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getConfidenceColor(topSuggestion.confidence)}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">{topSuggestion.confidence}%</span>
            </motion.div>
            <p className="text-xs mt-1 font-medium">
              {getConfidenceLabel(topSuggestion.confidence)}
            </p>
          </div>
        </div>

        {/* Reasons with animations */}
        {topSuggestion.reasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Why this key?
            </p>
            <AnimatePresence mode="popLayout">
              {topSuggestion.reasons.map((reason, i) => (
                <motion.div
                  key={reason}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  <span className="opacity-90">{reason}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Alternative Keys */}
      <AnimatePresence>
        {otherSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
              Other Possibilities
            </p>
            {otherSuggestions.map((suggestion, i) => (
              <motion.div
                key={suggestion.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border/60 bg-surface/50 p-4 hover:bg-surface/80 hover:border-brand-primary/30 transition-all cursor-help"
                title={suggestion.reasons.join(', ')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{suggestion.key}</p>
                    {suggestion.reasons.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestion.reasons[0]}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${getConfidenceColor(suggestion.confidence)}`}>
                      <span className="text-xs font-bold">{suggestion.confidence}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chord Count Info with animation */}
      <motion.div
        layout
        className="text-center pt-2"
      >
        <p className="text-xs text-muted-foreground">
          Analyzing{' '}
          <motion.span
            key={chords.length}
            initial={{ scale: 1.5, color: 'var(--brand-primary)' }}
            animate={{ scale: 1, color: 'inherit' }}
            className="font-semibold text-brand-primary"
          >
            {chords.length}
          </motion.span>{' '}
          {chords.length === 1 ? 'chord' : 'chords'}
        </p>
      </motion.div>
    </motion.div>
  );
});

