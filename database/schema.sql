-- Sailor Skills Admin - Database Schema
-- This schema supports the customer management system

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
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  make TEXT,
  model TEXT,
  length NUMERIC,
  type TEXT, -- sailboat, powerboat, catamaran, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_orders table
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE,
  service_type TEXT, -- diving, rigging, sailing, etc.
  estimated_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, succeeded, failed, refunded
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- These allow authenticated users to read all data

-- Customers policies
DROP POLICY IF EXISTS "Allow authenticated read access to customers" ON customers;
CREATE POLICY "Allow authenticated read access to customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated write access to customers" ON customers;
CREATE POLICY "Allow authenticated write access to customers"
  ON customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Boats policies
DROP POLICY IF EXISTS "Allow authenticated read access to boats" ON boats;
CREATE POLICY "Allow authenticated read access to boats"
  ON boats FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated write access to boats" ON boats;
CREATE POLICY "Allow authenticated write access to boats"
  ON boats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service orders policies
DROP POLICY IF EXISTS "Allow authenticated read access to service_orders" ON service_orders;
CREATE POLICY "Allow authenticated read access to service_orders"
  ON service_orders FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated write access to service_orders" ON service_orders;
CREATE POLICY "Allow authenticated write access to service_orders"
  ON service_orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payments policies
DROP POLICY IF EXISTS "Allow authenticated read access to payments" ON payments;
CREATE POLICY "Allow authenticated read access to payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated write access to payments" ON payments;
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
ON CONFLICT DO NOTHING;

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
ON CONFLICT DO NOTHING;

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
ON CONFLICT DO NOTHING;

INSERT INTO service_orders (customer_id, order_number, service_type, estimated_amount, status)
SELECT
  c.id,
  'ORD-002',
  'rigging_inspection',
  500,
  'completed'
FROM customers c
WHERE c.email = 'jane.smith@example.com'
ON CONFLICT DO NOTHING;

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
WHERE c.email = 'john.doe@example.com' AND so.order_number = 'ORD-001'
ON CONFLICT DO NOTHING;

INSERT INTO payments (customer_id, service_order_id, amount, status, payment_date)
SELECT
  c.id,
  so.id,
  500,
  'succeeded',
  NOW() - INTERVAL '5 days'
FROM customers c
JOIN service_orders so ON so.customer_id = c.id
WHERE c.email = 'jane.smith@example.com' AND so.order_number = 'ORD-002'
ON CONFLICT DO NOTHING;
