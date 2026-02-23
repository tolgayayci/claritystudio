-- Migration: Allow reading user email only if they have published a template
-- This is a minimal permission - only exposes email for template authors

-- Add policy to allow reading user info only for users who have published templates
CREATE POLICY "Can read template author info"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT DISTINCT user_id
      FROM public.templates
      WHERE is_published = true
    )
  );
