-- 🎸 COPY-PASTE THIS ENTIRE FILE INTO YOUR DATABASE
-- Replace 'YOUR_USER_ID_FROM_SUPABASE' with the actual User ID you copied

-- Step 1: Create Studio tier user
INSERT INTO "User" (
  id, 
  email, 
  "emailVerified", 
  name,
  "subscriptionTier", 
  "subscriptionStatus", 
  "subscriptionStartedAt",
  "aiRequestsUsed", 
  "videoMinutesUsed", 
  "storageUsedGB",
  "usagePeriodStart", 
  "createdAt", 
  "updatedAt"
) VALUES (
  'YOUR_USER_ID_FROM_SUPABASE',
  'rockstar@cronkwaters.com',
  NOW(),
  'Rockstar Test User',
  'studio',
  'active',
  NOW(),
  0,
  0,
  0.00,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  "subscriptionTier" = 'studio',
  "subscriptionStatus" = 'active',
  "aiRequestsUsed" = 0,
  "videoMinutesUsed" = 0,
  name = 'Rockstar Test User';

-- Step 2: Create organization
INSERT INTO "Org" (
  id, 
  name, 
  slug, 
  type, 
  "createdAt", 
  "updatedAt"
) VALUES (
  'rockstar-org-001',
  'Rockstar Studio',
  'rockstar-studio-001',
  'solo',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Step 3: Add user as org owner
INSERT INTO "Membership" (
  "userId", 
  "orgId", 
  role, 
  status, 
  "joinedAt"
) VALUES (
  'YOUR_USER_ID_FROM_SUPABASE',
  'rockstar-org-001',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "orgId") DO NOTHING;

-- Step 4: Create sample project
INSERT INTO "Project" (
  id, 
  "orgId", 
  name, 
  slug, 
  description,
  tagline,
  visibility, 
  status, 
  "createdAt", 
  "updatedAt"
) VALUES (
  'rockstar-proj-001',
  'rockstar-org-001',
  'My Epic Album',
  'my-epic-album',
  'Testing all the awesome features of Rock N'' Roll Basement!',
  'Rocking the test suite 🎸',
  'private',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Step 5: Add user as project owner
INSERT INTO "ProjectMember" (
  "userId", 
  "projectId", 
  role, 
  status, 
  "joinedAt"
) VALUES (
  'YOUR_USER_ID_FROM_SUPABASE',
  'rockstar-proj-001',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "projectId") DO NOTHING;

-- Step 6: Create sample song
INSERT INTO "Song" (
  id,
  "userId",
  "projectId",
  title,
  status,
  visibility,
  key,
  tempo,
  "timeSignature",
  lyrics,
  description,
  "createdAt",
  "updatedAt",
  "lastSavedAt"
) VALUES (
  'rockstar-song-001',
  'YOUR_USER_ID_FROM_SUPABASE',
  'rockstar-proj-001',
  'Test Drive Rock Anthem',
  'draft',
  'private',
  'E Major',
  140,
  '4/4',
  E'[Verse 1]
Testing one two three
All systems are go
The projects feature is alive
Watch the mycelium grow

[Chorus]
We''re building something amazing
Real-time collaboration flows
From the Rock N'' Roll Basement
This is how the mushroom grows',
  'A sample song to test all features - AI, chords, collaboration, everything!',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 
  '✅ Setup complete!' as status,
  'rockstar@cronkwaters.com' as email,
  'TestRock2024!' as password,
  'Studio tier' as subscription,
  '1 org created' as organizations,
  '1 project created' as projects,
  '1 song created' as songs;









