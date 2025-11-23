'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import {
  Music,
  Plus,
  GripVertical,
  Clock,
  MapPin,
  Calendar,
  Users,
  Share2,
  Download,
  Sparkles,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import setlist builder
const CollaborativeSetlistBuilder = dynamic(
  () => import('@/components/setlist-builder').then((m) => m.CollaborativeSetlistBuilder),
  { ssr: false }
);

const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then((m) => m.PresenceIndicator),
  { ssr: false }
);

type Setlist = {
  id: string;
  name: string;
  venue?: string;
  date?: string;
  songs: string[]; // Array of song IDs
  notes?: string;
  created_at: string;
};

export default function SetlistsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
      setSetlists(foundProject.setlists || []);
      setLoading(false);
    });
  }, [router, slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg">Loading setlists...</div>
      </div>
    );
  }

  const projectSongs = project.songs || [];

  const createNewSetlist = () => {
    const newSetlist: Setlist = {
      id: `setlist_${Date.now()}`,
      name: 'New Setlist',
      songs: [],
      created_at: new Date().toISOString(),
    };
    setSelectedSetlist(newSetlist);
    setIsCreating(true);
  };

  const saveSetlist = async (songs: any[]) => {
    // Would save to Supabase in production
    console.log('Saving setlist with songs:', songs);
  };

  // If viewing/editing a setlist
  if (selectedSetlist) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="rnrb-container max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex-1">
              <Button variant="ghost" onClick={() => setSelectedSetlist(null)} className="mb-4">
                ← Back to Setlists
              </Button>
              <h1 className="font-display mb-2 text-4xl font-bold">{selectedSetlist.name}</h1>
              <p className="text-muted-foreground">Collaborative setlist builder</p>
            </div>

            {/* Presence Indicator */}
            {user && (
              <div className="mr-4">
                <PresenceIndicator
                  channelName={`setlist:${slug}:${selectedSetlist.id}`}
                  currentUser={{
                    userId: user.id,
                    userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    userEmail: user.email || '',
                    avatar: user.user_metadata?.avatar_url,
                  }}
                  location={`Setlist: ${selectedSetlist.name}`}
                  showDetails={true}
                  maxVisible={5}
                />
              </div>
            )}

            <Button className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Rename Setlist
            </Button>
          </div>

          {/* Collaborative Builder */}
          <CollaborativeSetlistBuilder
            setlistId={selectedSetlist.id}
            projectSlug={slug}
            projectSongs={projectSongs}
            initialSongs={[]}
            onUpdate={saveSetlist}
            currentUser={{
              userId: user?.id || 'anonymous',
              userName: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="rnrb-container max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="transition hover:text-brand-primary">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${slug}`} className="transition hover:text-brand-primary">
            {project.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">Setlists</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display mb-2 text-4xl font-bold">Setlists</h1>
            <p className="text-xl text-muted-foreground">
              Organize your songs for live performances
            </p>
          </div>
          <Button
            onClick={createNewSetlist}
            className="rnrb-button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Create Setlist
          </Button>
        </div>

        {/* Empty State or Setlist Grid */}
        {setlists.length === 0 ? (
          <Card className="rnrb-card p-16 text-center">
            <Music className="mx-auto mb-6 h-20 w-20 text-muted-foreground/50" />
            <h2 className="font-display mb-4 text-3xl font-bold">Ready for Your First Show?</h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
              Whether you're playing an intimate coffee shop or a packed venue, a great setlist
              builds energy and tells your story. Create your first setlist to organize songs, plan
              transitions, and share with your band.
            </p>

            {projectSongs.length === 0 ? (
              <div className="rnrb-card mx-auto mb-6 max-w-md border-yellow-500/20 bg-yellow-500/5 p-6">
                <p className="text-sm text-muted-foreground">
                  You need songs first! Add some songs to {project.name}, then come back to build
                  your setlist.
                </p>
                <Link href={`/projects/${slug}/songs/new`}>
                  <Button className="rnrb-button-primary mt-4 rounded-xl px-6 py-3">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Song
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                onClick={createNewSetlist}
                className="rnrb-button-primary inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold"
              >
                <Plus className="h-6 w-6" />
                Create Your First Setlist
              </Button>
            )}

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 text-left md:grid-cols-3">
              <div className="rnrb-card bg-surface-muted p-4">
                <Music className="mb-3 h-8 w-8 text-brand-primary" />
                <h3 className="mb-2 text-sm font-semibold">Smart Organization</h3>
                <p className="text-xs text-muted-foreground">
                  Drag-drop reordering, key change indicators, set duration calculator
                </p>
              </div>
              <div className="rnrb-card bg-surface-muted p-4">
                <Users className="mb-3 h-8 w-8 text-brand-primary" />
                <h3 className="mb-2 text-sm font-semibold">Collaborative</h3>
                <p className="text-xs text-muted-foreground">
                  Your whole band sees the setlist. Make changes together in real-time.
                </p>
              </div>
              <div className="rnrb-card bg-surface-muted p-4">
                <Share2 className="mb-3 h-8 w-8 text-brand-primary" />
                <h3 className="mb-2 text-sm font-semibold">Export & Share</h3>
                <p className="text-xs text-muted-foreground">
                  Print for your bandmates or export for sound engineers
                </p>
              </div>
            </div>

            <p className="mt-8 text-sm italic text-muted-foreground">
              "Every great show starts with a great setlist."
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {setlists.map((setlist) => (
              <motion.div
                key={setlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="rnrb-card cursor-pointer p-6 transition hover:border-brand-primary/30">
                  <h3 className="mb-3 text-xl font-semibold">{setlist.name}</h3>
                  {setlist.venue && (
                    <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {setlist.venue}
                    </p>
                  )}
                  {setlist.date && (
                    <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(setlist.date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Music className="h-4 w-4" />
                    {setlist.songs.length} songs
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Helpful Note */}
        <Card className="rnrb-card mt-8 border-purple-500/20 bg-purple-500/5 p-6">
          <p className="mb-1 flex items-center gap-2 text-sm font-medium text-brand-primary">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Pro Tip: Building Your Set
          </p>
          <p className="text-xs text-muted-foreground">
            Start strong, dip in the middle for intimacy, build to your biggest song. Watch key
            changes (too many can tire your voice). Share your setlist in project chat for band
            feedback!
          </p>
        </Card>
      </div>
    </div>
  );
}
