'use client';

import { useState } from 'react';
import { Music, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChordAlternative {
  chord: string;
  reason: string;
  vibe: 'similar' | 'jazzier' | 'mellower' | 'brighter' | 'darker';
}

interface ChordAlternativesPopoverProps {
  originalChord: string;
  alternatives: ChordAlternative[];
  onSelectAlternative?: (chord: string) => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const vibeConfig = {
  similar: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: '≈' },
  jazzier: { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: '🎷' },
  mellower: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '🌙' },
  brighter: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: '☀️' },
  darker: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30', icon: '🌑' },
};

export function ChordAlternativesPopover({
  originalChord,
  alternatives,
  onSelectAlternative,
  position = 'top',
}: ChordAlternativesPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!alternatives || alternatives.length === 0) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      {/* Trigger - subtle indicator */}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="relative inline-flex items-center gap-1 group"
        aria-label={`Show alternatives for ${originalChord}`}
      >
        <span className="font-bold">{originalChord}</span>
        <Sparkles className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-auto`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="bg-surface border-2 border-border rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[320px]">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                <Music className="w-4 h-4 text-brand-primary" />
                <h4 className="text-sm font-semibold">Try instead of {originalChord}</h4>
              </div>

              {/* Alternatives */}
              <div className="space-y-2">
                {alternatives.map((alt, index) => {
                  const config = vibeConfig[alt.vibe];
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onSelectAlternative?.(alt.chord);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 ${config.bg} border rounded-lg hover:scale-105 transition-all cursor-pointer group/alt`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg font-display">{alt.chord}</span>
                          <span className="text-xs">{config.icon}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover/alt:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs opacity-80 mb-1">{alt.reason}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 opacity-60" />
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
                          {alt.vibe}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/50 text-center">
                Click to swap • Hover for more
              </p>
            </div>

            {/* Arrow pointer */}
            <div
              className={`absolute w-3 h-3 bg-surface border-border rotate-45 ${
                position === 'top'
                  ? 'bottom-[-7px] left-1/2 -translate-x-1/2 border-r-2 border-b-2'
                  : position === 'bottom'
                  ? 'top-[-7px] left-1/2 -translate-x-1/2 border-l-2 border-t-2'
                  : position === 'left'
                  ? 'right-[-7px] top-1/2 -translate-y-1/2 border-r-2 border-t-2'
                  : 'left-[-7px] top-1/2 -translate-y-1/2 border-l-2 border-b-2'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

