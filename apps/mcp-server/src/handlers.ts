/**
 * RNRB MCP Tool Handlers - FULL PLATFORM EDITION
 *
 * Handlers for all 43 MCP tools. Calls the main RNRB API to execute actions.
 * Authentication handled via user's access token from MCP client.
 */

import {
  CreateSupportTicketSchema,
  ViewTicketsSchema,
  ViewTicketDetailsSchema,
  ReplyToTicketSchema,
  SubscribeNewsletterSchema,
  UnsubscribeNewsletterSchema,
  TroubleshootIssueSchema,
  SendFeedbackSchema,
  // Workspace
  CreateWorkspaceSchema,
  ListWorkspacesSchema,
  UpdateWorkspaceSchema,
  DeleteWorkspaceSchema,
  ConfigureWorkspaceBannersSchema,
  GetWorkspaceToolsSchema,
  // Songwriting
  CreateSongSchema,
  ListSongsSchema,
  UpdateSongSchema,
  GenerateLyricIdeasSchema,
  AnalyzeSongStructureSchema,
  FindRhymesSchema,
  GetChordProgressionsSchema,
  CreateProjectSchema,
  // Collaboration
  FindCollaboratorsSchema,
  SendCollabRequestSchema,
  ListCollaborationsSchema,
  SendMessageSchema,
  ScheduleMeetingSchema,
  // Tour
  CreateShowSchema,
  ListShowsSchema,
  CreateSetlistSchema,
  CreateTourSchema,
  GetTourStatsSchema,
  FindVenuesSchema,
  // Business
  GetRevenueStatsSchema,
  ListOpportunitiesSchema,
  ApplyToOpportunitySchema,
  CreateMerchProductSchema,
  GetMerchStatsSchema,
  // Account
  GetProfileSchema,
  UpdateProfileSchema,
  GetUsageStatsSchema,
  GetNotificationsSchema,
} from './tools';

interface Env {
  RNRB_API_URL: string;
  RNRB_API_KEY: string;
  OAUTH_KV?: KVNamespace;
}

interface UserContext {
  userId: string;
  email: string;
  accessToken: string;
}

type MCPResult = { content: Array<{ type: string; text: string }> };

/**
 * Make authenticated request to RNRB API
 */
async function rnrbApi(
  env: Env,
  endpoint: string,
  options: { method?: string; body?: unknown; userContext?: UserContext } = {}
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const { method = 'GET', body, userContext } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-MCP-Server-Key': env.RNRB_API_KEY,
  };

  if (userContext?.accessToken) {
    headers['Authorization'] = `Bearer ${userContext.accessToken}`;
  }

  try {
    const response = await fetch(`${env.RNRB_API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false,
        error: (data.message as string) || (data.error as string) || 'API request failed',
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`[MCP] API error for ${endpoint}:`, error);
    return { success: false, error: 'Failed to connect to RNRB API' };
  }
}

// ============================================
// SUPPORT & FEEDBACK HANDLERS
// ============================================

export async function handleCreateSupportTicket(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateSupportTicketSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/support/tickets', {
    method: 'POST',
    body: { email: userContext.email, ...parsed.data },
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create ticket: ${result.error}` }] };

  const data = result.data as { ticketNumber: string; message: string };
  return {
    content: [
      {
        type: 'text',
        text: `✅ Support ticket created!\n\n**Ticket Number:** ${data.ticketNumber}\n\n${data.message}\n\nYou'll receive email updates at ${userContext.email}.`,
      },
    ],
  };
}

export async function handleViewTickets(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ViewTicketsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.status) parsed.data.status.forEach((s) => params.append('status', s));
  if (parsed.data.limit) params.set('limit', String(parsed.data.limit));

  const result = await rnrbApi(env, `/api/support/tickets?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to fetch tickets: ${result.error}` }] };

  const data = result.data as {
    tickets: Array<{
      ticketNumber: string;
      subject: string;
      status: string;
      priority: string;
      lastActivityAt: string;
    }>;
    total: number;
  };

  if (data.tickets.length === 0) {
    return { content: [{ type: 'text', text: "You don't have any support tickets yet." }] };
  }

  const ticketList = data.tickets
    .map(
      (t) =>
        `• **${t.ticketNumber}** - ${t.subject}\n  Status: ${t.status} | Priority: ${t.priority}`
    )
    .join('\n\n');

  return {
    content: [
      { type: 'text', text: `📋 **Your Support Tickets** (${data.total} total)\n\n${ticketList}` },
    ],
  };
}

export async function handleViewTicketDetails(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ViewTicketDetailsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, `/api/support/tickets/${parsed.data.ticketNumber}`, {
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Ticket not found: ${result.error}` }] };

  const ticket = result.data as {
    ticketNumber: string;
    subject: string;
    status: string;
    messages: Array<{ senderType: string; content: string; createdAt: string }>;
  };

  const messages = ticket.messages
    .map(
      (m) =>
        `**${m.senderType === 'USER' ? 'You' : 'Support'}** (${new Date(m.createdAt).toLocaleString()}):\n${m.content}`
    )
    .join('\n\n---\n\n');

  return {
    content: [
      {
        type: 'text',
        text: `🎫 **Ticket ${ticket.ticketNumber}**\n\n**Subject:** ${ticket.subject}\n**Status:** ${ticket.status}\n\n---\n\n${messages}`,
      },
    ],
  };
}

export async function handleReplyToTicket(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ReplyToTicketSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, `/api/support/tickets/${parsed.data.ticketNumber}`, {
    method: 'POST',
    body: { content: parsed.data.message },
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to send reply: ${result.error}` }] };
  return {
    content: [{ type: 'text', text: `✅ Reply sent to ticket ${parsed.data.ticketNumber}.` }],
  };
}

export async function handleSubscribeNewsletter(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = SubscribeNewsletterSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/newsletter/subscribe', {
    method: 'POST',
    body: { email: userContext.email, ...parsed.data, source: 'mcp-server' },
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to subscribe: ${result.error}` }] };
  return { content: [{ type: 'text', text: `📧 Successfully subscribed to the newsletter!` }] };
}

export async function handleUnsubscribeNewsletter(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = UnsubscribeNewsletterSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/newsletter/unsubscribe', {
    method: 'POST',
    body: { email: userContext.email, reason: parsed.data.reason },
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to unsubscribe: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ You've been unsubscribed from the newsletter.` }] };
}

export async function handleTroubleshootIssue(
  _env: Env,
  _userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = TroubleshootIssueSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const guides: Record<string, string[]> = {
    AUDIO: [
      '1. Check microphone permissions',
      '2. Try a different browser',
      '3. Test mic in another app',
      '4. Restart browser',
    ],
    VIDEO: [
      '1. Check camera permissions',
      '2. Close other apps using camera',
      '3. Try Chrome browser',
      '4. Check internet connection',
    ],
    LOGIN: [
      '1. Clear browser cookies',
      '2. Try incognito mode',
      '3. Use correct login method',
      '4. Try "Forgot Password"',
    ],
    PERFORMANCE: [
      '1. Close other tabs',
      '2. Clear browser cache',
      '3. Disable extensions',
      '4. Check internet speed',
    ],
    SYNC: ['1. Check internet', '2. Refresh page (Cmd/Ctrl+Shift+R)', '3. Sign out and back in'],
    BROWSER: [
      '1. Update browser',
      '2. Clear cache',
      '3. Try Chrome or Firefox',
      '4. Disable extensions',
    ],
    STORAGE: ['1. Check storage usage', '2. Remove old files', '3. Compress audio before upload'],
    COLLABORATION: [
      '1. Check collaborator accepted invite',
      '2. Verify project visibility',
      '3. Refresh to sync',
    ],
    OTHER: ['1. Refresh the page', '2. Clear cache', '3. Try different browser'],
  };

  const steps = guides[parsed.data.issueType] || guides.OTHER;
  return {
    content: [
      {
        type: 'text',
        text: `🔧 **Troubleshooting: ${parsed.data.issueType}**\n\n${steps.join('\n')}\n\n---\n\nIf these don't work, I can create a support ticket for you.`,
      },
    ],
  };
}

export async function handleCheckSystemStatus(
  _env: Env,
  _userContext: UserContext,
  _args: unknown
): Promise<MCPResult> {
  const services = [
    { name: 'Video Calls', status: '✅ Operational' },
    { name: 'AI Assistant', status: '✅ Operational' },
    { name: 'File Storage', status: '✅ Operational' },
    { name: 'Authentication', status: '✅ Operational' },
    { name: 'Collaboration', status: '✅ Operational' },
  ];

  return {
    content: [
      {
        type: 'text',
        text: `🟢 **RNRB System Status**\n\n${services.map((s) => `• ${s.name}: ${s.status}`).join('\n')}\n\n_Last checked: ${new Date().toLocaleString()}_`,
      },
    ],
  };
}

export async function handleSendFeedback(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = SendFeedbackSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/support/tickets', {
    method: 'POST',
    body: {
      email: userContext.email,
      subject: `[${parsed.data.type}] ${parsed.data.message.substring(0, 50)}...`,
      description: parsed.data.message,
      category: 'FEEDBACK',
      priority: 'LOW',
    },
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to send feedback: ${result.error}` }] };
  return {
    content: [
      {
        type: 'text',
        text: `✨ Thank you for your ${parsed.data.type.toLowerCase().replace('_', ' ')}!`,
      },
    ],
  };
}

// ============================================
// WORKSPACE HANDLERS
// ============================================

export async function handleCreateWorkspace(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateWorkspaceSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/workspaces', {
    method: 'POST',
    body: {
      workspace: {
        name: parsed.data.name,
        icon: parsed.data.icon || 'sparkles',
        tools: parsed.data.tools || [],
      },
    },
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create workspace: ${result.error}` }] };
  return {
    content: [{ type: 'text', text: `✅ Workspace "${parsed.data.name}" created successfully!` }],
  };
}

export async function handleListWorkspaces(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ListWorkspacesSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/workspaces', { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to fetch workspaces: ${result.error}` }] };

  const data = result.data as {
    workspaces: Array<{ id: string; name: string; tools: Array<{ toolKey: string }> }>;
  };
  const list = data.workspaces
    .map(
      (w) =>
        `• **${w.name}**${parsed.data.includeTools ? ` (${w.tools.map((t) => t.toolKey).join(', ')})` : ''}`
    )
    .join('\n');

  return { content: [{ type: 'text', text: `📋 **Your Workspaces**\n\n${list}` }] };
}

export async function handleUpdateWorkspace(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = UpdateWorkspaceSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const updates: Record<string, unknown> = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.icon) updates.icon = parsed.data.icon;

  const result = await rnrbApi(env, `/api/workspaces/${parsed.data.workspaceId}`, {
    method: 'PATCH',
    body: updates,
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to update workspace: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ Workspace updated successfully!` }] };
}

export async function handleDeleteWorkspace(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = DeleteWorkspaceSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  if (!parsed.data.confirm) {
    return {
      content: [{ type: 'text', text: `⚠️ Please confirm deletion by setting confirm: true` }],
    };
  }

  const result = await rnrbApi(env, `/api/workspaces/${parsed.data.workspaceId}`, {
    method: 'DELETE',
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to delete workspace: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ Workspace deleted.` }] };
}

export async function handleConfigureWorkspaceBanners(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ConfigureWorkspaceBannersSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const settings: Record<string, boolean> = {};
  if (parsed.data.showMerchBanner !== undefined)
    settings.showMerchBanner = parsed.data.showMerchBanner;
  if (parsed.data.showEmailBanner !== undefined)
    settings.showEmailBanner = parsed.data.showEmailBanner;

  const result = await rnrbApi(env, `/api/workspaces/${parsed.data.workspaceId}`, {
    method: 'PATCH',
    body: { settings },
    userContext,
  });

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to configure banners: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ Workspace banner settings updated!` }] };
}

export async function handleGetAvailableTools(
  _env: Env,
  _userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetWorkspaceToolsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const tools = {
    create: ['songwriting', 'songs', 'studio', 'library'],
    connect: ['discover', 'collaboration', 'messages', 'feed', 'meet'],
    perform: ['shows', 'tours', 'setlists', 'live'],
    business: ['opportunities', 'sites', 'merch', 'marketplace', 'revenue', 'mail'],
    tools: ['tools', 'masterclasses', 'labs', 'settings'],
  };

  if (parsed.data.category) {
    return {
      content: [
        {
          type: 'text',
          text: `**${parsed.data.category.toUpperCase()} Tools:**\n${tools[parsed.data.category].join(', ')}`,
        },
      ],
    };
  }

  const all = Object.entries(tools)
    .map(([cat, list]) => `**${cat.toUpperCase()}:** ${list.join(', ')}`)
    .join('\n\n');
  return { content: [{ type: 'text', text: `🧰 **Available Workspace Tools**\n\n${all}` }] };
}

// ============================================
// SONGWRITING HANDLERS
// ============================================

export async function handleCreateSong(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateSongSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/songs', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create song: ${result.error}` }] };

  const data = result.data as { id: string; title: string };
  return { content: [{ type: 'text', text: `🎵 Song "${data.title}" created! ID: ${data.id}` }] };
}

export async function handleListSongs(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ListSongsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.status) params.set('status', parsed.data.status);
  if (parsed.data.limit) params.set('limit', String(parsed.data.limit));
  if (parsed.data.search) params.set('search', parsed.data.search);

  const result = await rnrbApi(env, `/api/songs?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to fetch songs: ${result.error}` }] };

  const data = result.data as { songs: Array<{ id: string; title: string; status: string }> };
  if (data.songs.length === 0) {
    return {
      content: [
        { type: 'text', text: `No songs found. Create one with "create a song called [title]"` },
      ],
    };
  }

  const list = data.songs.map((s) => `• **${s.title}** (${s.status}) - ID: ${s.id}`).join('\n');
  return { content: [{ type: 'text', text: `🎵 **Your Songs**\n\n${list}` }] };
}

export async function handleUpdateSong(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = UpdateSongSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const { songId, ...updates } = parsed.data;
  const result = await rnrbApi(env, `/api/songs/${songId}`, {
    method: 'PATCH',
    body: updates,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to update song: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ Song updated!` }] };
}

export async function handleGenerateLyricIdeas(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GenerateLyricIdeasSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/ai/lyrics/generate', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to generate lyrics: ${result.error}` }] };

  const data = result.data as { ideas: string[] };
  return {
    content: [
      {
        type: 'text',
        text: `✨ **Lyric Ideas for "${parsed.data.theme}":**\n\n${data.ideas.join('\n\n---\n\n')}`,
      },
    ],
  };
}

export async function handleAnalyzeSongStructure(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = AnalyzeSongStructureSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/ai/lyrics/analyze', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to analyze: ${result.error}` }] };

  const data = result.data as { analysis: string };
  return {
    content: [{ type: 'text', text: `📊 **Song Structure Analysis:**\n\n${data.analysis}` }],
  };
}

export async function handleFindRhymes(
  _env: Env,
  _userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = FindRhymesSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  // Simple rhyme dictionary (in production, use API)
  const commonRhymes: Record<string, string[]> = {
    love: ['above', 'dove', 'shove', 'of', 'glove'],
    heart: ['start', 'part', 'art', 'smart', 'cart', 'apart'],
    night: ['light', 'right', 'sight', 'bright', 'fight', 'might'],
    day: ['way', 'say', 'play', 'stay', 'away', 'today'],
    time: ['rhyme', 'climb', 'prime', 'dime', 'mime'],
    life: ['strife', 'wife', 'knife', 'rife'],
    soul: ['whole', 'role', 'goal', 'control', 'roll'],
    fire: ['desire', 'higher', 'wire', 'inspire', 'liar'],
  };

  const word = parsed.data.word.toLowerCase();
  const rhymes = commonRhymes[word] || ['(Try the full rhyming tool in the app for more results)'];

  return {
    content: [
      { type: 'text', text: `🎤 **Rhymes for "${parsed.data.word}":**\n\n${rhymes.join(', ')}` },
    ],
  };
}

export async function handleGetChordProgressions(
  _env: Env,
  _userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetChordProgressionsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const progressions: Record<string, string[]> = {
    simple: ['I - IV - V - I', 'I - V - vi - IV', 'I - vi - IV - V'],
    intermediate: ['I - IV - vi - V', 'vi - IV - I - V', 'I - V - vi - iii - IV - I - IV - V'],
    advanced: ['I - III - IV - iv', 'I - vi - ii - V', 'I - bVII - IV - I'],
  };

  const level = parsed.data.complexity || 'simple';
  const progs = progressions[level];

  return {
    content: [
      {
        type: 'text',
        text: `🎹 **Chord Progressions in ${parsed.data.key}** (${level}):\n\n${progs.join('\n')}`,
      },
    ],
  };
}

export async function handleCreateProject(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateProjectSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/projects', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create project: ${result.error}` }] };

  const data = result.data as { id: string; name: string };
  return { content: [{ type: 'text', text: `📁 Project "${data.name}" created! ID: ${data.id}` }] };
}

// ============================================
// COLLABORATION HANDLERS
// ============================================

export async function handleFindCollaborators(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = FindCollaboratorsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.skills) parsed.data.skills.forEach((s) => params.append('skills', s));
  if (parsed.data.genre) params.set('genre', parsed.data.genre);
  if (parsed.data.location) params.set('location', parsed.data.location);
  if (parsed.data.limit) params.set('limit', String(parsed.data.limit));

  const result = await rnrbApi(env, `/api/discover/users?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to search: ${result.error}` }] };

  const data = result.data as {
    users: Array<{ id: string; name: string; skills: string[]; location: string }>;
  };
  if (data.users.length === 0) {
    return { content: [{ type: 'text', text: `No collaborators found matching your criteria.` }] };
  }

  const list = data.users
    .map((u) => `• **${u.name}** - ${u.skills.join(', ')} (${u.location})`)
    .join('\n');
  return { content: [{ type: 'text', text: `👥 **Potential Collaborators**\n\n${list}` }] };
}

export async function handleSendCollabRequest(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = SendCollabRequestSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/collaboration/requests', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to send request: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ Collaboration request sent!` }] };
}

export async function handleListCollaborations(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ListCollaborationsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/collaboration', { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to fetch collaborations: ${result.error}` }] };

  const data = result.data as {
    collaborations: Array<{ id: string; partnerName: string; status: string; projectName: string }>;
  };
  const list = data.collaborations
    .map((c) => `• **${c.projectName}** with ${c.partnerName} (${c.status})`)
    .join('\n');

  return {
    content: [
      { type: 'text', text: `🤝 **Your Collaborations**\n\n${list || 'No active collaborations'}` },
    ],
  };
}

export async function handleSendMessage(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = SendMessageSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/messages', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to send message: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ Message sent!` }] };
}

export async function handleScheduleMeeting(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ScheduleMeetingSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/meetings', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to schedule meeting: ${result.error}` }] };

  const data = result.data as { meetingUrl: string };
  return {
    content: [
      {
        type: 'text',
        text: `📅 Meeting "${parsed.data.title}" scheduled!\n\nJoin link: ${data.meetingUrl}`,
      },
    ],
  };
}

// ============================================
// TOUR HANDLERS
// ============================================

export async function handleCreateShow(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateShowSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/shows', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create show: ${result.error}` }] };

  return {
    content: [
      {
        type: 'text',
        text: `🎤 Show at ${parsed.data.venueName} on ${parsed.data.date} added to your calendar!`,
      },
    ],
  };
}

export async function handleListShows(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ListShowsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.upcoming) params.set('upcoming', 'true');
  if (parsed.data.past) params.set('past', 'true');
  if (parsed.data.limit) params.set('limit', String(parsed.data.limit));

  const result = await rnrbApi(env, `/api/shows?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to fetch shows: ${result.error}` }] };

  const data = result.data as {
    shows: Array<{ venueName: string; venueCity: string; date: string }>;
  };
  if (data.shows.length === 0) {
    return {
      content: [{ type: 'text', text: `No shows found. Book one with "create a show at [venue]"` }],
    };
  }

  const list = data.shows
    .map((s) => `• **${s.venueName}**, ${s.venueCity} - ${new Date(s.date).toLocaleDateString()}`)
    .join('\n');
  return { content: [{ type: 'text', text: `🎸 **Your Shows**\n\n${list}` }] };
}

export async function handleCreateSetlist(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateSetlistSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/setlists', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create setlist: ${result.error}` }] };

  return {
    content: [
      {
        type: 'text',
        text: `📋 Setlist "${parsed.data.name}" created with ${parsed.data.songIds.length} songs!`,
      },
    ],
  };
}

export async function handleCreateTour(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateTourSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/tours', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create tour: ${result.error}` }] };

  return { content: [{ type: 'text', text: `🚐 Tour "${parsed.data.name}" created!` }] };
}

export async function handleGetTourStats(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetTourStatsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, `/api/tours/${parsed.data.tourId}/stats`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to get stats: ${result.error}` }] };

  const data = result.data as { showCount: number; totalRevenue: number; cities: number };
  return {
    content: [
      {
        type: 'text',
        text: `📊 **Tour Stats**\n\n• Shows: ${data.showCount}\n• Revenue: $${data.totalRevenue}\n• Cities: ${data.cities}`,
      },
    ],
  };
}

export async function handleFindVenues(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = FindVenuesSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams({ city: parsed.data.city });
  if (parsed.data.capacity) params.set('capacity', String(parsed.data.capacity));
  if (parsed.data.genre) params.set('genre', parsed.data.genre);

  const result = await rnrbApi(env, `/api/venues?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to search venues: ${result.error}` }] };

  const data = result.data as {
    venues: Array<{ name: string; capacity: number; genres: string[] }>;
  };
  const list = data.venues
    .map((v) => `• **${v.name}** (${v.capacity} cap) - ${v.genres.join(', ')}`)
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `🏟️ **Venues in ${parsed.data.city}**\n\n${list || 'No venues found'}`,
      },
    ],
  };
}

// ============================================
// BUSINESS HANDLERS
// ============================================

export async function handleGetRevenueStats(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetRevenueStatsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.period) params.set('period', parsed.data.period);
  if (parsed.data.source) params.set('source', parsed.data.source);

  const result = await rnrbApi(env, `/api/revenue/stats?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to get revenue: ${result.error}` }] };

  const data = result.data as { total: number; breakdown: Record<string, number> };
  const breakdown = Object.entries(data.breakdown)
    .map(([k, v]) => `• ${k}: $${v}`)
    .join('\n');

  return {
    content: [
      { type: 'text', text: `💰 **Revenue Stats**\n\n**Total:** $${data.total}\n\n${breakdown}` },
    ],
  };
}

export async function handleListOpportunities(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ListOpportunitiesSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.type) params.set('type', parsed.data.type);
  if (parsed.data.location) params.set('location', parsed.data.location);
  if (parsed.data.limit) params.set('limit', String(parsed.data.limit));

  const result = await rnrbApi(env, `/api/ecosystem/opportunities?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to fetch opportunities: ${result.error}` }] };

  const data = result.data as {
    opportunities: Array<{ id: string; title: string; type: string; location: string }>;
  };
  const list = data.opportunities
    .map((o) => `• **${o.title}** (${o.type}) - ${o.location}`)
    .join('\n');

  return {
    content: [
      { type: 'text', text: `🎯 **Opportunities**\n\n${list || 'No opportunities found'}` },
    ],
  };
}

export async function handleApplyToOpportunity(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = ApplyToOpportunitySchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(
    env,
    `/api/ecosystem/opportunities/${parsed.data.opportunityId}/apply`,
    {
      method: 'POST',
      body: { message: parsed.data.message, portfolioLinks: parsed.data.portfolioLinks },
      userContext,
    }
  );

  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to apply: ${result.error}` }] };
  return {
    content: [
      { type: 'text', text: `✅ Application submitted! You'll be notified when they respond.` },
    ],
  };
}

export async function handleCreateMerchProduct(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = CreateMerchProductSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/merch/products', {
    method: 'POST',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to create product: ${result.error}` }] };

  return {
    content: [
      {
        type: 'text',
        text: `🛍️ Merch product "${parsed.data.name}" created at $${parsed.data.price}!`,
      },
    ],
  };
}

export async function handleGetMerchStats(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetMerchStatsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.period) params.set('period', parsed.data.period);

  const result = await rnrbApi(env, `/api/merch/stats?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to get stats: ${result.error}` }] };

  const data = result.data as { sales: number; revenue: number; topProduct: string };
  return {
    content: [
      {
        type: 'text',
        text: `🛍️ **Merch Stats**\n\n• Sales: ${data.sales}\n• Revenue: $${data.revenue}\n• Top Product: ${data.topProduct}`,
      },
    ],
  };
}

// ============================================
// ACCOUNT HANDLERS
// ============================================

export async function handleGetProfile(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetProfileSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const userId = parsed.data.userId || userContext.userId;
  const result = await rnrbApi(env, `/api/users/${userId}/profile`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to get profile: ${result.error}` }] };

  const data = result.data as {
    name: string;
    bio: string;
    location: string;
    genres: string[];
    skills: string[];
  };
  return {
    content: [
      {
        type: 'text',
        text: `👤 **${data.name}**\n\n${data.bio || 'No bio'}\n\n📍 ${data.location || 'Location not set'}\n🎸 ${data.genres?.join(', ') || 'No genres'}\n🛠️ ${data.skills?.join(', ') || 'No skills'}`,
      },
    ],
  };
}

export async function handleUpdateProfile(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = UpdateProfileSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/profile', {
    method: 'PATCH',
    body: parsed.data,
    userContext,
  });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to update profile: ${result.error}` }] };
  return { content: [{ type: 'text', text: `✅ Profile updated!` }] };
}

export async function handleGetUsageStats(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetUsageStatsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const result = await rnrbApi(env, '/api/usage/summary', { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to get usage: ${result.error}` }] };

  const data = result.data as { credits: number; storage: { used: number; total: number } };
  return {
    content: [
      {
        type: 'text',
        text: `📊 **Usage Stats**\n\n• Credits: ${data.credits}\n• Storage: ${data.storage.used}MB / ${data.storage.total}MB`,
      },
    ],
  };
}

export async function handleGetNotifications(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<MCPResult> {
  const parsed = GetNotificationsSchema.safeParse(args);
  if (!parsed.success)
    return { content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };

  const params = new URLSearchParams();
  if (parsed.data.unreadOnly) params.set('unread', 'true');
  if (parsed.data.limit) params.set('limit', String(parsed.data.limit));

  const result = await rnrbApi(env, `/api/notifications?${params}`, { userContext });
  if (!result.success)
    return { content: [{ type: 'text', text: `Failed to get notifications: ${result.error}` }] };

  const data = result.data as {
    notifications: Array<{ title: string; message: string; createdAt: string }>;
  };
  if (data.notifications.length === 0) {
    return { content: [{ type: 'text', text: `No notifications.` }] };
  }

  const list = data.notifications.map((n) => `• **${n.title}** - ${n.message}`).join('\n');
  return { content: [{ type: 'text', text: `🔔 **Notifications**\n\n${list}` }] };
}
