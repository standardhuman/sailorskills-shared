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
