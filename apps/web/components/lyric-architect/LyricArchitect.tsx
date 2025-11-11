'use client';

import { useState } from 'react';
import { Button } from '@songforge/ui';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LyricArchitectProps {
  projectId: string;
  songId?: string;
  onComplete?: () => void;
}

export function LyricArchitect({ projectId, songId, onComplete }: LyricArchitectProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [lyrics, setLyrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateLyrics = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lyrics');
      }

      const data = await response.json();
      setLyrics(data.lyrics);
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lyrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-surface/80 p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-primary" />
        <h3 className="font-semibold">AI Lyric Architect</h3>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your song... e.g., 'sad breakup song with a hopeful chorus'"
          className="w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
          rows={4}
        />

        <Button onClick={generateLyrics} disabled={loading || !prompt.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Lyrics
            </>
          )}
        </Button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-danger/10 p-3 text-sm text-danger"
            >
              {error}
            </motion.div>
          )}

          {lyrics && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4 rounded-lg border border-border/60 bg-background p-6"
            >
              <h4 className="font-semibold">{lyrics.title}</h4>

              {lyrics.verses && (
                <div>
                  <h5 className="mb-2 text-sm font-medium text-muted-foreground">Verses</h5>
                  {lyrics.verses.map((verse: any, i: number) => (
                    <div key={i} className="mb-4">
                      <p className="text-xs text-muted-foreground">Rhyme: {verse.rhymeScheme}</p>
                      {verse.lines.map((line: string, j: number) => (
                        <p key={j} className="py-1">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {lyrics.chorus && (
                <div>
                  <h5 className="mb-2 text-sm font-medium text-muted-foreground">Chorus</h5>
                  <p className="text-xs text-muted-foreground">Rhyme: {lyrics.chorus.rhymeScheme}</p>
                  {lyrics.chorus.lines.map((line: string, i: number) => (
                    <p key={i} className="py-1 font-medium">
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {lyrics.stressMap && (
                <div className="mt-4">
                  <h5 className="mb-2 text-sm font-medium text-muted-foreground">Stress Map</h5>
                  <pre className="rounded bg-brand-muted/30 p-3 text-xs">
                    {JSON.stringify(lyrics.stressMap, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}




