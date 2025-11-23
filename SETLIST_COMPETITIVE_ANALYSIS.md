# 🎸 SETLIST MANAGEMENT - COMPETITIVE DOMINANCE STRATEGY

**Agent 70 - 2025-11-23**  
**Mission:** Analyze competition, identify gaps, build market-leading setlist solution

---

## 🎯 MARKET ANALYSIS

### Competition Overview

| Feature                       | BandHelper        | SetFlow Pro | Setlix      | SimpleSetlist | **CronkWaters**       |
| ----------------------------- | ----------------- | ----------- | ----------- | ------------- | --------------------- |
| **Web-Based**                 | ✅                | ✅          | ✅          | ✅            | ✅                    |
| **Real-Time Collaboration**   | ⚠️ Basic          | ✅          | ⚠️ Basic    | ❌            | ✅ **Superior**       |
| **Drag-Drop Reordering**      | ✅                | ✅          | ✅          | ✅            | ✅                    |
| **Key Change Detection**      | ✅                | ❌          | ❌          | ❌            | ✅                    |
| **Duration Calculator**       | ✅                | ✅          | ⚠️ Basic    | ❌            | ✅                    |
| **Spotify Import**            | ❌                | ❌          | ✅          | ❌            | ❌ **NEEDS**          |
| **Instant Setlist Generator** | ⚠️ Manual         | ✅          | ✅          | ❌            | ❌ **NEEDS**          |
| **Client Setlist Builder**    | ❌                | ⚠️ Basic    | ✅          | ❌            | ❌ **NEEDS**          |
| **Templates Library**         | ⚠️ Limited        | ⚠️ Limited  | ❌          | ❌            | ❌ **NEEDS**          |
| **Show/Venue Management**     | ✅ **Full Suite** | ❌          | ❌          | ❌            | ⚠️ **Partial**        |
| **PDF/Print Export**          | ✅                | ✅          | ✅          | ✅            | ❌ **NEEDS**          |
| **Mobile Performer Mode**     | ✅ Apps           | ⚠️ Web-only | ⚠️ Web-only | ❌            | ❌ **NEEDS**          |
| **Lyrics/Chords On Stage**    | ✅                | ❌          | ❌          | ❌            | ⚠️ **In Songwriting** |
| **Band Communication**        | ✅                | ✅          | ⚠️ Basic    | ❌            | ✅ **Chat**           |
| **Video Collaboration**       | ❌                | ❌          | ❌          | ❌            | ✅ **Daily.co**       |
| **Multi-Cursor Editing**      | ❌                | ⚠️ Basic    | ❌          | ❌            | ✅ **Ably**           |
| **Presence Awareness**        | ❌                | ✅          | ❌          | ❌            | ✅                    |
| **AI-Powered**                | ❌                | ❌          | ❌          | ❌            | ✅ **Potential**      |

---

## 🚀 COMPETITIVE ADVANTAGES (ALREADY BUILT)

### ✅ What We Do Better Than Everyone

1. **Real-Time Collaboration Quality** ⭐⭐⭐⭐⭐
   - **Ably broadcast:** Sub-2s latency for all collaborators
   - **Multi-cursor tracking:** See exactly where bandmates are looking/editing
   - **Presence indicators:** Know who's online, where they are
   - **No one else has this level of integration**

2. **Integrated Ecosystem** ⭐⭐⭐⭐⭐
   - **Songwriting Studio:** Lyrics + chords already in platform
   - **Project Management:** All songs organized by project
   - **Video Collaboration:** Studio-tier users can rehearse setlists via Daily.co
   - **Chat:** Band can discuss setlist changes in real-time
   - **BandHelper is the only competitor with this depth, but we're web-first**

3. **Key Change Detection** ⭐⭐⭐⭐
   - **Automatic alerts:** Yellow badges when key changes between songs
   - **Helps vocalists:** Plan transitions, avoid voice fatigue
   - **Most competitors don't have this**

4. **Modern UX** ⭐⭐⭐⭐⭐
   - **Beautiful UI:** Rock n' Roll Basement design system
   - **Smooth animations:** Framer Motion + 60fps
   - **Drag-drop polish:** @dnd-kit library
   - **Competitors look dated by comparison**

---

## ❌ CRITICAL GAPS (MUST BUILD TO WIN MARKET)

### 🔴 Priority 1: Core Setlist Features (Week 1)

**1. Show/Venue/Tour Integration** ⚠️ **PARTIAL**

- **Status:** Database models exist (Show, Venue, Tour, Setlist, SetlistItem)
- **Gap:** Not wired to setlist page
- **Competitor Strength:** BandHelper excels here
- **What We Need:**
  - Show creation: Date, venue, doors time, soundcheck
  - Venue database: Name, city, capacity, contact info
  - Tour management: Multiple shows, poster image, merch
  - Link setlists to specific shows
  - Calendar view of upcoming shows

**2. Spotify Playlist Import** ❌ **MISSING**

- **Competitor Strength:** Setlix has this
- **User Pain:** Manually typing 15-20 song titles is tedious
- **What We Need:**
  - Spotify OAuth integration
  - Import playlist → auto-create songs in project
  - Match to existing songs by title/artist
  - Quick setlist population

**3. Print/PDF Export** ❌ **MISSING**

- **Competitor Strength:** Everyone has this
- **User Pain:** Need physical setlists for stage/band/crew
- **What We Need:**
  - Professional PDF formatting
  - Multiple layouts: Full detail, compact, lyrics-only
  - Print-optimized (black & white, large fonts)
  - Email/download options

**4. Instant Setlist Generator** ❌ **MISSING**

- **Competitor Strength:** SetFlow Pro, Setlix
- **User Pain:** "I have 50 songs, need a 90-min set, what do I play?"
- **What We Need:**
  - AI-powered suggestions based on:
    - Total duration target
    - Song energy levels (tempo, key)
    - Genre mix
    - Previously played frequency
  - "Shuffle" button for variety
  - Save as template

---

### 🟡 Priority 2: Advanced Features (Week 2)

**5. Setlist Templates Library** ❌ **MISSING**

- **Use Cases:**
  - "Festival Set" (45-60 min, high energy, no slow songs)
  - "Club Tour" (90 min, mix of energy levels)
  - "Acoustic Set" (slower, intimate songs only)
  - "Cover Band Night" (client requests + originals)
- **What We Need:**
  - Pre-built templates with smart filters
  - User-created templates (save custom configurations)
  - One-click apply to new setlist

**6. Client Setlist Builder** ❌ **MISSING**

- **Competitor Strength:** Setlix has "client setlist builder"
- **Use Case:** Wedding bands, cover bands taking requests
- **What We Need:**
  - Public form: Client selects songs from your repertoire
  - Request notes: "Play during dinner," "First dance song"
  - Approval workflow: Accept/reject requests
  - Merge into master setlist

**7. Mobile Performer Mode** ❌ **MISSING**

- **Competitor Strength:** BandHelper has dedicated apps
- **User Pain:** Need setlist on stage, but also lyrics/chords
- **What We Need:**
  - Full-screen mobile view
  - Large, readable fonts
  - Swipe to next song
  - Show current song progress
  - Tap song → view lyrics + chords (from Songwriting Studio)
  - Dark mode for stage lighting

---

### 🟢 Priority 3: Differentiation Features (Week 3+)

**8. AI-Powered Setlist Optimization** ✨ **GAME CHANGER**

- **No competitor has this**
- **What AI Could Do:**
  - Analyze past shows: Which songs got best crowd response?
  - Energy flow optimization: Tempo/key progression analysis
  - Suggest openers/closers based on historical data
  - Vocal fatigue warnings: Too many high keys in a row
  - Venue-specific recommendations: "This venue likes slower songs"

**9. Setlist Analytics Dashboard** ✨ **UNIQUE**

- **Metrics:**
  - Most played songs (last 30/90 days)
  - Average set duration
  - Key signature distribution
  - Tempo patterns
  - Song retirement suggestions: "Haven't played in 6 months"
- **Visualization:** Charts, heatmaps, trends

**10. Crowd Interaction Features** ✨ **BOLD**

- **Live Voting:** Audience scans QR code, votes on next song
- **Request Queue:** Fans submit requests during show
- **Post-Show Engagement:** "Which song was your favorite?"
- **Email Capture:** Build mailing list via setlist sharing

**11. Setlist History & Versions** ⚠️ **PARTIAL**

- **Current:** Can create multiple setlists
- **Gap:** No versioning or comparison
- **What We Need:**
  - Version history: "Setlist v1, v2, v3"
  - Compare versions side-by-side
  - Restore previous version
  - Clone setlist with modifications

**12. Rehearsal Mode** ✨ **UNIQUE**

- **Integration with Video Collab:**
  - Start rehearsal → auto-load setlist
  - Play through songs in order
  - Mark songs as "Rehearsed" or "Needs Work"
  - Timer per song (track actual rehearsal time)
  - Video recording per song (review later)

---

## 🎸 CURRENT STATE ASSESSMENT

### ✅ What's Already Built (Production-Ready)

**Component:** `CollaborativeSetlistBuilder` (495 lines)

- ✅ Drag-drop reordering with @dnd-kit
- ✅ Real-time sync via Ably (song-added, song-removed, songs-reordered)
- ✅ Presence tracking (active collaborators count)
- ✅ Multi-cursor overlay
- ✅ Duration calculator (per song + total)
- ✅ Key change detection (yellow badge)
- ✅ Notes per song (expandable textarea)
- ✅ Position indicators (numbered badges)
- ✅ Song picker sidebar (available songs from project)
- ✅ Sync status indicator (Live/Offline)
- ✅ Beautiful UI (Rock n' Roll Basement design system)

**Database Models:** (Prisma schema already has these)

- ✅ `Tour` - tour management with dates, status, poster
- ✅ `Venue` - venue info with capacity, address, contact
- ✅ `Show` - show details with date, venue, setlist link
- ✅ `Setlist` - setlist linked to show (one-to-one)
- ✅ `SetlistItem` - individual songs in setlist with position, duration, notes

**Page:** `apps/web/app/projects/[slug]/setlists/page.tsx`

- ✅ Setlist list view
- ✅ Create new setlist
- ✅ Edit setlist (loads CollaborativeSetlistBuilder)
- ✅ Empty state with helpful prompts
- ⚠️ **CURRENTLY USING USER_METADATA (TEMPORARY)** - Not wired to database models

---

## 🍄 MYCELIAL PATHWAY ANALYSIS

### Current Flow (Working)

```
User → /projects/[slug]/setlists
  → Create Setlist
    → CollaborativeSetlistBuilder loads
      → Drag-drop songs
        → Ably broadcasts update
          → All collaborators see changes instantly
            → Duration calculated
              → Key changes detected
                → Save to user_metadata (temporary)
```

### Blocked Pathways (Need Wiring)

```
❌ Show Management → Setlist
❌ Venue Database → Show
❌ Tour Planning → Multiple Shows
❌ Spotify Import → Song Population
❌ PDF Export → Print Setlist
❌ Client Builder → Public Form
❌ Analytics → Historical Data
❌ Mobile Mode → Performer View
```

---

## 🎯 WINNING STRATEGY

### How We Beat BandHelper (Current Market Leader)

**BandHelper Strengths:**

- Full band management suite (schedules, contacts, finances)
- Mobile apps (iOS, Android, Mac)
- Mature product (years of development)
- Large feature set

**Our Advantages:**

1. **Web-First:** No app install required, works everywhere
2. **Real-Time Collaboration:** Better than BandHelper's sync
3. **Modern UX:** BandHelper looks dated (early 2010s design)
4. **Integrated Songwriting:** Lyrics + chords in same platform
5. **Video Collaboration:** BandHelper doesn't have this
6. **Faster Onboarding:** Create account → build setlist in 2 minutes

**Our Strategy:**

- **Target:** Bands who value collaboration over admin features
- **Positioning:** "BandHelper for the real-time collaboration era"
- **Marketing:** "Your band doesn't need a filing system, you need a creative tool"

### How We Beat SetFlow/Setlix (Modern Competitors)

**Their Strengths:**

- Modern web design
- Fast onboarding
- Simple UX

**Our Advantages:**

1. **Deeper Integration:** We're not just setlists, we're full songwriting platform
2. **Real-Time Quality:** Ably + multi-cursors beats their sync
3. **Video Collaboration:** Neither has this
4. **AI Potential:** We have OpenRouter integration ready
5. **Better Collaboration:** Presence, chat, video, cursors all together

**Our Strategy:**

- **Target:** Solo artists + bands who want collaboration + songwriting
- **Positioning:** "SetFlow + Songwriting Studio in one"
- **Marketing:** "Write songs, build setlists, rehearse together - all in one place"

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Core Parity (Week 1) - 3-4 days

**Goal:** Match basic features of all competitors

1. **Wire Database Models** (4-6 hours)
   - Create API routes: `/api/shows`, `/api/venues`, `/api/tours`
   - Update setlist page to use real database
   - Implement Show → Setlist → SetlistItem relationships
   - Add venue selector to show creation
   - Link setlists to shows (date, venue, notes)

2. **Spotify Import** (6-8 hours)
   - Add Spotify OAuth to auth.ts
   - Create `/api/spotify/playlists` endpoint
   - Build import modal: Paste playlist URL → fetch songs
   - Auto-match to existing songs in project
   - Create new song entries if no match
   - One-click add all songs to setlist

3. **Print/PDF Export** (4-6 hours)
   - Install `@react-pdf/renderer` or `jspdf`
   - Create PDF template: Song list, durations, keys, notes
   - Multiple layouts: Full detail, compact, stage view
   - "Print Setlist" button → opens print dialog
   - "Download PDF" button → saves file
   - Email option: Send PDF to band members

4. **Instant Setlist Generator** (4-6 hours)
   - Build smart algorithm:
     - Input: Target duration (minutes)
     - Filter: Available songs in project
     - Sort: By energy (tempo analysis), played frequency
     - Build: Randomize with energy flow (high → low → high)
   - "Generate Setlist" button
   - Preview → Accept/Regenerate
   - AI integration (future): Use OpenRouter for smarter suggestions

**Total Estimate: 18-26 hours (3-4 work days)**

---

### Phase 2: Advanced Features (Week 2) - 3-4 days

**Goal:** Differentiate from competitors

5. **Setlist Templates** (4-6 hours)
   - Pre-built templates: Festival, Club, Acoustic, Cover Band
   - Template editor: Duration range, energy level, genre filters
   - User-created templates: Save custom configurations
   - Template library view
   - One-click apply template to new setlist

6. **Client Setlist Builder** (6-8 hours)
   - Public form route: `/setlist-request/[projectSlug]`
   - Client can:
     - Browse available songs (public only)
     - Select songs + add notes ("Play during dinner")
     - Submit request (email notification to band)
   - Band owner reviews:
     - Accept/reject requests
     - Merge accepted songs into setlist
   - Optional: Client can see final setlist

7. **Mobile Performer Mode** (6-8 hours)
   - Responsive design optimization for mobile
   - Full-screen mode: Hide nav, maximize setlist
   - Large touch targets (easy to tap on stage)
   - Swipe gesture: Next/previous song
   - Current song highlight: Bold, different color
   - Tap song → view lyrics + chords (link to Songwriting Studio)
   - Dark mode toggle (stage lighting)

**Total Estimate: 16-22 hours (3-4 work days)**

---

### Phase 3: Differentiation (Week 3+) - 5-7 days

**Goal:** Features no competitor has

8. **AI-Powered Optimization** (8-12 hours)
   - Integrate OpenRouter API
   - Prompt engineering:
     - "Analyze these 50 songs, suggest a 90-minute setlist"
     - "Optimize energy flow: start high, dip middle, end high"
     - "Detect vocal fatigue risks: too many high keys"
   - AI suggestions panel:
     - "Recommended opener: [Song X] (high energy, crowd favorite)"
     - "Warning: 3 songs in a row in key of E (consider variety)"
   - User can accept/ignore suggestions

9. **Setlist Analytics** (6-8 hours)
   - Track every setlist performance (date, venue, songs played)
   - Build dashboard:
     - Most played songs (chart)
     - Song retirement suggestions: "Haven't played in 6 months"
     - Average set duration
     - Key signature distribution (pie chart)
     - Tempo heatmap
   - Export analytics: CSV for band analysis

10. **Crowd Interaction** (8-10 hours)
    - QR code generation: Links to `/show/[showId]/live`
    - Public live page:
      - Current setlist (read-only)
      - Song request form
      - Live voting: "Vote for next song" (Studio tier only)
    - Band dashboard:
      - See requests in real-time
      - Accept request → adds to setlist
    - Post-show:
      - "Rate your favorite song" survey
      - Email capture: "Get notified of next show"

11. **Rehearsal Mode** (6-8 hours)
    - "Start Rehearsal" button on setlist page
    - Loads video collaboration room (Daily.co)
    - Auto-advances through setlist:
      - Song 1 → timer starts
      - "Mark Complete" → next song
    - Track rehearsal time per song
    - Save notes: "Needs work on bridge"
    - Recording option: Save video per song

**Total Estimate: 28-38 hours (5-7 work days)**

---

## 🚨 BRUTAL TRUTH - CURRENT STATUS

### Strengths (What Works Today)

- ✅ **Real-time collaboration:** Best in class
- ✅ **User experience:** Beautiful, modern, smooth
- ✅ **Integration:** Songwriting + Projects + Setlists unified
- ✅ **Database foundation:** All models exist, just need wiring
- ✅ **Technical stack:** Ably, Prisma, Next.js - rock solid

### Weaknesses (What's Missing)

- ❌ **Show/Venue/Tour management:** Not wired to UI
- ❌ **Spotify import:** Competitors have this, we don't
- ❌ **PDF export:** Industry standard, we lack it
- ❌ **Mobile performer view:** Competitors have dedicated apps
- ❌ **AI features:** Not leveraging our OpenRouter integration

### Competitive Position

- **Currently:** Mid-tier (good collaboration, missing key features)
- **After Phase 1:** Top-tier (parity with best competitors)
- **After Phase 2:** Market leader (better collaboration + advanced features)
- **After Phase 3:** Uncontested #1 (AI + analytics + unique features)

---

## 🎯 GO-TO-MARKET POSITIONING

### Primary Message

**"The only setlist manager built for real-time collaboration"**

### Secondary Messages

- "Write songs, build setlists, rehearse together - all in one platform"
- "BandHelper for the modern era - web-first, real-time, beautiful"
- "See your bandmates edit the setlist in real-time, like Google Docs for musicians"

### Target Audiences

**1. Cover Bands (Highest Priority)**

- **Pain:** Managing 100+ song repertoire, client requests, frequent setlist changes
- **Our Solution:** Client setlist builder, templates, Spotify import, instant generator
- **Marketing Channel:** Facebook groups, wedding band forums

**2. Original Bands (Medium Priority)**

- **Pain:** Collaborating on setlist order, remembering key changes, printing for stage
- **Our Solution:** Real-time collaboration, key change detection, PDF export
- **Marketing Channel:** Reddit r/bandmembers, music subreddits

**3. Solo Artists (Lower Priority - but easy wins)**

- **Pain:** Simple setlist creation for gigs
- **Our Solution:** Fast onboarding, mobile performer mode, PDF export
- **Marketing Channel:** Instagram, TikTok (solo musician hashtags)

---

## 📈 SUCCESS METRICS

### Phase 1 Success (Core Parity)

- ✅ 100% feature parity with SimpleSetlist
- ✅ 80% feature parity with SetFlow
- ✅ Spotify import working (fastest way to populate setlist)
- ✅ PDF export working (print-ready setlists)
- ✅ Show/Venue management functional

### Phase 2 Success (Advanced)

- ✅ Templates library (5+ pre-built templates)
- ✅ Client setlist builder (unique feature vs competitors)
- ✅ Mobile performer mode (replace BandHelper apps)

### Phase 3 Success (Market Leader)

- ✅ AI setlist optimization (no competitor has this)
- ✅ Analytics dashboard (unique insights)
- ✅ Crowd interaction (live voting, requests)

### User Adoption Metrics

- **Week 1-2:** 10+ test users trying setlist features
- **Month 1:** 50+ active setlists created
- **Month 3:** 200+ setlists, 5+ bands using regularly
- **Month 6:** 1000+ setlists, featured in music blogs

---

## 🍄 MYCELIAL INTEGRATION COMPLETE

**Setlist Management Lives Within Entire Network:**

```
Songwriting Studio → Creates songs with keys, tempos, lyrics
                        ↓
Projects → Organizes songs by album/project
              ↓
Setlists → Arranges songs for live performance
              ↓
Show Management → Links setlist to venue, date, tour
                      ↓
Rehearsal Mode → Practice setlist via video collaboration
                    ↓
Mobile Performer → View setlist on stage with lyrics/chords
                      ↓
Analytics → Track which songs perform best
               ↓
FEEDBACK LOOP → Optimize future setlists with AI
```

**Every feature supports every other feature. No silos. Pure mycelial flow.**

---

**END COMPETITIVE ANALYSIS**

**Next Agent:** Pick up Phase 1 tasks and start building. Database models exist, just wire them up.

**Priority Order:**

1. Show/Venue/Tour API routes + database wiring
2. Spotify import (biggest user pain point)
3. PDF export (industry standard)
4. Instant setlist generator (differentiation)

**Estimated Time to Market Leader:** 2-3 weeks of focused development

🎸 **Let's dominate this market.** 🍄
