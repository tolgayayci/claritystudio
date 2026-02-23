-- Schema Updates for Template Marketplace
-- Created: 2026-01-15

-- ============================================
-- 1. DROP template_likes, CREATE generic likes
-- ============================================

-- Drop the template_likes table and its trigger
DROP TRIGGER IF EXISTS template_likes_count_trigger ON template_likes;
DROP FUNCTION IF EXISTS update_template_likes_count();
DROP TABLE IF EXISTS template_likes CASCADE;

-- Create generic likes table for templates, projects, embeds, etc.
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('template', 'project', 'embed')),
  target_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

-- Enable RLS for likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like"
  ON likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to update likes_count on templates and projects
CREATE OR REPLACE FUNCTION update_likes_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'template' THEN
      UPDATE templates SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'project' THEN
      UPDATE projects SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'template' THEN
      UPDATE templates SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'project' THEN
      UPDATE projects SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ============================================
-- 2. MODIFY templates table
-- ============================================

-- Drop the standalone source type constraint and add new one
ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_source_type_check;
ALTER TABLE templates ADD CONSTRAINT templates_source_type_check
  CHECK (source_type IN ('github', 'project'));

-- Drop the code column (no standalone code, always stored in backend)
ALTER TABLE templates DROP COLUMN IF EXISTS code;

-- Add storage_path column for backend storage reference
ALTER TABLE templates ADD COLUMN IF NOT EXISTS storage_path text;

-- ============================================
-- 3. Add likes_count to projects if not exists
-- ============================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;
