-- Add UPDATE policy for deployments table
-- Allows users to update deployments for their own projects
-- This is needed so verification status can be saved to deployment metadata

CREATE POLICY "Users can update own deployments"
  ON deployments
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
