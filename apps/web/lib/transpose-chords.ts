/**
 * Chord Transposition Utility
 * Transposes chords from one key to another
 * Maintains interval relationships
 */

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP: { [key: string]: string } = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};
const SHARP_TO_FLAT: { [key: string]: string } = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
};

// Parse chord into root note and quality
export function parseChord(chord: string): { root: string; quality: string } {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return { root: 'C', quality: '' };
  
  let root = match[1];
  const quality = match[2] || '';
  
  // Convert flats to sharps for calculation
  if (root in FLAT_TO_SHARP) {
    root = FLAT_TO_SHARP[root];
  }
  
  return { root, quality };
}

// Transpose a single chord
export function transposeChord(chord: string, fromKey: string, toKey: string, preferFlats: boolean = false): string {
  const { root, quality } = parseChord(chord);
  const { root: fromRoot } = parseChord(fromKey);
  const { root: toRoot } = parseChord(toKey);
  
  const fromIndex = NOTES.indexOf(fromRoot);
  const toIndex = NOTES.indexOf(toRoot);
  const rootIndex = NOTES.indexOf(root);
  
  if (fromIndex === -1 || toIndex === -1 || rootIndex === -1) {
    return chord; // Invalid input, return as-is
  }
  
  // Calculate semitone difference
  const interval = (toIndex - fromIndex + 12) % 12;
  
  // Transpose the root note
  const newRootIndex = (rootIndex + interval) % 12;
  let newRoot = NOTES[newRootIndex];
  
  // Convert to flat if preferred (for keys like Bb, Eb, Ab)
  if (preferFlats && newRoot in SHARP_TO_FLAT) {
    newRoot = SHARP_TO_FLAT[newRoot];
  }
  
  return newRoot + quality;
}

// Transpose all chords in a song
export function transposeAllChords(
  chords: Array<{ lineIndex: number; position: number; chord: string }>,
  fromKey: string,
  toKey: string
): Array<{ lineIndex: number; position: number; chord: string }> {
  const preferFlats = toKey.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db'].includes(toKey);
  
  return chords.map(chordPos => ({
    ...chordPos,
    chord: transposeChord(chordPos.chord, fromKey, toKey, preferFlats)
  }));
}

// Get interval between two keys
export function getInterval(fromKey: string, toKey: string): number {
  const { root: fromRoot } = parseChord(fromKey);
  const { root: toRoot } = parseChord(toKey);
  
  const fromIndex = NOTES.indexOf(fromRoot);
  const toIndex = NOTES.indexOf(toRoot);
  
  if (fromIndex === -1 || toIndex === -1) return 0;
  
  return (toIndex - fromIndex + 12) % 12;
}
