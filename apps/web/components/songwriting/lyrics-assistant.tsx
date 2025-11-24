'use client';

import { Card, Button } from '@cronkwaters/ui';
import { Book, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

type LyricsAssistantProps = {
  currentLyrics: string;
  onInsert: (text: string) => void;
};

export function LyricsAssistant({ currentLyrics, onInsert }: LyricsAssistantProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'rhyme' | 'thesaurus' | 'ai'>('rhyme');

  const getRhymes = async (word: string) => {
    setLoading(true);
    setSuggestions([]);

    try {
      // TODO: Integrate with rhyme API (Datamuse API is free)
      // For now, placeholder
      setSuggestions([
        `${word} - Rhymes coming soon (will use Datamuse API)`,
        'love, dove, above, shove',
        'night, light, fight, sight, bright',
      ]);
    } catch (error) {
      setSuggestions(['Rhyme API integration coming soon']);
    } finally {
      setLoading(false);
    }
  };

  const getThesaurus = async (word: string) => {
    setLoading(true);
    setSuggestions([]);

    try {
      // TODO: Integrate with thesaurus API
      setSuggestions([
        `${word} - Synonyms coming soon (will use Thesaurus API)`,
        'happy: joyful, cheerful, elated, blissful',
        'sad: melancholy, sorrowful, blue, downhearted',
      ]);
    } catch (error) {
      setSuggestions(['Thesaurus API integration coming soon']);
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async (prompt: string) => {
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch('/api/ai/chat-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Help with lyrics: ${prompt}. Current lyrics context: ${currentLyrics.substring(0, 200)}`,
          context: {},
        }),
      });

      if (!response.ok) throw new Error('AI unavailable');

      const data = await response.json();
      setSuggestions([data.suggestion]);
    } catch (error) {
      setSuggestions(['AI lyric assistant unavailable. Check OPENAI_API_KEY.']);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    if (mode === 'rhyme') getRhymes(query);
    else if (mode === 'thesaurus') getThesaurus(query);
    else getAISuggestions(query);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setMode('rhyme')}
          className={`rounded-xl px-6 py-3.5 text-left font-semibold transition-all ${
            mode === 'rhyme'
              ? 'border-brand-primary bg-brand-primary text-brand-primary-foreground border-2 shadow-lg'
              : 'border-border bg-surface-muted text-foreground hover:border-brand-primary/30 hover:bg-surface border-2'
          }`}
        >
          <Book className="mr-3 inline-block h-5 w-5" />
          Find Rhymes
        </button>
        <button
          onClick={() => setMode('thesaurus')}
          className={`rounded-xl px-6 py-3.5 text-left font-semibold transition-all ${
            mode === 'thesaurus'
              ? 'border-brand-primary bg-brand-primary text-brand-primary-foreground border-2 shadow-lg'
              : 'border-border bg-surface-muted text-foreground hover:border-brand-primary/30 hover:bg-surface border-2'
          }`}
        >
          <Book className="mr-3 inline-block h-5 w-5" />
          Thesaurus
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`rounded-xl px-6 py-3.5 text-left font-semibold transition-all ${
            mode === 'ai'
              ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
              : 'border-border bg-surface-muted text-foreground hover:bg-surface border-2 hover:border-purple-500/30'
          }`}
        >
          <Sparkles className="mr-3 inline-block h-5 w-5" />
          AI Suggestions
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={
            mode === 'rhyme'
              ? 'Enter a word to find rhymes...'
              : mode === 'thesaurus'
                ? 'Enter a word to find synonyms...'
                : 'Ask AI for lyric help (e.g., "help with chorus about heartbreak")'
          }
          className="border-border bg-surface text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-brand-primary/10 w-full rounded-xl border-2 px-4 py-4 pr-32 text-base outline-none transition focus:ring-4"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-6 py-2.5 ${
            mode === 'ai' ? 'bg-purple-600 hover:bg-purple-700' : ''
          }`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
            {mode === 'ai' ? 'AI Suggestions' : mode === 'rhyme' ? 'Rhymes' : 'Synonyms'}
          </h4>
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="rnrb-card border-border from-surface-muted to-surface hover:border-brand-primary/40 hover:from-brand-primary/5 group cursor-pointer border-2 bg-gradient-to-br p-5 transition-all duration-200 hover:to-transparent"
              onClick={() => onInsert(suggestion)}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-foreground flex-1 text-sm leading-relaxed">{suggestion}</p>
                <div className="text-brand-primary text-xs font-medium opacity-0 transition group-hover:opacity-100">
                  Click to insert →
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
