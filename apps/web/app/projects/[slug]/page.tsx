'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  Music,
  Plus,
  Users,
  Calendar,
  Settings,
  FileText,
  Lock,
  Globe,
  ArrowLeft,
  MessageSquare,
  ArrowRight,
  Palette,
  Sparkles,
} from '@/components/ui/custom-icons';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const MilestoneTimeline = dynamic(
  () => import('@/components/milestone-timeline').then((m) => m.MilestoneTimeline),
  { ssr: false }
);

const ArtworkGenerator = dynamic(
  () => import('@/components/songwriting/artwork-generator').then((m) => m.ArtworkGenerator),
  { ssr: false }
);

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params?.slug as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showArtworkModal, setShowArtworkModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth');
      return;
    }

    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${slug}`);
        if (!response.ok) {
          router.push('/projects');
          return;
        }
        const foundProject = await response.json();
        setProject(foundProject);
      } catch (error) {
        console.error('Error loading project:', error);
        router.push('/projects');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [router, slug, session, status]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-mono text-sm"
          style={{ color: 'var(--muted)' }}
        >
          Loading project...
        </motion.div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-linear-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-(--accent)/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-(--accent)/5 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <Link
              href="/projects"
              className="mb-6 inline-flex items-center gap-2 text-(--muted) transition-colors hover:text-(--accent)"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-xs tracking-wider uppercase">All Projects</span>
            </Link>

            {/* Project Header */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Cover Art */}
                <div className="from-brand-primary/20 to-brand-primary/5 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br">
                  {project.cover_image ? (
                    <img
                      src={project.cover_image}
                      alt={project.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Music className="h-10 w-10 text-(--accent)/50" />
                  )}
                </div>

                {/* Project Info */}
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="font-display text-3xl font-bold text-(--text) md:text-4xl">
                      {project.name}
                    </h1>
                    {project.visibility === 'private' && (
                      <span className="flex items-center gap-1 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-sm text-(--muted)">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                    {project.visibility === 'public' && (
                      <span className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm text-green-500">
                        <Globe className="h-3 w-3" />
                        Public
                      </span>
                    )}
                  </div>
                  {project.description && <p className="text-(--muted)">{project.description}</p>}
                </div>
              </div>

              <Link href={`/projects/${slug}/settings`}>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rnrb-card p-4">
                <p className="mb-1 text-sm text-(--muted)">Songs</p>
                <p className="text-2xl font-bold">{project.song_count || 0}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="mb-1 text-sm text-(--muted)">Collaborators</p>
                <p className="text-2xl font-bold">{project.collaborator_count || 1}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="mb-1 text-sm text-(--muted)">Sessions</p>
                <p className="text-2xl font-bold">{project.session_count || 0}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="mb-1 text-sm text-(--muted)">Revenue</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <Link href={`/projects/${slug}/songs/new`}>
            <div className="rnrb-card rnrb-hover-lift group hover:border-brand-primary/50 h-full cursor-pointer border border-(--border) p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent)/10 transition-colors group-hover:bg-(--accent)/20">
                  <Music className="h-6 w-6 text-(--accent)" />
                </div>
                <ArrowRight className="h-5 w-5 text-(--muted) transition-all group-hover:translate-x-1 group-hover:text-(--accent)" />
              </div>
              <h3 className="mb-1 font-semibold">Add Song</h3>
              <p className="text-xs text-(--muted)">Create new track</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/collaborate`}>
            <div className="rnrb-card rnrb-hover-lift group hover:border-brand-primary/50 h-full cursor-pointer border border-(--border) p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent)/10 transition-colors group-hover:bg-(--accent)/20">
                  <MessageSquare className="h-6 w-6 text-(--accent)" />
                </div>
                <ArrowRight className="h-5 w-5 text-(--muted) transition-all group-hover:translate-x-1 group-hover:text-(--accent)" />
              </div>
              <h3 className="mb-1 font-semibold">Collaborate</h3>
              <p className="text-xs text-(--muted)">Chat & video</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/sessions`}>
            <div className="rnrb-card rnrb-hover-lift group hover:border-brand-primary/50 h-full cursor-pointer border border-(--border) p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent)/10 transition-colors group-hover:bg-(--accent)/20">
                  <Calendar className="h-6 w-6 text-(--accent)" />
                </div>
                <ArrowRight className="h-5 w-5 text-(--muted) transition-all group-hover:translate-x-1 group-hover:text-(--accent)" />
              </div>
              <h3 className="mb-1 font-semibold">Sessions</h3>
              <p className="text-xs text-(--muted)">Track work</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/setlists`}>
            <div className="rnrb-card rnrb-hover-lift group hover:border-brand-primary/50 h-full cursor-pointer border border-(--border) p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent)/10 transition-colors group-hover:bg-(--accent)/20">
                  <FileText className="h-6 w-6 text-(--accent)" />
                </div>
                <ArrowRight className="h-5 w-5 text-(--muted) transition-all group-hover:translate-x-1 group-hover:text-(--accent)" />
              </div>
              <h3 className="mb-1 font-semibold">Setlists</h3>
              <p className="text-xs text-(--muted)">For gigs</p>
            </div>
          </Link>
        </motion.div>

        {/* Project Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Songs (Main Column) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6 lg:col-span-2"
          >
            <Card className="rnrb-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-(--text)">
                  <Music className="h-6 w-6 text-(--accent)" />
                  Songs
                </h2>
                <Link href={`/projects/${slug}/songs/new`}>
                  <Button className="rnrb-button-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Song
                  </Button>
                </Link>
              </div>

              {(project.song_count || 0) === 0 ? (
                <div className="py-12 text-center">
                  <Music className="mx-auto mb-4 h-16 w-16 text-(--accent)/30" />
                  <p className="mb-2 text-(--muted)">No songs yet</p>
                  <p className="mb-6 text-sm text-(--muted)">
                    Create your first song to get started with this project
                  </p>
                  <Link href={`/projects/${slug}/songs/new`}>
                    <Button className="rnrb-button-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Song
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(project.songs || []).map((song: any, index: number) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={`/projects/${slug}/songs/${song.id}`}>
                        <div className="hover:bg-[color:var(--surface)]-muted group hover:border-brand-primary/50 cursor-pointer rounded-xl border border-(--border) bg-(--surface) p-4 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent)/10">
                                <Music className="h-5 w-5 text-(--accent)" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-(--text) transition-colors group-hover:text-(--accent)">
                                  {song.title}
                                </h4>
                                <p className="text-sm text-(--muted)">
                                  {song.key && `${song.key} • `}
                                  {song.tempo && `${song.tempo} BPM`}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-(--muted) transition-all group-hover:translate-x-1 group-hover:text-(--accent)" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            {/* Project Roadmap / Milestones */}
            <Card className="rnrb-card p-6">
              <MilestoneTimeline
                projectSlug={slug}
                onMilestoneClick={(milestoneId) => {
                  // TODO: Navigate to milestone detail or open modal
                }}
              />
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            {/* Team Members */}
            <Card className="rnrb-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-(--text)">
                <Users className="h-5 w-5 text-(--accent)" />
                Team Members
              </h3>
              <div className="space-y-3">
                <div className="bg-[color:var(--surface)]-muted flex items-center gap-3 rounded-lg border border-(--border) p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent)/20 font-semibold text-(--text)">
                    {session?.user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--text)">You</p>
                    <p className="text-xs text-(--muted)">Owner</p>
                  </div>
                </div>
                <Link href={`/projects/${slug}/collaborate`}>
                  <Button variant="secondary" className="w-full" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Members
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Album Cover */}
            <Card className="rnrb-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-(--text)">
                <Palette className="h-5 w-5 text-pink-400" />
                Album Cover
              </h3>
              <div className="mb-4">
                {project.cover_image ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-(--border)">
                    <img
                      src={project.cover_image}
                      alt="Album cover"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <Button
                        size="sm"
                        onClick={() => setShowArtworkModal(true)}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate New
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowArtworkModal(true)}
                    className="bg-[color:var(--surface)]-muted/50 group flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border) transition-all hover:border-purple-500/50"
                  >
                    <Palette className="mb-2 h-10 w-10 text-(--muted) transition-colors group-hover:text-purple-400" />
                    <p className="text-sm text-(--muted) transition-colors group-hover:text-(--text)">
                      Generate Cover
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="secondary"
                className="w-full"
                size="sm"
                onClick={() => setShowArtworkModal(true)}
              >
                <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                AI Album Art
              </Button>
            </Card>

            {/* Quick Links */}
            <Card className="rnrb-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-(--text)">Quick Links</h3>
              <div className="space-y-2">
                <Link href={`/projects/${slug}/collaborate`}>
                  <button className="hover:bg-[color:var(--surface)]-muted flex w-full items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-left transition-colors">
                    <MessageSquare className="h-4 w-4 text-(--accent)" />
                    <span className="text-sm">Project Chat</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/sessions`}>
                  <button className="hover:bg-[color:var(--surface)]-muted flex w-full items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-left transition-colors">
                    <Calendar className="h-4 w-4 text-(--accent)" />
                    <span className="text-sm">View Sessions</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/setlists`}>
                  <button className="hover:bg-[color:var(--surface)]-muted flex w-full items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-left transition-colors">
                    <FileText className="h-4 w-4 text-(--accent)" />
                    <span className="text-sm">Setlists</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/settings`}>
                  <button className="hover:bg-[color:var(--surface)]-muted flex w-full items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-left transition-colors">
                    <Settings className="h-4 w-4 text-(--accent)" />
                    <span className="text-sm">Settings</span>
                  </button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Album Artwork Modal */}
      {showArtworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-(--border) bg-(--bg) p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display flex items-center gap-2 text-xl font-bold">
                <Palette className="h-5 w-5 text-pink-400" />
                Generate Album Cover
              </h2>
              <button
                onClick={() => setShowArtworkModal(false)}
                className="text-(--muted) transition-colors hover:text-(--text)"
              >
                ✕
              </button>
            </div>
            <ArtworkGenerator
              songTitle={project.name}
              artistName={session?.user?.name || session?.user?.email?.split('@')[0]}
              genre={project.genre}
              currentArtwork={project.cover_image}
              onArtworkSelect={async (url, prompt, style) => {
                try {
                  const response = await fetch(`/api/projects/${slug}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      cover_image: url,
                      coverImagePrompt: prompt,
                      coverImageStyle: style,
                    }),
                  });
                  if (response.ok) {
                    setProject((prev: any) => ({ ...prev, cover_image: url }));
                    setShowArtworkModal(false);
                  }
                } catch (err) {
                  console.error('Failed to save album cover:', err);
                }
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
