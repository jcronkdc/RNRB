'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Headphones,
  Trash2,
  Upload,
  Maximize2,
  Music,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Track = {
  id: string;
  trackName: string;
  trackType: string;
  audioUrl: string;
  duration: number | null;
  volume: number;
  pan: number;
  solo: boolean;
  mute: boolean;
  order: number;
  color: string | null;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
};

type StemsMixerProps = {
  songId: string;
  onTrackUpload?: () => void;
};

export function StemsMixer({ songId, onTrackUpload }: StemsMixerProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, [songId]);

  const loadTracks = async () => {
    try {
      const response = await fetch(`/api/songs/${songId}/tracks`);
      if (!response.ok) throw new Error('Failed to load tracks');
      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTrack = async (trackId: string, updates: Partial<Track>) => {
    try {
      const response = await fetch(`/api/songs/${songId}/tracks/${trackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update track');

      // Optimistically update UI
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, ...updates } : t))
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      await loadTracks(); // Reload on error
    }
  };

  const bulkUpdateTracks = async (updates: Array<{ trackId: string; [key: string]: any }>) => {
    try {
      const response = await fetch(`/api/songs/${songId}/tracks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) throw new Error('Failed to update tracks');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSolo = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    const newSoloState = !track?.solo;

    // If soloing, mute all others
    if (newSoloState) {
      const updates = tracks.map((t) => ({
        trackId: t.id,
        solo: t.id === trackId,
        mute: t.id !== trackId,
      }));
      bulkUpdateTracks(updates);
      
      setTracks((prev) =>
        prev.map((t) => ({
          ...t,
          solo: t.id === trackId,
          mute: t.id !== trackId,
        }))
      );
    } else {
      // Un-solo: unmute all
      const updates = tracks.map((t) => ({
        trackId: t.id,
        solo: false,
        mute: false,
      }));
      bulkUpdateTracks(updates);
      
      setTracks((prev) =>
        prev.map((t) => ({
          ...t,
          solo: false,
          mute: false,
        }))
      );
    }
  };

  const handleDelete = async (trackId: string) => {
    if (!confirm('Delete this track? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/songs/${songId}/tracks/${trackId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete track');
      
      await loadTracks();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getTrackColor = (trackType: string) => {
    const colors: Record<string, string> = {
      vocal_lead: 'bg-blue-500',
      vocal_harmony: 'bg-cyan-500',
      guitar_electric: 'bg-orange-500',
      guitar_acoustic: 'bg-amber-500',
      guitar_bass: 'bg-purple-500',
      drums: 'bg-red-500',
      piano: 'bg-pink-500',
      synth: 'bg-green-500',
      master: 'bg-gray-500',
    };
    return colors[trackType] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading mixer...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">Error: {error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-brand-primary" />
          <h2 className="text-xl font-semibold">Multi-Track Mixer</h2>
          <span className="text-muted-foreground text-sm">({tracks.length} tracks)</span>
        </div>
        <Button
          onClick={onTrackUpload}
          className="rnrb-button-primary flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Track
        </Button>
      </div>

      {/* Mixer */}
      {tracks.length === 0 ? (
        <Card className="p-8 text-center">
          <Music className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">No tracks uploaded yet</p>
          <p className="text-muted-foreground mb-6 text-sm">
            Upload individual stems (vocals, instruments) to create a professional mix
          </p>
          <Button onClick={onTrackUpload} className="rnrb-button-primary">
            <Upload className="mr-2 h-4 w-4" />
            Upload First Track
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`p-4 transition-all ${
                  track.solo
                    ? 'border-brand-primary bg-brand-primary/5'
                    : track.mute
                      ? 'opacity-50'
                      : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Track Color & Type */}
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-1 rounded-full ${getTrackColor(track.trackType)}`} />
                    <div className="w-32">
                      <p className="truncate font-semibold">{track.trackName}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {track.trackType.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Volume Fader */}
                  <div className="flex flex-1 items-center gap-3">
                    <Volume2 className="text-muted-foreground h-4 w-4" />
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={track.volume}
                      onChange={(e) =>
                        updateTrack(track.id, { volume: parseFloat(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-muted-foreground w-12 text-right text-sm">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>

                  {/* Pan Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">Pan</span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={track.pan}
                      onChange={(e) => updateTrack(track.id, { pan: parseFloat(e.target.value) })}
                      className="w-24"
                    />
                    <span className="text-muted-foreground w-8 text-right text-xs">
                      {track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSolo(track.id)}
                      className={track.solo ? 'bg-brand-primary text-white' : ''}
                    >
                      <Headphones className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateTrack(track.id, { mute: !track.mute })}
                      className={track.mute ? 'bg-red-500 text-white' : ''}
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(track.id)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Waveform Placeholder */}
                <div className="bg-surface-muted mt-3 h-12 rounded-lg">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-muted-foreground text-xs">Waveform visualization</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Master Controls */}
      {tracks.length > 0 && (
        <Card className="border-brand-primary/50 bg-brand-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Maximize2 className="text-brand-primary h-5 w-5" />
              <span className="font-semibold">Master Output</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => {
                  const updates = tracks.map((t) => ({
                    trackId: t.id,
                    volume: 1.0,
                    pan: 0.0,
                    solo: false,
                    mute: false,
                  }));
                  bulkUpdateTracks(updates);
                  loadTracks();
                }}
              >
                Reset All
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}



