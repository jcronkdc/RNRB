'use client';

/**
 * SPOTIFY IMPORT MODAL
 *
 * Allows users to import Spotify playlists into their project as songs
 * Flow:
 * 1. Click "Import from Spotify"
 * 2. OAuth to Spotify
 * 3. Select playlist
 * 4. Review songs
 * 5. Import (auto-creates songs in project)
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Music, X, Check, AlertCircle, Loader2, ExternalLink } from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

type SpotifyPlaylist = {
  id: string;
  name: string;
  description?: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
};

type SpotifySong = {
  title: string;
  artist: string;
  duration: number;
  tempo?: number;
  spotifyId: string;
  albumArt?: string;
};

export function SpotifyImportModal({
  projectId,
  onClose,
  onImportComplete,
}: {
  projectId: string;
  onClose: () => void;
  onImportComplete: (importedCount: number) => void;
}) {
  const [step, setStep] = useState<'auth' | 'playlists' | 'songs' | 'importing' | 'complete'>(
    'auth'
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [songs, setSongs] = useState<SpotifySong[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(
    null
  );

  const initiateSpotifyAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/spotify/auth');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Spotify auth');
      }

      // Redirect to Spotify auth
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const fetchPlaylists = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/spotify/playlists?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch playlists');
      }

      setPlaylists(data.playlists);
      setStep('playlists');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistTracks = async (playlistId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/spotify/playlists/${playlistId}/tracks?token=${accessToken}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tracks');
      }

      setSongs(data.songs);
      // Select all songs by default
      setSelectedSongs(new Set(data.songs.map((s: SpotifySong) => s.spotifyId)));
      setStep('songs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const importSongs = async () => {
    try {
      setStep('importing');
      setError(null);

      const songsToImport = songs.filter((s) => selectedSongs.has(s.spotifyId));

      const response = await fetch('/api/spotify/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          songs: songsToImport,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import songs');
      }

      setImportResult(data);
      setStep('complete');

      // Wait 2s then close and notify parent
      setTimeout(() => {
        onImportComplete(data.imported);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('songs');
    }
  };

  const toggleSongSelection = (spotifyId: string) => {
    setSelectedSongs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(spotifyId)) {
        newSet.delete(spotifyId);
      } else {
        newSet.add(spotifyId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check URL params for access token (from OAuth callback)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setAccessToken(token);
        fetchPlaylists(token);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden"
      >
        <Card className="rnrb-card p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <Music className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Import from Spotify</h2>
                <p className="text-sm text-muted-foreground">
                  Add songs from your Spotify playlists to this project
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-400">Error</h4>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Step: Auth */}
          {step === 'auth' && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <Music className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Connect to Spotify</h3>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                We'll access your playlists to help you quickly populate this project with songs. We
                won't modify your Spotify account.
              </p>
              <Button
                onClick={initiateSpotifyAuth}
                disabled={loading}
                className="rnrb-button-primary inline-flex items-center gap-3 rounded-xl px-8 py-3 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-5 w-5" />
                    Connect Spotify Account
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step: Playlists */}
          {step === 'playlists' && (
            <div className="max-h-[600px] overflow-y-auto">
              <h3 className="mb-4 text-lg font-semibold">Select a Playlist</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      fetchPlaylistTracks(playlist.id);
                    }}
                    className="rounded-lg border border-transparent bg-surface-muted p-4 text-left transition-all hover:border-brand-primary/30 hover:bg-surface"
                  >
                    <div className="flex gap-3">
                      {playlist.images[0] ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded bg-brand-primary/20">
                          <Music className="h-8 w-8 text-brand-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold">{playlist.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {playlist.tracks.total} songs
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Songs */}
          {step === 'songs' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Select Songs to Import</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSongs.size} of {songs.length} songs selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSongs(new Set(songs.map((s) => s.spotifyId)))}
                  >
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSongs(new Set())}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="mb-6 max-h-[400px] space-y-2 overflow-y-auto">
                {songs.map((song) => (
                  <button
                    key={song.spotifyId}
                    onClick={() => toggleSongSelection(song.spotifyId)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedSongs.has(song.spotifyId)
                        ? 'border-brand-primary/30 bg-brand-primary/10'
                        : 'border-transparent bg-surface-muted hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          selectedSongs.has(song.spotifyId)
                            ? 'border-brand-primary bg-brand-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedSongs.has(song.spotifyId) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{song.title}</div>
                        <div className="truncate text-sm text-muted-foreground">{song.artist}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('playlists')} className="flex-1">
                  Back to Playlists
                </Button>
                <Button
                  onClick={importSongs}
                  disabled={selectedSongs.size === 0}
                  className="rnrb-button-primary flex-1"
                >
                  Import {selectedSongs.size} Songs
                </Button>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-brand-primary" />
              <h3 className="mb-2 text-xl font-semibold">Importing Songs...</h3>
              <p className="text-muted-foreground">This will only take a moment</p>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && importResult && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Import Complete!</h3>
              <p className="mb-4 text-muted-foreground">
                {importResult.imported} songs added to your project
                {importResult.skipped > 0 && ` (${importResult.skipped} duplicates skipped)`}
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
