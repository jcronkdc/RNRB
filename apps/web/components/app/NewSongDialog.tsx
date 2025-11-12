'use client';

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@cronkwaters/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';

interface NewSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (song: { title: string; key?: string; tempo?: number }) => void | Promise<void>;
}

export default function NewSongDialog({ open, onOpenChange, onCreate }: NewSongDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [tempo, setTempo] = useState<number | ''>('');

  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
    } else {
      formRef.current?.reset();
      setTempo('');
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = (data.get('title') as string)?.trim();
    if (!title) {
      titleRef.current?.focus();
      return;
    }
    const key = (data.get('key') as string)?.trim() || undefined;
    const tempoValue = data.get('tempo');
    const parsedTempo = tempoValue ? Number(tempoValue) : undefined;

    await onCreate?.({
      title,
      key,
      tempo: Number.isFinite(parsedTempo) ? parsedTempo : undefined
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-surface shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-brand-foreground">New song</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Log a track, lyric idea, or session so your collaborators know what’s in motion.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="song-title">Title</Label>
            <Input id="song-title" name="title" placeholder="Working title" ref={titleRef} required autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="song-key">Key</Label>
            <Input id="song-key" name="key" placeholder="e.g. C minor" autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="song-tempo">Tempo (BPM)</Label>
            <Input
              id="song-tempo"
              name="tempo"
              type="number"
              min={40}
              max={240}
              step={1}
              value={tempo}
              onChange={(event) => setTempo(event.target.value ? Number(event.target.value) : '')}
              placeholder="120"
              inputMode="numeric"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create song</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
