-- Create demo user
INSERT INTO "User" (id, email, name, image, "emailVerified", "createdAt", "updatedAt")
VALUES (
  'demo_user_test_001',
  'demo@rockandrollbasement.com',
  'Demo User',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  "updatedAt" = NOW();

-- Create session for demo user (expires in 30 days)
INSERT INTO "Session" (id, "sessionToken", "userId", expires)
VALUES (
  'demo_session_001',
  'demo-session-token-12345-test',
  'demo_user_test_001',
  NOW() + INTERVAL '30 days'
)
ON CONFLICT ("sessionToken") DO UPDATE SET
  expires = EXCLUDED.expires;

-- Verify user creation
SELECT id, email, name, "createdAt" FROM "User" WHERE email = 'demo@rockandrollbasement.com';

-- Verify session creation
SELECT id, "sessionToken", "userId", expires FROM "Session" WHERE "userId" = 'demo_user_test_001';
