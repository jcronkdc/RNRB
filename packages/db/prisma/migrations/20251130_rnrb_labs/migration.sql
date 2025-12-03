-- R&R Labs Research Division Schema
-- Migration: 2025-11-30
-- Purpose: Add tables for volunteer management, contributions, and feedback

-- LabsVolunteer - Research program volunteers
CREATE TABLE IF NOT EXISTS "LabsVolunteer" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "userId" TEXT,
    "musicianType" TEXT,
    "experience" TEXT,
    "instruments" TEXT[] DEFAULT '{}',
    "genres" TEXT[] DEFAULT '{}',
    "interests" TEXT[] DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "audioUploads" INTEGER NOT NULL DEFAULT 0,
    "midiUploads" INTEGER NOT NULL DEFAULT 0,
    "feedbackCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- LabsContribution - Audio/MIDI uploads and surveys
CREATE TABLE IF NOT EXISTS "LabsContribution" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "volunteerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "duration" INTEGER,
    "genre" TEXT,
    "bpm" INTEGER,
    "key" TEXT,
    "description" TEXT,
    "canUseForTraining" BOOLEAN NOT NULL DEFAULT true,
    "license" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("volunteerId") REFERENCES "LabsVolunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- LabsFeedback - Volunteer feedback on generated content
CREATE TABLE IF NOT EXISTS "LabsFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "volunteerId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "rating" INTEGER,
    "feedback" TEXT NOT NULL,
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("volunteerId") REFERENCES "LabsVolunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "LabsVolunteer_status_idx" ON "LabsVolunteer"("status");
CREATE INDEX IF NOT EXISTS "LabsVolunteer_userId_idx" ON "LabsVolunteer"("userId");
CREATE INDEX IF NOT EXISTS "LabsVolunteer_createdAt_idx" ON "LabsVolunteer"("createdAt");

CREATE INDEX IF NOT EXISTS "LabsContribution_volunteerId_idx" ON "LabsContribution"("volunteerId");
CREATE INDEX IF NOT EXISTS "LabsContribution_type_idx" ON "LabsContribution"("type");
CREATE INDEX IF NOT EXISTS "LabsContribution_status_idx" ON "LabsContribution"("status");

CREATE INDEX IF NOT EXISTS "LabsFeedback_volunteerId_idx" ON "LabsFeedback"("volunteerId");
CREATE INDEX IF NOT EXISTS "LabsFeedback_targetType_idx" ON "LabsFeedback"("targetType");

-- Add labs_update to NotificationType enum (if not already present)
-- This is handled by Prisma automatically when it sees the enum change











