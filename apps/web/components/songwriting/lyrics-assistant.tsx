'use client';

import { useState } from 'react';
import { Card, Button } from '@cronkwaters/ui';
import { Book, Sparkles, Loader2 } from 'lucide-react';

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
        'night, light, fight, sight, bright'
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
        'sad: melancholy, sorrowful, blue, downhearted'
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
          context: {}
        })
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
          className={`px-6 py-3.5 rounded-xl transition-all font-semibold text-left ${
            mode === 'rhyme'
              ? 'bg-brand-primary text-brand-primary-foreground shadow-lg border-2 border-brand-primary'
              : 'bg-surface-muted hover:bg-surface text-foreground border-2 border-border hover:border-brand-primary/30'
          }`}
        >
          <Book className="w-5 h-5 inline-block mr-3" />
          Find Rhymes
        </button>
        <button
          onClick={() => setMode('thesaurus')}
          className={`px-6 py-3.5 rounded-xl transition-all font-semibold text-left ${
            mode === 'thesaurus'
              ? 'bg-brand-primary text-brand-primary-foreground shadow-lg border-2 border-brand-primary'
              : 'bg-surface-muted hover:bg-surface text-foreground border-2 border-border hover:border-brand-primary/30'
          }`}
        >
          <Book className="w-5 h-5 inline-block mr-3" />
          Thesaurus
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`px-6 py-3.5 rounded-xl transition-all font-semibold text-left ${
            mode === 'ai'
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg border-2 border-purple-500'
              : 'bg-surface-muted hover:bg-surface text-foreground border-2 border-border hover:border-purple-500/30'
          }`}
        >
          <Sparkles className="w-5 h-5 inline-block mr-3" />
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
            mode === 'rhyme' ? 'Enter a word to find rhymes...' :
            mode === 'thesaurus' ? 'Enter a word to find synonyms...' :
            'Ask AI for lyric help (e.g., "help with chorus about heartbreak")'
          }
          className="w-full px-4 py-4 pr-32 bg-surface border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition text-base"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-lg ${
            mode === 'ai' ? 'bg-purple-600 hover:bg-purple-700' : ''
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {mode === 'ai' ? 'AI Suggestions' : mode === 'rhyme' ? 'Rhymes' : 'Synonyms'}
          </h4>
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="p-5 rnrb-card bg-gradient-to-br from-surface-muted to-surface hover:from-brand-primary/5 hover:to-transparent border-2 border-border hover:border-brand-primary/40 transition-all duration-200 cursor-pointer group"
              onClick={() => onInsert(suggestion)}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-foreground leading-relaxed flex-1">{suggestion}</p>
                <div className="opacity-0 group-hover:opacity-100 transition text-brand-primary text-xs font-medium">
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

