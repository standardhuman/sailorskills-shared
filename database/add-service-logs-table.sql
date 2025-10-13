--
-- Service Logs Table
-- Tracks all service charges and details for Portal display
--

CREATE TABLE IF NOT EXISTS service_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL,                   -- Stripe customer ID
    boat_id UUID REFERENCES boats(id),           -- Link to boat
    service_type TEXT NOT NULL,                  -- e.g., "recurring_cleaning", "onetime_cleaning"
    service_name TEXT,                           -- Human-readable service name
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_time TIME,
    amount_charged DECIMAL(10,2) NOT NULL,       -- Amount in dollars
    payment_intent_id TEXT,                       -- Stripe Payment Intent ID
    charge_id TEXT,                              -- Stripe Charge ID
    service_details JSONB,                       -- Additional service metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_service_logs_customer ON service_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_boat ON service_logs(boat_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_date ON service_logs(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_service_logs_payment_intent ON service_logs(payment_intent_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_service_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_logs_updated_at
    BEFORE UPDATE ON service_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_service_logs_updated_at();

-- Comments
COMMENT ON TABLE service_logs IS 'Tracks all service charges for Portal display';
COMMENT ON COLUMN service_logs.customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN service_logs.boat_id IS 'Link to boat in boats table';
COMMENT ON COLUMN service_logs.service_type IS 'Service key (recurring_cleaning, onetime_cleaning, etc.)';
COMMENT ON COLUMN service_logs.amount_charged IS 'Amount charged in dollars';
COMMENT ON COLUMN service_logs.payment_intent_id IS 'Stripe Payment Intent ID';
COMMENT ON COLUMN service_logs.charge_id IS 'Stripe Charge ID';
COMMENT ON COLUMN service_logs.service_details IS 'JSON metadata: boat_name, boat_length, etc.';
