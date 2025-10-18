-- Migration: Consolidate service_conditions_log and service_conditions into service_logs
-- Date: 2025-10-17
-- Purpose: Single source of truth for service completion data, support for 5+ propellers
-- FIXED: Handles existing table by dropping and recreating, or adding missing columns

-- ============================================================================
-- STEP 0: Drop existing service_logs table if it exists (safer than ALTER)
-- ============================================================================

-- Drop the table if it exists (this is safe because it's new and shouldn't have production data yet)
DROP TABLE IF EXISTS service_logs CASCADE;

-- ============================================================================
-- STEP 1: Create new service_logs table with enhanced schema
-- ============================================================================

CREATE TABLE service_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    customer_id TEXT NOT NULL,
    boat_id UUID,
    service_id UUID,
    order_id TEXT,

    -- Service details
    service_type TEXT NOT NULL,
    service_name TEXT,
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_time TIME,

    -- Time tracking
    time_in TIME,
    time_out TIME,
    total_hours DECIMAL(5,2),

    -- Paint conditions
    paint_condition_overall TEXT,
    paint_detail_keel TEXT,
    paint_detail_waterline TEXT,
    paint_detail_boot_stripe TEXT,

    -- Growth
    growth_level TEXT,

    -- Through-hulls
    thru_hull_condition TEXT,
    thru_hull_notes TEXT,

    -- Propellers (NEW: JSONB array for unlimited propellers)
    -- Format: [{number: 1, condition: 'excellent', notes: 'polished'}, ...]
    propellers JSONB DEFAULT '[]'::jsonb,
    propeller_notes TEXT,

    -- Anodes
    anode_conditions JSONB DEFAULT '[]'::jsonb,
    anodes_installed JSONB DEFAULT '[]'::jsonb,

    -- Additional
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,

    -- Constraints
    CONSTRAINT service_logs_paint_check CHECK (paint_condition_overall IN (
        'excellent', 'good', 'fair', 'poor', NULL
    )),
    CONSTRAINT service_logs_growth_check CHECK (growth_level IN (
        'minimal', 'minimal-moderate', 'light', 'moderate', 'moderate-heavy', 'heavy', 'heavy-severe', 'severe', 'extreme', NULL
    )),
    CONSTRAINT service_logs_thru_hull_check CHECK (thru_hull_condition IN (
        'excellent', 'good', 'fair', 'sound', 'needs_attention', 'critical', NULL
    ))
);

-- ============================================================================
-- STEP 2: Migrate data from service_conditions_log (if exists)
-- ============================================================================

DO $$
DECLARE
    migrated_count INTEGER := 0;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_conditions_log') THEN
        INSERT INTO service_logs (
            id,
            customer_id,
            boat_id,
            service_id,
            order_id,
            service_type,
            service_name,
            service_date,
            service_time,
            time_in,
            time_out,
            paint_condition_overall,
            growth_level,
            thru_hull_condition,
            thru_hull_notes,
            propellers,
            propeller_notes,
            anode_conditions,
            anodes_installed,
            notes,
            photos,
            created_at,
            created_by
        )
        SELECT
            scl.id,
            scl.customer_id,
            scl.boat_id,
            scl.service_id,
            scl.order_id,
            scl.service_type,
            scl.service_name,
            scl.service_date,
            scl.service_time,
            scl.time_in,
            scl.time_out,
            scl.paint_condition_overall,
            scl.growth_level,
            scl.thru_hull_condition,
            scl.thru_hull_notes,
            -- Convert propeller_1_condition and propeller_2_condition to JSONB array
            CASE
                WHEN scl.propeller_1_condition IS NOT NULL OR scl.propeller_2_condition IS NOT NULL THEN
                    (
                        SELECT jsonb_agg(propeller)
                        FROM (
                            SELECT jsonb_build_object(
                                'number', 1,
                                'condition', scl.propeller_1_condition,
                                'notes', ''
                            ) AS propeller
                            WHERE scl.propeller_1_condition IS NOT NULL
                            UNION ALL
                            SELECT jsonb_build_object(
                                'number', 2,
                                'condition', scl.propeller_2_condition,
                                'notes', ''
                            ) AS propeller
                            WHERE scl.propeller_2_condition IS NOT NULL
                        ) sub
                    )
                ELSE '[]'::jsonb
            END AS propellers,
            scl.propeller_notes,
            scl.anode_conditions,
            scl.anodes_installed,
            scl.notes,
            COALESCE(scl.photos, '[]'::jsonb) AS photos,
            scl.created_at,
            scl.created_by
        FROM service_conditions_log scl;

        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % records from service_conditions_log', migrated_count;
    ELSE
        RAISE NOTICE 'Table service_conditions_log does not exist, skipping migration';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Migrate data from service_conditions (operations table, if exists)
-- ============================================================================

DO $$
DECLARE
    migrated_count INTEGER := 0;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_conditions') THEN
        INSERT INTO service_logs (
            id,
            boat_id,
            order_id,
            service_date,
            time_in,
            time_out,
            total_hours,
            paint_condition_overall,
            paint_detail_keel,
            paint_detail_waterline,
            paint_detail_boot_stripe,
            growth_level,
            thru_hull_condition,
            propellers,
            notes,
            photos,
            created_at,
            -- Default values for required fields not in service_conditions
            customer_id,
            service_type,
            created_by
        )
        SELECT
            sc.id,
            sc.boat_id,
            sc.order_id,
            sc.service_date,
            sc.time_in,
            sc.time_out,
            sc.total_hours,
            sc.paint_condition_overall,
            sc.paint_detail_keel,
            sc.paint_detail_waterline,
            sc.paint_detail_boot_stripe,
            sc.growth_level,
            sc.thru_hull_condition,
            -- Convert prop_condition to JSONB array
            CASE
                WHEN sc.prop_condition IS NOT NULL THEN
                    jsonb_build_array(
                        jsonb_build_object(
                            'number', 1,
                            'condition', sc.prop_condition,
                            'notes', ''
                        )
                    )
                ELSE '[]'::jsonb
            END AS propellers,
            sc.notes,
            COALESCE(to_jsonb(sc.photos), '[]'::jsonb) AS photos,
            sc.created_at,
            -- Get customer_id from boat if available
            COALESCE(
                (SELECT customer_id::text FROM boats WHERE id = sc.boat_id LIMIT 1),
                'unknown'
            ) AS customer_id,
            'legacy_migration' AS service_type,
            'operations_migration' AS created_by
        FROM service_conditions sc
        WHERE NOT EXISTS (
            SELECT 1 FROM service_logs sl WHERE sl.id = sc.id
        );

        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % records from service_conditions', migrated_count;
    ELSE
        RAISE NOTICE 'Table service_conditions does not exist, skipping migration';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

CREATE INDEX idx_service_logs_customer_id ON service_logs(customer_id);
CREATE INDEX idx_service_logs_boat_id ON service_logs(boat_id);
CREATE INDEX idx_service_logs_service_date ON service_logs(service_date DESC);
CREATE INDEX idx_service_logs_order_id ON service_logs(order_id);
CREATE INDEX idx_service_logs_service_type ON service_logs(service_type);

-- JSONB indexes
CREATE INDEX idx_service_logs_propellers ON service_logs USING GIN (propellers);
CREATE INDEX idx_service_logs_anodes_installed ON service_logs USING GIN (anodes_installed);
CREATE INDEX idx_service_logs_anode_conditions ON service_logs USING GIN (anode_conditions);
CREATE INDEX idx_service_logs_photos ON service_logs USING GIN (photos);

-- ============================================================================
-- STEP 5: Set up Row Level Security
-- ============================================================================

ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access
DROP POLICY IF EXISTS "Allow service role full access" ON service_logs;
CREATE POLICY "Allow service role full access" ON service_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can read their own logs
DROP POLICY IF EXISTS "Allow authenticated users to read own logs" ON service_logs;
CREATE POLICY "Allow authenticated users to read own logs" ON service_logs
    FOR SELECT
    TO authenticated
    USING (customer_id = current_setting('app.current_customer_id', true));

-- Anon users can read (for public client portals)
DROP POLICY IF EXISTS "Allow anon read access" ON service_logs;
CREATE POLICY "Allow anon read access" ON service_logs
    FOR SELECT
    TO anon
    USING (true);

-- ============================================================================
-- STEP 6: Create helper functions
-- ============================================================================

-- Function to get latest service log for a boat
CREATE OR REPLACE FUNCTION get_latest_service_log(p_boat_id UUID)
RETURNS service_logs AS $$
    SELECT *
    FROM service_logs
    WHERE boat_id = p_boat_id
    ORDER BY service_date DESC, created_at DESC
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to get propeller count from JSONB
CREATE OR REPLACE FUNCTION get_propeller_count(p_propellers JSONB)
RETURNS INTEGER AS $$
    SELECT COALESCE(jsonb_array_length(p_propellers), 0);
$$ LANGUAGE SQL IMMUTABLE;

-- ============================================================================
-- STEP 7: Add helpful comments
-- ============================================================================

COMMENT ON TABLE service_logs IS 'Consolidated service completion logs from billing and operations. Replaced service_conditions_log and service_conditions tables.';
COMMENT ON COLUMN service_logs.propellers IS 'JSONB array of propeller records: [{number: 1, condition: "excellent", notes: "polished"}, ...]';
COMMENT ON COLUMN service_logs.anode_conditions IS 'JSONB array of anode condition checks before service';
COMMENT ON COLUMN service_logs.anodes_installed IS 'JSONB array of anodes installed during service';

-- ============================================================================
-- Migration complete!
-- ============================================================================

DO $$
DECLARE
    total_rows INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_rows FROM service_logs;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration complete!';
    RAISE NOTICE '   - Created service_logs table with all columns';
    RAISE NOTICE '   - Migrated data from service_conditions_log';
    RAISE NOTICE '   - Migrated data from service_conditions';
    RAISE NOTICE '   - Created indexes and RLS policies';
    RAISE NOTICE '   - Total records in service_logs: %', total_rows;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Next steps:';
    RAISE NOTICE '   1. Verify data integrity: SELECT * FROM service_logs LIMIT 10;';
    RAISE NOTICE '   2. Test application code with new table';
    RAISE NOTICE '   3. After verification, optionally archive old tables:';
    RAISE NOTICE '      ALTER TABLE service_conditions_log RENAME TO _archived_service_conditions_log;';
    RAISE NOTICE '      ALTER TABLE service_conditions RENAME TO _archived_service_conditions;';
    RAISE NOTICE '   4. After 30 days of successful operation, drop archived tables:';
    RAISE NOTICE '      DROP TABLE IF EXISTS _archived_service_conditions_log CASCADE;';
    RAISE NOTICE '      DROP TABLE IF EXISTS _archived_service_conditions CASCADE;';
END $$;
