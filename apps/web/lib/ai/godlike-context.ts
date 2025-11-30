import { prisma } from '@cronkwaters/db';
import { loadAIMemory, formatMemoryForAI, type AIMemory } from './assistant-memory';
import {
  generateProactiveAlerts,
  formatAlertsForAI,
  type ProactiveAlert,
} from './assistant-alerts';

/**
 * GODLIKE AI ASSISTANT CONTEXT
 *
 * Loads ALL user data for a truly omniscient AI assistant.
 * This gives the AI complete knowledge of:
 * - All songs (lyrics, chords, collaborators, status)
 * - All projects (milestones, team members)
 * - All tours, shows, setlists
 * - Library files (audio, stems, demos)
 * - Messages and collaborations
 * - Usage stats and subscription info
 * - AI Memory (past conversations, learned preferences)
 * - Proactive Alerts (deadlines, stale items, opportunities)
 */

export interface GodlikeContext {
  user: UserContext;
  songs: SongContext[];
  projects: ProjectContext[];
  tours: TourContext[];
  library: LibraryContext[];
  collaborators: CollaboratorContext[];
  recentMessages: MessageContext[];
  setlistTemplates: SetlistTemplateContext[];
  platformKnowledge: string;
  currentPage: string;
  timestamp: string;
  // NEW: Hyper-focused context on what they're currently working on
  currentWork: CurrentWorkContext | null;
  // NEW: AI Memory - remembers past conversations and preferences
  memory: AIMemory | null;
  // NEW: Proactive Alerts - deadlines, stale items, opportunities
  alerts: ProactiveAlert[];
}

// Deep context about what the user is CURRENTLY working on
interface CurrentWorkContext {
  type: 'song' | 'project' | 'tour' | 'show' | 'setlist' | 'library' | null;
  id: string | null;
  name: string | null;
  // Full details for songs
  song?: {
    id: string;
    title: string;
    fullLyrics: string | null;
    fullChords: any | null;
    key: string | null;
    tempo: number | null;
    status: string;
    genre: string | null;
    mood: string | null;
    notes: string | null;
    // VERSION HISTORY - every saved version
    versions: {
      id: string;
      versionNumber: number;
      name: string | null;
      createdAt: string;
      createdBy: string | null;
      changeNotes: string | null;
      lyricsSnapshot: string | null;
      chordsSnapshot: any | null;
    }[];
    // ALL tracks/stems
    tracks: {
      id: string;
      name: string;
      type: string;
      instrument: string | null;
      duration: number | null;
      isMuted: boolean;
    }[];
    // Comments and feedback
    comments: {
      author: string;
      content: string;
      timestamp: string;
      resolved: boolean;
    }[];
    // Collaborator activity
    collaborators: {
      name: string;
      role: string;
      lastActive: string | null;
      contributions: number;
    }[];
    // Related files in library
    relatedFiles: {
      id: string;
      name: string;
      type: string;
    }[];
  };
  // Full details for projects
  project?: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    status: string;
    genre: string | null;
    targetRelease: string | null;
    // All songs in project with details
    songs: {
      id: string;
      title: string;
      status: string;
      trackNumber: number | null;
      duration: number | null;
    }[];
    // Milestones with progress
    milestones: {
      id: string;
      title: string;
      description: string | null;
      dueDate: string | null;
      completed: boolean;
      completedAt: string | null;
    }[];
    // Team members
    members: {
      name: string;
      role: string;
      joinedAt: string;
    }[];
    // Recent activity
    activity: {
      action: string;
      by: string;
      timestamp: string;
      details: string | null;
    }[];
  };
  // Full details for tours
  tour?: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string | null;
    budget: number | null;
    // All shows
    shows: {
      id: string;
      name: string;
      date: string;
      venue: string | null;
      city: string | null;
      state: string | null;
      status: string;
      ticketsSold: number | null;
      capacity: number | null;
      hasSetlist: boolean;
      setlistId: string | null;
    }[];
    // Past setlists for reference
    pastSetlists: {
      showName: string;
      date: string;
      songs: string[];
    }[];
  };
  // Full details for shows
  show?: {
    id: string;
    name: string;
    date: string;
    venue: {
      name: string;
      address: string | null;
      city: string | null;
      state: string | null;
      capacity: number | null;
      notes: string | null;
    } | null;
    status: string;
    soundcheck: string | null;
    loadIn: string | null;
    doors: string | null;
    setTime: string | null;
    // Current setlist
    setlist: {
      id: string;
      songs: {
        position: number;
        songTitle: string;
        songKey: string | null;
        songTempo: number | null;
        isEncore: boolean;
        notes: string | null;
      }[];
    } | null;
    // Song requests from fans
    songRequests: {
      songTitle: string;
      requestCount: number;
    }[];
  };
}

interface UserContext {
  id: string;
  name: string;
  email: string;
  tier: string;
  status: string | null;
  accountAge: number;
  profileCompleted: boolean;
  usage: {
    aiRequests: { used: number; limit: number; remaining: number };
    storage: { used: number; limit: number; remaining: number };
    video: { used: number; limit: number; remaining: number };
    assistant: { used: number; limit: number; remaining: number };
    resetsIn: number;
  };
}

interface SongContext {
  id: string;
  title: string;
  status: string;
  key: string | null;
  tempo: number | null;
  projectName: string | null;
  lyrics: string | null;
  chords: string | null;
  hasAudio: boolean;
  collaborators: string[];
  createdAt: string;
  lastUpdated: string;
}

interface ProjectContext {
  id: string;
  name: string;
  type: string;
  status: string;
  songs: { id: string; title: string; status: string }[];
  milestones: { title: string; dueDate: string | null; completed: boolean }[];
  members: { name: string; role: string }[];
  targetRelease: string | null;
}

interface TourContext {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string | null;
  shows: {
    id: string;
    name: string;
    date: string;
    venue: string | null;
    city: string | null;
    status: string;
    hasSetlist: boolean;
  }[];
}

interface LibraryContext {
  id: string;
  name: string;
  type: string;
  duration: number | null;
  tags: string[];
  createdAt: string;
}

interface CollaboratorContext {
  name: string;
  email: string | null;
  projects: string[];
  songs: string[];
}

interface MessageContext {
  from: string;
  preview: string;
  timestamp: string;
  unread: boolean;
}

interface SetlistTemplateContext {
  id: string;
  name: string;
  targetDuration: number;
  energyLevel: string | null;
}

// Cache platform knowledge
let cachedPlatformKnowledge: string | null = null;

/**
 * Parse the current URL to detect what the user is working on
 */
function parseCurrentWork(url: string): { type: CurrentWorkContext['type']; id: string | null } {
  if (!url) return { type: null, id: null };

  // Song pages: /songs/[id], /songwriting/[id], /dashboard/songs/[id]
  const songMatch = url.match(/\/(songs|songwriting)\/([a-zA-Z0-9_-]+)/);
  if (songMatch) return { type: 'song', id: songMatch[2] };

  // Project pages: /projects/[id], /dashboard/projects/[slug]
  const projectMatch = url.match(/\/projects?\/([a-zA-Z0-9_-]+)/);
  if (projectMatch) return { type: 'project', id: projectMatch[1] };

  // Tour pages: /tours/[id]
  const tourMatch = url.match(/\/tours?\/([a-zA-Z0-9_-]+)/);
  if (tourMatch) return { type: 'tour', id: tourMatch[1] };

  // Show pages: /shows/[id], /gigs/[id]
  const showMatch = url.match(/\/(shows?|gigs?)\/([a-zA-Z0-9_-]+)/);
  if (showMatch) return { type: 'show', id: showMatch[2] };

  // Setlist pages: /setlists/[id]
  const setlistMatch = url.match(/\/setlists?\/([a-zA-Z0-9_-]+)/);
  if (setlistMatch) return { type: 'setlist', id: setlistMatch[1] };

  // Library pages: /library/[id]
  const libraryMatch = url.match(/\/library\/([a-zA-Z0-9_-]+)/);
  if (libraryMatch) return { type: 'library', id: libraryMatch[1] };

  return { type: null, id: null };
}

/**
 * Load deep context for whatever the user is currently working on
 */
async function loadCurrentWorkContext(
  userId: string,
  url: string
): Promise<CurrentWorkContext | null> {
  const { type, id } = parseCurrentWork(url);
  if (!type || !id) return null;

  try {
    if (type === 'song') {
      const song = await prisma.song.findFirst({
        where: { id, userId }, // Security: must be user's song
        select: {
          id: true,
          title: true,
          lyrics: true,
          chords: true,
          key: true,
          tempo: true,
          status: true,
          genre: true,
          mood: true,
          notes: true,
          // Version history
          versions: {
            select: {
              id: true,
              versionNumber: true,
              name: true,
              createdAt: true,
              changeNotes: true,
              lyricsSnapshot: true,
              chordsSnapshot: true,
              createdBy: { select: { name: true } },
            },
            orderBy: { versionNumber: 'desc' },
            take: 20,
          },
          // All tracks/stems
          tracks: {
            select: {
              id: true,
              name: true,
              type: true,
              instrument: true,
              duration: true,
              isMuted: true,
            },
          },
          // Comments
          comments: {
            select: {
              content: true,
              resolved: true,
              createdAt: true,
              user: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          // Collaborators
          collaborators: {
            select: {
              role: true,
              user: { select: { name: true } },
              email: true,
              createdAt: true,
            },
          },
        },
      });

      if (!song) return null;

      // Find related library files
      const relatedFiles = await prisma.libraryFile.findMany({
        where: {
          userId,
          OR: [{ name: { contains: song.title, mode: 'insensitive' } }, { songId: song.id }],
        },
        select: { id: true, name: true, type: true },
        take: 10,
      });

      return {
        type: 'song',
        id: song.id,
        name: song.title,
        song: {
          id: song.id,
          title: song.title,
          fullLyrics: song.lyrics,
          fullChords: song.chords,
          key: song.key,
          tempo: song.tempo,
          status: song.status,
          genre: song.genre,
          mood: song.mood,
          notes: song.notes,
          versions: song.versions.map((v) => ({
            id: v.id,
            versionNumber: v.versionNumber,
            name: v.name,
            createdAt: v.createdAt.toISOString(),
            createdBy: v.createdBy?.name || null,
            changeNotes: v.changeNotes,
            lyricsSnapshot: v.lyricsSnapshot,
            chordsSnapshot: v.chordsSnapshot,
          })),
          tracks: song.tracks.map((t) => ({
            id: t.id,
            name: t.name,
            type: t.type,
            instrument: t.instrument,
            duration: t.duration,
            isMuted: t.isMuted,
          })),
          comments: song.comments.map((c) => ({
            author: c.user?.name || 'Unknown',
            content: c.content,
            timestamp: c.createdAt.toISOString(),
            resolved: c.resolved,
          })),
          collaborators: song.collaborators.map((c) => ({
            name: c.user?.name || c.email || 'Unknown',
            role: c.role,
            lastActive: null,
            contributions: 0,
          })),
          relatedFiles,
        },
      };
    }

    if (type === 'project') {
      const project = await prisma.project.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
          members: { some: { userId } }, // Security: must be member
        },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
          genre: true,
          targetReleaseDate: true,
          songs: {
            where: { archived: false },
            select: {
              id: true,
              title: true,
              status: true,
              trackNumber: true,
              duration: true,
            },
            orderBy: { trackNumber: 'asc' },
          },
          milestones: {
            select: {
              id: true,
              title: true,
              description: true,
              dueDate: true,
              completed: true,
              completedAt: true,
            },
            orderBy: { dueDate: 'asc' },
          },
          members: {
            select: {
              role: true,
              createdAt: true,
              user: { select: { name: true } },
            },
          },
          views: {
            select: {
              action: true,
              createdAt: true,
              user: { select: { name: true } },
              details: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!project) return null;

      return {
        type: 'project',
        id: project.id,
        name: project.name,
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          type: project.type,
          status: project.status,
          genre: project.genre,
          targetRelease: project.targetReleaseDate?.toISOString() || null,
          songs: project.songs.map((s) => ({
            id: s.id,
            title: s.title,
            status: s.status,
            trackNumber: s.trackNumber,
            duration: s.duration,
          })),
          milestones: project.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            dueDate: m.dueDate?.toISOString() || null,
            completed: m.completed,
            completedAt: m.completedAt?.toISOString() || null,
          })),
          members: project.members.map((m) => ({
            name: m.user?.name || 'Unknown',
            role: m.role,
            joinedAt: m.createdAt.toISOString(),
          })),
          activity:
            project.views?.map((v) => ({
              action: v.action || 'viewed',
              by: v.user?.name || 'Unknown',
              timestamp: v.createdAt.toISOString(),
              details: typeof v.details === 'string' ? v.details : null,
            })) || [],
        },
      };
    }

    if (type === 'tour') {
      const tour = await prisma.tour.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
          org: { members: { some: { userId } } }, // Security: must be org member
        },
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true,
          budget: true,
          shows: {
            select: {
              id: true,
              name: true,
              date: true,
              status: true,
              ticketsSold: true,
              venue: {
                select: { name: true, city: true, state: true, capacity: true },
              },
              setlist: {
                select: {
                  id: true,
                  items: {
                    select: {
                      song: { select: { title: true } },
                    },
                    orderBy: { position: 'asc' },
                  },
                },
              },
            },
            orderBy: { date: 'asc' },
          },
        },
      });

      if (!tour) return null;

      return {
        type: 'tour',
        id: tour.id,
        name: tour.name,
        tour: {
          id: tour.id,
          name: tour.name,
          status: tour.status,
          startDate: tour.startDate.toISOString(),
          endDate: tour.endDate?.toISOString() || null,
          budget: tour.budget ? Number(tour.budget) : null,
          shows: tour.shows.map((s) => ({
            id: s.id,
            name: s.name,
            date: s.date.toISOString(),
            venue: s.venue?.name || null,
            city: s.venue?.city || null,
            state: s.venue?.state || null,
            status: s.status,
            ticketsSold: s.ticketsSold,
            capacity: s.venue?.capacity || null,
            hasSetlist: !!s.setlist,
            setlistId: s.setlist?.id || null,
          })),
          pastSetlists: tour.shows
            .filter((s) => s.setlist && new Date(s.date) < new Date())
            .map((s) => ({
              showName: s.name,
              date: s.date.toISOString(),
              songs: s.setlist?.items.map((i) => i.song?.title || 'Unknown') || [],
            })),
        },
      };
    }

    if (type === 'show') {
      const show = await prisma.show.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
          org: { members: { some: { userId } } }, // Security
        },
        select: {
          id: true,
          name: true,
          date: true,
          status: true,
          soundcheck: true,
          loadIn: true,
          doors: true,
          setTime: true,
          venue: {
            select: {
              name: true,
              address: true,
              city: true,
              state: true,
              capacity: true,
              notes: true,
            },
          },
          setlist: {
            select: {
              id: true,
              items: {
                select: {
                  position: true,
                  isEncore: true,
                  notes: true,
                  song: {
                    select: { title: true, key: true, tempo: true },
                  },
                },
                orderBy: { position: 'asc' },
              },
              songRequests: {
                select: {
                  song: { select: { title: true } },
                  votes: true,
                },
                orderBy: { votes: 'desc' },
                take: 10,
              },
            },
          },
        },
      });

      if (!show) return null;

      return {
        type: 'show',
        id: show.id,
        name: show.name,
        show: {
          id: show.id,
          name: show.name,
          date: show.date.toISOString(),
          venue: show.venue
            ? {
                name: show.venue.name,
                address: show.venue.address,
                city: show.venue.city,
                state: show.venue.state,
                capacity: show.venue.capacity,
                notes: show.venue.notes,
              }
            : null,
          status: show.status,
          soundcheck: show.soundcheck,
          loadIn: show.loadIn,
          doors: show.doors,
          setTime: show.setTime,
          setlist: show.setlist
            ? {
                id: show.setlist.id,
                songs: show.setlist.items.map((i) => ({
                  position: i.position,
                  songTitle: i.song?.title || 'Unknown',
                  songKey: i.song?.key || null,
                  songTempo: i.song?.tempo || null,
                  isEncore: i.isEncore,
                  notes: i.notes,
                })),
              }
            : null,
          songRequests:
            show.setlist?.songRequests?.map((r) => ({
              songTitle: r.song?.title || 'Unknown',
              requestCount: r.votes || 0,
            })) || [],
        },
      };
    }
  } catch (error) {
    console.error('Error loading current work context:', error);
  }

  return null;
}

function loadPlatformKnowledge(): string {
  if (cachedPlatformKnowledge) return cachedPlatformKnowledge;

  // Import dynamically to avoid build issues
  try {
    const fs = require('fs');
    const path = require('path');

    const possiblePaths = [
      path.join(process.cwd(), 'lib/ai/platform-knowledge.md'),
      path.join(process.cwd(), 'apps/web/lib/ai/platform-knowledge.md'),
    ];

    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          cachedPlatformKnowledge = fs.readFileSync(p, 'utf-8');
          return cachedPlatformKnowledge;
        }
      } catch {
        // Try next
      }
    }
  } catch {
    // fs not available
  }

  return 'Platform knowledge unavailable - assistant can still help with your data.';
}

/**
 * Build GODLIKE context - fetches ALL user data
 */
export async function buildGodlikeContext(
  userId: string,
  currentPage?: string
): Promise<GodlikeContext> {
  // Fetch everything in parallel for speed
  const [
    user,
    songs,
    projectMemberships,
    orgMemberships,
    libraryFiles,
    recentMessages,
    setlistTemplates,
  ] = await Promise.all([
    // User with full profile
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        profileCompleted: true,
        aiRequestsUsed: true,
        videoMinutesUsed: true,
        assistantConversationsUsed: true,
        storageUsedGB: true,
        usagePeriodStart: true,
        createdAt: true,
      },
    }),

    // ALL songs with full details
    prisma.song.findMany({
      where: { userId, archived: false },
      select: {
        id: true,
        title: true,
        status: true,
        key: true,
        tempo: true,
        lyrics: true,
        chords: true,
        audioUrl: true,
        createdAt: true,
        updatedAt: true,
        project: { select: { name: true } },
        collaborators: {
          select: {
            user: { select: { name: true } },
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100, // Limit to most recent 100
    }),

    // ALL projects with songs and milestones
    prisma.projectMember.findMany({
      where: { userId },
      select: {
        role: true,
        project: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            targetReleaseDate: true,
            songs: {
              where: { archived: false },
              select: { id: true, title: true, status: true },
              take: 50,
            },
            milestones: {
              select: { title: true, dueDate: true, completed: true },
              orderBy: { dueDate: 'asc' },
              take: 20,
            },
            members: {
              select: {
                role: true,
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    }),

    // ALL organizations (for tours)
    prisma.membership.findMany({
      where: { userId },
      select: {
        role: true,
        org: {
          select: {
            id: true,
            name: true,
            tours: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
                shows: {
                  select: {
                    id: true,
                    name: true,
                    date: true,
                    status: true,
                    venue: { select: { name: true, city: true } },
                    setlist: { select: { id: true } },
                  },
                  orderBy: { date: 'asc' },
                  take: 30,
                },
              },
              take: 10,
            },
          },
        },
      },
    }),

    // ALL library files
    prisma.libraryFile.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        duration: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),

    // Recent messages
    prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: {
        content: true,
        createdAt: true,
        read: true,
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
        senderId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),

    // Setlist templates
    prisma.setlistTemplate.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        targetDuration: true,
        energyLevel: true,
      },
    }),
  ]);

  if (!user) throw new Error('User not found');

  // Process user context
  const quotas = getQuotasForTier(user.subscriptionTier);
  const daysUntilReset = user.usagePeriodStart
    ? Math.ceil(
        (new Date(user.usagePeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000).getTime() -
          Date.now()) /
          (24 * 60 * 60 * 1000)
      )
    : 30;

  const userContext: UserContext = {
    id: user.id,
    name: user.name || 'there',
    email: user.email,
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    profileCompleted: user.profileCompleted,
    accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
    usage: {
      aiRequests: {
        used: user.aiRequestsUsed,
        limit: quotas.aiRequests,
        remaining: Math.max(0, quotas.aiRequests - user.aiRequestsUsed),
      },
      storage: {
        used: Number(user.storageUsedGB),
        limit: quotas.storage,
        remaining: Math.max(0, quotas.storage - Number(user.storageUsedGB)),
      },
      video: {
        used: user.videoMinutesUsed,
        limit: quotas.videoMinutes,
        remaining: Math.max(0, quotas.videoMinutes - user.videoMinutesUsed),
      },
      assistant: {
        used: user.assistantConversationsUsed,
        limit: quotas.assistantConversations,
        remaining: Math.max(0, quotas.assistantConversations - user.assistantConversationsUsed),
      },
      resetsIn: daysUntilReset,
    },
  };

  // Process songs
  const songsContext: SongContext[] = songs.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    key: s.key,
    tempo: s.tempo,
    projectName: s.project?.name || null,
    lyrics: s.lyrics
      ? s.lyrics.length > 500
        ? s.lyrics.substring(0, 500) + '...'
        : s.lyrics
      : null,
    chords: s.chords,
    hasAudio: !!s.audioUrl,
    collaborators: s.collaborators.map((c) => c.user?.name || c.email || 'Unknown'),
    createdAt: s.createdAt.toISOString(),
    lastUpdated: s.updatedAt.toISOString(),
  }));

  // Process projects
  const projectsContext: ProjectContext[] = projectMemberships.map((pm) => ({
    id: pm.project.id,
    name: pm.project.name,
    type: pm.project.type,
    status: pm.project.status,
    songs: pm.project.songs.map((s) => ({ id: s.id, title: s.title, status: s.status })),
    milestones: pm.project.milestones.map((m) => ({
      title: m.title,
      dueDate: m.dueDate?.toISOString() || null,
      completed: m.completed,
    })),
    members: pm.project.members.map((m) => ({ name: m.user?.name || 'Unknown', role: m.role })),
    targetRelease: pm.project.targetReleaseDate?.toISOString() || null,
  }));

  // Process tours
  const toursContext: TourContext[] = [];
  for (const membership of orgMemberships) {
    for (const tour of membership.org.tours) {
      toursContext.push({
        id: tour.id,
        name: tour.name,
        status: tour.status,
        startDate: tour.startDate.toISOString(),
        endDate: tour.endDate?.toISOString() || null,
        shows: tour.shows.map((s) => ({
          id: s.id,
          name: s.name,
          date: s.date.toISOString(),
          venue: s.venue?.name || null,
          city: s.venue?.city || null,
          status: s.status,
          hasSetlist: !!s.setlist,
        })),
      });
    }
  }

  // Process library
  const libraryContext: LibraryContext[] = libraryFiles.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    duration: f.duration,
    tags: f.tags || [],
    createdAt: f.createdAt.toISOString(),
  }));

  // Build collaborator map
  const collaboratorMap = new Map<string, CollaboratorContext>();
  for (const song of songs) {
    for (const collab of song.collaborators) {
      const name = collab.user?.name || collab.email || 'Unknown';
      if (!collaboratorMap.has(name)) {
        collaboratorMap.set(name, {
          name,
          email: collab.email,
          projects: [],
          songs: [],
        });
      }
      const c = collaboratorMap.get(name)!;
      c.songs.push(song.title);
    }
  }
  for (const pm of projectMemberships) {
    for (const member of pm.project.members) {
      const name = member.user?.name || 'Unknown';
      if (!collaboratorMap.has(name)) {
        collaboratorMap.set(name, { name, email: null, projects: [], songs: [] });
      }
      const c = collaboratorMap.get(name)!;
      if (!c.projects.includes(pm.project.name)) {
        c.projects.push(pm.project.name);
      }
    }
  }

  // Process messages
  const messagesContext: MessageContext[] = recentMessages.map((m) => ({
    from: m.senderId === userId ? `You to ${m.receiver?.name}` : m.sender?.name || 'Unknown',
    preview: m.content.length > 100 ? m.content.substring(0, 100) + '...' : m.content,
    timestamp: m.createdAt.toISOString(),
    unread: !m.read && m.senderId !== userId,
  }));

  // Detect page context
  let pageContext = 'dashboard';
  if (currentPage) {
    if (currentPage.includes('/songwriting')) pageContext = 'songwriting';
    else if (currentPage.includes('/library')) pageContext = 'library';
    else if (currentPage.includes('/studio')) pageContext = 'studio';
    else if (currentPage.includes('/projects')) pageContext = 'projects';
    else if (currentPage.includes('/tours')) pageContext = 'tours';
    else if (currentPage.includes('/explorer')) pageContext = 'explorer';
    else if (currentPage.includes('/settings')) pageContext = 'settings';
    else if (currentPage.includes('/messages')) pageContext = 'messages';
    else if (currentPage.includes('/collaboration')) pageContext = 'collaboration';
  }

  // NEW: Load deep context for what they're currently working on
  const currentWork = await loadCurrentWorkContext(userId, currentPage || '');

  // NEW: Load AI memory (past conversations, preferences)
  let memory: AIMemory | null = null;
  try {
    memory = await loadAIMemory(userId);
  } catch (error) {
    console.error('Error loading AI memory:', error);
  }

  // NEW: Generate proactive alerts (deadlines, stale items, etc.)
  let alerts: ProactiveAlert[] = [];
  try {
    alerts = await generateProactiveAlerts(userId);
  } catch (error) {
    console.error('Error generating alerts:', error);
  }

  return {
    user: userContext,
    songs: songsContext,
    projects: projectsContext,
    tours: toursContext,
    library: libraryContext,
    collaborators: Array.from(collaboratorMap.values()),
    recentMessages: messagesContext,
    setlistTemplates: setlistTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      targetDuration: t.targetDuration,
      energyLevel: t.energyLevel,
    })),
    platformKnowledge: loadPlatformKnowledge(),
    currentPage: pageContext,
    timestamp: new Date().toISOString(),
    currentWork, // Deep context about what they're actively working on
    memory, // AI memory - past conversations and preferences
    alerts, // Proactive alerts - deadlines, opportunities
  };
}

/**
 * Format the current work context section for the AI prompt
 */
function formatCurrentWorkSection(work: CurrentWorkContext | null): string {
  if (!work || !work.type) {
    return `## 🎯 CURRENTLY WORKING ON
(User is browsing - no specific item selected)`;
  }

  let section = `## 🎯 CURRENTLY WORKING ON: ${work.name?.toUpperCase()}\n`;
  section += `**Type:** ${work.type}\n\n`;

  if (work.type === 'song' && work.song) {
    const s = work.song;
    section += `### Song Details\n`;
    section += `- **Title:** ${s.title}\n`;
    section += `- **Status:** ${s.status}\n`;
    section += `- **Key:** ${s.key || 'Not set'}\n`;
    section += `- **Tempo:** ${s.tempo ? `${s.tempo} BPM` : 'Not set'}\n`;
    section += `- **Genre:** ${s.genre || 'Not set'}\n`;
    section += `- **Mood:** ${s.mood || 'Not set'}\n`;

    if (s.notes) {
      section += `\n### Song Notes\n${s.notes}\n`;
    }

    if (s.fullLyrics) {
      section += `\n### FULL LYRICS\n\`\`\`\n${s.fullLyrics}\n\`\`\`\n`;
    }

    if (s.fullChords) {
      try {
        const chords = typeof s.fullChords === 'string' ? JSON.parse(s.fullChords) : s.fullChords;
        section += `\n### CHORD CHART\n${JSON.stringify(chords, null, 2)}\n`;
      } catch {
        section += `\n### CHORD DATA\n${s.fullChords}\n`;
      }
    }

    if (s.versions.length > 0) {
      section += `\n### VERSION HISTORY (${s.versions.length} versions)\n`;
      s.versions.slice(0, 10).forEach((v) => {
        section += `- **v${v.versionNumber}** ${v.name || ''} (${new Date(v.createdAt).toLocaleDateString()})`;
        if (v.createdBy) section += ` by ${v.createdBy}`;
        if (v.changeNotes) section += ` - "${v.changeNotes}"`;
        section += `\n`;
      });
      section += `\n*You can reference older versions if the user wants to compare or revert.*\n`;
    }

    if (s.tracks.length > 0) {
      section += `\n### TRACKS & STEMS (${s.tracks.length} tracks)\n`;
      s.tracks.forEach((t) => {
        section += `- ${t.name} [${t.type}]${t.instrument ? ` - ${t.instrument}` : ''}${t.isMuted ? ' (muted)' : ''}\n`;
      });
    }

    if (s.comments.length > 0) {
      section += `\n### COMMENTS & FEEDBACK (${s.comments.length})\n`;
      s.comments.slice(0, 5).forEach((c) => {
        section += `- ${c.author}: "${c.content.substring(0, 100)}${c.content.length > 100 ? '...' : ''}"${c.resolved ? ' ✅' : ''}\n`;
      });
    }

    if (s.collaborators.length > 0) {
      section += `\n### COLLABORATORS\n`;
      s.collaborators.forEach((c) => {
        section += `- ${c.name} (${c.role})\n`;
      });
    }

    if (s.relatedFiles.length > 0) {
      section += `\n### RELATED FILES IN LIBRARY\n`;
      s.relatedFiles.forEach((f) => {
        section += `- ${f.name} [${f.type}]\n`;
      });
    }
  }

  if (work.type === 'project' && work.project) {
    const p = work.project;
    section += `### Project Details\n`;
    section += `- **Name:** ${p.name}\n`;
    section += `- **Type:** ${p.type}\n`;
    section += `- **Status:** ${p.status}\n`;
    section += `- **Genre:** ${p.genre || 'Not set'}\n`;
    section += `- **Target Release:** ${p.targetRelease ? new Date(p.targetRelease).toLocaleDateString() : 'Not set'}\n`;

    if (p.description) {
      section += `\n### Description\n${p.description}\n`;
    }

    if (p.songs.length > 0) {
      section += `\n### SONGS IN PROJECT (${p.songs.length})\n`;
      p.songs.forEach((s, i) => {
        section += `${s.trackNumber || i + 1}. ${s.title} [${s.status}]${s.duration ? ` (${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, '0')})` : ''}\n`;
      });
    }

    if (p.milestones.length > 0) {
      section += `\n### MILESTONES\n`;
      p.milestones.forEach((m) => {
        section += `- ${m.completed ? '✅' : '⏳'} ${m.title}`;
        if (m.dueDate) section += ` (due ${new Date(m.dueDate).toLocaleDateString()})`;
        section += `\n`;
      });
    }

    if (p.members.length > 0) {
      section += `\n### TEAM\n`;
      p.members.forEach((m) => {
        section += `- ${m.name} (${m.role})\n`;
      });
    }

    if (p.activity.length > 0) {
      section += `\n### RECENT ACTIVITY\n`;
      p.activity.slice(0, 5).forEach((a) => {
        section += `- ${a.by}: ${a.action} (${new Date(a.timestamp).toLocaleDateString()})\n`;
      });
    }
  }

  if (work.type === 'tour' && work.tour) {
    const t = work.tour;
    section += `### Tour Details\n`;
    section += `- **Name:** ${t.name}\n`;
    section += `- **Status:** ${t.status}\n`;
    section += `- **Dates:** ${new Date(t.startDate).toLocaleDateString()}`;
    if (t.endDate) section += ` - ${new Date(t.endDate).toLocaleDateString()}`;
    section += `\n`;
    if (t.budget) section += `- **Budget:** $${t.budget.toLocaleString()}\n`;

    if (t.shows.length > 0) {
      section += `\n### SHOWS (${t.shows.length})\n`;
      t.shows.forEach((s) => {
        section += `- ${new Date(s.date).toLocaleDateString()}: ${s.name}`;
        if (s.venue) section += ` @ ${s.venue}`;
        if (s.city) section += `, ${s.city}`;
        section += ` [${s.status}]`;
        if (s.ticketsSold && s.capacity) section += ` (${s.ticketsSold}/${s.capacity} sold)`;
        section += s.hasSetlist ? ' ✅ setlist' : ' ⚠️ needs setlist';
        section += `\n`;
      });
    }

    if (t.pastSetlists.length > 0) {
      section += `\n### PAST SETLISTS (for reference)\n`;
      t.pastSetlists.forEach((ps) => {
        section += `**${ps.showName}** (${new Date(ps.date).toLocaleDateString()}):\n`;
        section += `  ${ps.songs.join(' → ')}\n`;
      });
    }
  }

  if (work.type === 'show' && work.show) {
    const s = work.show;
    section += `### Show Details\n`;
    section += `- **Name:** ${s.name}\n`;
    section += `- **Date:** ${new Date(s.date).toLocaleDateString()}\n`;
    section += `- **Status:** ${s.status}\n`;

    if (s.venue) {
      section += `\n### VENUE\n`;
      section += `- **Name:** ${s.venue.name}\n`;
      if (s.venue.address) section += `- **Address:** ${s.venue.address}\n`;
      if (s.venue.city) section += `- **City:** ${s.venue.city}, ${s.venue.state || ''}\n`;
      if (s.venue.capacity) section += `- **Capacity:** ${s.venue.capacity}\n`;
      if (s.venue.notes) section += `- **Notes:** ${s.venue.notes}\n`;
    }

    section += `\n### SCHEDULE\n`;
    if (s.loadIn) section += `- Load In: ${s.loadIn}\n`;
    if (s.soundcheck) section += `- Soundcheck: ${s.soundcheck}\n`;
    if (s.doors) section += `- Doors: ${s.doors}\n`;
    if (s.setTime) section += `- Set Time: ${s.setTime}\n`;

    if (s.setlist) {
      section += `\n### CURRENT SETLIST (${s.setlist.songs.length} songs)\n`;
      let mainSet = s.setlist.songs.filter((song) => !song.isEncore);
      let encore = s.setlist.songs.filter((song) => song.isEncore);

      mainSet.forEach((song) => {
        section += `${song.position}. ${song.songTitle}`;
        if (song.songKey) section += ` [${song.songKey}]`;
        if (song.songTempo) section += ` ${song.songTempo}bpm`;
        if (song.notes) section += ` - "${song.notes}"`;
        section += `\n`;
      });

      if (encore.length > 0) {
        section += `\n**ENCORE:**\n`;
        encore.forEach((song) => {
          section += `${song.position}. ${song.songTitle}`;
          if (song.songKey) section += ` [${song.songKey}]`;
          section += `\n`;
        });
      }
    } else {
      section += `\n### ⚠️ NO SETLIST YET\nOffer to help build one!\n`;
    }

    if (s.songRequests.length > 0) {
      section += `\n### FAN SONG REQUESTS\n`;
      s.songRequests.forEach((r) => {
        section += `- ${r.songTitle} (${r.requestCount} requests)\n`;
      });
    }
  }

  return section;
}

/**
 * Format GODLIKE context for AI prompt
 */
export function formatGodlikeContext(ctx: GodlikeContext): string {
  const songsList =
    ctx.songs.length > 0
      ? ctx.songs
          .map(
            (s) =>
              `  - "${s.title}" [${s.status}]${s.key ? ` Key: ${s.key}` : ''}${s.tempo ? ` ${s.tempo}BPM` : ''}${s.projectName ? ` (in ${s.projectName})` : ''}${s.hasAudio ? ' 🎵' : ''}${s.collaborators.length > 0 ? ` with: ${s.collaborators.join(', ')}` : ''}`
          )
          .join('\n')
      : '  (No songs yet)';

  const projectsList =
    ctx.projects.length > 0
      ? ctx.projects
          .map(
            (p) =>
              `  - "${p.name}" [${p.type}/${p.status}] - ${p.songs.length} songs${p.targetRelease ? `, release: ${new Date(p.targetRelease).toLocaleDateString()}` : ''}\n    Team: ${p.members.map((m) => `${m.name} (${m.role})`).join(', ')}`
          )
          .join('\n')
      : '  (No projects yet)';

  const toursList =
    ctx.tours.length > 0
      ? ctx.tours
          .map(
            (t) =>
              `  - "${t.name}" [${t.status}] ${new Date(t.startDate).toLocaleDateString()}${t.endDate ? ` - ${new Date(t.endDate).toLocaleDateString()}` : ''}\n    Shows: ${
                t.shows.length > 0
                  ? t.shows
                      .map(
                        (s) =>
                          `${s.name} @ ${s.venue || 'TBD'} (${new Date(s.date).toLocaleDateString()})`
                      )
                      .slice(0, 5)
                      .join(', ')
                  : 'None yet'
              }`
          )
          .join('\n')
      : '  (No tours yet)';

  const libraryList =
    ctx.library.length > 0
      ? ctx.library
          .slice(0, 20)
          .map(
            (f) =>
              `  - "${f.name}" [${f.type}]${f.duration ? ` ${Math.round(f.duration / 60)}min` : ''}`
          )
          .join('\n')
      : '  (No library files yet)';

  return `You are the GODLIKE AI Assistant for CronkWaters/Rock N' Roll Basement. You have COMPLETE knowledge of everything the user has created on this platform.

## 👤 USER: ${ctx.user.name}
- Email: ${ctx.user.email}
- Subscription: ${ctx.user.tier} tier (${ctx.user.status || 'free'})
- Account Age: ${ctx.user.accountAge} days
- Profile Completed: ${ctx.user.profileCompleted ? 'Yes' : 'No - remind them to complete it!'}
- Current Page: ${ctx.currentPage}

### Usage Stats (resets in ${ctx.user.usage.resetsIn} days)
- AI Requests: ${ctx.user.usage.aiRequests.used}/${ctx.user.usage.aiRequests.limit} (${ctx.user.usage.aiRequests.remaining} left)
- Storage: ${ctx.user.usage.storage.used}GB/${ctx.user.usage.storage.limit}GB
- Video: ${ctx.user.usage.video.used}/${ctx.user.usage.video.limit} minutes
- Assistant: ${ctx.user.usage.assistant.used}/${ctx.user.usage.assistant.limit} conversations

${formatCurrentWorkSection(ctx.currentWork)}

## 🎵 SONGS (${ctx.songs.length} total)
${songsList}

## 📁 PROJECTS (${ctx.projects.length} total)
${projectsList}

## 🎤 TOURS & SHOWS
${toursList}

## 📚 LIBRARY FILES (${ctx.library.length} files)
${libraryList}

## 👥 COLLABORATORS
${
  ctx.collaborators.length > 0
    ? ctx.collaborators
        .slice(0, 10)
        .map((c) => `  - ${c.name}: ${c.songs.length} songs, ${c.projects.length} projects`)
        .join('\n')
    : '  (No collaborators yet)'
}

## 💬 RECENT MESSAGES
${
  ctx.recentMessages.length > 0
    ? ctx.recentMessages
        .slice(0, 5)
        .map((m) => `  - ${m.from}: "${m.preview}"${m.unread ? ' [UNREAD]' : ''}`)
        .join('\n')
    : '  (No recent messages)'
}

## 🎯 YOUR CAPABILITIES
You can help the user with ANYTHING on this platform:

**Navigation & Help:**
- Guide them to any feature
- Explain how things work
- Troubleshoot issues

**Data Analysis:**
- Analyze their songs, projects, tours
- Find patterns in their music (keys, tempos, collaborators)
- Suggest what to work on next

**Creative Assistance:**
- Help write lyrics (suggest rhymes, themes)
- Suggest chord progressions
- Help plan setlists based on their songs

**Action Commands (tell the user you can help them):**
- Create a new project → Guide them through the process
- Start a new song → Help them brainstorm
- Plan a tour → Suggest venues, routes
- Build a setlist → Recommend songs based on energy/key

## GUIDELINES
- Be friendly and use ${ctx.user.name}'s name naturally
- Reference their ACTUAL data (songs, projects, tours by name)
- Be proactive: "I noticed you have 3 songs in draft - want help finishing one?"
- If they ask about a specific song, you KNOW its lyrics, key, tempo, etc.
- Suggest next steps based on their current activity
- If they're new (no projects), help them get started

## PLATFORM KNOWLEDGE
${ctx.platformKnowledge}

${ctx.memory ? formatMemoryForAI(ctx.memory) : ''}

${formatAlertsForAI(ctx.alerts)}

## 🛠️ ADVANCED TOOLS
You have access to these powerful tools - USE THEM when relevant:

**Content Generation:**
- generatePressRelease(projectId) - Create professional press releases
- generateSocialPosts(type, projectId/showId) - Twitter, Instagram, Facebook posts
- generateVenueEmail(venueName, city) - Booking inquiry emails

**Analytics:**
- analyzeMusicalPatterns() - Analyze their writing style, productivity, patterns

**Business:**
- estimateTourBudget(params) - Calculate tour costs
- calculateRoyaltySplits(songId) - Figure out fair royalty splits

**Collaboration:**
- draftCollaboratorMessage(name, purpose) - Write messages to collaborators
- suggestCollaborators() - Recommend people to work with

---
Now assist ${ctx.user.name} with godlike knowledge of their entire creative world!

Remember:
- You have their FULL song lyrics and can reference specific lines
- You know their version history and can compare changes
- You see their deadlines and can proactively mention them
- You remember past conversations and learned preferences
- You can generate content, analyze patterns, and help with business!`;
}

function getQuotasForTier(tier: string) {
  switch (tier) {
    case 'studio':
      return {
        projects: -1,
        storage: 100,
        aiRequests: 500,
        videoMinutes: 1200,
        assistantConversations: -1, // UNLIMITED for Studio ($35/mo)
      };
    case 'creator':
      return {
        projects: 10,
        storage: 10,
        aiRequests: 100,
        videoMinutes: 0,
        assistantConversations: 100, // 100/month for Creator ($15/mo)
      };
    default:
      return {
        projects: 3,
        storage: 1,
        aiRequests: 10,
        videoMinutes: 0,
        assistantConversations: 10,
      }; // 10/month Free (teaser)
  }
}
