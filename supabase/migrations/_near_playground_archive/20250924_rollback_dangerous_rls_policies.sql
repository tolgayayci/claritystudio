-- URGENT: Rollback dangerous RLS policies that allow access to ALL projects
-- This restores the secure RLS policies that only allow access to public projects

DROP POLICY IF EXISTS "Anyone can view public or shared projects" ON projects;
DROP POLICY IF EXISTS "Anyone can view compilation history of public or shared projects" ON compilation_history;
DROP POLICY IF EXISTS "Anyone can view deployments of public or shared projects" ON deployments;

-- Restore secure RLS policy for projects (only public projects accessible anonymously)
CREATE POLICY "Anyone can view public projects"
    ON projects
    FOR SELECT
    TO public
    USING (
        is_public = true OR
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    );

-- Restore secure RLS policy for compilation_history
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

-- Restore secure RLS policy for deployments
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

-- Add comments for documentation
COMMENT ON POLICY "Anyone can view public projects" ON projects IS 'Allow anonymous access only to projects marked as public (is_public = true)';
COMMENT ON POLICY "Anyone can view compilation history of public projects" ON compilation_history IS 'Allow anonymous access to compilation history only for public projects';
COMMENT ON POLICY "Anyone can view deployments of public projects" ON deployments IS 'Allow anonymous access to deployments only for public projects';