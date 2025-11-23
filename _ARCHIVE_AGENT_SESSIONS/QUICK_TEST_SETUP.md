# 🎸 QUICK START - Test Account Setup (COPY-PASTE READY)

## 🚀 You now have 2 windows open:

1. **Supabase Dashboard** - Create auth user
2. **Prisma Studio** (http://localhost:5555) - Add database records

---

## 📋 Step-by-Step (3 minutes)

### ✅ **STEP 1: Supabase Dashboard** (1 min)

In the Supabase window:

1. Click **"Add user"** (green button, top right)
2. Fill in:
   ```
   Email:    rockstar@cronkwaters.com
   Password: TestRock2024!
   ```
3. ✅ **CHECK "Confirm email"** (very important!)
4. Click **"Create user"**
5. **COPY THE USER ID** (looks like: `abc123-def456-...`)

---

### ✅ **STEP 2: Run SQL** (2 minutes)

**Option A: Via Prisma Studio** (Easiest)
1. In Prisma Studio (http://localhost:5555):
2. Click "Query" tab at top
3. Paste this SQL (replace `YOUR_USER_ID_FROM_SUPABASE`):

**Option B: Direct Database**
If you have database access, run the SQL from `setup-test-user.sql`

Here's the complete SQL (copy-paste ready):

```sql
-- 🎸 REPLACE 'YOUR_USER_ID_FROM_SUPABASE' WITH ACTUAL ID

-- Create Studio tier user
INSERT INTO "User" (id, email, "emailVerified", name, "subscriptionTier", "subscriptionStatus", "subscriptionStartedAt", "aiRequestsUsed", "videoMinutesUsed", "storageUsedGB", "usagePeriodStart", "createdAt", "updatedAt")
VALUES ('YOUR_USER_ID_FROM_SUPABASE', 'rockstar@cronkwaters.com', NOW(), 'Rockstar Test User', 'studio', 'active', NOW(), 0, 0, 0.00, NOW(), NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET "subscriptionTier" = 'studio', "subscriptionStatus" = 'active', "aiRequestsUsed" = 0, name = 'Rockstar Test User';

INSERT INTO "Org" (id, name, slug, type, "createdAt", "updatedAt")
VALUES ('rockstar-org-001', 'Rockstar Studio', 'rockstar-studio-001', 'solo', NOW(), NOW()) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Membership" ("userId", "orgId", role, status, "joinedAt")
VALUES ('YOUR_USER_ID_FROM_SUPABASE', 'rockstar-org-001', 'owner', 'active', NOW()) ON CONFLICT ("userId", "orgId") DO NOTHING;

INSERT INTO "Project" (id, "orgId", name, slug, description, tagline, visibility, status, "createdAt", "updatedAt")
VALUES ('rockstar-proj-001', 'rockstar-org-001', 'My Epic Album', 'my-epic-album', 'Testing all features!', 'Rocking the test suite 🎸', 'private', 'active', NOW(), NOW()) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "ProjectMember" ("userId", "projectId", role, status, "joinedAt")
VALUES ('YOUR_USER_ID_FROM_SUPABASE', 'rockstar-proj-001', 'owner', 'active', NOW()) ON CONFLICT ("userId", "projectId") DO NOTHING;

INSERT INTO "Song" (id, "userId", "projectId", title, status, visibility, key, tempo, "timeSignature", lyrics, description, "createdAt", "updatedAt", "lastSavedAt")
VALUES ('rockstar-song-001', 'YOUR_USER_ID_FROM_SUPABASE', 'rockstar-proj-001', 'Test Drive Rock Anthem', 'draft', 'private', 'E Major', 140, '4/4', E'[Verse 1]\nTesting one two three\nAll systems are go\n\n[Chorus]\nWe''re building something amazing', 'Sample song for testing', NOW(), NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

SELECT '✅ Setup complete!' as result;
```

---

## ✨ **STEP 3: Test It!**

Once SQL runs successfully:

### Test on Production:
```
URL: https://www.cronkwaters.com/auth
Email: rockstar@cronkwaters.com
Password: TestRock2024!
```

### Or Test Locally:
```
URL: http://localhost:3000/auth
Email: rockstar@cronkwaters.com  
Password: TestRock2024!
```

---

## 🎯 **What to Test After Sign In**

1. **Dashboard** → See welcome message with your name
2. **Projects** (sidebar) → See "My Epic Album" project
3. **Create Project** → Click "New Project" and create one
4. **View Project** → Click on "My Epic Album"
5. **Add Song** → Create a new song in the project
6. **Collaborate** → Test chat, video, whiteboard
7. **Sessions** → Log a recording session
8. **Setlists** → Create a setlist
9. **Settings** → Update project details

---

## 🔥 **CREDENTIALS**

```
📧 Email:    rockstar@cronkwaters.com
🔑 Password: TestRock2024!
👑 Tier:     Studio (Supreme Access)
```

**Features Unlocked:**
- ✅ Unlimited AI requests
- ✅ Video collaboration
- ✅ Unlimited projects
- ✅ Unlimited collaborators
- ✅ Real-time chat & whiteboard
- ✅ 100 GB storage

---

## ⚡ **Quick Copy-Paste Checklist**

- [ ] Copy User ID from Supabase
- [ ] Replace `YOUR_USER_ID_FROM_SUPABASE` in SQL
- [ ] Run SQL (via Prisma Studio or database client)
- [ ] Go to https://www.cronkwaters.com/auth
- [ ] Sign in with: rockstar@cronkwaters.com / TestRock2024!
- [ ] Navigate to /projects
- [ ] Test all features!

---

**🎸 Ready when you are! Just paste that User ID into the SQL and run it!**

