'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { ArrowLeft, Save, Music, FileText, Mic, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import songwriting tools
const ChordBuilder = dynamic(() => import('@/components/songwriting').then(m => m.ChordBuilder), { ssr: false });
const LyricsAssistant = dynamic(() => import('@/components/songwriting').then(m => m.LyricsAssistant), { ssr: false });

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
    lyrics: '',
    notes: '',
    chordProgression: [] as any[]
  });
  const [activeSection, setActiveSection] = useState<'basics' | 'chords' | 'lyrics'>('basics');

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
      const newSong = {
        id: `song_${Date.now()}`,
        ...songData,
        tempo: songData.tempo ? parseInt(songData.tempo) : null,
        collaborators: 1,
        has_lyrics: !!songData.lyrics,
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
      <div className="rnrb-container max-w-6xl">
        
        <Link href={`/projects/${slug}`} className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Craft Your Song
          </h1>
          <p className="text-xl text-muted-foreground">
            Build your song visually with chords, lyrics, and AI assistance
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {['basics', 'chords', 'lyrics'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section as any)}
              className={`px-6 py-3 font-medium transition capitalize ${
                activeSection === section
                  ? 'border-b-2 border-brand-primary text-brand-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {section === 'basics' && <Music className="w-4 h-4 inline-block mr-2" />}
              {section === 'chords' && <Sparkles className="w-4 h-4 inline-block mr-2" />}
              {section === 'lyrics' && <FileText className="w-4 h-4 inline-block mr-2" />}
              {section}
            </button>
          ))}
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

        {/* Basics Section */}
        {activeSection === 'basics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 mb-6 rnrb-card">
              <h2 className="text-2xl font-semibold mb-6">Song Basics</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Song Title *
              </label>
              <input
                type="text"
                value={songData.title}
                onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                placeholder="Untitled Song"
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Key
                </label>
                <input
                  type="text"
                  value={songData.key}
                  onChange={(e) => setSongData({ ...songData, key: e.target.value })}
                  placeholder="C Major"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  value={songData.tempo}
                  onChange={(e) => setSongData({ ...songData, tempo: e.target.value })}
                  placeholder="120"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Time Signature
                </label>
                <select
                  value={songData.time_signature}
                  onChange={(e) => setSongData({ ...songData, time_signature: e.target.value })}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none transition-all"
                >
                  <option>4/4</option>
                  <option>3/4</option>
                  <option>6/8</option>
                  <option>5/4</option>
                  <option>7/8</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Lyrics (Optional)
              </label>
              <textarea
                value={songData.lyrics}
                onChange={(e) => setSongData({ ...songData, lyrics: e.target.value })}
                placeholder="Verse 1:&#10;Write your lyrics here...&#10;&#10;Chorus:&#10;..."
                rows={12}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none transition-all resize-none font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                value={songData.notes}
                onChange={(e) => setSongData({ ...songData, notes: e.target.value })}
                placeholder="Production notes, arrangement ideas, etc..."
                rows={4}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
            </Card>
          </motion.div>
        )}

        {/* Chords Section */}
        {activeSection === 'chords' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 rnrb-card">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Build Your Chord Progression</h2>
                <p className="text-muted-foreground">
                  Drag and drop chord blocks to arrange your progression. Click "Add Chord" to choose from our library.
                </p>
              </div>
              <ChordBuilder onChange={(chords) => setSongData({ ...songData, chordProgression: chords })} />
            </Card>
          </motion.div>
        )}

        {/* Lyrics Section */}
        {activeSection === 'lyrics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lyrics Editor */}
              <Card className="p-8 rnrb-card">
                <h2 className="text-2xl font-semibold mb-6">Write Your Lyrics</h2>
                <textarea
                  value={songData.lyrics}
                  onChange={(e) => setSongData({ ...songData, lyrics: e.target.value })}
                  placeholder="Write your lyrics here... verse, chorus, bridge..."
                  className="w-full h-[500px] px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition resize-none font-mono text-base leading-relaxed"
                />
              </Card>

              {/* Lyrics Assistant */}
              <Card className="p-8 rnrb-card">
                <h2 className="text-2xl font-semibold mb-6">Writing Tools</h2>
                <LyricsAssistant
                  currentLyrics={songData.lyrics}
                  onInsert={(text) => setSongData({ ...songData, lyrics: songData.lyrics + '\n' + text })}
                />
              </Card>
            </div>
          </motion.div>
        )}

        {/* Save Button (Always Visible) */}
        <div className="flex items-center justify-between mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
            <span>Navigate sections with tabs • Changes save when you click Create Song</span>
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

