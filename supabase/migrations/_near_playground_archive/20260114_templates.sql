-- Templates Marketplace Tables
-- Created: 2026-01-14

-- ============================================
-- TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name text NOT NULL,
  description text,

  -- Source (one of: standalone, github, project)
  source_type text NOT NULL CHECK (source_type IN ('standalone', 'github', 'project')),
  code text,                    -- For standalone templates
  github_url text,              -- For GitHub-sourced templates
  github_owner text,
  github_repo text,
  github_branch text DEFAULT 'main',
  github_path text DEFAULT 'src/lib.rs',
  source_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,

  -- Metadata
  category text DEFAULT 'Basic',
  difficulty text DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  tags text[] DEFAULT '{}',
  icon text DEFAULT 'Code2',    -- Lucide icon name

  -- Social
  likes_count integer DEFAULT 0,
  uses_count integer DEFAULT 0,
  view_count integer DEFAULT 0,

  -- Status
  is_official boolean DEFAULT false,
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz DEFAULT now()
);

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(is_featured, likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_templates_official ON templates(is_official);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
-- Anyone can view published templates
CREATE POLICY "Public can view published templates"
  ON templates FOR SELECT
  USING (is_published = true);

-- Users can view their own unpublished templates
CREATE POLICY "Users can view own unpublished templates"
  ON templates FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND is_published = false);

-- Users can create templates
CREATE POLICY "Users can create templates"
  ON templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own templates
CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own templates
CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- TEMPLATE LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS template_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Indexes for template_likes
CREATE INDEX IF NOT EXISTS idx_template_likes_template ON template_likes(template_id);
CREATE INDEX IF NOT EXISTS idx_template_likes_user ON template_likes(user_id);

-- Enable RLS
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_likes
CREATE POLICY "Anyone can view template likes"
  ON template_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like templates"
  ON template_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike templates"
  ON template_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_template_likes_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE templates SET likes_count = likes_count + 1 WHERE id = NEW.template_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE templates SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.template_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS template_likes_count_trigger ON template_likes;
CREATE TRIGGER template_likes_count_trigger
AFTER INSERT OR DELETE ON template_likes
FOR EACH ROW EXECUTE FUNCTION update_template_likes_count();

-- Function to increment uses_count
CREATE OR REPLACE FUNCTION increment_template_uses(template_id_param uuid) RETURNS void AS $$
BEGIN
  UPDATE templates SET uses_count = uses_count + 1 WHERE id = template_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view_count
CREATE OR REPLACE FUNCTION increment_template_views(template_id_param uuid) RETURNS void AS $$
BEGIN
  UPDATE templates SET view_count = view_count + 1 WHERE id = template_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
