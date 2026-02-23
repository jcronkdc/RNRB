'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Heart, Flame, Star, Sparkles } from '@/components/ui/custom-icons';
import { useEffect, useState } from 'react';

interface Reaction {
  id: string;
  type: 'heart' | 'fire' | 'clap' | 'wow' | 'love' | 'laugh' | 'rock' | 'star';
  positionX: number;
  createdAt: string;
}

interface FloatingReactionsProps {
  reactions: Reaction[];
  onReact: (type: Reaction['type']) => void;
  disabled?: boolean;
}

const REACTION_ICONS: Record<Reaction['type'], React.ReactNode> = {
  heart: <Heart className="fill-red-500 text-red-500" />,
  fire: <Flame className="fill-orange-500 text-orange-500" />,
  clap: <span className="text-2xl">👏</span>,
  wow: <span className="text-2xl">😮</span>,
  love: <span className="text-2xl">😍</span>,
  laugh: <span className="text-2xl">😂</span>,
  rock: <span className="text-2xl">🤘</span>,
  star: <Star className="fill-yellow-400 text-yellow-400" />,
};

const REACTION_COLORS: Record<Reaction['type'], string> = {
  heart: 'text-red-500',
  fire: 'text-orange-500',
  clap: 'text-yellow-500',
  wow: 'text-blue-500',
  love: 'text-pink-500',
  laugh: 'text-green-500',
  rock: 'text-purple-500',
  star: 'text-yellow-400',
};

function FloatingReaction({ reaction }: { reaction: Reaction }) {
  const Icon = REACTION_ICONS[reaction.type];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 0,
        x: `${reaction.positionX}%`,
        scale: 0.5,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: -400,
        scale: [0.5, 1.2, 1, 0.8],
      }}
      transition={{
        duration: 3,
        ease: 'easeOut',
      }}
      className="pointer-events-none absolute bottom-20"
      style={{ left: `${reaction.positionX}%` }}
    >
      <div className={`text-3xl ${REACTION_COLORS[reaction.type]}`}>{Icon}</div>
    </motion.div>
  );
}

/**
 * Reaction bar for mobile view - simpler inline buttons
 */
export function ReactionBar({
  onReact,
  disabled,
}: {
  onReact: (type: Reaction['type']) => void;
  disabled?: boolean;
}) {
  const quickReactions: Reaction['type'][] = ['heart', 'fire', 'clap', 'rock'];

  return (
    <div className="flex items-center gap-2">
      {quickReactions.map((type) => (
        <motion.button
          key={type}
          onClick={() => onReact(type)}
          disabled={disabled}
          whileTap={{ scale: 0.85 }}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 disabled:opacity-50"
        >
          <div className="text-xl">{REACTION_ICONS[type]}</div>
        </motion.button>
      ))}
    </div>
  );
}

export function FloatingReactions({ reactions, onReact, disabled }: FloatingReactionsProps) {
  const [activeReactions, setActiveReactions] = useState<Reaction[]>([]);
  const [selectedType, setSelectedType] = useState<Reaction['type']>('heart');
  const [showPicker, setShowPicker] = useState(false);

  // Update local state when reactions prop changes
  useEffect(() => {
    setActiveReactions(reactions);
  }, [reactions]);

  const handleReact = () => {
    if (disabled) return;
    onReact(selectedType);

    // Add instant local feedback
    const localReaction: Reaction = {
      id: `local-${Date.now()}`,
      type: selectedType,
      positionX: Math.floor(Math.random() * 80) + 10,
      createdAt: new Date().toISOString(),
    };
    setActiveReactions((prev) => [...prev, localReaction]);

    // Clean up local reaction after animation
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== localReaction.id));
    }, 3000);
  };

  return (
    <div className="relative">
      {/* Floating reactions container */}
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {activeReactions.map((reaction) => (
            <FloatingReaction key={reaction.id} reaction={reaction} />
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction button */}
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          {/* Main reaction button */}
          <motion.button
            onClick={handleReact}
            disabled={disabled}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/30 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <div className="text-2xl">{REACTION_ICONS[selectedType]}</div>
          </motion.button>

          {/* Type selector */}
          <motion.button
            onClick={() => setShowPicker(!showPicker)}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
          >
            <Sparkles size={18} />
          </motion.button>
        </div>

        {/* Reaction picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border border-white/20 bg-white/10 p-2"
            >
              {(Object.keys(REACTION_ICONS) as Reaction['type'][]).map((type) => (
                <motion.button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setShowPicker(false);
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${selectedType === type ? 'bg-white/20' : 'hover:bg-white/10'} `}
                >
                  <div className="text-xl">{REACTION_ICONS[type]}</div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
