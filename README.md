# 🎸 Rock N' Roll Basement (RNRB)

**The all-in-one platform for musicians** - Collaboration, songwriting, touring, and music business management.

---

## Quick Links

- **🌐 Live Site:** https://www.cronkwaters.com
- **📖 Documentation:** `./docs/`
- **🔧 Setup Guides:** `./docs/setup-guides/`
- **📊 Master Truth:** `./MASTER_TRUTH.md`
- **🔄 Latest Handoff:** `./HANDOFF.md`

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL via Prisma (Neon/Supabase)
- **Auth:** Better Auth
- **Styling:** Tailwind CSS v4
- **Real-time:** Ably (chat, collaboration)
- **Video:** Daily.co (meetings, studios)
- **AI:** OpenAI GPT-4, Claude Sonnet
- **Deployment:** Vercel (web), Cloudflare Workers (MCP)

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
pnpm prisma:generate

# Run development server
pnpm dev
```

The app will be available at `http://localhost:3001`.

### Build

```bash
# Build all packages
pnpm build

# Deploy to production
git push origin main  # Auto-deploys to Vercel
```

---

## Project Structure

```
CronkWaters/
├── apps/
│   ├── web/              # Main Next.js app
│   ├── mcp-server/       # Cloudflare Workers MCP server
│   └── mail/             # Email client (experimental)
├── packages/
│   ├── db/               # Prisma schema & client
│   ├── ui/               # Shared UI components
│   ├── auth/             # Auth configuration
│   └── trpc/             # tRPC routers
├── docs/                 # Documentation
│   ├── setup-guides/     # Setup instructions
│   └── ...
├── _ARCHIVE_DOCS/        # Historical documentation
└── scripts/              # Utility scripts
```

---

## Key Features

### 🎵 Songwriting & Production

- Version control for songs (time machine for music)
- Multi-track stems management
- Collaborative lyrics editor
- Copyright & split sheets
- AI-powered songwriting tools

### 🎤 Live & Touring

- Smart setlist builder
- Gig calendar with conflict detection
- Tour routing & logistics
- Venue database
- Stage plots & performer mode

### 🤝 Collaboration

- Real-time collaborative editing
- Video meetings & studio sessions
- Project chat with reactions
- File sharing & version control
- Team management

### 💼 Business Tools

- Revenue tracking & analytics
- Merchandise store (Printful integration)
- Services marketplace
- Opportunity discovery
- Licensing & copyright management

### 🌐 Website Builder

- 8 professional templates
- Custom domains & SSL
- SEO optimization
- Analytics integration
- Contact & mailing list forms

### 🧰 Musician's Toolbox

- Chromatic tuner
- Click track generator
- Practice logger
- Loop/slow player
- Circle of fifths
- Gear inventory
- Contract templates
- And more...

---

## Environment Variables

See `ENV_TEMPLATE.md` for complete list. Key variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3001"

# External Services
ABLY_API_KEY="your-key"
DAILY_API_KEY="your-key"
OPENAI_API_KEY="your-key"
STRIPE_SECRET_KEY="your-key"
```

---

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3001)
pnpm build                  # Build all packages
pnpm lint                   # Run ESLint
pnpm type-check             # TypeScript type checking

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # Open Prisma Studio

# Testing
pnpm test                   # Run tests
pnpm test:coverage          # Run with coverage
```

---

## Deployment

### Vercel (Main App)

Automatically deploys on push to `main` branch.

```bash
git push origin main
```

### Cloudflare Workers (MCP Server)

```bash
cd apps/mcp-server
npx wrangler deploy
```

---

## Architecture

### Monorepo Structure

- **Turborepo** for build orchestration
- **pnpm workspaces** for package management
- **Shared packages** for code reuse

### Key Patterns

- **App Router** for all pages
- **Server Components** by default
- **Client Components** for interactivity
- **tRPC** for type-safe APIs
- **Prisma** for database access

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

### Code Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **No emojis** in UI components (use custom icons)
- **CSS variables** (not Tailwind color classes)

---

## Documentation

- **MASTER_TRUTH.md** - Single source of truth for project state
- **HANDOFF.md** - Latest agent handoff document
- **docs/** - Comprehensive guides and references
- **\_ARCHIVE_DOCS/** - Historical documentation

---

## Support

- **Issues:** GitHub Issues
- **Docs:** `./docs/`
- **Community:** Discord (coming soon)

---

## License

Proprietary - All Rights Reserved

---

**Built with ❤️ for musicians, by musicians.**
