-- CreateTable: MusicSample (profile audio samples)
CREATE TABLE "MusicSample" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "audioPath" TEXT NOT NULL,
    "duration" INTEGER,
    "genre" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MusicSample_userId_idx" ON "MusicSample"("userId");

-- CreateIndex
CREATE INDEX "MusicSample_sortOrder_idx" ON "MusicSample"("sortOrder");

-- AddForeignKey
ALTER TABLE "MusicSample" ADD CONSTRAINT "MusicSample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: UserFollow (add friend request fields)
ALTER TABLE "UserFollow" ADD COLUMN "message" TEXT;
ALTER TABLE "UserFollow" ADD COLUMN "acceptedAt" TIMESTAMP(3);
