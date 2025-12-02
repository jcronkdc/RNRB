# RNRB Remote MCP Server

> **Live URL:** https://rnrb-mcp-server.justincronk.workers.dev

A Cloudflare Worker that exposes Rock N' Roll Basement AI assistant tools via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

## What This Does

Allows any MCP-compatible client (Claude Desktop, AI Playground, etc.) to:

- **Create & manage support tickets** - Report bugs, request help
- **Subscribe to newsletter** - Get updates, tips, events
- **Troubleshoot issues** - Step-by-step help for common problems
- **Check system status** - See if services are operational
- **Send feedback** - Feature requests and suggestions

## Available Tools

| Tool                     | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `create_support_ticket`  | Create a support ticket with subject, description, category, priority |
| `view_my_tickets`        | List your open/closed tickets                                         |
| `view_ticket_details`    | See full ticket conversation                                          |
| `reply_to_ticket`        | Add a message to an existing ticket                                   |
| `subscribe_newsletter`   | Subscribe with preferences                                            |
| `unsubscribe_newsletter` | Opt out of newsletter                                                 |
| `troubleshoot_issue`     | Get help for audio, video, login, sync issues                         |
| `check_system_status`    | Check if RNRB services are up                                         |
| `send_feedback`          | Submit feature requests or feedback                                   |

## Deployment

### 1. Install Dependencies

```bash
cd apps/mcp-server
pnpm install
```

### 2. Create KV Namespace

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Copy the `id` from the output and update `wrangler.jsonc`:

```json
{
  "kv_namespaces": [
    {
      "binding": "OAUTH_KV",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ]
}
```

### 3. Set Secrets

```bash
# Your RNRB API URL (e.g., https://cronkwaters.com or https://rnrb.me)
npx wrangler secret put RNRB_API_URL

# An API key for the MCP server to authenticate with your main app
npx wrangler secret put RNRB_API_KEY

# Random string for cookie encryption
npx wrangler secret put COOKIE_ENCRYPTION_KEY
```

### 4. Deploy

```bash
pnpm deploy
# or
npx wrangler deploy
```

Your MCP server will be live at:

```
https://rnrb-mcp-server.<your-account>.workers.dev
```

## Local Development

```bash
# Create .dev.vars with local secrets
echo 'RNRB_API_URL="http://localhost:3000"' >> .dev.vars
echo 'RNRB_API_KEY="test-key"' >> .dev.vars

# Start dev server
pnpm dev
```

Server runs at `http://localhost:8788`

## Connect to Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "rnrb": {
      "command": "npx",
      "args": ["mcp-remote", "https://rnrb-mcp-server.<your-account>.workers.dev/sse"]
    }
  }
}
```

Then restart Claude Desktop.

## Test with MCP Inspector

```bash
# Run the inspector
npx @modelcontextprotocol/inspector@latest

# Open http://localhost:5173
# Enter your server URL: http://localhost:8788/sse (local) or your workers.dev URL
# Click Connect
```

## API Endpoints

| Endpoint      | Method | Description                  |
| ------------- | ------ | ---------------------------- |
| `/`           | GET    | Server info                  |
| `/health`     | GET    | Health check                 |
| `/tools`      | GET    | List available tools         |
| `/sse`        | GET    | SSE endpoint for MCP clients |
| `/tools/call` | POST   | Execute a tool               |
| `/mcp`        | POST   | JSON-RPC endpoint for MCP    |

## Authentication

The server expects a Bearer token in the Authorization header:

```
Authorization: Bearer <user-access-token>
```

This token should be a valid RNRB access token that identifies the user making requests.

## Example Usage (in Claude)

```
User: "I'm having audio issues with video calls"

Claude: *uses troubleshoot_issue tool*
→ Returns step-by-step guide

User: "That didn't work, create a ticket"

Claude: *uses create_support_ticket tool*
→ Creates ticket RNRB-1042
```

## Project Structure

```
apps/mcp-server/
├── src/
│   ├── index.ts      # Main entry point, Hono routes
│   ├── tools.ts      # Tool definitions and schemas
│   └── handlers.ts   # Tool implementation handlers
├── wrangler.jsonc    # Cloudflare Worker config
├── package.json
├── tsconfig.json
└── README.md
```

## Learn More

- [Cloudflare MCP Server Guide](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
