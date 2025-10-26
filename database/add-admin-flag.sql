-- Add is_admin flag to customer_accounts table
-- This allows admin users to access all boats in the portal

-- Add is_admin column if it doesn't exist
ALTER TABLE customer_accounts
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set admin@sailorskills.com as admin
UPDATE customer_accounts
SET is_admin = TRUE
WHERE email = 'admin@sailorskills.com';

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_customer_accounts_is_admin
ON customer_accounts(is_admin)
WHERE is_admin = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN customer_accounts.is_admin IS 'Flag indicating if user has admin privileges to access all boats';
