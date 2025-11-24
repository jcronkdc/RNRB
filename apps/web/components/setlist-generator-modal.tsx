'use client';

/**
 * INSTANT SETLIST GENERATOR
 *
 * Generates optimized setlists based on:
 * - Target duration
 * - Energy level preference
 * - Key variety
 * - Tempo flow
 */

import { Button , Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Sparkles, X, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { useState } from 'react';

export function SetlistGeneratorModal({
  projectId,
  onClose,
  onGenerated,
}: {
  projectId: string;
  onClose: () => void;
  onGenerated: (songs: any[]) => void;
}) {
  const [targetDuration, setTargetDuration] = useState(90);
  const [energyLevel, setEnergyLevel] = useState<'high' | 'mixed' | 'mellow'>('mixed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/setlists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          targetDuration,
          energyLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate setlist');
      }

      onGenerated(data.songs);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="rnrb-card p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                <Wand2 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Generate Setlist</h2>
                <p className="text-muted-foreground text-sm">
                  AI-powered setlist builder with smart song selection
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
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-400">Error</h4>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-6">
            {/* Target Duration */}
            <div>
              <label className="mb-2 block text-sm font-medium">Target Set Length</label>
              <div className="grid grid-cols-4 gap-3">
                {[45, 60, 90, 120].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setTargetDuration(duration)}
                    className={`rounded-lg border-2 p-3 transition-all ${
                      targetDuration === duration
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-border hover:border-brand-primary/30'
                    }`}
                  >
                    <div className="text-2xl font-bold">{duration}</div>
                    <div className="text-muted-foreground text-xs">minutes</div>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-muted-foreground text-xs">Custom duration (minutes)</label>
                <input
                  type="number"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(parseInt(e.target.value) || 90)}
                  min={15}
                  max={240}
                  className="border-border bg-surface focus:border-brand-primary focus:ring-brand-primary/20 mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                />
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="mb-2 block text-sm font-medium">Energy Level</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setEnergyLevel('high')}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    energyLevel === 'high'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-border hover:border-brand-primary/30'
                  }`}
                >
                  <div className="mb-1 text-lg font-semibold">🔥 High Energy</div>
                  <div className="text-muted-foreground text-xs">Fast tempo, upbeat songs</div>
                </button>
                <button
                  onClick={() => setEnergyLevel('mixed')}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    energyLevel === 'mixed'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-border hover:border-brand-primary/30'
                  }`}
                >
                  <div className="mb-1 text-lg font-semibold">🎵 Mixed</div>
                  <div className="text-muted-foreground text-xs">Balanced energy flow</div>
                </button>
                <button
                  onClick={() => setEnergyLevel('mellow')}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    energyLevel === 'mellow'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-border hover:border-brand-primary/30'
                  }`}
                >
                  <div className="mb-1 text-lg font-semibold">🌙 Mellow</div>
                  <div className="text-muted-foreground text-xs">Slower, intimate songs</div>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                <div className="text-sm">
                  <p className="mb-1 font-medium text-purple-300">How it works:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Analyzes tempo and key of all songs in your project</li>
                    <li>• Builds optimal flow: strong start, varied middle, powerful end</li>
                    <li>• Avoids too many songs in the same key consecutively</li>
                    <li>• Matches your target duration (within ±5 minutes)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="rnrb-button-primary flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Setlist
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
