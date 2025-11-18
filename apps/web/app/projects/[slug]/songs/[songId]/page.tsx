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
import { useAudioUpload } from '@/hooks/use-audio-upload';

// Dynamically import chat for song-level collaboration
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then(m => m.ChatRoom), { ssr: false });
const SocialMediaGenerator = dynamic(() => import('@/components/social-media-generator').then(m => m.SocialMediaGenerator), { ssr: false });
const PresenceIndicator = dynamic(() => import('@/components/presence-indicator').then(m => m.PresenceIndicator), { ssr: false });
const WaveformPlayer = dynamic(() => import('@/components/waveform-player').then(m => m.WaveformPlayer), { ssr: false });

type AudioFileInfo = {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: 'demo' | 'stem' | 'final' | 'reference';
  uploadedAt: string;
  uploadedBy: string;
};

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
  const [audioFiles, setAudioFiles] = useState<AudioFileInfo[]>([]);
  const { upload, uploading, progress, error: uploadError } = useAudioUpload();

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
      // Load audio files from song metadata
      setAudioFiles(foundSong.audioFiles || []);
      setLoading(false);
    });
  }, [router, slug, songId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const result = await upload(file, slug, songId, 'demo');
    if (result) {
      // Add to audio files list
      const newAudioFile: AudioFileInfo = {
        id: `audio_${Date.now()}`,
        name: file.name,
        url: result.url,
        path: result.path,
        size: file.size,
        type: 'demo',
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.email || 'Unknown'
      };

      const updatedAudioFiles = [...audioFiles, newAudioFile];
      setAudioFiles(updatedAudioFiles);

      // Save to song metadata
      const allProjects = user.user_metadata?.projects || [];
      const updatedProjects = allProjects.map((p: any) => {
        if (p.slug === slug) {
          return {
            ...p,
            songs: (p.songs || []).map((s: any) => {
              if (s.id === songId) {
                return { ...s, audioFiles: updatedAudioFiles };
              }
              return s;
            }),
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });

      await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects
        }
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground font-mono text-sm"
        >
          Loading song...
        </motion.div>
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

        {/* Real-time Presence Indicator */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg"
          >
            <PresenceIndicator
              channelName={`song:${slug}:${songId}`}
              currentUser={{
                userId: user.id,
                userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                userEmail: user.email || '',
                avatar: user.user_metadata?.avatar_url,
              }}
              location={`song:${slug}:${songId}:${activeTab}`}
              showDetails={false}
              maxVisible={8}
            />
          </motion.div>
        )}

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
                <div className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
                  uploading ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:border-brand-primary/50 cursor-pointer'
                }`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-16 h-16 text-brand-primary mx-auto mb-4 animate-spin" />
                      <h4 className="text-lg font-semibold mb-2">Uploading to Supabase Storage...</h4>
                      {progress && (
                        <div className="max-w-md mx-auto">
                          <div className="w-full bg-surface-muted rounded-full h-2 mb-2">
                            <div 
                              className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(progress.percentage)}% • {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Mic2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">Upload Your Recording</h4>
                      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                        Share stems, demos, or final mixes with your collaborators. Files stored securely in Supabase.
                      </p>
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.aiff,.flac,.ogg,.m4a"
                        className="hidden"
                        id="audio-upload"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <label htmlFor="audio-upload">
                        <Button className="rnrb-button-primary px-6 py-3 rounded-xl flex items-center gap-2 mx-auto cursor-pointer">
                          <Upload className="w-5 h-5" />
                          Choose Audio File
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-4">
                        Max 500MB • Supports MP3, WAV, AIFF, FLAC, OGG, M4A
                      </p>
                    </>
                  )}
                  {uploadError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{uploadError}</p>
                    </div>
                  )}
                </div>

                {/* Uploaded Files List */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Music className="w-5 h-5 text-brand-primary" />
                    Uploaded Files ({audioFiles.length})
                  </h4>
                  {audioFiles.length === 0 ? (
                    <div className="rnrb-card p-6 bg-surface-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">
                        No files uploaded yet. Upload your first recording above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audioFiles.map((file, index) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="rnrb-card p-6"
                        >
                          {/* File Info Header */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                              <Music className="w-6 h-6 text-brand-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 capitalize">
                              {file.type}
                            </span>
                          </div>

                          {/* Waveform Player */}
                          <WaveformPlayer
                            audioUrl={file.url}
                            audioName={file.name}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
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

