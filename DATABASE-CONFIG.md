# Database Configuration Reference

## ⚠️ IMPORTANT: Use Neon Database Only

Your application uses **Neon** as the primary database, NOT Supabase.

## Correct Database URL

Make sure your `.env.local` file in the root contains:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_HlRo2FZ6mGYM@ep-morning-shadow-ahxokvi8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

## What Was Wrong

Previously, your `.env.local` had a different Neon database URL:

- **OLD (WRONG)**: `ep-sparkling-boat-af13jmny-pooler.c-2.us-west-2.aws.neon.tech`
- **CORRECT**: `ep-morning-shadow-ahxokvi8-pooler.c-3.us-east-1.aws.neon.tech`

This caused user accounts to be created in the wrong database, leading to login failures.

## How to Fix

1. **Update `.env.local` in the project root** with the correct DATABASE_URL (see above)
2. **Restart your dev server** after changing the environment variable
3. **All user accounts** should be created in the Neon database at the correct endpoint

## Test Account

- Email: `justin@cronkwaters.com`
- Password: `TestRock2024!`

This account was created in the **correct** Neon database and should work.

## Verification

To verify you're using the correct database:

```bash
cd /Users/justincronk/Desktop/CronkWaters
echo $DATABASE_URL  # Should show the CORRECT endpoint
```

Or check with Prisma:

```bash
pnpm --filter @cronkwaters/db exec prisma db execute --stdin <<< "SELECT current_database(), inet_server_addr();"
```
