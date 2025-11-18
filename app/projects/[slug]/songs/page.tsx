'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { Plus, Music, Edit, Trash2, Play, Users, FileText, ArrowLeft, MessageSquare } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading songs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-6xl relative z-10 py-12 px-4">
          <Link href={`/projects/${slug}`} className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Music className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Songs in</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">{project.name}</h1>
              </div>
            </div>
            <Link href={`/projects/${slug}/songs/new`}>
              <Button className="rnrb-button-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Song
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rnrb-container max-w-6xl py-12 px-4">
        {songs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rnrb-card p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Music className="w-8 h-8 text-brand-primary" />
            </div>
            
            <h2 className="text-3xl font-display font-bold mb-4">
              No Songs Yet
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Songs are the creative output of your project—collaborate with others to write, record, and refine each track
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left max-w-3xl mx-auto">
              <div className="rnrb-card p-4 bg-brand-primary/5 border-brand-primary/20">
                <Music className="w-6 h-6 text-brand-primary mb-3" />
                <p className="font-semibold mb-2">Write & Record</p>
                <p className="text-sm text-muted-foreground">
                  Store lyrics, chords, and audio files
                </p>
              </div>
              <div className="rnrb-card p-4 bg-brand-primary/5 border-brand-primary/20">
                <MessageSquare className="w-6 h-6 text-brand-primary mb-3" />
                <p className="font-semibold mb-2">Collaborate</p>
                <p className="text-sm text-muted-foreground">
                  Chat and video sessions per song
                </p>
              </div>
              <div className="rnrb-card p-4 bg-brand-primary/5 border-brand-primary/20">
                <Users className="w-6 h-6 text-brand-primary mb-3" />
                <p className="font-semibold mb-2">Track Credits</p>
                <p className="text-sm text-muted-foreground">
                  Manage collaborators and splits
                </p>
              </div>
            </div>

            <Link href={`/projects/${slug}/songs/new`}>
              <Button className="rnrb-button-primary px-8 py-4 flex items-center gap-2 mx-auto">
                <Plus className="w-6 h-6" />
                Create Your First Song
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="rnrb-card p-6 rnrb-hover-lift cursor-pointer group hover:border-brand-primary/30">
                  <div className="flex items-center justify-between">
                    <Link href={`/projects/${slug}/songs/${song.id}`} className="flex-1">
                      <div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-primary transition">{song.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {song.key && <span className="flex items-center gap-1">Key: {song.key}</span>}
                          {song.tempo && <span className="flex items-center gap-1">{song.tempo} BPM</span>}
                          {song.duration && <span className="flex items-center gap-1">
                            {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                          </span>}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {song.collaborators} {song.collaborators === 1 ? 'collaborator' : 'collaborators'}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      {song.has_audio && (
                        <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                          <Play className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      {song.has_lyrics && (
                        <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                      <Link href={`/projects/${slug}/songs/${song.id}`}>
                        <Button variant="secondary" size="sm" className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
