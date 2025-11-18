'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import collaborative visual builder
const CollaborativeVisualBuilder = dynamic(() => import('@/components/songwriting').then(m => m.CollaborativeVisualBuilder), { ssr: false });

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
    songStructure: [] as any[]
  });

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      setUser(user);
      const projects = user.user_metadata?.projects || [];
      const foundProject = projects.find((p: any) => p.slug === slug);
      
      if (!foundProject) {
        router.push('/projects');
        return;
      }
      
      setProject(foundProject);
    });
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

      const newSong = {
        id: `song_${Date.now()}`,
        title: songData.title,
        key: songData.key || null,
        tempo: songData.tempo ? parseInt(songData.tempo) : null,
        time_signature: songData.time_signature,
        lyrics,
        songStructure: songData.songStructure,
        collaborators: 1,
        has_lyrics: !!lyrics,
        has_audio: false,
        created_at: new Date().toISOString()
      };

      const allProjects = user.user_metadata?.projects || [];
      const updatedProjects = allProjects.map((p: any) => {
        if (p.slug === slug) {
          return {
            ...p,
            songs: [...(p.songs || []), newSong],
            song_count: (p.song_count || 0) + 1,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects
        }
      });

      if (error) throw error;

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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="rnrb-container max-w-7xl">
        
        <Link href={`/projects/${slug}`} className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Link>

        {/* Song Title & Metadata (Always Visible) */}
        <Card className="p-6 rnrb-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Song Title *</label>
              <input
                type="text"
                value={songData.title}
                onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                placeholder="Untitled Song"
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground text-lg font-semibold focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Key</label>
              <input
                type="text"
                value={songData.key}
                onChange={(e) => setSongData({ ...songData, key: e.target.value })}
                placeholder="C Major"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tempo</label>
              <input
                type="number"
                value={songData.tempo}
                onChange={(e) => setSongData({ ...songData, tempo: e.target.value })}
                placeholder="120"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
              />
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold mb-2">
            Build Your Song Visually
          </h1>
          <p className="text-muted-foreground">
            Drag blocks from the left palette to create your song structure. Add verses, choruses, bridges, and chords.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Collaborative Visual Builder - Complete Interface */}
        <CollaborativeVisualBuilder
          projectSlug={slug}
          onSongChange={(blocks) => setSongData({ ...songData, songStructure: blocks })}
        />

        {/* Save Button (Always Visible) */}
        <div className="flex items-center justify-between mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
            <span>Drag blocks from left palette to build song • Changes save when you click Create Song</span>
          </div>
          <div className="flex gap-4">
            <Link href={`/projects/${slug}`}>
              <Button variant="secondary" className="px-6 py-3 rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving || !songData.title.trim()}
              className="rnrb-button-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Creating...' : 'Create Song'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
