-- Create share_links table for permalink generation
CREATE TABLE IF NOT EXISTS public.share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_project_id ON public.share_links(project_id);
CREATE INDEX IF NOT EXISTS idx_share_links_is_active ON public.share_links(is_active);

-- Enable RLS on share_links
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_links table
-- Anyone can view active share links
CREATE POLICY "Anyone can view active share links"
    ON public.share_links
    FOR SELECT
    USING (is_active = true);

-- Users can create share links for their own projects
CREATE POLICY "Users can create share links for own projects"
    ON public.share_links
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = share_links.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Users can update their own share links
CREATE POLICY "Users can update own share links"
    ON public.share_links
    FOR UPDATE
    USING (created_by = auth.uid());

-- Users can delete their own share links
CREATE POLICY "Users can delete own share links"
    ON public.share_links
    FOR DELETE
    USING (created_by = auth.uid());

-- Fix RLS policies for anonymous access to public projects
-- Drop existing policy and recreate with proper anonymous access
DROP POLICY IF EXISTS "Anyone can view public projects" ON projects;
CREATE POLICY "Anyone can view public projects"
    ON projects
    FOR SELECT
    TO public  -- This allows anonymous access
    USING (
        is_public = true OR
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    );

-- Allow anonymous access to compilation_history for public projects
DROP POLICY IF EXISTS "Anyone can view compilation history of public projects" ON compilation_history;
CREATE POLICY "Anyone can view compilation history of public projects"
    ON compilation_history
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = compilation_history.project_id 
            AND projects.is_public = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = compilation_history.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Allow anonymous access to deployments for public projects
DROP POLICY IF EXISTS "Anyone can view deployments of public projects" ON deployments;
CREATE POLICY "Anyone can view deployments of public projects"
    ON deployments
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = deployments.project_id 
            AND projects.is_public = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = deployments.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Function to generate unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    token_exists BOOLEAN;
BEGIN
    LOOP
        result := '';
        -- Generate 6-character token
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
        
        -- Check if token already exists
        SELECT EXISTS(SELECT 1 FROM share_links WHERE token = result) INTO token_exists;
        
        -- If unique, return it
        IF NOT token_exists THEN
            RETURN result;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to increment share link view count
CREATE OR REPLACE FUNCTION increment_share_link_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE share_links
    SET 
        view_count = view_count + 1,
        last_viewed_at = NOW()
    WHERE token = NEW.share_token;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add share_token column to project_views to track which share link was used
ALTER TABLE project_views 
ADD COLUMN IF NOT EXISTS share_token TEXT REFERENCES share_links(token) ON DELETE SET NULL;

-- Create trigger to update share link view count
DROP TRIGGER IF EXISTS increment_share_link_view_count_on_new_view ON project_views;
CREATE TRIGGER increment_share_link_view_count_on_new_view
    AFTER INSERT ON project_views
    FOR EACH ROW
    WHEN (NEW.share_token IS NOT NULL)
    EXECUTE FUNCTION increment_share_link_view_count();

-- Add comments for documentation
COMMENT ON TABLE share_links IS 'Stores shareable permalinks for projects';
COMMENT ON COLUMN share_links.token IS 'Unique 6-character alphanumeric token for the share link';
COMMENT ON COLUMN share_links.expires_at IS 'Optional expiry date for the share link';
COMMENT ON COLUMN share_links.view_count IS 'Number of times this specific share link has been accessed';