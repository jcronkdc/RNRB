'use client';

import { Card, Button } from '@cronkwaters/ui';
import { Book, Sparkles, Loader2, Hash, TrendingUp } from 'lucide-react';
import { useState } from 'react';

type LyricsAssistantProps = {
  currentLyrics: string;
  onInsert: (text: string) => void;
};

type RhymeType = 'perfect' | 'near' | 'sounds-like';

interface SyllableResult {
  line: string;
  syllables: number;
  words: Array<{ word: string; syllables: number }>;
  wordCount: number;
}

export function LyricsAssistant({ currentLyrics, onInsert }: LyricsAssistantProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'rhyme' | 'thesaurus' | 'syllables' | 'ai'>('rhyme');
  const [rhymeType, setRhymeType] = useState<RhymeType>('perfect');
  const [syllableResults, setSyllableResults] = useState<SyllableResult[]>([]);

  const getRhymes = async (word: string) => {
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch(`/api/rhyme?word=${encodeURIComponent(word)}&type=${rhymeType}`);
      
      if (!response.ok) throw new Error('Rhyme API failed');
      
      const data = await response.json();
      
      if (data.rhymes && data.rhymes.length > 0) {
        // Group by syllable count if available
        if (data.grouped && Object.keys(data.grouped).length > 0) {
          const grouped = data.grouped as Record<string, string[]>;
          const formattedSuggestions: string[] = [];
          
          Object.keys(grouped)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach((syllableCount) => {
              const words = grouped[syllableCount];
              if (words && words.length > 0) {
                formattedSuggestions.push(
                  `${syllableCount} syllable${parseInt(syllableCount) > 1 ? 's' : ''}: ${words.slice(0, 10).join(', ')}`
                );
              }
            });
          
          setSuggestions(formattedSuggestions.length > 0 ? formattedSuggestions : data.rhymes.slice(0, 30));
        } else {
          setSuggestions(data.rhymes.slice(0, 30));
        }
      } else {
        setSuggestions([`No ${rhymeType} rhymes found for "${word}". Try a different word or rhyme type.`]);
      }
    } catch (error) {
      console.error('Rhyme fetch error:', error);
      setSuggestions(['Rhyme dictionary temporarily unavailable. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const getThesaurus = async (word: string) => {
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch(`/api/thesaurus?word=${encodeURIComponent(word)}&type=all`);
      
      if (!response.ok) throw new Error('Thesaurus API failed');
      
      const data = await response.json();
      const results: string[] = [];
      
      if (data.synonyms && data.synonyms.length > 0) {
        const synonymWords = data.synonyms
          .slice(0, 15)
          .map((s: { word: string; definition?: string }) => 
            s.definition ? `${s.word} (${s.definition})` : s.word
          );
        results.push(`Synonyms: ${synonymWords.join(', ')}`);
      }
      
      if (data.triggers && data.triggers.length > 0) {
        results.push(`Words that follow: ${data.triggers.slice(0, 10).join(', ')}`);
      }
      
      if (results.length > 0) {
        setSuggestions(results);
      } else {
        setSuggestions([`No synonyms found for "${word}". Try a different word.`]);
      }
    } catch (error) {
      console.error('Thesaurus fetch error:', error);
      setSuggestions(['Thesaurus temporarily unavailable. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const getSyllables = async (text: string) => {
    setLoading(true);
    setSyllableResults([]);
    setSuggestions([]);

    try {
      const response = await fetch('/api/syllables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Syllable counter failed');
      
      const data = await response.json();
      
      if (data.lines && data.lines.length > 0) {
        setSyllableResults(data.lines);
        
        const summary = [
          `Total lines: ${data.totalLines}`,
          `Average syllables per line: ${data.averageSyllables}`,
        ];
        
        if (data.meterWarning) {
          summary.push(`⚠️ ${data.meterWarning}`);
        } else {
          summary.push('✓ Meter is consistent');
        }
        
        setSuggestions(summary);
      } else {
        setSuggestions(['No text to analyze. Enter some lyrics first.']);
      }
    } catch (error) {
      console.error('Syllable counter error:', error);
      setSuggestions(['Syllable counter temporarily unavailable. Please try again.']);
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
    if (!query.trim() && mode !== 'syllables') return;

    if (mode === 'rhyme') getRhymes(query);
    else if (mode === 'thesaurus') getThesaurus(query);
    else if (mode === 'syllables') getSyllables(query || currentLyrics);
    else getAISuggestions(query);
  };

  return (
    <div className="space-y-6">
      {/* Improved Tool Selector with Better Visual Hierarchy */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => setMode('rhyme')}
          className={`group relative overflow-hidden rounded-xl px-6 py-4 text-left font-semibold transition-all ${
            mode === 'rhyme'
              ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'border-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:border-blue-500/50 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${mode === 'rhyme' ? 'bg-white/20' : 'bg-blue-500/10'}`}>
              <Book className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold">Rhyme Dictionary</div>
              <div className="text-xs opacity-80">Perfect, near, sounds-like</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setMode('thesaurus')}
          className={`group relative overflow-hidden rounded-xl px-6 py-4 text-left font-semibold transition-all ${
            mode === 'thesaurus'
              ? 'border-2 border-indigo-500 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'border-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:border-indigo-500/50 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${mode === 'thesaurus' ? 'bg-white/20' : 'bg-indigo-500/10'}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold">Thesaurus</div>
              <div className="text-xs opacity-80">Synonyms & word power</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setMode('syllables')}
          className={`group relative overflow-hidden rounded-xl px-6 py-4 text-left font-semibold transition-all ${
            mode === 'syllables'
              ? 'border-2 border-green-500 bg-gradient-to-br from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
              : 'border-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:border-green-500/50 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${mode === 'syllables' ? 'bg-white/20' : 'bg-green-500/10'}`}>
              <Hash className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold">Syllable Counter</div>
              <div className="text-xs opacity-80">Meter & flow analysis</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setMode('ai')}
          className={`group relative overflow-hidden rounded-xl px-6 py-4 text-left font-semibold transition-all ${
            mode === 'ai'
              ? 'border-2 border-purple-500 bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'border-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:border-purple-500/50 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${mode === 'ai' ? 'bg-white/20' : 'bg-purple-500/10'}`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold">AI Assistant</div>
              <div className="text-xs opacity-80">Smart lyric help</div>
            </div>
          </div>
        </button>
      </div>
      
      {/* Rhyme type selector */}
      {mode === 'rhyme' && (
        <div className="flex gap-2">
          <button
            onClick={() => setRhymeType('perfect')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              rhymeType === 'perfect'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Perfect Rhymes
          </button>
          <button
            onClick={() => setRhymeType('near')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              rhymeType === 'near'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Near Rhymes
          </button>
          <button
            onClick={() => setRhymeType('sounds-like')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              rhymeType === 'sounds-like'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Sounds Like
          </button>
        </div>
      )}

      <div className="relative">
        {mode === 'syllables' ? (
          <div className="space-y-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste your lyrics here to count syllables per line..."
              className="border-border bg-surface text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-brand-primary/10 min-h-[120px] w-full rounded-xl border-2 px-4 py-4 text-base outline-none transition focus:ring-4"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || (!query.trim() && !currentLyrics.trim())}
              className="bg-green-600 hover:bg-green-700 w-full rounded-lg px-6 py-3"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
              {loading ? 'Counting...' : 'Count Syllables'}
            </Button>
          </div>
        ) : (
          <>
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
                mode === 'ai' ? 'bg-purple-600 hover:bg-purple-700' : mode === 'syllables' ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </>
        )}
      </div>

      {/* Syllable breakdown display */}
      {mode === 'syllables' && syllableResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Syllable Breakdown
          </h4>
          {syllableResults.map((result, index) => (
            <Card
              key={index}
              className="rnrb-card border-border from-surface-muted to-surface border-2 bg-gradient-to-br p-4"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-foreground flex-1 text-sm font-medium">{result.line}</p>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                  {result.syllables} syllables
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.words.map((word, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-800/50 text-gray-300 px-2 py-0.5 rounded text-xs"
                  >
                    {word.word} ({word.syllables})
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Regular suggestions display */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
            {mode === 'ai' ? 'AI Suggestions' : mode === 'rhyme' ? 'Rhymes' : mode === 'syllables' ? 'Analysis' : 'Synonyms'}
          </h4>
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className={`rnrb-card border-border from-surface-muted to-surface hover:border-brand-primary/40 hover:from-brand-primary/5 ${mode === 'syllables' ? '' : 'group cursor-pointer'} border-2 bg-gradient-to-br p-5 transition-all duration-200 hover:to-transparent`}
              onClick={mode === 'syllables' ? undefined : () => onInsert(suggestion)}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-foreground flex-1 text-sm leading-relaxed">{suggestion}</p>
                {mode !== 'syllables' && (
                  <div className="text-brand-primary text-xs font-medium opacity-0 transition group-hover:opacity-100">
                    Click to insert →
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
