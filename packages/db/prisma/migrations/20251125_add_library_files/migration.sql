-- CreateEnum
CREATE TYPE "LibraryFileType" AS ENUM ('stem', 'demo', 'sample', 'loop', 'other');

-- CreateTable
CREATE TABLE "LibraryFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "LibraryFileType" NOT NULL DEFAULT 'other',
    "duration" INTEGER,
    "waveformData" JSONB,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LibraryFile_userId_idx" ON "LibraryFile"("userId");

-- CreateIndex
CREATE INDEX "LibraryFile_type_idx" ON "LibraryFile"("type");

-- CreateIndex
CREATE INDEX "LibraryFile_createdAt_idx" ON "LibraryFile"("createdAt");

-- CreateIndex
CREATE INDEX "LibraryFile_tags_idx" ON "LibraryFile" USING GIN ("tags");

-- AddForeignKey
ALTER TABLE "LibraryFile" ADD CONSTRAINT "LibraryFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;





















