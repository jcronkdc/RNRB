/**
 * RNRB MCP Server Tool Definitions - FULL PLATFORM EDITION
 *
 * These tools expose the complete Rock N' Roll Basement platform via MCP.
 * Compatible with Claude Desktop, AI Playground, and any MCP client.
 *
 * CATEGORIES:
 * - Support & Feedback (9 tools)
 * - Workspace Management (6 tools) - NEW
 * - Songwriting & Creative (8 tools) - NEW
 * - Collaboration (5 tools) - NEW
 * - Tour & Performance (6 tools) - NEW
 * - Business & Monetization (5 tools) - NEW
 * - Account & Settings (4 tools) - NEW
 *
 * Total: 43 tools for complete platform control
 */

import { z } from 'zod';

// ============================================
// SUPPORT & FEEDBACK SCHEMAS
// ============================================

export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(5).describe('A clear, concise subject line for the ticket'),
  description: z.string().min(20).describe('Detailed description of the issue'),
  category: z
    .enum([
      'GENERAL',
      'ACCOUNT',
      'BILLING',
      'TECHNICAL',
      'FEATURE_REQUEST',
      'COLLABORATION',
      'VIDEO_CALLS',
      'AI_ASSISTANT',
      'SECURITY',
      'FEEDBACK',
    ])
    .describe('Category for proper ticket routing'),
  priority: z
    .enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
    .optional()
    .describe('Priority level (default: NORMAL)'),
});

export const ViewTicketsSchema = z.object({
  status: z
    .array(z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED']))
    .optional()
    .describe('Filter by status'),
  limit: z.number().min(1).max(50).optional().describe('Max tickets to return'),
});

export const ViewTicketDetailsSchema = z.object({
  ticketNumber: z.string().describe('Ticket number (e.g., RNRB-1234) or ticket ID'),
});

export const ReplyToTicketSchema = z.object({
  ticketNumber: z.string().describe('Ticket number (e.g., RNRB-1234)'),
  message: z.string().min(1).describe('Message to add to the ticket'),
});

export const SubscribeNewsletterSchema = z.object({
  firstName: z.string().optional().describe('First name for personalization'),
  preferences: z
    .object({
      productUpdates: z.boolean().optional(),
      tips: z.boolean().optional(),
      events: z.boolean().optional(),
      community: z.boolean().optional(),
    })
    .optional()
    .describe('Email preferences'),
  frequency: z
    .enum(['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY'])
    .optional()
    .describe('How often to receive emails'),
});

export const UnsubscribeNewsletterSchema = z.object({
  reason: z.string().optional().describe('Optional reason for unsubscribing'),
});

export const TroubleshootIssueSchema = z.object({
  issueType: z
    .enum([
      'AUDIO',
      'VIDEO',
      'LOGIN',
      'PERFORMANCE',
      'SYNC',
      'BROWSER',
      'STORAGE',
      'COLLABORATION',
      'OTHER',
    ])
    .describe('Type of technical issue'),
  description: z.string().describe('Description of the problem'),
  browserInfo: z.string().optional().describe('Browser and version if known'),
  deviceInfo: z.string().optional().describe('Device type if relevant'),
});

export const SendFeedbackSchema = z.object({
  type: z
    .enum(['FEEDBACK', 'FEATURE_REQUEST', 'PRAISE', 'SUGGESTION'])
    .describe('Type of feedback'),
  message: z.string().min(10).describe('The feedback message'),
  area: z.string().optional().describe('Which area of the app this relates to'),
});

// ============================================
// WORKSPACE MANAGEMENT SCHEMAS (NEW)
// ============================================

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(50).describe('Name for the new workspace tab'),
  icon: z
    .enum([
      'music',
      'mic',
      'studio',
      'map',
      'list',
      'users',
      'globe',
      'briefcase',
      'bag',
      'target',
      'graduation',
      'flask',
      'radio',
      'sparkles',
    ])
    .optional()
    .describe('Icon for the workspace'),
  tools: z
    .array(z.string())
    .optional()
    .describe('Tool keys to add (e.g., songwriting, collaboration, tours)'),
  description: z.string().optional().describe('Brief description of the workspace purpose'),
});

export const ListWorkspacesSchema = z.object({
  includeTools: z.boolean().optional().describe('Include tool list for each workspace'),
});

export const UpdateWorkspaceSchema = z.object({
  workspaceId: z.string().optional().describe('Workspace ID (or use current workspace)'),
  name: z.string().optional().describe('New name for the workspace'),
  icon: z.string().optional().describe('New icon'),
  addTools: z.array(z.string()).optional().describe('Tools to add'),
  removeTools: z.array(z.string()).optional().describe('Tools to remove'),
});

export const DeleteWorkspaceSchema = z.object({
  workspaceId: z.string().describe('ID of workspace to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

export const ConfigureWorkspaceBannersSchema = z.object({
  workspaceId: z.string().optional().describe('Workspace ID (or use current)'),
  showMerchBanner: z.boolean().optional().describe('Show/hide merch promotional banner'),
  showEmailBanner: z.boolean().optional().describe('Show/hide email promotional banner'),
});

export const GetWorkspaceToolsSchema = z.object({
  category: z
    .enum(['create', 'connect', 'perform', 'business', 'tools'])
    .optional()
    .describe('Filter by category'),
});

// ============================================
// SONGWRITING & CREATIVE SCHEMAS (NEW)
// ============================================

export const CreateSongSchema = z.object({
  title: z.string().min(1).describe('Song title'),
  genre: z.string().optional().describe('Genre (rock, pop, country, etc.)'),
  key: z.string().optional().describe('Musical key (C major, A minor, etc.)'),
  tempo: z.number().optional().describe('BPM tempo'),
  mood: z.string().optional().describe('Mood/vibe of the song'),
  lyrics: z.string().optional().describe('Initial lyrics'),
  notes: z.string().optional().describe('Additional notes'),
});

export const ListSongsSchema = z.object({
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'ARCHIVED']).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional().describe('Search by title'),
});

export const UpdateSongSchema = z.object({
  songId: z.string().describe('Song ID to update'),
  title: z.string().optional(),
  lyrics: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'ARCHIVED']).optional(),
});

export const GenerateLyricIdeasSchema = z.object({
  theme: z.string().describe('Theme or topic for lyrics'),
  style: z.string().optional().describe('Style (verse, chorus, bridge)'),
  mood: z.string().optional().describe('Emotional mood'),
  existingLyrics: z.string().optional().describe('Context from existing lyrics'),
});

export const AnalyzeSongStructureSchema = z.object({
  lyrics: z.string().describe('Lyrics to analyze'),
  includeRhymeScheme: z.boolean().optional(),
  includeSyllableCount: z.boolean().optional(),
});

export const FindRhymesSchema = z.object({
  word: z.string().describe('Word to find rhymes for'),
  type: z.enum(['perfect', 'near', 'slant']).optional(),
  limit: z.number().optional(),
});

export const GetChordProgressionsSchema = z.object({
  key: z.string().describe('Musical key'),
  style: z.string().optional().describe('Style (pop, rock, jazz, country)'),
  complexity: z.enum(['simple', 'intermediate', 'advanced']).optional(),
});

export const CreateProjectSchema = z.object({
  name: z.string().describe('Project name'),
  description: z.string().optional(),
  deadline: z.string().optional().describe('Target completion date'),
  songIds: z.array(z.string()).optional().describe('Songs to include'),
});

// ============================================
// COLLABORATION SCHEMAS (NEW)
// ============================================

export const FindCollaboratorsSchema = z.object({
  skills: z
    .array(z.string())
    .optional()
    .describe('Skills to look for (guitar, vocals, production)'),
  genre: z.string().optional(),
  location: z.string().optional().describe('City or region'),
  limit: z.number().optional(),
});

export const SendCollabRequestSchema = z.object({
  userId: z.string().describe('User ID to send request to'),
  message: z.string().describe('Introduction message'),
  projectId: z.string().optional().describe('Project to collaborate on'),
});

export const ListCollaborationsSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED']).optional(),
  limit: z.number().optional(),
});

export const SendMessageSchema = z.object({
  recipientId: z.string().optional().describe('User ID to message'),
  conversationId: z.string().optional().describe('Existing conversation ID'),
  message: z.string().describe('Message content'),
});

export const ScheduleMeetingSchema = z.object({
  title: z.string().describe('Meeting title'),
  participants: z.array(z.string()).describe('User IDs to invite'),
  startTime: z.string().describe('ISO 8601 datetime'),
  duration: z.number().describe('Duration in minutes'),
  notes: z.string().optional(),
});

// ============================================
// TOUR & PERFORMANCE SCHEMAS (NEW)
// ============================================

export const CreateShowSchema = z.object({
  venueName: z.string().describe('Venue name'),
  venueCity: z.string().describe('City'),
  date: z.string().describe('Show date (YYYY-MM-DD)'),
  loadInTime: z.string().optional().describe('Load-in time'),
  showTime: z.string().optional().describe('Show start time'),
  guarantee: z.number().optional().describe('Payment guarantee in dollars'),
  notes: z.string().optional(),
});

export const ListShowsSchema = z.object({
  upcoming: z.boolean().optional().describe('Only show upcoming shows'),
  past: z.boolean().optional().describe('Only show past shows'),
  limit: z.number().optional(),
});

export const CreateSetlistSchema = z.object({
  name: z.string().describe('Setlist name'),
  songIds: z.array(z.string()).describe('Song IDs in order'),
  duration: z.number().optional().describe('Target duration in minutes'),
  showId: z.string().optional().describe('Link to specific show'),
});

export const CreateTourSchema = z.object({
  name: z.string().describe('Tour name'),
  startDate: z.string().describe('Tour start date'),
  endDate: z.string().describe('Tour end date'),
  showIds: z.array(z.string()).optional().describe('Shows to include'),
  budget: z.number().optional().describe('Tour budget'),
});

export const GetTourStatsSchema = z.object({
  tourId: z.string().describe('Tour ID'),
});

export const FindVenuesSchema = z.object({
  city: z.string().describe('City to search'),
  capacity: z.number().optional().describe('Minimum capacity'),
  genre: z.string().optional().describe('Genre focus'),
});

// ============================================
// BUSINESS & MONETIZATION SCHEMAS (NEW)
// ============================================

export const GetRevenueStatsSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year', 'all']).optional(),
  source: z.enum(['streaming', 'merch', 'shows', 'sync', 'all']).optional(),
});

export const ListOpportunitiesSchema = z.object({
  type: z.enum(['GIG', 'SYNC', 'SESSION', 'COLLAB', 'CONTEST']).optional(),
  location: z.string().optional(),
  limit: z.number().optional(),
});

export const ApplyToOpportunitySchema = z.object({
  opportunityId: z.string().describe('Opportunity ID'),
  message: z.string().describe('Application message'),
  portfolioLinks: z.array(z.string()).optional(),
});

export const CreateMerchProductSchema = z.object({
  name: z.string().describe('Product name'),
  type: z.enum(['T_SHIRT', 'HOODIE', 'HAT', 'POSTER', 'STICKER', 'OTHER']).describe('Product type'),
  price: z.number().describe('Price in dollars'),
  description: z.string().optional(),
});

export const GetMerchStatsSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
});

// ============================================
// ACCOUNT & SETTINGS SCHEMAS (NEW)
// ============================================

export const GetProfileSchema = z.object({
  userId: z.string().optional().describe('User ID (defaults to self)'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  genres: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  socialLinks: z
    .object({
      spotify: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      soundcloud: z.string().optional(),
    })
    .optional(),
});

export const GetUsageStatsSchema = z.object({
  includeCredits: z.boolean().optional(),
  includeStorage: z.boolean().optional(),
});

export const GetNotificationsSchema = z.object({
  unreadOnly: z.boolean().optional(),
  limit: z.number().optional(),
});

// ============================================
// TOOL DEFINITIONS (MCP Format)
// ============================================

export const RNRB_TOOLS = [
  // ========== SUPPORT & FEEDBACK (9 tools) ==========
  {
    name: 'create_support_ticket',
    description: `Create a support ticket for Rock N' Roll Basement. Use for bugs, help requests, or technical issues.`,
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Clear subject line' },
        description: { type: 'string', description: 'Detailed description' },
        category: {
          type: 'string',
          enum: [
            'GENERAL',
            'ACCOUNT',
            'BILLING',
            'TECHNICAL',
            'FEATURE_REQUEST',
            'COLLABORATION',
            'VIDEO_CALLS',
            'AI_ASSISTANT',
            'SECURITY',
            'FEEDBACK',
          ],
        },
        priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
      },
      required: ['subject', 'description', 'category'],
    },
  },
  {
    name: 'view_my_tickets',
    description: `View your support tickets with status and last activity.`,
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'],
          },
        },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'view_ticket_details',
    description: `View full details of a specific support ticket including conversation history.`,
    inputSchema: {
      type: 'object',
      properties: {
        ticketNumber: { type: 'string', description: 'Ticket number (e.g., RNRB-1234)' },
      },
      required: ['ticketNumber'],
    },
  },
  {
    name: 'reply_to_ticket',
    description: `Add a reply to an existing support ticket.`,
    inputSchema: {
      type: 'object',
      properties: {
        ticketNumber: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['ticketNumber', 'message'],
    },
  },
  {
    name: 'subscribe_newsletter',
    description: `Subscribe to the Rock N' Roll Basement newsletter.`,
    inputSchema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        preferences: {
          type: 'object',
          properties: {
            productUpdates: { type: 'boolean' },
            tips: { type: 'boolean' },
            events: { type: 'boolean' },
            community: { type: 'boolean' },
          },
        },
        frequency: { type: 'string', enum: ['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY'] },
      },
    },
  },
  {
    name: 'unsubscribe_newsletter',
    description: `Unsubscribe from the newsletter.`,
    inputSchema: {
      type: 'object',
      properties: { reason: { type: 'string' } },
    },
  },
  {
    name: 'troubleshoot_issue',
    description: `Get intelligent troubleshooting help for technical issues.`,
    inputSchema: {
      type: 'object',
      properties: {
        issueType: {
          type: 'string',
          enum: [
            'AUDIO',
            'VIDEO',
            'LOGIN',
            'PERFORMANCE',
            'SYNC',
            'BROWSER',
            'STORAGE',
            'COLLABORATION',
            'OTHER',
          ],
        },
        description: { type: 'string' },
        browserInfo: { type: 'string' },
        deviceInfo: { type: 'string' },
      },
      required: ['issueType', 'description'],
    },
  },
  {
    name: 'check_system_status',
    description: `Check the status of Rock N' Roll Basement services.`,
    inputSchema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          enum: ['ALL', 'VIDEO_CALLS', 'AI_ASSISTANT', 'STORAGE', 'AUTH', 'COLLABORATION'],
        },
      },
    },
  },
  {
    name: 'send_feedback',
    description: `Send feedback, feature requests, or suggestions.`,
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['FEEDBACK', 'FEATURE_REQUEST', 'PRAISE', 'SUGGESTION'] },
        message: { type: 'string' },
        area: { type: 'string' },
      },
      required: ['type', 'message'],
    },
  },

  // ========== WORKSPACE MANAGEMENT (6 tools) ==========
  {
    name: 'create_workspace',
    description: `Create a new workspace tab on your dashboard with custom tools.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Workspace name' },
        icon: {
          type: 'string',
          enum: [
            'music',
            'mic',
            'studio',
            'map',
            'list',
            'users',
            'globe',
            'briefcase',
            'bag',
            'target',
            'graduation',
            'flask',
            'radio',
            'sparkles',
          ],
        },
        tools: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tools to add (songwriting, collaboration, tours, etc.)',
        },
        description: { type: 'string' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_workspaces',
    description: `List all your workspace tabs.`,
    inputSchema: {
      type: 'object',
      properties: { includeTools: { type: 'boolean' } },
    },
  },
  {
    name: 'update_workspace',
    description: `Update an existing workspace - rename, add/remove tools.`,
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string' },
        name: { type: 'string' },
        icon: { type: 'string' },
        addTools: { type: 'array', items: { type: 'string' } },
        removeTools: { type: 'array', items: { type: 'string' } },
      },
    },
  },
  {
    name: 'delete_workspace',
    description: `Delete a workspace tab (requires confirmation).`,
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string' },
        confirm: { type: 'boolean', description: 'Must be true' },
      },
      required: ['workspaceId', 'confirm'],
    },
  },
  {
    name: 'configure_workspace_banners',
    description: `Show or hide promotional banners (merch, email) on a workspace.`,
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string' },
        showMerchBanner: { type: 'boolean' },
        showEmailBanner: { type: 'boolean' },
      },
    },
  },
  {
    name: 'get_available_tools',
    description: `Get list of all available tools that can be added to workspaces.`,
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['create', 'connect', 'perform', 'business', 'tools'] },
      },
    },
  },

  // ========== SONGWRITING & CREATIVE (8 tools) ==========
  {
    name: 'create_song',
    description: `Create a new song in your library.`,
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Song title' },
        genre: { type: 'string' },
        key: { type: 'string', description: 'Musical key' },
        tempo: { type: 'number', description: 'BPM' },
        mood: { type: 'string' },
        lyrics: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_songs',
    description: `List your songs with optional filtering.`,
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'ARCHIVED'] },
        limit: { type: 'number' },
        search: { type: 'string' },
      },
    },
  },
  {
    name: 'update_song',
    description: `Update an existing song's details or lyrics.`,
    inputSchema: {
      type: 'object',
      properties: {
        songId: { type: 'string' },
        title: { type: 'string' },
        lyrics: { type: 'string' },
        notes: { type: 'string' },
        status: { type: 'string', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'ARCHIVED'] },
      },
      required: ['songId'],
    },
  },
  {
    name: 'generate_lyric_ideas',
    description: `Get AI-generated lyric ideas based on a theme or mood.`,
    inputSchema: {
      type: 'object',
      properties: {
        theme: { type: 'string', description: 'Theme or topic' },
        style: { type: 'string', description: 'verse, chorus, bridge' },
        mood: { type: 'string' },
        existingLyrics: { type: 'string', description: 'Context from your song' },
      },
      required: ['theme'],
    },
  },
  {
    name: 'analyze_song_structure',
    description: `Analyze lyrics for structure, rhyme scheme, and syllables.`,
    inputSchema: {
      type: 'object',
      properties: {
        lyrics: { type: 'string' },
        includeRhymeScheme: { type: 'boolean' },
        includeSyllableCount: { type: 'boolean' },
      },
      required: ['lyrics'],
    },
  },
  {
    name: 'find_rhymes',
    description: `Find rhyming words for songwriting.`,
    inputSchema: {
      type: 'object',
      properties: {
        word: { type: 'string' },
        type: { type: 'string', enum: ['perfect', 'near', 'slant'] },
        limit: { type: 'number' },
      },
      required: ['word'],
    },
  },
  {
    name: 'get_chord_progressions',
    description: `Get chord progression suggestions for a key and style.`,
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Musical key (C major, A minor)' },
        style: { type: 'string', description: 'pop, rock, jazz, country' },
        complexity: { type: 'string', enum: ['simple', 'intermediate', 'advanced'] },
      },
      required: ['key'],
    },
  },
  {
    name: 'create_project',
    description: `Create a music project to organize songs and deadlines.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        deadline: { type: 'string' },
        songIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['name'],
    },
  },

  // ========== COLLABORATION (5 tools) ==========
  {
    name: 'find_collaborators',
    description: `Search for musicians to collaborate with based on skills, genre, or location.`,
    inputSchema: {
      type: 'object',
      properties: {
        skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'guitar, vocals, production, etc.',
        },
        genre: { type: 'string' },
        location: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'send_collab_request',
    description: `Send a collaboration request to another musician.`,
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        message: { type: 'string', description: 'Introduction message' },
        projectId: { type: 'string' },
      },
      required: ['userId', 'message'],
    },
  },
  {
    name: 'list_collaborations',
    description: `List your active and pending collaborations.`,
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED'] },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'send_message',
    description: `Send a message to a collaborator or start a new conversation.`,
    inputSchema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string' },
        conversationId: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['message'],
    },
  },
  {
    name: 'schedule_meeting',
    description: `Schedule a video meeting with collaborators.`,
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        participants: { type: 'array', items: { type: 'string' } },
        startTime: { type: 'string', description: 'ISO 8601 datetime' },
        duration: { type: 'number', description: 'Minutes' },
        notes: { type: 'string' },
      },
      required: ['title', 'participants', 'startTime', 'duration'],
    },
  },

  // ========== TOUR & PERFORMANCE (6 tools) ==========
  {
    name: 'create_show',
    description: `Create a show/gig entry for your calendar.`,
    inputSchema: {
      type: 'object',
      properties: {
        venueName: { type: 'string' },
        venueCity: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        loadInTime: { type: 'string' },
        showTime: { type: 'string' },
        guarantee: { type: 'number', description: 'Payment in dollars' },
        notes: { type: 'string' },
      },
      required: ['venueName', 'venueCity', 'date'],
    },
  },
  {
    name: 'list_shows',
    description: `List your upcoming and past shows.`,
    inputSchema: {
      type: 'object',
      properties: {
        upcoming: { type: 'boolean' },
        past: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'create_setlist',
    description: `Create a setlist for a show.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        songIds: { type: 'array', items: { type: 'string' } },
        duration: { type: 'number', description: 'Target minutes' },
        showId: { type: 'string' },
      },
      required: ['name', 'songIds'],
    },
  },
  {
    name: 'create_tour',
    description: `Create a tour to organize multiple shows.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        showIds: { type: 'array', items: { type: 'string' } },
        budget: { type: 'number' },
      },
      required: ['name', 'startDate', 'endDate'],
    },
  },
  {
    name: 'get_tour_stats',
    description: `Get statistics for a tour (revenue, attendance, etc.).`,
    inputSchema: {
      type: 'object',
      properties: { tourId: { type: 'string' } },
      required: ['tourId'],
    },
  },
  {
    name: 'find_venues',
    description: `Search for venues in a city.`,
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        capacity: { type: 'number' },
        genre: { type: 'string' },
      },
      required: ['city'],
    },
  },

  // ========== BUSINESS & MONETIZATION (5 tools) ==========
  {
    name: 'get_revenue_stats',
    description: `Get your revenue statistics across all sources.`,
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['week', 'month', 'quarter', 'year', 'all'] },
        source: { type: 'string', enum: ['streaming', 'merch', 'shows', 'sync', 'all'] },
      },
    },
  },
  {
    name: 'list_opportunities',
    description: `Browse available opportunities (gigs, sync, sessions).`,
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['GIG', 'SYNC', 'SESSION', 'COLLAB', 'CONTEST'] },
        location: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'apply_to_opportunity',
    description: `Apply to an opportunity.`,
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { type: 'string' },
        message: { type: 'string' },
        portfolioLinks: { type: 'array', items: { type: 'string' } },
      },
      required: ['opportunityId', 'message'],
    },
  },
  {
    name: 'create_merch_product',
    description: `Create a merchandise product to sell.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['T_SHIRT', 'HOODIE', 'HAT', 'POSTER', 'STICKER', 'OTHER'] },
        price: { type: 'number' },
        description: { type: 'string' },
      },
      required: ['name', 'type', 'price'],
    },
  },
  {
    name: 'get_merch_stats',
    description: `Get your merchandise sales statistics.`,
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'] },
      },
    },
  },

  // ========== ACCOUNT & SETTINGS (4 tools) ==========
  {
    name: 'get_profile',
    description: `Get your profile or another user's public profile.`,
    inputSchema: {
      type: 'object',
      properties: { userId: { type: 'string' } },
    },
  },
  {
    name: 'update_profile',
    description: `Update your profile information.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        bio: { type: 'string' },
        location: { type: 'string' },
        genres: { type: 'array', items: { type: 'string' } },
        skills: { type: 'array', items: { type: 'string' } },
        socialLinks: {
          type: 'object',
          properties: {
            spotify: { type: 'string' },
            instagram: { type: 'string' },
            youtube: { type: 'string' },
            soundcloud: { type: 'string' },
          },
        },
      },
    },
  },
  {
    name: 'get_usage_stats',
    description: `Get your usage statistics (credits, storage).`,
    inputSchema: {
      type: 'object',
      properties: {
        includeCredits: { type: 'boolean' },
        includeStorage: { type: 'boolean' },
      },
    },
  },
  {
    name: 'get_notifications',
    description: `Get your notifications.`,
    inputSchema: {
      type: 'object',
      properties: {
        unreadOnly: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  },
];

export type ToolName = (typeof RNRB_TOOLS)[number]['name'];
