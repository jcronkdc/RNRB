'use client';

import { useMemo, memo, useState, useEffect } from 'react';
import { Music, TrendingUp, Info, Sparkles, Zap, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectKey, type KeySuggestion } from '@/lib/music-theory/key-detector';
import { detectKeyWithAI, type AIKeyAnalysis } from '@/lib/music-theory/ai-key-detector';

interface KeyAnalyzerProps {
  chords: string[];
  className?: string;
  useAI?: boolean; // Enable AI-powered analysis
}

export const KeyAnalyzer = memo(function KeyAnalyzer({
  chords,
  className = '',
  useAI = true,
}: KeyAnalyzerProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIKeyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Deterministic analysis (instant)
  const deterministicSuggestions = useMemo(() => {
    return detectKey(chords);
  }, [chords]);

  // AI analysis (async, only when chords change)
  useEffect(() => {
    if (!useAI || chords.length < 3) {
      setAiAnalysis(null);
      return;
    }

    let cancelled = false;
    setIsAnalyzing(true);

    detectKeyWithAI(chords)
      .then((result) => {
        if (!cancelled) {
          setAiAnalysis(result.ai);
          setIsAnalyzing(false);
        }
      })
      .catch((error) => {
        console.error('AI analysis failed:', error);
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chords, useAI]);

  // Use AI result if available and confident, otherwise deterministic
  const suggestions = useMemo(() => {
    if (aiAnalysis && aiAnalysis.confidence >= 70) {
      const aiSuggestion: KeySuggestion = {
        key: aiAnalysis.primaryKey,
        confidence: aiAnalysis.confidence,
        reasons: aiAnalysis.reasons,
        mode: aiAnalysis.primaryKey.toLowerCase().includes('minor') ? 'minor' : 'major',
      };

      // Remove duplicates and add AI result at top
      const filtered = deterministicSuggestions.filter(
        (s) => s.key.toLowerCase() !== aiAnalysis.primaryKey.toLowerCase()
      );

      return [aiSuggestion, ...filtered].slice(0, 5);
    }

    return deterministicSuggestions;
  }, [aiAnalysis, deterministicSuggestions]);

  if (chords.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border-2 border-dashed border-border/40 bg-surface/30 p-6 text-center ${className}`}
      >
        <Music className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
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
        <div className="mb-2 flex items-center gap-2">
          <Info className="h-5 w-5 text-yellow-500" />
          <p className="font-semibold text-yellow-600 dark:text-yellow-400">Unable to detect key</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Try adding more chords or using common progressions (I-IV-V, ii-V-I)
        </p>
      </motion.div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80)
      return 'text-green-600 dark:text-green-400 border-green-500/50 bg-green-500/10';
    if (confidence >= 60)
      return 'text-blue-600 dark:text-blue-400 border-blue-500/50 bg-blue-500/10';
    if (confidence >= 40)
      return 'text-yellow-600 dark:text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
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
        className={`rounded-xl border-2 ${getConfidenceColor(topSuggestion.confidence)} relative p-6 shadow-lg`}
      >
        {/* AI Badge */}
        {aiAnalysis && aiAnalysis.confidence >= 70 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-purple-500/50 bg-purple-500/20 px-2 py-1"
          >
            <Brain className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              AI Enhanced
            </span>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-blue-500/50 bg-blue-500/20 px-2 py-1"
          >
            <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
            <span className="text-[10px] font-medium text-blue-400">Analyzing...</span>
          </motion.div>
        )}

        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary shadow-lg"
            >
              <Music className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Detected Key
              </p>
              <motion.h3
                key={topSuggestion.key}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display text-2xl font-bold"
              >
                {topSuggestion.key}
              </motion.h3>
              {/* Modal info if AI detected it */}
              {aiAnalysis?.modalAnalysis &&
                aiAnalysis.modalAnalysis.mode !== 'Ionian' &&
                aiAnalysis.modalAnalysis.mode !== 'Aeolian' && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-purple-500">
                    <Sparkles className="h-3 w-3" />
                    {aiAnalysis.modalAnalysis.mode} mode
                  </p>
                )}
            </div>
          </div>

          <div className="text-right">
            <motion.div
              key={topSuggestion.confidence}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 ${getConfidenceColor(topSuggestion.confidence)}`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-bold">{topSuggestion.confidence}%</span>
            </motion.div>
            <p className="mt-1 text-xs font-medium">
              {getConfidenceLabel(topSuggestion.confidence)}
            </p>
          </div>
        </div>

        {/* Reasons with animations */}
        {topSuggestion.reasons.length > 0 && (
          <div className="space-y-1">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3 w-3" />
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
                  <div className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  <span className="opacity-90">{reason}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* AI Insights Toggle */}
        {aiAnalysis && (aiAnalysis.aiInsights?.length > 0 || aiAnalysis.musicalCharacter) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 border-t border-border/50 pt-4"
          >
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              <Brain className="h-4 w-4" />
              <span>{showAIInsights ? 'Hide' : 'Show'} AI Insights</span>
              <motion.div
                animate={{ rotate: showAIInsights ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <TrendingUp className="h-3 w-3" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showAIInsights && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {/* Musical Character */}
                  {aiAnalysis.musicalCharacter && (
                    <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                      <p className="mb-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                        Musical Character
                      </p>
                      <p className="text-sm text-foreground/90">{aiAnalysis.musicalCharacter}</p>
                    </div>
                  )}

                  {/* Progression Type */}
                  {aiAnalysis.progressionType && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                      <p className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Progression Type
                      </p>
                      <p className="text-sm text-foreground/90">{aiAnalysis.progressionType}</p>
                    </div>
                  )}

                  {/* AI Insights */}
                  {aiAnalysis.aiInsights && aiAnalysis.aiInsights.length > 0 && (
                    <div className="space-y-1.5">
                      {aiAnalysis.aiInsights.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Zap className="mt-0.5 h-3 w-3 shrink-0 text-purple-400" />
                          <span className="opacity-90">{insight}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Next Chords */}
                  {aiAnalysis.suggestedNextChords && aiAnalysis.suggestedNextChords.length > 0 && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                      <p className="mb-2 text-xs font-semibold text-green-600 dark:text-green-400">
                        Suggested Next Chords
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiAnalysis.suggestedNextChords.map((chord, i) => (
                          <span
                            key={i}
                            className="rounded border border-green-500/40 bg-green-500/20 px-2 py-1 text-xs font-bold text-green-600 dark:text-green-400"
                          >
                            {chord}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary Dominants */}
                  {aiAnalysis.secondaryDominants && aiAnalysis.secondaryDominants.length > 0 && (
                    <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
                      <p className="mb-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                        Secondary Dominants Detected
                      </p>
                      <p className="text-sm text-foreground/90">
                        {aiAnalysis.secondaryDominants.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Modulations */}
                  {aiAnalysis.modulations && aiAnalysis.modulations.length > 0 && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                      <p className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">
                        Key Changes Detected
                      </p>
                      {aiAnalysis.modulations.map((mod, i) => (
                        <p key={i} className="text-sm text-foreground/90">
                          {mod.fromKey} → {mod.toKey} (chord {mod.atChord})
                        </p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Chord Alternatives Section - Non-obtrusive */}
        {aiAnalysis?.chordAlternatives && aiAnalysis.chordAlternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 border-t border-border/50 pt-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Try These Alternatives
              </h5>
            </div>

            <div className="space-y-2">
              {aiAnalysis.chordAlternatives.map((chordAlt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-primary">
                      {chordAlt.originalChord}
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pl-6">
                    {chordAlt.alternatives.map((alt, altIndex) => {
                      const vibeColors = {
                        similar:
                          'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
                        jazzier:
                          'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20',
                        mellower:
                          'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/20',
                        brighter:
                          'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20',
                        darker:
                          'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20',
                      };

                      const vibeIcons = {
                        similar: '≈',
                        jazzier: '🎷',
                        mellower: '🌙',
                        brighter: '☀️',
                        darker: '🌑',
                      };

                      return (
                        <motion.div
                          key={altIndex}
                          whileHover={{ scale: 1.05 }}
                          className={`group/alt cursor-pointer rounded-lg border-2 px-3 py-2 transition-all ${vibeColors[alt.vibe]}`}
                          title={alt.reason}
                        >
                          <div className="mb-0.5 flex items-center gap-1.5">
                            <span className="font-display text-sm font-bold">{alt.chord}</span>
                            <span className="text-xs opacity-70">{vibeIcons[alt.vibe]}</span>
                          </div>
                          <p className="hidden max-w-[140px] text-[10px] leading-tight opacity-70 group-hover/alt:block">
                            {alt.reason}
                          </p>
                          <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60">
                            {alt.vibe}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="mt-3 text-center text-[10px] text-muted-foreground opacity-60">
              💡 Hover over alternatives to see why they work
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Alternative Keys */}
      <AnimatePresence>
        {otherSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Other Possibilities
            </p>
            {otherSuggestions.map((suggestion, i) => (
              <motion.div
                key={suggestion.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="cursor-help rounded-lg border border-border/60 bg-surface/50 p-4 transition-all hover:border-brand-primary/30 hover:bg-surface/80"
                title={suggestion.reasons.join(', ')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{suggestion.key}</p>
                    {suggestion.reasons.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">{suggestion.reasons[0]}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${getConfidenceColor(suggestion.confidence)}`}
                    >
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
      <motion.div layout className="pt-2 text-center">
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
