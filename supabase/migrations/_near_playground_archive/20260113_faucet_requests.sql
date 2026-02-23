/*
  # Faucet Requests Table

  1. New Tables
    - `faucet_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `recipient_account` (text) - NEAR account that received tokens
      - `amount` (decimal) - Amount in NEAR
      - `transaction_hash` (text, nullable)
      - `status` (text) - 'pending', 'success', 'failed'
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)
      - `ip_address` (text, nullable)

  2. Indexes
    - Index on (user_id, created_at) for rate limit queries

  3. Security
    - Enable RLS
    - Users can only read their own requests
*/

CREATE TABLE IF NOT EXISTS faucet_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_account text NOT NULL,
  amount decimal(10, 4) NOT NULL DEFAULT 1.0,
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  ip_address text,

  CONSTRAINT valid_recipient CHECK (recipient_account ~ '^[a-z0-9_-]+\.testnet$')
);

-- Index for efficient rate limit queries
CREATE INDEX idx_faucet_requests_user_created
ON faucet_requests(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE faucet_requests ENABLE ROW LEVEL SECURITY;

-- Users can only view their own requests
CREATE POLICY "Users can read own faucet requests"
  ON faucet_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create faucet requests
CREATE POLICY "Users can create faucet requests"
  ON faucet_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role can update status (for backend to update after transaction)
CREATE POLICY "Service can update faucet requests"
  ON faucet_requests
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
