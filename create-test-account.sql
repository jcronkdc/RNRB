-- Create Test Account with Studio Tier (Supreme Admin Access)
-- Email: test@cronkwaters.com
-- Password: TestRock2024!
-- This account has full access to all AI features, video calls, unlimited projects

-- First, create the Supabase auth user (you'll need to do this via Supabase dashboard or API)
-- Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users
-- Click "Add user" and create:
--   Email: test@cronkwaters.com
--   Password: TestRock2024!
--   Confirm email: true (manually confirm)

-- Once you have the user ID from Supabase, update it below
-- For now, we'll create the database record with a placeholder

-- Insert test user with Studio tier
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
  'test-user-id-replace-after-supabase', -- Replace with actual Supabase user ID
  'test@cronkwaters.com',
  NOW(),
  'Test User (Studio)',
  'studio', -- Studio tier = full access
  'active',
  NOW(),
  0, -- Reset usage counters
  0,
  0.00,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  "subscriptionTier" = 'studio',
  "subscriptionStatus" = 'active',
  "subscriptionStartedAt" = NOW(),
  "aiRequestsUsed" = 0,
  "videoMinutesUsed" = 0,
  "storageUsedGB" = 0.00,
  "usagePeriodStart" = NOW();

-- Create a personal organization for the test user
INSERT INTO "Org" (
  id,
  name,
  slug,
  type,
  "createdAt",
  "updatedAt"
) VALUES (
  'test-org-id',
  'Test Studio',
  'test-studio',
  'solo',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Add test user as owner of the organization
INSERT INTO "Membership" (
  "userId",
  "orgId",
  role,
  status,
  "joinedAt"
) VALUES (
  'test-user-id-replace-after-supabase',
  'test-org-id',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "orgId") DO NOTHING;

-- Create a sample project for testing
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
  'test-project-id',
  'test-org-id',
  'Test Album Project',
  'test-album-project',
  'A test project to explore all features of Rock N'' Roll Basement',
  'Testing all the amazing features',
  'private',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Add test user as project owner
INSERT INTO "ProjectMember" (
  "userId",
  "projectId",
  role,
  status,
  "joinedAt"
) VALUES (
  'test-user-id-replace-after-supabase',
  'test-project-id',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "projectId") DO NOTHING;

-- Create a sample song in the project
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
  'test-song-id',
  'test-user-id-replace-after-supabase',
  'test-project-id',
  'Test Song - Rock Anthem',
  'draft',
  'private',
  'G Major',
  120,
  '4/4',
  E'[Verse 1]\nThis is a test song\nTo show all features\nOf Rock N'' Roll Basement\n\n[Chorus]\nWe''re testing everything\nAI, collaboration, and more\nBuilding the future of music\nOne feature at a time',
  'A sample song to test all songwriting features',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Summary
SELECT 
  '✅ Test Account Setup Complete!' as status,
  'Email: test@cronkwaters.com' as email,
  'Password: TestRock2024!' as password,
  'Tier: Studio (Full Access)' as tier,
  '📝 NEXT STEPS:' as next_steps,
  '1. Create auth user in Supabase Dashboard' as step_1,
  '2. Copy the Supabase user ID' as step_2,
  '3. Replace "test-user-id-replace-after-supabase" with real ID in this script' as step_3,
  '4. Run this SQL script in your database' as step_4;









































