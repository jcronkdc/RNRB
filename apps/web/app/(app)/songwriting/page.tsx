'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2, Sparkles, Users, MessageSquare } from 'lucide-react';
import { Card } from '@cronkwaters/ui';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Import the drag-drop collaborative songwriting components
const CollaborativeVisualBuilder = dynamic(
  () => import('@/components/songwriting/collaborative-visual-builder').then(m => m.CollaborativeVisualBuilder),
  { ssr: false }
);

const ChordBuilder = dynamic(
  () => import('@/components/songwriting/chord-builder').then(m => m.ChordBuilder),
  { ssr: false }
);

const LyricsAssistant = dynamic(
  () => import('@/components/songwriting/lyrics-assistant').then(m => m.LyricsAssistant),
  { ssr: false }
);

const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then(m => m.PresenceIndicator),
  { ssr: false }
);

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'chord';
  content: string;
  chord?: string;
};

type ChordBlock = {
  id: string;
  chord: string;
  duration?: string;
};

export default function SongwritingPage() {
  const [activeView, setActiveView] = useState<'structure' | 'chords' | 'lyrics'>('structure');
  const [songBlocks, setSongBlocks] = useState<SongBlock[]>([]);
  const [chordProgression, setChordProgression] = useState<ChordBlock[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="rnrb-container max-w-7xl mx-auto py-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Music2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">Collaborative Songwriting Studio</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Drag-and-drop song builder with real-time collaboration
              </p>
            </div>
          </div>
          {user && (
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full">
              <PresenceIndicator
                channelName="songwriting:studio"
                currentUser={{
                  userId: user.id,
                  userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                  userEmail: user.email || '',
                  avatar: user.user_metadata?.avatar_url,
                }}
                location={`songwriting:${activeView}`}
                showDetails={false}
                maxVisible={5}
              />
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveView('structure')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeView === 'structure'
                ? 'text-brand-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Music2 className="w-4 h-4 inline-block mr-2" />
            Song Structure
            {activeView === 'structure' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
              />
            )}
          </button>
          <button
            onClick={() => setActiveView('chords')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeView === 'chords'
                ? 'text-brand-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4 inline-block mr-2" />
            Chord Progression
            {activeView === 'chords' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
              />
            )}
          </button>
          <button
            onClick={() => setActiveView('lyrics')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeView === 'lyrics'
                ? 'text-brand-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline-block mr-2" />
            Lyrics & AI Assist
            {activeView === 'lyrics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === 'structure' && user && (
          <CollaborativeVisualBuilder
            projectSlug="songwriting-studio"
            onSongChange={(blocks) => setSongBlocks(blocks)}
            currentUser={{
              userId: user.id,
              userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            }}
          />
        )}

        {activeView === 'chords' && (
          <div className="space-y-6">
            <Card className="p-6 rnrb-card bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Interactive Chord Progression Builder
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop chords to build your progression. Get AI suggestions for chord sequences that sound great together.
              </p>
            </Card>
            <ChordBuilder onChange={(chords) => setChordProgression(chords)} />
          </div>
        )}

        {activeView === 'lyrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 rnrb-card">
              <h3 className="text-xl font-semibold mb-4">Lyrics Workspace</h3>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Write your lyrics here... Use the AI assistant on the right for help with rhymes, synonyms, and creative suggestions."
                className="w-full h-[600px] px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition resize-none font-mono text-base leading-relaxed"
              />
            </Card>

            <Card className="p-6 rnrb-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Lyrics Assistant
              </h3>
              <LyricsAssistant
                currentLyrics={lyrics}
                onInsert={(text) => setLyrics(prev => prev ? `${prev}\n${text}` : text)}
              />
            </Card>
          </div>
        )}
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="p-6 rnrb-card bg-gradient-to-r from-brand-primary/5 to-purple-500/5 border-brand-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Real-Time Collaboration Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Drag & Drop Song Blocks:</strong> Build song structure with verse, chorus, bridge, and chord blocks</li>
                <li>• <strong>Live Team Chat:</strong> Discuss ideas with collaborators in real-time (expand chat at bottom)</li>
                <li>• <strong>Chord Grid System:</strong> Visual chord progression builder with common chord palette</li>
                <li>• <strong>AI Lyrics Help:</strong> Get rhyme suggestions, synonyms, and creative AI assistance</li>
                <li>• <strong>Export & History:</strong> Save versions, undo/redo, and export your work</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
