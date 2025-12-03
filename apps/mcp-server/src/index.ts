/**
 * RNRB Remote MCP Server - FULL PLATFORM EDITION
 *
 * Exposes 43 Rock N' Roll Basement AI assistant tools via the Model Context Protocol.
 * Deploy to Cloudflare Workers for remote access from any MCP-compatible client.
 *
 * TOOL CATEGORIES:
 * - Support & Feedback (9 tools)
 * - Workspace Management (6 tools)
 * - Songwriting & Creative (8 tools)
 * - Collaboration (5 tools)
 * - Tour & Performance (6 tools)
 * - Business & Monetization (5 tools)
 * - Account & Settings (4 tools)
 *
 * @see https://developers.cloudflare.com/agents/guides/remote-mcp-server/
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { RNRB_TOOLS } from './tools';
import {
  // Support & Feedback
  handleCreateSupportTicket,
  handleViewTickets,
  handleViewTicketDetails,
  handleReplyToTicket,
  handleSubscribeNewsletter,
  handleUnsubscribeNewsletter,
  handleTroubleshootIssue,
  handleCheckSystemStatus,
  handleSendFeedback,
  // Workspace
  handleCreateWorkspace,
  handleListWorkspaces,
  handleUpdateWorkspace,
  handleDeleteWorkspace,
  handleConfigureWorkspaceBanners,
  handleGetAvailableTools,
  // Songwriting
  handleCreateSong,
  handleListSongs,
  handleUpdateSong,
  handleGenerateLyricIdeas,
  handleAnalyzeSongStructure,
  handleFindRhymes,
  handleGetChordProgressions,
  handleCreateProject,
  // Collaboration
  handleFindCollaborators,
  handleSendCollabRequest,
  handleListCollaborations,
  handleSendMessage,
  handleScheduleMeeting,
  // Tour
  handleCreateShow,
  handleListShows,
  handleCreateSetlist,
  handleCreateTour,
  handleGetTourStats,
  handleFindVenues,
  // Business
  handleGetRevenueStats,
  handleListOpportunities,
  handleApplyToOpportunity,
  handleCreateMerchProduct,
  handleGetMerchStats,
  // Account
  handleGetProfile,
  handleUpdateProfile,
  handleGetUsageStats,
  handleGetNotifications,
} from './handlers';

interface Env {
  RNRB_API_URL: string;
  RNRB_API_KEY: string;
  OAUTH_KV?: KVNamespace;
  COOKIE_ENCRYPTION_KEY?: string;
}

interface UserContext {
  userId: string;
  email: string;
  accessToken: string;
}

// Tool handler mapping for cleaner dispatch
const TOOL_HANDLERS: Record<
  string,
  (
    env: Env,
    userContext: UserContext,
    args: unknown
  ) => Promise<{ content: Array<{ type: string; text: string }> }>
> = {
  // Support & Feedback
  create_support_ticket: handleCreateSupportTicket,
  view_my_tickets: handleViewTickets,
  view_ticket_details: handleViewTicketDetails,
  reply_to_ticket: handleReplyToTicket,
  subscribe_newsletter: handleSubscribeNewsletter,
  unsubscribe_newsletter: handleUnsubscribeNewsletter,
  troubleshoot_issue: handleTroubleshootIssue,
  check_system_status: handleCheckSystemStatus,
  send_feedback: handleSendFeedback,
  // Workspace
  create_workspace: handleCreateWorkspace,
  list_workspaces: handleListWorkspaces,
  update_workspace: handleUpdateWorkspace,
  delete_workspace: handleDeleteWorkspace,
  configure_workspace_banners: handleConfigureWorkspaceBanners,
  get_available_tools: handleGetAvailableTools,
  // Songwriting
  create_song: handleCreateSong,
  list_songs: handleListSongs,
  update_song: handleUpdateSong,
  generate_lyric_ideas: handleGenerateLyricIdeas,
  analyze_song_structure: handleAnalyzeSongStructure,
  find_rhymes: handleFindRhymes,
  get_chord_progressions: handleGetChordProgressions,
  create_project: handleCreateProject,
  // Collaboration
  find_collaborators: handleFindCollaborators,
  send_collab_request: handleSendCollabRequest,
  list_collaborations: handleListCollaborations,
  send_message: handleSendMessage,
  schedule_meeting: handleScheduleMeeting,
  // Tour
  create_show: handleCreateShow,
  list_shows: handleListShows,
  create_setlist: handleCreateSetlist,
  create_tour: handleCreateTour,
  get_tour_stats: handleGetTourStats,
  find_venues: handleFindVenues,
  // Business
  get_revenue_stats: handleGetRevenueStats,
  list_opportunities: handleListOpportunities,
  apply_to_opportunity: handleApplyToOpportunity,
  create_merch_product: handleCreateMerchProduct,
  get_merch_stats: handleGetMerchStats,
  // Account
  get_profile: handleGetProfile,
  update_profile: handleUpdateProfile,
  get_usage_stats: handleGetUsageStats,
  get_notifications: handleGetNotifications,
};

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Enable CORS for MCP clients
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-MCP-Session-Id'],
  })
);

// Health check with stats
app.get('/', (c) => {
  return c.json({
    name: 'RNRB MCP Server',
    version: '2.0.0',
    description: "Rock N' Roll Basement AI Assistant Tools - Full Platform Edition",
    toolCount: RNRB_TOOLS.length,
    categories: {
      'Support & Feedback': 9,
      'Workspace Management': 6,
      'Songwriting & Creative': 8,
      Collaboration: 5,
      'Tour & Performance': 6,
      'Business & Monetization': 5,
      'Account & Settings': 4,
    },
    endpoints: {
      sse: '/sse',
      tools: '/tools',
      call: '/tools/call',
      mcp: '/mcp',
      health: '/health',
    },
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    toolCount: RNRB_TOOLS.length,
  });
});

// List available tools
app.get('/tools', (c) => {
  return c.json({
    tools: RNRB_TOOLS,
    count: RNRB_TOOLS.length,
    version: '2.0.0',
  });
});

// SSE endpoint for MCP protocol
app.get('/sse', async (c) => {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    try {
      await sendEvent('server_info', {
        name: 'rnrb-mcp-server',
        version: '2.0.0',
        capabilities: { tools: {} },
        toolCount: RNRB_TOOLS.length,
      });

      await sendEvent('tools/list', { tools: RNRB_TOOLS });

      const heartbeat = setInterval(async () => {
        try {
          await sendEvent('ping', { timestamp: Date.now() });
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);
    } catch (error) {
      console.error('[MCP] SSE error:', error);
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});

// Tool execution endpoint
app.post('/tools/call', async (c) => {
  const env = c.env;

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Bearer token required' }, 401);
  }
  const accessToken = authHeader.replace('Bearer ', '');

  // In production, validate JWT and extract user info
  const userContext: UserContext = {
    userId: 'mcp-user',
    email: 'user@example.com',
    accessToken,
  };

  let body: { name: string; arguments?: Record<string, unknown> };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { name, arguments: args } = body;
  if (!name) {
    return c.json({ error: 'Tool name is required' }, 400);
  }

  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    return c.json({ error: `Unknown tool: ${name}` }, 404);
  }

  try {
    const result = await handler(env, userContext, args);
    return c.json(result);
  } catch (error) {
    console.error(`[MCP] Tool error for ${name}:`, error);
    return c.json(
      {
        error: 'Tool execution failed',
        content: [{ type: 'text', text: 'An error occurred while executing this tool.' }],
      },
      500
    );
  }
});

// MCP JSON-RPC endpoint
app.post('/mcp', async (c) => {
  const env = c.env;

  let body: { jsonrpc: string; id: string | number; method: string; params?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
      400
    );
  }

  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== '2.0') {
    return c.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id }, 400);
  }

  switch (method) {
    case 'initialize':
      return c.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'rnrb-mcp-server',
            version: '2.0.0',
            toolCount: RNRB_TOOLS.length,
          },
        },
      });

    case 'tools/list':
      return c.json({
        jsonrpc: '2.0',
        id,
        result: { tools: RNRB_TOOLS },
      });

    case 'tools/call': {
      const authHeader = c.req.header('Authorization');
      const accessToken = authHeader?.replace('Bearer ', '') || '';

      const userContext: UserContext = {
        userId: 'mcp-user',
        email: 'user@example.com',
        accessToken,
      };

      const toolParams = params as { name: string; arguments?: Record<string, unknown> };

      if (!toolParams?.name) {
        return c.json(
          { jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params: name required' } },
          400
        );
      }

      const handler = TOOL_HANDLERS[toolParams.name];
      if (!handler) {
        return c.json(
          {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${toolParams.name}` },
          },
          404
        );
      }

      try {
        const result = await handler(env, userContext, toolParams.arguments);
        return c.json({ jsonrpc: '2.0', id, result });
      } catch (error) {
        console.error(`[MCP] Tool error:`, error);
        return c.json(
          { jsonrpc: '2.0', id, error: { code: -32000, message: 'Tool execution failed' } },
          500
        );
      }
    }

    default:
      return c.json(
        { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } },
        404
      );
  }
});

// Export for Cloudflare Workers
export default app;
