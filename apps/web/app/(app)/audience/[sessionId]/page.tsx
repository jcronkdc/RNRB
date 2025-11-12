'use client';

import { Button } from '@cronkwater/ui';
import { Send } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '../../../../lib/supabase/client';


export default function AudiencePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [prompt, setPrompt] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const submitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const { error } = await supabase.from('audience_prompts').insert({
      session_id: sessionId,
      text: prompt,
      status: 'pending',
    });

    if (error) {
      console.error('Failed to submit prompt:', error);
      return;
    }

    setSubmitted(true);
    setPrompt('');
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Prompt Submitted!</h1>
          <p className="mt-2 text-muted-foreground">Your prompt will appear on the host screen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-surface/80 p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Submit a Prompt</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Describe the song you want to hear generated
          </p>
        </div>

        <form onSubmit={submitPrompt} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'sad breakup song with a hopeful chorus'"
            className="w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
            rows={4}
            required
          />

          <Button type="submit" className="w-full">
            <Send className="h-4 w-4" />
            Submit Prompt
          </Button>
        </form>
      </div>
    </div>
  );
}

