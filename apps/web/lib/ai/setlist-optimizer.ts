/**
 * SETLIST OPTIMIZER
 * 
 * Algorithmic setlist generation focused on:
 * - Duration matching (hit your target set length)
 * - Key variety (prevent 3+ consecutive same keys - vocal health)
 * - Tempo pacing (avoid monotonous energy levels)
 * - Constraint satisfaction (require/exclude specific songs)
 * 
 * HONEST EXPECTATIONS:
 * - This is a TIME-SAVING TOOL, not magic
 * - Requires good song metadata (key, tempo, duration)
 * - Generates multiple options, picks best by scoring
 * - You'll likely need to tweak the results
 */

export type Song = {
  id: string;
  title: string;
  key?: string | null;
  tempo?: number | null;
  duration?: number | null;
  genre?: string | null;
  popularity?: number | null; // 0-100
  energy?: number | null; // 0-100
  acousticness?: number | null; // 0-100
};

export type OptimizerOptions = {
  // Duration constraints
  targetDuration: number; // minutes
  allowedDeviation?: number; // minutes (default: 5)

  // Energy preferences (affects tempo selection)
  energyProfile: 'high' | 'balanced' | 'mellow';

  // Song constraints
  requiredSongs?: string[]; // Song IDs that must be included
  excludedSongs?: string[]; // Song IDs to exclude
  openingSong?: string; // Force specific opener
  closingSong?: string; // Force specific closer

  // Key preferences
  avoidKeyJumps?: boolean; // Minimize key changes (default: true)

  // Genre mixing
  genreBalance?: 'mixed' | 'focused'; // How to distribute genres

  // Advanced
  minimumSongCount?: number; // Ensure at least N songs
  maximumSongCount?: number; // Cap at N songs
};

export type SetlistScore = {
  overall: number; // 0-100 (weighted average of components)
  keyVariety: number; // 0-100 (avoids consecutive same keys)
  tempoVariety: number; // 0-100 (prevents monotonous pacing)
  durationMatch: number; // 0-100 (how close to target length)
  dataQuality: number; // 0-100 (how much metadata is present)
};

export type OptimizedSetlist = {
  songs: Song[];
  score: SetlistScore;
  insights: {
    totalDuration: number;
    avgTempo: number;
    keyChanges: number;
    missingData: {
      noKey: number;
      noTempo: number;
      noDuration: number;
    };
    warnings: string[];
    suggestions: string[];
  };
};

/**
 * Generate optimized setlist
 * 
 * Strategy:
 * 1. Generate multiple candidate setlists (3 different approaches)
 * 2. Score each on: key variety, tempo variety, duration match, data quality
 * 3. Return best-scoring candidate
 * 4. Post-process for minor improvements (forced opener/closer, key swaps)
 */
export function generateOptimalSetlist(
  availableSongs: Song[],
  options: OptimizerOptions
): OptimizedSetlist {
  // Validate we have songs
  if (availableSongs.length === 0) {
    return {
      songs: [],
      score: { overall: 0, keyVariety: 0, tempoVariety: 0, durationMatch: 0, dataQuality: 0 },
      insights: {
        totalDuration: 0,
        avgTempo: 0,
        keyChanges: 0,
        missingData: { noKey: 0, noTempo: 0, noDuration: 0 },
        warnings: ['No songs available'],
        suggestions: ['Add songs to your project first'],
      },
    };
  }

  // Step 1: Analyze song metadata quality
  const { pool, metadata } = categorizeSongs(availableSongs, options);

  // Step 2: Apply hard constraints (required/excluded songs)
  const constrainedPool = applyConstraints(pool, options);

  // Step 3: Generate candidate setlists (3 different approaches)
  const candidates = generateCandidates(constrainedPool, options, metadata);

  // Step 4: Score and rank candidates
  const scored = candidates.map(candidate => ({
    setlist: candidate,
    score: scoreSetlist(candidate, options, metadata),
  }));

  // Step 5: Select best candidate
  scored.sort((a, b) => b.score.overall - a.score.overall);
  const best = scored[0];

  if (!best) {
    return {
      songs: [],
      score: { overall: 0, keyVariety: 0, tempoVariety: 0, durationMatch: 0, dataQuality: 0 },
      insights: {
        totalDuration: 0,
        avgTempo: 0,
        keyChanges: 0,
        missingData: metadata.missingData,
        warnings: ['Could not generate setlist from available songs'],
        suggestions: ['Check that songs have duration metadata'],
      },
    };
  }

  // Step 6: Post-process optimization (minor tweaks)
  const optimized = postProcessSetlist(best.setlist, options, metadata);
  const finalScore = scoreSetlist(optimized, options, metadata);

  // Step 7: Generate insights and recommendations
  const insights = generateInsights(optimized, finalScore, metadata);

  return {
    songs: optimized,
    score: finalScore,
    insights,
  };
}

/**
 * Categorize songs by energy, tempo, key, genre
 */
function categorizeSongs(songs: Song[], options: OptimizerOptions) {
  const metadata = {
    energyDistribution: { high: 0, medium: 0, low: 0 },
    tempoRange: { min: Infinity, max: 0, avg: 0 },
    keyFrequency: {} as Record<string, number>,
    genreFrequency: {} as Record<string, number>,
    avgDuration: 0,
  };

  const categorized = songs.map(song => {
    // Calculate energy level (from tempo if not provided)
    let energy = song.energy;
    if (!energy && song.tempo) {
      energy = tempoToEnergy(song.tempo);
    }

    // Track metadata
    if (energy) {
      if (energy >= 70) metadata.energyDistribution.high++;
      else if (energy >= 40) metadata.energyDistribution.medium++;
      else metadata.energyDistribution.low++;
    }

    if (song.tempo) {
      metadata.tempoRange.min = Math.min(metadata.tempoRange.min, song.tempo);
      metadata.tempoRange.max = Math.max(metadata.tempoRange.max, song.tempo);
    }

    if (song.key) {
      metadata.keyFrequency[song.key] = (metadata.keyFrequency[song.key] || 0) + 1;
    }

    if (song.genre) {
      metadata.genreFrequency[song.genre] = (metadata.genreFrequency[song.genre] || 0) + 1;
    }

    return { ...song, energy };
  });

  // Calculate averages
  const tempos = categorized.filter(s => s.tempo).map(s => s.tempo!);
  metadata.tempoRange.avg = tempos.length > 0 
    ? tempos.reduce((sum, t) => sum + t, 0) / tempos.length 
    : 120;

  metadata.avgDuration = categorized.length > 0
    ? categorized.reduce((sum, s) => sum + (s.duration || 180), 0) / categorized.length
    : 180;

  return { pool: categorized, metadata };
}

/**
 * Apply hard constraints (required/excluded songs)
 */
function applyConstraints(pool: Song[], options: OptimizerOptions): Song[] {
  let filtered = pool;

  // Remove excluded songs
  if (options.excludedSongs && options.excludedSongs.length > 0) {
    filtered = filtered.filter(s => !options.excludedSongs!.includes(s.id));
  }

  return filtered;
}

/**
 * Generate multiple candidate setlists using different strategies
 */
function generateCandidates(
  pool: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[][] {
  const candidates: Song[][] = [];

  // Strategy 1: Energy-based (follow energy profile)
  candidates.push(generateEnergyBasedSetlist(pool, options, metadata));

  // Strategy 2: Popularity-weighted (crowd favorites first)
  if (options.prioritizePopular) {
    candidates.push(generatePopularityBasedSetlist(pool, options, metadata));
  }

  // Strategy 3: Key-optimized (minimize key changes)
  if (options.avoidKeyJumps) {
    candidates.push(generateKeyOptimizedSetlist(pool, options, metadata));
  }

  // Strategy 4: Genre-progressive (smooth genre transitions)
  if (options.genreBalance === 'progressive') {
    candidates.push(generateGenreProgressiveSetlist(pool, options, metadata));
  }

  // Strategy 5: Random shuffle (baseline for comparison)
  candidates.push(generateRandomSetlist(pool, options, metadata));

  return candidates;
}

/**
 * Generate setlist based on energy flow profile
 */
function generateEnergyBasedSetlist(
  pool: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[] {
  const targetSeconds = options.targetDuration * 60;
  const energyCurve = getEnergyCurve(options.energyProfile);

  // Sort pool by energy
  const sorted = [...pool].sort((a, b) => {
    const energyA = a.energy || 50;
    const energyB = b.energy || 50;
    return energyB - energyA;
  });

  const setlist: Song[] = [];
  let currentDuration = 0;
  const usedSongs = new Set<string>();

  // Add required songs first (if any)
  if (options.requiredSongs && options.requiredSongs.length > 0) {
    for (const songId of options.requiredSongs) {
      const song = pool.find(s => s.id === songId);
      if (song) {
        setlist.push(song);
        currentDuration += song.duration || metadata.avgDuration;
        usedSongs.add(song.id);
      }
    }
  }

  // Build setlist following energy curve
  let position = setlist.length;
  const estimatedSongCount = Math.floor(targetSeconds / metadata.avgDuration);

  for (const song of sorted) {
    if (usedSongs.has(song.id)) continue;

    const songDuration = song.duration || metadata.avgDuration;

    // Stop if we exceed target
    if (currentDuration + songDuration > targetSeconds + (options.allowedDeviation || 5) * 60) {
      continue;
    }

    // Check if song matches current position in energy curve
    const curvePosition = position / estimatedSongCount;
    const targetEnergy = energyCurve(curvePosition);
    const songEnergy = song.energy || 50;

    // Allow ±15 energy points tolerance
    if (Math.abs(songEnergy - targetEnergy) <= 15) {
      setlist.push(song);
      currentDuration += songDuration;
      usedSongs.add(song.id);
      position++;
    }

    // Stop if we hit target duration
    if (currentDuration >= targetSeconds - (options.allowedDeviation || 5) * 60) {
      break;
    }
  }

  // Fill remaining time if needed
  if (currentDuration < targetSeconds - (options.allowedDeviation || 5) * 60) {
    for (const song of sorted) {
      if (usedSongs.has(song.id)) continue;

      const songDuration = song.duration || metadata.avgDuration;
      if (currentDuration + songDuration <= targetSeconds + (options.allowedDeviation || 5) * 60) {
        setlist.push(song);
        currentDuration += songDuration;
        usedSongs.add(song.id);
      }

      if (currentDuration >= targetSeconds) break;
    }
  }

  return setlist;
}

/**
 * Generate setlist prioritizing popular songs
 */
function generatePopularityBasedSetlist(
  pool: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[] {
  const sorted = [...pool].sort((a, b) => {
    const popA = a.popularity || 50;
    const popB = b.popularity || 50;
    return popB - popA;
  });

  return buildSetlistFromPool(sorted, options, metadata);
}

/**
 * Generate setlist minimizing key changes
 */
function generateKeyOptimizedSetlist(
  pool: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[] {
  const setlist: Song[] = [];
  const remaining = [...pool];
  const targetSeconds = options.targetDuration * 60;
  let currentDuration = 0;

  // Start with a random song
  let current = remaining[Math.floor(Math.random() * remaining.length)];
  setlist.push(current);
  currentDuration += current.duration || metadata.avgDuration;
  remaining.splice(remaining.indexOf(current), 1);

  // Greedy selection: pick song with closest key
  while (remaining.length > 0 && currentDuration < targetSeconds + (options.allowedDeviation || 5) * 60) {
    const currentKey = current.key;

    // Find song with closest key or same key
    const candidates = remaining
      .map(song => ({
        song,
        keyDistance: currentKey && song.key 
          ? getKeyDistance(currentKey, song.key)
          : 12, // Max distance if no key
      }))
      .sort((a, b) => a.keyDistance - b.keyDistance);

    const next = candidates[0].song;
    const nextDuration = next.duration || metadata.avgDuration;

    if (currentDuration + nextDuration > targetSeconds + (options.allowedDeviation || 5) * 60) {
      break;
    }

    setlist.push(next);
    currentDuration += nextDuration;
    remaining.splice(remaining.indexOf(next), 1);
    current = next;
  }

  return setlist;
}

/**
 * Generate setlist with smooth genre transitions
 */
function generateGenreProgressiveSetlist(
  pool: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[] {
  // Group songs by genre
  const genreGroups: Record<string, Song[]> = {};
  for (const song of pool) {
    const genre = song.genre || 'unknown';
    if (!genreGroups[genre]) genreGroups[genre] = [];
    genreGroups[genre].push(song);
  }

  // Interleave genres for smooth transitions
  const setlist: Song[] = [];
  const targetSeconds = options.targetDuration * 60;
  let currentDuration = 0;

  const genres = Object.keys(genreGroups);
  let genreIndex = 0;

  while (currentDuration < targetSeconds + (options.allowedDeviation || 5) * 60) {
    const genre = genres[genreIndex % genres.length];
    const group = genreGroups[genre];

    if (group.length === 0) {
      genreIndex++;
      continue;
    }

    const song = group.shift()!;
    const songDuration = song.duration || metadata.avgDuration;

    if (currentDuration + songDuration <= targetSeconds + (options.allowedDeviation || 5) * 60) {
      setlist.push(song);
      currentDuration += songDuration;
    }

    genreIndex++;
  }

  return setlist;
}

/**
 * Generate random setlist (baseline)
 */
function generateRandomSetlist(
  pool: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return buildSetlistFromPool(shuffled, options, metadata);
}

/**
 * Build setlist from pre-sorted pool
 */
function buildSetlistFromPool(
  sorted: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[] {
  const setlist: Song[] = [];
  const targetSeconds = options.targetDuration * 60;
  let currentDuration = 0;

  for (const song of sorted) {
    const songDuration = song.duration || metadata.avgDuration;

    if (currentDuration + songDuration > targetSeconds + (options.allowedDeviation || 5) * 60) {
      continue;
    }

    setlist.push(song);
    currentDuration += songDuration;

    if (currentDuration >= targetSeconds) break;
  }

  return setlist;
}

/**
 * Score setlist on multiple dimensions
 */
function scoreSetlist(
  setlist: Song[],
  options: OptimizerOptions,
  metadata: any
): SetlistScore {
  const energyFlow = scoreEnergyFlow(setlist, options);
  const keyVariety = scoreKeyVariety(setlist, options);
  const vocalFatigue = scoreVocalFatigue(setlist, options);
  const pacing = scorePacing(setlist, options);
  const durationMatch = scoreDurationMatch(setlist, options, metadata);

  // Weighted average
  const overall =
    energyFlow * 0.3 +
    keyVariety * 0.2 +
    vocalFatigue * 0.2 +
    pacing * 0.15 +
    durationMatch * 0.15;

  return {
    overall,
    energyFlow,
    keyVariety,
    vocalFatigue,
    pacing,
    durationMatch,
  };
}

/**
 * Score energy flow against target profile
 */
function scoreEnergyFlow(setlist: Song[], options: OptimizerOptions): number {
  if (setlist.length === 0) return 0;

  const energyCurve = getEnergyCurve(options.energyProfile);
  let totalDeviation = 0;

  setlist.forEach((song, index) => {
    const position = index / setlist.length;
    const targetEnergy = energyCurve(position);
    const actualEnergy = song.energy || 50;
    const deviation = Math.abs(targetEnergy - actualEnergy);
    totalDeviation += deviation;
  });

  const avgDeviation = totalDeviation / setlist.length;
  const score = Math.max(0, 100 - avgDeviation * 2);

  return score;
}

/**
 * Score key variety (penalize too many consecutive same keys)
 */
function scoreKeyVariety(setlist: Song[], options: OptimizerOptions): number {
  if (setlist.length <= 1) return 100;

  let penalties = 0;
  let consecutiveSameKey = 1;
  let totalTransitions = 0;

  for (let i = 1; i < setlist.length; i++) {
    const prevKey = setlist[i - 1].key;
    const currentKey = setlist[i].key;

    if (!prevKey || !currentKey) continue;

    totalTransitions++;

    if (prevKey === currentKey) {
      consecutiveSameKey++;
      if (consecutiveSameKey >= 3) {
        penalties += 10; // Heavy penalty for 3+ in a row
      }
    } else {
      consecutiveSameKey = 1;
    }
  }

  const score = Math.max(0, 100 - penalties);
  return score;
}

/**
 * Score vocal fatigue (avoid too many high keys in a row)
 */
function scoreVocalFatigue(setlist: Song[], options: OptimizerOptions): number {
  if (setlist.length === 0) return 100;

  const highKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#'];
  let fatiguePenalty = 0;
  let consecutiveHighKeys = 0;

  for (const song of setlist) {
    if (song.key && highKeys.includes(song.key)) {
      consecutiveHighKeys++;
      if (consecutiveHighKeys >= 3) {
        fatiguePenalty += 15; // Penalty for 3+ high keys in a row
      }
    } else {
      consecutiveHighKeys = 0;
    }
  }

  const score = Math.max(0, 100 - fatiguePenalty);
  return score;
}

/**
 * Score pacing (variation in tempo, not monotonous)
 */
function scorePacing(setlist: Song[], options: OptimizerOptions): number {
  if (setlist.length <= 2) return 100;

  const tempos = setlist.filter(s => s.tempo).map(s => s.tempo!);
  if (tempos.length === 0) return 50;

  // Calculate tempo variance
  const avgTempo = tempos.reduce((sum, t) => sum + t, 0) / tempos.length;
  const variance = tempos.reduce((sum, t) => sum + Math.pow(t - avgTempo, 2), 0) / tempos.length;
  const stdDev = Math.sqrt(variance);

  // Good pacing has moderate variance (not too flat, not too chaotic)
  const idealStdDev = 20; // BPM
  const deviation = Math.abs(stdDev - idealStdDev);
  const score = Math.max(0, 100 - deviation * 2);

  return score;
}

/**
 * Score duration match to target
 */
function scoreDurationMatch(
  setlist: Song[],
  options: OptimizerOptions,
  metadata: any
): number {
  const targetSeconds = options.targetDuration * 60;
  const actualSeconds = setlist.reduce((sum, s) => sum + (s.duration || metadata.avgDuration), 0);
  const deviation = Math.abs(actualSeconds - targetSeconds);
  const deviationMinutes = deviation / 60;

  // Penalty increases with deviation
  const score = Math.max(0, 100 - deviationMinutes * 10);

  return score;
}

/**
 * Post-process optimization: micro-adjustments to improve score
 */
function postProcessSetlist(
  setlist: Song[],
  options: OptimizerOptions,
  metadata: any
): Song[] {
  let optimized = [...setlist];

  // Fix: Force opening song if specified
  if (options.openingSong) {
    const opener = optimized.find(s => s.id === options.openingSong);
    if (opener) {
      optimized = [opener, ...optimized.filter(s => s.id !== options.openingSong)];
    }
  }

  // Fix: Force closing song if specified
  if (options.closingSong) {
    const closer = optimized.find(s => s.id === options.closingSong);
    if (closer) {
      optimized = [...optimized.filter(s => s.id !== options.closingSong), closer];
    }
  }

  // Optimization: Swap adjacent songs to reduce key jump penalties
  if (options.avoidKeyJumps) {
    for (let i = 0; i < optimized.length - 1; i++) {
      const a = optimized[i];
      const b = optimized[i + 1];

      if (!a.key || !b.key) continue;

      // If large key jump, try swapping with next song
      const jumpAB = getKeyDistance(a.key, b.key);
      if (jumpAB >= 6 && i < optimized.length - 2) {
        const c = optimized[i + 2];
        if (c.key) {
          const jumpAC = getKeyDistance(a.key, c.key);
          if (jumpAC < jumpAB) {
            // Swap b and c
            optimized[i + 1] = c;
            optimized[i + 2] = b;
          }
        }
      }
    }
  }

  return optimized;
}

/**
 * Generate insights and recommendations
 */
function generateInsights(
  setlist: Song[],
  score: SetlistScore,
  metadata: any
): OptimizedSetlist['insights'] {
  const totalDuration = setlist.reduce((sum, s) => sum + (s.duration || metadata.avgDuration), 0);
  const tempos = setlist.filter(s => s.tempo).map(s => s.tempo!);
  const avgTempo = tempos.length > 0 ? tempos.reduce((sum, t) => sum + t, 0) / tempos.length : 0;

  // Count key changes
  let keyChanges = 0;
  for (let i = 1; i < setlist.length; i++) {
    if (setlist[i - 1].key && setlist[i].key && setlist[i - 1].key !== setlist[i].key) {
      keyChanges++;
    }
  }

  // Find energy peaks and valleys
  const energyPeaks: number[] = [];
  const energyValleys: number[] = [];

  for (let i = 1; i < setlist.length - 1; i++) {
    const prev = setlist[i - 1].energy || 50;
    const curr = setlist[i].energy || 50;
    const next = setlist[i + 1].energy || 50;

    if (curr > prev && curr > next && curr >= 70) {
      energyPeaks.push(i);
    }
    if (curr < prev && curr < next && curr <= 40) {
      energyValleys.push(i);
    }
  }

  // Generate warnings
  const warnings: string[] = [];

  if (score.energyFlow < 70) {
    warnings.push('Energy flow could be smoother. Consider reordering songs.');
  }
  if (score.keyVariety < 60) {
    warnings.push('Too many consecutive songs in the same key. Vocalists may get fatigued.');
  }
  if (score.vocalFatigue < 70) {
    warnings.push('High vocal range sustained for too long. Add lower-key songs as breaks.');
  }
  if (score.pacing < 60) {
    warnings.push('Tempo variety is low. Mix up fast and slow songs for better dynamics.');
  }
  if (energyPeaks.length === 0) {
    warnings.push('No clear energy peaks. Add high-energy moments to engage crowd.');
  }

  // Generate suggestions
  const suggestions: string[] = [];

  if (score.overall >= 90) {
    suggestions.push('Excellent setlist! Ready for performance.');
  } else if (score.overall >= 75) {
    suggestions.push('Solid setlist. Minor tweaks could improve flow.');
  } else {
    suggestions.push('Consider regenerating with different energy profile.');
  }

  if (totalDuration < metadata.targetDuration * 0.9 * 60) {
    suggestions.push('Setlist is shorter than target. Add 1-2 more songs.');
  }
  if (totalDuration > metadata.targetDuration * 1.1 * 60) {
    suggestions.push('Setlist is longer than target. Remove 1-2 songs.');
  }

  if (energyPeaks.length > 0) {
    suggestions.push(`Energy peaks at song positions: ${energyPeaks.map(p => p + 1).join(', ')}`);
  }

  return {
    totalDuration,
    avgTempo,
    keyChanges,
    energyPeaks,
    energyValleys,
    warnings,
    suggestions,
  };
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Convert tempo (BPM) to energy level (0-100)
 */
function tempoToEnergy(tempo: number): number {
  // Linear mapping: 60 BPM = 0 energy, 180 BPM = 100 energy
  return Math.max(0, Math.min(100, ((tempo - 60) / 120) * 100));
}

/**
 * Get energy curve function based on profile
 */
function getEnergyCurve(profile: OptimizerOptions['energyProfile']): (position: number) => number {
  switch (profile) {
    case 'explosive':
      // Start very high, maintain high energy throughout
      return (t: number) => 85 - t * 10;

    case 'dynamic':
      // Peaks and valleys for dynamic show
      return (t: number) => {
        const wave = Math.sin(t * Math.PI * 2) * 20;
        return 60 + wave;
      };

    case 'balanced':
      // Professional flow: strong start, dip middle, strong finish
      return (t: number) => {
        if (t < 0.2) return 80; // Strong opener
        if (t < 0.4) return 65; // Settle in
        if (t < 0.6) return 55; // Emotional dip
        if (t < 0.8) return 70; // Build momentum
        return 85; // Explosive finish
      };

    case 'intimate':
      // Mellow, emotional show
      return (t: number) => 40 + t * 10;

    case 'crescendo':
      // Build from low to high energy climax
      return (t: number) => 40 + t * 50;

    default:
      return () => 60;
  }
}

/**
 * Calculate distance between two musical keys (0 = same, 12 = maximally distant)
 */
function getKeyDistance(key1: string, key2: string): number {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const idx1 = keys.indexOf(key1);
  const idx2 = keys.indexOf(key2);

  if (idx1 === -1 || idx2 === -1) return 12; // Unknown key = max distance

  const distance = Math.abs(idx1 - idx2);
  return Math.min(distance, 12 - distance); // Circular distance
}

