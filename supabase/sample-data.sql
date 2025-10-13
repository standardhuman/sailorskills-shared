-- Sample Data for Smart Billing Testing
-- Run this in Supabase SQL Editor to add test customer services
-- Replace the customer_id with your actual test customer ID

-- Sample Service 1: Recurring Cleaning with Anodes (Active)
INSERT INTO customer_services (
    customer_id,
    service_type,
    service_name,
    frequency,
    boat_length,
    base_price,
    includes_anodes,
    twin_engines,
    hull_type,
    boat_type,
    status
) VALUES (
    'cus_T0qqGn9xCudHEO', -- John Doe 2 - Update with your customer ID
    'recurring_cleaning',
    'Recurring Cleaning and Anodes - Two Months',
    'two_months',
    35,
    250.00,
    true,
    false,
    'monohull',
    'sailboat',
    'active'
);

-- Sample Service 2: Monthly Recurring Cleaning (Active)
INSERT INTO customer_services (
    customer_id,
    service_type,
    service_name,
    frequency,
    boat_length,
    base_price,
    includes_anodes,
    twin_engines,
    hull_type,
    boat_type,
    status
) VALUES (
    'cus_T0qqGn9xCudHEO',
    'recurring_cleaning',
    'Recurring Cleaning - Monthly',
    'monthly',
    35,
    150.00,
    false,
    false,
    'monohull',
    'sailboat',
    'active'
);

-- Verify the data was inserted
SELECT
    id,
    customer_id,
    service_name,
    frequency,
    base_price,
    status,
    created_at
FROM customer_services
ORDER BY created_at DESC;
