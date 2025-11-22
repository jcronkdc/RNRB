-- Migration: Add Usage Tracking Fields
-- Purpose: Track AI requests and video call minutes to enforce tier limits
-- Protects profit margins by preventing power user abuse

-- Add usage tracking fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiRequestsUsed" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "videoMinutesUsed" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "usagePeriodStart" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "storageUsedGB" DECIMAL(10,2) DEFAULT 0;

-- Add indexes for efficient usage queries
CREATE INDEX IF NOT EXISTS "User_usagePeriodStart_idx" ON "User"("usagePeriodStart");

-- Add comment for documentation
COMMENT ON COLUMN "User"."aiRequestsUsed" IS 'AI requests used in current billing period';
COMMENT ON COLUMN "User"."videoMinutesUsed" IS 'Video call minutes used in current billing period';
COMMENT ON COLUMN "User"."usagePeriodStart" IS 'Start date of current usage period (resets monthly)';
COMMENT ON COLUMN "User"."storageUsedGB" IS 'Total storage used in GB';

