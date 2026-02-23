-- Embeds System Tables
-- Created: 2026-01-14

-- ============================================
-- EMBEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS embeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source (template, project, or github)
  source_type text NOT NULL CHECK (source_type IN ('template', 'project', 'github')),
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  github_url text,

  -- Customization
  button_text text DEFAULT 'Open in NearPlay',
  button_style text DEFAULT 'primary' CHECK (button_style IN ('primary', 'secondary', 'outline', 'ghost')),
  button_size text DEFAULT 'default' CHECK (button_size IN ('sm', 'default', 'lg')),
  theme text DEFAULT 'auto' CHECK (theme IN ('auto', 'light', 'dark')),

  -- Tracking
  click_count integer DEFAULT 0,
  view_count integer DEFAULT 0,

  -- Metadata
  name text,  -- Optional name for the embed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for embeds
CREATE INDEX IF NOT EXISTS idx_embeds_user ON embeds(user_id);
CREATE INDEX IF NOT EXISTS idx_embeds_template ON embeds(template_id);
CREATE INDEX IF NOT EXISTS idx_embeds_project ON embeds(project_id);

-- Enable RLS
ALTER TABLE embeds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for embeds
-- Anyone can view embeds (public for embed landing pages)
CREATE POLICY "Anyone can view embeds"
  ON embeds FOR SELECT
  USING (true);

-- Users can create embeds
CREATE POLICY "Users can create embeds"
  ON embeds FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own embeds
CREATE POLICY "Users can update own embeds"
  ON embeds FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own embeds
CREATE POLICY "Users can delete own embeds"
  ON embeds FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- EMBED CLICKS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS embed_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  embed_id uuid NOT NULL REFERENCES embeds(id) ON DELETE CASCADE,
  referrer text,
  user_agent text,
  ip_hash text,  -- Hashed IP for privacy
  created_at timestamptz DEFAULT now()
);

-- Indexes for embed_clicks
CREATE INDEX IF NOT EXISTS idx_embed_clicks_embed ON embed_clicks(embed_id);
CREATE INDEX IF NOT EXISTS idx_embed_clicks_created ON embed_clicks(created_at DESC);

-- Enable RLS
ALTER TABLE embed_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for embed_clicks
-- Anyone can insert clicks (for tracking)
CREATE POLICY "Anyone can record clicks"
  ON embed_clicks FOR INSERT
  WITH CHECK (true);

-- Users can view clicks for their own embeds
CREATE POLICY "Users can view own embed clicks"
  ON embed_clicks FOR SELECT TO authenticated
  USING (
    embed_id IN (
      SELECT id FROM embeds WHERE user_id = auth.uid()
    )
  );

-- Trigger to update click_count
CREATE OR REPLACE FUNCTION update_embed_click_count() RETURNS trigger AS $$
BEGIN
  UPDATE embeds SET click_count = click_count + 1 WHERE id = NEW.embed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS embed_click_count_trigger ON embed_clicks;
CREATE TRIGGER embed_click_count_trigger
AFTER INSERT ON embed_clicks
FOR EACH ROW EXECUTE FUNCTION update_embed_click_count();

-- Function to increment embed view_count
CREATE OR REPLACE FUNCTION increment_embed_views(embed_id_param uuid) RETURNS void AS $$
BEGIN
  UPDATE embeds SET view_count = view_count + 1 WHERE id = embed_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
