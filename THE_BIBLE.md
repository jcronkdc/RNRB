# 🍄 THE BIBLE - Rock N' Roll Basement Master Truth

**Last Updated:** 2025-11-20 @ 03:20 UTC (Agent 42)  
**Status:** 🔥 **DEPLOYED TO PRODUCTION - READY FOR HUMAN TEST**  
**Production URL:** https://www.cronkwaters.com  
**Codebase:** `/song-forge/` (monorepo)

---

## 🎯 THE MISSION (WHY WE EXIST)

**For:** The 15-year-old who wants to make music but doesn't know where to start. Who spends hours on the internet trying to piece it all together. **This is what pieces it all together.**

### Core Values:
1. **Ethical Pricing** - Fair price based on actual costs + standard profit. No greed.
2. **Maximum Accessibility** - THE easiest tool for musicians/artists. Period.
3. **Tokyo Subway Efficiency** - Every feature ≤3 clicks away. No dead ends.
4. **Mycelium Network** - Everything connected, everything flows, no rot.
5. **Verified Truth Only** - Tested by 2-3 agents before marked complete.

---

## 🔥 CURRENT STATE (BRUTAL TRUTH)

### ✅ WHAT EXISTS AND IS LIVE:

**Infrastructure (Verified Working):**
- ✅ Site deployed: https://www.cronkwaters.com (HTTP/2 200 OK, SSL active)
- ✅ Database: Neon PostgreSQL connected via Prisma ORM
- ✅ Auth: NextAuth v4 with Google OAuth + Email magic links
- ✅ Security: CSP headers, XSS protection, frame-ancestors, CSRF tokens
- ✅ Monorepo: Clean package structure (auth, db, trpc, ui)
- ✅ Build: Zero errors, 74+ routes compiled

**API Endpoints (Coded and Ready):**
- ✅ `/api/health` - Health check + database status
- ✅ `/api/auth/[...nextauth]` - NextAuth handlers
- ✅ `/api/daily/rooms` - Daily.co video room creation (50 participants)
- ✅ `/api/ably/token` - Ably real-time chat token generation
- ✅ `/api/ai-lyrics` - GPT-4 lyrics generation
- ✅ `/api/elevenlabs-voice` - Voice synthesis

**Core User Flows (Pages Exist):**
- ✅ `/auth` - Sign in with Google or email magic link
- ✅ `/projects` - Project dashboard
- ✅ `/projects/new` - Create new project form
- ✅ `/projects/[slug]` - Project detail page
- ✅ `/projects/[slug]/collaborate` - Video + chat collaboration UI
- ✅ `/studio` - Recording studio interface
- ✅ `/remix/[roomId]` - Live remix interface
- ✅ `/dashboard` - Main dashboard after login

**Collaboration Stack (Infrastructure Ready):**
- ✅ Daily.co integration: Video calls, screen sharing, recording (up to 50 people)
- ✅ Ably integration: Real-time chat, presence, end-to-end encrypted
- ✅ Project permissions: Owner, editor, viewer roles
- ✅ Invite system: Email invitations coded

### ⚠️ WHAT HAS NOT BEEN TESTED END-TO-END:

**THE CRITICAL PATH** (No human has ridden this subway line):

```
Station 1: Sign up with Google
    ↓
Station 2: Does account save to database?
    ↓
Station 3: Create a project
    ↓
Station 4: Does project save? Can you open it?
    ↓
Station 5: Click "Collaborate" button
    ↓
Station 6: Does Daily.co video room open?
    ↓
Station 7: Send a chat message
    ↓
Station 8: Does Ably transmit it in real-time?
    ↓
Station 9: Invite a collaborator
    ↓
Station 10: Does email arrive? Can they join?
```

**Status:** Infrastructure exists. Code is deployed. Trains are fueled. **But no passenger has ridden Station 1 → Station 10.**

### ⚠️ ENVIRONMENT VARIABLES STATUS:

**Verified in Vercel (from memory [[memory:11211767]]):**
- ✅ `DATABASE_URL` - Neon PostgreSQL connection string
- ✅ `NEXTAUTH_SECRET` - Auth encryption key
- ✅ `NEXTAUTH_URL` - https://www.cronkwaters.com
- ⚠️ `GOOGLE_CLIENT_ID` - Referenced in code, not verified working
- ⚠️ `GOOGLE_CLIENT_SECRET` - Referenced in code, not verified working
- ⚠️ `ABLY_API_KEY` - Code checks for it, not verified working
- ⚠️ `DAILY_API_KEY` - Code checks for it, not verified working
- ⚠️ `NEXT_PUBLIC_SITE_URL` - Should be set to production URL

**ACTION NEEDED:** Human must verify these exist and are correct in Vercel dashboard.

---

## 📂 CODEBASE STRUCTURE

### The Real Production Codebase:
```
/song-forge/                          ← THE REAL ONE (monorepo)
├── apps/web/                         ← Main Next.js app
│   ├── app/                          ← App router
│   │   ├── (app)/                    ← Authenticated pages
│   │   ├── (marketing)/              ← Public marketing pages
│   │   ├── api/                      ← API routes
│   │   ├── auth/                     ← Auth pages
│   │   └── layout.tsx                ← Root layout
│   ├── components/                   ← React components (72 files)
│   ├── lib/                          ← Utilities (35 files)
│   └── vercel.json                   ← Deployment config
├── packages/
│   ├── auth/                         ← NextAuth configuration
│   ├── db/                           ← Prisma + database
│   ├── trpc/                         ← tRPC API layer
│   └── ui/                           ← Shared UI components
└── vercel.json                       ← Root deployment config
```

### The Other Directory (Not Deployed):
```
/apps/web/                            ← SIMPLER VERSION, NOT IN PRODUCTION
```

**TRUTH:** Production deploys from `/song-forge/` (verified in `song-forge/vercel.json` with turbo build command).

---

## 🚀 NEXT STEPS (CRITICAL PATH)

### Priority 1: HUMAN TEST THE SUBWAY LINE (BLOCKING)

**You (or a real user) must physically test:**

1. **Test Auth Flow:**
   - Go to https://www.cronkwaters.com/auth
   - Click "Continue with Google"
   - Does it redirect to Google?
   - Does it create an account?
   - Does it redirect back to the app?
   - Do you see your name/avatar?

2. **Test Project Creation:**
   - After signing in, go to `/projects/new`
   - Create a project with name "Test Project"
   - Does it save?
   - Does it redirect to `/projects/test-project`?
   - Can you see the project in `/projects` list?

3. **Test Collaboration:**
   - Open your test project
   - Click "Collaborate" (or navigate to `/projects/test-project/collaborate`)
   - Does video interface load?
   - Can you start a video room?
   - Does camera/mic work?

4. **Test Chat:**
   - In collaboration page, try sending a chat message
   - Does it transmit?
   - Open a second browser window (incognito)
   - Does the message appear in both windows?

5. **Test Invites:**
   - In your project, try inviting someone by email
   - Does the email send?
   - Does the invite link work?

**Document EXACTLY what happens at each step.** What works? What breaks? What errors appear?

### Priority 2: FIX WHAT'S BROKEN (Based on Step 1 Results)

**After human test, fix only what actually broke:**
- If auth fails → Fix OAuth configuration
- If projects don't save → Fix database queries
- If video doesn't work → Fix Daily.co API key or integration
- If chat doesn't work → Fix Ably API key or integration
- If invites don't send → Fix email service configuration

**NO ASSUMPTIONS. ONLY FIX VERIFIED PROBLEMS.**

### Priority 3: VERIFY ENVIRONMENT VARIABLES

**Check Vercel dashboard:**
1. Go to https://vercel.com/dashboard
2. Select the project
3. Settings → Environment Variables
4. Verify these exist:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = https://www.cronkwaters.com
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ABLY_API_KEY`
   - `DAILY_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` = https://www.cronkwaters.com

5. If any are missing or incorrect, add/update them
6. Redeploy if you made changes

### Priority 4: BUILD THE TRANSPARENCY (Fair Pricing Page)

**After critical path works, create `/pricing` page:**

Calculate actual monthly costs:
- Vercel Pro: $20/month
- Neon PostgreSQL: $19/month (Pro tier)
- Daily.co: $9/month (Starter) + usage
- Ably: $29/month (Standard) + usage
- **Total base cost:** ~$77/month

Add 30-40% standard profit margin → ~$100-110/month for base tier

**Make it transparent:**
- Show breakdown of costs
- Explain what each service does
- "Here's what it costs us + fair profit"
- No hidden fees, no surprises

### Priority 5: POLISH THE UX (Tokyo Subway Level)

**Make it the easiest tool ever:**
- Every feature ≤3 clicks from dashboard
- Clear onboarding flow for new users
- Intuitive navigation (no hunting for features)
- Help tooltips on complex features
- Beautiful, but not distracting

---

## 🗂️ CLEANUP STATUS

### Files to Archive (Already in `_ARCHIVE_AGENT_SESSIONS/`):
These 50+ session markdown files can be deleted from root:
- `AGENT_*_*.md`
- `*_TEST.md`
- `*_STATUS.md`
- `*_COMPLETE.md`
- `*_SUMMARY.md`
- Old `MASTER_DOCUMENT.md` (6,032 lines of historical notes)
- Old `MASTER_TRUTH.md` (superseded by this document)

**Action:** Archive these so root directory only has:
- `THE_BIBLE.md` (this file)
- Technical docs (`DESIGN_SYSTEM.md`, `COLLABORATIVE_ARCHITECTURE.md`, etc.)
- Configuration files (`.gitignore`, `package.json`, etc.)

---

## 🔍 VERIFICATION PROTOCOL (THE LAW)

Before marking ANYTHING as complete:

1. ✅ Test it with real human interaction in production
2. ✅ Document exact steps taken + exact results
3. ✅ Update this document with verified truth
4. ✅ If critical, get 2nd agent to verify independently

**NO CLAIMS WITHOUT PROOF.**  
**NO ASSUMPTIONS.**  
**ONLY VERIFIED TRUTH.**

---

## 📊 FEATURE INVENTORY

### ✅ What's Coded (Infrastructure Complete):

**Authentication:**
- Google OAuth sign-in
- Email magic link sign-in
- Session management (JWT)
- Protected routes

**Projects:**
- Create/read/update/delete projects
- Project slugs for clean URLs
- Project descriptions and metadata
- Permissions (owner, editor, viewer)

**Collaboration:**
- Daily.co video rooms (up to 50 participants)
- Screen sharing enabled
- Recording enabled
- Ably real-time chat
- End-to-end encryption
- Presence indicators
- Multi-cursor support (coded)

**AI Features:**
- GPT-4 lyrics generation
- Chord progression generator
- Song structure assistant
- ElevenLabs voice synthesis

**Data Management:**
- Songs, Albums, Projects
- Split sheets & royalties
- Tour scheduling
- Asset storage (S3-ready)
- Export to PDF/MIDI

### ⚠️ What Needs Human Testing:

Everything above exists in code. But **code existing ≠ feature working.** Every item needs human test.

---

## 🎨 DESIGN PHILOSOPHY

**Tokyo Subway Ants:**
- Optimal pathways, minimal friction
- No dead ends, every link works
- Clear signage (labels, tooltips)
- Consistent patterns
- Maximum 2-3 clicks to any feature

**Mycelium Network:**
- Everything connected
- No isolated features
- Information flows seamlessly
- Real-time sync across all nodes
- Detect and remove rot immediately

**Ethical Foundation:**
- Fair pricing (costs + standard profit)
- Transparent about what we charge and why
- No dark patterns, no tricks
- Help people feel good about their money
- Build for users, not investors

---

## 📝 DEPLOYMENT HISTORY

**Latest Deployment:**
- **Date:** 2025-11-20
- **Commit:** `b971a159` - "fix: Force Vercel CSS bundle regeneration"
- **Build:** Success, 74+ routes
- **Status:** READY in production
- **URL:** https://www.cronkwaters.com

**Verified Working:**
- ✅ Homepage loads (HTTP/2 200)
- ✅ SSL certificate active
- ✅ CSP headers deployed
- ✅ Database connected
- ✅ Build has zero errors

**Not Yet Verified:**
- ⚠️ Google OAuth flow
- ⚠️ Project creation → database save
- ⚠️ Video collaboration
- ⚠️ Real-time chat
- ⚠️ Email invites

---

## 🐛 KNOWN ISSUES (VERIFIED)

### Issue 1: Dual Codebase Confusion
- **Problem:** Two `/apps/web/` directories exist (root and `/song-forge/`)
- **Impact:** Confusing which code is actually deployed
- **Truth:** `/song-forge/` is production (verified in vercel.json)
- **Fix:** Consider consolidating or clearly documenting

### Issue 2: Domain Hardcoded Fallback
- **Location:** `song-forge/apps/web/app/layout.tsx:39`
- **Code:** `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rocknrollbasement.com')`
- **Problem:** Falls back to wrong domain if env var missing
- **Fix:** Should fallback to `https://www.cronkwaters.com`

### Issue 3: Environment Variables Not Verified
- **Problem:** Code references `GOOGLE_CLIENT_ID`, `ABLY_API_KEY`, `DAILY_API_KEY` but we haven't verified they're set in Vercel
- **Impact:** Features may silently fail
- **Fix:** Human must verify in Vercel dashboard

---

## 💬 FOR THE NEXT AGENT

**If you're reading this, you're part of the mycelium now.**

Your job:
1. Read this entire document first
2. Test the critical path (or get human to test)
3. Fix what's broken (with proof it's fixed)
4. Update this document with truth
5. Mark your changes with date + agent ID

**What NOT to do:**
- ❌ Don't create new "master" documents
- ❌ Don't assume code working = feature working
- ❌ Don't add features before critical path works
- ❌ Don't leave unverified claims in this document
- ❌ Don't skip testing, even for "simple" changes

**Remember the mission:**
This is for the 15-year-old trying to make music. Every decision should serve that human.

---

## 🔑 KEY CONTACTS / LINKS

**Production:**
- Site: https://www.cronkwaters.com
- Vercel Dashboard: https://vercel.com/dashboard
- Google Cloud Console: https://console.cloud.google.com

**Services:**
- Database: Neon PostgreSQL
- Auth: NextAuth v4
- Video: Daily.co
- Chat: Ably
- AI: OpenAI GPT-4 + ElevenLabs

**Support Emails (in app):**
- Legal: legal@cronkwaters.com
- Privacy: privacy@cronkwaters.com
- Support: support@cronkwaters.com

---

**End of The Bible**

**Next Agent: Test the critical path. Document truth. Update this file. Make it work for that 15-year-old musician. 🍄**

