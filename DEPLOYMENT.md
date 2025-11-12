# CronkWaters Deployment Guide

## 🚀 Vercel Deployment

### Required Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

#### Core Requirements
- `DATABASE_URL` - PostgreSQL connection string (e.g., from Supabase, Neon, or Railway)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Set to `https://cronkwaters.vercel.app` (or your custom domain)

#### Supabase Integration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)

#### Optional Features
- `OPENAI_API_KEY` - For AI lyrics generation (optional)
- `XAI_API_KEY` - For additional AI features (optional)
- `EMAIL_SERVER_URL` - SMTP URL for email auth (optional)
- `EMAIL_FROM` - From address for emails (optional)

### Deployment Steps

1. **Fork/Clone the repository**
   ```bash
   git clone https://github.com/jcronkdc/CronkWaters.git
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import the GitHub repository
   - Select the root directory (not a subdirectory)

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `.` (leave as is)
   - Build Command: `pnpm turbo run build --filter=@cronkwaters/web...`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`

4. **Set Environment Variables**
   - Add all required variables listed above
   - Use the Vercel dashboard or CLI

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Troubleshooting

#### Check Deployment Health
1. Visit `/test` - Basic routing check
2. Visit `/api/health` - Detailed diagnostics

#### Common Issues

**Build Fails**
- Ensure all dependencies are committed (especially `pnpm-lock.yaml`)
- Check build logs for missing environment variables

**Runtime Errors**
- Verify DATABASE_URL is correct and accessible
- Ensure NEXTAUTH_SECRET is set
- Check function logs in Vercel dashboard

**Database Connection Issues**
- Whitelist Vercel's IP addresses in your database provider
- Use connection pooling for serverless environments
- Consider using Prisma Data Proxy for better connection handling

### Production Checklist

- [x] All environment variables set
- [x] Database migrations run
- [x] pnpm-lock.yaml committed
- [x] Build succeeds locally
- [x] Health check endpoint responds
- [x] Authentication works
- [x] Database queries succeed

### Support

For issues, check:
1. Vercel Function Logs
2. Browser Console
3. `/api/health` endpoint
4. GitHub Issues

## 🐳 Docker Deployment (Alternative)

For self-hosting, use the included Dockerfile:

```bash
docker build -t cronkwaters .
docker run -p 3000:3000 --env-file .env cronkwaters
```