-- Migration: Create verified_contracts table for self-hosted contract verification
-- This table stores verification data for contracts deployed through NEAR Playground

CREATE TABLE IF NOT EXISTS verified_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'testnet',
  user_id UUID REFERENCES auth.users(id),
  project_id UUID,

  -- Verification status
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Hashes (core verification data)
  compiled_wasm_hash TEXT NOT NULL,  -- Hash of WASM we compiled (stored at deploy time)
  onchain_wasm_hash TEXT,            -- Hash of on-chain bytecode (filled when verified)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(contract_id, network)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verified_contracts_contract_id ON verified_contracts(contract_id);
CREATE INDEX IF NOT EXISTS idx_verified_contracts_user_id ON verified_contracts(user_id);

-- Enable Row Level Security
ALTER TABLE verified_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Everyone can view verified contracts (public transparency)
CREATE POLICY "verified_contracts_select_all"
  ON verified_contracts
  FOR SELECT
  USING (true);

-- Users can insert verification records for their own contracts
CREATE POLICY "verified_contracts_insert_own"
  ON verified_contracts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification records
CREATE POLICY "verified_contracts_update_own"
  ON verified_contracts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for backend operations)
CREATE POLICY "verified_contracts_service_role"
  ON verified_contracts
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
