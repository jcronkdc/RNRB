-- Add email tier system to User model
-- Required for RNRB Mail feature

-- Add EmailTier enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "EmailTier" AS ENUM ('NONE', 'BASIC', 'PRO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add email tier fields to User table
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "emailTier" "EmailTier" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "emailProSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "emailProStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "emailAccountsLimit" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "emailStorageQuotaBytes" BIGINT NOT NULL DEFAULT 0;

-- Add unique constraint on emailProSubscriptionId
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_emailProSubscriptionId_key" UNIQUE ("emailProSubscriptionId");
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- Update existing paid users to have BASIC email tier
UPDATE "User"
SET 
  "emailTier" = 'BASIC',
  "emailAccountsLimit" = 1,
  "emailStorageQuotaBytes" = 1073741824  -- 1GB
WHERE 
  "subscriptionTier" IN ('creator', 'studio')
  AND "subscriptionStatus" = 'active'
  AND "emailTier" = 'NONE';

-- Update platform owner to have PRO email tier
UPDATE "User"
SET 
  "emailTier" = 'PRO',
  "emailAccountsLimit" = -1,  -- unlimited
  "emailStorageQuotaBytes" = 10737418240  -- 10GB
WHERE 
  "isOwner" = true;

