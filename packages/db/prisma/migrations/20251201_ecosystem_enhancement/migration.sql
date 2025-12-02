-- ECOSYSTEM ENHANCEMENT MIGRATION
-- Adding: Collaboration Needs, Opportunities, Activity Stream, Revenue Tracking
-- The mycelial network that connects everything

-- ============================================
-- COLLABORATION NEEDS - "Looking for..."
-- ============================================
CREATE TABLE IF NOT EXISTS "CollaborationNeed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "songId" TEXT,
    
    -- What they're looking for
    "needType" TEXT NOT NULL, -- "musician", "producer", "mixer", "vocalist", "writer", "other"
    "title" TEXT NOT NULL,
    "description" TEXT,
    
    -- Specifics
    "instruments" TEXT[],
    "genres" TEXT[],
    "skills" TEXT[],
    
    -- Compensation
    "isPaid" BOOLEAN DEFAULT false,
    "budget" DECIMAL(10, 2),
    "compensation" TEXT, -- "paid", "royalty_share", "credit_only", "negotiable"
    
    -- Location/Remote
    "isRemote" BOOLEAN DEFAULT true,
    "location" TEXT,
    
    -- Status
    "status" TEXT DEFAULT 'open', -- "open", "filled", "closed", "paused"
    "urgency" TEXT DEFAULT 'normal', -- "low", "normal", "high", "urgent"
    
    -- Visibility
    "visibility" TEXT DEFAULT 'public', -- "public", "connections", "private"
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    
    CONSTRAINT "CollaborationNeed_pkey" PRIMARY KEY ("id")
);

-- Responses to collaboration needs
CREATE TABLE IF NOT EXISTS "CollaborationApplication" (
    "id" TEXT NOT NULL,
    "needId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    
    -- Application
    "message" TEXT NOT NULL,
    "portfolioUrls" TEXT[],
    "audioSamples" TEXT[],
    
    -- Status
    "status" TEXT DEFAULT 'pending', -- "pending", "reviewing", "accepted", "rejected", "withdrawn"
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    
    CONSTRAINT "CollaborationApplication_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- OPPORTUNITIES - Gigs, Sync, Session Work
-- ============================================
CREATE TABLE IF NOT EXISTS "Opportunity" (
    "id" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "orgId" TEXT,
    
    -- Opportunity Type
    "type" TEXT NOT NULL, -- "gig", "session", "sync_license", "tour", "teaching", "other"
    "title" TEXT NOT NULL,
    "description" TEXT,
    
    -- Requirements
    "instruments" TEXT[],
    "genres" TEXT[],
    "skills" TEXT[],
    "experienceLevel" TEXT, -- "beginner", "intermediate", "advanced", "professional"
    
    -- Compensation
    "compensation" TEXT NOT NULL, -- "paid", "royalty_share", "door_split", "tips", "unpaid"
    "payAmount" DECIMAL(10, 2),
    "payType" TEXT, -- "flat", "hourly", "per_show", "per_song", "negotiable"
    "payDetails" TEXT,
    
    -- Location
    "isRemote" BOOLEAN DEFAULT false,
    "location" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "venueId" TEXT,
    
    -- Timing
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isOngoing" BOOLEAN DEFAULT false,
    
    -- Capacity
    "positionsAvailable" INTEGER DEFAULT 1,
    "positionsFilled" INTEGER DEFAULT 0,
    
    -- Status
    "status" TEXT DEFAULT 'open', -- "open", "filled", "closed", "expired"
    "visibility" TEXT DEFAULT 'public',
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    
    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OpportunityApplication" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    
    -- Application
    "coverLetter" TEXT,
    "portfolioUrls" TEXT[],
    "audioSamples" TEXT[],
    "availability" TEXT,
    "expectedPay" DECIMAL(10, 2),
    
    -- Status
    "status" TEXT DEFAULT 'pending', -- "pending", "shortlisted", "interviewed", "accepted", "rejected"
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "OpportunityApplication_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- ACTIVITY STREAM - The Heartbeat
-- ============================================
CREATE TABLE IF NOT EXISTS "ActivityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    
    -- Event Type
    "type" TEXT NOT NULL, 
    -- Types: song_created, song_completed, song_shared, project_started, project_completed,
    -- collaboration_started, collaboration_completed, show_announced, show_completed,
    -- milestone_reached, practice_streak, follow, joined_project, gear_added, etc.
    
    -- Event Data
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB, -- Flexible data for different event types
    
    -- Related Entities (polymorphic)
    "songId" TEXT,
    "projectId" TEXT,
    "showId" TEXT,
    "tourId" TEXT,
    "collaborationNeedId" TEXT,
    "opportunityId" TEXT,
    "targetUserId" TEXT, -- For follow events, etc.
    
    -- Visibility
    "visibility" TEXT DEFAULT 'public', -- "public", "followers", "connections", "private"
    "isHighlighted" BOOLEAN DEFAULT false, -- Featured on profile
    
    -- Engagement
    "celebrationCount" INTEGER DEFAULT 0, -- Like "applause"
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- Celebrations on activity events (like applause)
CREATE TABLE IF NOT EXISTS "ActivityCelebration" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT DEFAULT '🎉',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ActivityCelebration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ActivityCelebration_unique" UNIQUE ("activityId", "userId")
);

-- ============================================
-- REVENUE TRACKING - Money Flow
-- ============================================
CREATE TABLE IF NOT EXISTS "Revenue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    
    -- Source
    "source" TEXT NOT NULL, -- "gig", "streaming", "sync", "merch", "teaching", "session", "royalty", "tip", "other"
    "platform" TEXT, -- "spotify", "apple_music", "youtube", "bandcamp", "venue", etc.
    
    -- Amount
    "amount" DECIMAL(10, 2) NOT NULL,
    "currency" TEXT DEFAULT 'USD',
    "netAmount" DECIMAL(10, 2), -- After fees/cuts
    
    -- Related Entities
    "songId" TEXT,
    "showId" TEXT,
    "projectId" TEXT,
    "opportunityId" TEXT,
    
    -- Details
    "description" TEXT,
    "notes" TEXT,
    
    -- Date
    "earnedDate" DATE NOT NULL,
    "receivedDate" DATE,
    
    -- Status
    "status" TEXT DEFAULT 'received', -- "pending", "received", "disputed"
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- MUSICIAN STATUS - Current state
-- ============================================
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "currentStatus" TEXT; -- "writing", "recording", "touring", "available", "taking_break"
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "statusMessage" TEXT;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "lookingFor" TEXT[]; -- ["vocalist", "drummer", "producer"]
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "openToOpportunities" BOOLEAN DEFAULT true;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "featuredSongId" TEXT;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "featuredProjectId" TEXT;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "totalPracticeMinutes" INTEGER DEFAULT 0;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "currentStreak" INTEGER DEFAULT 0;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "longestStreak" INTEGER DEFAULT 0;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "completedSongs" INTEGER DEFAULT 0;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "completedProjects" INTEGER DEFAULT 0;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "collaborationsCount" INTEGER DEFAULT 0;
ALTER TABLE "MusicianProfile" ADD COLUMN IF NOT EXISTS "showsPlayed" INTEGER DEFAULT 0;

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS "CollaborationNeed_userId_idx" ON "CollaborationNeed"("userId");
CREATE INDEX IF NOT EXISTS "CollaborationNeed_status_idx" ON "CollaborationNeed"("status");
CREATE INDEX IF NOT EXISTS "CollaborationNeed_needType_idx" ON "CollaborationNeed"("needType");
CREATE INDEX IF NOT EXISTS "CollaborationNeed_visibility_idx" ON "CollaborationNeed"("visibility");

CREATE INDEX IF NOT EXISTS "CollaborationApplication_needId_idx" ON "CollaborationApplication"("needId");
CREATE INDEX IF NOT EXISTS "CollaborationApplication_applicantId_idx" ON "CollaborationApplication"("applicantId");

CREATE INDEX IF NOT EXISTS "Opportunity_postedById_idx" ON "Opportunity"("postedById");
CREATE INDEX IF NOT EXISTS "Opportunity_type_idx" ON "Opportunity"("type");
CREATE INDEX IF NOT EXISTS "Opportunity_status_idx" ON "Opportunity"("status");
CREATE INDEX IF NOT EXISTS "Opportunity_city_idx" ON "Opportunity"("city");
CREATE INDEX IF NOT EXISTS "Opportunity_startDate_idx" ON "Opportunity"("startDate");

CREATE INDEX IF NOT EXISTS "OpportunityApplication_opportunityId_idx" ON "OpportunityApplication"("opportunityId");
CREATE INDEX IF NOT EXISTS "OpportunityApplication_applicantId_idx" ON "OpportunityApplication"("applicantId");

CREATE INDEX IF NOT EXISTS "ActivityEvent_userId_idx" ON "ActivityEvent"("userId");
CREATE INDEX IF NOT EXISTS "ActivityEvent_type_idx" ON "ActivityEvent"("type");
CREATE INDEX IF NOT EXISTS "ActivityEvent_createdAt_idx" ON "ActivityEvent"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ActivityEvent_visibility_idx" ON "ActivityEvent"("visibility");

CREATE INDEX IF NOT EXISTS "Revenue_userId_idx" ON "Revenue"("userId");
CREATE INDEX IF NOT EXISTS "Revenue_source_idx" ON "Revenue"("source");
CREATE INDEX IF NOT EXISTS "Revenue_earnedDate_idx" ON "Revenue"("earnedDate" DESC);

-- ============================================
-- FOREIGN KEYS
-- ============================================
ALTER TABLE "CollaborationNeed" 
    ADD CONSTRAINT "CollaborationNeed_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "CollaborationNeed" 
    ADD CONSTRAINT "CollaborationNeed_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL;
ALTER TABLE "CollaborationNeed" 
    ADD CONSTRAINT "CollaborationNeed_songId_fkey" 
    FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL;

ALTER TABLE "CollaborationApplication" 
    ADD CONSTRAINT "CollaborationApplication_needId_fkey" 
    FOREIGN KEY ("needId") REFERENCES "CollaborationNeed"("id") ON DELETE CASCADE;
ALTER TABLE "CollaborationApplication" 
    ADD CONSTRAINT "CollaborationApplication_applicantId_fkey" 
    FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Opportunity" 
    ADD CONSTRAINT "Opportunity_postedById_fkey" 
    FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Opportunity" 
    ADD CONSTRAINT "Opportunity_venueId_fkey" 
    FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL;

ALTER TABLE "OpportunityApplication" 
    ADD CONSTRAINT "OpportunityApplication_opportunityId_fkey" 
    FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE;
ALTER TABLE "OpportunityApplication" 
    ADD CONSTRAINT "OpportunityApplication_applicantId_fkey" 
    FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "ActivityEvent" 
    ADD CONSTRAINT "ActivityEvent_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ActivityEvent" 
    ADD CONSTRAINT "ActivityEvent_songId_fkey" 
    FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL;
ALTER TABLE "ActivityEvent" 
    ADD CONSTRAINT "ActivityEvent_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL;
ALTER TABLE "ActivityEvent" 
    ADD CONSTRAINT "ActivityEvent_showId_fkey" 
    FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL;

ALTER TABLE "ActivityCelebration" 
    ADD CONSTRAINT "ActivityCelebration_activityId_fkey" 
    FOREIGN KEY ("activityId") REFERENCES "ActivityEvent"("id") ON DELETE CASCADE;
ALTER TABLE "ActivityCelebration" 
    ADD CONSTRAINT "ActivityCelebration_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Revenue" 
    ADD CONSTRAINT "Revenue_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Revenue" 
    ADD CONSTRAINT "Revenue_songId_fkey" 
    FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL;
ALTER TABLE "Revenue" 
    ADD CONSTRAINT "Revenue_showId_fkey" 
    FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL;

-- Featured song/project on profile
ALTER TABLE "MusicianProfile" 
    ADD CONSTRAINT "MusicianProfile_featuredSongId_fkey" 
    FOREIGN KEY ("featuredSongId") REFERENCES "Song"("id") ON DELETE SET NULL;
ALTER TABLE "MusicianProfile" 
    ADD CONSTRAINT "MusicianProfile_featuredProjectId_fkey" 
    FOREIGN KEY ("featuredProjectId") REFERENCES "Project"("id") ON DELETE SET NULL;





