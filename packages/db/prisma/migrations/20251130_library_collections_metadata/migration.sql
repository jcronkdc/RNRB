-- Migration: Enhanced Library with Collections and Metadata
-- Description: Adds collections, BPM, key, mood, favorites, play tracking, lyrics search, and version control

-- Add new columns to LibraryFile
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "bpm" INTEGER;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "musicalKey" TEXT;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "mood" TEXT;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "playCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "lastPlayed" TIMESTAMP(3);
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "lyrics" TEXT;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "chordData" JSONB;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "collectionId" TEXT;

-- Create LibraryCollection table
CREATE TABLE IF NOT EXISTS "LibraryCollection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryCollection_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on collection name per user
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryCollection_userId_name_key" ON "LibraryCollection"("userId", "name");

-- Create indexes
CREATE INDEX IF NOT EXISTS "LibraryCollection_userId_idx" ON "LibraryCollection"("userId");
CREATE INDEX IF NOT EXISTS "LibraryFile_collectionId_idx" ON "LibraryFile"("collectionId");
CREATE INDEX IF NOT EXISTS "LibraryFile_isFavorite_idx" ON "LibraryFile"("isFavorite");
CREATE INDEX IF NOT EXISTS "LibraryFile_bpm_idx" ON "LibraryFile"("bpm");
CREATE INDEX IF NOT EXISTS "LibraryFile_musicalKey_idx" ON "LibraryFile"("musicalKey");

-- Add foreign key constraints
ALTER TABLE "LibraryCollection" ADD CONSTRAINT "LibraryCollection_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LibraryFile" ADD CONSTRAINT "LibraryFile_collectionId_fkey" 
    FOREIGN KEY ("collectionId") REFERENCES "LibraryCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;









