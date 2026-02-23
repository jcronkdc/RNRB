'use client';

import { Card } from '@cronkwaters/ui';
import {
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  Filter,
  AlertCircle,
} from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

export type SuggestionType = 'rhyme' | 'synonym' | 'chord' | 'structure' | 'ai';

export type Suggestion = {
  id: string;
  type: SuggestionType;
  original: string;
  suggested: string;
  context?: string;
  reason?: string;
  confidence?: number;
  position?: {
    blockId?: string;
    lineIndex?: number;
    wordIndex?: number;
  };
};

type BatchSuggestionReviewProps = {
  suggestions: Suggestion[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  isLoading?: boolean;
};

const SUGGESTION_TYPE_INFO = {
  rhyme: {
    label: 'Rhyme',
    color: 'blue',
    icon: 'R',
  },
  synonym: {
    label: 'Synonym',
    color: 'green',
    icon: 'S',
  },
  chord: {
    label: 'Chord',
    color: 'purple',
    icon: '♯',
  },
  structure: {
    label: 'Structure',
    color: 'orange',
    icon: '≡',
  },
  ai: {
    label: 'AI',
    color: 'pink',
    icon: '*',
  },
} as const;

export function BatchSuggestionReview({
  suggestions,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
  isLoading = false,
}: BatchSuggestionReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterType, setFilterType] = useState<SuggestionType | 'all'>('all');
  const [localSuggestions, setLocalSuggestions] = useState<Suggestion[]>(suggestions);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    setLocalSuggestions(suggestions);
    setReviewedCount(0);
    setCurrentIndex(0);
  }, [suggestions]);

  const filteredSuggestions =
    filterType === 'all' ? localSuggestions : localSuggestions.filter((s) => s.type === filterType);

  const currentSuggestion = filteredSuggestions[currentIndex];
  const hasNext = currentIndex < filteredSuggestions.length - 1;
  const hasPrev = currentIndex > 0;

  const handleAccept = () => {
    if (currentSuggestion) {
      onAccept(currentSuggestion.id);
      setLocalSuggestions((prev) => prev.filter((s) => s.id !== currentSuggestion.id));
      setReviewedCount((prev) => prev + 1);

      // Move to next or stay at current if at end
      if (currentIndex >= filteredSuggestions.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  const handleReject = () => {
    if (currentSuggestion) {
      onReject(currentSuggestion.id);
      setLocalSuggestions((prev) => prev.filter((s) => s.id !== currentSuggestion.id));
      setReviewedCount((prev) => prev + 1);

      // Move to next or stay at current if at end
      if (currentIndex >= filteredSuggestions.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleAcceptAll = () => {
    if (confirm(`Accept all ${filteredSuggestions.length} suggestions?`)) {
      onAcceptAll();
      setLocalSuggestions([]);
      setReviewedCount((prev) => prev + filteredSuggestions.length);
    }
  };

  const handleRejectAll = () => {
    if (confirm(`Reject all ${filteredSuggestions.length} suggestions?`)) {
      onRejectAll();
      setLocalSuggestions([]);
      setReviewedCount((prev) => prev + filteredSuggestions.length);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing
      }

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          handleAccept();
          break;
        case 'r':
          e.preventDefault();
          handleReject();
          break;
        case 'j':
          e.preventDefault();
          handleNext();
          break;
        case 'k':
          e.preventDefault();
          handlePrev();
          break;
        case 'arrowright':
          e.preventDefault();
          handleNext();
          break;
        case 'arrowleft':
          e.preventDefault();
          handlePrev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSuggestion, currentIndex]);

  if (isLoading) {
    return (
      <Card className="border-gray-800 bg-linear-to-b from-gray-900 to-black p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-400" />
          <p className="text-gray-400">Loading suggestions...</p>
        </div>
      </Card>
    );
  }

  if (localSuggestions.length === 0) {
    return (
      <Card className="border-gray-800 bg-linear-to-b from-gray-900 to-black p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">All Done!</h3>
          <p className="text-gray-400">
            {reviewedCount > 0
              ? `You reviewed ${reviewedCount} suggestion${reviewedCount === 1 ? '' : 's'}`
              : 'No suggestions to review right now'}
          </p>
        </div>
      </Card>
    );
  }

  if (!currentSuggestion) {
    return (
      <Card className="border-gray-800 bg-linear-to-b from-gray-900 to-black p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
          <p className="text-gray-400">No suggestions match the current filter</p>
        </div>
      </Card>
    );
  }

  const typeInfo = SUGGESTION_TYPE_INFO[currentSuggestion.type];

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1.5">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              {currentIndex + 1} / {filteredSuggestions.length}
            </span>
          </div>
          {reviewedCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">{reviewedCount} reviewed</span>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setCurrentIndex(0);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Types ({localSuggestions.length})</option>
            {Object.entries(SUGGESTION_TYPE_INFO).map(([type, info]) => {
              const count = localSuggestions.filter((s) => s.type === type).length;
              return count > 0 ? (
                <option key={type} value={type}>
                  {info.icon} {info.label} ({count})
                </option>
              ) : null;
            })}
          </select>
        </div>
      </div>

      {/* Main Suggestion Card */}
      <Card className="border-gray-800 bg-linear-to-b from-gray-900 to-black p-6">
        {/* Type Badge */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
              typeInfo.color === 'blue'
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                : typeInfo.color === 'green'
                  ? 'border-green-500/30 bg-green-500/10 text-green-400'
                  : typeInfo.color === 'purple'
                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                    : typeInfo.color === 'orange'
                      ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                      : 'border-pink-500/30 bg-pink-500/10 text-pink-400'
            }`}
          >
            <span>{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
          </span>

          {currentSuggestion.confidence && (
            <span className="text-xs text-gray-500">
              {Math.round(currentSuggestion.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {/* Context */}
        {currentSuggestion.context && (
          <div className="mb-4 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Context</p>
            <p className="mt-1 text-sm text-gray-300">{currentSuggestion.context}</p>
          </div>
        )}

        {/* Comparison */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Original */}
          <div className="rounded-lg border-2 border-red-500/30 bg-red-500/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">
              Original
            </p>
            <p className="text-lg font-medium text-white">{currentSuggestion.original}</p>
          </div>

          {/* Suggested */}
          <div className="rounded-lg border-2 border-green-500/30 bg-green-500/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-400">
              Suggested
            </p>
            <p className="text-lg font-medium text-white">{currentSuggestion.suggested}</p>
          </div>
        </div>

        {/* Reason */}
        {currentSuggestion.reason && (
          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <p className="text-xs uppercase tracking-wide text-blue-400">Why this suggestion?</p>
            <p className="mt-1 text-sm text-gray-300">{currentSuggestion.reason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleReject}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            <X className="h-5 w-5" />
            Reject
            <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-xs">R</span>
          </button>

          <button
            onClick={handleAccept}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-green-500/50 bg-green-500/10 px-6 py-3 font-semibold text-green-400 transition hover:bg-green-500/20"
          >
            <Check className="h-5 w-5" />
            Accept
            <span className="rounded bg-green-500/20 px-2 py-0.5 font-mono text-xs">A</span>
          </button>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition ${
            hasPrev
              ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
              : 'cursor-not-allowed border-gray-800 bg-gray-900 text-gray-600'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="rounded bg-gray-700 px-2 py-0.5 font-mono text-xs">K / ←</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleRejectAll}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          >
            Reject All
          </button>
          <button
            onClick={handleAcceptAll}
            className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition hover:bg-green-500/20"
          >
            Accept All
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition ${
            hasNext
              ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
              : 'cursor-not-allowed border-gray-800 bg-gray-900 text-gray-600'
          }`}
        >
          <span className="rounded bg-gray-700 px-2 py-0.5 font-mono text-xs">J / →</span>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Keyboard Shortcuts
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-400 sm:grid-cols-4">
          <div>
            <kbd className="font-mono">A</kbd> - Accept
          </div>
          <div>
            <kbd className="font-mono">R</kbd> - Reject
          </div>
          <div>
            <kbd className="font-mono">J / →</kbd> - Next
          </div>
          <div>
            <kbd className="font-mono">K / ←</kbd> - Previous
          </div>
        </div>
      </div>
    </div>
  );
}
