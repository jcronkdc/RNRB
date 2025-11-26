-- CreateTable
CREATE TABLE "CommunityTrack" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "audioPath" TEXT NOT NULL,
    "coverUrl" TEXT,
    "waveformData" JSONB,
    "genre" TEXT,
    "mood" TEXT,
    "bpm" INTEGER,
    "duration" INTEGER NOT NULL,
    "isExplicit" BOOLEAN NOT NULL DEFAULT false,
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "allowRemix" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackLike" (
    "id" TEXT NOT NULL,
    "communityTrackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackPlay" (
    "id" TEXT NOT NULL,
    "communityTrackId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "duration" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackComment" (
    "id" TEXT NOT NULL,
    "communityTrackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityTrack_songId_key" ON "CommunityTrack"("songId");

-- CreateIndex
CREATE INDEX "CommunityTrack_userId_idx" ON "CommunityTrack"("userId");

-- CreateIndex
CREATE INDEX "CommunityTrack_songId_idx" ON "CommunityTrack"("songId");

-- CreateIndex
CREATE INDEX "CommunityTrack_publishedAt_idx" ON "CommunityTrack"("publishedAt");

-- CreateIndex
CREATE INDEX "CommunityTrack_genre_idx" ON "CommunityTrack"("genre");

-- CreateIndex
CREATE INDEX "CommunityTrack_mood_idx" ON "CommunityTrack"("mood");

-- CreateIndex
CREATE UNIQUE INDEX "TrackLike_communityTrackId_userId_key" ON "TrackLike"("communityTrackId", "userId");

-- CreateIndex
CREATE INDEX "TrackLike_communityTrackId_idx" ON "TrackLike"("communityTrackId");

-- CreateIndex
CREATE INDEX "TrackLike_userId_idx" ON "TrackLike"("userId");

-- CreateIndex
CREATE INDEX "TrackPlay_communityTrackId_idx" ON "TrackPlay"("communityTrackId");

-- CreateIndex
CREATE INDEX "TrackPlay_userId_idx" ON "TrackPlay"("userId");

-- CreateIndex
CREATE INDEX "TrackPlay_createdAt_idx" ON "TrackPlay"("createdAt");

-- CreateIndex
CREATE INDEX "TrackComment_communityTrackId_idx" ON "TrackComment"("communityTrackId");

-- CreateIndex
CREATE INDEX "TrackComment_userId_idx" ON "TrackComment"("userId");

-- CreateIndex
CREATE INDEX "TrackComment_parentId_idx" ON "TrackComment"("parentId");

-- CreateIndex
CREATE INDEX "TrackComment_createdAt_idx" ON "TrackComment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "UserFollow_followerId_idx" ON "UserFollow"("followerId");

-- CreateIndex
CREATE INDEX "UserFollow_followingId_idx" ON "UserFollow"("followingId");

-- AddForeignKey
ALTER TABLE "CommunityTrack" ADD CONSTRAINT "CommunityTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityTrack" ADD CONSTRAINT "CommunityTrack_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackLike" ADD CONSTRAINT "TrackLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackLike" ADD CONSTRAINT "TrackLike_communityTrackId_fkey" FOREIGN KEY ("communityTrackId") REFERENCES "CommunityTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackPlay" ADD CONSTRAINT "TrackPlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackPlay" ADD CONSTRAINT "TrackPlay_communityTrackId_fkey" FOREIGN KEY ("communityTrackId") REFERENCES "CommunityTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackComment" ADD CONSTRAINT "TrackComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackComment" ADD CONSTRAINT "TrackComment_communityTrackId_fkey" FOREIGN KEY ("communityTrackId") REFERENCES "CommunityTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackComment" ADD CONSTRAINT "TrackComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TrackComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;






