/**
 * AI ASSISTANT PERSISTENT MEMORY SYSTEM
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY: USER DATA ISOLATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ALL memory operations are STRICTLY scoped to the authenticated user.
 * The AI assistant's memory is a "safe bubble" - memories from one user
 * are NEVER visible to or accessible by another user.
 *
 * Every function in this module:
 * - Takes userId as a required parameter
 * - Filters ALL database queries by userId
 * - Verifies ownership before any update/delete
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Truly persistent memory that:
 * - Stores explicit facts learned from conversations
 * - Remembers user corrections and preferences
 * - Compresses old conversations into summaries
 * - Persists across all sessions
 * - Can be updated/corrected by the AI
 *
 * Memory Types:
 * - fact: "User's album is due in January"
 * - preference: "User prefers writing in G major"
 * - goal: "User wants to release an EP by summer"
 * - correction: "User said they don't like country"
 * - context: "User is in a band called The Waves"
 * - relationship: "Sarah is user's main co-writer"
 * - insight: "User is most productive on Tuesdays"
 */

import { prisma } from '@cronkwaters/db';

// ============================================
// TYPES
// ============================================

export type MemoryType =
  | 'fact'
  | 'preference'
  | 'goal'
  | 'correction'
  | 'context'
  | 'relationship'
  | 'insight';

export type MemoryPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Memory {
  id: string;
  type: MemoryType;
  priority: MemoryPriority;
  content: string;
  context: string | null;
  source: string | null;
  confidence: number;
  tags: string[];
  createdAt: string;
  accessCount: number;
}

export interface ConversationSummaryData {
  id: string;
  summary: string;
  keyTopics: string[];
  actionsTaken: string[];
  userSentiment: string | null;
  unresolved: string | null;
  learnings: string[];
  createdAt: string;
}

export interface AIMemory {
  // Persistent memories from database
  memories: Memory[];

  // Computed preferences from song analysis
  computedPreferences: {
    favoriteKeys: string[];
    averageTempo: number;
    preferredTags: string[];
    writingStyle: string | null;
    frequentCollaborators: string[];
    peakProductivityDays: string[];
    peakProductivityHours: string[];
  };

  // Recent conversation summaries
  recentSummaries: ConversationSummaryData[];

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

  // Stats
  totalMemories: number;
  oldestMemory: string | null;
}

// ============================================
// MEMORY OPERATIONS
// ============================================

/**
 * Store a new memory
 * SECURITY: Memory is always stored for the authenticated userId - no cross-user access
 */
export async function storeMemory(
  userId: string,
  memory: {
    type: MemoryType;
    content: string;
    priority?: MemoryPriority;
    context?: string;
    source?: string;
    confidence?: number;
    tags?: string[];
    relatedEntityId?: string;
    relatedEntityType?: string;
    expiresAt?: Date;
  }
): Promise<Memory> {
  // SECURITY: All memory operations are scoped to userId
  // Check if similar memory exists to avoid duplicates (within user's scope only)
  const existing = await prisma.aIMemory.findFirst({
    where: {
      userId, // Critical: Always filter by userId
      type: memory.type,
      content: { contains: memory.content.substring(0, 50), mode: 'insensitive' },
    },
  });

  if (existing) {
    // Update existing memory's access count and confidence
    const updated = await prisma.aIMemory.update({
      where: { id: existing.id },
      data: {
        confidence: Math.min(1, (existing.confidence || 0.5) + 0.1),
        accessCount: { increment: 1 },
        lastAccessed: new Date(),
        updatedAt: new Date(),
      },
    });
    return formatMemory(updated);
  }

  // Create new memory
  const created = await prisma.aIMemory.create({
    data: {
      userId,
      type: memory.type,
      priority: memory.priority || 'medium',
      content: memory.content,
      context: memory.context,
      source: memory.source || 'conversation',
      confidence: memory.confidence || 0.8,
      tags: memory.tags || [],
      relatedEntityId: memory.relatedEntityId,
      relatedEntityType: memory.relatedEntityType,
      expiresAt: memory.expiresAt,
    },
  });

  return formatMemory(created);
}

/**
 * Update an existing memory
 * SECURITY: Must verify userId owns the memory before any modification
 */
export async function updateMemory(
  memoryId: string,
  userId: string,
  updates: {
    content?: string;
    priority?: MemoryPriority;
    confidence?: number;
    supersede?: boolean; // Mark old memory as superseded
  }
): Promise<Memory | null> {
  // SECURITY: Verify user owns this memory before allowing any update
  // This prevents users from accessing/modifying other users' AI memories
  const existing = await prisma.aIMemory.findFirst({
    where: {
      id: memoryId,
      userId, // Critical: Must match authenticated user
    },
  });

  if (!existing) {
    // Return null for security - don't reveal if memory exists for another user
    return null;
  }

  if (updates.supersede && updates.content) {
    // Create new memory and mark old as superseded
    const newMemory = await prisma.aIMemory.create({
      data: {
        userId,
        type: existing.type,
        priority: updates.priority || (existing.priority as MemoryPriority),
        content: updates.content,
        context: `Updated from: "${existing.content}"`,
        source: 'user_correction',
        confidence: 1.0, // User corrections are high confidence
        tags: existing.tags,
        relatedEntityId: existing.relatedEntityId,
        relatedEntityType: existing.relatedEntityType,
      },
    });

    // Mark old as superseded
    await prisma.aIMemory.update({
      where: { id: memoryId },
      data: { supersededBy: newMemory.id },
    });

    return formatMemory(newMemory);
  }

  // Simple update
  const updated = await prisma.aIMemory.update({
    where: { id: memoryId },
    data: {
      content: updates.content,
      priority: updates.priority,
      confidence: updates.confidence,
      updatedAt: new Date(),
    },
  });

  return formatMemory(updated);
}

/**
 * Delete a memory
 * SECURITY: Only deletes if the memory belongs to the authenticated user
 */
export async function deleteMemory(memoryId: string, userId: string): Promise<boolean> {
  // SECURITY: The deleteMany with userId filter ensures we can ONLY delete
  // memories that belong to the authenticated user. This prevents any
  // cross-user memory manipulation.
  const result = await prisma.aIMemory.deleteMany({
    where: {
      id: memoryId,
      userId, // Critical: Must match authenticated user
    },
  });
  return result.count > 0;
}

/**
 * Store conversation summary for long-term memory
 * SECURITY: Always validates that the conversation belongs to the user
 */
export async function summarizeConversation(
  conversationId: string,
  userId: string,
  data: {
    summary: string;
    keyTopics: string[];
    actionsTaken: string[];
    userSentiment?: string;
    unresolved?: string;
    learnings: string[];
  }
): Promise<void> {
  // SECURITY: Verify the conversation belongs to this user before summarizing
  const conversation = await prisma.assistantConversation.findFirst({
    where: {
      id: conversationId,
      userId: userId, // Critical: Must match authenticated user
    },
  });

  if (!conversation) {
    console.error(
      `[Security] Attempted to summarize conversation ${conversationId} for user ${userId} - access denied`
    );
    return; // Silently fail for security - don't reveal existence
  }

  // Check if summary already exists (must also match userId for security)
  const existing = await prisma.conversationSummary.findFirst({
    where: {
      conversationId,
      userId, // Ensure we're updating user's own summary
    },
  });

  if (existing) {
    await prisma.conversationSummary.update({
      where: { id: existing.id },
      data: {
        summary: data.summary,
        keyTopics: data.keyTopics,
        actionsTaken: data.actionsTaken,
        userSentiment: data.userSentiment,
        unresolved: data.unresolved,
        learnings: data.learnings,
      },
    });
  } else {
    await prisma.conversationSummary.create({
      data: {
        userId,
        conversationId,
        summary: data.summary,
        keyTopics: data.keyTopics,
        actionsTaken: data.actionsTaken,
        userSentiment: data.userSentiment,
        unresolved: data.unresolved,
        learnings: data.learnings,
      },
    });
  }

  // Extract and store learnings as memories
  for (const learning of data.learnings) {
    await storeMemory(userId, {
      type: 'insight',
      content: learning,
      source: 'conversation_analysis',
      context: `Learned from conversation about: ${data.keyTopics.join(', ')}`,
      confidence: 0.7,
    });
  }
}

// ============================================
// MEMORY LOADING
// ============================================

/**
 * Load all AI memory for a user
 * SECURITY: This function ONLY loads memories belonging to the specified userId.
 * Each user has their own isolated memory bubble - no cross-contamination possible.
 */
export async function loadAIMemory(userId: string): Promise<AIMemory> {
  // SECURITY: Load ONLY memories for this specific user
  // The userId filter ensures complete isolation between users
  const memoriesRaw = await prisma.aIMemory.findMany({
    where: {
      userId, // Critical: Only this user's memories
      supersededBy: null, // Only active memories
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: [{ priority: 'asc' }, { accessCount: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  });

  // Update access timestamps for loaded memories
  const memoryIds = memoriesRaw.map((m) => m.id);
  await prisma.aIMemory.updateMany({
    where: { id: { in: memoryIds } },
    data: { lastAccessed: new Date(), accessCount: { increment: 1 } },
  });

  // Load recent conversation summaries
  const summaries = await prisma.conversationSummary.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Load computed preferences from songs
  const computedPreferences = await computePreferencesFromSongs(userId);

  // Get last session info
  const lastConversation = await prisma.assistantConversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      page: true,
      context: true,
      updatedAt: true,
      summary: true,
    },
  });

  let lastSession = null;
  if (lastConversation) {
    const ctx = lastConversation.context as any;
    lastSession = {
      page: lastConversation.page || 'dashboard',
      songId: ctx?.songId || null,
      songTitle: ctx?.songTitle || null,
      projectId: ctx?.projectId || null,
      projectName: ctx?.projectName || null,
      timestamp: lastConversation.updatedAt.toISOString(),
      unfinishedTask: lastConversation.summary?.unresolved || null,
    };
  }

  const memories = memoriesRaw.map(formatMemory);

  return {
    memories,
    computedPreferences,
    recentSummaries: summaries.map((s) => ({
      id: s.id,
      summary: s.summary,
      keyTopics: s.keyTopics,
      actionsTaken: s.actionsTaken,
      userSentiment: s.userSentiment,
      unresolved: s.unresolved,
      learnings: s.learnings,
      createdAt: s.createdAt.toISOString(),
    })),
    lastSession,
    totalMemories: memoriesRaw.length,
    oldestMemory:
      memoriesRaw.length > 0 ? memoriesRaw[memoriesRaw.length - 1].createdAt.toISOString() : null,
  };
}

/**
 * Compute preferences by analyzing user's songs
 * SECURITY: Only analyzes songs owned by the specified userId
 */
async function computePreferencesFromSongs(userId: string) {
  // SECURITY: Only fetch songs belonging to this user
  const songs = await prisma.song.findMany({
    where: {
      userId, // Critical: Only this user's songs
      archived: false,
    },
    select: {
      key: true,
      tempo: true,
      tags: true,
      createdAt: true,
    },
  });

  // SECURITY: Only fetch collaborators from this user's songs
  const collaborators = await prisma.songCollaborator.findMany({
    where: {
      song: { userId }, // Critical: Only from this user's songs
    },
    select: {
      user: { select: { name: true } },
      email: true,
    },
  });

  // Analyze keys
  const keyCount: Record<string, number> = {};
  const tagCount: Record<string, number> = {};
  let tempoSum = 0;
  let tempoCount = 0;

  songs.forEach((s) => {
    if (s.key) keyCount[s.key] = (keyCount[s.key] || 0) + 1;
    // Parse tags as JSON array if it's a string
    const tags = typeof s.tags === 'string' ? JSON.parse(s.tags || '[]') : [];
    tags.forEach((tag: string) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
    if (s.tempo) {
      tempoSum += s.tempo;
      tempoCount++;
    }
  });

  const favoriteKeys = Object.entries(keyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => key);

  const preferredTags = Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

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

  return {
    favoriteKeys,
    averageTempo: tempoCount > 0 ? Math.round(tempoSum / tempoCount) : 120,
    preferredTags,
    writingStyle: preferredTags[0] || null,
    frequentCollaborators,
    peakProductivityDays,
    peakProductivityHours,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatMemory(raw: any): Memory {
  return {
    id: raw.id,
    type: raw.type as MemoryType,
    priority: raw.priority as MemoryPriority,
    content: raw.content,
    context: raw.context,
    source: raw.source,
    confidence: raw.confidence,
    tags: raw.tags || [],
    createdAt: raw.createdAt.toISOString(),
    accessCount: raw.accessCount,
  };
}

// ============================================
// FORMAT FOR AI PROMPT
// ============================================

/**
 * Format memory for AI prompt
 */
export function formatMemoryForAI(memory: AIMemory): string {
  let section = `## 🧠 PERSISTENT MEMORY (${memory.totalMemories} memories stored)\n\n`;

  // Critical memories first
  const critical = memory.memories.filter((m) => m.priority === 'critical');
  if (critical.length > 0) {
    section += `### ⭐ CRITICAL (Always Remember)\n`;
    critical.forEach((m) => {
      section += `- **[${m.type}]** ${m.content}\n`;
    });
    section += '\n';
  }

  // High priority memories
  const high = memory.memories.filter((m) => m.priority === 'high');
  if (high.length > 0) {
    section += `### 🔴 HIGH PRIORITY\n`;
    high.forEach((m) => {
      section += `- **[${m.type}]** ${m.content}\n`;
    });
    section += '\n';
  }

  // Group other memories by type
  const byType: Record<string, Memory[]> = {};
  memory.memories
    .filter((m) => m.priority !== 'critical' && m.priority !== 'high')
    .forEach((m) => {
      if (!byType[m.type]) byType[m.type] = [];
      byType[m.type].push(m);
    });

  // Facts
  if (byType.fact?.length) {
    section += `### 📌 Known Facts\n`;
    byType.fact.slice(0, 10).forEach((m) => {
      section += `- ${m.content}\n`;
    });
    section += '\n';
  }

  // Preferences
  if (byType.preference?.length) {
    section += `### 💡 Learned Preferences\n`;
    byType.preference.slice(0, 10).forEach((m) => {
      section += `- ${m.content}\n`;
    });
    section += '\n';
  }

  // Goals
  if (byType.goal?.length) {
    section += `### 🎯 User Goals\n`;
    byType.goal.slice(0, 5).forEach((m) => {
      section += `- ${m.content}\n`;
    });
    section += '\n';
  }

  // Corrections (important!)
  if (byType.correction?.length) {
    section += `### ⚠️ User Corrections (Respect These!)\n`;
    byType.correction.forEach((m) => {
      section += `- ${m.content}\n`;
    });
    section += '\n';
  }

  // Context
  if (byType.context?.length) {
    section += `### 📋 Context\n`;
    byType.context.slice(0, 5).forEach((m) => {
      section += `- ${m.content}\n`;
    });
    section += '\n';
  }

  // Relationships
  if (byType.relationship?.length) {
    section += `### 👥 Relationships\n`;
    byType.relationship.slice(0, 5).forEach((m) => {
      section += `- ${m.content}\n`;
    });
    section += '\n';
  }

  // Computed preferences
  const prefs = memory.computedPreferences;
  section += `### 🎵 Analyzed From Songs\n`;
  if (prefs.favoriteKeys.length > 0) {
    section += `- Favorite Keys: ${prefs.favoriteKeys.join(', ')}\n`;
  }
  section += `- Average Tempo: ${prefs.averageTempo} BPM\n`;
  if (prefs.preferredTags.length > 0) {
    section += `- Preferred Genres: ${prefs.preferredTags.join(', ')}\n`;
  }
  if (prefs.frequentCollaborators.length > 0) {
    section += `- Frequent Collaborators: ${prefs.frequentCollaborators.join(', ')}\n`;
  }
  if (prefs.peakProductivityDays.length > 0) {
    section += `- Most Creative Days: ${prefs.peakProductivityDays.join(', ')}\n`;
  }
  if (prefs.peakProductivityHours.length > 0) {
    section += `- Peak Hours: ${prefs.peakProductivityHours.join(', ')}\n`;
  }
  section += '\n';

  // Recent conversation summaries
  if (memory.recentSummaries.length > 0) {
    section += `### 💬 Recent Conversations\n`;
    memory.recentSummaries.slice(0, 5).forEach((s) => {
      section += `- **${s.keyTopics.slice(0, 2).join(', ') || 'General'}** (${new Date(s.createdAt).toLocaleDateString()}): ${s.summary.substring(0, 80)}...\n`;
      if (s.unresolved) {
        section += `  ⏳ Unresolved: ${s.unresolved}\n`;
      }
    });
    section += '\n';
  }

  // Last session
  if (memory.lastSession) {
    section += `### 🕐 Last Session\n`;
    section += `- When: ${new Date(memory.lastSession.timestamp).toLocaleDateString()}\n`;
    section += `- Where: ${memory.lastSession.page}\n`;
    if (memory.lastSession.songTitle) {
      section += `- Working On: "${memory.lastSession.songTitle}"\n`;
    }
    if (memory.lastSession.unfinishedTask) {
      section += `- Unfinished: ${memory.lastSession.unfinishedTask}\n`;
    }
  }

  section += `\n### 📝 MEMORY INSTRUCTIONS
- When user shares important info, use storeMemory() to remember it
- When user corrects you, store with type='correction' and priority='high'
- Reference these memories naturally in conversation
- Ask about unresolved items from past conversations
`;

  return section;
}

// ============================================
// AI FUNCTION FOR STORING MEMORIES
// ============================================

export const MEMORY_AI_FUNCTIONS = [
  {
    name: 'storeMemory',
    description:
      'Store an important fact, preference, goal, or context about the user for future reference. Use this when the user shares something you should remember.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['fact', 'preference', 'goal', 'correction', 'context', 'relationship', 'insight'],
          description: 'Type of memory',
        },
        content: {
          type: 'string',
          description: 'The information to remember',
        },
        priority: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: 'How important is this? critical=always include, high=when relevant',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization',
        },
      },
      required: ['type', 'content'],
    },
  },
  {
    name: 'updateMemory',
    description: 'Update or correct an existing memory when user provides new information',
    parameters: {
      type: 'object',
      properties: {
        memoryId: { type: 'string', description: 'ID of memory to update' },
        content: { type: 'string', description: 'New content' },
        supersede: {
          type: 'boolean',
          description: 'If true, creates new memory and marks old as outdated',
        },
      },
      required: ['memoryId'],
    },
  },
  {
    name: 'deleteMemory',
    description: 'Delete a memory that is no longer relevant or was incorrect',
    parameters: {
      type: 'object',
      properties: {
        memoryId: { type: 'string', description: 'ID of memory to delete' },
      },
      required: ['memoryId'],
    },
  },
];
