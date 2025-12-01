# CronkWaters Platform Knowledge Base

**For AI Assistant:** This document contains comprehensive platform knowledge for providing expert guidance to users.

**Last Updated:** December 2025

---

## 🎵 PLATFORM OVERVIEW

CronkWaters (aka "Rock N' Roll Basement") is a comprehensive music collaboration and business management platform for musicians, bands, studios, and solo artists. It's designed as a complete "workshop" for musicians - everything in one place.

### Core Capabilities:

- **Create:** Songwriting tools with AI assistance, Sketches for quick ideas, Labs for experimentation
- **Connect:** Real-time collaboration (video, chat, presence), messaging, collaboration matching
- **Perform:** Tour management, Smart Setlists, Shows Calendar, Live Streaming
- **Grow:** Website Builder, Masterclasses, Social Feed, Community Discovery
- **Earn:** Marketplace, Opportunities (gigs/jobs), Revenue tracking, Affiliate program

### Tech Stack:

- Next.js 15, tRPC, Prisma, Supabase Auth, Neon PostgreSQL
- Ably for real-time features
- Anthropic Claude / OpenAI for AI features
- Stripe for payments

**Live Site:** https://www.cronkwaters.com

---

## 🗺️ NAVIGATION & KEY PAGES

### Primary Navigation (Organized by Category)

#### 🏠 HOME

1. **Dashboard** (`/dashboard`)
   - Overview of all activity with quick actions
   - Today's Spark - daily creative challenge
   - Quick access grid: Songs, Meet, Go Live, Classes, Studio, Shows, My Site, Connect, Library, Toolbox, Tours, Settings
   - Usage stats and subscription info

#### ✨ CREATE

2. **Songwriting** (`/songwriting`)
   - **Structure Tab:** Define song sections (verse, chorus, bridge)
   - **Chords Tab:** Add chord progressions with AI suggestions
   - **Lyrics Tab:** Write lyrics with rhyme assistance
   - **Copyright Tab:** Register splits with collaborators
   - **Save to Project:** Link songs to albums/projects
   - **Import from Library:** Use existing audio files

3. **Sketches** (`/create`) - BETA
   - Quick idea capture
   - Voice memos
   - Rough chord progressions
   - Ideas that aren't full songs yet

4. **Projects** (`/projects`)
   - Album/EP/Single organization
   - Milestones & deadlines
   - Collaborator management
   - Version history

5. **Labs** (`/labs`) - NEW
   - Experimental features playground
   - **Contribute:** Help build new features
   - **Experiment:** Try unreleased tools
   - **Research:** Access research papers and findings
   - **Volunteer:** Community beta testing

#### 📈 GROW

6. **My Site** (`/sites`) - Website Builder
   - Create professional artist website in minutes
   - Custom domain support
   - Themes and templates
   - Bio, music player, tour dates, merch links
   - Edit mode with live preview

7. **Masterclasses** (`/masterclasses`)
   - Full learning platform
   - Watch video lessons from industry pros
   - **Become an Instructor:** Create and sell courses
   - **Live Classes:** Real-time instruction
   - **Certificates:** Completion certificates
   - **Analytics:** Track your learning progress

8. **Social Feed** (`/feed`)
   - Community posts and updates
   - Tag-based discovery
   - Like, comment, share
   - **Explore:** Discover trending content
   - Follow other musicians

#### 🤝 CONNECT

9. **Meet** (`/meet`) - Video Meetings
   - HD video calls (up to 50 people)
   - Screen sharing for DAW walkthroughs
   - Meeting analytics
   - Shareable meeting links
   - Real-time cursor collaboration

10. **Messages** (`/messages`)
    - Direct messaging system
    - Thread conversations
    - File sharing

11. **Collaboration Needs** (`/collaboration-needs`)
    - Post what you're looking for (vocalist, producer, etc.)
    - Browse musician profiles
    - Find collaborators by skill/genre/location

12. **Discover** (`/discover` & `/explore`)
    - Community track discovery
    - Browse published music
    - Like, comment, follow artists
    - Search by genre, mood, etc.

#### 🎤 PERFORM

13. **Tours** (`/tours`)
    - Tour scheduling & planning
    - Show management
    - Setlist creation
    - Venue information
    - Travel logistics

14. **Shows Calendar** (`/shows/calendar`)
    - Calendar view of all shows
    - **Today's Shows:** Quick view of what's happening today
    - Drag-and-drop scheduling

15. **Smart Setlists** (`/setlists`)
    - AI-powered setlist builder
    - Energy flow optimization
    - Key/tempo transitions
    - Templates for different venues
    - Drag-and-drop song ordering
    - Print setlists as PDF

16. **Live Streaming** (`/live`)
    - **Go Live:** Stream to fans
    - Stream setup wizard
    - **Analytics:** View stream performance
    - Monetization options

#### 💰 EARN

17. **Opportunities** (`/opportunities`)
    - Gig postings and job board
    - Post opportunities: hiring musicians, session work, gigs
    - Apply to opportunities
    - Track applications

18. **Marketplace** (`/marketplace`)
    - Buy and sell: beats, samples, stems, services
    - Create listings with pricing
    - Secure transactions via Stripe
    - Browse by category

19. **Revenue** (`/revenue`)
    - Track income from all sources
    - Streaming royalties
    - Gig payments
    - Merchandise sales
    - Licensing income

20. **Affiliate Program** (`/affiliate`)
    - Refer musicians, earn credits
    - Custom referral links
    - Track conversions
    - **Stream Setup:** Affiliate streaming configuration

#### 🛠️ TOOLS & RESOURCES

21. **Library** (`/library`)
    - Personal audio file storage
    - Organize demos, stems, mixes, masters
    - Publish tracks to community
    - File type support: WAV, MP3, FLAC, M4A
    - Preview and download capabilities

22. **Studio** (`/studio`)
    - Real-time collaboration workspace
    - Recording guide for best practices
    - Multi-track mixing
    - Presence indicators

23. **Toolbox** (`/tools`)
    - Musicians toolkit
    - Tuner, metronome, chord charts
    - Quick reference tools

24. **Credits** (`/credits`)
    - Platform credit balance
    - Purchase credits
    - Credit history
    - Use credits for premium features

25. **Settings** (`/settings`)
    - Profile management
    - Subscription & billing
    - Usage dashboard (`/settings/usage`)
    - Account preferences
    - Notifications

---

## 💎 SUBSCRIPTION TIERS

### Free Tier ($0/month)

✅ 3 projects to experiment with
✅ 1 GB cloud storage
✅ Invite 1 collaborator per project
✅ Real-time collaboration
✅ Core songwriting tools
✅ Community support
✅ 10 AI Assistant conversations/month (teaser)
❌ Limited AI features
❌ No video collaboration

**Use case:** Trying out the platform, casual users, learning features

---

### Creator Tier ($15/month)

✅ 10 projects — room to grow
✅ 10 GB storage for your catalog
✅ 5 collaborators per project
✅ 100 AI songwriting assists/month
✅ AI chord & lyric suggestions
✅ Smart tour routing
✅ Copyright split sheets (PDF generation)
✅ Community publishing
✅ Version control (Git for music)
✅ 100 AI Assistant conversations/month
✅ Priority support
❌ No video collaboration

**Use case:** Solo musicians, independent songwriters

---

### Studio Tier ($35/month)

✅ UNLIMITED projects
✅ 100 GB storage
✅ Unlimited collaborators
✅ 500 AI assists/month (5× Creator)
✅ All AI tools unlocked
✅ 20 hours HD video calls/month (up to 50 people)
✅ Screen sharing & recording
✅ Real-time collaboration (multi-cursor, presence)
✅ UNLIMITED AI Assistant conversations
✅ Advanced analytics
✅ Dedicated support

**Use case:** Bands, studios, professional teams

---

### Trial Information

- All paid plans include a **7-day free trial**
- No credit card required to start
- Cancel anytime — your music stays yours

---

## 🎨 KEY FEATURES EXPLAINED

### Songwriting Tool

**Purpose:** AI-powered songwriting assistance for structure, chords, lyrics, and copyright

**How to Access:**

1. Click "Songwriting" in sidebar
2. Or from Dashboard → "Start Writing"
3. Or from any Project → "Add Song"

**Four Main Tabs:**

1. **Structure Tab**
   - Define song sections (Intro, Verse, Chorus, Bridge, Outro)
   - Set BPM and key
   - Arrange section order
   - View total song length

2. **Chords Tab**
   - Add chord progressions per section
   - AI suggestions based on key and style
   - Chord diagram display
   - Export as chord chart

3. **Lyrics Tab**
   - Write lyrics with rhyme suggestions
   - Syllable counting
   - AI lyric generation
   - Line-by-line feedback

4. **Copyright Tab**
   - Add collaborators (by email or username)
   - Define split percentages
   - Generate PDF split sheet
   - Track publishing rights

**Tips for Users:**

- Start with Structure to plan your song flow
- Use AI suggestions but trust your creative judgment
- Save to a Project to keep organized
- Register copyright splits EARLY to avoid disputes

---

### Real-Time Collaboration

**Purpose:** Work together on music projects simultaneously with video, voice, and shared editing

**Requirements:** Studio tier subscription

**Features:**

- **Multi-cursor editing:** See collaborators' cursors in real-time
- **Presence indicators:** Green dot = online, working
- **Video calls:** Up to 20 hours/month HD quality
- **Chat integration:** Message while working
- **Conflict resolution:** Auto-merge or manual resolution

**How to Start:**

1. Open a Project or Song
2. Click "Collaborate" button
3. Invite team members (email or username)
4. Start video call (optional)
5. Edit simultaneously

**Best Practices:**

- Communicate changes before making them
- Use comments to suggest edits, don't just change
- Stay on video for complex sessions
- Save versions before major changes

---

### Copyright & Split Sheets

**Purpose:** Legal documentation of song ownership and royalty splits

**Why This Matters:**

- Prevents disputes about who owns what
- Required for royalty distribution
- Legal protection for your work
- Professional standard practice

**How to Create:**

1. Go to Songwriting → Copyright tab
2. Add collaborators:
   - By email (they don't need an account)
   - By CronkWaters username
3. Assign percentages (must total 100%)
4. Define roles:
   - Lyricist
   - Composer
   - Producer
   - Performer
5. Generate PDF
6. Send for signatures

**Common Split Examples:**

- Solo songwriter: 100% writer's share
- Co-writing 50/50: Each gets 50%
- Writer + Producer: 60% writer, 40% producer
- Band (4 members): 25% each (or negotiated)

---

### Tour Management

**Purpose:** Plan, schedule, and manage live performances

**Features:**

- Tour creation (name, dates, locations)
- Show scheduling (venue, time, setlist)
- Setlist builder (drag-and-drop songs)
- Setlist templates (reuse common sets)
- Venue database (save locations, contacts)
- Fan song requests (collect & review)

**Workflow:**

1. **Create Tour:** Tours → "New Tour"
2. **Add Shows:** Click tour → "Add Show"
3. **Create Setlist:** Show → "Build Setlist"
4. **Reuse Template:** Or start from template
5. **Manage Requests:** Review fan song requests
6. **Track Performance:** Mark songs as played

**Pro Tips:**

- Create setlist templates for different types of shows
- Print setlists as PDF for band members
- Use song requests to engage fans
- Track which songs get best response

---

### Version Control

**Purpose:** Git-like versioning for music projects and songs

**Why Use It:**

- Experiment without fear of losing work
- Roll back to previous versions
- Compare different mixes/arrangements
- Collaborate with confidence

**How It Works:**

1. Each save creates a new version
2. View version history in Project view
3. Compare versions side-by-side
4. Restore previous versions anytime
5. Branch for experimental work

**Best Practices:**

- Save version before major changes
- Add meaningful commit messages
- Create branch for risky experiments
- Merge successful experiments back

---

### Community Publishing

**Purpose:** Share your music with the CronkWaters community

**How to Publish:**

1. Go to Library
2. Select a track
3. Click "Publish to Community"
4. Add metadata:
   - Title, artist, genre
   - Description
   - Cover art
   - Tags
5. Set visibility (public/unlisted)
6. Publish!

**What Happens:**

- Track appears in Explorer
- Users can:
  - Listen (streaming)
  - Like & comment
  - Follow you
  - Add to playlists
- You get analytics:
  - Play counts
  - Likes
  - Comments
  - Geographic data

**Privacy:**

- You control what you publish
- Can unpublish anytime
- Unpublished = removed from Explorer
- Your files are always private by default

---

### Marketplace

**Purpose:** Buy and sell music services, beats, samples, and more

**How to Use:**

1. Go to Marketplace (`/marketplace`)
2. **Browse:** Search by category, price, genre
3. **Buy:** Secure checkout via Stripe
4. **Sell:** Create listings with:
   - Title, description, price
   - Category (beats, samples, mixing services, etc.)
   - Preview audio
   - License type

**Categories:**

- Beats & Instrumentals
- Sample packs
- Mixing & mastering services
- Session musician services
- Songwriting collaboration
- Production templates

---

### Masterclasses

**Purpose:** Learn from industry professionals and teach others

**For Students:**

1. Browse masterclasses by topic/instructor
2. Watch video lessons
3. Complete assignments
4. Earn certificates
5. Join live sessions

**For Instructors:**

1. Apply at `/masterclasses/become-instructor`
2. Create course content
3. Set pricing
4. Track student progress via analytics
5. Host live sessions

**Topics include:** Songwriting, Production, Mixing, Business, Performance, Marketing

---

### Website Builder

**Purpose:** Create a professional artist website in minutes

**How to Use:**

1. Go to Sites (`/sites`)
2. Choose a template
3. Add your content:
   - Bio and story
   - Music player (from Library)
   - Tour dates
   - Merch links
   - Social links
   - Contact form
4. Preview your site
5. Publish!

**Features:**

- Mobile-responsive designs
- Custom domains (coming soon)
- SEO optimized
- Analytics integration
- Connect to your Library

---

### Live Streaming

**Purpose:** Stream live to fans for performances, Q&As, or studio sessions

**How to Go Live:**

1. Go to Live (`/live`)
2. Click "Go Live"
3. Configure your stream:
   - Title and description
   - Camera/audio settings
   - Monetization (tips, tickets)
4. Start streaming!

**Features:**

- HD video quality
- Real-time chat with viewers
- Stream analytics
- Recording option
- Monetization tools

---

### Opportunities

**Purpose:** Find gigs, session work, and collaborations

**Post an Opportunity:**

1. Go to Opportunities (`/opportunities`)
2. Click "Post Opportunity"
3. Fill in details:
   - Type (gig, session, collaboration)
   - Description and requirements
   - Pay/compensation
   - Location/remote
4. Review applications

**Apply to Opportunities:**

1. Browse available opportunities
2. Filter by type, location, genre
3. Click "Apply"
4. Submit your portfolio/demo
5. Track application status

---

### Smart Setlists

**Purpose:** Build optimized setlists for your shows

**How to Use:**

1. Go to Setlists (`/setlists`)
2. Create new setlist or use template
3. Add songs from your catalog
4. AI suggestions for:
   - Energy flow (start high, build, peak, cool down)
   - Key transitions (avoid jarring changes)
   - Tempo flow
   - Audience engagement moments
5. Drag-and-drop to reorder
6. Print as PDF for band members

**Templates:**

- 45-minute club set
- 90-minute headline show
- Acoustic intimate set
- Festival set (high energy)

---

### Social Feed

**Purpose:** Connect with the community through posts and updates

**Features:**

- Post updates, photos, videos
- Tag content (#newmusic, #studio, etc.)
- Like and comment on posts
- Follow other musicians
- Explore trending content
- Discover new artists

**How to Use:**

1. Go to Feed (`/feed`)
2. Create a post with text/media
3. Add tags for discoverability
4. Interact with others' posts
5. Build your network

---

### AI Assistant (This!)

**Purpose:** Your godlike helper that knows everything about your creative world

**What I Know:**

- All your songs (titles, lyrics, chords, keys, tempos)
- All your projects and their status
- All your tours and upcoming shows
- Your library files
- Your collaborators
- Your subscription and usage
- What page you're currently on
- Your past conversations and preferences

**What I Can Do:**

- Answer questions about your music
- Help with songwriting (lyrics, chords, rhymes)
- Suggest what to work on next
- Navigate you to any feature
- Generate content (press releases, social posts)
- Analyze your musical patterns
- Help plan setlists and tours
- Draft messages to collaborators

**Quick Actions:**

- Create a song
- Build setlist
- Find collaborators
- Check usage/subscription

---

## 🚀 GETTING STARTED GUIDES

### For First-Time Users

**Day 1: Setup & Exploration**

1. Complete profile (Settings → Profile)
2. Upload profile photo
3. Explore the dashboard
4. Try the Songwriting tool (no project needed)
5. Browse Explorer to see what's possible

**Week 1: Create Your First Project**

1. Projects → "New Project"
2. Choose type (Album, EP, Single)
3. Add project details
4. Create your first song in the project
5. Upload a demo to Library

**Week 2: Invite Collaborators**

1. Add collaborators to your project
2. Try real-time editing
3. Create your first split sheet
4. Publish a track to community

**Month 1: Advanced Features**

1. Start a tour (if applicable)
2. Use AI songwriting assistance
3. Create setlists
4. Explore version history
5. Optimize workflow

---

### For Solo Musicians

**Best Features for You:**

- Songwriting tool (all tabs)
- AI assistance (100-500/month)
- Copyright registration
- Community publishing
- Tour management (if you perform)

**Recommended Tier:** Creator ($9.99)
**Upgrade to Studio if:** You collaborate frequently or need video

**Workflow:**

1. Write → Songwriting tool
2. Record → Upload to Library
3. Register → Copyright splits (even if solo, for records)
4. Publish → Share with community
5. Perform → Use Tours for live shows

---

### For Bands & Teams

**Best Features for You:**

- Real-time collaboration
- Video calls
- Project management
- Version control
- Split sheet automation

**Recommended Tier:** Studio ($29.99)

**Workflow:**

1. Create Project → Invite all members
2. Assign roles → Admin, member, contributor
3. Collaborate → Write songs together
4. Track versions → Never lose work
5. Split ownership → Document contributions
6. Plan tours → Setlists and logistics

---

## ⚡ COMMON QUESTIONS & ANSWERS

### "How do I create a new song?"

**Two ways:**

**Option 1: Quick Start**

1. Click "Songwriting" in sidebar
2. Start writing in any tab
3. Save when ready
4. Optionally add to a project later

**Option 2: From a Project**

1. Go to Projects
2. Open a project (or create one)
3. Click "Add Song"
4. Song is automatically linked to project
5. Start writing

**Pro tip:** Creating from a project keeps you organized!

---

### "What's the difference between Library and Projects?"

**Library:**

- Personal file storage (like Dropbox)
- Raw audio files: demos, stems, masters
- Not organized by project/album
- Quick upload/download
- Can publish individual tracks

**Projects:**

- Organized collections (albums, EPs, singles)
- Contains songs + metadata + collaborators
- Structured workflow
- Version history
- Project-level management (deadlines, milestones)

**Think of it this way:**

- Library = Your hard drive
- Projects = Your album releases

---

### "How do I upgrade my subscription?"

1. Go to Settings → Subscription
2. Click "Upgrade" button
3. Choose Creator or Studio
4. Enter payment details (Stripe)
5. Confirm upgrade

**Changes take effect immediately.**

Your usage quotas reset and expand:

- Storage increases
- AI assists increase
- Video minutes available (Studio)

---

### "I'm at my AI quota limit. What now?"

**You have 3 options:**

**Option 1: Wait for Reset**

- Quotas reset monthly
- Check reset date: Settings → Usage
- Shows "Resets in X days"

**Option 2: Upgrade Tier**

- Free → Creator: Get 100/month
- Creator → Studio: Get 500/month (5×)

**Option 3: Use Non-AI Features**

- Songwriting still works (manual entry)
- Upload files to Library
- Collaborate with team
- Manage projects & tours

**Pro tip:** Plan your AI usage throughout the month!

---

### "My upload failed. Why?"

**Common reasons:**

**1. File too large**

- Free: 50 MB limit
- Creator: 100 MB limit
- Studio: 500 MB limit
- **Solution:** Compress file or upgrade

**2. Storage quota exceeded**

- Check Settings → Usage → Storage
- **Solution:** Delete old files or upgrade

**3. Unsupported format**

- Supported: WAV, MP3, FLAC, M4A, OGG
- **Solution:** Convert to supported format

**4. Network timeout**

- Large files on slow connection
- **Solution:** Try again, use WiFi

**See your current storage:** Settings → Usage

---

### "How do I collaborate with someone without an account?"

**For Copyright Splits:**

1. Songwriting → Copyright tab
2. Add collaborator by email (any email)
3. They'll receive PDF by email
4. Can sign electronically

**For Projects (requires account):**

1. Projects → Invite by email
2. They'll receive invitation
3. Must create account to join
4. Free accounts can be collaborators!

**Note:** Real-time collaboration requires Studio tier (for video/presence).

---

### "Can I use CronkWaters offline?"

**No - CronkWaters requires internet connection.**

**Why:**

- Real-time collaboration
- Cloud storage
- AI features require API calls
- Auto-save prevents data loss

**Workaround:**

- Download files from Library
- Work locally in your DAW
- Upload when back online

---

### "How do I export my work?"

**Songs:**

- Songwriting → Export as PDF (lyrics & chords)
- Songwriting → Export chord chart
- Copyright tab → Export split sheet PDF

**Audio Files:**

- Library → Click file → Download
- Original quality preserved

**Projects:**

- Projects → Click project → "Export Project"
- Downloads all songs, audio, documents as ZIP

**Your data is never locked in!**

---

## 🐛 TROUBLESHOOTING

### "Songwriting page won't load"

**Try these steps:**

1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (PC)
2. Clear browser cache
3. Try incognito/private window
4. Check subscription status (Settings → Subscription)
5. Contact support if persists

---

### "Video call won't connect"

**Requirements:**

- Studio tier subscription
- Under 20 hours/month used
- Camera/microphone permissions
- Modern browser (Chrome, Firefox, Safari, Edge)

**Troubleshooting:**

1. Check permissions: Browser → Settings → Permissions
2. Check quota: Settings → Usage → Video Minutes
3. Try different browser
4. Restart browser
5. Check firewall/VPN settings

---

### "Can't hear audio playback"

**Check:**

1. Browser volume (not muted)
2. System volume
3. Correct output device selected
4. File format supported
5. File not corrupted (re-upload)

**Still not working?**

- Try different browser
- Download file and play locally
- Contact support with file details

---

### "Changes not saving"

**Possible causes:**

1. Lost internet connection
2. Session expired (re-login)
3. Browser blocking cookies
4. Storage quota exceeded

**Solutions:**

1. Check internet connection
2. Refresh page (will prompt to re-login if needed)
3. Enable cookies for cronkwaters.com
4. Check storage: Settings → Usage

**Auto-save:** Most areas auto-save every 30 seconds.

---

## 📊 USAGE LIMITS & QUOTAS

### Understanding Your Limits

**All limits reset monthly** from your subscription start date.

**Check current usage:** Settings → Usage

| Resource      | Free  | Creator | Studio    |
| ------------- | ----- | ------- | --------- |
| Projects      | 1     | 10      | Unlimited |
| Storage       | 1 GB  | 10 GB   | 100 GB    |
| File Size     | 50 MB | 100 MB  | 500 MB    |
| AI Assists    | 0     | 100/mo  | 500/mo    |
| Video Minutes | 0     | 0       | 1200/mo   |

**What counts as an "AI Assist":**

- Chord suggestion: 1 request
- Lyric generation: 1 request
- Rhyme suggestions: 1 request
- Song structure help: 1 request
- Transcription: 2 requests (more compute)

**What counts as "Video Minutes":**

- Time in video call (per participant)
- Billed per minute, rounded up
- Only Studio tier has access

---

## 🎯 BEST PRACTICES

### For Organizing Projects

1. **One project per release**
   - Album = 1 project
   - EP = 1 project
   - Single = 1 project (or group singles)

2. **Use consistent naming**
   - "Project Name - YYYY"
   - Example: "Summer Dreams Album - 2025"

3. **Set milestones early**
   - Writing deadline
   - Recording sessions
   - Mixing/mastering
   - Release date

4. **Invite collaborators at start**
   - Don't wait until you need them
   - Give proper access level
   - Set expectations

---

### For Effective Collaboration

1. **Communicate changes**
   - Don't surprise collaborators
   - Use comments liberally
   - Jump on video for complex discussions

2. **Save versions before major edits**
   - Easy rollback if needed
   - Track who changed what
   - Experiment safely

3. **Use proper split sheets**
   - Document contributions early
   - Agree on percentages upfront
   - Get signatures before release

4. **Respect video minutes**
   - Studio tier has 20 hours/month
   - ~40 minutes per business day
   - Use wisely for important sessions

---

### For Managing Costs

1. **Monitor usage dashboard**
   - Settings → Usage
   - Watch for 80%+ warnings
   - Plan upgrades in advance

2. **Optimize AI usage**
   - Use suggestions, don't regenerate constantly
   - Manual entry works too!
   - Save AI for challenging parts

3. **Manage storage**
   - Delete old demos when done
   - Archive finished projects elsewhere
   - Use appropriate file formats

4. **Annual subscriptions**
   - Save 2 months (when available)
   - Better for committed users
   - Can still cancel anytime

---

## 🔐 PRIVACY & SECURITY

### Your Data

**What we store:**

- Account info (email, name, profile)
- Projects, songs, audio files
- Collaboration history
- Usage statistics
- Payment info (via Stripe, not on our servers)

**What we DON'T do:**

- Sell your data
- Share your music without permission
- Mine your content for AI training
- Access your files without legal requirement

**Your rights:**

- Export all data anytime
- Delete account + all data
- Control what's public vs private
- Revoke collaborator access

---

### Security Features

- **Encryption:** All data encrypted at rest & in transit
- **2FA:** Enable in Settings → Security (recommended)
- **Session management:** See active sessions, revoke access
- **Collaboration controls:** Invite-only, not public by default
- **Backup:** Automatic daily backups
- **Compliance:** SOC 2 Type II compliant

---

## 📞 GETTING HELP

### Support Channels

1. **AI Assistant** (this!)
   - Available 24/7
   - Instant answers
   - Context-aware help

2. **Documentation**
   - Help Center: cronkwaters.com/help
   - Setup Guides: /docs/setup-guides
   - Video tutorials: YouTube channel

3. **Email Support**
   - support@cronkwaters.com
   - Response time: <24 hours (free/creator), <4 hours (studio)

4. **Community Forum**
   - Ask other users
   - Share tips & tricks
   - Feature requests

5. **Live Chat** (Studio tier)
   - Priority support
   - Real-time assistance
   - Screen sharing available

---

## 🎓 TIPS FOR SUCCESS

### For Songwriters

1. **Start with structure** - Plan before you write
2. **Use AI as inspiration** - Not as replacement
3. **Register copyrights early** - Protect your work
4. **Save versions frequently** - Experiment safely
5. **Collaborate with purpose** - Right people, right time

### For Bands

1. **Set clear roles** - Who does what
2. **Document splits** - Avoid future disputes
3. **Use video for complex** - Text for simple
4. **Plan sessions** - Don't waste video minutes
5. **Version everything** - Track all changes

### For Solo Artists

1. **Stay organized** - Projects, not just Library
2. **Build community** - Publish & engage
3. **Plan tours early** - Even if small
4. **Network** - Collaborate with others
5. **Use analytics** - Learn what works

---

## 🔄 PLATFORM UPDATES

**CronkWaters is continuously improving!**

**Recent Updates (December 2025):**

- **Marketplace:** Buy/sell beats, samples, services
- **Labs:** Experimental features playground (contribute, experiment, research)
- **Social Feed:** Community posts, tags, exploration
- **Masterclasses:** Full learning platform with certificates
- **Live Streaming:** Go live and connect with fans
- **Opportunities:** Gig and job board
- **Website Builder:** Create artist sites in 60 seconds
- **Smart Setlists:** AI-powered setlist building with energy flow
- **Shows Calendar:** Calendar view with today's shows
- **Meet:** HD video meetings with analytics
- **Collaboration Needs:** Find the right collaborators
- **Revenue Tracking:** Track income from all sources
- **Credits System:** Platform currency for premium features
- **Affiliate Program:** Refer and earn
- **AI Assistant:** Godlike knowledge of your entire creative world
- **Profile Setup:** Beautiful multi-step onboarding

**Coming Soon:**

- Annual subscription option (save 2 months)
- Mobile apps (iOS & Android)
- API access (Studio tier)
- Advanced DAW integration
- More AI tools

**Stay updated:**

- Release notes: cronkwaters.com/changelog
- Email newsletter (opt-in in Settings)
- Follow @cronkwaters on social media

---

## 📖 GLOSSARY

**AI Assist:** AI-powered feature (chord suggestions, lyrics, etc.)
**Collaborator:** User invited to work on a project
**DAW:** Digital Audio Workstation (mixing software)
**Split Sheet:** Legal document defining song ownership percentages
**Stems:** Individual audio tracks (vocals, drums, bass, etc.)
**Tier:** Subscription level (Free, Creator, Studio)
**Project:** Collection of songs for an album/EP/single
**Library:** Personal file storage for audio files
**Explorer:** Community discovery page
**Quota:** Usage limit (resets monthly)
**Real-time:** Simultaneous editing/collaboration
**Version:** Saved state of a song/project (like Git commit)
**Setlist:** Ordered list of songs for a show
**Tour:** Collection of shows/performances
**Presence:** Indicator showing who's online/active
**Multi-cursor:** See collaborators' cursors in real-time

---

**END OF PLATFORM KNOWLEDGE BASE**

This document is regularly updated to reflect platform changes and new features.
