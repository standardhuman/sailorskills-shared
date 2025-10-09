-- Step 2: Fix remaining constraints and insert sample data

-- Drop NOT NULL constraint on boats.boat_name if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boats' AND column_name = 'boat_name' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE boats ALTER COLUMN boat_name DROP NOT NULL;
  END IF;
END $$;

-- Update any NULL boat_name values with the name column
UPDATE boats SET boat_name = name WHERE boat_name IS NULL AND name IS NOT NULL;
UPDATE boats SET boat_name = 'Unnamed Boat' WHERE boat_name IS NULL;

-- Insert sample customers
INSERT INTO customers (name, email, phone)
VALUES
  ('John Doe', 'john.doe@example.com', '+1-555-0100'),
  ('Jane Smith', 'jane.smith@example.com', '+1-555-0101'),
  ('Bob Johnson', 'bob.johnson@example.com', '+1-555-0102')
ON CONFLICT (email) DO NOTHING;

-- Insert sample boats (with both name and boat_name)
INSERT INTO boats (customer_id, name, boat_name, make, model, length, type, created_at)
SELECT
  c.id,
  'Sea Breeze',
  'Sea Breeze',
  'Catalina',
  '320',
  32,
  'sailboat',
  NOW()
FROM customers c
WHERE c.email = 'john.doe@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM boats WHERE name = 'Sea Breeze' AND customer_id = c.id
  );

INSERT INTO boats (customer_id, name, boat_name, make, model, length, type, created_at)
SELECT
  c.id,
  'Blue Wave',
  'Blue Wave',
  'Hunter',
  '40',
  40,
  'sailboat',
  NOW()
FROM customers c
WHERE c.email = 'jane.smith@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM boats WHERE name = 'Blue Wave' AND customer_id = c.id
  );

-- Insert sample service orders
INSERT INTO service_orders (customer_id, order_number, service_type, estimated_amount, status, created_at)
SELECT
  c.id,
  'ORD-001',
  'hull_cleaning',
  350,
  'completed',
  NOW()
FROM customers c
WHERE c.email = 'john.doe@example.com'
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO service_orders (customer_id, order_number, service_type, estimated_amount, status, created_at)
SELECT
  c.id,
  'ORD-002',
  'rigging_inspection',
  500,
  'completed',
  NOW()
FROM customers c
WHERE c.email = 'jane.smith@example.com'
ON CONFLICT (order_number) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (customer_id, service_order_id, amount, status, payment_date, created_at)
SELECT
  c.id,
  so.id,
  350,
  'succeeded',
  NOW() - INTERVAL '10 days',
  NOW()
FROM customers c
JOIN service_orders so ON so.customer_id = c.id
WHERE c.email = 'john.doe@example.com'
  AND so.order_number = 'ORD-001'
  AND NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.customer_id = c.id AND p.service_order_id = so.id
  );

INSERT INTO payments (customer_id, service_order_id, amount, status, payment_date, created_at)
SELECT
  c.id,
  so.id,
  500,
  'succeeded',
  NOW() - INTERVAL '5 days',
  NOW()
FROM customers c
JOIN service_orders so ON so.customer_id = c.id
WHERE c.email = 'jane.smith@example.com'
  AND so.order_number = 'ORD-002'
  AND NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.customer_id = c.id AND p.service_order_id = so.id
  );
