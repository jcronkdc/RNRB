'use client';

import { Card, Button } from '@cronkwaters/ui';
import { Plus, Music, Edit, Play, Users, FileText } from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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
  const { data: session, status: authStatus } = useSession();
  const slug = params?.slug as string;
  const [project, setProject] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth');
      return;
    }

    const loadData = async () => {
      try {
        // Fetch project and its songs from the API
        const [projectRes, songsRes] = await Promise.all([
          fetch(`/api/projects/${slug}`),
          fetch(`/api/projects/${slug}/songs`),
        ]);

        if (!projectRes.ok) {
          router.push('/projects');
          return;
        }

        const projectData = await projectRes.json();
        setProject(projectData);

        if (songsRes.ok) {
          const songsData = await songsRes.json();
          setSongs(songsData.songs || songsData || []);
        }
      } catch (error) {
        console.error('Error loading project songs:', error);
        router.push('/projects');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, slug, session, authStatus]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <div style={{ color: 'var(--muted)' }}>Loading songs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="container mx-auto max-w-6xl">
        {/* Logo */}
        <div className="mb-6">
          <Link href="/dashboard" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={48}
              height={48}
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold" style={{ color: 'var(--text)' }}>
              Songs
            </h1>
            <p className="text-xl" style={{ color: 'var(--muted)' }}>
              Creative threads branching from{' '}
              <span style={{ color: 'var(--accent)' }}>{project.name}</span>
            </p>
          </div>
          <Link href={`/projects/${slug}/songs/new`}>
            <Button
              className="flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
            >
              <Plus className="h-5 w-5" />
              New Song
            </Button>
          </Link>
        </div>

        {songs.length === 0 ? (
          <Card
            className="p-12 text-center"
            style={{
              background:
                'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid var(--border)',
            }}
          >
            <Music className="mx-auto mb-4 h-16 w-16" style={{ color: 'var(--accent)' }} />
            <h2 className="mb-4 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              No songs yet
            </h2>
            <p className="mx-auto mb-6 max-w-2xl" style={{ color: 'var(--muted)' }}>
              Songs are the creative threads that make up your project. Each song carries lyrics,
              chords, collaborators, and revenue - all interconnected.
            </p>
            <Link href={`/projects/${slug}/songs/new`}>
              <Button
                className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold text-white"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
              >
                <Plus className="h-6 w-6" />
                Create Your First Song
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <Card
                key={song.id}
                className="p-6 transition hover:shadow-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                      {song.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                      {song.key && <span>Key: {song.key}</span>}
                      {song.tempo && <span>{song.tempo} BPM</span>}
                      {song.duration && (
                        <span>
                          {Math.floor(song.duration / 60)}:
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
