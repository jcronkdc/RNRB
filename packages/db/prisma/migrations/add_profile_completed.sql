-- Migration: Add profileCompleted field to User table
-- This field tracks whether a new user has completed their initial profile setup

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Set existing users to have completed profiles (they're already using the system)
UPDATE "User" SET "profileCompleted" = true WHERE "createdAt" < NOW();













