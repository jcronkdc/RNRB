/**
 * AI ASSISTANT MEMORY SYSTEM
 *
 * Gives the AI persistent memory across conversations:
 * - Remembers past conversations and their topics
 * - Learns user preferences (favorite keys, genres, collaborators)
 * - Tracks what the user was working on last time
 * - Surfaces relevant context from past interactions
 */

import { prisma } from '@cronkwaters/db';

export interface AIMemory {
  // Recent conversation summaries
  recentConversations: {
    id: string;
    topic: string;
    summary: string;
    timestamp: string;
    page: string;
    keyPoints: string[];
  }[];

  // Learned preferences
  preferences: {
    favoriteKeys: string[];
    averageTempo: number;
    preferredGenres: string[];
    writingStyle: string | null;
    frequentCollaborators: string[];
    peakProductivityDays: string[];
    peakProductivityHours: string[];
  };

  // What they were working on last
  lastSession: {
    page: string;
    songId: string | null;
    songTitle: string | null;
    projectId: string | null;
    projectName: string | null;
    timestamp: string;
    unfinishedTask: string | null;
  } | null;

  // Things the AI should remember to mention
  reminders: {
    type: 'followup' | 'suggestion' | 'deadline' | 'achievement';
    message: string;
    context: string | null;
    createdAt: string;
  }[];
}

/**
 * Load AI memory for a user
 */
export async function loadAIMemory(userId: string): Promise<AIMemory> {
  // Get recent conversations
  const conversations = await prisma.assistantConversation.findMany({
    where: { userId },
    select: {
      id: true,
      topic: true,
      page: true,
      createdAt: true,
      updatedAt: true,
      messages: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  // Get user's songs for preference analysis
  const songs = await prisma.song.findMany({
    where: { userId, archived: false },
    select: {
      key: true,
      tempo: true,
      genre: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Get collaborator frequency
  const collaborators = await prisma.songCollaborator.findMany({
    where: { song: { userId } },
    select: {
      user: { select: { name: true } },
      email: true,
    },
  });

  // Analyze preferences from songs
  const keyCount: Record<string, number> = {};
  const genreCount: Record<string, number> = {};
  let tempoSum = 0;
  let tempoCount = 0;

  songs.forEach((s) => {
    if (s.key) keyCount[s.key] = (keyCount[s.key] || 0) + 1;
    if (s.genre) genreCount[s.genre] = (genreCount[s.genre] || 0) + 1;
    if (s.tempo) {
      tempoSum += s.tempo;
      tempoCount++;
    }
  });

  const favoriteKeys = Object.entries(keyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => key);

  const preferredGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);

  // Analyze productivity patterns
  const creationDays: Record<string, number> = {};
  const creationHours: Record<string, number> = {};

  songs.forEach((s) => {
    const day = s.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = s.createdAt.getHours();
    creationDays[day] = (creationDays[day] || 0) + 1;
    creationHours[hour] = (creationHours[hour] || 0) + 1;
  });

  const peakProductivityDays = Object.entries(creationDays)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([day]) => day);

  const peakProductivityHours = Object.entries(creationHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => {
      const h = parseInt(hour);
      if (h < 12) return `${h}am`;
      if (h === 12) return '12pm';
      return `${h - 12}pm`;
    });

  // Get frequent collaborators
  const collabCount: Record<string, number> = {};
  collaborators.forEach((c) => {
    const name = c.user?.name || c.email || 'Unknown';
    collabCount[name] = (collabCount[name] || 0) + 1;
  });

  const frequentCollaborators = Object.entries(collabCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  // Process conversations for summaries
  const recentConversations = conversations.map((c) => {
    const msgs = c.messages as Array<{ role: string; content: string }>;
    const userMessages = msgs?.filter((m) => m.role === 'user').map((m) => m.content) || [];
    const keyPoints = extractKeyPoints(userMessages);

    return {
      id: c.id,
      topic: c.topic || 'general',
      summary: generateConversationSummary(userMessages),
      timestamp: c.updatedAt.toISOString(),
      page: c.page || 'unknown',
      keyPoints,
    };
  });

  // Find last session
  const lastConvo = conversations[0];
  let lastSession = null;

  if (lastConvo) {
    const context = lastConvo.messages as any;
    lastSession = {
      page: lastConvo.page || 'dashboard',
      songId: context?.songId || null,
      songTitle: context?.songTitle || null,
      projectId: context?.projectId || null,
      projectName: context?.projectName || null,
      timestamp: lastConvo.updatedAt.toISOString(),
      unfinishedTask: extractUnfinishedTask(context),
    };
  }

  // Generate reminders based on context
  const reminders = await generateReminders(userId, conversations);

  return {
    recentConversations,
    preferences: {
      favoriteKeys,
      averageTempo: tempoCount > 0 ? Math.round(tempoSum / tempoCount) : 120,
      preferredGenres,
      writingStyle: detectWritingStyle(songs),
      frequentCollaborators,
      peakProductivityDays,
      peakProductivityHours,
    },
    lastSession,
    reminders,
  };
}

/**
 * Extract key points from user messages
 */
function extractKeyPoints(messages: string[]): string[] {
  const keyPoints: string[] = [];
  const keywords = [
    'help me',
    'working on',
    'stuck on',
    'finish',
    'create',
    'need to',
    'want to',
    'how do i',
  ];

  messages.forEach((msg) => {
    const lower = msg.toLowerCase();
    keywords.forEach((kw) => {
      if (lower.includes(kw)) {
        // Extract the relevant part
        const idx = lower.indexOf(kw);
        const snippet = msg.substring(idx, Math.min(idx + 50, msg.length));
        if (snippet.length > 10) keyPoints.push(snippet);
      }
    });
  });

  return [...new Set(keyPoints)].slice(0, 5);
}

/**
 * Generate a brief summary of a conversation
 */
function generateConversationSummary(messages: string[]): string {
  if (messages.length === 0) return 'Empty conversation';
  const firstMsg = messages[0] || '';
  return firstMsg.length > 100 ? firstMsg.substring(0, 100) + '...' : firstMsg;
}

/**
 * Extract any unfinished task from conversation context
 */
function extractUnfinishedTask(context: any): string | null {
  if (!context) return null;
  // Look for patterns like "I'll help you with X" without completion
  // This is a simplified version - could be enhanced with AI
  return null;
}

/**
 * Detect user's writing style from their songs
 */
function detectWritingStyle(songs: Array<{ genre: string | null }>): string | null {
  const genres = songs.filter((s) => s.genre).map((s) => s.genre!);
  if (genres.length === 0) return null;

  const genreCount: Record<string, number> = {};
  genres.forEach((g) => {
    genreCount[g] = (genreCount[g] || 0) + 1;
  });

  const topGenre = Object.entries(genreCount).sort(([, a], [, b]) => b - a)[0];
  return topGenre ? topGenre[0] : null;
}

/**
 * Generate reminders based on user's activity
 */
async function generateReminders(
  userId: string,
  conversations: any[]
): Promise<AIMemory['reminders']> {
  const reminders: AIMemory['reminders'] = [];

  // Check if there was an unfinished conversation
  if (conversations.length > 0) {
    const lastConvo = conversations[0];
    const msgs = lastConvo.messages as Array<{ role: string; content: string }>;
    const lastUserMsg = msgs?.filter((m) => m.role === 'user').pop();

    if (lastUserMsg?.content.toLowerCase().includes('help me')) {
      reminders.push({
        type: 'followup',
        message: `Last time we talked about: "${lastUserMsg.content.substring(0, 50)}..."`,
        context: lastConvo.topic,
        createdAt: lastConvo.updatedAt.toISOString(),
      });
    }
  }

  return reminders;
}

/**
 * Format memory for AI prompt
 */
export function formatMemoryForAI(memory: AIMemory): string {
  let section = `## 🧠 AI MEMORY (What I Remember About You)\n\n`;

  // Preferences
  section += `### Your Musical Preferences\n`;
  if (memory.preferences.favoriteKeys.length > 0) {
    section += `- **Favorite Keys:** ${memory.preferences.favoriteKeys.join(', ')}\n`;
  }
  section += `- **Average Tempo:** ${memory.preferences.averageTempo} BPM\n`;
  if (memory.preferences.preferredGenres.length > 0) {
    section += `- **Preferred Genres:** ${memory.preferences.preferredGenres.join(', ')}\n`;
  }
  if (memory.preferences.writingStyle) {
    section += `- **Writing Style:** ${memory.preferences.writingStyle}\n`;
  }
  if (memory.preferences.frequentCollaborators.length > 0) {
    section += `- **Frequent Collaborators:** ${memory.preferences.frequentCollaborators.join(', ')}\n`;
  }

  // Productivity patterns
  if (memory.preferences.peakProductivityDays.length > 0) {
    section += `\n### Your Productivity Patterns\n`;
    section += `- **Most Creative Days:** ${memory.preferences.peakProductivityDays.join(', ')}\n`;
    section += `- **Peak Hours:** ${memory.preferences.peakProductivityHours.join(', ')}\n`;
  }

  // Last session
  if (memory.lastSession) {
    section += `\n### Last Session\n`;
    section += `- **When:** ${new Date(memory.lastSession.timestamp).toLocaleDateString()}\n`;
    section += `- **Where:** ${memory.lastSession.page}\n`;
    if (memory.lastSession.songTitle) {
      section += `- **Working On:** "${memory.lastSession.songTitle}"\n`;
    }
    if (memory.lastSession.unfinishedTask) {
      section += `- **Unfinished:** ${memory.lastSession.unfinishedTask}\n`;
    }
  }

  // Recent conversations
  if (memory.recentConversations.length > 0) {
    section += `\n### Recent Conversations\n`;
    memory.recentConversations.slice(0, 5).forEach((c) => {
      section += `- **${c.topic}** (${new Date(c.timestamp).toLocaleDateString()}): ${c.summary}\n`;
    });
  }

  // Reminders
  if (memory.reminders.length > 0) {
    section += `\n### Things to Follow Up On\n`;
    memory.reminders.forEach((r) => {
      section += `- ${r.type.toUpperCase()}: ${r.message}\n`;
    });
  }

  return section;
}

/**
 * Save a memory/preference learned from conversation
 */
export async function saveLearnedPreference(
  userId: string,
  key: string,
  value: string
): Promise<void> {
  // This could store learned preferences in a dedicated table
  // For now, we rely on analyzing their actual data
  console.log(`[AI Memory] Learned: ${key} = ${value} for user ${userId}`);
}
