-- Embed Code Snapshot Feature
-- Created: 2026-01-15
--
-- Adds columns to store project code snapshots in embeds.
-- This allows project embeds to work regardless of project visibility,
-- and ensures the embed shows the code at the time it was created.

-- Add code column to store project code snapshot
ALTER TABLE embeds ADD COLUMN IF NOT EXISTS code text;

-- Add snapshot metadata columns
ALTER TABLE embeds ADD COLUMN IF NOT EXISTS snapshot_name text;
ALTER TABLE embeds ADD COLUMN IF NOT EXISTS snapshot_description text;

-- Add comment for documentation
COMMENT ON COLUMN embeds.code IS 'Snapshot of project code at embed creation time';
COMMENT ON COLUMN embeds.snapshot_name IS 'Original project name at snapshot time';
COMMENT ON COLUMN embeds.snapshot_description IS 'Original project description at snapshot time';
