# USER JOURNEY TEST - First-Time Human Experience

## 🚇 TOKYO SUBWAY PRINCIPLE: Clear Signs, One Obvious Path, No Confusion

**Testing As:** New user, never seen this before, wants to write a song with a bandmate

---

## JOURNEY START: DASHBOARD

**I land on:** `cronkwaters.com/dashboard`

**What I see:**
```
WELCOME BACK, JUSTIN
Your Creative Command Center

[My Songs] [New Project] [Recording Studio] [Tours & Shows] [Messaging] [My Projects]

Quick Actions:
Stats: 0 Projects, 0 Songs, 0 Collaborators, 0 Sessions
```

**Is it clear what to do?**
- ✅ YES - "New Project" card is obvious
- ✅ Card says "Create a new project to organize songs, collaborators, and revenue"

**CLARITY SCORE: 10/10** (Tokyo subway level)

---

## STEP 1: CREATE PROJECT

**I click:** "New Project" card

**I land on:** `/projects/new`

**What I see:**
- Title: "Spawn New Mycelium Network" ❌ **WAIT, WHAT?**
- Form: Project name, description, visibility
- Buttons: Create Project

**PROBLEM FOUND:** ❌ **MUSHROOM LANGUAGE STILL ON THIS PAGE**

**IS IT CLEAR?** 
- ⚠️ 6/10 - Form is clear, but "Spawn New Mycelium Network" is confusing
- **FIX NEEDED:** Change to "Create New Project"

**USER CONFUSION:** "What's a mycelium network? I just want to make an album..."

---

## STEP 2: PROJECT CREATED

**After submitting form:**

**I land on:** `/projects/my-album-name`

**What I see (AFTER AGENT 31 FIX):**
```
MY ALBUM NAME
[Private]

Stats: 0 Songs | 1 Collaborator | 0 Sessions

─────────────────────────────────────────
SONGS                         COLLABORATION
                              
No songs yet                  [Group Chat]
[CREATE FIRST SONG]           Text & voice messages
                              
                              [Video Meeting]
                              Voice/video + screen share
                              
                              [Team Members]
                              Invite collaborators
```

**IS IT CLEAR?**
- ✅ YES - "CREATE FIRST SONG" button obvious
- ✅ Sidebar shows collaborative features clearly
- ✅ Can see where to chat, video call, invite people

**CLARITY SCORE: 10/10** ✅

**USER THOUGHT:** "Oh! Here's where I invite my bandmate, here's where we chat, got it."

---

## STEP 3: CREATE FIRST SONG

**I click:** "CREATE FIRST SONG"

**I land on:** `/projects/my-album/songs/new`

**What I see (AFTER AGENT 31 FIX):**
```
CREATE NEW SONG
Build your song structure by dragging and dropping sections

[Title: ____________]  [Key: __] [Tempo: __] [Time: 4/4]

SONG STRUCTURE                STRUCTURE PREVIEW
                              1. Verse 1
[≡] Verse 1                   2. Chorus
    Verse lyrics here...
                              
[≡] Chorus
    Chorus lyrics...
    
[+ INTRO] [+ VERSE] [+ CHORUS] [+ BRIDGE] [+ INSTRUMENTAL] [+ OUTRO]

                              [CREATE SONG]
```

**IS IT CLEAR?**
- ✅ YES - Drag-and-drop is visual
- ✅ Buttons show what sections I can add
- ✅ Preview shows structure building up
- ✅ Grip icon (≡) signals draggable

**CLARITY SCORE: 10/10** ✅

**USER THOUGHT:** "Cool, I can build this like LEGO blocks - drag Intro to top, add Bridge, reorder, got it."

**BUT WAIT... WHERE DO I ADD CHORDS?** ❌ **MISSING**

---

## ⚠️ PROBLEM DISCOVERED: CHORDS NOT CONNECTED

**User creates song with drag-and-drop structure:**
- Adds Verse 1, Chorus, Verse 2
- Types lyrics in each section
- Clicks "CREATE SONG"
- Redirects to `/projects/my-album`

**NOW WHAT?** 

**User wants to add chords (C, Am, F, G above lyrics)**

**WHERE DO THEY GO?**

**Option A:** Click the song from project page → Goes to `/projects/[slug]/songs/[songId]`
- ❓ Does this page exist?
- ❓ Does it have chord editor?
- ❓ Does it show the section structure?

**Let me check...**

**CURRENTLY:** `/projects/[slug]/songs/[songId]` exists in `app/(app)/projects/[slug]/songs/[songId]/page.tsx`
- ✅ Has tabs: Lyrics, Chat, Video
- ✅ Has CleanCollaborativeEditor
- ❌ Does NOT show section structure
- ❌ Does NOT have chord editor integrated

**ISSUE:** Song created with structure (Intro/Verse/Chorus/Bridge) but when editing, structure is lost - just shows flat lyrics.

---

## 🚨 CRITICAL GAP IDENTIFIED:

**DISCONNECTION:**
1. User builds song with sections (drag-and-drop)
2. Song saves with structure
3. User edits song later
4. **Structure is gone** - just flat textarea
5. **Can't add chords per section**

**FIX NEEDED:**
- Song editor needs to SHOW the section structure
- Each section should have its own chord editor
- Preserve the drag-and-drop interface in edit mode
- Chords per section (Intro chords, Verse chords, Chorus chords)

---

## 🎯 REVISED USER JOURNEY (WHAT IT SHOULD BE):

**STEP 1:** Dashboard → "New Project" (clear) ✅

**STEP 2:** Project created → See collaborative features (clear) ✅

**STEP 3:** Click "CREATE FIRST SONG" → Drag-and-drop builder (clear) ✅

**STEP 4:** Build structure: Intro, Verse 1, Chorus, Verse 2, Bridge (clear) ✅

**STEP 5:** Click "CREATE SONG" → Song saved (clear) ✅

**STEP 6:** Click song from project list → Edit song page

**WHAT SHOULD HAPPEN:**
```
SONG: "MIDNIGHT BLUES"
[Undo] [Redo] [Export] [Save]

─────────────────────────────────
LEFT: Structure Editor

[≡] Intro                [Add Chords]
    Opening riff...

[≡] Verse 1              [Add Chords]
    Walking down the road
    Carrying this load
    
    Chords: [C    Am    F    G]

[≡] Chorus               [Add Chords]
    Oh these midnight blues
    
[≡] Verse 2              [Add Chords]
    Another day alone...

[+ ADD SECTION]

─────────────────────────────────
RIGHT: Sidebar

[Collaborative Presence]
• You
• Sarah (editing)

[Video Meeting]
[Group Chat]
[Invite]
```

**CLARITY:** Each section has its own lyrics AND chords, drag to reorder, collaborative tools visible

---

## 🔧 WHAT NEEDS FIXING:

**Issue #1:** `/projects/new` still has "Spawn Mycelium" language
**Issue #2:** Song editor doesn't preserve section structure
**Issue #3:** Chord editor not integrated with section builder
**Issue #4:** Can't add chords per section

**LOGICAL BUILD ORDER:**
1. Fix `/projects/new` mushroom language (5 min)
2. Update song editor to show sections (30 min)
3. Integrate chord editor per section (30 min)
4. Test complete flow (15 min)

**TOTAL:** ~1.5 hours to make it fully intuitive

---

## 🚇 TOKYO SUBWAY TEST (CLARITY CHECKLIST):

| Step | Current State | Tokyo Standard | Pass? |
|------|--------------|----------------|-------|
| Find "New Project" | Clear card on dashboard | Clear signs everywhere | ✅ |
| Create project | Form clear | One path, no confusion | ✅ |
| See collaborative features | Visible sidebar | Obvious signage | ✅ |
| Create first song | "CREATE FIRST SONG" button | Clear destination | ✅ |
| Build song structure | Drag-and-drop visual | Intuitive | ✅ |
| Add chords to sections | ❌ Not integrated | Should be obvious | ❌ |
| Edit song later | ❌ Structure lost | Should preserve flow | ❌ |
| Invite collaborator | Clear button in sidebar | One click away | ✅ |
| Start video call | Clear button | One click away | ✅ |
| Use voice messages | In chat interface | Microphone button visible | ✅ |

**CURRENT SCORE: 8/10** (2 issues remaining)

---

## 💡 AGENT 31 RECOMMENDATION:

**BUILD THESE 2 FIXES NOW:**

1. **Fix `/projects/new` mushroom language** (quick)
2. **Integrate chord editor with section structure** (critical)

**Then test complete flow again** (Tokyo subway test all green)

**Proceeding with fixes now...**
