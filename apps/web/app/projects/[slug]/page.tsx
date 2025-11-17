'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Music, 
  Plus,
  Users, 
  Calendar,
  Settings,
  Upload,
  Radio,
  DollarSign,
  Disc,
  FileText,
  Share2,
  Lock,
  Globe,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      setUser(user);
      
      // Find project from user metadata
      const projects = user.user_metadata?.projects || [];
      const foundProject = projects.find((p: any) => p.slug === slug);
      
      if (!foundProject) {
        router.push('/projects');
        return;
      }
      
      setProject(foundProject);
      setLoading(false);
    });
  }, [router, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050816] to-[#0f172a]">
        <div className="text-white">Loading project...</div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Back Navigation */}
        <Link href="/projects" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-4 h-4" />
          All Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Cover Art */}
            <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {project.cover_image ? (
                <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-24 h-24 text-white/30" />
              )}
            </div>

            {/* Project Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{project.name}</h1>
                    {project.visibility === 'private' && (
                      <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-sm text-gray-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    )}
                    {project.visibility === 'public' && (
                      <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </span>
                    )}
                  </div>
                  {project.tagline && (
                    <p className="text-xl text-purple-400 mb-3">{project.tagline}</p>
                  )}
                  {project.description && (
                    <p className="text-muted-foreground">{project.description}</p>
                  )}
                </div>
                <Link href={`/projects/${slug}/settings`}>
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span className="text-white">{project.song_count || 0} songs</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-white">{project.collaborator_count || 1} collaborators</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-white">{project.session_count || 0} sessions</span>
                </div>
                {project.genre && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                    <span className="text-purple-400">🎵 {project.genre}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Music className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Add Song</p>
                <p className="text-xs text-muted-foreground">Create new track</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Invite</p>
                <p className="text-xs text-muted-foreground">Add collaborators</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Session</p>
                <p className="text-xs text-muted-foreground">Schedule recording</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-orange-500/5 to-orange-500/10 border border-orange-500/20">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Upload className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Upload</p>
                <p className="text-xs text-muted-foreground">Add files</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Project Content - The Mycelium Network Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Songs (Main Column) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Music className="w-6 h-6 text-brand-primary" />
                  Songs (Hyphae)
                </h2>
                <Link href={`/projects/${slug}/songs/new`}>
                  <Button className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Song
                  </Button>
                </Link>
              </div>
              
              {(project.song_count || 0) === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No songs yet - the mycelium awaits</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Songs are the hyphae - the creative threads branching from your project
                  </p>
                  <Link href={`/projects/${slug}/songs/new`}>
                    <Button className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Song
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(project.songs || []).map((song: any) => (
                    <Link key={song.id} href={`/projects/${slug}/songs/${song.id}`}>
                      <div className="p-4 bg-surface hover:bg-surface-muted border border-border rounded-lg transition cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{song.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {song.key && `${song.key} • `}
                              {song.tempo && `${song.tempo} BPM`}
                            </p>
                          </div>
                          {song.has_lyrics && <FileText className="w-5 h-5 text-blue-500" />}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Sessions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Recording Sessions
                </h2>
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Sessions feed creative energy back into the network
              </p>
            </Card>

            {/* Assets */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-400" />
                  Project Assets
                </h2>
                <Button variant="secondary" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Audio files, lyrics, charts - nutrients flowing through the network
              </p>
            </Card>
          </div>

          {/* Sidebar - Network Connections */}
          <div className="space-y-6">
            {/* Collaborators */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Network Nodes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">You (Owner)</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Collaborators
                </Button>
              </div>
            </Card>

            {/* Revenue Flow */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Revenue Network
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Earnings</span>
                  <span className="text-lg font-bold text-white">$0.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-sm font-medium text-green-400">$0.00</span>
                </div>
                <Button variant="secondary" className="w-full" size="sm">
                  View Split Sheet
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href={`/projects/${slug}/settings`}>
                  <Button variant="secondary" className="w-full justify-start" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Project Settings
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full justify-start" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Project
                </Button>
                <Button variant="secondary" className="w-full justify-start" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </Card>

            {/* Mycelium Visualization */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">🍄 Network Health</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Songs (Hyphae)</span>
                  <span className="text-purple-400 font-medium">{project.song_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sessions (Nutrients)</span>
                  <span className="text-blue-400 font-medium">{project.session_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Collaborators (Nodes)</span>
                  <span className="text-green-400 font-medium">{project.collaborator_count || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Revenue (Flow)</span>
                  <span className="text-orange-400 font-medium">$0</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-background/50 rounded border border-purple-500/20">
                <p className="text-xs text-purple-300">
                  💡 The network is young. Add songs and collaborators to strengthen the mycelium.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

