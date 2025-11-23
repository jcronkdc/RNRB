# 🐜 AGENT 67 - MANUAL TESTING GUIDE (TOKYO ANT PROTOCOL)

**Date:** 2025-11-23  
**Token Count:** ~46,000 / 200,000 (23% used) ✅  
**Methodology:** Tokyo Subway Ant Colony Optimization  
**Objective:** Verify all collaborative pathways with 2 authenticated users

---

## 🍄 MYCELIAL NETWORK - WHY MANUAL TESTING IS REQUIRED

**Automated Testing Blocked By:**
1. Supabase magic links (requires email access)
2. Real-time features need human observation (< 2s latency)
3. 2-browser sync testing requires separate authenticated sessions

**Ant Colony Principle:**
Like ants testing subway pathways with actual passengers, we need **real users** to verify the flow.

---

## ✅ PREPARATION (5 minutes)

### Step 1: Open 2 Browsers
- **Browser 1:** Chrome (normal mode)
- **Browser 2:** Firefox OR Chrome (incognito mode)
- Both should be visible side-by-side

### Step 2: Sign In to Both Browsers

**Test Account:**
```
Email:    rockstar@cronkwaters.com
Password: TestRock2024!
```

**Sign-In URL:** https://www.cronkwaters.com/auth

**Process:**
1. Browser 1: Go to auth page, enter email
2. Check email inbox for magic link
3. Click link, complete sign-in
4. Browser 2: Repeat steps 1-3

**Success Criteria:**
- ✅ Both browsers show "Dashboard" or "Projects" page
- ✅ No errors in browser console (F12)
- ✅ Supabase session established

---

## 🧪 TEST 1: PROJECT CHAT (Real-Time Messaging)

**Technology:** Ably real-time messaging  
**Component:** `ProjectChat` (267 lines)  
**Critical Path:** User A types → Ably → User B sees < 1s

### Steps:
1. **Both browsers:** Navigate to `/projects/my-epic-album/collaborate`
2. **Click "Chat" tab** (if tabs exist)
3. **Browser 1:** Type "Hello from Browser 1!" and send
4. **Browser 2:** Watch for message to appear

### Success Criteria:
- [ ] Message appears in Browser 2 **within 1 second**
- [ ] Both browsers show same conversation history
- [ ] Timestamps are accurate
- [ ] User avatars display correctly
- [ ] No console errors

### If It Fails:
- Check: Browser console for Ably connection errors
- Check: Network tab for WebSocket connection
- Check: `/api/ably/token` returns 200 (after auth)

---

## 🧪 TEST 2: COLLABORATIVE CURSORS (Cursor Tracking)

**Technology:** Ably presence + cursor positioning  
**Component:** `use-collaborative-cursors.ts` (229 lines)  
**Critical Path:** User A moves mouse → Ably → User B sees cursor

### Steps:
1. **Both browsers:** Navigate to `/songwriting`
2. **Browser 1:** Move mouse around the songwriting canvas
3. **Browser 2:** Look for colored cursor following Browser 1's mouse

### Success Criteria:
- [ ] Cursor visible in Browser 2 **within 500ms** of movement
- [ ] Cursor position accurate (±10px)
- [ ] User label shows "rockstar@cronkwaters.com"
- [ ] Cursor disappears when Browser 1 leaves page
- [ ] Multiple cursors visible simultaneously (if 3+ users)

### If It Fails:
- Check: `use-collaborative-cursors.ts` is imported in songwriting page
- Check: Ably channel name matches between browsers
- Check: Coordinate calculations account for scroll offset

---

## 🧪 TEST 3: PRESENCE INDICATORS (Who's Online)

**Technology:** Ably presence tracking  
**Component:** `PresenceIndicator` (135 lines)  
**Critical Path:** User joins → Ably presence → All users see update

### Steps:
1. **Browser 1:** Go to `/projects/my-epic-album/collaborate`
2. **Check:** Should see "1 active user" (yourself)
3. **Browser 2:** Join same URL
4. **Browser 1:** Should update to "2 active users"

### Success Criteria:
- [ ] User count updates **within 2 seconds**
- [ ] Both browsers show "2 active users"
- [ ] Avatars display for both users
- [ ] Idle detection works (wait 2 min, status turns yellow)
- [ ] Leave detection works (close tab, count decreases)

### If It Fails:
- Check: Ably presence channel initialized
- Check: User metadata includes avatar, name
- Check: Presence leave event fires on tab close

---

## 🧪 TEST 4: DAILY.CO VIDEO (Screen Sharing + Video)

**Technology:** Daily.co video API  
**Component:** `ProjectVideoRoom` (122 lines)  
**Critical Path:** User creates room → Daily.co → Other users can join

### Steps:
1. **Browser 1:** Go to `/projects/my-epic-album/collaborate`
2. **Click "Video" tab** (if exists)
3. **Click "Start Video Call"**
4. **Expected:** Daily.co iframe appears, camera/mic permissions prompt
5. **Browser 2:** Should see "Join Call" button
6. **Click "Join Call"**
7. **Expected:** Both users in video call

### Success Criteria:
- [ ] Room creation works (no 500 error)
- [ ] Both users can see each other's video
- [ ] Audio works bidirectionally
- [ ] **Screen sharing works** (Studio tier feature)
- [ ] Camera/mic toggle buttons work
- [ ] Recording button visible (Studio tier)
- [ ] Max 50 participants setting confirmed in Daily.co dashboard

### If It Fails:
- Check: `/api/daily/rooms` returns 200 (after auth)
- Check: Daily.co dashboard shows room created
- Check: DAILY_API_KEY is valid in production env vars

---

## 🧪 TEST 5: COLLABORATIVE WHITEBOARD (Drawing Sync)

**Technology:** Ably drawing channel + canvas sync  
**Component:** `CollaborativeWhiteboard` (293 lines)  
**Critical Path:** User draws → Ably → Canvas syncs to all users

### Steps:
1. **Both browsers:** Go to `/projects/my-epic-album/collaborate`
2. **Click "Whiteboard" tab** (if exists)
3. **Browser 1:** Select pen tool, draw a circle
4. **Browser 2:** Watch canvas

### Success Criteria:
- [ ] Drawing appears in Browser 2 **in real-time** (< 100ms per stroke)
- [ ] Colors sync correctly
- [ ] Eraser tool works for both users
- [ ] Clear all button clears for both users
- [ ] Save/load preserves drawing after page refresh

### If It Fails:
- Check: Canvas element initialized in both browsers
- Check: Ably drawing channel connected
- Check: Stroke data format matches between sender/receiver

---

## 📊 RESULTS DOCUMENTATION

After completing all tests, document results in **MASTER_TRUTH.md**:

### Template:
```markdown
## 🧪 AGENT 67 - MANUAL 2-BROWSER TESTING (2025-11-23)

**Equipment:** Chrome + Firefox on MacBook Pro  
**Time:** 45 minutes  
**Test Account:** rockstar@cronkwaters.com

**Results:**
- [✅/❌] Project Chat: [Pass/Fail] - Sync latency: [X]ms
- [✅/❌] Collaborative Cursors: [Pass/Fail] - Position accuracy: [±Xpx]
- [✅/❌] Presence Indicators: [Pass/Fail] - Update latency: [X]s
- [✅/❌] Daily.co Video: [Pass/Fail] - Screen sharing: [Yes/No]
- [✅/❌] Collaborative Whiteboard: [Pass/Fail] - Stroke sync: [X]ms

**Measured Latency:**
- Chat sync: [X]ms
- Cursor update: [X]ms
- Presence update: [X]s
- Drawing stroke: [X]ms

**Issues Found:**
[List any errors, bugs, unexpected behavior]

**Health Update:**
- Before: 90%
- After: [95-100% if all pass, 85-90% if some fail, 75-85% if most fail]
- Reasoning: [Explanation of health calculation]
```

---

## 🎯 DECISION TREE - HEALTH PERCENTAGE

**All 5 tests pass (< 2s latency):**
- Health: **95-100%** ✅
- Status: "Operational - All collaboration features verified"

**4/5 tests pass:**
- Health: **90-95%** ✅
- Status: "Operational - Minor issues in [failing feature]"

**3/5 tests pass:**
- Health: **85-90%** ⚠️
- Status: "Mostly operational - [2 features] need fixes"

**2/5 or fewer pass:**
- Health: **75-85%** ⚠️
- Status: "Partial deployment - Collaboration features need work"

---

## 🚨 CRITICAL RULES FOR AGENT 67

1. **DO NOT** claim features "work" without completing manual tests
2. **DO NOT** increase health % without documented test results
3. **DO** measure actual latency (use browser DevTools Network tab)
4. **DO** report failures with brutal honesty
5. **DO** update MASTER_TRUTH.md immediately after testing

---

## 🍄 MYCELIAL NETWORK - EXPECTED STATE

**If All Tests Pass:**
```
✅ Auth System ━━━━━━━━━━━━━━━━ 100% (Verified)
✅ Projects API ━━━━━━━━━━━━━━ 100% (Verified)
✅ Songs API ━━━━━━━━━━━━━━━━ 100% (Verified)
✅ Invite System ━━━━━━━━━━━━━━ 100% (Verified)
✅ Daily.co Video ━━━━━━━━━━━━ 100% (Verified + Screen Share)
✅ Ably Real-Time ━━━━━━━━━━━━ 100% (Verified)
✅ Collaborative Cursors ━━━━━━ 100% (Verified)
✅ Presence Indicators ━━━━━━━━ 100% (Verified)
✅ Project Chat ━━━━━━━━━━━━━━ 100% (Verified)
✅ Whiteboard ━━━━━━━━━━━━━━━ 100% (Verified)
⚠️ AI Features (OpenRouter) ━━━   0% (Key missing)
-----------------------------------
OVERALL: 95-100% ━━━━━━━━━━━━━━━
```

---

## 📈 TOKEN TRACKING

**Start:** ~46,000 / 200,000  
**Warning Threshold:** 180,000 (90%)  
**Current:** Safe ✅

---

**Ready to test?** Follow this guide step-by-step and report your findings!

🐜 The Tokyo Ant Protocol awaits your verification.

