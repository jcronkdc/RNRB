'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@cronkwaters/ui';

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
          context: projectContext
        })
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
        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30"
        title="AI Collaboration Assistant"
      >
        <Sparkles className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-surface border border-border rounded-lg shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-foreground">AI Assistant</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Ask about chords, song structure, lyrics, or music theory
          </p>

          <div className="space-y-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What chord goes after Am in this progression?"
              className="w-full px-3 py-2 bg-surface-muted border border-border rounded text-sm text-foreground resize-none focus:border-brand-primary focus:outline-none"
              rows={3}
            />

            <Button
              onClick={getAIHelp}
              disabled={loading || !query.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Thinking...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Get AI Suggestion</>
              )}
            </Button>

            {suggestion && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                <p className="text-xs text-purple-400 font-semibold mb-2">AI SUGGESTION:</p>
                <p className="text-sm text-foreground mb-3">{suggestion}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={useSuggestion}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
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

          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ✨ <span className="text-purple-400">Ethical AI</span> - Suggestions only, you create
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

