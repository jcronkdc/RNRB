'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Music,
  Plus,
  MapPin,
  Calendar,
  Users,
  Share2,
  Sparkles,
  Edit,
  Link as LinkIcon,
  ExternalLink,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

// Dynamically import setlist builder
const CollaborativeSetlistBuilder = dynamic(
  () => import('@/components/setlist-builder').then((m) => m.CollaborativeSetlistBuilder),
  { ssr: false }
);

const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then((m) => m.PresenceIndicator),
  { ssr: false }
);

const SpotifyImportModal = dynamic(
  () => import('@/components/spotify-import-modal').then((m) => m.SpotifyImportModal),
  { ssr: false }
);

const SetlistGeneratorModal = dynamic(
  () => import('@/components/setlist-generator-modal').then((m) => m.SetlistGeneratorModal),
  { ssr: false }
);

const SetlistTemplatesModal = dynamic(
  () => import('@/components/setlist-templates-modal').then((m) => m.SetlistTemplatesModal),
  { ssr: false }
);

const SongRequestManager = dynamic(
  () => import('@/components/SongRequestManager').then((m) => m.SongRequestManager),
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
  showId?: string;
  show?: {
    id: string;
    name: string;
    date: string;
    venue?: {
      name: string;
      city?: string;
    };
  };
};

type Show = {
  id: string;
  name: string;
  date: string;
  venue?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  };
  status: string;
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
  const [showSpotifyImport, setShowSpotifyImport] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingShow, setLinkingShow] = useState(false);
  const [showRequestManager, setShowRequestManager] = useState(false);

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
      <div className="bg-background flex min-h-screen items-center justify-center">
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

  const handleSpotifyImport = (importedCount: number) => {
    console.log(`Imported ${importedCount} songs from Spotify`);
    // Would refresh project songs list
  };

  const handleGenerateSetlist = (generatedSongs: any[]) => {
    console.log('Generated setlist:', generatedSongs);
    // Would create new setlist with generated songs
  };

  const handleApplyTemplate = (songs: any[], template: any) => {
    console.log(`Applied template "${template.name}" with ${songs.length} songs`);
    // Would create new setlist with template songs
    setShowTemplates(false);
  };

  const loadShows = async () => {
    setLoadingShows(true);
    try {
      const response = await fetch('/api/shows');
      if (response.ok) {
        const data = await response.json();
        // Only show upcoming shows (future dates)
        const upcoming = data.filter((show: Show) => {
          const showDate = new Date(show.date);
          return showDate >= new Date() && show.status !== 'cancelled';
        });
        setShows(upcoming);
      }
    } catch (err) {
      console.error('Error loading shows:', err);
    } finally {
      setLoadingShows(false);
    }
  };

  const handleLinkToShow = async (showId: string) => {
    if (!selectedSetlist) return;
    
    setLinkingShow(true);
    try {
      const response = await fetch(`/api/shows/${showId}/setlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setlistId: selectedSetlist.id,
        }),
      });

      if (response.ok) {
        const show = shows.find((s) => s.id === showId);
        if (show) {
          setSelectedSetlist({
            ...selectedSetlist,
            showId: show.id,
            show: {
              id: show.id,
              name: show.name,
              date: show.date,
              venue: show.venue,
            },
          });
        }
        setShowLinkModal(false);
      } else {
        alert('Failed to link setlist to show');
      }
    } catch (err) {
      console.error('Error linking to show:', err);
      alert('Error linking setlist to show');
    } finally {
      setLinkingShow(false);
    }
  };

  const handleUnlinkShow = async () => {
    if (!selectedSetlist?.showId) return;

    try {
      const response = await fetch(`/api/shows/${selectedSetlist.showId}/setlist`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSelectedSetlist({
          ...selectedSetlist,
          showId: undefined,
          show: undefined,
        });
      } else {
        alert('Failed to unlink show');
      }
    } catch (err) {
      console.error('Error unlinking show:', err);
      alert('Error unlinking show');
    }
  };

  useEffect(() => {
    if (selectedSetlist && !showLinkModal) {
      loadShows();
    }
  }, [selectedSetlist]);

  // If viewing/editing a setlist
  if (selectedSetlist) {
    return (
      <div className="bg-background min-h-screen px-4 py-12">
        <div className="rnrb-container max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex-1">
              <Button variant="ghost" onClick={() => setSelectedSetlist(null)} className="mb-4">
                ← Back to Setlists
              </Button>
              <h1 className="font-display mb-2 text-4xl font-bold">{selectedSetlist.name}</h1>
              <p className="text-muted-foreground">Collaborative setlist builder</p>
              
              {/* Linked Show Display */}
              {selectedSetlist.show ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-4 py-2">
                  <Calendar className="h-4 w-4 text-brand-primary" />
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/shows`}
                      className="text-sm font-medium hover:text-brand-primary transition"
                    >
                      {selectedSetlist.show.name}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                      •{' '}
                      {new Date(selectedSetlist.show.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {selectedSetlist.show.venue && ` • ${selectedSetlist.show.venue.name}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnlinkShow}
                    className="ml-2 h-6 w-6 p-0 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowLinkModal(true)}
                  className="mt-4 flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Link to Show
                </Button>
              )}
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRequestManager(!showRequestManager)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Song Requests
              </Button>
              <Button className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Rename Setlist
              </Button>
            </div>
          </div>

          {/* Song Request Manager (when toggled) */}
          {showRequestManager && (
            <div className="mb-8">
              <Card className="rnrb-card p-6">
                <SongRequestManager
                  setlistId={selectedSetlist.id}
                  projectId={project.id || `temp_${slug}`}
                />
              </Card>
            </div>
          )}

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

        {/* Link to Show Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <Card className="rnrb-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">Link Setlist to Show</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLinkModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {loadingShows ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">Loading upcoming shows...</p>
                  </div>
                ) : shows.length === 0 ? (
                  <div className="py-12 text-center">
                    <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground mb-4">No upcoming shows scheduled</p>
                    <Link href="/shows/new">
                      <Button className="rnrb-button-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Create a Show
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {shows.map((show) => (
                      <button
                        key={show.id}
                        onClick={() => handleLinkToShow(show.id)}
                        disabled={linkingShow}
                        className="rnrb-card hover:border-brand-primary/50 w-full p-4 text-left transition disabled:opacity-50"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-semibold">{show.name}</h3>
                          <LinkIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(show.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {show.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>
                                {show.venue.name}
                                {show.venue.city && ` • ${show.venue.city}`}
                                {show.venue.state && `, ${show.venue.state}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 py-12">
      <div className="rnrb-container max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
          <Link href="/projects" className="hover:text-brand-primary transition">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${slug}`} className="hover:text-brand-primary transition">
            {project.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">Setlists</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display mb-2 text-4xl font-bold">Setlists</h1>
            <p className="text-muted-foreground text-xl">
              Organize your songs for live performances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              variant="outline"
            >
              <Sparkles className="h-4 w-4" />
              Templates
            </Button>
            <Button
              onClick={() => setShowSpotifyImport(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              variant="outline"
            >
              <Music className="h-4 w-4" />
              Import from Spotify
            </Button>
            <Button
              onClick={() => setShowGenerator(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              variant="outline"
            >
              <Sparkles className="h-4 w-4" />
              Generate Setlist
            </Button>
            <Button
              onClick={createNewSetlist}
              className="rnrb-button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
            >
              <Plus className="h-5 w-5" />
              Create Setlist
            </Button>
          </div>
        </div>

        {/* Empty State or Setlist Grid */}
        {setlists.length === 0 ? (
          <Card className="rnrb-card p-16 text-center">
            <Music className="text-muted-foreground/50 mx-auto mb-6 h-20 w-20" />
            <h2 className="font-display mb-4 text-3xl font-bold">Ready for Your First Show?</h2>
            <p className="text-muted-foreground mx-auto mb-6 max-w-2xl text-lg">
              Whether you're playing an intimate coffee shop or a packed venue, a great setlist
              builds energy and tells your story. Create your first setlist to organize songs, plan
              transitions, and share with your band.
            </p>

            {projectSongs.length === 0 ? (
              <div className="rnrb-card mx-auto mb-6 max-w-md border-yellow-500/20 bg-yellow-500/5 p-6">
                <p className="text-muted-foreground text-sm">
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
                <Music className="text-brand-primary mb-3 h-8 w-8" />
                <h3 className="mb-2 text-sm font-semibold">Smart Organization</h3>
                <p className="text-muted-foreground text-xs">
                  Drag-drop reordering, key change indicators, set duration calculator
                </p>
              </div>
              <div className="rnrb-card bg-surface-muted p-4">
                <Users className="text-brand-primary mb-3 h-8 w-8" />
                <h3 className="mb-2 text-sm font-semibold">Collaborative</h3>
                <p className="text-muted-foreground text-xs">
                  Your whole band sees the setlist. Make changes together in real-time.
                </p>
              </div>
              <div className="rnrb-card bg-surface-muted p-4">
                <Share2 className="text-brand-primary mb-3 h-8 w-8" />
                <h3 className="mb-2 text-sm font-semibold">Export & Share</h3>
                <p className="text-muted-foreground text-xs">
                  Print for your bandmates or export for sound engineers
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mt-8 text-sm italic">
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
                <Card className="rnrb-card hover:border-brand-primary/30 cursor-pointer p-6 transition">
                  <h3 className="mb-3 text-xl font-semibold">{setlist.name}</h3>
                  {setlist.venue && (
                    <p className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {setlist.venue}
                    </p>
                  )}
                  {setlist.date && (
                    <p className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(setlist.date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Music className="h-4 w-4" />
                    {setlist.songs.length} songs
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Spotify Import Modal */}
        {showSpotifyImport && user && (
          <SpotifyImportModal
            projectId={project.id || `temp_${slug}`}
            onClose={() => setShowSpotifyImport(false)}
            onImportComplete={handleSpotifyImport}
          />
        )}

        {/* Setlist Generator Modal */}
        {showGenerator && user && (
          <SetlistGeneratorModal
            projectId={project.id || `temp_${slug}`}
            onClose={() => setShowGenerator(false)}
            onGenerated={handleGenerateSetlist}
          />
        )}

        {/* Setlist Templates Modal */}
        {showTemplates && user && (
          <SetlistTemplatesModal
            projectId={project.id || `temp_${slug}`}
            onClose={() => setShowTemplates(false)}
            onApply={handleApplyTemplate}
          />
        )}

        {/* Helpful Note */}
        <Card className="rnrb-card mt-8 border-purple-500/20 bg-purple-500/5 p-6">
          <p className="text-brand-primary mb-1 flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Pro Tip: Building Your Set
          </p>
          <p className="text-muted-foreground text-xs">
            Start strong, dip in the middle for intimacy, build to your biggest song. Watch key
            changes (too many can tire your voice). Share your setlist in project chat for band
            feedback!
          </p>
        </Card>
      </div>
    </div>
  );
}
