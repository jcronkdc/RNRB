# Database scripts

- `pnpm --filter @cronkwaters/db run migrate:dev` — run development migrations against your local database.
- `pnpm --filter @cronkwaters/db run db:migrate` — deploy migrations (used in CI/CD).
- `pnpm --filter @cronkwaters/db run db:seed` — seed the database using `prisma/seed.ts`.

