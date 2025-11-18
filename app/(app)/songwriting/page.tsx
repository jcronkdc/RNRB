'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2, Sparkles, Users, MessageSquare, Video } from 'lucide-react';
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
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* BADASS Header with Orange Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 border border-orange-500/20 p-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
                <Music2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Collaborative Songwriting Studio</h1>
                <p className="text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  Drag-and-drop builder with real-time collaboration
                </p>
              </div>
            </div>
            {user && (
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
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
        </motion.div>

        {/* Collaboration Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Multi-Cursor</span>
              </div>
            </div>
            <div className="text-sm text-purple-300">
              ✨ All collaboration features active
            </div>
          </div>
        </motion.div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveView('structure')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeView === 'structure'
                ? 'text-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Song Structure
            {activeView === 'structure' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveView('chords')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeView === 'chords'
                ? 'text-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Chord Progressions
            {activeView === 'chords' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveView('lyrics')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeView === 'lyrics'
                ? 'text-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Lyrics Assistant
            {activeView === 'lyrics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeView === 'structure' && user && (
            <CollaborativeVisualBuilder
              projectSlug="songwriting-studio"
              currentUser={{
                userId: user.id,
                userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                userEmail: user.email || '',
                avatar: user.user_metadata?.avatar_url,
              }}
            />
          )}

          {activeView === 'chords' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <ChordBuilder
                onChange={(progression) => {
                  setChordProgression(
                    progression.map((chord, i) => ({
                      id: `chord_${i}`,
                      chord,
                      duration: '1 bar'
                    }))
                  );
                }}
              />
            </div>
          )}

          {activeView === 'lyrics' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <LyricsAssistant
                initialLyrics={lyrics}
                onChange={setLyrics}
              />
            </div>
          )}
        </motion.div>

        {/* Collaboration Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Collaborative Features Active
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Real-time Chat</p>
                <p className="text-gray-400">Message your collaborators while writing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Video Sessions</p>
                <p className="text-gray-400">Face-to-face collaboration with screen share</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Multi-Cursor</p>
                <p className="text-gray-400">See everyone&apos;s cursor in real-time</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
