'use client';

import { supabase } from '@/lib/supabase';

import { Card, Button } from '@cronkwaters/ui';
import { ArrowLeft, Trash2, Users, Loader2, Lock, Check, AlertCircle } from 'lucide-react';
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
    userName: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
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
    userName: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
    enabled: !!user,
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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-brand-primary h-12 w-12 animate-spin" />
          <div className="text-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <Link
          href={`/projects/${slug}`}
          className="text-brand-primary hover:text-brand-primary/80 mb-6 inline-flex items-center gap-2 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        {/* Header with Collaboration Status */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-foreground mb-2 text-4xl font-bold">
              Project Settings
            </h1>
            <p className="text-muted-foreground">Manage your project details collaboratively</p>
          </div>

          {/* Active Editors */}
          <Card className="rnrb-card p-4">
            <div className="flex items-center gap-3">
              <Users className="text-brand-primary h-5 w-5" />
              <div>
                <div className="text-sm font-medium">Active Editors</div>
                <div className="text-muted-foreground text-xs">
                  {activeEditors.length + 1} online
                </div>
              </div>
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}
              />
            </div>
            {activeEditors.length > 0 && (
              <div className="border-border mt-3 border-t pt-3">
                {activeEditors.map((editor) => (
                  <div
                    key={editor.id}
                    className="text-muted-foreground flex items-center gap-2 text-xs"
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

        <Card className="rnrb-card mb-6 p-6">
          <h2 className="text-foreground mb-4 text-xl font-semibold">Basic Information</h2>
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
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
                type="text"
                value={settings.name}
                onChange={(e) => updateField('name', e.target.value)}
                onFocus={() => lockField('name')}
                onBlur={() => unlockField('name')}
                disabled={isFieldLocked('name')}
                className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/10 w-full rounded-xl border-2 px-4 py-3 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
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
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => updateField('tagline', e.target.value)}
                onFocus={() => lockField('tagline')}
                onBlur={() => unlockField('tagline')}
                disabled={isFieldLocked('tagline')}
                placeholder="A short description of your project"
                className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/10 w-full rounded-xl border-2 px-4 py-3 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
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
                value={settings.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                onFocus={() => lockField('description')}
                onBlur={() => unlockField('description')}
                disabled={isFieldLocked('description')}
                rows={4}
                placeholder="Tell the story of this project..."
                className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/10 w-full resize-none rounded-xl border-2 px-4 py-3 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                Visibility
                {isFieldLocked('visibility') && (
                  <span className="ml-2 flex items-center gap-1 text-xs text-yellow-400">
                    <Lock className="h-3 w-3" />
                    Editing by {getFieldLocker('visibility')}
                  </span>
                )}
              </label>
              <select
                value={settings.visibility}
                onChange={(e) =>
                  updateField('visibility', e.target.value as 'private' | 'org' | 'public')
                }
                onFocus={() => lockField('visibility')}
                onBlur={() => unlockField('visibility')}
                disabled={isFieldLocked('visibility')}
                className="border-border bg-surface text-foreground focus:border-brand-primary focus:ring-brand-primary/10 w-full rounded-xl border-2 px-4 py-3 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
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
              <p className="text-foreground font-medium">Delete this project</p>
              <p className="text-muted-foreground text-sm">Once deleted, it cannot be recovered</p>
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
        <Card className="border-brand-primary/20 bg-brand-primary/5 mt-6 p-4">
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Check className="text-brand-primary h-4 w-4" />
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
