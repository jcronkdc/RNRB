# 🍄 SQL & Authentication Setup Guide

## The Current Blockages

1. **No Sign Up Page** - Fixed! Now users can toggle between sign in and sign up
2. **Database Not Connected** - You need PostgreSQL
3. **Auth Providers Not Configured** - Email and OAuth need setup

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### 🔴 Critical (Without these, nothing works)

```bash
# PostgreSQL Database (Required)
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth (Required)
NEXTAUTH_SECRET=your-32-character-secret-here
NEXTAUTH_URL=https://your-deployed-url.vercel.app

# Supabase (Required based on your code)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 🟡 Important (For full functionality)

```bash
# Email Magic Links
EMAIL_SERVER_URL=smtp://user:pass@smtp.example.com:587
EMAIL_FROM=noreply@cronkwaters.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Quick Database Setup Options

### Option 1: Supabase (Easiest)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the Database URL from Settings → Database
4. Use that as your `DATABASE_URL`

### Option 2: Vercel Postgres
1. In Vercel Dashboard → Storage → Create Database
2. Choose Postgres
3. It auto-adds the DATABASE_URL

### Option 3: Railway or Render
1. Create a PostgreSQL database
2. Copy the connection string

## After Adding Environment Variables

1. Push the schema to your database:
```bash
cd song-forge
npx prisma db push
```

2. Redeploy on Vercel

## Emergency Quick Fix

If you just want to test without a real database:

1. Use SQLite locally (not for production):
```
DATABASE_URL="file:./dev.db"
```

2. Update schema.prisma to use sqlite provider (temporary only)

## What Users Will See Now

- `/auth` page has Sign In / Sign Up toggle
- Sign Up form allows email + name registration
- Falls back gracefully if providers aren't configured
- Clear error messages guide users

The mycelial network now has entry points for new spores! 🍄
