'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Music, MessageSquare, Video, ArrowLeft, Save, Undo2, Redo2, GripVertical, Plus, X
} from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import dynamic from 'next/dynamic';

// Dynamically import collaboration components
const SongChat = dynamic(() => import('@/components/song/song-chat'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 rounded-lg bg-white/5" />
});

const SongVideoSession = dynamic(() => import('@/components/song/song-video-session'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-[600px] rounded-lg bg-white/5" />
});

const ChordLyricsEditor = dynamic(() => import('@/components/song/chord-lyrics-editor'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 rounded-lg bg-white/5" />
});

const CollaborativePresence = dynamic(() => import('@/components/song/collaborative-presence'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 rnrb-card" />
});

type SongSection = {
  id: string;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'instrumental';
  label: string;
  lyrics: string;
  chords?: Array<{ position: number; chord: string }>;
};

export default function SongDetailPage({ params }: { params: { slug: string; songId: string } }) {
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'chat' | 'video'>('edit');
  const [showChords, setShowChords] = useState(true);

  // Mock song data - will be replaced with database
  const song = {
    id: params.songId,
    title: 'Untitled Song',
    key: 'C',
    tempo: 120,
    structure: [
      { id: '1', type: 'verse' as const, label: 'Verse 1', lyrics: 'Walking down the road\nCarrying this load', chords: [] },
      { id: '2', type: 'chorus' as const, label: 'Chorus', lyrics: 'Oh these midnight blues\nCan\'t shake these feelings', chords: [] },
    ] as SongSection[],
  };

  const [sections, setSections] = useState<SongSection[]>(song.structure || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);
    
    setSections(newSections);
    setDraggedIndex(index);
  };

  const updateSectionLyrics = (id: string, lyrics: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, lyrics } : s));
  };

  const updateSectionChords = (id: string, chords: Array<{ position: number; chord: string }>) => {
    setSections(sections.map(s => s.id === id ? { ...s, chords } : s));
  };

  const addSection = (type: SongSection['type'], label: string) => {
    const newSection: SongSection = {
      id: Date.now().toString(),
      type,
      label,
      lyrics: '',
      chords: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const SECTION_TEMPLATES = [
    { type: 'intro' as const, label: 'Intro' },
    { type: 'verse' as const, label: 'Verse' },
    { type: 'chorus' as const, label: 'Chorus' },
    { type: 'bridge' as const, label: 'Bridge' },
    { type: 'instrumental' as const, label: 'Instrumental' },
    { type: 'outro' as const, label: 'Outro' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <Link 
            href={`/projects/${params.slug}`}
            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-4"
          >
            ← BACK TO PROJECT
          </Link>
          
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
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 border border-border hover:border-brand-primary rounded transition-colors" title="Undo (Ctrl+Z)">
                <Undo2 className="w-4 h-4" />
              </button>
              <button className="p-2 border border-border hover:border-brand-primary rounded transition-colors" title="Redo (Ctrl+Y)">
                <Redo2 className="w-4 h-4" />
              </button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeTab === 'edit'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Music className="w-4 h-4" />
            Edit Song
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
            Group Chat
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
            Video Meeting
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'edit' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Song Structure</h2>
                  <button
                    onClick={() => setShowChords(!showChords)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      showChords 
                        ? 'bg-brand-primary text-brand-primary-foreground' 
                        : 'border border-border hover:border-brand-primary'
                    }`}
                  >
                    {showChords ? 'CHORDS ON' : 'ADD CHORDS'}
                  </button>
                </div>

                {/* Draggable Sections */}
                <div className="space-y-4 mb-6">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`border border-border rounded-lg p-4 bg-surface transition-all ${
                        draggedIndex === index ? 'opacity-50 scale-95' : 'hover:border-brand-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg text-brand-primary">
                              {section.label}
                            </h3>
                            <button
                              onClick={() => removeSection(section.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {showChords ? (
                            <ChordLyricsEditor
                              songId={`${params.songId}_${section.id}`}
                              initialLyrics={section.lyrics}
                              initialChords={section.chords?.map((c, i) => ({ lineIndex: 0, position: c.position, chord: c.chord })) || []}
                              songKey={song.key}
                              onSave={(newLyrics, newChords) => {
                                updateSectionLyrics(section.id, newLyrics);
                                updateSectionChords(section.id, newChords.map(c => ({ position: c.position, chord: c.chord })));
                              }}
                            />
                          ) : (
                            <textarea
                              value={section.lyrics}
                              onChange={(e) => updateSectionLyrics(section.id, e.target.value)}
                              placeholder={`${section.label} lyrics...`}
                              rows={6}
                              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none font-mono text-sm resize-none"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Section Buttons */}
                <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground mr-2">Add Section:</span>
                  {SECTION_TEMPLATES.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => addSection(template.type, template.label)}
                      className="px-3 py-1.5 bg-surface hover:bg-surface-muted border border-border rounded text-xs font-mono uppercase tracking-wider transition-colors"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {template.label}
                    </button>
                  ))}
                </div>
              </Card>
            )}
            
            {activeTab === 'chat' && (
              <Card className="p-0 overflow-hidden">
                <SongChat channelName={`rnrb:song:${params.songId}`} songTitle={song.title} />
              </Card>
            )}
            
            {activeTab === 'video' && (
              <Card className="p-6">
                {!showVideo ? (
                  <div className="text-center py-12 space-y-4">
                    <Video className="w-16 h-16 mx-auto text-brand-primary opacity-50" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Teams-Style Meeting</h3>
                      <p className="text-muted-foreground mb-6">
                        Start voice or video call with screen sharing to collaborate in real-time
                      </p>
                      <Button size="lg" onClick={() => setShowVideo(true)}>
                        <Video className="w-5 h-5 mr-2" />
                        START MEETING
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Voice-only / HD video / Screen sharing / Cursor control / Up to 32 people
                    </p>
                  </div>
                ) : (
                  <SongVideoSession 
                    songId={params.songId} 
                    songTitle={song.title}
                    mode="voice"
                    onClose={() => setShowVideo(false)}
                  />
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collaborative Presence */}
            <CollaborativePresence
              songId={params.songId}
              currentUserName="You"
              onStartVideo={() => {
                setActiveTab('video');
                setShowVideo(true);
              }}
            />

            {/* Song Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Song Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Key</span>
                  <span className="font-medium">{song.key || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tempo</span>
                  <span className="font-medium">{song.tempo ? `${song.tempo} BPM` : 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sections</span>
                  <span className="font-medium">{sections.length}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="w-full px-4 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm">Open Group Chat</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('video');
                    setShowVideo(true);
                  }}
                  className="w-full px-4 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm">Start Meeting</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}