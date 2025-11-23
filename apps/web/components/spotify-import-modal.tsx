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

import { useState, useEffect } from 'react';
import { Button } from '@cronkwaters/ui';
import { Card } from '@cronkwaters/ui';
import { 
  Music,
  X,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [step, setStep] = useState<'auth' | 'playlists' | 'songs' | 'importing' | 'complete'>('auth');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [songs, setSongs] = useState<SpotifySong[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

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
      const response = await fetch(`/api/spotify/playlists/${playlistId}/tracks?token=${accessToken}`);
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

      const songsToImport = songs.filter(s => selectedSongs.has(s.spotifyId));

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
    setSelectedSongs(prev => {
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
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="rnrb-card p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Import from Spotify</h2>
                <p className="text-sm text-muted-foreground">
                  Add songs from your Spotify playlists to this project
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-400">Error</h4>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Step: Auth */}
          {step === 'auth' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Music className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect to Spotify</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We'll access your playlists to help you quickly populate this project with songs.
                We won't modify your Spotify account.
              </p>
              <Button
                onClick={initiateSpotifyAuth}
                disabled={loading}
                className="rnrb-button-primary px-8 py-3 rounded-xl text-lg font-semibold inline-flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Connect Spotify Account
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step: Playlists */}
          {step === 'playlists' && (
            <div className="max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Select a Playlist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      fetchPlaylistTracks(playlist.id);
                    }}
                    className="p-4 rounded-lg bg-surface-muted hover:bg-surface border border-transparent hover:border-brand-primary/30 transition-all text-left"
                  >
                    <div className="flex gap-3">
                      {playlist.images[0] ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-brand-primary/20 flex items-center justify-center">
                          <Music className="w-8 h-8 text-brand-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{playlist.name}</h4>
                        <p className="text-sm text-muted-foreground">{playlist.tracks.total} songs</p>
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
              <div className="flex items-center justify-between mb-4">
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
                    onClick={() => setSelectedSongs(new Set(songs.map(s => s.spotifyId)))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSongs(new Set())}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto space-y-2 mb-6">
                {songs.map(song => (
                  <button
                    key={song.spotifyId}
                    onClick={() => toggleSongSelection(song.spotifyId)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      selectedSongs.has(song.spotifyId)
                        ? 'bg-brand-primary/10 border-brand-primary/30'
                        : 'bg-surface-muted border-transparent hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedSongs.has(song.spotifyId)
                          ? 'bg-brand-primary border-brand-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedSongs.has(song.spotifyId) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{song.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{song.artist}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep('playlists')}
                  className="flex-1"
                >
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
              <Loader2 className="w-16 h-16 mx-auto mb-6 text-brand-primary animate-spin" />
              <h3 className="text-xl font-semibold mb-2">Importing Songs...</h3>
              <p className="text-muted-foreground">This will only take a moment</p>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && importResult && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
              <p className="text-muted-foreground mb-4">
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

