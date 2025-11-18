'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  ArrowLeft, 
  Music, 
  Edit, 
  Save, 
  Users,
  MessageSquare,
  Upload,
  Download,
  Play,
  Sparkles,
  FileText,
  Mic2,
  Instagram,
  Facebook,
  Twitter,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import chat for song-level collaboration
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then(m => m.ChatRoom), { ssr: false });
const SocialMediaGenerator = dynamic(() => import('@/components/social-media-generator').then(m => m.SocialMediaGenerator), { ssr: false });

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const songId = params?.songId as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'lyrics' | 'audio' | 'chat' | 'share'>('details');

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
      
      const foundSong = foundProject.songs?.find((s: any) => s.id === songId);
      if (!foundSong) {
        router.push(`/projects/${slug}`);
        return;
      }
      
      setProject(foundProject);
      setSong(foundSong);
      setLoading(false);
    });
  }, [router, slug, songId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading song...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="rnrb-container max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/projects" className="hover:text-brand-primary transition">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${slug}`} className="hover:text-brand-primary transition">{project.name}</Link>
          <span>/</span>
          <span className="text-foreground">{song.title}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">{song.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {song.key && <span>Key: {song.key}</span>}
              {song.tempo && <span>• {song.tempo} BPM</span>}
              {song.time_signature && <span>• {song.time_signature}</span>}
            </div>
          </div>
          <Button
            onClick={() => setEditing(!editing)}
            variant={editing ? 'secondary' : 'default'}
            className="flex items-center gap-2"
          >
            {editing ? (
              <><Save className="w-4 h-4" /> Save Changes</>
            ) : (
              <><Edit className="w-4 h-4" /> Edit Song</>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {['details', 'lyrics', 'audio', 'share', 'chat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium transition capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-brand-primary text-brand-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'chat' && <MessageSquare className="w-4 h-4 inline-block mr-2" />}
              {tab === 'lyrics' && <FileText className="w-4 h-4 inline-block mr-2" />}
              {tab === 'audio' && <Mic2 className="w-4 h-4 inline-block mr-2" />}
              {tab === 'share' && <Sparkles className="w-4 h-4 inline-block mr-2" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 rnrb-card">
                <h3 className="text-2xl font-semibold mb-6">Song Information</h3>
                <div className="space-y-6">
                  {/* Song details form would go here */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Key</label>
                      <input
                        type="text"
                        value={song.key || ''}
                        disabled={!editing}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tempo (BPM)</label>
                      <input
                        type="number"
                        value={song.tempo || ''}
                        disabled={!editing}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time Signature</label>
                      <input
                        type="text"
                        value={song.time_signature || '4/4'}
                        disabled={!editing}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {song.notes && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <p className="text-muted-foreground p-4 bg-surface-muted rounded-lg">{song.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'lyrics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 rnrb-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Lyrics</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      title="AI lyric suggestions coming soon"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Suggest
                    </Button>
                  </div>
                </div>
                <textarea
                  value={song.lyrics || ''}
                  disabled={!editing}
                  placeholder="Write your lyrics here... (AI suggestions coming soon)"
                  className="w-full h-96 px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition resize-none font-mono text-base leading-relaxed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  AI lyric assistant coming soon - get rhyme suggestions, meter improvements, and more
                </p>
              </Card>
            </motion.div>
          )}

          {activeTab === 'audio' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 rnrb-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Audio Files</h3>
                  <div className="text-sm text-muted-foreground">
                    Max 500MB per file • WAV, MP3, AIFF, FLAC
                  </div>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-brand-primary/50 transition cursor-pointer">
                  <Mic2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Upload Your Recording</h4>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Drag and drop your audio file here, or click to browse. Share stems, demos, or final mixes with your collaborators.
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload">
                    <Button className="rnrb-button-primary px-6 py-3 rounded-xl flex items-center gap-2 mx-auto cursor-pointer">
                      <Upload className="w-5 h-5" />
                      Choose Audio File
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1 justify-center">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Supabase Storage integration launching soon - files will be cloud-backed and shareable
                  </p>
                </div>

                {/* Placeholder for uploaded files list */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Music className="w-5 h-5 text-brand-primary" />
                    Uploaded Files
                  </h4>
                  <div className="rnrb-card p-6 bg-surface-muted/50">
                    <p className="text-sm text-muted-foreground text-center">
                      No files uploaded yet. Upload your first recording above.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'share' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 rnrb-card">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    AI Social Media Posts
                  </h3>
                  <p className="text-muted-foreground">
                    Generate Instagram, Facebook, and Twitter posts about "{song.title}". 
                    AI creates 5 options - pick your favorite and edit before posting.
                  </p>
                </div>
                <SocialMediaGenerator
                  songTitle={song.title}
                  projectName={project.name}
                  genre={song.genre || project.genre}
                  key={song.key}
                  tempo={song.tempo}
                />
                <div className="mt-6 rnrb-card p-4 bg-brand-primary/5">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-primary" />
                    <strong>Collaborative:</strong> Share drafts in project chat for team feedback before posting
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="rnrb-card p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-brand-primary" />
                    Song-Level Chat
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Collaborate on "{song.title}" with your team. Discuss lyrics, chords, and production ideas.
                  </p>
                </div>
                <ChatRoom channelName={`song-${songId}`} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Collaborators Section */}
        <Card className="p-6 rnrb-card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              Collaborators on This Song
            </h3>
            <Button size="sm" variant="secondary">
              Add Collaborator
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'You'}</p>
              <p className="text-xs text-muted-foreground">Creator • Full Access</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            💡 Invite collaborators to this specific song for focused collaboration on lyrics, production, and recording
          </p>
        </Card>
      </div>
    </div>
  );
}

