-- Step 1: Fix NULL constraint issues and add missing columns
-- Run this FIRST to prepare the tables

-- First, fix any NOT NULL constraints that are blocking us
DO $$
BEGIN
  -- Drop NOT NULL constraint on boats.customer_name if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boats' AND column_name = 'customer_name' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE boats ALTER COLUMN customer_name DROP NOT NULL;
  END IF;
END $$;

-- Fill in any NULL customer_name values with a default
UPDATE boats SET customer_name = 'Unknown Customer' WHERE customer_name IS NULL;

-- Add missing columns to boats table (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'name') THEN
    ALTER TABLE boats ADD COLUMN name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'make') THEN
    ALTER TABLE boats ADD COLUMN make TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'model') THEN
    ALTER TABLE boats ADD COLUMN model TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'length') THEN
    ALTER TABLE boats ADD COLUMN length NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'type') THEN
    ALTER TABLE boats ADD COLUMN type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'customer_id') THEN
    ALTER TABLE boats ADD COLUMN customer_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'created_at') THEN
    ALTER TABLE boats ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'updated_at') THEN
    ALTER TABLE boats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add missing columns to service_orders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'customer_id') THEN
    ALTER TABLE service_orders ADD COLUMN customer_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'order_number') THEN
    ALTER TABLE service_orders ADD COLUMN order_number TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'service_type') THEN
    ALTER TABLE service_orders ADD COLUMN service_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'estimated_amount') THEN
    ALTER TABLE service_orders ADD COLUMN estimated_amount NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'status') THEN
    ALTER TABLE service_orders ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'created_at') THEN
    ALTER TABLE service_orders ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'updated_at') THEN
    ALTER TABLE service_orders ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add missing columns to payments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'customer_id') THEN
    ALTER TABLE payments ADD COLUMN customer_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'service_order_id') THEN
    ALTER TABLE payments ADD COLUMN service_order_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount') THEN
    ALTER TABLE payments ADD COLUMN amount NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'status') THEN
    ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'payment_date') THEN
    ALTER TABLE payments ADD COLUMN payment_date TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'stripe_payment_intent_id') THEN
    ALTER TABLE payments ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'created_at') THEN
    ALTER TABLE payments ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'updated_at') THEN
    ALTER TABLE payments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add missing columns to customers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'name') THEN
    ALTER TABLE customers ADD COLUMN name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email') THEN
    ALTER TABLE customers ADD COLUMN email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
    ALTER TABLE customers ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'created_at') THEN
    ALTER TABLE customers ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
    ALTER TABLE customers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Fill in missing data for boats.name
UPDATE boats SET name = 'Unnamed Boat' WHERE name IS NULL;

-- Fill in missing data for customers
UPDATE customers SET name = 'Unknown' WHERE name IS NULL;
UPDATE customers SET email = 'unknown' || id::text || '@example.com' WHERE email IS NULL;

-- Add unique constraint to customers.email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'customers_email_key' AND table_name = 'customers'
  ) THEN
    -- First remove any duplicate emails
    DELETE FROM customers a USING customers b
    WHERE a.id > b.id AND a.email = b.email;

    -- Then add constraint
    ALTER TABLE customers ADD CONSTRAINT customers_email_key UNIQUE (email);
  END IF;
END $$;

-- Add unique constraint to service_orders.order_number if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'service_orders_order_number_key' AND table_name = 'service_orders'
  ) THEN
    ALTER TABLE service_orders ADD CONSTRAINT service_orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

-- Add foreign key for boats.customer_id if it doesn't exist
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

-- Add foreign key for service_orders.customer_id if it doesn't exist
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

-- Drop and recreate RLS policies
DROP POLICY IF EXISTS "Allow authenticated read access to customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated write access to customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated read access to boats" ON boats;
DROP POLICY IF EXISTS "Allow authenticated write access to boats" ON boats;
DROP POLICY IF EXISTS "Allow authenticated read access to service_orders" ON service_orders;
DROP POLICY IF EXISTS "Allow authenticated write access to service_orders" ON service_orders;
DROP POLICY IF EXISTS "Allow authenticated read access to payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated write access to payments" ON payments;

-- Create RLS policies
CREATE POLICY "Allow authenticated read access to customers"
  ON customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write access to customers"
  ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to boats"
  ON boats FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write access to boats"
  ON boats FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to service_orders"
  ON service_orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write access to service_orders"
  ON service_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to payments"
  ON payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write access to payments"
  ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
