'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { Plus, Music, Edit, Trash2, Play, Users, DollarSign, FileText } from 'lucide-react';
import Link from 'next/link';

type Song = {
  id: string;
  title: string;
  key?: string;
  tempo?: number;
  duration?: number;
  collaborators: number;
  has_lyrics: boolean;
  has_audio: boolean;
  created_at: string;
};

export default function ProjectSongsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

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
      setSongs(foundProject.songs || []);
      setLoading(false);
    });
  }, [router, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-surface/20 to-background">
        <div className="text-foreground">Loading songs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Songs
            </h1>
            <p className="text-xl text-muted-foreground">
              Creative threads branching from <span className="text-brand-primary">{project.name}</span>
            </p>
          </div>
          <Link href={`/projects/${slug}/songs/new`}>
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Song
            </Button>
          </Link>
        </div>

        {songs.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <Music className="w-16 h-16 text-brand-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No songs yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Songs are the creative threads that make up your project. 
              Each song carries lyrics, chords, collaborators, and revenue - all interconnected.
            </p>
            <Link href={`/projects/${slug}/songs/new`}>
              <Button className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center gap-3">
                <Plus className="w-6 h-6" />
                Create Your First Song
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <Card key={song.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{song.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {song.key && <span>Key: {song.key}</span>}
                      {song.tempo && <span>⏱️ {song.tempo} BPM</span>}
                      {song.duration && <span>⏱️ {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>}
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {song.collaborators} collaborators
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {song.has_audio && <Play className="w-5 h-5 text-green-500" />}
                    {song.has_lyrics && <FileText className="w-5 h-5 text-blue-500" />}
                    <Link href={`/projects/${slug}/songs/${song.id}`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

