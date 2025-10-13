--
-- Email Logs Table
-- Tracks all emails sent from the billing system for audit and troubleshooting
--

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_type TEXT NOT NULL,                    -- 'receipt', 'notification', etc.
    recipient_email TEXT NOT NULL,               -- Who received the email
    recipient_name TEXT,                         -- Customer name
    subject TEXT NOT NULL,                       -- Email subject line
    status TEXT NOT NULL DEFAULT 'pending',      -- 'pending', 'sent', 'failed'
    resend_id TEXT,                              -- Resend email ID for tracking
    error_message TEXT,                          -- Error details if failed
    payment_intent_id TEXT,                      -- Link to Stripe payment (if applicable)
    charge_id TEXT,                              -- Link to Stripe charge (if applicable)
    service_log_id UUID REFERENCES service_logs(id) ON DELETE SET NULL, -- Link to service log
    metadata JSONB,                              -- Additional email data
    sent_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_payment_intent ON email_logs(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_service_log ON email_logs(service_log_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- Comments for documentation
COMMENT ON TABLE email_logs IS 'Audit trail of all emails sent from billing system';
COMMENT ON COLUMN email_logs.email_type IS 'Type of email: receipt, notification, etc.';
COMMENT ON COLUMN email_logs.status IS 'Email delivery status: pending, sent, failed';
COMMENT ON COLUMN email_logs.resend_id IS 'Resend API email ID for tracking';
COMMENT ON COLUMN email_logs.service_log_id IS 'Link to service_logs table if applicable';
