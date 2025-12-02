-- Add indexes for improved user search performance
-- These indexes will speed up searches by name, email for the discover feature

-- Index for case-insensitive name searches
CREATE INDEX IF NOT EXISTS "User_name_idx" ON "User" USING gin (to_tsvector('english', COALESCE("name", '')));

-- Index for case-insensitive email searches (partial match)
CREATE INDEX IF NOT EXISTS "User_email_pattern_idx" ON "User" ("email" text_pattern_ops);

-- Index for name pattern matching (prefix searches)
CREATE INDEX IF NOT EXISTS "User_name_pattern_idx" ON "User" ("name" text_pattern_ops);

-- Composite index for musician profile filters
CREATE INDEX IF NOT EXISTS "MusicianProfile_genres_instruments_idx" ON "MusicianProfile" USING gin ("genres", "instruments");

-- Index for available musicians
CREATE INDEX IF NOT EXISTS "MusicianProfile_availability_idx" ON "MusicianProfile" ("availableForCollaboration", "availableForGigs");

























