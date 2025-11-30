import { prisma } from '@cronkwaters/db';

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
        fileType: true,
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
    type: f.fileType,
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
  };
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

---
Now assist ${ctx.user.name} with godlike knowledge of their entire creative world!`;
}

function getQuotasForTier(tier: string) {
  switch (tier) {
    case 'studio':
      return {
        projects: -1,
        storage: 100,
        aiRequests: 500,
        videoMinutes: 1200,
        assistantConversations: 100,
      };
    case 'creator':
      return {
        projects: 10,
        storage: 10,
        aiRequests: 100,
        videoMinutes: 0,
        assistantConversations: 30,
      };
    default:
      return { projects: 3, storage: 1, aiRequests: 0, videoMinutes: 0, assistantConversations: 0 };
  }
}
