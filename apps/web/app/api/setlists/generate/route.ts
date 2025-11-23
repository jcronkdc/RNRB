import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

type Song = {
  id: string;
  title: string;
  key?: string | null;
  tempo?: number | null;
  duration?: number | null;
};

type GeneratorOptions = {
  targetDuration: number; // minutes
  energyLevel: 'high' | 'mixed' | 'mellow';
  includeAllKeys?: boolean;
};

/**
 * POST /api/setlists/generate
 * Generate a smart setlist from available songs
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, targetDuration = 90, energyLevel = 'mixed' } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: user.id },
        },
        songs: {
          orderBy: { title: 'asc' },
        },
      },
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      );
    }

    if (project.songs.length === 0) {
      return NextResponse.json(
        { error: 'No songs in project to generate setlist from' },
        { status: 400 }
      );
    }

    // Generate setlist
    const generatedSongs = generateSetlist(project.songs, {
      targetDuration,
      energyLevel,
    });

    return NextResponse.json({ songs: generatedSongs });
  } catch (error) {
    console.error('Setlist generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate setlist' },
      { status: 500 }
    );
  }
}

/**
 * Smart setlist generation algorithm
 */
function generateSetlist(
  availableSongs: Song[],
  options: GeneratorOptions
): Song[] {
  const { targetDuration, energyLevel } = options;
  const targetSeconds = targetDuration * 60;

  // Categorize songs by tempo (energy level)
  const highEnergySongs = availableSongs.filter(s => s.tempo && s.tempo >= 130);
  const mediumEnergySongs = availableSongs.filter(s => s.tempo && s.tempo >= 90 && s.tempo < 130);
  const lowEnergySongs = availableSongs.filter(s => s.tempo && s.tempo < 90);
  const unknownTempoSongs = availableSongs.filter(s => !s.tempo);

  // Build song pool based on energy preference
  let songPool: Song[] = [];
  
  switch (energyLevel) {
    case 'high':
      songPool = [
        ...highEnergySongs,
        ...mediumEnergySongs.slice(0, Math.floor(mediumEnergySongs.length / 2)),
        ...unknownTempoSongs,
      ];
      break;
    case 'mellow':
      songPool = [
        ...lowEnergySongs,
        ...mediumEnergySongs.slice(0, Math.floor(mediumEnergySongs.length / 2)),
        ...unknownTempoSongs,
      ];
      break;
    case 'mixed':
    default:
      songPool = [...availableSongs];
      break;
  }

  if (songPool.length === 0) {
    // Fallback to all songs if filtering left us empty
    songPool = [...availableSongs];
  }

  // Shuffle pool
  songPool = shuffleArray(songPool);

  // Build setlist with target duration
  const setlist: Song[] = [];
  let currentDuration = 0;

  // Strategy: Start high energy, dip middle, end high
  const flowPattern = energyLevel === 'mixed' 
    ? ['high', 'high', 'medium', 'low', 'medium', 'high', 'high']
    : null;

  for (const song of songPool) {
    // Use default duration if not set (assume 3 minutes)
    const songDuration = song.duration || 180;

    // Check if adding this song would exceed target
    if (currentDuration + songDuration > targetSeconds + 300) { // +5 min buffer
      continue;
    }

    setlist.push(song);
    currentDuration += songDuration;

    // Stop if we've hit target duration
    if (currentDuration >= targetSeconds - 300) { // -5 min buffer
      break;
    }
  }

  // If we have a flow pattern, try to reorder for better energy flow
  if (flowPattern && setlist.length >= 5) {
    setlist.sort((a, b) => {
      const aEnergy = getEnergyLevel(a);
      const bEnergy = getEnergyLevel(b);
      
      // Prioritize songs with matching energy patterns
      const aIndex = setlist.indexOf(a);
      const bIndex = setlist.indexOf(b);
      const aTargetEnergy = flowPattern[aIndex % flowPattern.length];
      const bTargetEnergy = flowPattern[bIndex % flowPattern.length];

      if (aEnergy === aTargetEnergy && bEnergy !== bTargetEnergy) return -1;
      if (bEnergy === bTargetEnergy && aEnergy !== aTargetEnergy) return 1;
      
      return 0;
    });
  }

  // Ensure variety in keys (avoid too many consecutive same keys)
  const optimizedSetlist = optimizeKeyVariety(setlist);

  return optimizedSetlist;
}

/**
 * Get energy level of a song based on tempo
 */
function getEnergyLevel(song: Song): 'high' | 'medium' | 'low' {
  if (!song.tempo) return 'medium';
  if (song.tempo >= 130) return 'high';
  if (song.tempo >= 90) return 'medium';
  return 'low';
}

/**
 * Optimize setlist for key variety (avoid too many songs in same key consecutively)
 */
function optimizeKeyVariety(setlist: Song[]): Song[] {
  const optimized = [...setlist];
  
  for (let i = 0; i < optimized.length - 2; i++) {
    const currentKey = optimized[i]?.key;
    const nextKey = optimized[i + 1]?.key;
    const afterNextKey = optimized[i + 2]?.key;

    // If 3 consecutive songs have the same key, try to swap
    if (currentKey && currentKey === nextKey && currentKey === afterNextKey) {
      // Find a song later in the setlist with a different key
      for (let j = i + 3; j < optimized.length; j++) {
        if (optimized[j]?.key && optimized[j].key !== currentKey) {
          // Swap
          [optimized[i + 2], optimized[j]] = [optimized[j], optimized[i + 2]];
          break;
        }
      }
    }
  }

  return optimized;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

