'use client';

import { useSession } from 'next-auth/react';

import { Card, Button } from '@cronkwaters/ui';
import {
  ArrowLeft,
  Trash2,
  Users,
  Loader2,
  Lock,
  Check,
  AlertCircle,
} from '@/components/ui/custom-icons';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CursorOverlay = dynamic(
  () => import('@/components/cursor-overlay').then((m) => m.CursorOverlay),
  { ssr: false }
);
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { useCollaborativeSettings } from '@/hooks/use-collaborative-settings';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Collaborative settings hook
  const {
    settings,
    isConnected,
    activeEditors,
    lockField,
    unlockField,
    updateField,
    isFieldLocked,
    getFieldLocker,
    isFieldPending,
  } = useCollaborativeSettings({
    channelName: `project-settings:${slug}`,
    userId: user?.id || 'anonymous',
    userName: user?.name || user?.email?.split('@')[0] || 'User',
    initialSettings: {
      name: project?.name || '',
      description: project?.description || '',
      tagline: project?.tagline || '',
      coverImage: project?.cover_image || '',
      visibility: project?.visibility || 'private',
    },
    onUpdate: async (updates) => {
      // Save to server
      const response = await fetch(`/api/projects/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      return response.json();
    },
    enabled: !!user && !!project,
  });

  // Collaborative cursors
  const { remoteCursors } = useCollaborativeCursors({
    channelName: `project-settings:${slug}-cursors`,
    userId: user?.id || 'anonymous',
    userName: user?.name || user?.email?.split('@')[0] || 'User',
    enabled: !!user,
  });

  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth');
      return;
    }

    setUser(session.user);

    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${slug}`);
        if (!response.ok) {
          router.push('/projects');
          return;
        }

        const foundProject = await response.json();
        setProject(foundProject);
        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        router.push('/projects');
      }
    };

    loadProject();
  }, [router, slug]);

  // Delete project
  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone. All songs and data will be lost.'))
      return;

    try {
      // Delete via API
      const response = await fetch(`/api/projects/${slug}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      router.push('/projects');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (loading || !project) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--accent)' }} />
          <div style={{ color: 'var(--muted)' }}>Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="container mx-auto max-w-4xl">
        <Link
          href={`/projects/${slug}`}
          className="mb-6 inline-flex items-center gap-2 transition"
          style={{ color: 'var(--accent)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        {/* Header with Collaboration Status */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display mb-2 text-4xl font-bold" style={{ color: 'var(--text)' }}>
              Project Settings
            </h1>
            <p style={{ color: 'var(--muted)' }}>Manage your project details collaboratively</p>
          </div>

          {/* Active Editors */}
          <Card
            className="p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Active Editors
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {activeEditors.length + 1} online
                </div>
              </div>
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}
              />
            </div>
            {activeEditors.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                {activeEditors.map((editor) => (
                  <div
                    key={editor.id}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    {editor.name}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
              message.type === 'success'
                ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                : 'border border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {message.text}
          </div>
        )}

        <Card
          className="mb-6 p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--text)' }}>
            Basic Information
          </h2>
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label
                htmlFor="project-name"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--muted)' }}
              >
                Project Name
                {isFieldLocked('name') && (
                  <span className="ml-2 flex items-center gap-1 text-xs text-yellow-400">
                    <Lock className="h-3 w-3" />
                    Editing by {getFieldLocker('name')}
                  </span>
                )}
                {isFieldPending('name') && (
                  <span className="ml-2 flex items-center gap-1 text-xs text-blue-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                )}
              </label>
              <input
                id="project-name"
                type="text"
                value={settings.name}
                onChange={(e) => updateField('name', e.target.value)}
                onFocus={() => lockField('name')}
                onBlur={() => unlockField('name')}
                disabled={isFieldLocked('name')}
                className="w-full rounded-xl border-2 px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {/* Tagline */}
            <div>
              <label
                htmlFor="project-tagline"
                className="mb-2 block text-sm font-medium text-[color:var(--muted)]"
              >
                Tagline
                {isFieldLocked('tagline') && (
                  <span className="ml-2 flex items-center gap-1 text-xs text-yellow-400">
                    <Lock className="h-3 w-3" />
                    Editing by {getFieldLocker('tagline')}
                  </span>
                )}
                {isFieldPending('tagline') && (
                  <span className="ml-2 text-xs text-blue-400">Saving...</span>
                )}
              </label>
              <input
                id="project-tagline"
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => updateField('tagline', e.target.value)}
                onFocus={() => lockField('tagline')}
                onBlur={() => unlockField('tagline')}
                disabled={isFieldLocked('tagline')}
                placeholder="A short description of your project"
                className="w-full rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-sm font-medium text-[color:var(--muted)]"
              >
                Description
                {isFieldLocked('description') && (
                  <span className="ml-2 flex items-center gap-1 text-xs text-yellow-400">
                    <Lock className="h-3 w-3" />
                    Editing by {getFieldLocker('description')}
                  </span>
                )}
                {isFieldPending('description') && (
                  <span className="ml-2 text-xs text-blue-400">Saving...</span>
                )}
              </label>
              <textarea
                id="project-description"
                value={settings.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                onFocus={() => lockField('description')}
                onBlur={() => unlockField('description')}
                disabled={isFieldLocked('description')}
                rows={4}
                placeholder="Tell the story of this project..."
                className="w-full resize-none rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Visibility */}
            <div>
              <label
                htmlFor="project-visibility"
                className="mb-2 block text-sm font-medium text-[color:var(--muted)]"
              >
                Visibility
                {isFieldLocked('visibility') && (
                  <span className="ml-2 flex items-center gap-1 text-xs text-yellow-400">
                    <Lock className="h-3 w-3" />
                    Editing by {getFieldLocker('visibility')}
                  </span>
                )}
              </label>
              <select
                id="project-visibility"
                value={settings.visibility}
                onChange={(e) =>
                  updateField('visibility', e.target.value as 'private' | 'org' | 'public')
                }
                onFocus={() => lockField('visibility')}
                onBlur={() => unlockField('visibility')}
                disabled={isFieldLocked('visibility')}
                className="w-full rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="private">Private (Only invited members)</option>
                <option value="org">Organization (All org members)</option>
                <option value="public">Public (Anyone can view)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-500/20 bg-red-500/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-red-400">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[color:var(--text)]">Delete this project</p>
              <p className="text-sm text-[color:var(--muted)]">
                Once deleted, it cannot be recovered
              </p>
            </div>
            <Button
              onClick={handleDelete}
              variant="secondary"
              className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </Button>
          </div>
        </Card>

        {/* Info card */}
        <Card className="bg-[color:var(--accent)]/5 mt-6 border-brand-primary/20 p-4">
          <p className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Check className="h-4 w-4 text-[color:var(--accent)]" />
            Changes are automatically saved as you type. Field locks prevent conflicts with other
            editors.
          </p>
        </Card>
      </div>

      {/* Collaborative Cursors */}
      <CursorOverlay cursors={remoteCursors} />
    </div>
  );
}
