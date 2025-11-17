'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Folder, Plus, Music, Edit2, Trash2, Archive } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  type: 'folder' | 'setlist' | 'album' | 'archive';
  songIds: string[];
  color?: string;
  createdAt: string;
}

export default function CollectionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionType, setNewCollectionType] = useState<'folder' | 'setlist' | 'album' | 'archive'>('folder');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setCollections(user.user_metadata?.collections || []);
        setLoading(false);
      }
    });
  }, [router]);

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: `coll_${Date.now()}`,
      name: newCollectionName,
      type: newCollectionType,
      songIds: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...collections, newCollection];
    
    const { error } = await supabase!.auth.updateUser({
      data: {
        ...user?.user_metadata,
        collections: updated,
      },
    });

    if (!error) {
      setCollections(updated);
      setNewCollectionName('');
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm('Delete this collection? Songs will not be deleted.')) return;

    const updated = collections.filter(c => c.id !== id);
    
    const { error } = await supabase!.auth.updateUser({
      data: {
        ...user?.user_metadata,
        collections: updated,
      },
    });

    if (!error) {
      setCollections(updated);
    }
  };

  const songs = user?.user_metadata?.songs || [];

  const getCollectionSongCount = (songIds: string[]) => {
    return songIds.filter(id => songs.some((s: any) => s.id === id)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const typeIcons = {
    folder: Folder,
    setlist: Music,
    album: Music,
    archive: Archive,
  };

  const typeColors = {
    folder: 'from-blue-500/20',
    setlist: 'from-purple-500/20',
    album: 'from-green-500/20',
    archive: 'from-zinc-500/20',
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="rnrb-container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/songs" 
            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-4"
          >
            ← BACK TO LIBRARY
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Collections & Folders
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Organize your songs however you want: setlists, albums, work-in-progress folders, open mic material, future projects - anything.
          </p>
        </div>

        {/* Create New Collection */}
        <div className="rnrb-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name (e.g. 'Open Mic Set', 'Future Album Ideas')"
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && createCollection()}
              />
            </div>
            
            <select
              value={newCollectionType}
              onChange={(e) => setNewCollectionType(e.target.value as any)}
              className="px-4 py-3 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none"
            >
              <option value="folder">📁 Folder</option>
              <option value="setlist">🎵 Setlist</option>
              <option value="album">💿 Album</option>
              <option value="archive">📦 Archive</option>
            </select>
          </div>
          
          <button
            onClick={createCollection}
            disabled={!newCollectionName.trim()}
            className="mt-4 rnrb-button-primary px-6 py-2 rounded-lg disabled:opacity-50"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            CREATE COLLECTION
          </button>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="text-center py-20 rnrb-card">
            <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first collection to organize songs
            </p>
            <div className="flex gap-4 justify-center text-sm text-muted-foreground">
              <div>📁 Work in Progress</div>
              <div>🎵 Setlists</div>
              <div>💿 Albums</div>
              <div>📦 Archives</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, index) => {
              const Icon = typeIcons[collection.type];
              const songCount = getCollectionSongCount(collection.songIds);
              
              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/songs/collections/${collection.id}`}>
                    <div className={`rnrb-card p-6 cursor-pointer hover:border-brand-primary/50 transition-all bg-gradient-to-br ${typeColors[collection.type]} to-transparent`}>
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="w-8 h-8 text-brand-primary" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteCollection(collection.id);
                          }}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{collection.name}</h3>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{songCount} songs</span>
                        <span className="text-xs uppercase font-mono tracking-wider">
                          {collection.type}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Preset Templates */}
        <div className="mt-12 rnrb-card p-6 bg-muted/20">
          <h3 className="font-semibold mb-4">Quick Start Templates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Open Mic Material', type: 'setlist' as const },
              { name: 'Work in Progress', type: 'folder' as const },
              { name: 'Future Album Ideas', type: 'folder' as const },
              { name: 'Complete Songs', type: 'folder' as const },
              { name: 'Archived Old Stuff', type: 'archive' as const },
              { name: 'Summer Tour Setlist', type: 'setlist' as const },
            ].map((template) => (
              <button
                key={template.name}
                onClick={() => {
                  setNewCollectionName(template.name);
                  setNewCollectionType(template.type);
                }}
                className="p-3 border border-border hover:border-brand-primary/50 rounded-lg text-left text-sm transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
