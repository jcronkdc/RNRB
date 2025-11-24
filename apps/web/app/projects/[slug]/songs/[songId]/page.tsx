'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Music,
  Edit,
  Save,
  Users,
  MessageSquare,
  Upload,
  Sparkles,
  FileText,
  Mic2,
  Loader2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAudioUpload } from '@/hooks/use-audio-upload';
import { supabase } from '@/lib/supabase';

// Dynamically import chat for song-level collaboration
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then((m) => m.ChatRoom), {
  ssr: false,
});
const SocialMediaGenerator = dynamic(
  () => import('@/components/social-media-generator').then((m) => m.SocialMediaGenerator),
  { ssr: false }
);
const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then((m) => m.PresenceIndicator),
  { ssr: false }
);
const WaveformPlayer = dynamic(
  () => import('@/components/waveform-player').then((m) => m.WaveformPlayer),
  { ssr: false }
);

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
  const [activeTab, setActiveTab] = useState<'details' | 'lyrics' | 'audio' | 'chat' | 'share'>(
    'details'
  );
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
        uploadedBy: user.email || 'Unknown',
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
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      });

      await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects,
        },
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
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
    <div className="bg-background min-h-screen px-4 py-12">
      <div className="rnrb-container max-w-6xl">
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
          <span className="text-foreground">{song.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display mb-2 text-4xl font-bold">{song.title}</h1>
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
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
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" /> Edit Song
              </>
            )}
          </Button>
        </div>

        {/* Real-time Presence Indicator */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4"
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
        <div className="border-border mb-6 flex gap-2 border-b">
          {['details', 'lyrics', 'audio', 'share', 'chat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium capitalize transition ${
                activeTab === tab
                  ? 'border-brand-primary text-brand-primary border-b-2'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'chat' && <MessageSquare className="mr-2 inline-block h-4 w-4" />}
              {tab === 'lyrics' && <FileText className="mr-2 inline-block h-4 w-4" />}
              {tab === 'audio' && <Mic2 className="mr-2 inline-block h-4 w-4" />}
              {tab === 'share' && <Sparkles className="mr-2 inline-block h-4 w-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'details' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rnrb-card p-8">
                <h3 className="mb-6 text-2xl font-semibold">Song Information</h3>
                <div className="space-y-6">
                  {/* Song details form would go here */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Key</label>
                      <input
                        type="text"
                        value={song.key || ''}
                        disabled={!editing}
                        className="border-border bg-surface text-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border px-4 py-2 outline-none transition focus:ring-2 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Tempo (BPM)</label>
                      <input
                        type="number"
                        value={song.tempo || ''}
                        disabled={!editing}
                        className="border-border bg-surface text-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border px-4 py-2 outline-none transition focus:ring-2 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Time Signature</label>
                      <input
                        type="text"
                        value={song.time_signature || '4/4'}
                        disabled={!editing}
                        className="border-border bg-surface text-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border px-4 py-2 outline-none transition focus:ring-2 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {song.notes && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Notes</label>
                      <p className="bg-surface-muted text-muted-foreground rounded-lg p-4">
                        {song.notes}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'lyrics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rnrb-card p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">Lyrics</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      title="AI lyric suggestions coming soon"
                    >
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      AI Suggest
                    </Button>
                  </div>
                </div>
                <textarea
                  value={song.lyrics || ''}
                  disabled={!editing}
                  placeholder="Write your lyrics here... (AI suggestions coming soon)"
                  className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 h-96 w-full resize-none rounded-lg border px-4 py-3 font-mono text-base leading-relaxed outline-none transition focus:ring-2 disabled:opacity-50"
                />
                <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  AI lyric assistant coming soon - get rhyme suggestions, meter improvements, and
                  more
                </p>
              </Card>
            </motion.div>
          )}

          {activeTab === 'audio' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rnrb-card p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">Audio Files</h3>
                  <div className="text-muted-foreground text-sm">
                    Max 500MB per file • WAV, MP3, AIFF, FLAC
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  className={`rounded-xl border-2 border-dashed p-12 text-center transition ${
                    uploading
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-border hover:border-brand-primary/50 cursor-pointer'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="text-brand-primary mx-auto mb-4 h-16 w-16 animate-spin" />
                      <h4 className="mb-2 text-lg font-semibold">
                        Uploading to Supabase Storage...
                      </h4>
                      {progress && (
                        <div className="mx-auto max-w-md">
                          <div className="bg-surface-muted mb-2 h-2 w-full rounded-full">
                            <div
                              className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {Math.round(progress.percentage)}% • {formatFileSize(progress.loaded)} /{' '}
                            {formatFileSize(progress.total)}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Mic2 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                      <h4 className="mb-2 text-lg font-semibold">Upload Your Recording</h4>
                      <p className="text-muted-foreground mx-auto mb-4 max-w-md">
                        Share stems, demos, or final mixes with your collaborators. Files stored
                        securely in Supabase.
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
                        <Button className="rnrb-button-primary mx-auto flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3">
                          <Upload className="h-5 w-5" />
                          Choose Audio File
                        </Button>
                      </label>
                      <p className="text-muted-foreground mt-4 text-xs">
                        Max 500MB • Supports MP3, WAV, AIFF, FLAC, OGG, M4A
                      </p>
                    </>
                  )}
                  {uploadError && (
                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                      <p className="text-sm text-red-400">{uploadError}</p>
                    </div>
                  )}
                </div>

                {/* Uploaded Files List */}
                <div className="mt-6">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold">
                    <Music className="text-brand-primary h-5 w-5" />
                    Uploaded Files ({audioFiles.length})
                  </h4>
                  {audioFiles.length === 0 ? (
                    <div className="rnrb-card bg-surface-muted/50 p-6 text-center">
                      <p className="text-muted-foreground text-sm">
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
                          <div className="mb-4 flex items-center gap-4">
                            <div className="bg-brand-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                              <Music className="text-brand-primary h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{file.name}</p>
                              <p className="text-muted-foreground text-sm">
                                {formatFileSize(file.size)} • Uploaded{' '}
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium capitalize text-green-400">
                              {file.type}
                            </span>
                          </div>

                          {/* Waveform Player */}
                          <WaveformPlayer audioUrl={file.url} audioName={file.name} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'share' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rnrb-card p-8">
                <div className="mb-6">
                  <h3 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                    AI Social Media Posts
                  </h3>
                  <p className="text-muted-foreground">
                    Generate Instagram, Facebook, and Twitter posts about "{song.title}". AI creates
                    5 options - pick your favorite and edit before posting.
                  </p>
                </div>
                <SocialMediaGenerator
                  songTitle={song.title}
                  projectName={project.name}
                  genre={song.genre || project.genre}
                  key={song.key}
                  tempo={song.tempo}
                />
                <div className="rnrb-card bg-brand-primary/5 mt-6 p-4">
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <MessageSquare className="text-brand-primary h-4 w-4" />
                    <strong>Collaborative:</strong> Share drafts in project chat for team feedback
                    before posting
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rnrb-card p-6">
                <div className="mb-4">
                  <h3 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
                    <MessageSquare className="text-brand-primary h-6 w-6" />
                    Song-Level Chat
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Collaborate on "{song.title}" with your team. Discuss lyrics, chords, and
                    production ideas.
                  </p>
                </div>
                <ChatRoom channelName={`song-${songId}`} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Collaborators Section */}
        <Card className="rnrb-card mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Users className="text-brand-primary h-5 w-5" />
              Collaborators on This Song
            </h3>
            <Button size="sm" variant="secondary">
              Add Collaborator
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary/20 text-brand-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'You'}
              </p>
              <p className="text-muted-foreground text-xs">Creator • Full Access</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            💡 Invite collaborators to this specific song for focused collaboration on lyrics,
            production, and recording
          </p>
        </Card>
      </div>
    </div>
  );
}
