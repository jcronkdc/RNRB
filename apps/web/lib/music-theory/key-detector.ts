/**
 * Music Theory Key Detector
 * Analyzes chord progressions to determine the most likely key(s)
 */

export type Note = 'A' | 'A#' | 'Bb' | 'B' | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab';
export type ChordQuality = 'major' | 'minor' | 'dominant7' | 'major7' | 'minor7' | 'diminished' | 'augmented' | 'suspended';

export interface ParsedChord {
  root: Note;
  quality: ChordQuality;
  originalChord: string;
}

export interface KeySuggestion {
  key: string;
  confidence: number;
  reasons: string[];
  mode: 'major' | 'minor';
}

// Major scale intervals: W-W-H-W-W-W-H
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Natural minor scale intervals: W-H-W-W-H-W-W
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

// Chromatic note mapping (enharmonic equivalents)
const NOTE_TO_NUMBER: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

const NUMBER_TO_NOTE: Record<number, string> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
  6: 'F#', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B'
};

/**
 * Parse a chord string into root note and quality
 */
export function parseChord(chord: string): ParsedChord | null {
  if (!chord || chord.trim().length === 0) return null;

  const normalized = chord.trim();
  
  // Extract root note (1-2 characters)
  let root = normalized[0].toUpperCase();
  let restOfChord = normalized.slice(1);
  
  // Check for sharp or flat
  if (restOfChord[0] === '#' || restOfChord[0] === 'b') {
    root += restOfChord[0];
    restOfChord = restOfChord.slice(1);
  }

  if (!(root in NOTE_TO_NUMBER)) return null;

  // Determine quality from remaining string
  let quality: ChordQuality = 'major'; // default
  const lowerRest = restOfChord.toLowerCase();

  if (lowerRest.includes('dim')) {
    quality = 'diminished';
  } else if (lowerRest.includes('aug') || lowerRest.includes('+')) {
    quality = 'augmented';
  } else if (lowerRest.includes('sus')) {
    quality = 'suspended';
  } else if (lowerRest.includes('m7') || lowerRest === 'min7') {
    quality = 'minor7';
  } else if (lowerRest.includes('maj7') || lowerRest === 'M7') {
    quality = 'major7';
  } else if (lowerRest === '7') {
    quality = 'dominant7';
  } else if (lowerRest.startsWith('m') || lowerRest === 'min') {
    quality = 'minor';
  }

  return {
    root: root as Note,
    quality,
    originalChord: chord,
  };
}

/**
 * Get all notes in a scale
 */
function getScaleNotes(rootNote: string, intervals: number[]): number[] {
  const rootNumber = NOTE_TO_NUMBER[rootNote];
  return intervals.map(interval => (rootNumber + interval) % 12);
}

/**
 * Check if a chord fits in a given key
 */
function chordFitsInKey(chord: ParsedChord, keyRoot: string, mode: 'major' | 'minor'): boolean {
  const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  const scaleNotes = getScaleNotes(keyRoot, intervals);
  const chordRootNumber = NOTE_TO_NUMBER[chord.root];
  
  return scaleNotes.includes(chordRootNumber);
}

/**
 * Calculate diatonic chord for each scale degree
 */
function getDiatonicChords(keyRoot: string, mode: 'major' | 'minor'): ParsedChord[] {
  const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  const scaleNotes = getScaleNotes(keyRoot, intervals);
  
  if (mode === 'major') {
    // Major key diatonic chords: I ii iii IV V vi vii°
    const qualities: ChordQuality[] = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
    return scaleNotes.map((note, i) => ({
      root: NUMBER_TO_NOTE[note] as Note,
      quality: qualities[i],
      originalChord: ''
    }));
  } else {
    // Minor key diatonic chords: i ii° III iv v VI VII
    const qualities: ChordQuality[] = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
    return scaleNotes.map((note, i) => ({
      root: NUMBER_TO_NOTE[note] as Note,
      quality: qualities[i],
      originalChord: ''
    }));
  }
}

/**
 * Analyze chords and suggest possible keys
 */
export function detectKey(chords: string[]): KeySuggestion[] {
  if (!chords || chords.length === 0) {
    return [];
  }

  const parsedChords = chords
    .map(parseChord)
    .filter((c): c is ParsedChord => c !== null);

  if (parsedChords.length === 0) {
    return [];
  }

  const suggestions: KeySuggestion[] = [];

  // Test all 12 notes as potential key centers, both major and minor
  const allNotes = Object.keys(NOTE_TO_NUMBER).filter(n => !n.includes('#') || n === 'F#' || n === 'C#');
  
  for (const keyRoot of allNotes) {
    // Skip enharmonic duplicates (prefer flats for some, sharps for others)
    if (keyRoot.includes('b') && keyRoot !== 'Bb' && keyRoot !== 'Eb' && keyRoot !== 'Ab' && keyRoot !== 'Db' && keyRoot !== 'Gb') {
      continue;
    }

    // Test major key
    const majorFit = analyzeKeyFit(parsedChords, keyRoot, 'major');
    if (majorFit.confidence > 0) {
      suggestions.push(majorFit);
    }

    // Test minor key
    const minorFit = analyzeKeyFit(parsedChords, keyRoot, 'minor');
    if (minorFit.confidence > 0) {
      suggestions.push(minorFit);
    }
  }

  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Analyze how well a set of chords fits a specific key
 */
function analyzeKeyFit(chords: ParsedChord[], keyRoot: string, mode: 'major' | 'minor'): KeySuggestion {
  const diatonicChords = getDiatonicChords(keyRoot, mode);
  const reasons: string[] = [];
  let confidence = 0;

  // Check each chord
  let fittingChords = 0;
  let exactMatches = 0;

  for (const chord of chords) {
    const fitsInKey = chordFitsInKey(chord, keyRoot, mode);
    
    if (fitsInKey) {
      fittingChords++;
      
      // Check if it's an exact diatonic match
      const diatonicMatch = diatonicChords.find(
        dc => NOTE_TO_NUMBER[dc.root] === NOTE_TO_NUMBER[chord.root] && dc.quality === chord.quality
      );
      
      if (diatonicMatch) {
        exactMatches++;
      }
    }
  }

  // Calculate confidence based on fitting chords
  const fitPercentage = fittingChords / chords.length;
  const exactMatchPercentage = exactMatches / chords.length;
  
  confidence = Math.round((fitPercentage * 60 + exactMatchPercentage * 40) * 100);

  // Bonus points for common progressions
  const chordRoots = chords.map(c => NOTE_TO_NUMBER[c.root]);
  const keyNumber = NOTE_TO_NUMBER[keyRoot];

  // Check for I-IV-V (or i-iv-v in minor)
  const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  const scaleNotes = getScaleNotes(keyRoot, intervals);
  const hasI = chordRoots.includes(scaleNotes[0]);
  const hasIV = chordRoots.includes(scaleNotes[3]);
  const hasV = chordRoots.includes(scaleNotes[4]);

  if (hasI && hasIV && hasV) {
    confidence += 15;
    reasons.push(`Contains I-IV-V progression`);
  }

  // Check for vi chord in major (very common)
  if (mode === 'major' && chordRoots.includes(scaleNotes[5])) {
    confidence += 5;
    reasons.push(`Contains vi chord (relative minor)`);
  }

  // First and last chord often indicates key
  if (chords.length >= 2) {
    const firstChord = chords[0];
    const lastChord = chords[chords.length - 1];
    
    if (NOTE_TO_NUMBER[firstChord.root] === keyNumber) {
      confidence += 10;
      reasons.push(`Starts on tonic (${firstChord.originalChord})`);
    }
    
    if (NOTE_TO_NUMBER[lastChord.root] === keyNumber) {
      confidence += 10;
      reasons.push(`Ends on tonic (${lastChord.originalChord})`);
    }
  }

  if (exactMatches > 0) {
    reasons.push(`${exactMatches}/${chords.length} chords are diatonic`);
  }

  // Cap confidence at 100
  confidence = Math.min(confidence, 100);

  const modeLabel = mode === 'major' ? 'Major' : 'Minor';
  return {
    key: `${keyRoot} ${modeLabel}`,
    confidence,
    reasons,
    mode,
  };
}

/**
 * Get a simple key detection result (just the top key)
 */
export function getMainKey(chords: string[]): string | null {
  const suggestions = detectKey(chords);
  return suggestions.length > 0 ? suggestions[0].key : null;
}

