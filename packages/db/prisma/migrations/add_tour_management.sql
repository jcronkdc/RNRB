-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('planning', 'announced', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ShowStatus" AS ENUM ('scheduled', 'soldout', 'cancelled', 'postponed', 'completed');

-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('club', 'theater', 'arena', 'stadium', 'festival', 'other');

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "TourStatus" NOT NULL DEFAULT 'planning',
    "posterImage" TEXT,
    "sponsorLogos" JSONB,
    "merch" JSONB,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "VenueType" NOT NULL DEFAULT 'club',
    "capacity" INTEGER,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "parkingInfo" TEXT,
    "accessibilityInfo" TEXT,
    "images" JSONB,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "tourId" TEXT,
    "orgId" TEXT NOT NULL,
    "projectId" TEXT,
    "venueId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "doorsTime" TIMESTAMP(3),
    "soundcheckTime" TIMESTAMP(3),
    "setLength" INTEGER,
    "status" "ShowStatus" NOT NULL DEFAULT 'scheduled',
    "ticketUrl" TEXT,
    "ticketPrice" JSONB,
    "ageRestriction" TEXT,
    "supportingActs" JSONB,
    "notes" TEXT,
    "posterImage" TEXT,
    "livestreamUrl" TEXT,
    "recordingUrl" TEXT,
    "attendance" INTEGER,
    "grossRevenue" DECIMAL(65,30),
    "public" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setlist" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "name" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetlistItem" (
    "id" TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    "songId" TEXT,
    "position" INTEGER NOT NULL,
    "notes" TEXT,
    "duration" INTEGER,
    "isEncore" BOOLEAN NOT NULL DEFAULT false,
    "customTitle" TEXT,

    CONSTRAINT "SetlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanEngagement" (
    "id" TEXT NOT NULL,
    "showId" TEXT,
    "tourId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "notifyShows" BOOLEAN NOT NULL DEFAULT true,
    "notifyMerch" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tour_slug_key" ON "Tour"("slug");
CREATE INDEX "Tour_orgId_idx" ON "Tour"("orgId");
CREATE INDEX "Tour_status_idx" ON "Tour"("status");
CREATE INDEX "Tour_startDate_idx" ON "Tour"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");
CREATE INDEX "Venue_city_idx" ON "Venue"("city");
CREATE INDEX "Venue_type_idx" ON "Venue"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Show_slug_key" ON "Show"("slug");
CREATE INDEX "Show_tourId_idx" ON "Show"("tourId");
CREATE INDEX "Show_orgId_idx" ON "Show"("orgId");
CREATE INDEX "Show_venueId_idx" ON "Show"("venueId");
CREATE INDEX "Show_date_idx" ON "Show"("date");
CREATE INDEX "Show_status_idx" ON "Show"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Setlist_showId_key" ON "Setlist"("showId");

-- CreateIndex
CREATE INDEX "SetlistItem_setlistId_idx" ON "SetlistItem"("setlistId");
CREATE INDEX "SetlistItem_songId_idx" ON "SetlistItem"("songId");

-- CreateIndex
CREATE INDEX "FanEngagement_email_idx" ON "FanEngagement"("email");
CREATE INDEX "FanEngagement_showId_idx" ON "FanEngagement"("showId");
CREATE INDEX "FanEngagement_tourId_idx" ON "FanEngagement"("tourId");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setlist" ADD CONSTRAINT "Setlist_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetlistItem" ADD CONSTRAINT "SetlistItem_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "Setlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetlistItem" ADD CONSTRAINT "SetlistItem_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanEngagement" ADD CONSTRAINT "FanEngagement_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanEngagement" ADD CONSTRAINT "FanEngagement_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;

