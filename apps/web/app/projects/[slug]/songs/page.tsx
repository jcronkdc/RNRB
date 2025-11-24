'use client';

import { Card, Button } from '@cronkwaters/ui';
import { Plus, Music, Edit, Play, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

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
      <div className="from-background via-surface/20 to-background flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="text-foreground">Loading songs...</div>
      </div>
    );
  }

  return (
    <div className="from-background via-surface/20 to-background min-h-screen bg-gradient-to-b px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-2 text-4xl font-bold">Songs</h1>
            <p className="text-muted-foreground text-xl">
              Creative threads branching from{' '}
              <span className="text-brand-primary">{project.name}</span>
            </p>
          </div>
          <Link href={`/projects/${slug}/songs/new`}>
            <Button className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 font-semibold">
              <Plus className="h-5 w-5" />
              New Song
            </Button>
          </Link>
        </div>

        {songs.length === 0 ? (
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-12 text-center">
            <Music className="text-brand-primary mx-auto mb-4 h-16 w-16" />
            <h2 className="text-foreground mb-4 text-2xl font-semibold">No songs yet</h2>
            <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
              Songs are the creative threads that make up your project. Each song carries lyrics,
              chords, collaborators, and revenue - all interconnected.
            </p>
            <Link href={`/projects/${slug}/songs/new`}>
              <Button className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold">
                <Plus className="h-6 w-6" />
                Create Your First Song
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <Card key={song.id} className="p-6 transition hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-foreground mb-2 text-xl font-semibold">{song.title}</h3>
                    <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                      {song.key && <span>Key: {song.key}</span>}
                      {song.tempo && <span>⏱️ {song.tempo} BPM</span>}
                      {song.duration && (
                        <span>
                          ⏱️ {Math.floor(song.duration / 60)}:
                          {String(song.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {song.collaborators} collaborators
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {song.has_audio && <Play className="h-5 w-5 text-green-500" />}
                    {song.has_lyrics && <FileText className="h-5 w-5 text-blue-500" />}
                    <Link href={`/projects/${slug}/songs/${song.id}`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="h-4 w-4" />
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
