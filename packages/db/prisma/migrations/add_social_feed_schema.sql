-- Social Feed Schema Migration
-- Extends existing community features with full social feed functionality

-- Post Model: Universal social posts (text, audio, images, links)
CREATE TABLE "Post" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "userId" TEXT NOT NULL,
  "content" TEXT,
  "contentType" TEXT NOT NULL DEFAULT 'text', -- text, audio, image, video, link
  
  -- Audio posts (like SoundCloud)
  "audioUrl" TEXT,
  "audioPath" TEXT,
  "waveformData" JSONB,
  "duration" INTEGER, -- in seconds
  "bpm" INTEGER,
  "key" TEXT, -- Musical key
  
  -- Media attachments
  "imageUrls" TEXT[],
  "videoUrl" TEXT,
  "linkUrl" TEXT,
  "linkPreview" JSONB, -- OG tags preview
  
  -- Metadata
  "genre" TEXT,
  "mood" TEXT,
  "tags" TEXT[],
  
  -- Privacy & visibility
  "visibility" TEXT NOT NULL DEFAULT 'public', -- public, friends, private
  "allowComments" BOOLEAN NOT NULL DEFAULT true,
  "allowReactions" BOOLEAN NOT NULL DEFAULT true,
  "allowShares" BOOLEAN NOT NULL DEFAULT true,
  
  -- Engagement metrics
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "shareCount" INTEGER NOT NULL DEFAULT 0,
  "playCount" INTEGER NOT NULL DEFAULT 0, -- for audio posts
  
  -- Original post tracking (for shares/reposts)
  "originalPostId" TEXT, -- If this is a repost
  "sharedFromUserId" TEXT, -- Who originally posted (for reposts)
  
  -- Soft delete
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP,
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "editedAt" TIMESTAMP,
  
  -- Relations
  CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Post_originalPostId_fkey" FOREIGN KEY ("originalPostId") REFERENCES "Post"("id") ON DELETE SET NULL,
  CONSTRAINT "Post_sharedFromUserId_fkey" FOREIGN KEY ("sharedFromUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Post Reactions: Emoji reactions (Facebook-style)
CREATE TABLE "PostReaction" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emoji" TEXT NOT NULL, -- ❤️ 🔥 👏 😮 😂 🎵 🎸 💯
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PostReaction_unique" UNIQUE ("postId", "userId", "emoji")
);

-- Post Shares: Repost/Share functionality (Twitter-style)
CREATE TABLE "PostShare" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "comment" TEXT, -- Optional comment when sharing
  "visibility" TEXT NOT NULL DEFAULT 'public',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "PostShare_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "PostShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PostShare_unique" UNIQUE ("postId", "userId")
);

-- Post Comments: Threaded comments on posts
CREATE TABLE "PostComment" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "parentId" TEXT, -- For threaded replies
  
  -- Audio comment (voice note)
  "audioUrl" TEXT,
  "audioDuration" INTEGER,
  
  -- Reactions on comments
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "replyCount" INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "editedAt" TIMESTAMP,
  
  CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "PostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE CASCADE
);

-- Post Comment Reactions
CREATE TABLE "PostCommentReaction" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "commentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emoji" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "PostCommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE,
  CONSTRAINT "PostCommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PostCommentReaction_unique" UNIQUE ("commentId", "userId", "emoji")
);

-- Post Plays: Track audio post plays (like SoundCloud)
CREATE TABLE "PostPlay" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "postId" TEXT NOT NULL,
  "userId" TEXT, -- Optional - can be anonymous
  "ipAddress" TEXT,
  "duration" INTEGER, -- How long they listened
  "completedAt" TIMESTAMP, -- Did they finish?
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "PostPlay_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "PostPlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Post Bookmarks/Saves
CREATE TABLE "PostBookmark" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "collectionName" TEXT, -- Optional: organize bookmarks into collections
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "PostBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "PostBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PostBookmark_unique" UNIQUE ("postId", "userId")
);

-- Create indexes for performance
CREATE INDEX "Post_userId_idx" ON "Post"("userId");
CREATE INDEX "Post_originalPostId_idx" ON "Post"("originalPostId");
CREATE INDEX "Post_sharedFromUserId_idx" ON "Post"("sharedFromUserId");
CREATE INDEX "Post_visibility_idx" ON "Post"("visibility");
CREATE INDEX "Post_contentType_idx" ON "Post"("contentType");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt" DESC);
CREATE INDEX "Post_genre_idx" ON "Post"("genre");
CREATE INDEX "Post_mood_idx" ON "Post"("mood");
CREATE INDEX "Post_isDeleted_idx" ON "Post"("isDeleted");

CREATE INDEX "PostReaction_postId_idx" ON "PostReaction"("postId");
CREATE INDEX "PostReaction_userId_idx" ON "PostReaction"("userId");
CREATE INDEX "PostReaction_emoji_idx" ON "PostReaction"("emoji");
CREATE INDEX "PostReaction_createdAt_idx" ON "PostReaction"("createdAt" DESC);

CREATE INDEX "PostShare_postId_idx" ON "PostShare"("postId");
CREATE INDEX "PostShare_userId_idx" ON "PostShare"("userId");
CREATE INDEX "PostShare_createdAt_idx" ON "PostShare"("createdAt" DESC);

CREATE INDEX "PostComment_postId_idx" ON "PostComment"("postId");
CREATE INDEX "PostComment_userId_idx" ON "PostComment"("userId");
CREATE INDEX "PostComment_parentId_idx" ON "PostComment"("parentId");
CREATE INDEX "PostComment_createdAt_idx" ON "PostComment"("createdAt" DESC);

CREATE INDEX "PostCommentReaction_commentId_idx" ON "PostCommentReaction"("commentId");
CREATE INDEX "PostCommentReaction_userId_idx" ON "PostCommentReaction"("userId");

CREATE INDEX "PostPlay_postId_idx" ON "PostPlay"("postId");
CREATE INDEX "PostPlay_userId_idx" ON "PostPlay"("userId");
CREATE INDEX "PostPlay_createdAt_idx" ON "PostPlay"("createdAt" DESC);

CREATE INDEX "PostBookmark_postId_idx" ON "PostBookmark"("postId");
CREATE INDEX "PostBookmark_userId_idx" ON "PostBookmark"("userId");
CREATE INDEX "PostBookmark_collectionName_idx" ON "PostBookmark"("collectionName");

