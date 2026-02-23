-- Seed Official Templates
-- Run this after the migrations to populate the database with official templates
-- Note: These templates reference code stored in the backend template-storage directory

-- First, let's create the official templates
-- The storage_path will be created by the backend when the templates are cloned

-- Hello World Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Admin user
  'Hello World',
  'The Hello World smart contract stores a greeting in its state, and exposes two functions to interact with it. Perfect for learning the basics of NEAR development.',
  'github',
  NULL, -- Will be set when cloned
  'https://github.com/near-examples/hello-near-rust',
  'near-examples',
  'hello-near-rust',
  'main',
  'Basic',
  'Beginner',
  ARRAY['greeting', 'basic', 'starter'],
  'MessageCircle',
  true,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Counter Contract Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Counter Contract',
  'A foundational smart contract demonstrating state management and basic interactions. Learn increment, decrement, and reset operations.',
  'github',
  NULL,
  'https://github.com/near-examples/counter-rust',
  'near-examples',
  'counter-rust',
  'main',
  'Basic',
  'Beginner',
  ARRAY['counter', 'state', 'basic'],
  'Code2',
  true,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Fungible Token (NEP-141) Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Fungible Token (NEP-141)',
  'Example implementation of a fungible token following the NEP-141 standard, similar to ERC-20. Includes transfers, allowances, and metadata.',
  'github',
  NULL,
  'https://github.com/near-examples/FT',
  'near-examples',
  'FT',
  'main',
  'Token',
  'Intermediate',
  ARRAY['token', 'nep-141', 'fungible', 'ft'],
  'Coins',
  true,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Non-Fungible Token (NEP-171) Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Non-Fungible Token (NEP-171)',
  'Example implementation of an NFT following the NEP-171 standard, similar to ERC-721. Includes minting, transfers, and metadata.',
  'github',
  NULL,
  'https://github.com/near-examples/NFT',
  'near-examples',
  'NFT',
  'main',
  'NFT',
  'Intermediate',
  ARRAY['nft', 'nep-171', 'collectible', 'token'],
  'Image',
  true,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Guest Book Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Guest Book',
  'A simple guest book smart contract where users can sign and leave messages. Great for learning cross-contract calls and storage.',
  'github',
  NULL,
  'https://github.com/near-examples/guest-book-rust',
  'near-examples',
  'guest-book-rust',
  'main',
  'Basic',
  'Beginner',
  ARRAY['guestbook', 'messages', 'social'],
  'MessageCircle',
  true,
  true,
  false,
  NOW()
) ON CONFLICT DO NOTHING;

-- Status Message Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Status Message',
  'A contract that allows users to set and retrieve their status messages. Demonstrates key-value storage patterns.',
  'github',
  NULL,
  'https://github.com/near-examples/rust-status-message',
  'near-examples',
  'rust-status-message',
  'main',
  'Basic',
  'Beginner',
  ARRAY['status', 'message', 'storage'],
  'FileCode',
  true,
  true,
  false,
  NOW()
) ON CONFLICT DO NOTHING;

-- Donation Contract Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Donation Contract',
  'A contract for accepting and tracking donations. Learn about attached deposits and transfer operations.',
  'github',
  NULL,
  'https://github.com/near-examples/donation-rust',
  'near-examples',
  'donation-rust',
  'main',
  'DeFi',
  'Intermediate',
  ARRAY['donation', 'payment', 'defi'],
  'Coins',
  true,
  true,
  false,
  NOW()
) ON CONFLICT DO NOTHING;

-- Cross-Contract Hello Template
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
  category,
  difficulty,
  tags,
  icon,
  is_official,
  is_published,
  is_featured,
  published_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Cross-Contract Calls',
  'Learn how to make cross-contract calls between NEAR smart contracts. Essential for composable contract architectures.',
  'github',
  NULL,
  'https://github.com/near-examples/cross-contract-hello-rust',
  'near-examples',
  'cross-contract-hello-rust',
  'main',
  'Utility',
  'Advanced',
  ARRAY['cross-contract', 'callbacks', 'advanced'],
  'Code2',
  true,
  true,
  false,
  NOW()
) ON CONFLICT DO NOTHING;

-- Log output
DO $$
DECLARE
  template_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO template_count FROM templates WHERE is_official = true;
  RAISE NOTICE 'Seeded % official templates', template_count;
END $$;
