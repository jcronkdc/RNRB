/**
 * GODLIKE AI ASSISTANT - ACTION SYSTEM
 *
 * This module provides secure actions that the AI can execute on behalf of users.
 * ALL actions are scoped to the authenticated user only.
 *
 * SECURITY: Every action verifies the user owns/has access to the resource.
 */

import { prisma } from '@cronkwaters/db';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface CreateProjectInput {
  name: string;
  type?: 'album' | 'ep' | 'single' | 'compilation';
  description?: string;
  genre?: string;
}

export interface CreateSongInput {
  title: string;
  projectId?: string;
  key?: string;
  tempo?: number;
  lyrics?: string;
}

export interface AddSongToProjectInput {
  songId: string;
  projectId: string;
}

export interface CreateTourInput {
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface CreateShowInput {
  tourId: string;
  name: string;
  date: string;
  venueName?: string;
  city?: string;
  state?: string;
}

export interface BuildSetlistInput {
  showId: string;
  targetDuration?: number; // minutes
  energyProfile?: 'high' | 'balanced' | 'mellow';
  songIds?: string[]; // Specific songs to include
}

export interface UpdateSongInput {
  songId: string;
  title?: string;
  lyrics?: string;
  chords?: string;
  key?: string;
  tempo?: number;
  status?: 'draft' | 'in_progress' | 'needs_review' | 'complete';
}

// ============================================
// PROJECT ACTIONS
// ============================================

export async function createProject(
  userId: string,
  input: CreateProjectInput
): Promise<ActionResult> {
  try {
    // First, check if user has a personal org or create one
    let org = await prisma.org.findFirst({
      where: {
        members: { some: { userId, role: 'owner' } },
        type: 'solo',
      },
    });

    if (!org) {
      // Create personal org for user
      const user = await prisma.user.findUnique({ where: { id: userId } });
      org = await prisma.org.create({
        data: {
          name: `${user?.name || 'My'}'s Music`,
          slug: `user-${userId}-${Date.now()}`,
          type: 'solo',
          members: {
            create: { userId, role: 'owner' },
          },
        },
      });
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: input.name,
        slug: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        type: input.type || 'album',
        status: 'planning',
        description: input.description,
        genre: input.genre,
        orgId: org.id,
        members: {
          create: { userId, role: 'owner' },
        },
      },
    });

    return {
      success: true,
      message: `Created project "${project.name}" successfully!`,
      data: { projectId: project.id, projectName: project.name },
    };
  } catch (error) {
    console.error('createProject error:', error);
    return {
      success: false,
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// SONG ACTIONS
// ============================================

export async function createSong(userId: string, input: CreateSongInput): Promise<ActionResult> {
  try {
    // If projectId provided, verify user has access
    if (input.projectId) {
      const membership = await prisma.projectMember.findFirst({
        where: { projectId: input.projectId, userId },
      });
      if (!membership) {
        return {
          success: false,
          message: 'You do not have access to this project',
          error: 'UNAUTHORIZED',
        };
      }
    }

    const song = await prisma.song.create({
      data: {
        title: input.title,
        userId,
        projectId: input.projectId,
        key: input.key,
        tempo: input.tempo,
        lyrics: input.lyrics,
        status: 'draft',
      },
    });

    return {
      success: true,
      message: `Created song "${song.title}" successfully!`,
      data: { songId: song.id, songTitle: song.title },
    };
  } catch (error) {
    console.error('createSong error:', error);
    return {
      success: false,
      message: 'Failed to create song',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateSong(userId: string, input: UpdateSongInput): Promise<ActionResult> {
  try {
    // Verify user owns the song
    const song = await prisma.song.findFirst({
      where: { id: input.songId, userId },
    });

    if (!song) {
      return {
        success: false,
        message: 'Song not found or you do not have access',
        error: 'NOT_FOUND',
      };
    }

    const updated = await prisma.song.update({
      where: { id: input.songId },
      data: {
        title: input.title,
        lyrics: input.lyrics,
        chords: input.chords,
        key: input.key,
        tempo: input.tempo,
        status: input.status,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Updated "${updated.title}" successfully!`,
      data: { songId: updated.id, songTitle: updated.title },
    };
  } catch (error) {
    console.error('updateSong error:', error);
    return {
      success: false,
      message: 'Failed to update song',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function addSongToProject(
  userId: string,
  input: AddSongToProjectInput
): Promise<ActionResult> {
  try {
    // Verify user owns the song
    const song = await prisma.song.findFirst({
      where: { id: input.songId, userId },
    });
    if (!song) {
      return { success: false, message: 'Song not found or you do not own it', error: 'NOT_FOUND' };
    }

    // Verify user has access to project
    const membership = await prisma.projectMember.findFirst({
      where: { projectId: input.projectId, userId },
    });
    if (!membership) {
      return {
        success: false,
        message: 'You do not have access to this project',
        error: 'UNAUTHORIZED',
      };
    }

    await prisma.song.update({
      where: { id: input.songId },
      data: { projectId: input.projectId },
    });

    const project = await prisma.project.findUnique({ where: { id: input.projectId } });

    return {
      success: true,
      message: `Added "${song.title}" to project "${project?.name}"!`,
      data: { songId: song.id, projectId: input.projectId },
    };
  } catch (error) {
    console.error('addSongToProject error:', error);
    return {
      success: false,
      message: 'Failed to add song to project',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// TOUR ACTIONS
// ============================================

export async function createTour(userId: string, input: CreateTourInput): Promise<ActionResult> {
  try {
    // Get user's org
    const membership = await prisma.membership.findFirst({
      where: { userId, role: { in: ['owner', 'admin'] } },
      include: { org: true },
    });

    if (!membership) {
      return {
        success: false,
        message: 'You need to be part of an organization to create tours',
        error: 'NO_ORG',
      };
    }

    const tour = await prisma.tour.create({
      data: {
        name: input.name,
        slug: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        orgId: membership.org.id,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        description: input.description,
        status: 'planning',
      },
    });

    return {
      success: true,
      message: `Created tour "${tour.name}" successfully!`,
      data: { tourId: tour.id, tourName: tour.name },
    };
  } catch (error) {
    console.error('createTour error:', error);
    return {
      success: false,
      message: 'Failed to create tour',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function createShow(userId: string, input: CreateShowInput): Promise<ActionResult> {
  try {
    // Verify user has access to tour
    const tour = await prisma.tour.findFirst({
      where: {
        id: input.tourId,
        org: { members: { some: { userId } } },
      },
    });

    if (!tour) {
      return {
        success: false,
        message: 'Tour not found or you do not have access',
        error: 'NOT_FOUND',
      };
    }

    // Create or find venue
    let venue = null;
    if (input.venueName) {
      venue = await prisma.venue.upsert({
        where: { slug: `${input.venueName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
        create: {
          name: input.venueName,
          slug: `${input.venueName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          city: input.city,
          state: input.state,
        },
        update: {},
      });
    }

    const show = await prisma.show.create({
      data: {
        name: input.name,
        slug: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        tourId: input.tourId,
        orgId: tour.orgId,
        date: new Date(input.date),
        venueId: venue?.id,
        status: 'scheduled',
      },
    });

    return {
      success: true,
      message: `Created show "${show.name}" on ${new Date(input.date).toLocaleDateString()}!`,
      data: { showId: show.id, showName: show.name },
    };
  } catch (error) {
    console.error('createShow error:', error);
    return {
      success: false,
      message: 'Failed to create show',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// SETLIST ACTIONS
// ============================================

export async function buildSetlist(
  userId: string,
  input: BuildSetlistInput
): Promise<ActionResult> {
  try {
    // Verify user has access to show
    const show = await prisma.show.findFirst({
      where: {
        id: input.showId,
        org: { members: { some: { userId } } },
      },
      include: { setlist: true },
    });

    if (!show) {
      return {
        success: false,
        message: 'Show not found or you do not have access',
        error: 'NOT_FOUND',
      };
    }

    // Get user's songs
    const songs = await prisma.song.findMany({
      where: {
        userId,
        archived: false,
        status: { in: ['complete', 'in_progress'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (songs.length === 0) {
      return {
        success: false,
        message: 'You have no songs to add to a setlist',
        error: 'NO_SONGS',
      };
    }

    // Filter songs if specific IDs provided
    let selectedSongs = input.songIds ? songs.filter((s) => input.songIds!.includes(s.id)) : songs;

    // Sort by energy (tempo) based on profile
    if (input.energyProfile === 'high') {
      selectedSongs = selectedSongs.sort((a, b) => (b.tempo || 100) - (a.tempo || 100));
    } else if (input.energyProfile === 'mellow') {
      selectedSongs = selectedSongs.sort((a, b) => (a.tempo || 100) - (b.tempo || 100));
    } else {
      // Balanced - alternate high/low
      const high = selectedSongs.filter((s) => (s.tempo || 100) >= 120);
      const low = selectedSongs.filter((s) => (s.tempo || 100) < 120);
      selectedSongs = [];
      while (high.length || low.length) {
        if (high.length) selectedSongs.push(high.shift()!);
        if (low.length) selectedSongs.push(low.shift()!);
      }
    }

    // Limit to target duration (estimate 4 min per song)
    const targetSongs = input.targetDuration ? Math.floor(input.targetDuration / 4) : 15;
    selectedSongs = selectedSongs.slice(0, targetSongs);

    // Create or update setlist
    let setlist = show.setlist;
    if (!setlist) {
      setlist = await prisma.setlist.create({
        data: {
          showId: show.id,
          name: `Setlist for ${show.name}`,
        },
      });
    } else {
      // Clear existing items
      await prisma.setlistItem.deleteMany({ where: { setlistId: setlist.id } });
    }

    // Add songs to setlist
    await prisma.setlistItem.createMany({
      data: selectedSongs.map((song, index) => ({
        setlistId: setlist!.id,
        songId: song.id,
        position: index + 1,
        isEncore: index >= selectedSongs.length - 2, // Last 2 songs as encore
      })),
    });

    return {
      success: true,
      message: `Built setlist with ${selectedSongs.length} songs for "${show.name}"!`,
      data: {
        setlistId: setlist.id,
        songCount: selectedSongs.length,
        songs: selectedSongs.map((s) => s.title),
        estimatedDuration: selectedSongs.length * 4,
      },
    };
  } catch (error) {
    console.error('buildSetlist error:', error);
    return {
      success: false,
      message: 'Failed to build setlist',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// CREATIVE HELPERS
// ============================================

export interface LyricSuggestion {
  line: string;
  type: 'verse' | 'chorus' | 'bridge';
  rhymesWith?: string;
}

export interface ChordSuggestion {
  progression: string[];
  style: string;
  explanation: string;
}

/**
 * Analyze user's songs to find patterns for creative suggestions
 */
export async function analyzeUserStyle(userId: string): Promise<{
  commonKeys: string[];
  averageTempo: number;
  commonThemes: string[];
  preferredStructures: string[];
}> {
  const songs = await prisma.song.findMany({
    where: { userId, archived: false },
    select: { key: true, tempo: true, lyrics: true },
  });

  // Analyze keys
  const keyCounts: Record<string, number> = {};
  songs.forEach((s) => {
    if (s.key) keyCounts[s.key] = (keyCounts[s.key] || 0) + 1;
  });
  const commonKeys = Object.entries(keyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => key);

  // Average tempo
  const tempos = songs.filter((s) => s.tempo).map((s) => s.tempo!);
  const averageTempo =
    tempos.length > 0 ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 120;

  // Common words/themes from lyrics (basic analysis)
  const allLyrics = songs
    .map((s) => s.lyrics || '')
    .join(' ')
    .toLowerCase();
  const themeWords = [
    'love',
    'road',
    'night',
    'heart',
    'dream',
    'fire',
    'rain',
    'sun',
    'freedom',
    'home',
  ];
  const commonThemes = themeWords.filter((w) => allLyrics.includes(w));

  return {
    commonKeys,
    averageTempo,
    commonThemes,
    preferredStructures: ['verse-chorus-verse-chorus-bridge-chorus'], // Default
  };
}

/**
 * Get chord progression suggestions based on key and style
 */
export function getChordProgressions(key: string, style: string): ChordSuggestion[] {
  const progressions: Record<string, ChordSuggestion[]> = {
    rock: [
      {
        progression: ['I', 'IV', 'V', 'I'],
        style: 'Classic Rock',
        explanation: 'The foundational rock progression',
      },
      {
        progression: ['I', 'V', 'vi', 'IV'],
        style: 'Pop Rock',
        explanation: 'The "Axis of Awesome" progression - works for everything',
      },
      {
        progression: ['i', 'VII', 'VI', 'VII'],
        style: 'Minor Rock',
        explanation: 'Dark, driving energy',
      },
    ],
    pop: [
      {
        progression: ['I', 'V', 'vi', 'IV'],
        style: 'Pop Standard',
        explanation: 'Used in hundreds of hit songs',
      },
      {
        progression: ['vi', 'IV', 'I', 'V'],
        style: 'Emotional Pop',
        explanation: 'Minor start gives emotional depth',
      },
      { progression: ['I', 'vi', 'IV', 'V'], style: '50s Pop', explanation: 'Timeless and warm' },
    ],
    folk: [
      {
        progression: ['I', 'IV', 'I', 'V'],
        style: 'Traditional Folk',
        explanation: 'Simple and singable',
      },
      {
        progression: ['I', 'V', 'IV', 'I'],
        style: 'Country Folk',
        explanation: 'Nashville standard',
      },
    ],
    blues: [
      {
        progression: ['I', 'I', 'IV', 'I', 'V', 'IV', 'I', 'V'],
        style: '12-Bar Blues',
        explanation: 'The foundation of rock and roll',
      },
    ],
  };

  // Convert roman numerals to actual chords based on key
  const keyChords: Record<string, string[]> = {
    C: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    G: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
    D: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    A: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
    E: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
    F: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  };

  const romanToIndex: Record<string, number> = {
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
  };

  const styleKey = style.toLowerCase();
  const suggestions = progressions[styleKey] || progressions['rock'];
  const chords = keyChords[key] || keyChords['C'];

  return suggestions.map((s) => ({
    ...s,
    progression: s.progression.map((roman) => chords[romanToIndex[roman] || 0]),
  }));
}

/**
 * Get rhyming words for lyrics
 */
export function getRhymes(word: string): string[] {
  // Basic rhyme dictionary - in production, use an API
  const rhymes: Record<string, string[]> = {
    love: ['above', 'dove', 'shove', 'of'],
    heart: ['start', 'part', 'art', 'apart', 'smart'],
    night: ['light', 'right', 'fight', 'sight', 'bright', 'flight'],
    day: ['way', 'say', 'stay', 'play', 'away', 'ray'],
    fire: ['desire', 'higher', 'wire', 'inspire'],
    rain: ['pain', 'again', 'train', 'remain', 'chain'],
    road: ['load', 'code', 'showed', 'mode', 'abode'],
    free: ['me', 'see', 'be', 'key', 'sea', 'tree'],
    dream: ['stream', 'team', 'seem', 'beam', 'scheme'],
    time: ['rhyme', 'climb', 'prime', 'sublime'],
    home: ['alone', 'known', 'stone', 'phone', 'own'],
    sky: ['fly', 'high', 'why', 'try', 'cry', 'die'],
  };

  const lowerWord = word.toLowerCase();
  return rhymes[lowerWord] || [];
}

// ============================================
// ACTION DISPATCHER
// ============================================

export type ActionName =
  | 'createProject'
  | 'createSong'
  | 'updateSong'
  | 'addSongToProject'
  | 'createTour'
  | 'createShow'
  | 'buildSetlist'
  | 'analyzeStyle'
  | 'getChordSuggestions'
  | 'getRhymes';

export async function executeAction(
  userId: string,
  action: ActionName,
  params: Record<string, any>
): Promise<ActionResult> {
  // All actions are scoped to the authenticated userId
  switch (action) {
    case 'createProject':
      return createProject(userId, params as CreateProjectInput);
    case 'createSong':
      return createSong(userId, params as CreateSongInput);
    case 'updateSong':
      return updateSong(userId, params as UpdateSongInput);
    case 'addSongToProject':
      return addSongToProject(userId, params as AddSongToProjectInput);
    case 'createTour':
      return createTour(userId, params as CreateTourInput);
    case 'createShow':
      return createShow(userId, params as CreateShowInput);
    case 'buildSetlist':
      return buildSetlist(userId, params as BuildSetlistInput);
    case 'analyzeStyle':
      const style = await analyzeUserStyle(userId);
      return { success: true, message: 'Analyzed your musical style', data: style };
    case 'getChordSuggestions':
      const chords = getChordProgressions(params.key || 'C', params.style || 'rock');
      return { success: true, message: 'Here are chord progression suggestions', data: chords };
    case 'getRhymes':
      const rhymes = getRhymes(params.word || '');
      return { success: true, message: `Rhymes for "${params.word}"`, data: rhymes };
    default:
      return { success: false, message: `Unknown action: ${action}`, error: 'UNKNOWN_ACTION' };
  }
}

// ============================================
// FUNCTION DEFINITIONS FOR AI
// ============================================

export const AI_FUNCTIONS = [
  {
    name: 'createProject',
    description: 'Create a new music project (album, EP, single) for the user',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the project' },
        type: {
          type: 'string',
          enum: ['album', 'ep', 'single', 'compilation'],
          description: 'Type of project',
        },
        description: { type: 'string', description: 'Description of the project' },
        genre: { type: 'string', description: 'Genre of the project' },
      },
      required: ['name'],
    },
  },
  {
    name: 'createSong',
    description: 'Create a new song for the user',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the song' },
        projectId: { type: 'string', description: 'ID of project to add song to (optional)' },
        key: { type: 'string', description: 'Musical key (e.g., C, G, Am)' },
        tempo: { type: 'number', description: 'Tempo in BPM' },
        lyrics: { type: 'string', description: 'Initial lyrics for the song' },
      },
      required: ['title'],
    },
  },
  {
    name: 'updateSong',
    description: 'Update an existing song (lyrics, chords, key, tempo, status)',
    parameters: {
      type: 'object',
      properties: {
        songId: { type: 'string', description: 'ID of the song to update' },
        title: { type: 'string', description: 'New title' },
        lyrics: { type: 'string', description: 'Updated lyrics' },
        chords: { type: 'string', description: 'Chord progression as JSON' },
        key: { type: 'string', description: 'Musical key' },
        tempo: { type: 'number', description: 'Tempo in BPM' },
        status: { type: 'string', enum: ['draft', 'in_progress', 'needs_review', 'complete'] },
      },
      required: ['songId'],
    },
  },
  {
    name: 'addSongToProject',
    description: 'Add an existing song to a project',
    parameters: {
      type: 'object',
      properties: {
        songId: { type: 'string', description: 'ID of the song' },
        projectId: { type: 'string', description: 'ID of the project' },
      },
      required: ['songId', 'projectId'],
    },
  },
  {
    name: 'createTour',
    description: 'Create a new tour',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the tour' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        description: { type: 'string', description: 'Description of the tour' },
      },
      required: ['name', 'startDate'],
    },
  },
  {
    name: 'createShow',
    description: 'Add a show/gig to a tour',
    parameters: {
      type: 'object',
      properties: {
        tourId: { type: 'string', description: 'ID of the tour' },
        name: { type: 'string', description: 'Name of the show' },
        date: { type: 'string', description: 'Date of the show (YYYY-MM-DD)' },
        venueName: { type: 'string', description: 'Name of the venue' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State/Province' },
      },
      required: ['tourId', 'name', 'date'],
    },
  },
  {
    name: 'buildSetlist',
    description: "Automatically build an optimized setlist for a show using the user's songs",
    parameters: {
      type: 'object',
      properties: {
        showId: { type: 'string', description: 'ID of the show' },
        targetDuration: { type: 'number', description: 'Target duration in minutes (default: 60)' },
        energyProfile: {
          type: 'string',
          enum: ['high', 'balanced', 'mellow'],
          description: 'Energy profile for the setlist',
        },
        songIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific song IDs to include',
        },
      },
      required: ['showId'],
    },
  },
  {
    name: 'analyzeStyle',
    description: "Analyze the user's musical style based on their songs",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getChordSuggestions',
    description: 'Get chord progression suggestions for a given key and style',
    parameters: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Musical key (e.g., C, G, Am)' },
        style: { type: 'string', description: 'Style (rock, pop, folk, blues)' },
      },
      required: ['key'],
    },
  },
  {
    name: 'getRhymes',
    description: 'Get rhyming words for songwriting',
    parameters: {
      type: 'object',
      properties: {
        word: { type: 'string', description: 'Word to find rhymes for' },
      },
      required: ['word'],
    },
  },
];
