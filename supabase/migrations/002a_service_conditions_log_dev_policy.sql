-- Temporary RLS policy for development/testing - service_conditions_log
-- This allows anon key to insert/read test data
-- ⚠️ REMOVE THIS IN PRODUCTION or restrict to specific conditions

-- Add insert access for anon (needed for testing save-conditions API)
CREATE POLICY "Allow anon to insert for development" ON service_conditions_log
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Add read access for anon (needed for fetching service logs)
CREATE POLICY "Allow anon to read service logs" ON service_conditions_log
    FOR SELECT
    TO anon
    USING (true);

-- Add update access for anon (if needed for updating logs)
CREATE POLICY "Allow anon to update service logs" ON service_conditions_log
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
