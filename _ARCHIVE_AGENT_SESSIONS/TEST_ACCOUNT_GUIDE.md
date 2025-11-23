# 🎸 Test Account Setup Guide

## Quick Access Credentials

**📧 Email:** `test@cronkwaters.com`  
**🔑 Password:** `TestRock2024!`  
**👑 Tier:** Studio (Supreme Admin - Full Access)

---

## Automatic Setup (Recommended)

Run the automated script from the project root:

```bash
cd /Users/justincronk/Desktop/CronkWaters
./create-test-account.sh
```

This will:
1. ✅ Create Supabase auth user
2. ✅ Set Studio tier subscription
3. ✅ Create organization
4. ✅ Create sample project
5. ✅ Create sample song
6. ✅ Reset usage counters (unlimited AI)

---

## Manual Setup (If Script Fails)

### Step 1: Create Supabase User

Go to Supabase Dashboard:
https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users

Click **"Add user"** and create:
- **Email:** test@cronkwaters.com
- **Password:** TestRock2024!
- **✅ Confirm email:** Check this box (skip email verification)

Copy the **User ID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Run Database Setup

Replace `USER_ID_HERE` with your copied User ID, then run:

```bash
cd /Users/justincronk/Desktop/CronkWaters/packages/db

pnpm prisma studio
# OR use SQL directly:
```

```sql
-- Replace 'USER_ID_HERE' with actual Supabase user ID

-- 1. Create/Update User with Studio tier
INSERT INTO "User" (
  id, email, "emailVerified", name,
  "subscriptionTier", "subscriptionStatus", 
  "subscriptionStartedAt",
  "aiRequestsUsed", "videoMinutesUsed", 
  "storageUsedGB", "usagePeriodStart",
  "createdAt", "updatedAt"
) VALUES (
  'USER_ID_HERE',
  'test@cronkwaters.com',
  NOW(),
  'Test Studio User',
  'studio',
  'active',
  NOW(),
  0, 0, 0.00, NOW(), NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  "subscriptionTier" = 'studio',
  "subscriptionStatus" = 'active',
  "aiRequestsUsed" = 0,
  "videoMinutesUsed" = 0;

-- 2. Create Personal Organization
INSERT INTO "Org" (
  id, name, slug, type, "createdAt", "updatedAt"
) VALUES (
  'test-org-studio',
  'Test Studio',
  'test-studio',
  'solo',
  NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 3. Add User as Org Owner
INSERT INTO "Membership" (
  "userId", "orgId", role, status, "joinedAt"
) VALUES (
  'USER_ID_HERE',
  'test-org-studio',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "orgId") DO NOTHING;

-- 4. Create Sample Project
INSERT INTO "Project" (
  id, "orgId", name, slug, description, 
  visibility, status, "createdAt", "updatedAt"
) VALUES (
  'test-project-123',
  'test-org-studio',
  'My First Album',
  'my-first-album',
  'Testing all features',
  'private',
  'active',
  NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 5. Add User as Project Owner
INSERT INTO "ProjectMember" (
  "userId", "projectId", role, status, "joinedAt"
) VALUES (
  'USER_ID_HERE',
  'test-project-123',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "projectId") DO NOTHING;
```

---

## Features Unlocked ✨

With **Studio Tier**, test account has access to:

### ✅ AI Features (Unlimited)
- AI-powered chord progressions
- AI lyric assistance  
- AI chat for songwriting
- No rate limits
- No usage tracking

### ✅ Collaboration (Unlimited)
- Video calls (Daily.co integration)
- Real-time chat with Ably
- Collaborative whiteboard
- Live presence indicators
- Activity feed

### ✅ Projects (Unlimited)
- Unlimited projects
- Unlimited songs per project
- Unlimited collaborators
- Sessions tracking
- Setlist builder

### ✅ Storage
- 100 GB file storage
- Audio file uploads
- Project assets

---

## Testing the Projects Feature

Once logged in:

### 1. View All Projects
Navigate to: **http://localhost:3000/projects**
- Should see "My First Album" project
- Click to view project details

### 2. Create New Project
Click **"New Project"** button
- Fill in project details
- Test different visibility settings (private/org/public)
- Create and verify in database

### 3. Create Songs
Inside a project:
- Click **"Add Song"**
- Use collaborative visual builder
- Add lyrics and chords
- Save and verify

### 4. Test Collaboration
Navigate to: **http://localhost:3000/projects/my-first-album/collaborate**

**Team Tab:**
- Invite collaborators (email-based)
- View team members
- Check roles (owner/admin/member)

**Chat Tab:**
- Real-time chat powered by Ably
- Message history
- Live updates

**Video Tab:**
- Studio-tier gated (should show video room)
- Daily.co integration placeholder
- Collaborative whiteboard

**Activity Tab:**
- Real-time activity feed
- All project events

### 5. Test Sessions
Navigate to: **http://localhost:3000/projects/my-first-album/sessions**
- Log recording sessions
- Track creative work
- View session history

### 6. Test Setlists
Navigate to: **http://localhost:3000/projects/my-first-album/setlists**
- Create setlist for live shows
- Organize songs
- Export/share setlists

### 7. Test Settings
Navigate to: **http://localhost:3000/projects/my-first-album/settings**
- Update project details
- Change visibility
- Delete project (test with caution!)

---

## API Endpoints to Test

### Projects CRUD
```bash
# List projects
GET /api/projects?userId=USER_ID

# Get single project
GET /api/projects/my-first-album?userId=USER_ID

# Create project
POST /api/projects
{
  "userId": "USER_ID",
  "name": "New Album",
  "visibility": "private"
}

# Update project
PATCH /api/projects/my-first-album
{
  "userId": "USER_ID",
  "name": "Updated Album Name"
}

# Delete project
DELETE /api/projects/my-first-album?userId=USER_ID
```

### Songs CRUD
```bash
# List songs in project
GET /api/projects/my-first-album/songs?userId=USER_ID

# Create song
POST /api/projects/my-first-album/songs
{
  "userId": "USER_ID",
  "title": "New Song",
  "key": "C Major",
  "tempo": 120
}

# Get song
GET /api/projects/my-first-album/songs/SONG_ID?userId=USER_ID

# Update song
PATCH /api/projects/my-first-album/songs/SONG_ID
{
  "userId": "USER_ID",
  "title": "Updated Title"
}

# Delete song
DELETE /api/projects/my-first-album/songs/SONG_ID?userId=USER_ID
```

---

## Verification Checklist

- [ ] Can log in with test credentials
- [ ] Dashboard loads with user name
- [ ] Sidebar shows "Projects" link
- [ ] Projects page lists sample project
- [ ] Can create new project
- [ ] Can view project details
- [ ] Can create songs in project
- [ ] Collaboration hub loads
- [ ] Real-time chat works (Ably)
- [ ] Whiteboard syncs in real-time
- [ ] Video room shows Studio tier access
- [ ] Sessions page loads
- [ ] Setlists page loads
- [ ] Settings allows updates
- [ ] Can navigate all project pages
- [ ] No 404 errors
- [ ] No console errors (except env warnings)

---

## Troubleshooting

### Issue: "Supabase client not initialized"
**Fix:** Add to `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://lzfzkrylexsarpxypktt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Issue: "User not found"
**Fix:** Ensure Step 1 (Supabase user creation) was completed and email is confirmed

### Issue: "No projects shown"
**Fix:** Run Step 2 SQL script to create sample data

### Issue: "Permission denied"
**Fix:** Ensure user is added as ProjectMember with 'owner' role

### Issue: Video collaboration not working
**Fix:** Add to `apps/web/.env.local`:
```
DAILY_API_KEY=your_daily_api_key
```

### Issue: Real-time features not working
**Fix:** Add to `apps/web/.env.local`:
```
NEXT_PUBLIC_ABLY_API_KEY=your_ably_api_key
```

---

## Security Note

**⚠️ This is a TEST account only!**

- Do NOT use in production
- Delete after testing
- Change password if keeping
- Reset usage counters regularly

---

## Quick Start Commands

```bash
# Start development server
cd /Users/justincronk/Desktop/CronkWaters/apps/web
pnpm dev

# Open in browser
open http://localhost:3000/auth

# Sign in with:
# Email: test@cronkwaters.com
# Password: TestRock2024!

# Navigate to projects
open http://localhost:3000/projects
```

---

**🎸 Rock on and test all the features!**

