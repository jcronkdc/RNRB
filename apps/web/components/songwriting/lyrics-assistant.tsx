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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('rhyme')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            mode === 'rhyme'
              ? 'bg-brand-primary text-brand-primary-foreground'
              : 'bg-surface-muted hover:bg-surface text-foreground border border-border'
          }`}
        >
          <Book className="w-4 h-4 inline-block mr-2" />
          Rhymes
        </button>
        <button
          onClick={() => setMode('thesaurus')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            mode === 'thesaurus'
              ? 'bg-brand-primary text-brand-primary-foreground'
              : 'bg-surface-muted hover:bg-surface text-foreground border border-border'
          }`}
        >
          <Book className="w-4 h-4 inline-block mr-2" />
          Thesaurus
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            mode === 'ai'
              ? 'bg-purple-600 text-white'
              : 'bg-surface-muted hover:bg-surface text-foreground border border-border'
          }`}
        >
          <Sparkles className="w-4 h-4 inline-block mr-2" />
          AI Suggest
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={
            mode === 'rhyme' ? 'Word to rhyme with...' :
            mode === 'thesaurus' ? 'Word to find synonyms...' :
            'Ask AI for lyric suggestions...'
          }
          className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-2.5 rounded-xl"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="p-4 rnrb-card bg-surface-muted hover:border-brand-primary/30 transition cursor-pointer"
              onClick={() => onInsert(suggestion)}
            >
              <p className="text-sm text-foreground">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

