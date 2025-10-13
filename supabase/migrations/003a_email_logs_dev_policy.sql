--
-- Email Logs RLS Policies (Development)
-- Adjust these for production!
--

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all email logs
DROP POLICY IF EXISTS "Allow authenticated read access to email_logs" ON email_logs;
CREATE POLICY "Allow authenticated read access to email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert email logs
DROP POLICY IF EXISTS "Allow authenticated write access to email_logs" ON email_logs;
CREATE POLICY "Allow authenticated write access to email_logs"
  ON email_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
