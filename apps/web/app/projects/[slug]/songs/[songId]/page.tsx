'use client';

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Edit,
  FileText,
  Loader2,
  MessageSquare,
  Mic2,
  Music,
  Save,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAudioUpload } from '@/hooks/use-audio-upload';
import { supabase } from '@/lib/supabase';
import { formatDateLong } from '@/lib/format-date';

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
const PublishToCommunityModal = dynamic(
  () => import('@/components/publish-to-community-modal').then((m) => m.PublishToCommunityModal),
  { ssr: false }
);
const VersionHistory = dynamic(
  () => import('@/components/version-history').then((m) => m.VersionHistory),
  { ssr: false }
);
const StemsMixer = dynamic(
  () => import('@/components/stems-mixer').then((m) => m.StemsMixer),
  { ssr: false }
);
const CopyrightManager = dynamic(
  () => import('@/components/copyright-manager').then((m) => m.CopyrightManager),
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
  const [activeTab, setActiveTab] = useState<'details' | 'lyrics' | 'audio' | 'versions' | 'stems' | 'copyright' | 'chat' | 'share'>(
    'details'
  );
  const [audioFiles, setAudioFiles] = useState<AudioFileInfo[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-mono text-sm text-muted-foreground"
        >
          Loading song...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="rnrb-container max-w-6xl">
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
          <span className="text-foreground">{song.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display mb-2 text-4xl font-bold">{song.title}</h1>
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
        <div className="mb-6 flex gap-2 border-b border-border overflow-x-auto">
          {['details', 'lyrics', 'audio', 'versions', 'stems', 'copyright', 'share', 'chat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium capitalize transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-brand-primary text-brand-primary'
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
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Tempo (BPM)</label>
                      <input
                        type="number"
                        value={song.tempo || ''}
                        disabled={!editing}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Time Signature</label>
                      <input
                        type="text"
                        value={song.time_signature || '4/4'}
                        disabled={!editing}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {song.notes && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Notes</label>
                      <p className="rounded-lg bg-surface-muted p-4 text-muted-foreground">
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
                  className="h-96 w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 font-mono text-base leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                />
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
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
                  <div className="text-sm text-muted-foreground">
                    Max 500MB per file • WAV, MP3, AIFF, FLAC
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  className={`rounded-xl border-2 border-dashed p-12 text-center transition ${
                    uploading
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'cursor-pointer border-border hover:border-brand-primary/50'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-brand-primary" />
                      <h4 className="mb-2 text-lg font-semibold">
                        Uploading to Supabase Storage...
                      </h4>
                      {progress && (
                        <div className="mx-auto max-w-md">
                          <div className="mb-2 h-2 w-full rounded-full bg-surface-muted">
                            <div
                              className="h-2 rounded-full bg-brand-primary transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(progress.percentage)}% • {formatFileSize(progress.loaded)} /{' '}
                            {formatFileSize(progress.total)}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Mic2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                      <h4 className="mb-2 text-lg font-semibold">Upload Your Recording</h4>
                      <p className="mx-auto mb-4 max-w-md text-muted-foreground">
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
                      <p className="mt-4 text-xs text-muted-foreground">
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
                    <Music className="h-5 w-5 text-brand-primary" />
                    Uploaded Files ({audioFiles.length})
                  </h4>
                  {audioFiles.length === 0 ? (
                    <div className="rnrb-card bg-surface-muted/50 p-6 text-center">
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
                          <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                              <Music className="h-6 w-6 text-brand-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • Uploaded{' '}
                                {formatDateLong(file.uploadedAt)}
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

          {activeTab === 'versions' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <VersionHistory 
                songId={songId}
                onRestore={async (versionId) => {
                  // Reload song data after restore
                  window.location.reload();
                }}
              />
            </motion.div>
          )}

          {activeTab === 'stems' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <StemsMixer 
                songId={songId}
                onTrackUpload={() => {
                  // Could open a modal or navigate to upload
                  alert('Track upload UI coming soon! Use the Audio tab to upload for now.');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'copyright' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-4">
                {/* Save Notice */}
                <Card className="border-blue-500/30 bg-blue-500/5 p-4">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">💡 Auto-Save:</strong> Your copyright information is automatically 
                    saved as you type. Make sure to register your song with your PRO to get official codes!
                  </p>
                </Card>

                <CopyrightManager 
                  songId={songId}
                  songTitle={song?.title}
                  currentCopyright={song?.copyrightInfo}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'share' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Publish to Community Section */}
              <Card className="rnrb-card mb-6 p-8">
                <div className="mb-6">
                  <h3 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
                    <Music className="h-6 w-6 text-blue-400" />
                    Publish to Community
                  </h3>
                  <p className="text-muted-foreground">
                    Share "{song.title}" with the Rock N' Roll Basement community. Get feedback,
                    collaborate with other artists, and build your fanbase.
                  </p>
                </div>
                <Button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center gap-2"
                  disabled={audioFiles.length === 0}
                >
                  <Upload className="h-4 w-4" />
                  Publish to Explore
                </Button>
                {audioFiles.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-500">
                    ⚠️ Upload an audio file in the "Audio Files" tab to publish this song
                  </p>
                )}
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    ✓ Share your music with thousands of artists
                  </p>
                  <p className="flex items-center gap-2">✓ Get real-time feedback and comments</p>
                  <p className="flex items-center gap-2">✓ Track plays, likes, and engagement</p>
                  <p className="flex items-center gap-2">✓ Connect with collaborators</p>
                </div>
              </Card>

              {/* AI Social Media Section */}
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
                <div className="rnrb-card mt-6 bg-brand-primary/5 p-4">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 text-brand-primary" />
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
                    <MessageSquare className="h-6 w-6 text-brand-primary" />
                    Song-Level Chat
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
              <Users className="h-5 w-5 text-brand-primary" />
              Collaborators on This Song
            </h3>
            <Button size="sm" variant="secondary">
              Add Collaborator
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20 font-semibold text-brand-primary">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'You'}
              </p>
              <p className="text-xs text-muted-foreground">Creator • Full Access</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            💡 Invite collaborators to this specific song for focused collaboration on lyrics,
            production, and recording
          </p>
        </Card>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishToCommunityModal
          songId={songId}
          songTitle={song?.title || 'Untitled'}
          audioUrl={audioFiles[0]?.url}
          onClose={() => setShowPublishModal(false)}
          onSuccess={() => {
            // Redirect to explore page after successful publish
            router.push('/explore');
          }}
        />
      )}
    </div>
  );
}
