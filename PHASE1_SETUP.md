# CronkWater Phase 1 MVP - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase account
- OpenAI API key
- ElevenLabs API key (optional, for voice preview)

### Environment Variables

Create `.env.local` in `apps/web/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# ElevenLabs (optional)
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Database Setup

1. Create a new Supabase project
2. Run the migration SQL from `supabase-migration.sql` in the Supabase SQL Editor
3. Enable Google OAuth in Supabase Dashboard → Authentication → Providers

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## 📁 File Structure

```
apps/web/
├── app/
│   ├── (app)/
│   │   ├── projects/
│   │   │   ├── page.tsx                    # Projects dashboard with tabs
│   │   │   ├── ProjectsDashboardTabs.tsx   # Tab navigation
│   │   │   ├── SongList.tsx                # Songs list view
│   │   │   └── [slug]/songs/[songId]/
│   │   │       └── page.tsx                # Song detail page
│   │   ├── host/
│   │   │   └── page.tsx                    # Live Host Mode
│   │   └── audience/[sessionId]/
│   │       └── page.tsx                    # Audience prompt submission
│   ├── (marketing)/
│   │   └── signin/
│   │       └── page.tsx                    # Supabase auth signin
│   └── api/
│       ├── ai-lyrics/route.ts              # OpenAI lyrics generation
│       ├── upload-audio/route.ts           # Audio upload to Supabase Storage
│       └── elevenlabs-voice/route.ts       # ElevenLabs TTS
├── components/
│   ├── lyric-architect/
│   │   └── LyricArchitect.tsx              # AI lyric generation UI
│   └── audio/
│       └── WaveformPreview.tsx             # Waveform + LUFS meter
└── lib/
    └── supabase/
        ├── client.ts                        # Browser Supabase client
        ├── server.ts                        # Server Supabase client
        └── middleware.ts                    # Auth middleware

public/
├── manifest.json                           # PWA manifest
└── sw.js                                    # Service worker
```

## ✨ Features Implemented

### ✅ Authentication
- Supabase Auth with email magic links
- Google OAuth integration
- Protected routes with middleware

### ✅ Projects Dashboard
- Projects list view
- Create new projects
- Tab navigation (?tab=overview|songs)
- Songs list across all projects

### ✅ Song Management
- Song detail page with title, BPM, key, mood tags
- Edit song metadata
- AI lyric generation integration

### ✅ AI Lyric Architect
- Prompt-based lyric generation
- Verse/Chorus/Bridge structure
- Rhyme scheme notation
- Stress map analysis
- JSON format output

### ✅ Audio Features
- Upload audio files to Supabase Storage
- Waveform visualization with WaveSurfer.js
- LUFS meter (loudness measurement)
- Audio playback controls

### ✅ Live Host Mode
- QR code generation for audience access
- Real-time prompt submission via Supabase Realtime
- Live lyrics generation on host screen
- ElevenLabs voice preview integration

### ✅ PWA Support
- Manifest.json configured
- Service worker for offline caching
- Mobile-optimized viewport settings

## 🧪 Testing

### E2E Test Flow (Playwright)

```typescript
// tests/phase1.spec.ts
test('complete flow', async ({ page }) => {
  // 1. Login
  await page.goto('/signin');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  
  // 2. Create project
  await page.goto('/projects');
  await page.click('button:has-text("New Project")');
  await page.fill('input[placeholder="Project name"]', 'Test Project');
  await page.click('button:has-text("Create")');
  
  // 3. Generate lyrics
  await page.click('button:has-text("Generate with AI")');
  await page.fill('textarea', 'sad breakup song');
  await page.click('button:has-text("Generate Lyrics")');
  
  // 4. Upload audio
  await page.setInputFiles('input[type="file"]', 'test-audio.mp3');
  
  // 5. Verify waveform appears
  await expect(page.locator('.waveform')).toBeVisible();
});
```

## 🎯 Performance Targets

- **Mobile 60fps**: Optimized animations with Framer Motion
- **Lighthouse 100**: 
  - Code splitting enabled
  - Image optimization
  - Service worker caching
  - Minimal JavaScript bundle

## 🔧 Next Steps

1. Set up Supabase project and run migration
2. Configure environment variables
3. Test authentication flow
4. Test AI lyric generation
5. Test Live Host Mode with QR code
6. Verify PWA installation on mobile

## 📝 Notes

- Supabase Realtime requires enabling in dashboard
- Storage bucket "audio" must be created and made public
- OpenAI API key required for lyric generation
- ElevenLabs optional but recommended for voice preview














