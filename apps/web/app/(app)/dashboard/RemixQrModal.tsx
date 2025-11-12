'use client';

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label } from '@cronkwater/ui';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { useMemo, useState } from 'react';

import { useToast } from '../../../components/ui/Toast';

interface RemixQrModalProps {
  roomId: string;
  songTitle: string;
}

export function RemixQrModal({ roomId, songTitle }: RemixQrModalProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://songforge.example';
  const remixUrl = useMemo(() => `${origin}/remix/${roomId}`, [origin, roomId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(remixUrl);
      toast.push('Remix room link copied to clipboard.', { tone: 'success' });
    } catch (error) {
      console.error('Failed to copy remix URL', error);
      toast.push('Could not copy link. Try selecting it manually.', { tone: 'error' });
    }
  };

  const handleShare = async () => {
    if (!('share' in navigator)) {
      handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: `${songTitle} · Remix Live`,
        url: remixUrl
      });
      toast.push('Link shared.', { tone: 'success' });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="rounded-full">
          Remix Live
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border border-border/60 bg-surface/95 p-0 shadow-elevated backdrop-blur">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6 p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-brand-foreground">Remix “{songTitle}” Live</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Share this QR code with your audience. Phones join instantly to feed remix prompts in real time.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div className="rounded-3xl border border-border/60 bg-surface p-4 shadow-soft">
              <QRCode value={remixUrl} size={220} renderAs="svg" includeMargin={false} />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="remix-url" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Direct link
              </Label>
              <Input id="remix-url" value={remixUrl} readOnly className="font-mono text-sm" />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={handleShare}>
              Share link
            </Button>
            <Button type="button" className="px-6" onClick={handleCopy}>
              Copy link
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
