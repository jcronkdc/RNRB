-- Add SongRequest table for client song request feature
-- This allows public users to request songs for a setlist

CREATE TYPE "SongRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "SongRequest" (
    "id" TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    "songTitle" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "dedication" TEXT,
    "status" "SongRequestStatus" NOT NULL DEFAULT 'pending',
    "responseMessage" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SongRequest_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "SongRequest" ADD CONSTRAINT "SongRequest_setlistId_fkey" 
    FOREIGN KEY ("setlistId") REFERENCES "Setlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX "SongRequest_setlistId_idx" ON "SongRequest"("setlistId");
CREATE INDEX "SongRequest_status_idx" ON "SongRequest"("status");
CREATE INDEX "SongRequest_createdAt_idx" ON "SongRequest"("createdAt");

