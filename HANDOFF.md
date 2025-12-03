# 🎸 Rock N' Roll Basement (RNRB) - Agent Handoff

**Date:** December 3, 2025  
**Project:** CronkWaters / Rock N' Roll Basement  
**Status:** All systems operational, major features deployed

---

## 🚀 What Was Just Completed

### 1. AI Workspace Builder Enhancement

**Files Modified:**

- `apps/web/app/api/assistant/workspace-builder/route.ts` - Enhanced AI with smart action routing
- `apps/web/components/workspace/ai-workspace-chat.tsx` - Frontend integration
- `apps/web/components/workspace/workspace-context.tsx` - Added banner settings
- `apps/web/components/workspace/customizable-dashboard.tsx` - Conditional banner rendering

**New Capabilities:**

- Rename workspaces via natural language ("Rename this to Songwriting")
- Add/remove specific tools from workspaces
- Configure promotional banners (merch, email) per workspace
- Smart action detection (create, modify, suggest, cleanup)

### 2. MCP Server Expansion (9 → 43 Tools)

**Deployed to:** `https://rnrb-mcp-server.justincronk.workers.dev`

**Files:**

- `apps/mcp-server/src/tools.ts` - Tool definitions with Zod schemas
- `apps/mcp-server/src/handlers.ts` - Tool handlers
- `apps/mcp-server/src/index.ts` - Hono server with routing

**Tool Categories:**
| Category | Count | Tools |
|----------|-------|-------|
| Support & Feedback | 9 | create_support_ticket, view_my_tickets, troubleshoot_issue, etc. |
| Workspace Management | 6 | create_workspace, update_workspace, configure_workspace_banners, etc. |
| Songwriting & Creative | 8 | create_song, generate_lyric_ideas, find_rhymes, get_chord_progressions, etc. |
| Collaboration | 5 | find_collaborators, send_collab_request, schedule_meeting, etc. |
| Tour & Performance | 6 | create_show, create_setlist, create_tour, find_venues, etc. |
| Business & Monetization | 5 | get_revenue_stats, list_opportunities, create_merch_product, etc. |
| Account & Settings | 4 | get_profile, update_profile, get_usage_stats, get_notifications |

---

## 📁 Project Structure

```
CronkWaters/
├── apps/
│   ├── web/                    # Next.js 15 main web app
│   │   ├── app/               # App router pages
│   │   │   ├── (app)/         # Protected routes (dashboard, features)
│   │   │   ├── (auth)/        # Auth routes (sign-in, sign-up)
│   │   │   ├── (marketing)/   # Public pages
│   │   │   └── api/           # API routes
│   │   ├── components/        # React components
│   │   │   ├── workspace/     # Dashboard & workspace system
│   │   │   ├── ai-assistant/  # AI chat components
│   │   │   └── ui/            # Shared UI components
│   │   └── lib/               # Utilities, auth, database
│   └── mcp-server/            # Cloudflare Workers MCP server
├── packages/
│   ├── ui/                    # Shared UI package
│   ├── database/              # Prisma schema & client
│   └── config-*/              # Shared configs
└── turbo.json                 # Turborepo config
```

---

## 🔑 Critical Rules (MUST FOLLOW)

### 1. Logo Usage [[memory:11700420]]

- **Dark backgrounds:** Use `/logo-dark.png` (WHITE logo)
- **Light backgrounds:** Use `/logo-light.png` (DARK logo)
- Every feature page needs the white RR logo at top, centered, linking to "/"

### 2. No Emojis in UI

- All icons must be custom SVGs or from icon library
- Never use emoji characters in the application UI

### 3. Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL via Prisma (Supabase)
- **Auth:** Better Auth
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (web), Cloudflare Workers (MCP)
- **AI:** Claude Sonnet 4 (workspace builder)

---

## 🌐 Deployed Endpoints

| Service    | URL                                             |
| ---------- | ----------------------------------------------- |
| Main App   | https://cronkwaters.com                         |
| MCP Server | https://rnrb-mcp-server.justincronk.workers.dev |
| GitHub     | https://github.com/jcronkdc/RNRB                |

### MCP Server Test Commands

```bash
# Health check
curl https://rnrb-mcp-server.justincronk.workers.dev/health

# List all 43 tools
curl https://rnrb-mcp-server.justincronk.workers.dev/tools

# Tool call (requires auth)
curl -X POST https://rnrb-mcp-server.justincronk.workers.dev/tools/call \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "check_system_status", "arguments": {}}'
```

---

## ⚠️ Known Issues / In Progress

### 1. Local API Issues

- The local development environment has some workspace API issues (500 errors)
- Production (Vercel) should work correctly
- Test new features on https://cronkwaters.com/dashboard

### 2. MCP Server Secrets

The MCP server needs these Cloudflare secrets configured:

```bash
wrangler secret put RNRB_API_URL  # https://cronkwaters.com
wrangler secret put RNRB_API_KEY  # Internal API key
```

### 3. API Routes Needed

The MCP tools call these API endpoints that may need implementation:

- `/api/songs` - CRUD for songs
- `/api/shows` - CRUD for shows/gigs
- `/api/tours` - Tour management
- `/api/collaboration` - Collaboration requests
- `/api/discover/users` - Find collaborators
- `/api/revenue/stats` - Revenue analytics
- `/api/ecosystem/opportunities` - Gig/sync opportunities

---

## 🧪 Testing the AI Workspace Builder

1. Go to https://cronkwaters.com/dashboard
2. Open the AI Workspace Builder (chat icon)
3. Try these commands:
   - "Create a Songwriting workspace with lyrics and collaboration tools"
   - "Rename this tab to Songwriting"
   - "Remove the merch and email banners"
   - "Add collaboration tools to this workspace"

---

## 📋 Potential Next Tasks

1. **Implement missing API endpoints** for MCP tools (songs, shows, tours, etc.)
2. **Claude Desktop integration** - Test MCP server with Claude Desktop app
3. **AI Assistant refinement** - Improve workspace builder responses
4. **Feature pages** - Build out Songwriting, Collaboration, Tour features
5. **Real-time collaboration** - WebSocket/Liveblocks for shared editing

---

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build all packages
pnpm build

# Deploy MCP server
cd apps/mcp-server && npx wrangler deploy

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint
```

---

## 📊 Recent Git Commits

```
62cced6d - 🚀 Full Platform Upgrade: AI Workspace Builder + 43 MCP Tools
1fcd4dac - (previous state)
```

---

## 💡 Architecture Notes

### Workspace System

- Workspaces are tabs on the dashboard
- Each workspace has: name, icon, tools[], settings
- Settings include: showMerchBanner, showEmailBanner
- Stored in WorkspaceContext (React context)

### AI Workspace Builder Flow

1. User sends message → `ai-workspace-chat.tsx`
2. POST to `/api/assistant/workspace-builder`
3. AI analyzes intent, returns action JSON
4. Frontend executes action via WorkspaceContext methods

### MCP Server Architecture

- Hono framework on Cloudflare Workers
- SSE endpoint for streaming (`/sse`)
- JSON-RPC endpoint (`/mcp`)
- REST endpoint (`/tools/call`)
- All handlers call main RNRB API with user's auth token

---

**End of Handoff - Good luck! 🎸**
