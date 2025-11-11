'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@songforge/ui';

interface Prompt {
  id: string;
  text: string;
  created_at: string;
  status: 'pending' | 'generating' | 'completed';
  lyrics?: any;
}

interface LiveHostClientProps {
  sessionId: string;
}

export function LiveHostClient({ sessionId }: LiveHostClientProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to new prompts
    const channel = supabase
      .channel(`host-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audience_prompts',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setPrompts((prev) => [payload.new as Prompt, ...prev]);
        }
      )
      .subscribe();

    // Load existing prompts
    supabase
      .from('audience_prompts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPrompts(data as Prompt[]);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, supabase]);

  const generateLyrics = async (promptId: string, promptText: string) => {
    setGeneratingId(promptId);

    try {
      const response = await fetch('/api/ai-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      const { lyrics } = await response.json();

      // Update prompt with lyrics
      await supabase
        .from('audience_prompts')
        .update({ lyrics, status: 'completed' })
        .eq('id', promptId);

      // Generate voice preview with ElevenLabs
      if (lyrics.title) {
        await generateVoicePreview(lyrics);
      }
    } catch (error) {
      console.error('Failed to generate lyrics:', error);
    } finally {
      setGeneratingId(null);
    }
  };

  const generateVoicePreview = async (lyrics: any) => {
    // Call ElevenLabs API
    const textToSpeak = lyrics.chorus?.lines?.join(' ') || lyrics.verses?.[0]?.lines?.join(' ') || '';
    
    if (!textToSpeak) return;

    try {
      const response = await fetch('/api/elevenlabs-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
      });

      const { audioUrl } = await response.json();
      return audioUrl;
    } catch (error) {
      console.error('Failed to generate voice:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Live Prompts</h2>
      <div className="space-y-3">
        <AnimatePresence>
          {prompts.map((prompt) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-border/60 bg-surface/80 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{prompt.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(prompt.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {prompt.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => generateLyrics(prompt.id, prompt.text)}
                    disabled={generatingId === prompt.id}
                  >
                    {generatingId === prompt.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
              </div>

              {prompt.lyrics && (
                <div className="mt-4 rounded-lg bg-background p-4">
                  <h4 className="font-semibold">{prompt.lyrics.title}</h4>
                  {prompt.lyrics.chorus?.lines && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Chorus:</p>
                      {prompt.lyrics.chorus.lines.map((line: string, i: number) => (
                        <p key={i} className="py-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

