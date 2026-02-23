-- Official Templates Migration
-- Created: 2026-01-28
-- Purpose: Support official templates that can exist without a user owner

-- ============================================
-- MODIFY TEMPLATES TABLE
-- ============================================

-- Make user_id nullable for official templates (system-owned)
ALTER TABLE templates ALTER COLUMN user_id DROP NOT NULL;

-- Add display_order column for controlling template ordering
ALTER TABLE templates ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 999;

-- Create index for display_order
CREATE INDEX IF NOT EXISTS idx_templates_display_order ON templates(display_order, created_at);

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================

-- Drop existing delete policy
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

-- Create new delete policy that prevents deletion of official templates
CREATE POLICY "Users can delete own non-official templates"
  ON templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND is_official = false);

-- Update the view policy to include official templates (they have null user_id)
DROP POLICY IF EXISTS "Public can view published templates" ON templates;
CREATE POLICY "Public can view published templates"
  ON templates FOR SELECT
  USING (is_published = true);

-- ============================================
-- INSERT OFFICIAL TEMPLATES
-- ============================================

-- Note: The actual template files will be cloned by the backend on startup.
-- This just creates the database records with is_official = true.

INSERT INTO templates (
  id,
  user_id,
  name,
  description,
  source_type,
  storage_path,
  github_url,
  github_owner,
  github_repo,
  github_branch,
  github_path,
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  display_order,
  created_at,
  updated_at,
  published_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'Counter',
    'A simple counter contract demonstrating state management and basic NEAR SDK patterns. Perfect for learning the fundamentals.',
    'github',
    '00000000-0000-0000-0000-000000000001',
    'https://github.com/near-examples/counters',
    'near-examples',
    'counters',
    'main',
    'contract-rs',
    'Basic',
    'Beginner',
    ARRAY['counter', 'beginner', 'state-management'],
    'Code2',
    true,
    true,
    false,
    1,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    NULL,
    'Hello World',
    'The classic Hello World contract that stores and retrieves a greeting message. Great starting point for NEAR development.',
    'github',
    '00000000-0000-0000-0000-000000000002',
    'https://github.com/near-examples/hello-near-examples',
    'near-examples',
    'hello-near-examples',
    'main',
    'contract-rs',
    'Basic',
    'Beginner',
    ARRAY['hello-world', 'beginner', 'greeting'],
    'MessageCircle',
    true,
    true,
    false,
    2,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    NULL,
    'Fungible Token',
    'NEP-141 compliant fungible token implementation. Create your own token with transfer, storage management, and metadata support.',
    'github',
    '00000000-0000-0000-0000-000000000003',
    'https://github.com/near-examples/FT',
    'near-examples',
    'FT',
    'master',
    NULL,
    'Token',
    'Intermediate',
    ARRAY['nep-141', 'fungible-token', 'token', 'defi'],
    'Coins',
    true,
    true,
    false,
    3,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004'::uuid,
    NULL,
    'Non-Fungible Token',
    'NEP-171 compliant NFT implementation with minting, transfers, approvals, and enumeration. Build your own NFT collection.',
    'github',
    '00000000-0000-0000-0000-000000000004',
    'https://github.com/near-examples/NFT',
    'near-examples',
    'NFT',
    'master',
    NULL,
    'Token',
    'Intermediate',
    ARRAY['nep-171', 'nft', 'collectibles', 'digital-assets'],
    'Image',
    true,
    true,
    false,
    4,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005'::uuid,
    NULL,
    'Cross Contract Calls',
    'Learn how to make cross-contract calls between NEAR smart contracts. Essential pattern for building composable applications.',
    'github',
    '00000000-0000-0000-0000-000000000005',
    'https://github.com/near-examples/cross-contract-calls',
    'near-examples',
    'cross-contract-calls',
    'main',
    'contract-simple-rs',
    'Advanced',
    'Advanced',
    ARRAY['cross-contract', 'promises', 'callbacks', 'composability'],
    'Link2',
    true,
    true,
    false,
    5,
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  storage_path = EXCLUDED.storage_path,
  github_url = EXCLUDED.github_url,
  github_owner = EXCLUDED.github_owner,
  github_repo = EXCLUDED.github_repo,
  github_branch = EXCLUDED.github_branch,
  github_path = EXCLUDED.github_path,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  tags = EXCLUDED.tags,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
