/**
 * RNRB Remote MCP Server
 *
 * Exposes Rock N' Roll Basement AI assistant tools via the Model Context Protocol.
 * Deploy to Cloudflare Workers for remote access from any MCP-compatible client.
 *
 * Features:
 * - Support ticket creation and management
 * - Newsletter subscription
 * - IT troubleshooting assistance
 * - System status checks
 * - Feedback submission
 *
 * @see https://developers.cloudflare.com/agents/guides/remote-mcp-server/
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { RNRB_TOOLS } from './tools';
import {
  handleCreateSupportTicket,
  handleViewTickets,
  handleViewTicketDetails,
  handleReplyToTicket,
  handleSubscribeNewsletter,
  handleUnsubscribeNewsletter,
  handleTroubleshootIssue,
  handleCheckSystemStatus,
  handleSendFeedback,
} from './handlers';

interface Env {
  RNRB_API_URL: string;
  RNRB_API_KEY: string;
  OAUTH_KV?: KVNamespace; // Optional - for OAuth state storage
  COOKIE_ENCRYPTION_KEY?: string;
}

interface UserContext {
  userId: string;
  email: string;
  accessToken: string;
}

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

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'RNRB MCP Server',
    version: '1.0.0',
    description: "Rock N' Roll Basement AI Assistant Tools",
    endpoints: {
      sse: '/sse',
      tools: '/tools',
      health: '/health',
    },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available tools
app.get('/tools', (c) => {
  return c.json({ tools: RNRB_TOOLS });
});

// SSE endpoint for MCP protocol
app.get('/sse', async (c) => {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Helper to send SSE messages
  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  // Handle the SSE connection
  (async () => {
    try {
      // Send server info
      await sendEvent('server_info', {
        name: 'rnrb-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      });

      // Send available tools
      await sendEvent('tools/list', { tools: RNRB_TOOLS });

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(async () => {
        try {
          await sendEvent('ping', { timestamp: Date.now() });
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Note: In production, you'd handle incoming messages via a separate POST endpoint
      // or use WebSocket upgrade for bidirectional communication
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

// Tool execution endpoint (called by MCP clients)
app.post('/tools/call', async (c) => {
  const env = c.env;

  // Get authorization
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Bearer token required' }, 401);
  }
  const accessToken = authHeader.replace('Bearer ', '');

  // In production, validate the token and get user info
  // For now, we'll decode it or use a test user
  let userContext: UserContext;

  try {
    // You could validate JWT here, or call your auth API
    // For demo, we'll use a placeholder
    userContext = {
      userId: 'mcp-user',
      email: 'user@example.com', // Would come from token
      accessToken,
    };
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Parse request body
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

  // Route to appropriate handler
  let result: { content: Array<{ type: string; text: string }> };

  try {
    switch (name) {
      case 'create_support_ticket':
        result = await handleCreateSupportTicket(env, userContext, args);
        break;
      case 'view_my_tickets':
        result = await handleViewTickets(env, userContext, args);
        break;
      case 'view_ticket_details':
        result = await handleViewTicketDetails(env, userContext, args);
        break;
      case 'reply_to_ticket':
        result = await handleReplyToTicket(env, userContext, args);
        break;
      case 'subscribe_newsletter':
        result = await handleSubscribeNewsletter(env, userContext, args);
        break;
      case 'unsubscribe_newsletter':
        result = await handleUnsubscribeNewsletter(env, userContext, args);
        break;
      case 'troubleshoot_issue':
        result = await handleTroubleshootIssue(env, userContext, args);
        break;
      case 'check_system_status':
        result = await handleCheckSystemStatus(env, userContext, args);
        break;
      case 'send_feedback':
        result = await handleSendFeedback(env, userContext, args);
        break;
      default:
        return c.json({ error: `Unknown tool: ${name}` }, 404);
    }

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

// MCP JSON-RPC endpoint (alternative to SSE for some clients)
app.post('/mcp', async (c) => {
  const env = c.env;

  let body: { jsonrpc: string; id: string | number; method: string; params?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      {
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error' },
        id: null,
      },
      400
    );
  }

  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== '2.0') {
    return c.json(
      {
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request' },
        id,
      },
      400
    );
  }

  // Handle MCP methods
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
            version: '1.0.0',
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
          {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params: name required' },
          },
          400
        );
      }

      // Route to handler (same as /tools/call)
      let result: { content: Array<{ type: string; text: string }> };

      try {
        switch (toolParams.name) {
          case 'create_support_ticket':
            result = await handleCreateSupportTicket(env, userContext, toolParams.arguments);
            break;
          case 'view_my_tickets':
            result = await handleViewTickets(env, userContext, toolParams.arguments);
            break;
          case 'view_ticket_details':
            result = await handleViewTicketDetails(env, userContext, toolParams.arguments);
            break;
          case 'reply_to_ticket':
            result = await handleReplyToTicket(env, userContext, toolParams.arguments);
            break;
          case 'subscribe_newsletter':
            result = await handleSubscribeNewsletter(env, userContext, toolParams.arguments);
            break;
          case 'unsubscribe_newsletter':
            result = await handleUnsubscribeNewsletter(env, userContext, toolParams.arguments);
            break;
          case 'troubleshoot_issue':
            result = await handleTroubleshootIssue(env, userContext, toolParams.arguments);
            break;
          case 'check_system_status':
            result = await handleCheckSystemStatus(env, userContext, toolParams.arguments);
            break;
          case 'send_feedback':
            result = await handleSendFeedback(env, userContext, toolParams.arguments);
            break;
          default:
            return c.json(
              {
                jsonrpc: '2.0',
                id,
                error: { code: -32601, message: `Unknown tool: ${toolParams.name}` },
              },
              404
            );
        }

        return c.json({ jsonrpc: '2.0', id, result });
      } catch (error) {
        console.error(`[MCP] Tool error:`, error);
        return c.json(
          {
            jsonrpc: '2.0',
            id,
            error: { code: -32000, message: 'Tool execution failed' },
          },
          500
        );
      }
    }

    default:
      return c.json(
        {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' },
        },
        404
      );
  }
});

// Export for Cloudflare Workers
export default app;
