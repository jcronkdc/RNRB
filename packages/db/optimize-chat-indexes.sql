-- Optimized Chat Message Indexes Migration
-- Safe to run - only adds indexes, no data changes

-- Drop existing simple indexes if they exist
DROP INDEX IF EXISTS "ChatMessage_channelId_createdAt_idx";
DROP INDEX IF EXISTS "ChatMessage_senderId_idx";
DROP INDEX IF EXISTS "ChatMessage_channelType_idx";
DROP INDEX IF EXISTS "ChatMessage_messageType_idx";
DROP INDEX IF EXISTS "ChatMessage_threadId_idx";

-- Add optimized compound indexes
CREATE INDEX IF NOT EXISTS "ChatMessage_channelId_createdAt_idx" 
  ON "ChatMessage"("channelId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "ChatMessage_channelId_messageType_createdAt_idx" 
  ON "ChatMessage"("channelId", "messageType", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "ChatMessage_senderId_createdAt_idx" 
  ON "ChatMessage"("senderId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "ChatMessage_channelType_channelId_idx" 
  ON "ChatMessage"("channelType", "channelId");

CREATE INDEX IF NOT EXISTS "ChatMessage_threadId_createdAt_idx" 
  ON "ChatMessage"("threadId", "createdAt");

CREATE INDEX IF NOT EXISTS "ChatMessage_isDeleted_channelId_createdAt_idx" 
  ON "ChatMessage"("isDeleted", "channelId", "createdAt");

-- Add GIN index for mentions array (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS "ChatMessage_mentions_idx" 
  ON "ChatMessage" USING GIN ("mentions");

-- Analyze table to update query planner statistics
ANALYZE "ChatMessage";





















