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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import modal
const CreateSetlistModal = dynamic(() => import('@/components/setlists/create-setlist-modal'), {
  ssr: false
});

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
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading setlists...</div>
      </div>
    );
  }

  const projectSongs = project.songs || [];

  const handleSaveSetlist = async (setlistData: {
    name: string;
    venue?: string;
    date?: string;
    songs: string[];
    notes?: string;
  }) => {
    const newSetlist: Setlist = {
      id: `setlist_${Date.now()}`,
      name: setlistData.name,
      venue: setlistData.venue,
      date: setlistData.date,
      songs: setlistData.songs,
      notes: setlistData.notes,
      created_at: new Date().toISOString(),
    };

    // Update project with new setlist
    const allProjects = user.user_metadata?.projects || [];
    const updatedProjects = allProjects.map((p: any) => {
      if (p.slug === slug) {
        return {
          ...p,
          setlists: [...(p.setlists || []), newSetlist],
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    const { error } = await supabase!.auth.updateUser({
      data: {
        ...user.user_metadata,
        projects: updatedProjects
      }
    });

    if (error) throw error;

    // Update local state
    setSetlists([...setlists, newSetlist]);
    const updated = updatedProjects.find((p: any) => p.slug === slug);
    setProject(updated);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="rnrb-container max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/projects" className="hover:text-brand-primary transition">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${slug}`} className="hover:text-brand-primary transition">{project.name}</Link>
          <span>/</span>
          <span className="text-foreground">Setlists</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Setlists</h1>
            <p className="text-xl text-muted-foreground">
              Organize your songs for live performances
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="rnrb-button-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Setlist
          </Button>
        </div>

        {/* Empty State or Setlist Grid */}
        {setlists.length === 0 ? (
          <Card className="p-16 text-center rnrb-card">
            <Music className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
            <h2 className="text-3xl font-display font-bold mb-4">Ready for Your First Show?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Whether you're playing an intimate coffee shop or a packed venue, 
              a great setlist builds energy and tells your story. 
              Create your first setlist to organize songs, plan transitions, and share with your band.
            </p>
            
            {projectSongs.length === 0 ? (
              <div className="rnrb-card p-6 bg-yellow-500/5 border-yellow-500/20 max-w-md mx-auto mb-6">
                <p className="text-sm text-muted-foreground">
                  You need songs first! Add some songs to {project.name}, then come back to build your setlist.
                </p>
                <Link href={`/projects/${slug}/songs/new`}>
                  <Button className="rnrb-button-primary px-6 py-3 rounded-xl mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Song
                  </Button>
                </Link>
              </div>
            ) : (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Create Your First Setlist
              </Button>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="rnrb-card p-4 bg-surface-muted">
                <Music className="w-8 h-8 text-brand-primary mb-3" />
                <h3 className="font-semibold mb-2 text-sm">Smart Organization</h3>
                <p className="text-xs text-muted-foreground">
                  Drag-drop reordering, key change indicators, set duration calculator
                </p>
              </div>
              <div className="rnrb-card p-4 bg-surface-muted">
                <Users className="w-8 h-8 text-brand-primary mb-3" />
                <h3 className="font-semibold mb-2 text-sm">Collaborative</h3>
                <p className="text-xs text-muted-foreground">
                  Your whole band sees the setlist. Make changes together in real-time.
                </p>
              </div>
              <div className="rnrb-card p-4 bg-surface-muted">
                <Share2 className="w-8 h-8 text-brand-primary mb-3" />
                <h3 className="font-semibold mb-2 text-sm">Export & Share</h3>
                <p className="text-xs text-muted-foreground">
                  Print for your bandmates or export for sound engineers
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-8 italic">
              "Every great show starts with a great setlist." 
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {setlists.map((setlist) => {
              // Get song details for display
              const setlistSongDetails = setlist.songs
                .map(songId => projectSongs.find((s: any) => s.id === songId || s.title === songId))
                .filter(Boolean);
              
              return (
                <motion.div
                  key={setlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 rnrb-card hover:border-brand-primary/30 transition cursor-pointer">
                    <h3 className="text-xl font-semibold mb-3">{setlist.name}</h3>
                    {setlist.venue && (
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {setlist.venue}
                      </p>
                    )}
                    {setlist.date && (
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(setlist.date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      {setlist.songs.length} songs
                    </p>
                    
                    {/* Song Preview */}
                    {setlistSongDetails.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Songs:</p>
                        <ol className="text-xs text-muted-foreground space-y-1">
                          {setlistSongDetails.slice(0, 3).map((song: any, index) => (
                            <li key={index}>{index + 1}. {song?.title || 'Unknown'}</li>
                          ))}
                          {setlistSongDetails.length > 3 && (
                            <li className="italic">+ {setlistSongDetails.length - 3} more...</li>
                          )}
                        </ol>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Helpful Note */}
        <Card className="p-6 rnrb-card bg-purple-500/5 border-purple-500/20 mt-8">
          <p className="text-sm text-brand-primary font-medium mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Pro Tip: Building Your Set
          </p>
          <p className="text-xs text-muted-foreground">
            Start strong, dip in the middle for intimacy, build to your biggest song. 
            Watch key changes (too many can tire your voice). Share your setlist in project chat for band feedback!
          </p>
        </Card>
      </div>

      {/* Create Setlist Modal */}
      <CreateSetlistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveSetlist}
        projectSongs={projectSongs.map((s: any) => ({
          id: s.id || s.title,
          title: s.title,
          key: s.key,
          tempo: s.tempo,
          duration_estimate: 3, // Default 3 minutes per song
        }))}
      />
    </div>
  );
}

