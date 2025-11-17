'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  MessageSquare, 
  Video, 
  Download,
  Save,
  GitBranch,
  Sparkles,
  Users,
  Plus
} from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import dynamic from 'next/dynamic';

// Optimal pathway: Project → Songs → Song Detail (3 clicks to focused collaboration)

// Dynamically import collaboration components
const CleanCollaborativeEditor = dynamic(() => import('@/components/song/clean-collaborative-editor'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 rounded-lg bg-white/5" />
});

const SongChat = dynamic(() => import('@/components/song/song-chat'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 rounded-lg bg-white/5" />
});

export default function SongDetailPage({ params }: { params: { slug: string; songId: string } }) {
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'chat' | 'video'>('lyrics');

  // Mock song data - will be replaced with tRPC
  const song = {
    id: params.songId,
    title: 'Untitled Song',
    key: 'C',
    tempo: 120,
    lyrics: 'Verse 1\nLine one of lyrics here\nLine two of lyrics here\n\nChorus\nChorus line one\nChorus line two',
    versions: [],
    suggestions: []
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Music className="w-8 h-8 text-brand-primary" />
              {song.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Key: {song.key || 'Not set'}</span>
              <span>•</span>
              <span>Tempo: {song.tempo || 'Not set'} BPM</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                3 collaborators
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <GitBranch className="w-4 h-4 mr-2" />
              Versions
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeTab === 'lyrics'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Music className="w-4 h-4" />
            Lyrics & Suggestions
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Song Chat
          </button>
          
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeTab === 'video'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Video className="w-4 h-4" />
            Co-Write Session
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'lyrics' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Master Version</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Auto-saved</span>
                    <span>•</span>
                    <span>{song.suggestions?.length || 0} pending changes</span>
                  </div>
                </div>
                <CleanCollaborativeEditor
                  songId={params.songId}
                  initialLyrics={song.lyrics || ''}
                  changes={[]} // Will be populated from tRPC
                  currentUserName="You" // Will be replaced with real user
                />
              </Card>
            )}
            
            {activeTab === 'chat' && (
              <Card className="p-0 overflow-hidden">
                <SongChat channelName={`rnrb:song:${params.songId}`} songTitle={song.title} />
              </Card>
            )}
            
            {activeTab === 'video' && (
              <Card className="p-6">
                <div className="text-center py-12 space-y-4">
                  <Video className="w-16 h-16 mx-auto text-brand-primary opacity-50" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Co-Writing Video Session</h3>
                    <p className="text-muted-foreground mb-6">
                      Start a video call with your collaborators to write this song together in real-time
                    </p>
                    <Button size="lg" onClick={() => setShowVideo(true)}>
                      <Video className="w-5 h-5 mr-2" />
                      Start Co-Writing Session
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    HD video • Screen sharing • Up to 32 participants • Cloud recording
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Song Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Song Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground block mb-1">Key</label>
                  <input
                    type="text"
                    value={song.key || ''}
                    placeholder="C, Am, G, etc."
                    className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Tempo (BPM)</label>
                  <input
                    type="number"
                    value={song.tempo || ''}
                    placeholder="120"
                    className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
                  />
                </div>
              </div>
            </Card>

            {/* Collaboration Status */}
            <Card className="p-6 bg-brand-primary/5 border-brand-primary/20">
              <h3 className="font-semibold mb-4">Collaboration Active</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Online Now:</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending Suggestions:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Versions Saved:</span>
                  <span className="font-medium">{song.versions.length}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Collaborator
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Save as Version
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Lyrics
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

