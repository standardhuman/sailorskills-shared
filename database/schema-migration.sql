-- Sailor Skills Admin - Database Schema Migration
-- Safely handles existing tables by adding missing columns and constraints

-- Create customers table (if not exists)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create boats table
CREATE TABLE IF NOT EXISTS boats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  name TEXT NOT NULL,
  make TEXT,
  model TEXT,
  length NUMERIC,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for boats if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'boats_customer_id_fkey' AND table_name = 'boats'
  ) THEN
    ALTER TABLE boats ADD CONSTRAINT boats_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create service_orders table
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  order_number TEXT UNIQUE,
  service_type TEXT,
  estimated_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for service_orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'service_orders_customer_id_fkey' AND table_name = 'service_orders'
  ) THEN
    ALTER TABLE service_orders ADD CONSTRAINT service_orders_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add service_order_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'service_order_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN service_order_id UUID;
  END IF;
END $$;

-- Add stripe_payment_intent_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;
END $$;

-- Add foreign keys for payments if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_customer_id_fkey' AND table_name = 'payments'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_service_order_id_fkey' AND table_name = 'payments'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_service_order_id_fkey
      FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_boats_customer_id ON boats(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_customer_id ON service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_service_order_id ON payments(service_order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Development (ADJUST FOR PRODUCTION!)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated read access to customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated write access to customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated read access to boats" ON boats;
DROP POLICY IF EXISTS "Allow authenticated write access to boats" ON boats;
DROP POLICY IF EXISTS "Allow authenticated read access to service_orders" ON service_orders;
DROP POLICY IF EXISTS "Allow authenticated write access to service_orders" ON service_orders;
DROP POLICY IF EXISTS "Allow authenticated read access to payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated write access to payments" ON payments;

-- Customers policies
CREATE POLICY "Allow authenticated read access to customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access to customers"
  ON customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Boats policies
CREATE POLICY "Allow authenticated read access to boats"
  ON boats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access to boats"
  ON boats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service orders policies
CREATE POLICY "Allow authenticated read access to service_orders"
  ON service_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access to service_orders"
  ON service_orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payments policies
CREATE POLICY "Allow authenticated read access to payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access to payments"
  ON payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO customers (name, email, phone)
VALUES
  ('John Doe', 'john.doe@example.com', '+1-555-0100'),
  ('Jane Smith', 'jane.smith@example.com', '+1-555-0101'),
  ('Bob Johnson', 'bob.johnson@example.com', '+1-555-0102')
ON CONFLICT (email) DO NOTHING;

-- Insert sample boats
INSERT INTO boats (customer_id, name, make, model, length, type)
SELECT
  c.id,
  'Sea Breeze',
  'Catalina',
  '320',
  32,
  'sailboat'
FROM customers c
WHERE c.email = 'john.doe@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM boats WHERE name = 'Sea Breeze' AND customer_id = c.id
  );

INSERT INTO boats (customer_id, name, make, model, length, type)
SELECT
  c.id,
  'Blue Wave',
  'Hunter',
  '40',
  40,
  'sailboat'
FROM customers c
WHERE c.email = 'jane.smith@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM boats WHERE name = 'Blue Wave' AND customer_id = c.id
  );

-- Insert sample service orders
INSERT INTO service_orders (customer_id, order_number, service_type, estimated_amount, status)
SELECT
  c.id,
  'ORD-001',
  'hull_cleaning',
  350,
  'completed'
FROM customers c
WHERE c.email = 'john.doe@example.com'
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO service_orders (customer_id, order_number, service_type, estimated_amount, status)
SELECT
  c.id,
  'ORD-002',
  'rigging_inspection',
  500,
  'completed'
FROM customers c
WHERE c.email = 'jane.smith@example.com'
ON CONFLICT (order_number) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (customer_id, service_order_id, amount, status, payment_date)
SELECT
  c.id,
  so.id,
  350,
  'succeeded',
  NOW() - INTERVAL '10 days'
FROM customers c
JOIN service_orders so ON so.customer_id = c.id
WHERE c.email = 'john.doe@example.com'
  AND so.order_number = 'ORD-001'
  AND NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.customer_id = c.id AND p.service_order_id = so.id
  );

INSERT INTO payments (customer_id, service_order_id, amount, status, payment_date)
SELECT
  c.id,
  so.id,
  500,
  'succeeded',
  NOW() - INTERVAL '5 days'
FROM customers c
JOIN service_orders so ON so.customer_id = c.id
WHERE c.email = 'jane.smith@example.com'
  AND so.order_number = 'ORD-002'
  AND NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.customer_id = c.id AND p.service_order_id = so.id
  );
