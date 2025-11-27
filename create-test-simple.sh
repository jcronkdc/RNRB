#!/bin/bash

# 🎸 Simple Test Account Creator - Uses Production API

echo "🎸 Creating Test Account via Supabase Admin"
echo "=========================================="
echo ""

TEST_EMAIL="test@cronkwaters.com"
TEST_PASSWORD="TestRock2024!"

echo "📋 Test Account:"
echo "  Email: ${TEST_EMAIL}"
echo "  Password: ${TEST_PASSWORD}"
echo "  Tier: Studio (Full Access)"
echo ""
echo "📝 Instructions:"
echo ""
echo "Since production is 100% operational, create the test account manually:"
echo ""
echo "1. Go to Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users"
echo ""
echo "2. Click 'Add user' and create:"
echo "   - Email: ${TEST_EMAIL}"
echo "   - Password: ${TEST_PASSWORD}"
echo "   - ✅ Check 'Confirm email' (skip verification)"
echo ""
echo "3. Copy the User ID from the created user"
echo ""
echo "4. Run this SQL in your database (replace USER_ID):"
echo ""
cat << 'EOSQL'
-- Replace 'PASTE_USER_ID_HERE' below with actual Supabase user ID

-- Create Studio tier user
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
  'studio', 'active', NOW(),
  0, 0, 0.00,
  NOW(), NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  "subscriptionTier" = 'studio',
  "subscriptionStatus" = 'active';

-- Create org
INSERT INTO "Org" (id, name, slug, type, "createdAt", "updatedAt")
VALUES ('test-org-001', 'Test Studio', 'test-studio-001', 'solo', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Add org membership
INSERT INTO "Membership" ("userId", "orgId", role, status, "joinedAt")
VALUES ('PASTE_USER_ID_HERE', 'test-org-001', 'owner', 'active', NOW())
ON CONFLICT ("userId", "orgId") DO NOTHING;

-- Create project
INSERT INTO "Project" (id, "orgId", name, slug, description, visibility, status, "createdAt", "updatedAt")
VALUES ('test-proj-001', 'test-org-001', 'My Test Album', 'my-test-album', 
        'Testing all features', 'private', 'active', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Add project membership
INSERT INTO "ProjectMember" ("userId", "projectId", role, status, "joinedAt")
VALUES ('PASTE_USER_ID_HERE', 'test-proj-001', 'owner', 'active', NOW())
ON CONFLICT ("userId", "projectId") DO NOTHING;

SELECT '✅ Test account ready!' as status;
EOSQL

echo ""
echo "5. Test the account:"
echo "   Production: https://www.cronkwaters.com/auth"
echo "   Local: http://localhost:3000/auth"
echo ""
echo "🎸 Ready to rock!"























