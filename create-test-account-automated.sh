#!/bin/bash

# 🎸 AUTOMATED TEST ACCOUNT SETUP
# This script creates a test account via Supabase Admin API

echo "🎸 Creating Test Account for Rock N' Roll Basement"
echo "=================================================="
echo ""

# Configuration
TEST_EMAIL="rockstar@cronkwaters.com"
TEST_PASSWORD="TestRock2024!"
SUPABASE_URL="https://lzfzkrylexsarpxypktt.supabase.co"

# Check if SUPABASE_SERVICE_ROLE_KEY is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set"
  echo ""
  echo "To use this script, you need the Supabase service role key."
  echo ""
  echo "Get it from:"
  echo "  https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/settings/api"
  echo ""
  echo "Then run:"
  echo "  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
  echo "  ./create-test-account-automated.sh"
  echo ""
  exit 1
fi

echo "Step 1: Creating auth user..."
echo ""

# Create user via Supabase Admin API
response=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"name\": \"Test Rockstar\"
    }
  }")

# Extract user ID
USER_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ Failed to create user"
  echo "Response: $response"
  exit 1
fi

echo "✅ User created: $USER_ID"
echo ""

echo "Step 2: Setting up database records..."
echo ""

# Create SQL to insert test data
SQL="
-- Insert user with Studio tier
INSERT INTO \"User\" (
  id, email, \"emailVerified\", name,
  \"subscriptionTier\", \"subscriptionStatus\", \"subscriptionStartedAt\",
  \"aiRequestsUsed\", \"videoMinutesUsed\", \"storageUsedGB\",
  \"usagePeriodStart\", \"createdAt\", \"updatedAt\"
) VALUES (
  '$USER_ID',
  '$TEST_EMAIL',
  NOW(),
  'Test Rockstar',
  'studio', 'active', NOW(),
  0, 0, 0.00,
  NOW(), NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  \"subscriptionTier\" = 'studio',
  \"subscriptionStatus\" = 'active';

-- Create org
INSERT INTO \"Org\" (id, name, slug, type, \"createdAt\", \"updatedAt\")
VALUES ('test-org-rockstar', 'Rockstar Studio', 'rockstar-studio', 'solo', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Add org membership
INSERT INTO \"Membership\" (\"userId\", \"orgId\", role, status, \"joinedAt\")
VALUES ('$USER_ID', 'test-org-rockstar', 'owner', 'active', NOW())
ON CONFLICT (\"userId\", \"orgId\") DO NOTHING;

-- Create project
INSERT INTO \"Project\" (
  id, \"orgId\", name, slug, description,
  visibility, status, \"createdAt\", \"updatedAt\"
)
VALUES (
  'test-proj-rockstar',
  'test-org-rockstar',
  'My Epic Album',
  'my-epic-album-rockstar',
  'Test project for songwriting and collaboration',
  'private', 'active', NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Add project membership
INSERT INTO \"ProjectMember\" (\"userId\", \"projectId\", role, status, \"joinedAt\")
VALUES ('$USER_ID', 'test-proj-rockstar', 'owner', 'active', NOW())
ON CONFLICT (\"userId\", \"projectId\") DO NOTHING;

-- Create test song
INSERT INTO \"Song\" (
  id, \"projectId\", \"userId\", title, lyrics, chords,
  key, tempo, status, visibility, \"createdAt\", \"updatedAt\"
)
VALUES (
  'test-song-rockstar',
  'test-proj-rockstar',
  '$USER_ID',
  'Test Drive Rock Anthem',
  E'[VERSE]\nCruising down the highway\nWindows down, music up\n\n[CHORUS]\nRock and roll forever\nLet the good times roll',
  ARRAY['E', 'A', 'B', 'E'],
  'E',
  140,
  'draft',
  'private',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = 'Test Drive Rock Anthem (Updated)';

SELECT '✅ Test account setup complete!' as status;
"

# Save SQL to file
echo "$SQL" > /tmp/test-account-setup.sql

echo "SQL file created: /tmp/test-account-setup.sql"
echo ""
echo "Step 3: Running SQL in database..."
echo ""

# Execute SQL via Supabase PostgREST API
# Note: This requires the database URL and direct SQL execution
echo "⚠️  SQL execution requires manual step or database connection string"
echo ""
echo "Option 1: Run SQL in Supabase SQL Editor:"
echo "  https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/editor"
echo ""
echo "Option 2: Run via psql (if you have DATABASE_URL):"
echo "  psql \$DATABASE_URL < /tmp/test-account-setup.sql"
echo ""
echo "Option 3: Use Prisma Studio:"
echo "  cd packages/db && pnpm prisma studio"
echo "  Then manually execute the SQL above"
echo ""

echo "═══════════════════════════════════════════════════"
echo "📋 Test Account Details:"
echo "═══════════════════════════════════════════════════"
echo "  Email:    $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo "  User ID:  $USER_ID"
echo "  Tier:     Studio (Full Access)"
echo ""
echo "✅ Auth user created successfully!"
echo "⏳ Database records require manual SQL execution"
echo ""
echo "🎸 Ready to rock once SQL is executed!"

