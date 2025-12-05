-- Migration: Fix RLS Security Model
-- Created: 2025-11-30
-- Purpose: Remove ineffective RLS policies and document correct authorization model

-- ============================================================================
-- SECURITY ARCHITECTURE DOCUMENTATION
-- ============================================================================
-- 
-- This migration removes Row Level Security (RLS) policies that were previously
-- defined but are INEFFECTIVE because:
--
-- 1. The application uses NextAuth v5 with JWT sessions stored in HTTP cookies
-- 2. The RLS policies expected JWT claims via current_setting('request.jwt.claims')
-- 3. Prisma (our ORM) does NOT set PostgreSQL session variables with JWT claims
-- 4. Therefore, the RLS policies were NEVER enforced and provided FALSE security
--
-- AUTHORIZATION MODEL:
-- ---------------------
-- All authorization is handled at the APPLICATION layer:
-- 
-- - Session authentication: NextAuth validates JWT before any route execution
-- - API authorization: Each API route checks session.user.id for access control
-- - Resource ownership: Prisma queries filter by userId for data isolation
-- - Role-based access: Membership/ProjectMember roles checked in application code
--
-- This is the CORRECT approach for a Prisma + NextAuth application because:
-- 1. Full TypeScript type safety for authorization logic
-- 2. Consistent error handling and logging
-- 3. Rate limiting and security middleware applied uniformly
-- 4. No false sense of security from ineffective database policies
--
-- ============================================================================

-- Step 1: Drop all ineffective RLS policies on Invitation table
DO $$ 
BEGIN
    -- Drop policies if they exist (safe to run multiple times)
    DROP POLICY IF EXISTS "Users can view their own invitations" ON "Invitation";
    DROP POLICY IF EXISTS "Senders can view invitations they sent" ON "Invitation";
    DROP POLICY IF EXISTS "Org admins can create invitations" ON "Invitation";
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, that's fine
        NULL;
END $$;

-- Step 2: Drop all ineffective RLS policies on ProjectMember table
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Project members can view team members" ON "ProjectMember";
    DROP POLICY IF EXISTS "Project admins can add members" ON "ProjectMember";
    DROP POLICY IF EXISTS "Members can leave projects" ON "ProjectMember";
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, that's fine
        NULL;
END $$;

-- Step 3: Disable RLS on these tables (it was providing false security)
-- RLS with FORCE disabled means all authenticated database connections can access
-- data, which is expected since all access goes through the application layer
DO $$ 
BEGIN
    ALTER TABLE "Invitation" DISABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE "ProjectMember" DISABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Step 4: Add table-level comments documenting the security model
COMMENT ON TABLE "Invitation" IS 
'Invitation records for project/org collaboration.
AUTHORIZATION: Handled at application layer via NextAuth session validation.
API routes check senderId ownership and membership roles before operations.';

COMMENT ON TABLE "ProjectMember" IS 
'Project membership records linking users to projects with roles.
AUTHORIZATION: Handled at application layer via NextAuth session validation.
API routes verify project ownership/membership before data access.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After this migration, verify no RLS policies exist:
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('Invitation', 'ProjectMember');
-- 
-- Expected result: 0 rows
-- ============================================================================













