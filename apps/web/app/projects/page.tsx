'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Plus, 
  Music, 
  Users, 
  Calendar,
  TrendingUp,
  MoreVertical,
  Folder,
  Lock,
  Globe,
  Eye
} from 'lucide-react';
import Link from 'next/link';

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  visibility: 'private' | 'org' | 'public';
  created_at: string;
  updated_at: string;
  song_count: number;
  collaborator_count: number;
  session_count: number;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        // Load projects from user_metadata for now (will connect to database later)
        const userProjects = user.user_metadata?.projects || [];
        setProjects(userProjects);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050816] to-[#0f172a]">
        <div className="text-white">Loading your projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              🍄 Your Projects
            </h1>
            <p className="text-xl text-muted-foreground">
              The mycelium network - where all your music lives and grows
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Folder className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Music className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-muted-foreground">Total Songs</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-muted-foreground">Collaborators</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Grow Your First Mycelium Network
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Projects are the foundation - your mycelium substrate. Create your first project to start organizing songs, 
                collaborating with others, and building your music empire.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="font-semibold text-white mb-2">🎵 Organize Songs</p>
                  <p className="text-sm text-muted-foreground">
                    Group songs into albums, EPs, or singles
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="font-semibold text-white mb-2">🤝 Collaborate</p>
                  <p className="text-sm text-muted-foreground">
                    Invite band members and track contributions
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="font-semibold text-white mb-2">💰 Track Royalties</p>
                  <p className="text-sm text-muted-foreground">
                    Manage splits and revenue per project
                  </p>
                </div>
              </div>

              <Link href="/projects/new">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center gap-3">
                  <Plus className="w-6 h-6" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link href={`/projects/${project.slug}`} key={project.id}>
                <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full">
                  {/* Cover Image */}
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-16 h-16 text-white/50" />
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                    {project.visibility === 'private' && <Lock className="w-4 h-4 text-muted-foreground" />}
                    {project.visibility === 'public' && <Globe className="w-4 h-4 text-green-500" />}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description || 'No description yet'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {project.song_count || 0} songs
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.collaborator_count || 1}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Explanation Section */}
        {projects.length === 0 && (
          <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-2xl font-semibold text-white mb-4">🍄 Understanding Projects (The Mycelium)</h3>
            <p className="text-muted-foreground mb-6">
              Just as mycelium forms the underground network connecting an entire forest, projects are the living network 
              connecting all aspects of your music:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <p className="font-semibold text-purple-400 mb-2">🌱 Songs Branch From Projects</p>
                <p className="text-sm text-muted-foreground">
                  Like hyphae growing from mycelium, your songs organize naturally within projects
                </p>
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="font-semibold text-blue-400 mb-2">💧 Sessions Feed the Network</p>
                <p className="text-sm text-muted-foreground">
                  Recording sessions channel creative energy into your project's songs
                </p>
              </div>
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <p className="font-semibold text-green-400 mb-2">🌿 Tours Fruit From Projects</p>
                <p className="text-sm text-muted-foreground">
                  Tours are the visible fruiting body - sprouting from the hidden project network
                </p>
              </div>
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <p className="font-semibold text-orange-400 mb-2">💰 Revenue Flows Through</p>
                <p className="text-sm text-muted-foreground">
                  Like nutrients cycling through mycelium, royalties distribute across the project
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

