-- AI Persistent Memory System
-- Stores learned facts, preferences, and insights about users

-- Create memory types enum
CREATE TYPE "MemoryType" AS ENUM (
  'fact',           -- Explicit fact: "User's album is due in January"
  'preference',     -- Preference: "User prefers writing in G major"
  'goal',           -- Goal: "User wants to release an EP by summer"
  'correction',     -- Correction: "User said they don't like country"
  'context',        -- Important context: "User is in a band called The Waves"
  'relationship',   -- Relationship: "Sarah is user's main co-writer"
  'insight'         -- AI insight: "User is most productive on Tuesdays"
);

-- Create priority enum
CREATE TYPE "MemoryPriority" AS ENUM (
  'critical',   -- Always include in context
  'high',       -- Include when relevant
  'medium',     -- Include when space allows
  'low'         -- Archive, rarely surface
);

-- Create the AI Memory table
CREATE TABLE "AIMemory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "MemoryType" NOT NULL DEFAULT 'fact',
  "priority" "MemoryPriority" NOT NULL DEFAULT 'medium',
  "content" TEXT NOT NULL,           -- The actual memory content
  "context" TEXT,                    -- Where/how this was learned
  "source" TEXT,                     -- conversation, analysis, user_stated
  "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,  -- How confident we are (0-1)
  "lastAccessed" TIMESTAMP(3),       -- When AI last used this memory
  "accessCount" INTEGER NOT NULL DEFAULT 0,  -- How often this is accessed
  "expiresAt" TIMESTAMP(3),          -- Optional expiration
  "supersededBy" TEXT,               -- If this memory was updated/replaced
  "tags" TEXT[],                     -- For filtering/searching
  "relatedEntityId" TEXT,            -- Related song/project/tour ID
  "relatedEntityType" TEXT,          -- song, project, tour, collaborator
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AIMemory_pkey" PRIMARY KEY ("id")
);

-- Create conversation summary table for compressed long-term memory
CREATE TABLE "ConversationSummary" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,           -- Brief summary of conversation
  "keyTopics" TEXT[],                -- Main topics discussed
  "actionsTaken" TEXT[],             -- Actions AI performed
  "userSentiment" TEXT,              -- positive, neutral, frustrated
  "unresolved" TEXT,                 -- Any unresolved questions/tasks
  "learnings" TEXT[],                -- Things learned about user
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ConversationSummary_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "AIMemory_userId_idx" ON "AIMemory"("userId");
CREATE INDEX "AIMemory_userId_type_idx" ON "AIMemory"("userId", "type");
CREATE INDEX "AIMemory_userId_priority_idx" ON "AIMemory"("userId", "priority");
CREATE INDEX "AIMemory_tags_idx" ON "AIMemory" USING GIN ("tags");
CREATE INDEX "ConversationSummary_userId_idx" ON "ConversationSummary"("userId");

-- Add foreign key constraints
ALTER TABLE "AIMemory" ADD CONSTRAINT "AIMemory_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ConversationSummary" ADD CONSTRAINT "ConversationSummary_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ConversationSummary" ADD CONSTRAINT "ConversationSummary_conversationId_fkey" 
  FOREIGN KEY ("conversationId") REFERENCES "AssistantConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

