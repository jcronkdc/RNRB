'use client';

import { useEffect, useRef } from 'react';

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  currentReaction: string | null;
}

const REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🎸', label: 'Rock' },
  { emoji: '💯', label: '100' },
];

export function ReactionPicker({ onSelect, onClose, currentReaction }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 rounded-full border border-white/10 bg-black/90 p-2 shadow-2xl"
    >
      <div className="flex items-center gap-1">
        {REACTIONS.map(({ emoji, label }) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            title={label}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-all hover:scale-125 hover:bg-white/10 ${
              currentReaction === emoji ? 'scale-110 bg-purple-500/20' : ''
            }`}
          >
            {emoji}
            <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
