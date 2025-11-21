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

-- Enable RLS (Row Level Security) for security
ALTER TABLE "Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMember" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Invitation
-- Users can see invitations sent to their email
CREATE POLICY "Users can view their own invitations"
    ON "Invitation" FOR SELECT
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Users can see invitations they sent
CREATE POLICY "Senders can view invitations they sent"
    ON "Invitation" FOR SELECT
    USING ("senderId" = current_setting('request.jwt.claims', true)::json->>'sub');

-- Org admins can create invitations for their orgs
CREATE POLICY "Org admins can create invitations"
    ON "Invitation" FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Membership"
            WHERE "userId" = current_setting('request.jwt.claims', true)::json->>'sub'
            AND "orgId" = "Invitation"."orgId"
            AND "role" IN ('owner', 'admin')
        )
    );

-- RLS Policies for ProjectMember
-- Project members can view other members of the same project
CREATE POLICY "Project members can view team members"
    ON "ProjectMember" FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "ProjectMember" pm
            WHERE pm."projectId" = "ProjectMember"."projectId"
            AND pm."userId" = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Project owners/admins can add members
CREATE POLICY "Project admins can add members"
    ON "ProjectMember" FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "ProjectMember"
            WHERE "projectId" = "ProjectMember"."projectId"
            AND "userId" = current_setting('request.jwt.claims', true)::json->>'sub'
            AND "role" IN ('owner', 'admin')
        )
    );

-- Users can leave projects they're members of
CREATE POLICY "Members can leave projects"
    ON "ProjectMember" FOR DELETE
    USING ("userId" = current_setting('request.jwt.claims', true)::json->>'sub');



