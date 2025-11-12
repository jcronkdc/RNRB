'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Slider } from '@cronkwater/ui';
import { Users, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { useToast } from '../../../components/ui/Toast';

interface RemixRoomClientProps {
  roomId: string;
  song: {
    id: string;
    title: string;
    stems: Array<{ type: string; url: string }>;
  };
}

interface StemState {
  type: string;
  volume: number;
}

function generateInitialStemState(stems: Array<{ type: string }>): StemState[] {
  if (!stems.length) {
    return [
      { type: 'vocals', volume: 70 },
      { type: 'drums', volume: 65 },
      { type: 'bass', volume: 60 },
      { type: 'melody', volume: 68 }
    ];
  }

  return stems.map((stem) => ({ type: stem.type, volume: 65 }));
}

export function RemixRoomClient({ roomId, song }: RemixRoomClientProps) {
  const toast = useToast();
  const [stemState, setStemState] = useState<StemState[]>(() => generateInitialStemState(song.stems));
  const [listenerCount, setListenerCount] = useState(1);
  const [exportName, setExportName] = useState(`${song.title} – Live Remix`);
  const [isSubmitting, startTransition] = useTransition();

  const broadcastKey = useMemo(() => `remix-room-${roomId}`, [roomId]);

  useEffect(() => {
    const channel = new BroadcastChannel(broadcastKey);

    channel.onmessage = (event) => {
      const payload = event.data;
      if (!payload || typeof payload !== 'object') return;

      if (payload.type === 'volume-update' && Array.isArray(payload.state)) {
        setStemState(payload.state as StemState[]);
      }

      if (payload.type === 'listener-update' && typeof payload.count === 'number') {
        setListenerCount(payload.count);
      }
    };

    const interval = setInterval(() => {
      channel.postMessage({ type: 'listener-update', count: Math.max(1, listenerCount + Math.floor(Math.random() * 3) - 1) });
    }, 5000);

    return () => {
      clearInterval(interval);
      channel.close();
    };
  }, [broadcastKey, listenerCount]);

  const updateVolume = (type: string, volume: number[]) => {
    setStemState((prev) => {
      const next = prev.map((stem) => (stem.type === type ? { ...stem, volume: volume[0] ?? stem.volume } : stem));
      const channel = new BroadcastChannel(broadcastKey);
      channel.postMessage({ type: 'volume-update', state: next });
      channel.close();
      return next;
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.push(`Remix “${exportName}” exported as a new draft.`, { tone: 'success' });
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-border/60 bg-surface">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg text-brand-foreground">Live Mixer</CardTitle>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Room · {roomId}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-surface/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" /> {listenerCount} listeners
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {stemState.map((stem) => (
            <div key={stem.type} className="rounded-2xl border border-border/60 bg-surface-muted/60 p-4">
              <div className="flex items-center justify-between text-sm font-medium text-brand-foreground">
                <span className="uppercase tracking-[0.3em]">{stem.type}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Volume2 className="h-4 w-4" aria-hidden="true" />{stem.volume}%
                </span>
              </div>
              <Slider
                value={[stem.volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => updateVolume(stem.type, value)}
                className="mt-4"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border/60 bg-surface">
        <CardHeader>
          <CardTitle className="text-lg text-brand-foreground">Export remix draft</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remix-export-name">Draft name</Label>
            <Input
              id="remix-export-name"
              value={exportName}
              onChange={(event) => setExportName(event.target.value)}
              placeholder="New Remix Draft"
              disabled={isSubmitting}
            />
          </div>
          <Button className="rounded-full" disabled={isSubmitting} onClick={handleExport}>
            {isSubmitting ? 'Exporting…' : 'Export live remix'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
