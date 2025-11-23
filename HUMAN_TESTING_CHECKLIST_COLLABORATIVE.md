# 🧪 HUMAN TESTING CHECKLIST - COLLABORATIVE FEATURES

**Status:** ⚠️ **CRITICAL - ALL FEATURES DEPLOYED BUT NEVER HUMAN TESTED**  
**Priority:** 🔥 **P0 - MUST VERIFY BEFORE CLAIMING "WORKING"**  
**Agent:** 🍄 Mycelial Network Tester  
**Date:** 2025-11-23

---

## 🎯 MYCELIAL FLOW - TESTING STRATEGY

Like ants finding optimal subway paths, we test **pathways end-to-end** with real users:

```
User A (Browser 1) ←→ Ably Real-Time ←→ User B (Browser 2)
       ↓                   ↓                    ↓
   Database  ←→  API Routes  ←→  WebSocket  ←→  UI
```

---

## ✅ PREPARATION (DO FIRST)

### **1. Create Test Account** (2 minutes)

```bash
# Option 1: Semi-automated (if you have Supabase service key)
export SUPABASE_SERVICE_ROLE_KEY='your-key-here'
./create-test-account-automated.sh

# Option 2: Manual
# Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users
# Create: rockstar@cronkwaters.com / TestRock2024!
# Then run: setup-test-user.sql
```

### **2. Sign In (Both Browsers)**

- Browser 1: https://www.cronkwaters.com/auth
- Browser 2: https://www.cronkwaters.com/auth (incognito/different browser)
- Use: rockstar@cronkwaters.com / TestRock2024!

---

## 🧪 PHASE 1: PROJECT CHAT (Real-Time Messaging)

**Component:** `ProjectChat` (267 lines)  
**Technology:** Ably real-time messaging  
**Critical Path:** User A types → Ably → User B sees instantly

### **Test Steps:**

1. ✅ **Setup**
   - Browser 1: Go to `/projects/my-epic-album/collaborate`
   - Browser 2: Go to `/projects/my-epic-album/collaborate`
   - Both should see chat interface

2. ✅ **Send Message (Browser 1)**
   - Type: "Hello from Browser 1!"
   - Click Send
   - **Expected:** Message appears in Browser 1

3. 🧪 **CRITICAL TEST: Real-Time Sync**
   - **Expected:** Message appears in Browser 2 **INSTANTLY** (< 1 second)
   - **If Fails:** Check Ably connection, channel name, message format

4. ✅ **Send Reply (Browser 2)**
   - Type: "Reply from Browser 2!"
   - Click Send
   - **Expected:** Both browsers show conversation

5. ✅ **Test Features**
   - Auto-scroll to newest message
   - Timestamp display
   - User avatar/name display
   - Message history loads on join

### **Pass Criteria:**

- [ ] Messages sync in < 1 second
- [ ] History loads correctly
- [ ] No errors in console
- [ ] Both users see same conversation

---

## 🧪 PHASE 2: REAL-TIME CURSORS (Collaborative Editing)

**Component:** `use-collaborative-cursors.ts` (229 lines)  
**Technology:** Ably presence + cursor positioning  
**Critical Path:** User A moves mouse → Ably → User B sees cursor

### **Test Steps:**

1. ✅ **Setup**
   - Browser 1: Go to `/songwriting`
   - Browser 2: Go to `/songwriting`
   - Both should see songwriting interface

2. 🧪 **CRITICAL TEST: Cursor Visibility**
   - Browser 1: Move mouse around
   - **Expected:** Browser 2 sees labeled cursor following Browser 1's position
   - **Color:** Different color per user
   - **Label:** Shows "rockstar@cronkwaters.com"

3. ✅ **Test Positioning**
   - Move cursor to different song blocks
   - **Expected:** Cursor position accurate in both browsers
   - **If Fails:** Check coordinate calculation, viewport sync

4. ✅ **Test Multiple Cursors**
   - Browser 2: Move mouse
   - **Expected:** Browser 1 sees Browser 2's cursor
   - Both cursors visible simultaneously

5. ✅ **Test Cursor Disappear**
   - Browser 1: Leave page
   - **Expected:** Cursor disappears from Browser 2 within 5 seconds

### **Pass Criteria:**

- [ ] Cursors visible within 500ms of movement
- [ ] Position accuracy ±10px
- [ ] Labels show correct user names
- [ ] Cursors clean up on user leave

---

## 🧪 PHASE 3: PRESENCE INDICATORS (Who's Online)

**Component:** `PresenceIndicator` (135 lines)  
**Technology:** Ably presence tracking  
**Critical Path:** User joins → Ably presence → All users see update

### **Test Steps:**

1. ✅ **Single User**
   - Browser 1: Go to `/collaboration`
   - **Expected:** See yourself as "Active" with avatar

2. 🧪 **CRITICAL TEST: Multi-User Presence**
   - Browser 2: Go to `/collaboration`
   - **Expected:** Browser 1 shows "2 active users"
   - **Expected:** Browser 2 shows "2 active users"
   - Both see each other's avatars

3. ✅ **Test Idle Detection**
   - Browser 1: Don't touch for 2 minutes
   - **Expected:** Status changes to "Idle" (yellow dot)
   - Browser 2 sees Browser 1 as idle

4. ✅ **Test User Leave**
   - Browser 1: Close tab
   - **Expected:** Browser 2 shows "1 active user" within 10 seconds

### **Pass Criteria:**

- [ ] Presence updates in < 2 seconds
- [ ] Idle detection works (2 min timeout)
- [ ] Leave detection works (< 10 sec)
- [ ] Avatars display correctly

---

## 🧪 PHASE 4: ACTIVITY FEED (Real-Time Events)

**Component:** `ActivityFeed` (145 lines)  
**Technology:** Ably activity channel  
**Critical Path:** User action → Ably → Feed updates for all

### **Test Steps:**

1. ✅ **Setup**
   - Browser 1: Go to `/dashboard`
   - Browser 2: Go to `/dashboard`

2. 🧪 **CRITICAL TEST: Activity Broadcasting**
   - Browser 1: Create a new project
   - **Expected:** Browser 2's activity feed shows "rockstar created My New Project"
   - **Time:** < 2 seconds

3. ✅ **Test Different Events**
   - Browser 1: Add a song
   - Browser 1: Update project settings
   - **Expected:** All events appear in Browser 2's feed

4. ✅ **Test Icons & Formatting**
   - Each activity has correct icon
   - Timestamps show "just now" or "2 minutes ago"
   - Colors match activity type

### **Pass Criteria:**

- [ ] Events broadcast to all users
- [ ] Correct icons for each activity type
- [ ] Timestamps format correctly
- [ ] Feed scrolls smoothly

---

## 🧪 PHASE 5: COLLABORATIVE WHITEBOARD (Drawing Sync)

**Component:** `CollaborativeWhiteboard` (293 lines)  
**Technology:** Ably drawing channel + canvas sync  
**Critical Path:** User draws → Ably → Canvas syncs to all users

### **Test Steps:**

1. ✅ **Setup**
   - Browser 1: Go to `/projects/my-epic-album/collaborate`
   - Browser 2: Go to `/projects/my-epic-album/collaborate`
   - Both see whiteboard canvas

2. 🧪 **CRITICAL TEST: Drawing Sync**
   - Browser 1: Select pen tool, draw circle
   - **Expected:** Browser 2 sees circle appear **IN REAL-TIME** (not after mouse up)
   - **Smoothness:** Drawing should be smooth, not choppy

3. ✅ **Test Tools**
   - Pen tool (different colors)
   - Eraser tool
   - Clear all button
   - **Expected:** All tools sync correctly

4. ✅ **Test Save/Load**
   - Browser 1: Click "Save Drawing"
   - Browser 2: Refresh page
   - **Expected:** Drawing persists

### **Pass Criteria:**

- [ ] Strokes sync in real-time (< 100ms per point)
- [ ] Colors sync correctly
- [ ] Eraser works for both users
- [ ] Save/load preserves drawing

---

## 🧪 PHASE 6: VIDEO CALLS (Daily.co Integration)

**Component:** `ProjectVideoRoom` (122 lines)  
**Technology:** Daily.co video API  
**Status:** ⚠️ **KNOWN ISSUE:** Auth import error

### **Test Steps:**

1. ⚠️ **Known Issue:** Daily.co returns 500 error
   - Error: "a.auth is not a function"
   - Root Cause: Auth module import/export issue

2. 🔧 **If Fixed:**
   - Browser 1: Go to `/projects/my-epic-album/collaborate`
   - Click "Start Video Call"
   - **Expected:** Daily.co room creates, camera/mic prompt appears

3. ✅ **Test Join**
   - Browser 2: Should see "Join Call" button
   - Click to join
   - **Expected:** Both users in video call

4. ✅ **Test Features**
   - Camera toggle
   - Mic toggle
   - Screen sharing (Studio tier only)
   - Leave call

### **Pass Criteria:**

- [ ] Room creation works (no 500 error)
- [ ] Both users can join
- [ ] Audio/video streams work
- [ ] Screen sharing works (Studio tier)

---

## 🧪 PHASE 7: AUTO-SAVE (Songwriting Persistence)

**Component:** `use-song-auto-save.ts` (100 lines)  
**Technology:** Debounce + API POST  
**Critical Path:** User types → 2s delay → API save → Visual feedback

### **Test Steps:**

1. ✅ **Setup**
   - Browser 1: Go to `/songwriting`
   - Should see "Untitled Song" with save status indicator

2. 🧪 **CRITICAL TEST: Auto-Save**
   - Type lyrics: "This is a test song"
   - **Expected:** Status shows "Auto-save active" (gray)
   - Wait 2 seconds
   - **Expected:** Status shows "Saving..." (blue, spinning)
   - Wait 1 second
   - **Expected:** Status shows "Saved" (green checkmark)

3. ✅ **Test Persistence**
   - Refresh page
   - **Expected:** Lyrics still there ("This is a test song")

4. ✅ **Test Error Handling**
   - Disconnect internet
   - Type more lyrics
   - **Expected:** After 2 seconds, shows "Error saving" (red X)

### **Pass Criteria:**

- [ ] 2-second debounce works
- [ ] Visual feedback correct (Saving → Saved)
- [ ] Data persists after refresh
- [ ] Error state shows on failure

---

## 🧪 PHASE 8: INVITE SYSTEM (Collaboration Access)

**Component:** Invitation flow  
**Technology:** Token-based invites + email  
**Status:** ⚠️ **NEVER TESTED** with real email flow

### **Test Steps:**

1. ✅ **Send Invite**
   - Browser 1: Go to `/projects/my-epic-album/settings`
   - Click "Invite Collaborator"
   - Enter: collaborator@example.com
   - Click Send
   - **Expected:** "Invite sent!" message

2. 🧪 **CRITICAL TEST: Email Delivery**
   - Check collaborator@example.com inbox
   - **Expected:** Email with magic link
   - **If No Email:** Check Supabase email settings, Resend API key

3. ✅ **Accept Invite**
   - Click link in email
   - **Expected:** Redirects to sign up/sign in
   - After auth, adds to project members

4. ✅ **Test Access**
   - New user goes to `/projects/my-epic-album`
   - **Expected:** Can view and edit (based on role)

### **Pass Criteria:**

- [ ] Invite creates database record
- [ ] Email sends (if configured)
- [ ] Token validates correctly
- [ ] Member added on acceptance

---

## 📊 OVERALL MYCELIAL HEALTH TEST

After all phases, verify the **ant colony pathways** are optimal:

```
✅ Phase 1: Project Chat           [    ]
✅ Phase 2: Real-Time Cursors      [    ]
✅ Phase 3: Presence Indicators    [    ]
✅ Phase 4: Activity Feed          [    ]
✅ Phase 5: Collaborative Whiteboard [  ]
⚠️  Phase 6: Video Calls (needs fix) [  ]
✅ Phase 7: Auto-Save              [    ]
⚠️  Phase 8: Invite System         [    ]
```

### **Success = All phases passing**

- Real-time sync < 2 seconds
- No console errors
- Visual feedback correct
- Data persists

---

## 🚨 IF TESTS FAIL

### **Common Issues:**

1. **No Real-Time Updates**
   - Check: Ably API key configured
   - Check: `/api/ably/token` returns 200
   - Check: Browser console for WebSocket errors

2. **Cursor Position Wrong**
   - Check: Viewport calculations
   - Check: Scroll offset handling
   - Check: Transform CSS not breaking coordinates

3. **Data Not Saving**
   - Check: API routes return 200/401 (not 404/500)
   - Check: Database connection in health check
   - Check: RLS policies allow user access

4. **Video Not Working**
   - Known: Auth import error
   - Fix: Investigate `@/auth` module exports
   - Check: Daily.co API key valid

---

## 🍄 MYCELIAL TRUTH

**BRUTAL HONESTY FOR AGENT 64:**

If any test fails, the feature is **NOT WORKING** regardless of code quality. Only human testing with 2+ authenticated users reveals real-time collaboration issues.

**Current Status:** All features **DEPLOYED** but **ZERO HUMAN TESTS PASSED**  
**Next Agent:** Must run these tests before claiming anything "works"

---

**Priority:** 🔥 P0 - MUST DO BEFORE V1 LAUNCH  
**Time Required:** 30-45 minutes for all phases  
**Prerequisites:** 1 test account, 2 browsers/devices
