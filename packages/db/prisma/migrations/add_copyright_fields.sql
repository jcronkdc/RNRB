-- Add Copyright & Publishing fields to songs table
-- Migration: add_copyright_fields
-- Date: 2025-11-25

-- Add ISRC field (International Standard Recording Code)
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "isrc" VARCHAR(12);

-- Add copyright information JSON field (stores all copyright details)
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "copyrightInfo" JSONB;

-- Add audio storage fields
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "audioPath" TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS "Song_isrc_idx" ON "Song"("isrc");

-- Add comment for documentation
COMMENT ON COLUMN "Song"."copyrightInfo" IS 'JSON field containing copyright year, holder, PRO affiliation, splits, and publishing details';
COMMENT ON COLUMN "Song"."audioUrl" IS 'Public URL to uploaded audio file (instrumental/demo)';
COMMENT ON COLUMN "Song"."audioPath" IS 'Storage path for audio file in cloud storage';

