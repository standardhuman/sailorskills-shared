-- ============================================================================
-- Setup Autofill for All Customers
-- ============================================================================
-- This script helps you set up autofill for all your customers
--
-- REQUIREMENTS FOR AUTOFILL TO WORK:
-- 1. Customer must have stripe_customer_id in customers table
-- 2. Boats must be linked to customer_id
-- 3. Customer must exist in Stripe
--
-- ============================================================================

-- ============================================================================
-- STEP 1: CHECK CURRENT STATUS
-- ============================================================================

-- See which customers are ready for autofill
SELECT
    c.name,
    c.email,
    c.phone,
    c.stripe_customer_id,
    COUNT(b.id) as boat_count,
    STRING_AGG(b.name, ', ') as boat_names,
    STRING_AGG(b.length::text, ', ') as boat_lengths,
    CASE
        WHEN c.stripe_customer_id IS NOT NULL AND COUNT(b.id) > 0
        THEN '✅ READY FOR AUTOFILL'
        WHEN c.stripe_customer_id IS NULL
        THEN '❌ Missing Stripe ID'
        WHEN COUNT(b.id) = 0
        THEN '❌ No boats linked'
        ELSE '⚠️ Check data'
    END as status
FROM customers c
LEFT JOIN boats b ON b.customer_id = c.id
GROUP BY c.id, c.name, c.email, c.phone, c.stripe_customer_id
ORDER BY status, c.name;


-- ============================================================================
-- STEP 2: FIND STRIPE CUSTOMER IDs
-- ============================================================================
-- For each customer missing a Stripe ID, you need to:
-- 1. Go to Stripe dashboard
-- 2. Search for customer by email
-- 3. Copy their Stripe customer ID (starts with 'cus_')
-- 4. Update the customers table

-- List of customers missing Stripe IDs (run this query, then look them up in Stripe)
SELECT
    c.name,
    c.email,
    c.phone,
    '-- UPDATE customers SET stripe_customer_id = ''cus_XXXXXXXXXX'' WHERE email = ''' || c.email || ''';' as update_sql
FROM customers c
WHERE c.stripe_customer_id IS NULL
ORDER BY c.name;


-- ============================================================================
-- STEP 3: UPDATE STRIPE CUSTOMER IDs
-- ============================================================================
-- After finding the Stripe IDs, update them here:

-- Template:
-- UPDATE customers SET stripe_customer_id = 'cus_XXXXXXXXXX' WHERE email = 'customer@email.com';

-- Example for Felipe (if needed):
-- UPDATE customers SET stripe_customer_id = 'cus_RLcEqFVEfR9E7h' WHERE email = 'fulloa@ucsc.edu';


-- ============================================================================
-- STEP 4: VERIFY BOAT DATA
-- ============================================================================
-- Make sure all boats have the required fields filled in

-- Check for boats missing critical data
SELECT
    b.id as boat_id,
    b.name as boat_name,
    b.make,
    b.model,
    b.length,
    c.name as customer_name,
    c.email as customer_email,
    CASE
        WHEN b.name IS NULL THEN '❌ Missing name'
        WHEN b.length IS NULL THEN '❌ Missing length'
        WHEN b.customer_id IS NULL THEN '❌ Missing customer link'
        ELSE '✅ OK'
    END as status
FROM boats b
LEFT JOIN customers c ON b.customer_id = c.id
ORDER BY status DESC, c.name;


-- ============================================================================
-- STEP 5: UPDATE BOAT DATA
-- ============================================================================
-- If any boats are missing length or other data, update them:

-- Template:
-- UPDATE boats SET length = XX WHERE id = 'boat-uuid-here';

-- Example:
-- UPDATE boats SET length = 35 WHERE name = 'Ericson' AND customer_id = (SELECT id FROM customers WHERE email = 'fulloa@ucsc.edu');


-- ============================================================================
-- STEP 6: VERIFY PHONE NUMBERS
-- ============================================================================
-- Check if customers have phone numbers (autofill will use Supabase phone if Stripe doesn't have one)

SELECT
    c.name,
    c.email,
    c.phone,
    CASE
        WHEN c.phone IS NULL OR c.phone = '' THEN '⚠️ No phone number'
        ELSE '✅ Has phone'
    END as phone_status
FROM customers c
ORDER BY phone_status DESC, c.name;


-- ============================================================================
-- STEP 7: FINAL VERIFICATION - TEST READY CUSTOMERS
-- ============================================================================
-- This shows the complete autofill data for each customer
-- Use this to verify everything is ready

SELECT
    c.name as customer_name,
    c.email,
    c.phone,
    c.stripe_customer_id,
    b.name as boat_name,
    b.length as boat_length,
    b.make as boat_make,
    b.model as boat_model,
    b.marina,
    b.dock,
    b.slip,
    CASE
        WHEN c.stripe_customer_id IS NOT NULL
         AND b.name IS NOT NULL
         AND b.length IS NOT NULL
        THEN '✅ READY TO TEST'
        ELSE '⚠️ Missing data'
    END as autofill_status
FROM customers c
LEFT JOIN boats b ON b.customer_id = c.id
WHERE c.stripe_customer_id IS NOT NULL
ORDER BY autofill_status DESC, c.name;


-- ============================================================================
-- COMMON ISSUES AND FIXES
-- ============================================================================

-- ISSUE: Boat shows in database but not in autofill
-- FIX: Check if boat.length is NULL
-- SELECT name, length FROM boats WHERE customer_id = (SELECT id FROM customers WHERE email = 'customer@email.com');

-- ISSUE: Phone number not autofilling
-- FIX: Check if phone is in Stripe OR Supabase
-- SELECT name, email, phone FROM customers WHERE email = 'customer@email.com';

-- ISSUE: Customer not found in search
-- FIX: Check if customer has stripe_customer_id
-- SELECT name, email, stripe_customer_id FROM customers WHERE email = 'customer@email.com';
