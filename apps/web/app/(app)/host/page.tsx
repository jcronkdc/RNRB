'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@songforge/ui';
import { Copy, Check } from 'lucide-react';
import { LiveHostClient } from './LiveHostClient';

export default function HostPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const initSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Create or get session
      const { data, error } = await supabase
        .from('host_sessions')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error && error.code !== '23505') {
        console.error('Failed to create session:', error);
        return;
      }

      // Get existing session if already exists
      if (error?.code === '23505') {
        const { data: existing } = await supabase
          .from('host_sessions')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existing) {
          setSessionId(existing.id);
        }
      } else if (data) {
        setSessionId(data.id);
      }
    };

    initSession();
  }, [supabase]);

  const audienceUrl = sessionId
    ? `${window.location.origin}/audience/${sessionId}`
    : '';

  const copyUrl = () => {
    navigator.clipboard.writeText(audienceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sessionId) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Live Host Mode</h1>
        <p className="mt-2 text-muted-foreground">Share the QR code for audience prompts</p>
      </div>

      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-xl border border-border/60 bg-surface/80 p-8 shadow-soft">
        <QRCodeSVG value={audienceUrl} size={256} />
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={audienceUrl}
              readOnly
              className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            />
            <Button onClick={copyUrl} size="icon">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Scan or share this URL for audience to submit prompts
          </p>
        </div>
      </div>

      <LiveHostClient sessionId={sessionId} />
    </div>
  );
}

