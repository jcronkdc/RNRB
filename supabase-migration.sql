-- SongForge MVP Database Schema

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_slug ON projects(slug);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  bpm INTEGER,
  key TEXT,
  mood_tags TEXT[],
  lyrics JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_songs_project_id ON songs(project_id);
CREATE INDEX idx_songs_created_by ON songs(created_by);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  bytes BIGINT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_project_id ON assets(project_id);

-- Host sessions table
CREATE TABLE IF NOT EXISTS host_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_host_sessions_user_id ON host_sessions(user_id);

-- Audience prompts table
CREATE TABLE IF NOT EXISTS audience_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES host_sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed')),
  lyrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audience_prompts_session_id ON audience_prompts(session_id);
CREATE INDEX idx_audience_prompts_status ON audience_prompts(status);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view songs in their projects"
  ON songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = songs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create songs in their projects"
  ON songs FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = songs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view assets in their projects"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = assets.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assets in their projects"
  ON assets FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = assets.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own host sessions"
  ON host_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own host sessions"
  ON host_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view prompts for a session"
  ON audience_prompts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create prompts"
  ON audience_prompts FOR INSERT
  WITH CHECK (true);

-- Storage bucket for audio
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public audio access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');














