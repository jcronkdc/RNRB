'use client';

import { Button } from '@cronkwaters/ui';
import { Sparkles, Loader2, X } from '@/components/ui/custom-icons';
import { useState } from 'react';

type AIChatAssistantProps = {
  onSuggestion: (suggestion: string) => void;
  projectContext?: {
    projectName?: string;
    currentKey?: string;
    currentTempo?: number;
    genre?: string;
  };
};

export function AIChatAssistant({ onSuggestion, projectContext }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const getAIHelp = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSuggestion(null);

    try {
      const response = await fetch('/api/ai/chat-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: projectContext,
        }),
      });

      if (!response.ok) throw new Error('AI service unavailable');

      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      setSuggestion('AI assistant unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = () => {
    if (suggestion) {
      onSuggestion(`[AI Suggestion] ${suggestion}`);
      setIsOpen(false);
      setQuery('');
      setSuggestion(null);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="border border-purple-500/30 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
        title="AI Collaboration Assistant"
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-96 rounded-lg border border-border bg-surface p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h4 className="font-semibold text-foreground">AI Assistant</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-3 text-xs text-muted-foreground">
            Ask about chords, song structure, lyrics, or music theory
          </p>

          <div className="space-y-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What chord goes after Am in this progression?"
              className="w-full resize-none rounded border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-brand-primary focus:outline-hidden"
              rows={3}
            />

            <Button
              onClick={getAIHelp}
              disabled={loading || !query.trim()}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Get AI Suggestion
                </>
              )}
            </Button>

            {suggestion && (
              <div className="rounded border border-purple-500/20 bg-purple-500/10 p-3">
                <p className="mb-2 text-xs font-semibold text-purple-400">AI SUGGESTION:</p>
                <p className="mb-3 text-sm text-foreground">{suggestion}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={useSuggestion}
                    size="sm"
                    className="bg-purple-600 text-xs text-white hover:bg-purple-700"
                  >
                    Use This Suggestion
                  </Button>
                  <Button
                    onClick={() => setSuggestion(null)}
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-400">Ethical AI</span> - Suggestions only, you create
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
