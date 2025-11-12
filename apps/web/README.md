# Web App (`apps/web`)

Next.js 16 App Router experience for the CronkWater platform.

- TypeScript + TailwindCSS + Radix UI (via shadcn components from `@songforge/ui`)
- Org-aware session helper + Auth.js handlers (`packages/auth`)
- tRPC v11 client powered by React Query (`packages/trpc`)

## Local Development

```bash
pnpm dev                      # from repo root
# or
pnpm --filter web dev         # from repo root for this app only
```

Environment variables live in `.env.example`. Copy to `.env.local` and update:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

## Scripts

- `pnpm --filter web lint` – App-specific linting.
- `pnpm --filter web typecheck` – Ensures the module graph is type-safe.
- `pnpm --filter web build` – Production build (depends on Prisma client + auth).

## Folder Overview

- `app/` – Next.js route handlers and layouts.
- `app/api/` – tRPC + Auth.js API routes.
- `app/providers.tsx` – Registers React Query, tRPC, and toast providers.
- `tailwind.config.ts` – Tailwind config with `@songforge/ui` tokens.
