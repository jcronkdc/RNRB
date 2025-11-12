-- Add artist profile fields to Org model
ALTER TABLE "Org" ADD COLUMN "bio" TEXT;
ALTER TABLE "Org" ADD COLUMN "location" TEXT;
ALTER TABLE "Org" ADD COLUMN "genre" TEXT[];
ALTER TABLE "Org" ADD COLUMN "influences" TEXT[];
ALTER TABLE "Org" ADD COLUMN "founded" INTEGER;
ALTER TABLE "Org" ADD COLUMN "socialLinks" JSONB;
ALTER TABLE "Org" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Org" ADD COLUMN "bookingEmail" TEXT;
ALTER TABLE "Org" ADD COLUMN "pressKitUrl" TEXT;
ALTER TABLE "Org" ADD COLUMN "epkData" JSONB;
ALTER TABLE "Org" ADD COLUMN "achievements" JSONB;
ALTER TABLE "Org" ADD COLUMN "spotifyArtistId" TEXT;
ALTER TABLE "Org" ADD COLUMN "appleMusicId" TEXT;
ALTER TABLE "Org" ADD COLUMN "images" JSONB;
ALTER TABLE "Org" ADD COLUMN "verified" BOOLEAN DEFAULT false;

-- Create indexes
CREATE INDEX "Org_genre_idx" ON "Org" USING GIN("genre");
CREATE INDEX "Org_location_idx" ON "Org"("location");

-- Create Band Members table
CREATE TABLE "BandMember" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "image" TEXT,
    "instruments" TEXT[],
    "socialLinks" JSONB,
    "joinedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BandMember_pkey" PRIMARY KEY ("id")
);

-- Create Press Release table
CREATE TABLE "PressRelease" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "publishedAt" TIMESTAMP(3),
    "attachments" JSONB,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressRelease_pkey" PRIMARY KEY ("id")
);

-- Create Award table
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "image" TEXT,
    "verificationUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "BandMember_orgId_idx" ON "BandMember"("orgId");
CREATE UNIQUE INDEX "PressRelease_slug_key" ON "PressRelease"("slug");
CREATE INDEX "PressRelease_orgId_idx" ON "PressRelease"("orgId");
CREATE INDEX "PressRelease_publishedAt_idx" ON "PressRelease"("publishedAt");
CREATE INDEX "Award_orgId_idx" ON "Award"("orgId");
CREATE INDEX "Award_year_idx" ON "Award"("year");

-- Add foreign keys
ALTER TABLE "BandMember" ADD CONSTRAINT "BandMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PressRelease" ADD CONSTRAINT "PressRelease_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Award" ADD CONSTRAINT "Award_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

