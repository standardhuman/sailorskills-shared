-- Customer Services Table
-- Tracks recurring services that customers are signed up for

CREATE TABLE IF NOT EXISTS customer_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT NOT NULL, -- Stripe customer ID
    boat_id UUID, -- Reference to boat in boats table (if exists)
    service_type TEXT NOT NULL, -- 'recurring_cleaning', 'onetime_cleaning', etc.
    service_name TEXT NOT NULL, -- Display name like "Recurring Cleaning and Anodes - Two Months"
    frequency TEXT, -- 'weekly', 'biweekly', 'monthly', 'two_months', 'quarterly', etc.

    -- Pricing information
    base_price DECIMAL(10, 2),
    boat_length INTEGER,

    -- Additional service details
    includes_anodes BOOLEAN DEFAULT FALSE,
    twin_engines BOOLEAN DEFAULT FALSE,
    hull_type TEXT, -- 'monohull', 'catamaran', 'trimaran'
    boat_type TEXT, -- 'sailboat', 'powerboat'

    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'cancelled'

    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Indexes
    CONSTRAINT customer_services_service_type_check CHECK (service_type IN (
        'recurring_cleaning',
        'onetime_cleaning',
        'underwater_inspection',
        'item_recovery',
        'propeller_service',
        'anodes_only'
    )),
    CONSTRAINT customer_services_status_check CHECK (status IN ('active', 'paused', 'cancelled'))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_services_customer_id ON customer_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_services_status ON customer_services(status);
CREATE INDEX IF NOT EXISTS idx_customer_services_boat_id ON customer_services(boat_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_customer_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_services_updated_at
    BEFORE UPDATE ON customer_services
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_services_updated_at();

-- Add RLS policies (if using Row Level Security)
ALTER TABLE customer_services ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Allow service role full access" ON customer_services
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
