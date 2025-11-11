# Database scripts

- `pnpm --filter @songforge/db run migrate:dev` — run development migrations against your local database.
- `pnpm --filter @songforge/db run db:migrate` — deploy migrations (used in CI/CD).
- `pnpm --filter @songforge/db run db:seed` — seed the database using `prisma/seed.ts`.

