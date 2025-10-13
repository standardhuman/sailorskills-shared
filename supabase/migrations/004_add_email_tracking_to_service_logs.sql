--
-- Add Email Tracking to Service Logs
-- Tracks whether receipt email was sent for each service charge
--

-- Add email tracking columns to service_logs table
ALTER TABLE service_logs
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_log_id UUID REFERENCES email_logs(id) ON DELETE SET NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_service_logs_email_sent ON service_logs(email_sent);
CREATE INDEX IF NOT EXISTS idx_service_logs_email_log ON service_logs(email_log_id);

-- Comments
COMMENT ON COLUMN service_logs.email_sent IS 'Whether receipt email was sent to customer';
COMMENT ON COLUMN service_logs.email_sent_at IS 'When the receipt email was sent';
COMMENT ON COLUMN service_logs.email_log_id IS 'Link to email_logs table for full email details';
