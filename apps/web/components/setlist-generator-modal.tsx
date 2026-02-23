'use client';

/**
 * SETLIST GENERATOR - Honest & Practical
 *
 * What this does:
 * - Saves you 30+ minutes of manual setlist creation
 * - Matches your target duration (±5 min)
 * - Prevents 3+ consecutive songs in same key (vocal health)
 * - Varies tempo to avoid monotony
 *
 * What you'll need:
 * - Songs with key, tempo, and duration metadata
 * - Willingness to tweak the results (it's a tool, not magic)
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  Wand2,
  Zap,
  TrendingUp,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

type EnergyProfile = 'high' | 'balanced' | 'mellow';

export function SetlistGeneratorModal({
  projectId,
  availableSongs,
  onClose,
  onGenerated,
}: {
  projectId: string;
  availableSongs: any[];
  onClose: () => void;
  onGenerated: (data: any) => void;
}) {
  const [targetDuration, setTargetDuration] = useState(90);
  const [energyProfile, setEnergyProfile] = useState<EnergyProfile>('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [requiredSongs, setRequiredSongs] = useState<string[]>([]);
  const [excludedSongs, setExcludedSongs] = useState<string[]>([]);
  const [openingSong, setOpeningSong] = useState<string | null>(null);
  const [closingSong, setClosingSong] = useState<string | null>(null);
  const [avoidKeyJumps, setAvoidKeyJumps] = useState(true);

  // Result display
  const [result, setResult] = useState<any | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/setlists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          targetDuration,
          energyProfile,
          requiredSongs,
          excludedSongs,
          openingSong,
          closingSong,
          avoidKeyJumps,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate setlist');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onGenerated(result);
      onClose();
    }
  };

  const toggleSongRequired = (songId: string) => {
    setRequiredSongs((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const toggleSongExcluded = (songId: string) => {
    setExcludedSongs((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const energyProfiles: {
    id: EnergyProfile;
    name: string;
    icon: any;
    description: string;
    gradient: string;
  }[] = [
    {
      id: 'high',
      name: 'High Energy',
      icon: Zap,
      description: 'Faster tempo songs (130+ BPM preferred)',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      id: 'balanced',
      name: 'Balanced',
      icon: TrendingUp,
      description: 'Mix of tempos for variety',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'mellow',
      name: 'Mellow',
      icon: Heart,
      description: 'Slower tempo songs (< 100 BPM preferred)',
      gradient: 'from-pink-400 to-rose-400',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-orange-500/20 border-orange-500/50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="my-8 w-full max-w-4xl"
      >
        <Card className="rnrb-card p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Setlist Generator</h2>
                <p className="text-sm text-muted-foreground">
                  Algorithmic optimization for faster setlist creation
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-400">Generation Failed</h4>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Results Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-4"
            >
              {/* Overall Score */}
              <div className={`rounded-xl border-2 ${getScoreBg(result.score.overall)} p-6`}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Quality Score</h3>
                    <p className="text-sm text-gray-400">{result.message}</p>
                  </div>
                  <div className={`text-5xl font-black ${getScoreColor(result.score.overall)}`}>
                    {Math.round(result.score.overall)}
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { label: 'Key Variety', value: result.score.keyVariety },
                    { label: 'Tempo Variety', value: result.score.tempoVariety },
                    { label: 'Duration', value: result.score.durationMatch },
                    { label: 'Data Quality', value: result.score.dataQuality },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                        {Math.round(metric.value)}
                      </div>
                      <div className="text-xs text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Warnings */}
                {result.insights.warnings.length > 0 && (
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <h4 className="font-semibold text-yellow-400">Warnings</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-yellow-300">
                      {result.insights.warnings.map((warning: string, i: number) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {result.insights.suggestions.length > 0 && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                      <h4 className="font-semibold text-blue-400">Suggestions</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-blue-300">
                      {result.insights.suggestions.map((suggestion: string, i: number) => (
                        <li key={i}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <div className="text-xs text-gray-400">Total Duration</div>
                  <div className="text-lg font-bold">
                    {Math.floor(result.insights.totalDuration / 60)}min
                  </div>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <div className="text-xs text-gray-400">Songs</div>
                  <div className="text-lg font-bold">{result.songs.length}</div>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <div className="text-xs text-gray-400">Avg Tempo</div>
                  <div className="text-lg font-bold">
                    {Math.round(result.insights.avgTempo)} BPM
                  </div>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <div className="text-xs text-gray-400">Key Changes</div>
                  <div className="text-lg font-bold">{result.insights.keyChanges}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Configuration (hidden when results shown) */}
          {!result && (
            <div className="space-y-6">
              {/* Target Duration */}
              <div>
                <label className="mb-2 block text-sm font-medium">Target Set Length</label>
                <div className="grid grid-cols-4 gap-3">
                  {[45, 60, 90, 120].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setTargetDuration(duration)}
                      disabled={loading}
                      className={`rounded-lg border-2 p-3 transition-all ${
                        targetDuration === duration
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-border hover:border-brand-primary/30'
                      }`}
                    >
                      <div className="text-2xl font-bold">{duration}</div>
                      <div className="text-xs text-muted-foreground">minutes</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-xs text-muted-foreground">Custom duration (minutes)</label>
                  <input
                    type="number"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(parseInt(e.target.value) || 90)}
                    disabled={loading}
                    min={15}
                    max={240}
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              {/* Energy Profile */}
              <div>
                <label className="mb-2 block text-sm font-medium">Energy Profile</label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {energyProfiles.map((profile) => {
                    const Icon = profile.icon;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => setEnergyProfile(profile.id)}
                        disabled={loading}
                        className={`rounded-lg border-2 p-4 text-left transition-all ${
                          energyProfile === profile.id
                            ? 'border-brand-primary bg-brand-primary/10'
                            : 'border-border hover:border-brand-primary/30'
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className={`rounded-lg bg-gradient-to-br ${profile.gradient} p-2`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="font-semibold">{profile.name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{profile.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="rounded-lg border border-border">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  disabled={loading}
                  className="flex w-full items-center justify-between p-4 transition hover:bg-surface-muted"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">Advanced Options</span>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="space-y-4 p-4">
                        {/* Toggles */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={avoidKeyJumps}
                              onChange={(e) => setAvoidKeyJumps(e.target.checked)}
                              disabled={loading}
                              className="h-4 w-4 rounded"
                            />
                            <span className="text-sm">
                              Avoid large key jumps (vocalist-friendly)
                            </span>
                          </label>
                        </div>

                        {/* Song Selection */}
                        {availableSongs && availableSongs.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Song Constraints</div>
                            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-gray-900/50 p-2">
                              {availableSongs.slice(0, 20).map((song: any) => (
                                <div
                                  key={song.id}
                                  className="flex items-center justify-between py-1"
                                >
                                  <span className="text-sm">{song.title}</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => toggleSongRequired(song.id)}
                                      disabled={loading}
                                      className={`rounded px-2 py-0.5 text-xs transition ${
                                        requiredSongs.includes(song.id)
                                          ? 'bg-green-500/20 text-green-400'
                                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                      }`}
                                    >
                                      {requiredSongs.includes(song.id) ? '✓ Required' : 'Require'}
                                    </button>
                                    <button
                                      onClick={() => toggleSongExcluded(song.id)}
                                      disabled={loading}
                                      className={`rounded px-2 py-0.5 text-xs transition ${
                                        excludedSongs.includes(song.id)
                                          ? 'bg-red-500/20 text-red-400'
                                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                      }`}
                                    >
                                      {excludedSongs.includes(song.id) ? '✗ Excluded' : 'Exclude'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Honest Expectations */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                  <div className="text-sm">
                    <p className="mb-1 font-medium text-blue-300">What This Tool Does</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Matches your target duration (±5 minutes)</li>
                      <li>• Prevents 3+ songs in same key (vocal health)</li>
                      <li>• Varies tempo to avoid monotony</li>
                      <li>• Saves you 30+ minutes of manual work</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Quality Warning */}
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                  <div className="text-sm">
                    <p className="mb-1 font-medium text-yellow-300">Realistic Expectations</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Requires songs with key, tempo, duration metadata</li>
                      <li>• You'll likely need to tweak the results</li>
                      <li>• It's a time-saving tool, not magic</li>
                      <li>• Try different settings if first result isn't perfect</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1" disabled={loading}>
              {result ? 'Cancel' : 'Close'}
            </Button>
            {result ? (
              <>
                <Button
                  onClick={() => setResult(null)}
                  variant="secondary"
                  className="flex-1"
                  disabled={loading}
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleApply}
                  className="rnrb-button-primary flex-1"
                  disabled={loading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply Setlist
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="rnrb-button-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Setlist
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
