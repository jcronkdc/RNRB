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

import { useState } from 'react';
import { Button } from '@cronkwaters/ui';
import { Card } from '@cronkwaters/ui';
import { 
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  Wand2,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Generate Setlist</h2>
                <p className="text-sm text-muted-foreground">
                  AI-powered setlist builder with smart song selection
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

          {/* Options */}
          <div className="space-y-6">
            {/* Target Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Set Length
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[45, 60, 90, 120].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setTargetDuration(duration)}
                    className={`p-3 rounded-lg border-2 transition-all ${
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
                  min={15}
                  max={240}
                  className="w-full mt-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                />
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Energy Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setEnergyLevel('high')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    energyLevel === 'high'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-border hover:border-brand-primary/30'
                  }`}
                >
                  <div className="text-lg font-semibold mb-1">🔥 High Energy</div>
                  <div className="text-xs text-muted-foreground">
                    Fast tempo, upbeat songs
                  </div>
                </button>
                <button
                  onClick={() => setEnergyLevel('mixed')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    energyLevel === 'mixed'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-border hover:border-brand-primary/30'
                  }`}
                >
                  <div className="text-lg font-semibold mb-1">🎵 Mixed</div>
                  <div className="text-xs text-muted-foreground">
                    Balanced energy flow
                  </div>
                </button>
                <button
                  onClick={() => setEnergyLevel('mellow')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    energyLevel === 'mellow'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-border hover:border-brand-primary/30'
                  }`}
                >
                  <div className="text-lg font-semibold mb-1">🌙 Mellow</div>
                  <div className="text-xs text-muted-foreground">
                    Slower, intimate songs
                  </div>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-purple-300 mb-1">How it works:</p>
                  <ul className="space-y-1 text-muted-foreground">
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
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="rnrb-button-primary flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
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

