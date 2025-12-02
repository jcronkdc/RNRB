-- Library Share Links
-- Allows users to create shareable links for their files

CREATE TABLE "LibraryShareLink" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "canDownload" BOOLEAN NOT NULL DEFAULT true,
    "maxViews" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryShareLink_pkey" PRIMARY KEY ("id")
);

-- Unique token for link access
CREATE UNIQUE INDEX "LibraryShareLink_token_key" ON "LibraryShareLink"("token");

-- Index for looking up links by file
CREATE INDEX "LibraryShareLink_fileId_idx" ON "LibraryShareLink"("fileId");

-- Index for looking up links by user
CREATE INDEX "LibraryShareLink_userId_idx" ON "LibraryShareLink"("userId");

-- Foreign key constraints
ALTER TABLE "LibraryShareLink" ADD CONSTRAINT "LibraryShareLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "LibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LibraryShareLink" ADD CONSTRAINT "LibraryShareLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add version tracking to library files
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "LibraryFile" ADD COLUMN IF NOT EXISTS "hash" TEXT;

-- Index for looking up file versions
CREATE INDEX IF NOT EXISTS "LibraryFile_parentId_idx" ON "LibraryFile"("parentId");

-- Index for duplicate detection
CREATE INDEX IF NOT EXISTS "LibraryFile_hash_idx" ON "LibraryFile"("hash");
CREATE INDEX IF NOT EXISTS "LibraryFile_userId_hash_idx" ON "LibraryFile"("userId", "hash");







