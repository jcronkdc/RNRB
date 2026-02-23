'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import { Lock, Users, Globe, Sparkles, ArrowLeft, Folder } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    tagline: '',
    visibility: 'private' as 'private' | 'org' | 'public',
    cover_image: '',
    genre: '',
    target_release_date: '',
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      setMessage({ type: 'error', text: 'Project name is required' });
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      // Create project via API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          name: projectData.name,
          description: projectData.description,
          tagline: projectData.tagline,
          visibility: projectData.visibility,
          coverImage: projectData.cover_image,
          genre: projectData.genre,
          targetReleaseDate: projectData.target_release_date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const newProject = await response.json();

      setMessage({ type: 'success', text: 'Project created! Redirecting...' });

      setTimeout(() => {
        router.push(`/projects/${newProject.slug}`);
      }, 1000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create project' });
      setCreating(false);
    }
  };

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
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-linear-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-(--accent)/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-(--accent)/5 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-4xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/projects"
              className="mb-6 inline-flex items-center gap-2 text-(--muted) transition-colors hover:text-(--accent)"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-xs tracking-wider uppercase">Back to Projects</span>
            </Link>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent)/10">
                <Folder className="h-6 w-6 text-(--accent)" />
              </div>
              <div>
                <p className="text-sm text-(--muted)">Create New</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Project</h1>
              </div>
            </div>
            <p className="text-lg text-(--muted)">
              Organize your songs, collaborate with your team, and build your music career
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-4xl px-4 py-12">
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === 'success'
                ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                : 'border border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Project Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rnrb-card mb-6 p-8">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  placeholder="My Debut Album"
                  className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-lg text-(--text) transition focus:ring-2 focus:outline-hidden"
                />
                <p className="mt-1 text-xs text-(--muted)">
                  {projectData.name && `URL: /projects/${generateSlug(projectData.name)}`}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">Tagline</label>
                <input
                  type="text"
                  value={projectData.tagline}
                  onChange={(e) => setProjectData({ ...projectData, tagline: e.target.value })}
                  placeholder="The album that changed everything"
                  className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-(--text) transition focus:ring-2 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">Description</label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  placeholder="Describe your project, its vision, the story behind it..."
                  rows={4}
                  className="focus:border-brand-primary focus:ring-brand-primary/20 w-full resize-none rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-(--text) transition focus:ring-2 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">Genre</label>
                  <input
                    type="text"
                    value={projectData.genre}
                    onChange={(e) => setProjectData({ ...projectData, genre: e.target.value })}
                    placeholder="Rock, Jazz, Hip-Hop..."
                    className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-(--text) transition focus:ring-2 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">
                    Target Release Date
                  </label>
                  <input
                    type="date"
                    value={projectData.target_release_date}
                    onChange={(e) =>
                      setProjectData({ ...projectData, target_release_date: e.target.value })
                    }
                    className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-(--text) transition focus:ring-2 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="rnrb-card mb-6 p-8">
            <h2 className="mb-6 text-2xl font-semibold">Privacy & Access</h2>

            <div className="space-y-4">
              <button
                onClick={() => setProjectData({ ...projectData, visibility: 'private' })}
                className={`w-full rounded-xl border-2 p-4 text-left transition ${
                  projectData.visibility === 'private'
                    ? 'border-brand-primary bg-(--accent)/10'
                    : 'hover:border-brand-primary/50 border-(--border) bg-(--surface)'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Lock
                    className={`mt-1 h-5 w-5 ${
                      projectData.visibility === 'private' ? 'text-(--accent)' : 'text-(--muted)'
                    }`}
                  />
                  <div>
                    <p className="mb-1 font-semibold text-(--text)">Private</p>
                    <p className="text-sm text-(--muted)">
                      Only you can see this project. Perfect for works in progress.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setProjectData({ ...projectData, visibility: 'org' })}
                className={`w-full rounded-xl border-2 p-4 text-left transition ${
                  projectData.visibility === 'org'
                    ? 'border-brand-primary bg-(--accent)/10'
                    : 'hover:border-brand-primary/50 border-(--border) bg-(--surface)'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Users
                    className={`mt-1 h-5 w-5 ${
                      projectData.visibility === 'org' ? 'text-(--accent)' : 'text-(--muted)'
                    }`}
                  />
                  <div>
                    <p className="mb-1 font-semibold text-(--text)">Band/Organization</p>
                    <p className="text-sm text-(--muted)">
                      Shared with your band or organization members only.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setProjectData({ ...projectData, visibility: 'public' })}
                className={`w-full rounded-xl border-2 p-4 text-left transition ${
                  projectData.visibility === 'public'
                    ? 'border-brand-primary bg-(--accent)/10'
                    : 'hover:border-brand-primary/50 border-(--border) bg-(--surface)'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Globe
                    className={`mt-1 h-5 w-5 ${
                      projectData.visibility === 'public' ? 'text-(--accent)' : 'text-(--muted)'
                    }`}
                  />
                  <div>
                    <p className="mb-1 font-semibold text-(--text)">Public</p>
                    <p className="text-sm text-(--muted)">
                      Anyone can discover and listen. Great for released albums.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-between"
        >
          <Link href="/projects">
            <Button variant="secondary" className="px-6 py-3">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleCreateProject}
            disabled={creating || !projectData.name.trim()}
            className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-3 font-semibold disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
