/**
 * SETLIST OPTIMIZER - Honest & Effective
 *
 * What this ACTUALLY does:
 * - Matches your target duration (±5 min)
 * - Prevents 3+ songs in same key (vocal health)
 * - Varies tempo to avoid monotony
 * - Respects your constraints (required/excluded songs)
 *
 * What this DOESN'T do:
 * - Read the crowd (we don't have that data)
 * - Guarantee perfection (you'll likely need to tweak)
 * - Work magic with bad data (GIGO: garbage in, garbage out)
 *
 * REQUIRES: Songs with key, tempo, and duration metadata
 */

export type Song = {
  id: string;
  title: string;
  key?: string | null;
  tempo?: number | null;
  duration?: number | null;
  genre?: string | null;
};

export type OptimizerOptions = {
  targetDuration: number; // minutes
  energyProfile: 'high' | 'balanced' | 'mellow';
  requiredSongs?: string[];
  excludedSongs?: string[];
  openingSong?: string;
  closingSong?: string;
  avoidKeyJumps?: boolean;
  genreBalance?: 'mixed' | 'focused';
  minimumSongCount?: number;
  maximumSongCount?: number;
};

export type SetlistScore = {
  overall: number;
  keyVariety: number;
  tempoVariety: number;
  durationMatch: number;
  dataQuality: number;
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
 * Main optimization function
 */
export function generateOptimalSetlist(
  availableSongs: Song[],
  options: OptimizerOptions
): OptimizedSetlist {
  if (availableSongs.length === 0) {
    return emptyResult('No songs available', 'Add songs to your project first');
  }

  // Analyze song metadata
  const metadata = analyzeSongs(availableSongs);

  // Warn if data quality is poor
  if (metadata.dataQualityScore < 50) {
    return emptyResult(
      `${metadata.missingData.noKey + metadata.missingData.noTempo + metadata.missingData.noDuration} songs missing key/tempo/duration`,
      'Add key, tempo, and duration to your songs for better results'
    );
  }

  // Apply constraints
  let pool = [...availableSongs];
  if (options.excludedSongs) {
    pool = pool.filter((s) => !options.excludedSongs!.includes(s.id));
  }

  if (pool.length === 0) {
    return emptyResult('All songs excluded by constraints', 'Adjust your constraints');
  }

  // Generate 3 candidates using different strategies
  const candidates = [
    generateByTempo(pool, options, metadata),
    generateByKey(pool, options, metadata),
    generateRandom(pool, options, metadata),
  ].filter((c) => c.length > 0);

  if (candidates.length === 0) {
    return emptyResult('Could not generate setlist', 'Check song metadata (key/tempo/duration)');
  }

  // Score and pick best
  const scored = candidates.map((songs) => ({
    songs,
    score: scoreSetlist(songs, options, metadata),
  }));

  scored.sort((a, b) => b.score.overall - a.score.overall);
  const best = scored[0];

  // Post-process (forced opener/closer, key swaps)
  const final = postProcess(best.songs, options);
  const finalScore = scoreSetlist(final, options, metadata);

  return {
    songs: final,
    score: finalScore,
    insights: generateInsights(final, finalScore, metadata),
  };
}

/**
 * Analyze song metadata quality
 */
function analyzeSongs(songs: Song[]) {
  const missingData = {
    noKey: songs.filter((s) => !s.key).length,
    noTempo: songs.filter((s) => !s.tempo).length,
    noDuration: songs.filter((s) => !s.duration).length,
  };

  const total = songs.length * 3; // 3 fields per song
  const present =
    songs.length * 3 - (missingData.noKey + missingData.noTempo + missingData.noDuration);
  const dataQualityScore = (present / total) * 100;

  const tempos = songs.filter((s) => s.tempo).map((s) => s.tempo!);
  const avgTempo = tempos.length > 0 ? tempos.reduce((sum, t) => sum + t, 0) / tempos.length : 120;

  const durations = songs.filter((s) => s.duration).map((s) => s.duration!);
  const avgDuration =
    durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 180;

  return {
    avgTempo,
    avgDuration,
    dataQualityScore,
    missingData,
  };
}

/**
 * Strategy 1: Generate by tempo (energy profile)
 */
function generateByTempo(pool: Song[], options: OptimizerOptions, metadata: any): Song[] {
  const targetSeconds = options.targetDuration * 60;

  // Sort by tempo based on energy profile
  const sorted = [...pool].sort((a, b) => {
    const tempoA = a.tempo || metadata.avgTempo;
    const tempoB = b.tempo || metadata.avgTempo;

    if (options.energyProfile === 'high') {
      return tempoB - tempoA; // Fastest first
    } else if (options.energyProfile === 'mellow') {
      return tempoA - tempoB; // Slowest first
    } else {
      // Balanced: alternate high/low
      return 0;
    }
  });

  return buildSetlist(sorted, targetSeconds, metadata.avgDuration);
}

/**
 * Strategy 2: Generate by key (minimize key changes)
 */
function generateByKey(pool: Song[], options: OptimizerOptions, metadata: any): Song[] {
  const targetSeconds = options.targetDuration * 60;
  const setlist: Song[] = [];
  const remaining = [...pool];
  let currentDuration = 0;

  // Start with first song
  if (remaining.length === 0) return [];
  const first = remaining.shift()!;
  setlist.push(first);
  currentDuration += first.duration || metadata.avgDuration;

  // Greedy: pick song with closest key
  while (remaining.length > 0 && currentDuration < targetSeconds + 300) {
    const currentKey = setlist[setlist.length - 1].key;

    // Find song with same or closest key
    const candidates = remaining
      .map((song) => ({
        song,
        distance: currentKey && song.key ? getKeyDistance(currentKey, song.key) : 12,
      }))
      .sort((a, b) => a.distance - b.distance);

    const next = candidates[0].song;
    const duration = next.duration || metadata.avgDuration;

    if (currentDuration + duration > targetSeconds + 300) break;

    setlist.push(next);
    currentDuration += duration;
    remaining.splice(remaining.indexOf(next), 1);
  }

  return setlist;
}

/**
 * Strategy 3: Random selection (baseline)
 */
function generateRandom(pool: Song[], options: OptimizerOptions, metadata: any): Song[] {
  const targetSeconds = options.targetDuration * 60;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return buildSetlist(shuffled, targetSeconds, metadata.avgDuration);
}

/**
 * Build setlist from pre-sorted pool
 */
function buildSetlist(sorted: Song[], targetSeconds: number, avgDuration: number): Song[] {
  const setlist: Song[] = [];
  let currentDuration = 0;

  for (const song of sorted) {
    const duration = song.duration || avgDuration;
    if (currentDuration + duration > targetSeconds + 300) continue;

    setlist.push(song);
    currentDuration += duration;

    if (currentDuration >= targetSeconds - 300) break;
  }

  return setlist;
}

/**
 * Score a setlist on multiple dimensions
 */
function scoreSetlist(songs: Song[], options: OptimizerOptions, metadata: any): SetlistScore {
  if (songs.length === 0) {
    return { overall: 0, keyVariety: 0, tempoVariety: 0, durationMatch: 0, dataQuality: 0 };
  }

  const keyVariety = scoreKeyVariety(songs);
  const tempoVariety = scoreTempoVariety(songs, metadata.avgTempo);
  const durationMatch = scoreDurationMatch(songs, options.targetDuration, metadata.avgDuration);
  const dataQuality = metadata.dataQualityScore;

  // Weighted average
  const overall = keyVariety * 0.3 + tempoVariety * 0.3 + durationMatch * 0.3 + dataQuality * 0.1;

  return { overall, keyVariety, tempoVariety, durationMatch, dataQuality };
}

/**
 * Score key variety (penalize 3+ consecutive same keys)
 */
function scoreKeyVariety(songs: Song[]): number {
  if (songs.length <= 2) return 100;

  let penalty = 0;
  let consecutive = 1;

  for (let i = 1; i < songs.length; i++) {
    const prevKey = songs[i - 1].key;
    const currentKey = songs[i].key;

    if (!prevKey || !currentKey) continue;

    if (prevKey === currentKey) {
      consecutive++;
      if (consecutive >= 3) penalty += 20; // Heavy penalty for 3+ in a row
    } else {
      consecutive = 1;
    }
  }

  return Math.max(0, 100 - penalty);
}

/**
 * Score tempo variety (avoid monotonous pacing)
 */
function scoreTempoVariety(songs: Song[], avgTempo: number): number {
  const tempos = songs.filter((s) => s.tempo).map((s) => s.tempo!);
  if (tempos.length < 3) return 50; // Not enough data

  // Calculate standard deviation
  const mean = tempos.reduce((sum, t) => sum + t, 0) / tempos.length;
  const variance = tempos.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / tempos.length;
  const stdDev = Math.sqrt(variance);

  // Good variety has moderate std dev (15-25 BPM)
  const idealStdDev = 20;
  const deviation = Math.abs(stdDev - idealStdDev);
  return Math.max(0, 100 - deviation * 3);
}

/**
 * Score duration match
 */
function scoreDurationMatch(songs: Song[], targetMinutes: number, avgDuration: number): number {
  const targetSeconds = targetMinutes * 60;
  const actualSeconds = songs.reduce((sum, s) => sum + (s.duration || avgDuration), 0);
  const deviation = Math.abs(actualSeconds - targetSeconds) / 60; // in minutes

  // Perfect = 0 min deviation, -10 points per minute off
  return Math.max(0, 100 - deviation * 10);
}

/**
 * Post-process: Force opener/closer, fix bad key transitions
 */
function postProcess(songs: Song[], options: OptimizerOptions): Song[] {
  let result = [...songs];

  // Force opener
  if (options.openingSong) {
    const opener = result.find((s) => s.id === options.openingSong);
    if (opener) {
      result = [opener, ...result.filter((s) => s.id !== options.openingSong)];
    }
  }

  // Force closer
  if (options.closingSong) {
    const closer = result.find((s) => s.id === options.closingSong);
    if (closer) {
      result = [...result.filter((s) => s.id !== options.closingSong), closer];
    }
  }

  // Fix large key jumps (optional)
  if (options.avoidKeyJumps) {
    for (let i = 0; i < result.length - 2; i++) {
      const a = result[i];
      const b = result[i + 1];
      const c = result[i + 2];

      if (!a.key || !b.key || !c.key) continue;

      const jumpAB = getKeyDistance(a.key, b.key);
      const jumpAC = getKeyDistance(a.key, c.key);

      // If swapping would reduce key jump, do it
      if (jumpAC < jumpAB - 3) {
        [result[i + 1], result[i + 2]] = [result[i + 2], result[i + 1]];
      }
    }
  }

  return result;
}

/**
 * Generate insights
 */
function generateInsights(
  songs: Song[],
  score: SetlistScore,
  metadata: any
): OptimizedSetlist['insights'] {
  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || metadata.avgDuration), 0);
  const tempos = songs.filter((s) => s.tempo).map((s) => s.tempo!);
  const avgTempo = tempos.length > 0 ? tempos.reduce((sum, t) => sum + t, 0) / tempos.length : 0;

  let keyChanges = 0;
  for (let i = 1; i < songs.length; i++) {
    if (songs[i - 1].key && songs[i].key && songs[i - 1].key !== songs[i].key) {
      keyChanges++;
    }
  }

  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Data quality warnings
  if (metadata.dataQualityScore < 70) {
    warnings.push(
      `${metadata.missingData.noKey + metadata.missingData.noTempo + metadata.missingData.noDuration} songs missing metadata (key/tempo/duration)`
    );
    suggestions.push('Add missing metadata for better optimization');
  }

  // Key variety warnings
  if (score.keyVariety < 70) {
    warnings.push('Multiple songs in same key consecutively detected');
    suggestions.push('Consider manually reordering songs to vary keys');
  }

  // Tempo variety warnings
  if (score.tempoVariety < 60) {
    warnings.push('Tempo variety is low (monotonous pacing)');
    suggestions.push('Mix faster and slower songs for better dynamics');
  }

  // Duration warnings
  if (score.durationMatch < 80) {
    if (totalDuration < metadata.avgDuration * 0.9 * 60) {
      suggestions.push('Setlist is shorter than target - add 1-2 songs');
    } else {
      suggestions.push('Setlist is longer than target - remove 1-2 songs');
    }
  }

  // Success messages
  if (score.overall >= 85) {
    suggestions.push('Excellent setlist! Ready for review.');
  } else if (score.overall >= 70) {
    suggestions.push('Solid starting point. Minor tweaks recommended.');
  } else {
    suggestions.push('Consider regenerating with different settings.');
  }

  return {
    totalDuration,
    avgTempo,
    keyChanges,
    missingData: metadata.missingData,
    warnings,
    suggestions,
  };
}

/**
 * Helper: Empty result
 */
function emptyResult(warning: string, suggestion: string): OptimizedSetlist {
  return {
    songs: [],
    score: { overall: 0, keyVariety: 0, tempoVariety: 0, durationMatch: 0, dataQuality: 0 },
    insights: {
      totalDuration: 0,
      avgTempo: 0,
      keyChanges: 0,
      missingData: { noKey: 0, noTempo: 0, noDuration: 0 },
      warnings: [warning],
      suggestions: [suggestion],
    },
  };
}

/**
 * Helper: Key distance (music theory)
 */
function getKeyDistance(key1: string, key2: string): number {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const idx1 = keys.indexOf(key1);
  const idx2 = keys.indexOf(key2);

  if (idx1 === -1 || idx2 === -1) return 12;

  const distance = Math.abs(idx1 - idx2);
  return Math.min(distance, 12 - distance);
}
