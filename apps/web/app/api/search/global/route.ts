/**
 * Global Search API
 *
 * GET - Search across all resources
 *
 * Query params:
 * - q: Search query (required, min 2 chars)
 * - limit: Results per category (default 5, max 10)
 * - categories: Comma-separated list of categories to search (optional)
 *   - projects, songs, users, messages, files, shows
 *
 * Returns categorized results for instant search
 */

import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

type SearchCategory = 'projects' | 'songs' | 'users' | 'messages' | 'files' | 'shows';

const ALL_CATEGORIES: SearchCategory[] = [
  'projects',
  'songs',
  'users',
  'messages',
  'files',
  'shows',
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10);
    const categoriesParam = searchParams.get('categories');

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json({
        results: {},
        query: query || '',
        totalResults: 0,
      });
    }

    // Parse categories
    const categories: SearchCategory[] = categoriesParam
      ? (categoriesParam
          .split(',')
          .filter((c) => ALL_CATEGORIES.includes(c as SearchCategory)) as SearchCategory[])
      : ALL_CATEGORIES;

    // Execute all searches in parallel
    const searchPromises: Record<SearchCategory, Promise<any[]>> = {
      projects: categories.includes('projects')
        ? searchProjects(userId, query, limit)
        : Promise.resolve([]),
      songs: categories.includes('songs') ? searchSongs(userId, query, limit) : Promise.resolve([]),
      users: categories.includes('users') ? searchUsers(userId, query, limit) : Promise.resolve([]),
      messages: categories.includes('messages')
        ? searchMessages(userId, query, limit)
        : Promise.resolve([]),
      files: categories.includes('files') ? searchFiles(userId, query, limit) : Promise.resolve([]),
      shows: categories.includes('shows') ? searchShows(userId, query, limit) : Promise.resolve([]),
    };

    const results = await Promise.all(
      Object.entries(searchPromises).map(async ([category, promise]) => {
        const data = await promise;
        return [category, data] as const;
      })
    );

    // Build results object
    const resultsObj: Record<string, any[]> = {};
    let totalResults = 0;

    results.forEach(([category, data]) => {
      if (data.length > 0) {
        resultsObj[category] = data;
        totalResults += data.length;
      }
    });

    return NextResponse.json({
      results: resultsObj,
      query,
      totalResults,
    });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

/**
 * Search Projects
 */
async function searchProjects(userId: string, query: string, limit: number): Promise<any[]> {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        // User's own projects
        { ownerId: userId },
        // Collaborating projects
        { collaborators: { some: { userId } } },
        // Public projects matching query
        { visibility: 'public' },
      ],
      AND: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      visibility: true,
      coverImage: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          songs: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return projects.map((p) => ({
    id: p.id,
    type: 'project' as const,
    title: p.name,
    subtitle: p.description || `${p._count.songs} songs`,
    href: `/projects/${p.slug}`,
    image: p.coverImage,
    visibility: p.visibility,
    owner: p.owner,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

/**
 * Search Songs
 */
async function searchSongs(userId: string, query: string, limit: number): Promise<any[]> {
  const songs = await prisma.song.findMany({
    where: {
      OR: [
        // User's own songs
        { userId },
        // Songs in user's projects
        { project: { ownerId: userId } },
        // Songs in collaborating projects
        { project: { collaborators: { some: { userId } } } },
        // Public project songs
        { project: { visibility: 'public' } },
      ],
      AND: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { lyrics: { contains: query, mode: 'insensitive' } },
        ],
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      isFavorite: true,
      updatedAt: true,
      projectId: true,
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return songs.map((s) => ({
    id: s.id,
    type: 'song' as const,
    title: s.title,
    subtitle: s.project ? `in ${s.project.name}` : 'Standalone song',
    href: s.project ? `/projects/${s.project.slug}/songs/${s.id}` : `/songwriting?song=${s.id}`,
    status: s.status,
    isFavorite: s.isFavorite,
    owner: s.user,
    updatedAt: s.updatedAt.toISOString(),
  }));
}

/**
 * Search Users / Collaborators
 */
async function searchUsers(userId: string, query: string, limit: number): Promise<any[]> {
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { musicianProfile: { instruments: { hasSome: [query] } } },
        { musicianProfile: { genres: { hasSome: [query] } } },
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
      musicianProfile: {
        select: {
          instruments: true,
          genres: true,
          location: true,
          availableForCollaboration: true,
        },
      },
      _count: {
        select: {
          followers: true,
        },
      },
    },
    orderBy: [{ followers: { _count: 'desc' } }, { name: 'asc' }],
    take: limit,
  });

  return users.map((u) => ({
    id: u.id,
    type: 'user' as const,
    title: u.name || 'Unknown User',
    subtitle: u.musicianProfile?.instruments?.slice(0, 3).join(', ') || '',
    href: `/u/${u.id}`,
    image: u.image,
    location: u.musicianProfile?.location,
    isAvailable: u.musicianProfile?.availableForCollaboration,
    followerCount: u._count.followers,
  }));
}

/**
 * Search Messages
 */
async function searchMessages(userId: string, query: string, limit: number): Promise<any[]> {
  const messages = await prisma.chatMessage.findMany({
    where: {
      channelType: 'dm',
      channelId: { contains: userId },
      isDeleted: false,
      content: { contains: query, mode: 'insensitive' },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      channelId: true,
      content: true,
      senderId: true,
      senderName: true,
      senderAvatar: true,
      createdAt: true,
    },
  });

  // Get participant info
  const conversationIds = [...new Set(messages.map((m) => m.channelId))];
  const participantMap = new Map<string, any>();

  await Promise.all(
    conversationIds.map(async (convId) => {
      const parts = convId.split(':');
      const otherUserId = parts[1] === userId ? parts[2] : parts[1];

      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, name: true, image: true },
      });

      participantMap.set(convId, otherUser);
    })
  );

  return messages.map((m) => {
    const participant = participantMap.get(m.channelId);
    return {
      id: m.id,
      type: 'message' as const,
      title: participant?.name || 'Unknown',
      subtitle: truncateWithHighlight(m.content || '', query, 60),
      href: `/messages?conversation=${m.channelId}`,
      image: participant?.image,
      sender: {
        id: m.senderId,
        name: m.senderName,
        avatar: m.senderAvatar,
      },
      createdAt: m.createdAt.toISOString(),
    };
  });
}

/**
 * Search Library Files
 */
async function searchFiles(userId: string, query: string, limit: number): Promise<any[]> {
  const files = await prisma.libraryFile.findMany({
    where: {
      userId,
      OR: [{ name: { contains: query, mode: 'insensitive' } }, { tags: { hasSome: [query] } }],
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      type: true,
      size: true,
      duration: true,
      isFavorite: true,
      tags: true,
      updatedAt: true,
    },
  });

  return files.map((f) => ({
    id: f.id,
    type: 'file' as const,
    title: f.name,
    subtitle: formatFileInfo(f.type, f.size, f.duration),
    href: `/library?file=${f.id}`,
    fileType: f.type,
    isFavorite: f.isFavorite,
    tags: f.tags,
    updatedAt: f.updatedAt.toISOString(),
  }));
}

/**
 * Search Shows
 */
async function searchShows(userId: string, query: string, limit: number): Promise<any[]> {
  const shows = await prisma.show.findMany({
    where: {
      userId,
      OR: [
        { venue: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { date: 'asc' },
    take: limit,
    select: {
      id: true,
      venue: true,
      city: true,
      state: true,
      country: true,
      date: true,
      status: true,
      tourId: true,
      tour: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return shows.map((s) => ({
    id: s.id,
    type: 'show' as const,
    title: s.venue,
    subtitle: formatShowLocation(s.city, s.state, s.country),
    href: `/tours${s.tourId ? `/${s.tourId}` : ''}?show=${s.id}`,
    date: s.date.toISOString(),
    status: s.status,
    tour: s.tour,
  }));
}

// Helper functions
function truncateWithHighlight(content: string, query: string, maxLength: number): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerContent.indexOf(lowerQuery);

  if (idx === -1) {
    return content.length > maxLength ? content.slice(0, maxLength) + '...' : content;
  }

  // Center the highlight in the truncated text
  const start = Math.max(0, idx - Math.floor(maxLength / 3));
  const end = Math.min(content.length, start + maxLength);

  let result = content.slice(start, end);
  if (start > 0) result = '...' + result;
  if (end < content.length) result = result + '...';

  return result;
}

function formatFileInfo(type: string, size: number | null, duration: number | null): string {
  const parts: string[] = [];

  if (type) {
    const typeLabel =
      {
        audio: '🎵 Audio',
        image: '🖼️ Image',
        midi: '🎹 MIDI',
        document: '📄 Document',
      }[type] || type;
    parts.push(typeLabel);
  }

  if (duration) {
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    parts.push(`${mins}:${secs.toString().padStart(2, '0')}`);
  }

  if (size) {
    const mb = (size / (1024 * 1024)).toFixed(1);
    parts.push(`${mb} MB`);
  }

  return parts.join(' • ');
}

function formatShowLocation(
  city: string | null,
  state: string | null,
  country: string | null
): string {
  return [city, state, country].filter(Boolean).join(', ');
}
