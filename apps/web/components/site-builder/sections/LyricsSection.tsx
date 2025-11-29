'use client';

import {
  Music,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';

interface Song {
  id: string;
  title: string;
  album?: string;
  albumCover?: string;
  releaseYear?: string;
  lyrics: string;
  writers?: string[];
  producers?: string[];
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
}

interface LyricsSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    songs?: Song[];
    showCredits?: boolean;
    allowSearch?: boolean;
    groupByAlbum?: boolean;
  };
  theme?: Record<string, unknown>;
}

export function LyricsSection({ content, theme }: LyricsSectionProps) {
  const {
    headline = 'Lyrics',
    subheadline = 'Read the words behind the music',
    songs = [],
    showCredits = true,
    allowSearch = true,
    groupByAlbum = false,
  } = content;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSong, setExpandedSong] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter songs by search
  const filteredSongs = songs.filter((song) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.album?.toLowerCase().includes(query) ||
      song.lyrics.toLowerCase().includes(query)
    );
  });

  // Group by album if enabled
  const groupedSongs = groupByAlbum
    ? filteredSongs.reduce(
        (acc, song) => {
          const album = song.album || 'Singles';
          if (!acc[album]) acc[album] = [];
          acc[album].push(song);
          return acc;
        },
        {} as Record<string, Song[]>
      )
    : { 'All Songs': filteredSongs };

  const handleCopyLyrics = (song: Song) => {
    navigator.clipboard.writeText(`${song.title}\n\n${song.lyrics}`);
    setCopiedId(song.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSong = (songId: string) => {
    setExpandedSong(expandedSong === songId ? null : songId);
  };

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Search */}
        {allowSearch && songs.length > 3 && (
          <div className="mb-8">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs or lyrics..."
                className="w-full rounded-xl py-4 pl-12 pr-4"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                Found {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Songs */}
        {Object.entries(groupedSongs).map(([album, albumSongs]) => (
          <div key={album} className="mb-8">
            {groupByAlbum && (
              <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                {album}
              </h2>
            )}
            <div className="space-y-4">
              {albumSongs.map((song) => (
                <div
                  key={song.id}
                  className="overflow-hidden rounded-xl transition-all"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  {/* Song Header */}
                  <button
                    onClick={() => toggleSong(song.id)}
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/5"
                  >
                    {/* Album Cover */}
                    {song.albumCover && (
                      <img
                        src={song.albumCover}
                        alt={song.album || song.title}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}

                    {/* Song Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold" style={{ color: 'var(--text)' }}>
                        {song.title}
                      </h3>
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{ color: 'var(--muted)' }}
                      >
                        {song.album && <span>{song.album}</span>}
                        {song.album && song.releaseYear && <span>•</span>}
                        {song.releaseYear && <span>{song.releaseYear}</span>}
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div style={{ color: 'var(--muted)' }}>
                      {expandedSong === song.id ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedSong === song.id && (
                    <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                      {/* Actions Bar */}
                      <div
                        className="flex flex-wrap items-center gap-2 border-b p-4"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {song.spotifyUrl && (
                          <a
                            href={song.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                            style={{ background: 'var(--bg)', color: 'var(--text)' }}
                          >
                            <Play size={14} />
                            Spotify
                          </a>
                        )}
                        {song.appleMusicUrl && (
                          <a
                            href={song.appleMusicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                            style={{ background: 'var(--bg)', color: 'var(--text)' }}
                          >
                            <Play size={14} />
                            Apple Music
                          </a>
                        )}
                        {song.youtubeUrl && (
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                            style={{ background: 'var(--bg)', color: 'var(--text)' }}
                          >
                            <ExternalLink size={14} />
                            YouTube
                          </a>
                        )}
                        <button
                          onClick={() => handleCopyLyrics(song)}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                          style={{ background: 'var(--bg)', color: 'var(--text)' }}
                        >
                          {copiedId === song.id ? (
                            <>
                              <Check size={14} className="text-green-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy Lyrics
                            </>
                          )}
                        </button>
                      </div>

                      {/* Lyrics */}
                      <div className="p-6">
                        <pre
                          className="whitespace-pre-wrap font-sans leading-relaxed"
                          style={{ color: 'var(--text)' }}
                        >
                          {song.lyrics}
                        </pre>
                      </div>

                      {/* Credits */}
                      {showCredits && (song.writers?.length || song.producers?.length) && (
                        <div
                          className="border-t p-4"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                        >
                          <div className="flex flex-wrap gap-6 text-sm">
                            {song.writers && song.writers.length > 0 && (
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Written by: </span>
                                <span style={{ color: 'var(--text)' }}>
                                  {song.writers.join(', ')}
                                </span>
                              </div>
                            )}
                            {song.producers && song.producers.length > 0 && (
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Produced by: </span>
                                <span style={{ color: 'var(--text)' }}>
                                  {song.producers.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredSongs.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Music size={48} className="mx-auto mb-4 opacity-50" />
            {searchQuery ? (
              <p>No songs found matching &ldquo;{searchQuery}&rdquo;</p>
            ) : (
              <p>No lyrics available yet</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
