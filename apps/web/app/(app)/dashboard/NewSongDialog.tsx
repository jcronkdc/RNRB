'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea
} from '@songforge/ui';
import { useToast } from '../../../components/ui/Toast';
import { createSongAction } from '../../actions/createSong';

type StreamMessage =
  | { type: 'status'; value: 'thinking' | 'writing' | 'finalizing' }
  | { type: 'lyrics'; value: string }
  | { type: 'complete'; value: { songId: string; vocalUrl: string } }
  | { type: 'error'; value: string };

type Stage = 'idle' | 'thinking' | 'writing' | 'stems' | 'finalizing';

const STAGE_LABEL: Record<Exclude<Stage, 'idle'>, string> = {
  thinking: 'Thinking…',
  writing: 'Writing lyrics…',
  stems: 'Generating stems…',
  finalizing: 'Finalizing…'
};

function isReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return typeof value === 'object' && value !== null && 'getReader' in value;
}

export function NewSongDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [lyricsPreview, setLyricsPreview] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const toast = useToast();

  const resetForm = useCallback(() => {
    setTitle('');
    setMood('');
    setPrompt('');
    setLyricsPreview('');
    setStage('idle');
    setErrorMessage(null);
  }, []);

  const handleStream = useCallback(
    async (stream: ReadableStream<Uint8Array>) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let shouldStop = false;

      try {
        while (!shouldStop) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex = buffer.indexOf('\n');
          while (newlineIndex !== -1) {
            const raw = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            newlineIndex = buffer.indexOf('\n');

            if (!raw) continue;

            let message: StreamMessage;
            try {
              message = JSON.parse(raw) as StreamMessage;
            } catch (error) {
              console.warn('Failed to parse stream chunk', error);
              continue;
            }

            switch (message.type) {
              case 'status': {
                setStage(message.value);
                break;
              }
              case 'lyrics': {
                setStage('writing');
                setLyricsPreview(message.value);
                break;
              }
              case 'error': {
                setStage('idle');
                setErrorMessage(message.value);
                toast.push(message.value, { tone: 'error' });
                shouldStop = true;
                break;
              }
              case 'complete': {
                setStage('idle');
                toast.push('New song is ready for review', { tone: 'success' });
                resetForm();
                setOpen(false);
                router.refresh();
                shouldStop = true;
                break;
              }
              default:
                break;
            }

            if (shouldStop) {
              break;
            }
          }
        }
      } finally {
        reader.releaseLock?.();
      }
    },
    [resetForm, router, toast]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsStreaming(true);
    setStage('thinking');
    setLyricsPreview('');
    setErrorMessage(null);

    try {
      const result = await createSongAction(formData);

      if (isReadableStream(result)) {
        await handleStream(result);
      } else if ((result as { type?: string; value?: string })?.type === 'error') {
        const message = (result as { value?: string }).value ?? 'We could not create that song.';
        setErrorMessage(message);
        toast.push(message, { tone: 'error' });
      } else {
        // Fallback for unexpected payloads
        toast.push('New song is ready for review', { tone: 'success' });
        resetForm();
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to create song', error);
      const message = 'We could not create that song.';
      setErrorMessage(message);
      toast.push(message, { tone: 'error' });
    } finally {
      setIsStreaming(false);
    }
  }

  const currentStageLabel = stage === 'idle' ? null : STAGE_LABEL[stage];

  return (
    <Dialog open={open} onOpenChange={(next) => !isStreaming && setOpen(next)}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full px-6 shadow-soft hover:shadow-elevated">
          New Song
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-3xl border-border/60 bg-surface/95 p-0 shadow-elevated backdrop-blur">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-6 p-6"
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-brand-foreground">Prompt a new song</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Describe the vibe and we will seed lyrics, chords, and mix references for your next release.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-song-title">Working title</Label>
              <Input
                id="new-song-title"
                name="title"
                placeholder="Midnight Drive"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                disabled={isStreaming}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-song-mood">Mood tags</Label>
              <Input
                id="new-song-mood"
                name="mood"
                placeholder="moody, analog synthwave, cinematic"
                value={mood}
                onChange={(event) => setMood(event.target.value)}
                disabled={isStreaming}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-song-prompt">Creative prompt</Label>
              <Textarea
                id="new-song-prompt"
                name="prompt"
                placeholder="Start with a restless verse about neon reflections on wet pavement..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                required
                disabled={isStreaming}
              />
            </div>
          </div>

          <div className="space-y-3">
            {currentStageLabel && (
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{currentStageLabel}</p>
            )}
            <div className="min-h-[8rem] rounded-2xl border border-dashed border-border/60 bg-surface/70 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Live lyric preview</p>
              <div className="mt-3 max-h-52 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-brand-foreground">
                {lyricsPreview || (stage !== 'idle' ? 'Waiting for the first line…' : 'Lyrics will appear here as they are generated.')}
              </div>
            </div>
            {errorMessage && <p className="text-sm text-danger-foreground">{errorMessage}</p>}
          </div>

          <DialogFooter className="flex items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isStreaming}>
              Cancel
            </Button>
            <Button type="submit" className="px-6" disabled={isStreaming}>
              {isStreaming ? 'Generating…' : 'Generate draft'}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
