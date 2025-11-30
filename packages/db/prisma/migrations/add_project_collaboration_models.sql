-- Migration: Add Invitation and ProjectMember models for collaboration
-- Created: 2025-11-21
-- Purpose: Fix missing collaboration tables that API routes reference

-- Create Invitation table for generic invites (projects + orgs)
CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orgId" TEXT,
    "projectId" TEXT,
    "senderId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Invitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invitation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create ProjectMember table for project collaboration
CREATE TABLE IF NOT EXISTS "ProjectMember" (
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("userId", "projectId"),
    CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX IF NOT EXISTS "Invitation_token_idx" ON "Invitation"("token");
CREATE INDEX IF NOT EXISTS "Invitation_orgId_idx" ON "Invitation"("orgId");
CREATE INDEX IF NOT EXISTS "Invitation_projectId_idx" ON "Invitation"("projectId");
CREATE INDEX IF NOT EXISTS "Invitation_status_idx" ON "Invitation"("status");
CREATE INDEX IF NOT EXISTS "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- ============================================================================
-- AUTHORIZATION NOTE (2025-11-30)
-- ============================================================================
-- RLS (Row Level Security) policies were REMOVED because they are INEFFECTIVE
-- with the NextAuth + Prisma architecture used in this application.
--
-- The RLS policies expected JWT claims via current_setting('request.jwt.claims'),
-- but Prisma does NOT set PostgreSQL session variables. Therefore, the policies
-- were never enforced.
--
-- AUTHORIZATION is handled at the APPLICATION layer:
-- - NextAuth validates JWT sessions before any API route execution
-- - Each API route checks session.user.id for ownership/access control
-- - Prisma queries filter by userId for data isolation
-- - Role checks (owner/admin/member) performed in TypeScript code
--
-- See: packages/db/prisma/migrations/20251130_fix_rls_security/migration.sql
-- ============================================================================



