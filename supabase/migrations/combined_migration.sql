-- ============================================
-- SAILOR SKILLS BILLING - SMART BILLING SETUP
-- Combined Database Migrations
-- ============================================
-- Run this entire script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fzygakldvvzxmahkdylq/sql/new
-- ============================================

-- ============================================
-- Migration 1: Customer Services Table
-- ============================================

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

-- ============================================
-- Migration 2: Service Conditions Log Table
-- ============================================

-- Service Conditions Log Table
-- Stores condition data from service completion for Portal to access

CREATE TABLE IF NOT EXISTS service_conditions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    customer_id TEXT NOT NULL, -- Stripe customer ID
    boat_id UUID, -- Reference to boat (if exists)
    service_id UUID, -- Reference to customer_services table (if recurring service)
    order_id TEXT, -- Stripe payment intent ID or invoice number

    -- Service details
    service_type TEXT NOT NULL,
    service_name TEXT,
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_time TIME,

    -- Boat conditions
    paint_condition_overall TEXT, -- 'excellent', 'good', 'fair', 'poor'
    growth_level TEXT, -- 'minimal', 'light', 'moderate', 'heavy'

    -- Anode conditions (JSON array of {type, condition})
    anode_conditions JSONB DEFAULT '[]'::jsonb,

    -- Anodes installed (JSON array of {id, name, quantity, location, condition_before})
    anodes_installed JSONB DEFAULT '[]'::jsonb,

    -- Through-hull conditions
    thru_hull_condition TEXT, -- 'excellent', 'good', 'fair', 'needs_attention'
    thru_hull_notes TEXT,

    -- Propeller conditions
    propeller_1_condition TEXT, -- 'excellent', 'good', 'fair', 'poor'
    propeller_2_condition TEXT, -- For twin engines
    propeller_notes TEXT,

    -- Additional details
    time_in TIME,
    time_out TIME,
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT, -- User or system that created the log

    -- Constraints
    CONSTRAINT service_conditions_log_paint_condition_check CHECK (paint_condition_overall IN (
        'excellent', 'good', 'fair', 'poor', NULL
    )),
    CONSTRAINT service_conditions_log_growth_level_check CHECK (growth_level IN (
        'minimal', 'light', 'moderate', 'heavy', NULL
    )),
    CONSTRAINT service_conditions_log_thru_hull_check CHECK (thru_hull_condition IN (
        'excellent', 'good', 'fair', 'needs_attention', NULL
    )),
    CONSTRAINT service_conditions_log_prop_condition_check CHECK (
        propeller_1_condition IN ('excellent', 'good', 'fair', 'poor', NULL) AND
        propeller_2_condition IN ('excellent', 'good', 'fair', 'poor', NULL)
    )
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_service_conditions_customer_id ON service_conditions_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_conditions_boat_id ON service_conditions_log(boat_id);
CREATE INDEX IF NOT EXISTS idx_service_conditions_service_date ON service_conditions_log(service_date);
CREATE INDEX IF NOT EXISTS idx_service_conditions_order_id ON service_conditions_log(order_id);

-- Index on JSONB fields for faster querying
CREATE INDEX IF NOT EXISTS idx_service_conditions_anodes_installed ON service_conditions_log USING GIN (anodes_installed);
CREATE INDEX IF NOT EXISTS idx_service_conditions_anode_conditions ON service_conditions_log USING GIN (anode_conditions);

-- Add RLS policies
ALTER TABLE service_conditions_log ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Allow service role full access" ON service_conditions_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to read their own service logs
CREATE POLICY "Allow authenticated users to read own logs" ON service_conditions_log
    FOR SELECT
    TO authenticated
    USING (customer_id = current_setting('app.current_customer_id', true));

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Verify the tables were created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('customer_services', 'service_conditions_log');
-- ============================================
