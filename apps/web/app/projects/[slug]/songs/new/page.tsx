'use client';

import { Card, Button } from '@cronkwaters/ui';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

// Dynamically import collaborative visual builder
const CollaborativeVisualBuilder = dynamic(
  () => import('@/components/songwriting').then((m) => m.CollaborativeVisualBuilder),
  { ssr: false }
);

export default function NewSongPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [songData, setSongData] = useState({
    title: '',
    key: '',
    tempo: '',
    time_signature: '4/4',
    songStructure: [] as any[],
  });

  useEffect(() => {
    const loadProject = async () => {
      const {
        data: { user },
      } = await supabase!.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);

      // Load project from API
      try {
        const response = await fetch(`/api/projects/${slug}?userId=${user.id}`);
        if (!response.ok) {
          router.push('/projects');
          return;
        }

        const foundProject = await response.json();
        setProject(foundProject);
      } catch (error) {
        console.error('Error loading project:', error);
        router.push('/projects');
      }
    };

    loadProject();
  }, [router, slug]);

  const handleSave = async () => {
    if (!songData.title.trim()) {
      setMessage({ type: 'error', text: 'Song title required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Extract lyrics from song structure blocks
      const lyrics = songData.songStructure
        .map((block: any) => block.content)
        .filter((c: string) => c.trim())
        .join('\n\n');

      // Extract chords from song structure
      const chords = songData.songStructure
        .flatMap((block: any) => block.chords || [])
        .filter((c: any) => c);

      // Create song via API
      const response = await fetch(`/api/projects/${slug}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: songData.title,
          key: songData.key || null,
          tempo: songData.tempo || null,
          timeSignature: songData.time_signature,
          lyrics,
          chords: chords.length > 0 ? chords : null,
          songStructure: songData.songStructure,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create song');
      }

      const newSong = await response.json();

      setMessage({ type: 'success', text: 'Song created! Redirecting...' });
      setTimeout(() => {
        router.push(`/projects/${slug}/songs/${newSong.id}`);
      }, 1000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="rnrb-container max-w-7xl">
        <Link
          href={`/projects/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-brand-primary transition hover:text-brand-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        {/* Song Title & Metadata (Always Visible) */}
        <Card className="rnrb-card mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Song Title *</label>
              <input
                type="text"
                value={songData.title}
                onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                placeholder="Untitled Song"
                className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-lg font-semibold text-foreground outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Key</label>
              <input
                type="text"
                value={songData.key}
                onChange={(e) => setSongData({ ...songData, key: e.target.value })}
                placeholder="C Major"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tempo</label>
              <input
                type="number"
                value={songData.tempo}
                onChange={(e) => setSongData({ ...songData, tempo: e.target.value })}
                placeholder="120"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <h1 className="font-display mb-2 text-3xl font-bold">Build Your Song Visually</h1>
          <p className="text-muted-foreground">
            Drag blocks from the left palette to create your song structure. Add verses, choruses,
            bridges, and chords.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              message.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-green-400'
                : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Collaborative Visual Builder - Complete Interface */}
        {user && (
          <CollaborativeVisualBuilder
            projectSlug={slug}
            onSongChange={(blocks) => setSongData({ ...songData, songStructure: blocks })}
            currentUser={{
              userId: user.id,
              userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            }}
          />
        )}

        {/* Save Button (Always Visible) */}
        <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-xl border border-border bg-background/80 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>
              Drag blocks from left palette to build song • Changes save when you click Create Song
            </span>
          </div>
          <div className="flex gap-4">
            <Link href={`/projects/${slug}`}>
              <Button variant="secondary" className="rounded-xl px-6 py-3">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving || !songData.title.trim()}
              className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-3 font-semibold disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Creating...' : 'Create Song'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
