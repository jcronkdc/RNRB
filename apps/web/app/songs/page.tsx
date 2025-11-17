'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Plus, Search, Lock, Users as UsersIcon, Globe } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  lyrics: string;
  key?: string;
  tempo?: number;
  visibility: 'private' | 'org' | 'public';
  createdAt: string;
  updatedAt: string;
  projectId?: string | null;
  collaborators: string[];
}

export default function SongsLibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setSongs(user.user_metadata?.songs || []);
        setLoading(false);
      }
    });
  }, [router]);

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.lyrics.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-400 font-mono text-sm uppercase tracking-widest"
        >
          Loading Library...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 mb-2">
                SONG LIBRARY
              </h1>
              <p className="font-[family-name:var(--rnrb-font-marker)] text-3xl text-white">
                Your Complete Catalog
              </p>
            </div>
            <Link 
              href="/songs/import"
              className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              IMPORT SONGS
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs..."
              className="w-full pl-12 pr-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2 font-mono">
              TOTAL SONGS
            </p>
            <p className="font-[family-name:var(--rnrb-font-marker)] text-3xl text-white">
              {songs.length}
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2 font-mono">
              PRIVATE
            </p>
            <p className="font-[family-name:var(--rnrb-font-marker)] text-3xl text-white">
              {songs.filter(s => s.visibility === 'private').length}
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2 font-mono">
              COLLABORATIONS
            </p>
            <p className="font-[family-name:var(--rnrb-font-marker)] text-3xl text-white">
              {songs.filter(s => s.collaborators?.length > 0).length}
            </p>
          </div>
        </div>

        {/* Songs Grid */}
        {filteredSongs.length === 0 ? (
          songs.length === 0 ? (
            // Empty state - no songs
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="border border-zinc-800 p-12">
                <Music className="w-16 h-16 mx-auto text-zinc-700 mb-6" />
                <h2 className="font-mono text-2xl uppercase tracking-wider mb-4">
                  NO SONGS YET
                </h2>
                <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                  Import your existing songs or create new ones. Everything is private by default.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Link 
                    href="/songs/import"
                    className="px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                  >
                    IMPORT SONGS
                  </Link>
                  <Link 
                    href="/projects"
                    className="px-8 py-4 border border-zinc-800 text-white font-mono text-xs uppercase tracking-widest hover:border-zinc-700 transition-colors"
                  >
                    CREATE PROJECT
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            // No search results
            <div className="text-center py-12">
              <p className="text-zinc-500 mb-2">No songs match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-zinc-600 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
              >
                CLEAR SEARCH
              </button>
            </div>
          )
        ) : (
          // Songs list
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/songs/${song.id}`}>
                  <div className="border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group h-full">
                    {/* Song Card */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Music className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                        <div className="flex items-center gap-2">
                          {song.visibility === 'private' && (
                            <Lock className="w-3 h-3 text-zinc-600" />
                          )}
                          {song.visibility === 'org' && (
                            <UsersIcon className="w-3 h-3 text-blue-500" />
                          )}
                          {song.visibility === 'public' && (
                            <Globe className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-[family-name:var(--rnrb-font-marker)] text-xl mb-2 truncate">
                        {song.title}
                      </h3>
                      
                      <p className="text-xs text-zinc-500 line-clamp-3 mb-4 font-mono">
                        {song.lyrics.substring(0, 120)}...
                      </p>
                      
                      <div className="flex items-center gap-4 font-mono text-xs text-zinc-600">
                        {song.key && <span>KEY: {song.key}</span>}
                        {song.tempo && <span>{song.tempo} BPM</span>}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-800 p-4 bg-black/20">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                          {song.visibility.toUpperCase()}
                        </p>
                        {song.collaborators?.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <UsersIcon className="w-3 h-3" />
                            {song.collaborators.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
