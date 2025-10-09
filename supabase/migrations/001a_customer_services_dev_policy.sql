-- Temporary RLS policy for development/testing
-- This allows anon key to insert test data
-- ⚠️ REMOVE THIS IN PRODUCTION or restrict to specific conditions

CREATE POLICY "Allow anon to insert for development" ON customer_services
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Add read access for anon (needed for the billing app to query services)
CREATE POLICY "Allow anon to read customer services" ON customer_services
    FOR SELECT
    TO anon
    USING (true);

-- Add update access for anon (needed for updating service status)
CREATE POLICY "Allow anon to update customer services" ON customer_services
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
