-- ============================================================================
-- Fix Customer and Boat Linkage
-- ============================================================================
-- This script identifies and fixes orphaned boats and missing Stripe linkages
-- Run the diagnostic queries first to see what needs fixing
-- Then run the UPDATE statements to fix the data
-- ============================================================================

-- ============================================================================
-- PART 1: DIAGNOSTIC QUERIES (Run these first to see the issues)
-- ============================================================================

-- 1. Find orphaned boats (boats with NULL customer_id)
SELECT
    b.id as boat_id,
    b.name as boat_name,
    b.make,
    b.model,
    b.length,
    b.customer_id,
    'ORPHANED - No customer_id' as issue
FROM boats b
WHERE b.customer_id IS NULL
ORDER BY b.name;

-- 2. Find customers without Stripe linkage (stripe_customer_id is NULL)
SELECT
    c.id as customer_id,
    c.name,
    c.email,
    c.stripe_customer_id,
    'MISSING Stripe linkage' as issue
FROM customers c
WHERE c.stripe_customer_id IS NULL
ORDER BY c.name;

-- 3. Find customers with boats (to see the linkage)
SELECT
    c.id as customer_id,
    c.name as customer_name,
    c.email,
    c.stripe_customer_id,
    COUNT(b.id) as boat_count,
    STRING_AGG(b.name, ', ') as boat_names
FROM customers c
LEFT JOIN boats b ON b.customer_id = c.id
GROUP BY c.id, c.name, c.email, c.stripe_customer_id
HAVING COUNT(b.id) > 0
ORDER BY c.name;

-- 4. Show all boats and their customer linkage status
SELECT
    b.id as boat_id,
    b.name as boat_name,
    b.make,
    b.length,
    b.marina,
    b.dock,
    b.slip,
    c.id as customer_id,
    c.name as customer_name,
    c.email as customer_email,
    CASE
        WHEN b.customer_id IS NULL THEN '❌ ORPHANED'
        WHEN c.stripe_customer_id IS NULL THEN '⚠️ No Stripe link'
        ELSE '✅ Linked'
    END as status
FROM boats b
LEFT JOIN customers c ON b.customer_id = c.id
ORDER BY status, b.name;


-- ============================================================================
-- PART 2: FIX STRIPE CUSTOMER LINKAGE
-- ============================================================================
-- NOTE: You'll need to get the actual Stripe Customer IDs from your Stripe dashboard
-- Replace the placeholder values below with real Stripe customer IDs

-- Example: Update Felipe's stripe_customer_id
-- Find Felipe's Stripe ID from Stripe dashboard first, then update:
-- UPDATE customers
-- SET stripe_customer_id = 'cus_XXXXXXXXXXXXXX'
-- WHERE email = 'fulloa@ucsc.edu';

-- Example: Update Kimber's stripe_customer_id
-- UPDATE customers
-- SET stripe_customer_id = 'cus_NeTBPo43rYrKO5'
-- WHERE email = 'kimber.oswald@gmail.com';

-- Template for updating other customers:
-- UPDATE customers
-- SET stripe_customer_id = 'cus_XXXXXXXXXXXXXX'
-- WHERE email = 'customer@email.com';


-- ============================================================================
-- PART 3: FIX BOAT LINKAGE
-- ============================================================================

-- Option A: If you know the boat belongs to a specific customer by email
-- Example: Link Ericson boat to Felipe
UPDATE boats
SET customer_id = (
    SELECT id
    FROM customers
    WHERE email = 'fulloa@ucsc.edu'
)
WHERE make = 'Ericson'
  AND length = 35
  AND customer_id IS NULL;

-- Option B: Link boats based on matching marina and slip
-- (if boats and customers have matching marina/slip data)
-- UPDATE boats b
-- SET customer_id = (
--     SELECT c.id
--     FROM customers c
--     WHERE b.marina = c.marina
--       AND b.slip = c.slip
--     LIMIT 1
-- )
-- WHERE b.customer_id IS NULL
--   AND b.marina IS NOT NULL
--   AND b.slip IS NOT NULL;


-- ============================================================================
-- PART 4: BULK FIX FOR KNOWN CUSTOMERS
-- ============================================================================
-- This section provides templates for common scenarios

-- Link all boats at a specific marina/slip to a customer
-- UPDATE boats
-- SET customer_id = (SELECT id FROM customers WHERE email = 'customer@email.com')
-- WHERE marina = 'BRK'
--   AND dock = 'A'
--   AND slip = '15'
--   AND customer_id IS NULL;

-- Link a boat by name to a customer
-- UPDATE boats
-- SET customer_id = (SELECT id FROM customers WHERE email = 'customer@email.com')
-- WHERE name = 'Boat Name'
--   AND customer_id IS NULL;


-- ============================================================================
-- PART 5: VERIFICATION QUERIES (Run these after updates)
-- ============================================================================

-- Verify Felipe's data is now linked
SELECT
    c.id as customer_id,
    c.name,
    c.email,
    c.phone,
    c.stripe_customer_id,
    b.id as boat_id,
    b.name as boat_name,
    b.make,
    b.model,
    b.length,
    b.marina,
    b.dock,
    b.slip
FROM customers c
LEFT JOIN boats b ON b.customer_id = c.id
WHERE c.email = 'fulloa@ucsc.edu';

-- Check all customers with complete data (ready for autofill)
SELECT
    c.name,
    c.email,
    c.stripe_customer_id,
    COUNT(b.id) as boats,
    COUNT(a.id) as addresses,
    CASE
        WHEN c.stripe_customer_id IS NOT NULL
         AND COUNT(b.id) > 0
         AND COUNT(a.id) > 0
        THEN '✅ READY FOR AUTOFILL'
        WHEN c.stripe_customer_id IS NULL THEN '❌ Missing Stripe link'
        WHEN COUNT(b.id) = 0 THEN '❌ Missing boat data'
        WHEN COUNT(a.id) = 0 THEN '⚠️ Missing address (optional)'
        ELSE '⚠️ Incomplete'
    END as status
FROM customers c
LEFT JOIN boats b ON b.customer_id = c.id
LEFT JOIN addresses a ON a.customer_id = c.id
GROUP BY c.id, c.name, c.email, c.stripe_customer_id
ORDER BY status, c.name;

-- ============================================================================
-- PART 6: HELPFUL QUERIES FOR FINDING STRIPE CUSTOMER IDS
-- ============================================================================

-- Generate a list of customers that need Stripe linkage
-- You can use this to look them up in Stripe dashboard
SELECT
    c.name,
    c.email,
    c.phone,
    '-- UPDATE customers SET stripe_customer_id = ''cus_XXXX'' WHERE email = ''' || c.email || ''';' as sql_template
FROM customers c
WHERE c.stripe_customer_id IS NULL
ORDER BY c.name;


-- ============================================================================
-- EXAMPLE: Complete fix for Felipe
-- ============================================================================
-- Step 1: Find Felipe's Stripe Customer ID from Stripe dashboard
-- Step 2: Update his Stripe linkage (replace cus_XXXX with real ID)
-- UPDATE customers
-- SET stripe_customer_id = 'cus_XXXXXXXXXXXX'
-- WHERE email = 'fulloa@ucsc.edu';

-- Step 3: Link his boat
UPDATE boats
SET customer_id = (SELECT id FROM customers WHERE email = 'fulloa@ucsc.edu')
WHERE make = 'Ericson'
  AND length = 35
  AND customer_id IS NULL;

-- Step 4: Verify
SELECT
    c.name,
    c.email,
    c.stripe_customer_id,
    b.name as boat_name,
    b.make,
    b.length
FROM customers c
LEFT JOIN boats b ON b.customer_id = c.id
WHERE c.email = 'fulloa@ucsc.edu';
