#!/bin/bash

# 🎸 Rock N' Roll Basement - Test Account Creator
# This script creates a test account with Studio tier (supreme admin access)

echo "🎸 Rock N' Roll Basement - Creating Test Account"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test account credentials
TEST_EMAIL="test@cronkwaters.com"
TEST_PASSWORD="TestRock2024!"
TEST_NAME="Test Studio User"

echo -e "${BLUE}📋 Test Account Details:${NC}"
echo -e "  Email: ${GREEN}${TEST_EMAIL}${NC}"
echo -e "  Password: ${GREEN}${TEST_PASSWORD}${NC}"
echo -e "  Tier: ${GREEN}Studio (Full Access)${NC}"
echo ""

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found in apps/web/${NC}"
    echo "Please create apps/web/.env.local with Supabase credentials"
    exit 1
fi

# Source environment variables
source apps/web/.env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  Missing Supabase environment variables${NC}"
    echo "Please add to apps/web/.env.local:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=https://lzfzkrylexsarpxypktt.supabase.co"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
    exit 1
fi

echo -e "${BLUE}🔧 Creating Supabase auth user...${NC}"

# Create Supabase user via API
SUPABASE_RESPONSE=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"options\": {
      \"data\": {
        \"name\": \"${TEST_NAME}\"
      }
    }
  }")

# Extract user ID from response
USER_ID=$(echo $SUPABASE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
    echo -e "${YELLOW}⚠️  User might already exist or creation failed${NC}"
    echo "Response: $SUPABASE_RESPONSE"
    echo ""
    echo "Trying to sign in instead..."
    
    # Try to sign in
    SIGNIN_RESPONSE=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
      -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"${TEST_EMAIL}\",
        \"password\": \"${TEST_PASSWORD}\"
      }")
    
    USER_ID=$(echo $SIGNIN_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$USER_ID" ]; then
        echo -e "${YELLOW}⚠️  Could not get user ID${NC}"
        echo "Please create user manually in Supabase Dashboard:"
        echo "  https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Supabase user created/found: ${USER_ID}${NC}"
echo ""

echo -e "${BLUE}🗄️  Creating database records...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not found${NC}"
    echo "Please add DATABASE_URL to apps/web/.env.local or .env"
    exit 1
fi

# Create SQL file with actual user ID
SQL_FILE="/tmp/create-test-user-${USER_ID}.sql"

cat > $SQL_FILE << EOF
-- Insert/Update test user with Studio tier
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
  '${USER_ID}',
  '${TEST_EMAIL}',
  NOW(),
  '${TEST_NAME}',
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
  "subscriptionStartedAt" = NOW(),
  "aiRequestsUsed" = 0,
  "videoMinutesUsed" = 0,
  "storageUsedGB" = 0.00,
  "usagePeriodStart" = NOW(),
  name = '${TEST_NAME}';

-- Create personal organization
INSERT INTO "Org" (
  id,
  name,
  slug,
  type,
  "createdAt",
  "updatedAt"
) VALUES (
  'test-org-${USER_ID}',
  '${TEST_NAME} Studio',
  'test-studio-${USER_ID}',
  'solo',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Add user as org owner
INSERT INTO "Membership" (
  "userId",
  "orgId",
  role,
  status,
  "joinedAt"
) VALUES (
  '${USER_ID}',
  'test-org-${USER_ID}',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "orgId") DO NOTHING;

-- Create sample project
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
  'test-project-${USER_ID}',
  'test-org-${USER_ID}',
  'My First Album',
  'my-first-album-${USER_ID}',
  'A test project to explore all features',
  'Testing all the amazing features of Rock N'' Roll Basement',
  'private',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Add user as project owner
INSERT INTO "ProjectMember" (
  "userId",
  "projectId",
  role,
  status,
  "joinedAt"
) VALUES (
  '${USER_ID}',
  'test-project-${USER_ID}',
  'owner',
  'active',
  NOW()
) ON CONFLICT ("userId", "projectId") DO NOTHING;

-- Create sample songs
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
  'test-song-1-${USER_ID}',
  '${USER_ID}',
  'test-project-${USER_ID}',
  'Rock Anthem',
  'draft',
  'private',
  'G Major',
  120,
  '4/4',
  E'[Verse 1]
This is my first song
In Rock N'' Roll Basement
Testing all features

[Chorus]
We''re building the future
Of collaborative music
One feature at a time',
  'A test song to explore songwriting features',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

SELECT 
  '✅ Test account setup complete!' as status,
  '${USER_ID}' as user_id,
  '${TEST_EMAIL}' as email,
  'studio' as tier,
  '1 project created' as projects,
  '1 song created' as songs;
EOF

# Run SQL via Prisma
echo "Executing database setup..."
cd packages/db
export DATABASE_URL=$DATABASE_URL
pnpm prisma db execute --file $SQL_FILE --schema prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Test account created successfully!${NC}"
    echo ""
    echo -e "${BLUE}🎸 Login Details:${NC}"
    echo "  📧 Email: ${GREEN}${TEST_EMAIL}${NC}"
    echo "  🔑 Password: ${GREEN}${TEST_PASSWORD}${NC}"
    echo "  👑 Tier: ${GREEN}Studio (Full Access)${NC}"
    echo ""
    echo -e "${BLUE}✨ Features Unlocked:${NC}"
    echo "  ✅ Unlimited AI requests"
    echo "  ✅ Video collaboration (Daily.co)"
    echo "  ✅ Unlimited projects"
    echo "  ✅ Unlimited collaborators"
    echo "  ✅ 100 GB storage"
    echo "  ✅ Real-time chat & whiteboard"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "  1. Go to: ${GREEN}http://localhost:3000/auth${NC}"
    echo "  2. Sign in with the credentials above"
    echo "  3. Explore: Dashboard → Projects → Collaboration"
    echo ""
else
    echo -e "${YELLOW}⚠️  Database setup failed${NC}"
    echo "SQL file saved to: $SQL_FILE"
    echo "You can run it manually with: pnpm prisma db execute --file $SQL_FILE"
fi

# Cleanup
rm -f $SQL_FILE









