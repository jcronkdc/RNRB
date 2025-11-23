# 🎸 Test Account - Quick Setup Summary

## Test Account Credentials

```
📧 Email:    test@cronkwaters.com
🔑 Password: TestRock2024!
👑 Tier:     Studio (Supreme Admin Access)
```

## ✨ What This Account Has Access To

### 🚀 Unlimited AI Features
- ✅ No rate limits on AI requests
- ✅ GPT-4o-mini powered songwriting
- ✅ AI chord progressions
- ✅ AI lyric assistance
- ✅ AI chat for creative help

### 🎥 Video Collaboration (Studio Tier)
- ✅ Unlimited video calls
- ✅ Screen sharing ready
- ✅ Daily.co integration
- ✅ Recording capabilities

### 🎵 Unlimited Projects
- ✅ Unlimited projects
- ✅ Unlimited songs per project
- ✅ Unlimited collaborators
- ✅ 100 GB storage

### 💬 Real-Time Collaboration
- ✅ Live chat (Ably powered)
- ✅ Collaborative whiteboard
- ✅ Presence indicators
- ✅ Activity feed

---

## 📝 Setup Instructions

### Option 1: Automated Setup (Requires Supabase Credentials)

1. **Set environment variables** in `apps/web/.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://lzfzkrylexsarpxypktt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
   DATABASE_URL=<your_database_url>
   ```

2. **Run the setup script**:
   ```bash
   cd /Users/justincronk/Desktop/CronkWaters
   ./create-test-account.sh
   ```

### Option 2: Manual Setup (Recommended)

#### Step 1: Create Supabase User

Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users

Click **"Add user"**:
- Email: `test@cronkwaters.com`
- Password: `TestRock2024!`
- ✅ Confirm email (check the box)

**Copy the User ID** from the created user.

#### Step 2: Add Database Records

Open Prisma Studio or your database client:
```bash
cd /Users/justincronk/Desktop/CronkWaters/packages/db
pnpm prisma studio
```

Or use SQL directly in your database:

```sql
-- Replace 'PASTE_USER_ID_HERE' with the actual Supabase user ID

-- 1. Create User with Studio tier
INSERT INTO "User" (
  id, email, "emailVerified", name,
  "subscriptionTier", "subscriptionStatus", "subscriptionStartedAt",
  "aiRequestsUsed", "videoMinutesUsed", "storageUsedGB",
  "usagePeriodStart", "createdAt", "updatedAt"
) VALUES (
  'PASTE_USER_ID_HERE',
  'test@cronkwaters.com',
  NOW(),
  'Test Studio User',
  'studio',
  'active',
  NOW(),
  0, 0, 0.00,
  NOW(), NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  "subscriptionTier" = 'studio',
  "subscriptionStatus" = 'active',
  "aiRequestsUsed" = 0;

-- 2. Create Organization
INSERT INTO "Org" (
  id, name, slug, type, "createdAt", "updatedAt"
) VALUES (
  'test-org-001',
  'Test Studio',
  'test-studio-001',
  'solo',
  NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 3. Add Org Membership
INSERT INTO "Membership" (
  "userId", "orgId", role, status, "joinedAt"
) VALUES (
  'PASTE_USER_ID_HERE',
  'test-org-001',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "orgId") DO NOTHING;

-- 4. Create Sample Project
INSERT INTO "Project" (
  id, "orgId", name, slug, description,
  visibility, status, "createdAt", "updatedAt"
) VALUES (
  'test-project-001',
  'test-org-001',
  'My Test Album',
  'my-test-album',
  'Testing all the awesome features of Rock N'' Roll Basement',
  'private',
  'active',
  NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 5. Add Project Membership
INSERT INTO "ProjectMember" (
  "userId", "projectId", role, status, "joinedAt"
) VALUES (
  'PASTE_USER_ID_HERE',
  'test-project-001',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "projectId") DO NOTHING;

-- Verify setup
SELECT 'Setup complete!' as status;
```

---

## 🚀 How to Test

### 1. Start the Dev Server
```bash
cd /Users/justincronk/Desktop/CronkWaters/apps/web
pnpm dev
```

### 2. Open Browser
Navigate to: **http://localhost:3000/auth**

### 3. Sign In
- Email: `test@cronkwaters.com`
- Password: `TestRock2024!`

### 4. Test Projects Feature

#### View Projects
Navigate to: **http://localhost:3000/projects**
- Should see "My Test Album" project
- Verify Studio tier badge/features

#### Create New Project
Click **"New Project"** button
- Test form validation
- Test all visibility options
- Verify creation via API

#### View Project Details
Click on a project card:
- Check songs list
- Check members list
- Check stats (song count, collaborators, sessions)

#### Create Songs
Inside project, click **"Add Song"**:
- Use collaborative visual builder
- Add chords and lyrics
- Test save functionality

#### Test Collaboration Hub
Go to `/projects/my-test-album/collaborate`:

**Team Tab:**
- View team members
- Test invite functionality
- Check role badges

**Chat Tab:**
- Send messages
- Check real-time updates
- Test message history

**Video Tab:**
- Verify Studio tier access
- Check video room UI
- Test whiteboard

**Activity Tab:**
- Check activity feed
- Verify real-time updates

#### Test Sessions
Go to `/projects/my-test-album/sessions`:
- Log a recording session
- Check session history
- Verify stats

#### Test Setlists
Go to `/projects/my-test-album/setlists`:
- Create a setlist
- Add songs
- Test drag-drop ordering

#### Test Settings
Go to `/projects/my-test-album/settings`:
- Update project details
- Change visibility
- Test delete (with caution!)

---

## 🧪 API Testing

Test the API endpoints directly:

```bash
# Get user's projects
curl "http://localhost:3000/api/projects?userId=YOUR_USER_ID"

# Get single project
curl "http://localhost:3000/api/projects/my-test-album?userId=YOUR_USER_ID"

# Create project
curl -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -d '{"userId":"YOUR_USER_ID","name":"New Test Project","visibility":"private"}'

# Get project songs
curl "http://localhost:3000/api/projects/my-test-album/songs?userId=YOUR_USER_ID"

# Create song
curl -X POST "http://localhost:3000/api/projects/my-test-album/songs" \
  -H "Content-Type: application/json" \
  -d '{"userId":"YOUR_USER_ID","title":"Test Song","key":"G Major","tempo":120}'
```

---

## ✅ Verification Checklist

- [ ] User can sign in with test credentials
- [ ] Dashboard loads and shows user name
- [ ] Projects page lists sample project
- [ ] Can create new projects
- [ ] Can view project details
- [ ] Can create songs in projects
- [ ] Collaboration hub loads all tabs
- [ ] Chat works (if Ably configured)
- [ ] Video room shows Studio access
- [ ] Whiteboard renders (if Ably configured)
- [ ] Sessions page loads and functions
- [ ] Setlists page loads and functions
- [ ] Settings page can update project
- [ ] All API endpoints respond correctly
- [ ] No 404 errors in navigation
- [ ] No critical console errors

---

## 🔧 Files Created

1. `TEST_ACCOUNT_GUIDE.md` - Comprehensive manual setup guide
2. `create-test-account.sh` - Automated setup script
3. `create-test-account.sql` - SQL template for manual setup
4. This file - Quick reference summary

---

## 📊 Feature Coverage

This test account lets you verify:

✅ **Auth System** - Sign in/out, session management  
✅ **Projects CRUD** - Create, read, update, delete  
✅ **Songs CRUD** - Full song management  
✅ **Collaboration** - Chat, video, whiteboard  
✅ **Real-Time** - Presence, activity, sync  
✅ **Permissions** - Owner/admin/member roles  
✅ **Access Control** - Visibility settings  
✅ **Subscription Tiers** - Studio features unlocked  
✅ **API Routes** - All 8 endpoints functional  
✅ **Database Integration** - Prisma queries working  

---

## 🎸 Quick Commands Reference

```bash
# Navigate to project
cd /Users/justincronk/Desktop/CronkWaters

# Start dev server
cd apps/web && pnpm dev

# Run test script (if env vars set)
./create-test-account.sh

# Open Prisma Studio
cd packages/db && pnpm prisma studio

# Build project
cd apps/web && pnpm build

# View logs
cd apps/web && pnpm dev | grep -E "(error|Error|✓)"
```

---

## 🎯 Success Criteria

The projects feature is working correctly when:

1. ✅ Build completes with 0 errors
2. ✅ All pages load without 404s
3. ✅ Test user can sign in
4. ✅ Projects page lists data from database
5. ✅ Can perform full CRUD on projects
6. ✅ Can perform full CRUD on songs
7. ✅ Collaboration features load (may need Ably key)
8. ✅ Navigation works smoothly
9. ✅ API endpoints return correct data
10. ✅ Studio tier features are accessible

---

**🎸 Ready to rock! Sign in and test all features with supreme admin access!**

