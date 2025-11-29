import { auth } from '@cronkwaters/auth';
import { NextResponse } from 'next/server';

/**
 * Chord Progression Analyzer - Analyzes chord progressions to detect key and provide insights
 * Uses music theory algorithms to determine:
 * - Most likely key (major/minor)
 * - Chord functions (I, IV, V, etc.)
 * - Common progressions
 * - Suggestions for next chord
 */

// Music theory data
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale intervals

// Common chord progressions by key
const COMMON_PROGRESSIONS = {
  'I-IV-V': ['I', 'IV', 'V'],
  'I-V-vi-IV': ['I', 'V', 'vi', 'IV'], // Very common in pop
  'I-vi-IV-V': ['I', 'vi', 'IV', 'V'],
  'ii-V-I': ['ii', 'V', 'I'], // Jazz standard
  'I-IV-vi-V': ['I', 'IV', 'vi', 'V'],
};

function parseChord(chord: string): {
  root: string;
  quality: 'major' | 'minor' | 'seventh' | 'unknown';
} {
  const clean = chord.trim().toUpperCase();

  // Extract root note
  let root = clean[0];
  if (clean[1] === '#' || clean[1] === 'B') {
    root += clean[1];
  }

  // Determine quality
  let quality: 'major' | 'minor' | 'seventh' | 'unknown' = 'major';
  if (clean.includes('M') && !clean.includes('MAJ')) {
    quality = 'minor';
  } else if (clean.includes('MIN')) {
    quality = 'minor';
  } else if (clean.includes('7')) {
    quality = 'seventh';
  } else if (clean.match(/[A-G]#?B?$/)) {
    quality = 'major';
  }

  return { root, quality };
}

function getNoteIndex(note: string): number {
  return NOTES.indexOf(note.toUpperCase());
}

function analyzeKey(
  chords: string[]
): Array<{ key: string; mode: 'major' | 'minor'; confidence: number }> {
  const results: Array<{ key: string; mode: 'major' | 'minor'; confidence: number }> = [];

  // Parse all chords
  const parsedChords = chords.map(parseChord);

  // Try each note as a potential tonic
  for (let tonicIndex = 0; tonicIndex < NOTES.length; tonicIndex++) {
    const tonic = NOTES[tonicIndex];

    // Test major key
    let majorMatches = 0;
    const majorScale = MAJOR_INTERVALS.map((interval) => NOTES[(tonicIndex + interval) % 12]);

    parsedChords.forEach((chord) => {
      if (majorScale.includes(chord.root)) {
        majorMatches++;
        if (chord.quality === 'major' || chord.quality === 'seventh') {
          majorMatches += 0.5; // Bonus for matching quality
        }
      }
    });

    if (majorMatches > 0) {
      results.push({
        key: `${tonic} major`,
        mode: 'major',
        confidence: (majorMatches / chords.length) * 100,
      });
    }

    // Test minor key
    let minorMatches = 0;
    const minorScale = MINOR_INTERVALS.map((interval) => NOTES[(tonicIndex + interval) % 12]);

    parsedChords.forEach((chord) => {
      if (minorScale.includes(chord.root)) {
        minorMatches++;
        if (chord.quality === 'minor') {
          minorMatches += 0.5; // Bonus for matching quality
        }
      }
    });

    if (minorMatches > 0) {
      results.push({
        key: `${tonic} minor`,
        mode: 'minor',
        confidence: (minorMatches / chords.length) * 100,
      });
    }
  }

  // Sort by confidence and return top 3
  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

function getRomanNumeral(chordRoot: string, keyRoot: string, mode: 'major' | 'minor'): string {
  const keyIndex = getNoteIndex(keyRoot);
  const chordIndex = getNoteIndex(chordRoot);

  const intervals = mode === 'major' ? MAJOR_INTERVALS : MINOR_INTERVALS;
  const degree = intervals.indexOf((chordIndex - keyIndex + 12) % 12);

  if (degree === -1) return '?';

  const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  return numerals[degree] || '?';
}

function suggestNextChords(chords: string[], key: string, mode: 'major' | 'minor'): string[] {
  const keyRoot = key.split(' ')[0];
  const lastChord = chords[chords.length - 1];
  const lastNumeral = getRomanNumeral(parseChord(lastChord).root, keyRoot, mode);

  // Common progressions from each degree
  const suggestions: Record<string, string[]> = {
    I: ['IV', 'V', 'vi'],
    ii: ['V', 'I'],
    iii: ['vi', 'IV'],
    IV: ['V', 'I', 'vi'],
    V: ['I', 'vi'],
    vi: ['IV', 'V', 'ii'],
  };

  const nextNumerals = suggestions[lastNumeral] || ['I', 'IV', 'V'];

  // Convert numerals back to chord names
  const keyIndex = getNoteIndex(keyRoot);
  const intervals = mode === 'major' ? MAJOR_INTERVALS : MINOR_INTERVALS;

  return nextNumerals.map((numeral) => {
    const degree = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'].indexOf(numeral);
    if (degree === -1) return 'C';

    const noteIndex = (keyIndex + intervals[degree]) % 12;
    const note = NOTES[noteIndex];

    // Add quality suffix
    if (numeral === numeral.toLowerCase()) {
      return `${note}m`;
    }
    return note;
  });
}

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chords } = await request.json();

    if (!chords || !Array.isArray(chords) || chords.length === 0) {
      return NextResponse.json({ error: 'Chords array required' }, { status: 400 });
    }

    // Analyze the chord progression
    const keyResults = analyzeKey(chords);
    const mostLikelyKey = keyResults[0];

    if (!mostLikelyKey) {
      return NextResponse.json({
        error: 'Could not determine key',
        chords,
      });
    }

    const keyRoot = mostLikelyKey.key.split(' ')[0];

    // Get Roman numeral analysis
    const analysis = chords.map((chord) => {
      const parsed = parseChord(chord);
      const numeral = getRomanNumeral(parsed.root, keyRoot, mostLikelyKey.mode);
      return {
        chord,
        numeral,
        function: getChordFunction(numeral),
      };
    });

    // Suggest next chords
    const nextChordSuggestions = suggestNextChords(chords, mostLikelyKey.key, mostLikelyKey.mode);

    return NextResponse.json({
      chords,
      mostLikelyKey: mostLikelyKey.key,
      confidence: Math.round(mostLikelyKey.confidence),
      alternativeKeys: keyResults.slice(1),
      analysis,
      suggestions: {
        nextChords: nextChordSuggestions,
        reason: `Common progressions after ${analysis[analysis.length - 1].numeral}`,
      },
      commonProgressions: Object.keys(COMMON_PROGRESSIONS).map((name) => ({
        name,
        chords: COMMON_PROGRESSIONS[name as keyof typeof COMMON_PROGRESSIONS],
      })),
    });
  } catch (error) {
    console.error('Chord analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze chords',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getChordFunction(numeral: string): string {
  const functions: Record<string, string> = {
    I: 'Tonic (home)',
    ii: 'Subdominant',
    iii: 'Mediant',
    IV: 'Subdominant',
    V: 'Dominant (tension)',
    vi: 'Submediant',
    'vii°': 'Leading tone',
  };
  return functions[numeral] || 'Unknown';
}
