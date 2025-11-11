# SongForge

A premium music ecosystem platform for collaborative songwriting, recording, and community management.

## 🎯 Overview

SongForge is a comprehensive web application designed for musicians, bands, and music organizations. It provides:

- **Project Management**: Organize songs, assets, and collaborations
- **Split Sheets**: Track revenue splits with PRO/IPI integration
- **Licensing**: Manage collaboration agreements and licenses
- **Events**: Festival and concert management
- **Podcasts**: Episode management and publishing
- **Foundation Tools**: Donations and subscription management

## 🏗️ Architecture

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: S3/R2 compatible (Cloudflare R2 recommended)
- **Auth**: NextAuth.js with organization-aware sessions
- **UI**: Tailwind CSS + Radix UI + custom design tokens
- **Validation**: Zod schemas throughout

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+
- Docker (optional, for local database)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd song-forge

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start database (Docker)
pnpm -F @songforge/db db:up

# Run migrations
pnpm db:migrate

# Generate Prisma client
pnpm -F @songforge/db prisma:generate

# Start development server
pnpm dev
```

Visit `http://localhost:3000`

## 📦 Packages

- `@songforge/db`: Database schema, Prisma client, helper functions
- `@songforge/auth`: Authentication and session management
- `@songforge/ui`: Shared UI components and design tokens
- `@songforge/config`: Shared ESLint, TypeScript, Prettier configs
- `@songforge/trpc`: tRPC setup (for future API)

## 🗄️ Database

### Setup

```bash
# Start PostgreSQL
pnpm -F @songforge/db db:up

# Create migration
pnpm -F @songforge/db prisma:migrate:dev

# Generate Prisma client
pnpm -F @songforge/db prisma:generate

# Seed database (optional)
pnpm db:seed
```

### Schema

See `packages/db/prisma/schema.prisma` for complete schema documentation.

Key models:
- `User`: User accounts with PRO affiliation
- `Org`: Organizations (foundation/studio/band)
- `Project`: Song projects with visibility controls
- `Song`: Individual songs with ISWC support
- `Asset`: Audio, lyrics, images, PDFs
- `SplitSheet`: Revenue split tracking
- `License`: Collaboration agreements
- `Event`: Festivals and concerts
- `PodcastEpisode`: Podcast content

## 🔐 Environment Variables

See `.env.example` for all required variables. Key ones:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
STORAGE_ENDPOINT="https://..."
STORAGE_ACCESS_KEY_ID="..."
STORAGE_SECRET_ACCESS_KEY="..."
STORAGE_BUCKET="..."
```

## 🧪 Testing

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# E2E tests (requires dev server running)
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui
```

## 🏭 Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm -F @songforge/db build
pnpm -F apps/web build
```

## 🐳 Docker

```bash
# Build image
docker build -t songforge .

# Run container
docker run -p 3000:3000 --env-file .env songforge
```

## 📚 Documentation

- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database Helpers**: `packages/db/src/helpers/`
- **Server Actions**: `apps/web/lib/actions/`
- **Components**: `apps/web/components/`

## 🎨 Design System

The application uses a comprehensive design token system with three themes:
- **Light**: Clean, bright interface
- **Dark**: Low-light optimized
- **Warm**: Warm studio aesthetic

All components respect `prefers-reduced-motion` and are fully accessible.

## 🔒 Security

- Security headers configured in middleware
- Input validation with Zod
- DEMO_BYPASS guard for production
- Rate limiting infrastructure ready
- Content Security Policy
- Secure session management

## 📈 Performance

- Code splitting enabled
- Image optimization configured
- Bundle size optimization
- Lazy loading for heavy components
- Database query optimization

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests and linting
4. Submit pull request

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built for musicians, by musicians.
