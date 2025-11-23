/**
 * Chord Progression Library
 * Comprehensive database of progressions by genre and mood
 * Chord substitution suggestions
 * Music theory-based alternatives
 */

export type ProgressionCategory = {
  name: string;
  mood?: string;
  genre?: string;
  progressions: {
    name: string;
    chords: string[];
    romanNumerals: string[];
    description: string;
    examples: string[]; // Famous songs using this progression
  }[];
};

// Comprehensive chord progression database
export const CHORD_PROGRESSIONS: ProgressionCategory[] = [
  {
    name: 'Pop & Rock Classics',
    genre: 'pop-rock',
    progressions: [
      {
        name: 'I-V-vi-IV (The Axis of Awesome)',
        chords: ['C', 'G', 'Am', 'F'],
        romanNumerals: ['I', 'V', 'vi', 'IV'],
        description: 'Most common pop progression - uplifting and familiar',
        examples: ['Let It Be', 'With or Without You', 'No Woman No Cry'],
      },
      {
        name: 'vi-IV-I-V (Sad Pop)',
        chords: ['Am', 'F', 'C', 'G'],
        romanNumerals: ['vi', 'IV', 'I', 'V'],
        description: 'Emotional, contemplative - starts minor',
        examples: ['Apologize', 'Grenade', 'Somebody That I Used to Know'],
      },
      {
        name: 'I-IV-V (Classic Rock)',
        chords: ['C', 'F', 'G'],
        romanNumerals: ['I', 'IV', 'V'],
        description: 'Simple, powerful - foundation of rock',
        examples: ['Wild Thing', 'Twist and Shout', 'La Bamba'],
      },
    ],
  },
  {
    name: 'Blues & Soul',
    genre: 'blues',
    mood: 'melancholic',
    progressions: [
      {
        name: '12-Bar Blues',
        chords: ['C7', 'C7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'],
        romanNumerals: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
        description: 'Classic blues structure',
        examples: ['Sweet Home Chicago', 'Johnny B. Goode'],
      },
      {
        name: 'I-IV-I-V (Simple Blues)',
        chords: ['C', 'F', 'C', 'G'],
        romanNumerals: ['I', 'IV', 'I', 'V'],
        description: 'Simplified blues feel',
        examples: ['Many blues songs'],
      },
    ],
  },
  {
    name: 'Sad & Emotional',
    mood: 'sad',
    progressions: [
      {
        name: 'i-VI-III-VII (Sad Progression)',
        chords: ['Am', 'F', 'C', 'G'],
        romanNumerals: ['i', 'VI', 'III', 'VII'],
        description: 'Melancholic and emotional',
        examples: ['Hurt', 'Mad World'],
      },
      {
        name: 'i-VII-VI-V (Descending Sadness)',
        chords: ['Am', 'G', 'F', 'E'],
        romanNumerals: ['i', 'VII', 'VI', 'V'],
        description: 'Descending, hopeless feeling',
        examples: ['Stairway to Heaven (intro)'],
      },
    ],
  },
  {
    name: 'Happy & Uplifting',
    mood: 'happy',
    progressions: [
      {
        name: 'I-IV-I-V (Happy Major)',
        chords: ['C', 'F', 'C', 'G'],
        romanNumerals: ['I', 'IV', 'I', 'V'],
        description: 'Bright and optimistic',
        examples: ['Happy', 'Walking on Sunshine'],
      },
      {
        name: 'I-vi-IV-V (Doo-Wop)',
        chords: ['C', 'Am', 'F', 'G'],
        romanNumerals: ['I', 'vi', 'IV', 'V'],
        description: 'Classic 50s feel, optimistic',
        examples: ['Stand By Me', 'Every Breath You Take'],
      },
    ],
  },
  {
    name: 'Jazz & Sophisticated',
    genre: 'jazz',
    mood: 'sophisticated',
    progressions: [
      {
        name: 'ii-V-I (Jazz Standard)',
        chords: ['Dm7', 'G7', 'Cmaj7'],
        romanNumerals: ['ii7', 'V7', 'Imaj7'],
        description: 'Most common jazz progression',
        examples: ['Autumn Leaves', 'Satin Doll'],
      },
      {
        name: 'I-vi-ii-V (Rhythm Changes)',
        chords: ['C', 'Am7', 'Dm7', 'G7'],
        romanNumerals: ['I', 'vi7', 'ii7', 'V7'],
        description: 'Bebop foundation',
        examples: ['I Got Rhythm', 'Oleo'],
      },
    ],
  },
  {
    name: 'Country & Folk',
    genre: 'country',
    progressions: [
      {
        name: 'I-IV-V-IV (Country Classic)',
        chords: ['C', 'F', 'G', 'F'],
        romanNumerals: ['I', 'IV', 'V', 'IV'],
        description: 'Traditional country feel',
        examples: ['Country Roads', 'Ring of Fire'],
      },
    ],
  },
  {
    name: 'Dark & Mysterious',
    mood: 'dark',
    progressions: [
      {
        name: 'i-bVII-bVI-V (Phrygian)',
        chords: ['Am', 'G', 'F', 'E'],
        romanNumerals: ['i', 'bVII', 'bVI', 'V'],
        description: 'Spanish/flamenco, mysterious',
        examples: ['Misirlou'],
      },
    ],
  },
];

// Chord substitution suggestions
export const CHORD_SUBSTITUTIONS: {
  [key: string]: { chord: string; description: string; vibe: string }[];
} = {
  C: [
    { chord: 'Cmaj7', description: 'Adds jazz flavor', vibe: 'Sophisticated' },
    { chord: 'Csus2', description: 'Open, airy', vibe: 'Dreamy' },
    { chord: 'Csus4', description: 'Suspenseful', vibe: 'Tension' },
    { chord: 'C6', description: 'Vintage, jazzy', vibe: 'Retro' },
    { chord: 'Am', description: 'Relative minor - darker', vibe: 'Melancholic' },
    { chord: 'Em', description: 'Mediant - smooth transition', vibe: 'Smooth' },
  ],
  Am: [
    { chord: 'Am7', description: 'Jazzier minor', vibe: 'Sophisticated' },
    { chord: 'Amsus2', description: 'Softer minor', vibe: 'Gentle' },
    { chord: 'C', description: 'Relative major - brighter', vibe: 'Uplift' },
    { chord: 'Dm', description: 'Subdominant minor', vibe: 'Deeper' },
    { chord: 'Em', description: 'Parallel - stays dark', vibe: 'Consistent' },
  ],
  F: [
    { chord: 'Fmaj7', description: 'Dreamy extension', vibe: 'Ethereal' },
    { chord: 'Fsus2', description: 'Open sound', vibe: 'Spacious' },
    { chord: 'Dm', description: 'Relative minor', vibe: 'Darker' },
    { chord: 'Am', description: 'Mediant - smooth', vibe: 'Smooth' },
  ],
  G: [
    { chord: 'G7', description: 'Blues feel', vibe: 'Gritty' },
    { chord: 'Gmaj7', description: 'Sophisticated', vibe: 'Jazz' },
    { chord: 'Gsus4', description: 'Suspenseful', vibe: 'Tension' },
    { chord: 'Em', description: 'Relative minor', vibe: 'Melancholic' },
    { chord: 'D', description: 'Dominant of dominant', vibe: 'Bright' },
  ],
  D: [
    { chord: 'Dmaj7', description: 'Warm major', vibe: 'Warm' },
    { chord: 'D7', description: 'Bluesy', vibe: 'Blues' },
    { chord: 'Dsus4', description: 'Tension', vibe: 'Suspense' },
    { chord: 'Bm', description: 'Relative minor', vibe: 'Sad' },
  ],
  E: [
    { chord: 'E7', description: 'Bluesy dominant', vibe: 'Blues' },
    { chord: 'Emaj7', description: 'Bright jazz', vibe: 'Sophisticated' },
    { chord: 'C#m', description: 'Relative minor', vibe: 'Dark' },
  ],
  A: [
    { chord: 'Amaj7', description: 'Bright extension', vibe: 'Bright' },
    { chord: 'A7', description: 'Dominant seventh', vibe: 'Bluesy' },
    { chord: 'F#m', description: 'Relative minor', vibe: 'Melancholic' },
  ],
  B: [
    { chord: 'B7', description: 'Strong dominant', vibe: 'Bold' },
    { chord: 'G#m', description: 'Relative minor', vibe: 'Dark' },
  ],
  Dm: [
    { chord: 'Dm7', description: 'Jazzier', vibe: 'Sophisticated' },
    { chord: 'F', description: 'Relative major', vibe: 'Brighter' },
    { chord: 'Am', description: 'Parallel minor', vibe: 'Stay dark' },
  ],
  Em: [
    { chord: 'Em7', description: 'Extended minor', vibe: 'Deeper' },
    { chord: 'G', description: 'Relative major', vibe: 'Uplift' },
    { chord: 'Am', description: 'Subdominant minor', vibe: 'Darker' },
  ],
  Bm: [
    { chord: 'Bm7', description: 'Jazz minor', vibe: 'Sophisticated' },
    { chord: 'D', description: 'Relative major', vibe: 'Brighter' },
  ],
};

// Get substitution suggestions for a chord
export function getChordSubstitutions(
  chord: string
): { chord: string; description: string; vibe: string }[] {
  // Remove extensions for lookup (Cmaj7 → C)
  const baseChord = chord.replace(/maj7|m7|7|sus2|sus4|6|9|add9|dim|aug/g, '').trim();
  return CHORD_SUBSTITUTIONS[baseChord] || [];
}

// Get progressions by filter
export function getProgressionsByFilter(filter?: {
  genre?: string;
  mood?: string;
}): ProgressionCategory[] {
  if (!filter || (!filter.genre && !filter.mood)) {
    return CHORD_PROGRESSIONS;
  }

  return CHORD_PROGRESSIONS.filter((cat) => {
    if (filter.genre && cat.genre !== filter.genre) return false;
    if (filter.mood && cat.mood !== filter.mood) return false;
    return true;
  });
}

// Convert progression to specific key
export function progressionToKey(romanNumerals: string[], key: string): string[] {
  const keyMap: { [key: string]: string[] } = {
    C: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    G: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
    D: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    A: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
    E: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
    F: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  };

  const scale = keyMap[key] || keyMap['C'];
  const romanToIndex: { [key: string]: number } = {
    I: 0,
    i: 0,
    II: 1,
    ii: 1,
    III: 2,
    iii: 2,
    IV: 3,
    iv: 3,
    V: 4,
    v: 4,
    VI: 5,
    vi: 5,
    VII: 6,
    vii: 6,
    bVII: 5,
    bVI: 4,
    bIII: 2,
  };

  return romanNumerals.map((roman) => {
    // Handle seventh chords
    const clean = roman.replace(/7|maj7/g, '');
    const hasSevent = roman.includes('7');
    const hasMaj7 = roman.includes('maj7');

    const index = romanToIndex[clean] || 0;
    let chord = scale[index];

    if (hasSevent) chord += '7';
    if (hasMaj7) chord = chord.replace('7', 'maj7');

    return chord;
  });
}
