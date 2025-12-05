/**
 * AI SONG DISCOVERY & SMART SETLISTS
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY: USER DATA ISOLATION - SONGS ARE USER-SCOPED
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * All functions in this module receive userId as the FIRST parameter.
 * Song queries ALWAYS include: WHERE userId = $authenticatedUserId
 * Users can ONLY discover, search, and create setlists from their OWN songs.
 *
 * Cross-user song access is IMPOSSIBLE by design.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Powers the AI's ability to:
 * - Pull up any song for display/editing/playing
 * - Search and filter songs
 * - Generate smart setlists for any occasion
 * - Create continuous playback queues
 */

import { prisma } from '@cronkwaters/db';

// ============================================
// TYPES
// ============================================

export interface SongDisplay {
  id: string;
  title: string;
  key: string | null;
  tempo: number | null;
  duration: number | null;
  status: string;
  genre: string | null;
  mood: string | null;
  lyrics: string | null;
  chords: any | null;
  audioUrl: string | null;
  projectName: string | null;
  collaborators: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // For display
  formattedDuration: string | null;
  hasAudio: boolean;
  hasLyrics: boolean;
  hasChords: boolean;
  // Display mode hints for frontend
  suggestedView?: 'default' | 'teleprompter' | 'chords' | 'edit';
}

export interface SetlistOption {
  id: string;
  name: string;
  description: string;
  songs: {
    position: number;
    songId: string;
    title: string;
    key: string | null;
    tempo: number | null;
    duration: number | null;
    isEncore: boolean;
    transitionNote: string | null;
  }[];
  totalDuration: number;
  formattedDuration: string;
  energyProfile: string;
  keyFlow: string;
}

export interface SearchFilters {
  query?: string;
  key?: string;
  minTempo?: number;
  maxTempo?: number;
  status?: string;
  genre?: string;
  mood?: string;
  hasAudio?: boolean;
  hasLyrics?: boolean;
  projectId?: string;
  collaborator?: string;
  tags?: string[];
}

// ============================================
// SONG DISPLAY
// ============================================

/**
 * Pull up a song for display - by ID or title search
 * @param viewMode - 'default' | 'teleprompter' | 'chords' | 'edit'
 */
export async function displaySong(
  userId: string,
  identifier: string, // Can be song ID or title
  viewMode: 'default' | 'teleprompter' | 'chords' | 'edit' = 'default'
): Promise<{
  success: boolean;
  song?: SongDisplay;
  suggestions?: SongDisplay[];
  message: string;
  viewMode: string;
}> {
  // First try exact ID match
  let song = await prisma.song.findFirst({
    where: {
      id: identifier,
      userId,
      archived: false,
    },
    include: {
      project: { select: { name: true } },
      collaborators: {
        select: {
          user: { select: { name: true } },
          email: true,
        },
      },
    },
  });

  // If not found by ID, search by title
  if (!song) {
    song = await prisma.song.findFirst({
      where: {
        userId,
        archived: false,
        title: { contains: identifier, mode: 'insensitive' },
      },
      include: {
        project: { select: { name: true } },
        collaborators: {
          select: {
            user: { select: { name: true } },
            email: true,
          },
        },
      },
    });
  }

  // If still not found, find similar titles
  if (!song) {
    const similar = await prisma.song.findMany({
      where: {
        userId,
        archived: false,
        OR: [
          { title: { contains: identifier.split(' ')[0], mode: 'insensitive' } },
          { lyrics: { contains: identifier, mode: 'insensitive' } },
        ],
      },
      include: {
        project: { select: { name: true } },
        collaborators: {
          select: {
            user: { select: { name: true } },
            email: true,
          },
        },
      },
      take: 5,
    });

    if (similar.length > 0) {
      return {
        success: false,
        suggestions: similar.map(formatSongDisplay),
        message: `Couldn't find "${identifier}" exactly. Did you mean one of these?`,
        viewMode,
      };
    }

    return {
      success: false,
      message: `Couldn't find any song matching "${identifier}". Try a different search term.`,
      viewMode,
    };
  }

  const formattedSong = formatSongDisplay(song);
  formattedSong.suggestedView = viewMode;

  const viewMessages = {
    default: `Here's "${song.title}"!`,
    teleprompter: `Opening "${song.title}" in teleprompter mode with auto-scroll! Use spacebar to play/pause.`,
    chords: `Here are the chords for "${song.title}"`,
    edit: `Opening "${song.title}" for editing`,
  };

  return {
    success: true,
    song: formattedSong,
    message: viewMessages[viewMode],
    viewMode,
  };
}

/**
 * Search songs with filters
 */
export async function searchSongs(
  userId: string,
  filters: SearchFilters
): Promise<{ success: boolean; songs: SongDisplay[]; total: number; message: string }> {
  const where: any = {
    userId,
    archived: false,
  };

  // Text search
  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { lyrics: { contains: filters.query, mode: 'insensitive' } },
      { notes: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  // Filters
  if (filters.key) where.key = filters.key;
  if (filters.status) where.status = filters.status;
  if (filters.genre) where.genre = { contains: filters.genre, mode: 'insensitive' };
  if (filters.mood) where.mood = { contains: filters.mood, mode: 'insensitive' };
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.hasAudio) where.audioUrl = { not: null };
  if (filters.hasLyrics) where.lyrics = { not: null };

  // Tempo range
  if (filters.minTempo || filters.maxTempo) {
    where.tempo = {};
    if (filters.minTempo) where.tempo.gte = filters.minTempo;
    if (filters.maxTempo) where.tempo.lte = filters.maxTempo;
  }

  // Tags
  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  const songs = await prisma.song.findMany({
    where,
    include: {
      project: { select: { name: true } },
      collaborators: {
        select: {
          user: { select: { name: true } },
          email: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  // Filter by collaborator name if specified
  let filteredSongs = songs;
  if (filters.collaborator) {
    filteredSongs = songs.filter((s) =>
      s.collaborators.some(
        (c) =>
          c.user?.name?.toLowerCase().includes(filters.collaborator!.toLowerCase()) ||
          c.email?.toLowerCase().includes(filters.collaborator!.toLowerCase())
      )
    );
  }

  return {
    success: true,
    songs: filteredSongs.map(formatSongDisplay),
    total: filteredSongs.length,
    message:
      filteredSongs.length > 0
        ? `Found ${filteredSongs.length} song${filteredSongs.length > 1 ? 's' : ''}`
        : 'No songs found matching your criteria',
  };
}

// ============================================
// SMART SETLIST GENERATION
// ============================================

type Occasion =
  | 'campfire'
  | 'party'
  | 'mellow'
  | 'high_energy'
  | 'acoustic'
  | 'full_band'
  | 'covers_night'
  | 'originals_only'
  | 'mixed'
  | 'custom';

interface SetlistPreferences {
  occasion: Occasion;
  targetDuration?: number; // minutes
  songCount?: number;
  preferredKeys?: string[];
  excludeSongs?: string[];
  mustInclude?: string[];
  energyLevel?: 'low' | 'medium' | 'high' | 'varied';
  includeCovers?: boolean;
  acousticOnly?: boolean;
}

/**
 * Generate multiple setlist options based on preferences
 */
export async function generateSetlistOptions(
  userId: string,
  preferences: SetlistPreferences
): Promise<{ success: boolean; options: SetlistOption[]; message: string }> {
  // Get user's songs
  const songs = await prisma.song.findMany({
    where: {
      userId,
      archived: false,
      status: { in: ['complete', 'in_progress'] }, // Only playable songs
    },
    select: {
      id: true,
      title: true,
      key: true,
      tempo: true,
      timeSignature: true,
      tags: true,
      audioUrl: true,
      lyrics: true,
      description: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (songs.length === 0) {
    return {
      success: false,
      options: [],
      message: "You don't have any completed songs yet. Finish some songs first!",
    };
  }

  // Filter based on preferences
  let filteredSongs = [...songs];

  // Exclude specific songs
  if (preferences.excludeSongs?.length) {
    filteredSongs = filteredSongs.filter(
      (s) =>
        !preferences.excludeSongs!.some((ex) => s.title.toLowerCase().includes(ex.toLowerCase()))
    );
  }

  // Preferred keys
  if (preferences.preferredKeys?.length) {
    const keyMatches = filteredSongs.filter(
      (s) => s.key && preferences.preferredKeys!.includes(s.key)
    );
    if (keyMatches.length >= 3) filteredSongs = keyMatches;
  }

  // Acoustic only (check tags or description for acoustic mentions)
  if (preferences.acousticOnly) {
    const acoustic = filteredSongs.filter((s) => {
      const tagsLower = s.tags?.toLowerCase() || '';
      const descLower = s.description?.toLowerCase() || '';
      return (
        tagsLower.includes('acoustic') ||
        descLower.includes('acoustic') ||
        descLower.includes('mellow')
      );
    });
    if (acoustic.length >= 3) filteredSongs = acoustic;
  }

  // Calculate target
  const targetSongCount = preferences.songCount || Math.min(12, filteredSongs.length);
  const targetDuration = preferences.targetDuration || targetSongCount * 4; // ~4 min per song

  // Generate 3 different setlist options
  const options: SetlistOption[] = [];

  // Option 1: Energy Flow (start medium, build, peak, cool down)
  options.push(
    createSetlistWithStrategy(
      filteredSongs,
      targetSongCount,
      'energy_flow',
      preferences.occasion,
      preferences.mustInclude
    )
  );

  // Option 2: Key Optimized (smooth key transitions)
  options.push(
    createSetlistWithStrategy(
      filteredSongs,
      targetSongCount,
      'key_flow',
      preferences.occasion,
      preferences.mustInclude
    )
  );

  // Option 3: Variety Mix (alternating tempos and moods)
  options.push(
    createSetlistWithStrategy(
      filteredSongs,
      targetSongCount,
      'variety',
      preferences.occasion,
      preferences.mustInclude
    )
  );

  return {
    success: true,
    options,
    message: `Generated 3 setlist options with ${targetSongCount} songs each. Pick your favorite or mix and match!`,
  };
}

/**
 * Create a quick setlist for a specific occasion
 */
export async function createQuickSetlist(
  userId: string,
  occasion: string,
  songCount: number = 10,
  specificRequests?: string // e.g., "mellow vibe, all in G or C"
): Promise<{ success: boolean; setlist?: SetlistOption; message: string }> {
  // Map occasion to preferences
  const occasionMap: Record<string, Partial<SetlistPreferences>> = {
    campfire: {
      acousticOnly: true,
      energyLevel: 'low',
      occasion: 'campfire',
    },
    party: {
      energyLevel: 'high',
      occasion: 'party',
    },
    mellow: {
      energyLevel: 'low',
      occasion: 'mellow',
    },
    'high energy': {
      energyLevel: 'high',
      occasion: 'high_energy',
    },
    acoustic: {
      acousticOnly: true,
      occasion: 'acoustic',
    },
    'full band': {
      acousticOnly: false,
      occasion: 'full_band',
    },
    chill: {
      energyLevel: 'low',
      occasion: 'mellow',
    },
    upbeat: {
      energyLevel: 'high',
      occasion: 'party',
    },
  };

  const basePrefs = occasionMap[occasion.toLowerCase()] || { occasion: 'mixed' as Occasion };

  // Parse specific requests for keys
  const keyMatch = specificRequests?.match(/in\s+([A-G][#b]?(?:\s*(?:,|or|and)\s*[A-G][#b]?)*)/i);
  const preferredKeys = keyMatch
    ? keyMatch[1].split(/\s*(?:,|or|and)\s*/i).map((k) => k.trim())
    : undefined;

  const preferences: SetlistPreferences = {
    ...(basePrefs as SetlistPreferences),
    songCount,
    preferredKeys,
  };

  const result = await generateSetlistOptions(userId, preferences);

  if (!result.success || result.options.length === 0) {
    return { success: false, message: result.message };
  }

  // Return the best option based on occasion
  const bestOption =
    occasion.toLowerCase().includes('campfire') || occasion.toLowerCase().includes('mellow')
      ? result.options.find((o) => o.energyProfile === 'mellow') || result.options[0]
      : occasion.toLowerCase().includes('party') || occasion.toLowerCase().includes('energy')
        ? result.options.find((o) => o.energyProfile === 'high') || result.options[0]
        : result.options[0];

  return {
    success: true,
    setlist: bestOption,
    message: `Created a ${occasion} setlist with ${bestOption.songs.length} songs (${bestOption.formattedDuration})!`,
  };
}

/**
 * Get songs for continuous playback (returns audio URLs)
 */
export async function getPlaybackQueue(
  userId: string,
  songIds: string[]
): Promise<{
  success: boolean;
  queue: {
    id: string;
    title: string;
    audioUrl: string | null;
    duration: number | null;
    key: string | null;
    lyrics: string | null;
  }[];
  message: string;
}> {
  const songs = await prisma.song.findMany({
    where: {
      id: { in: songIds },
      userId,
    },
    select: {
      id: true,
      title: true,
      audioUrl: true,
      key: true,
      lyrics: true,
    },
  });

  // Maintain order from input
  const ordered = songIds
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean) as typeof songs;

  const withAudio = ordered.filter((s) => s.audioUrl);

  return {
    success: true,
    queue: ordered.map((s) => ({
      id: s.id,
      title: s.title,
      audioUrl: s.audioUrl,
      duration: null, // Duration not stored - determined at playback
      key: s.key,
      lyrics: s.lyrics,
    })),
    message:
      withAudio.length === ordered.length
        ? `Ready to play ${ordered.length} songs!`
        : `${withAudio.length} of ${ordered.length} songs have audio. Others will show lyrics.`,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatSongDisplay(song: any): SongDisplay {
  return {
    id: song.id,
    title: song.title,
    key: song.key,
    tempo: song.tempo,
    duration: song.duration,
    status: song.status,
    genre: song.genre,
    mood: song.mood,
    lyrics: song.lyrics,
    chords: song.chords,
    audioUrl: song.audioUrl,
    projectName: song.project?.name || null,
    collaborators: song.collaborators?.map((c: any) => c.user?.name || c.email || 'Unknown') || [],
    tags: song.tags || [],
    createdAt: song.createdAt?.toISOString() || '',
    updatedAt: song.updatedAt?.toISOString() || '',
    formattedDuration: song.duration
      ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
      : null,
    hasAudio: !!song.audioUrl,
    hasLyrics: !!song.lyrics,
    hasChords: !!song.chords,
  };
}

function createSetlistWithStrategy(
  songs: any[],
  targetCount: number,
  strategy: 'energy_flow' | 'key_flow' | 'variety',
  occasion: Occasion,
  mustInclude?: string[]
): SetlistOption {
  let selectedSongs: any[] = [];
  let availableSongs = [...songs];

  // First, add must-include songs
  if (mustInclude?.length) {
    mustInclude.forEach((title) => {
      const match = availableSongs.find((s) => s.title.toLowerCase().includes(title.toLowerCase()));
      if (match) {
        selectedSongs.push(match);
        availableSongs = availableSongs.filter((s) => s.id !== match.id);
      }
    });
  }

  // Fill remaining slots based on strategy
  const remaining = targetCount - selectedSongs.length;

  switch (strategy) {
    case 'energy_flow':
      // Sort by tempo (energy proxy)
      availableSongs.sort((a, b) => (a.tempo || 100) - (b.tempo || 100));
      // Build: start medium, increase, peak at 70%, cool down
      const lowEnergy = availableSongs.slice(0, Math.floor(availableSongs.length / 3));
      const midEnergy = availableSongs.slice(
        Math.floor(availableSongs.length / 3),
        Math.floor((2 * availableSongs.length) / 3)
      );
      const highEnergy = availableSongs.slice(Math.floor((2 * availableSongs.length) / 3));

      // Pattern: mid, mid, high, high, high, mid, low
      const pattern = [
        midEnergy,
        midEnergy,
        highEnergy,
        highEnergy,
        highEnergy,
        midEnergy,
        lowEnergy,
      ];
      let patternIdx = 0;
      while (selectedSongs.length < targetCount && availableSongs.length > 0) {
        const pool = pattern[patternIdx % pattern.length];
        const pick = pool.shift() || availableSongs.shift();
        if (pick) {
          selectedSongs.push(pick);
          availableSongs = availableSongs.filter((s) => s.id !== pick.id);
        }
        patternIdx++;
      }
      break;

    case 'key_flow':
      // Group by key for smooth transitions
      const keyGroups: Record<string, any[]> = {};
      availableSongs.forEach((s) => {
        const key = s.key || 'unknown';
        if (!keyGroups[key]) keyGroups[key] = [];
        keyGroups[key].push(s);
      });

      // Key circle for smooth transitions
      const keyCircle = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Bm', 'F', 'Bb'];
      let currentKeyIdx = 0;

      while (selectedSongs.length < targetCount && availableSongs.length > 0) {
        const targetKey = keyCircle[currentKeyIdx % keyCircle.length];
        const fromKey = keyGroups[targetKey]?.shift();
        if (fromKey) {
          selectedSongs.push(fromKey);
          availableSongs = availableSongs.filter((s) => s.id !== fromKey.id);
        } else {
          // Fallback to any available
          const any = availableSongs.shift();
          if (any) selectedSongs.push(any);
        }
        currentKeyIdx++;
      }
      break;

    case 'variety':
    default:
      // Alternate between fast and slow
      availableSongs.sort((a, b) => (a.tempo || 100) - (b.tempo || 100));
      const slow = availableSongs.filter((s) => (s.tempo || 100) < 110);
      const fast = availableSongs.filter((s) => (s.tempo || 100) >= 110);

      while (selectedSongs.length < targetCount && (slow.length > 0 || fast.length > 0)) {
        if (selectedSongs.length % 2 === 0 && fast.length > 0) {
          selectedSongs.push(fast.shift()!);
        } else if (slow.length > 0) {
          selectedSongs.push(slow.shift()!);
        } else if (fast.length > 0) {
          selectedSongs.push(fast.shift()!);
        }
      }
  }

  // Calculate totals
  const totalDuration = selectedSongs.reduce((sum, s) => sum + (s.duration || 240), 0);
  const avgTempo =
    selectedSongs.reduce((sum, s) => sum + (s.tempo || 100), 0) / selectedSongs.length;

  // Determine energy profile
  const energyProfile = avgTempo > 130 ? 'high' : avgTempo < 100 ? 'mellow' : 'balanced';

  // Determine key flow description
  const keys = selectedSongs.filter((s) => s.key).map((s) => s.key);
  const keyFlow = new Set(keys).size <= 3 ? 'Tight key range' : 'Varied keys';

  // Name based on strategy and occasion
  const strategyNames = {
    energy_flow: 'Energy Journey',
    key_flow: 'Smooth Transitions',
    variety: 'Mix It Up',
  };

  const occasionNames: Record<Occasion, string> = {
    campfire: 'Campfire',
    party: 'Party',
    mellow: 'Chill',
    high_energy: 'High Energy',
    acoustic: 'Acoustic',
    full_band: 'Full Band',
    covers_night: 'Covers',
    originals_only: 'Originals',
    mixed: 'Mixed',
    custom: 'Custom',
  };

  return {
    id: `setlist-${Date.now()}-${strategy}`,
    name: `${occasionNames[occasion] || 'Custom'} ${strategyNames[strategy]}`,
    description: `${selectedSongs.length} songs optimized for ${strategy.replace('_', ' ')}`,
    songs: selectedSongs.map((s, i) => ({
      position: i + 1,
      songId: s.id,
      title: s.title,
      key: s.key,
      tempo: s.tempo,
      duration: s.duration,
      isEncore: i >= selectedSongs.length - 2, // Last 2 are encore
      transitionNote:
        i > 0 && s.key && selectedSongs[i - 1]?.key
          ? `${selectedSongs[i - 1].key} → ${s.key}`
          : null,
    })),
    totalDuration,
    formattedDuration: `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
    energyProfile,
    keyFlow,
  };
}

// ============================================
// AI FUNCTION DEFINITIONS
// ============================================

export const SONG_DISCOVERY_AI_FUNCTIONS = [
  {
    name: 'displaySong',
    description:
      'Pull up a specific song for viewing, editing, or playing. Shows full lyrics, chords, audio, and all details.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'Song ID or title to search for',
        },
        viewMode: {
          type: 'string',
          enum: ['default', 'teleprompter', 'chords', 'edit'],
          description:
            'How to display the song. Use teleprompter for playing/performing with auto-scroll.',
        },
      },
      required: ['identifier'],
    },
  },
  {
    name: 'searchSongs',
    description: 'Search and filter songs by various criteria',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search in title, lyrics, notes' },
        key: { type: 'string', description: 'Musical key (e.g., G, Am, C)' },
        minTempo: { type: 'number', description: 'Minimum tempo BPM' },
        maxTempo: { type: 'number', description: 'Maximum tempo BPM' },
        status: { type: 'string', enum: ['draft', 'in_progress', 'complete'] },
        genre: { type: 'string', description: 'Genre to filter by' },
        mood: { type: 'string', description: 'Mood to filter by' },
        hasAudio: { type: 'boolean', description: 'Only songs with audio' },
        hasLyrics: { type: 'boolean', description: 'Only songs with lyrics' },
        collaborator: { type: 'string', description: 'Filter by collaborator name' },
      },
    },
  },
  {
    name: 'generateSetlistOptions',
    description:
      'Generate multiple setlist options based on occasion and preferences. Returns 3 different options.',
    parameters: {
      type: 'object',
      properties: {
        occasion: {
          type: 'string',
          enum: ['campfire', 'party', 'mellow', 'high_energy', 'acoustic', 'full_band', 'mixed'],
          description: 'Type of event/vibe',
        },
        targetDuration: { type: 'number', description: 'Target duration in minutes' },
        songCount: { type: 'number', description: 'Number of songs wanted' },
        preferredKeys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Preferred keys to stick to',
        },
        excludeSongs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Song titles to exclude',
        },
        mustInclude: {
          type: 'array',
          items: { type: 'string' },
          description: 'Songs that must be included',
        },
        acousticOnly: { type: 'boolean', description: 'Only acoustic-friendly songs' },
      },
      required: ['occasion'],
    },
  },
  {
    name: 'createQuickSetlist',
    description:
      'Quickly create a setlist for a specific occasion (campfire, party, chill night, etc.)',
    parameters: {
      type: 'object',
      properties: {
        occasion: {
          type: 'string',
          description:
            'The occasion (campfire, party, mellow, acoustic, high energy, chill, upbeat)',
        },
        songCount: { type: 'number', description: 'Number of songs (default 10)' },
        specificRequests: {
          type: 'string',
          description: 'Additional requests like "all in G or C" or "mellow vibe"',
        },
      },
      required: ['occasion'],
    },
  },
  {
    name: 'getPlaybackQueue',
    description: 'Get a queue of songs ready for continuous playback',
    parameters: {
      type: 'object',
      properties: {
        songIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Ordered list of song IDs to play',
        },
      },
      required: ['songIds'],
    },
  },
];
