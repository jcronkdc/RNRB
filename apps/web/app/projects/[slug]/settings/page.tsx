'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { ArrowLeft, Save, Trash2, Users, Loader2, Lock, Check } from 'lucide-react';
import Link from 'next/link';
import { useCollaborativeSettings } from '@/hooks/use-collaborative-settings';
import dynamic from 'next/dynamic';

const CursorOverlay = dynamic(() => import('@/components/cursor-overlay').then(m => m.CursorOverlay), { ssr: false });
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';

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
      const { data: { user } } = await supabase!.auth.getUser();
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
    if (!confirm('Delete this project? This cannot be undone. All songs and data will be lost.')) return;

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
          <div className="text-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href={`/projects/${slug}`} className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Link>

        {/* Header with Collaboration Status */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Project Settings</h1>
            <p className="text-muted-foreground">Manage your project details collaboratively</p>
          </div>
          
          {/* Active Editors */}
          <Card className="p-4 rnrb-card">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-primary" />
              <div>
                <div className="text-sm font-medium">Active Editors</div>
                <div className="text-xs text-muted-foreground">{activeEditors.length + 1} online</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
            </div>
            {activeEditors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                {activeEditors.map((editor) => (
                  <div key={editor.id} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {editor.name}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <Card className="p-6 mb-6 rnrb-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Project Name
                {isFieldLocked('name') && (
                  <span className="ml-2 text-xs text-yellow-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Editing by {getFieldLocker('name')}
                  </span>
                )}
                {isFieldPending('name') && (
                  <span className="ml-2 text-xs text-blue-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
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
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tagline
                {isFieldLocked('tagline') && (
                  <span className="ml-2 text-xs text-yellow-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
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
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Description
                {isFieldLocked('description') && (
                  <span className="ml-2 text-xs text-yellow-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
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
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Visibility
                {isFieldLocked('visibility') && (
                  <span className="ml-2 text-xs text-yellow-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Editing by {getFieldLocker('visibility')}
                  </span>
                )}
              </label>
              <select
                value={settings.visibility}
                onChange={(e) => updateField('visibility', e.target.value as 'private' | 'org' | 'public')}
                onFocus={() => lockField('visibility')}
                onBlur={() => unlockField('visibility')}
                disabled={isFieldLocked('visibility')}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="private">Private (Only invited members)</option>
                <option value="org">Organization (All org members)</option>
                <option value="public">Public (Anyone can view)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Delete this project</p>
              <p className="text-sm text-muted-foreground">Once deleted, it cannot be recovered</p>
            </div>
            <Button
              onClick={handleDelete}
              variant="secondary"
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </Card>

        {/* Info card */}
        <Card className="p-4 mt-6 bg-brand-primary/5 border-brand-primary/20">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Check className="w-4 h-4 text-brand-primary" />
            Changes are automatically saved as you type. Field locks prevent conflicts with other editors.
          </p>
        </Card>
      </div>

      {/* Collaborative Cursors */}
      <CursorOverlay cursors={remoteCursors} />
    </div>
  );
}

