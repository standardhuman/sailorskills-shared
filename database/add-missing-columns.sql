-- Add missing columns to existing tables
-- This migration safely adds any missing columns without affecting existing data

-- Add missing columns to boats table
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

-- Make boats.name NOT NULL after adding it
DO $$
BEGIN
  -- Update any NULL names first
  UPDATE boats SET name = 'Unnamed Boat' WHERE name IS NULL;

  -- Now make it NOT NULL if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'name') THEN
    ALTER TABLE boats ALTER COLUMN name SET NOT NULL;
  END IF;
END $$;

-- Make customers.name and email NOT NULL after adding them
DO $$
BEGIN
  -- Update any NULL names first
  UPDATE customers SET name = 'Unknown' WHERE name IS NULL;
  UPDATE customers SET email = 'unknown' || id::text || '@example.com' WHERE email IS NULL;

  -- Now make them NOT NULL if columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'name') THEN
    ALTER TABLE customers ALTER COLUMN name SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email') THEN
    ALTER TABLE customers ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint to customers.email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'customers_email_key' AND table_name = 'customers'
  ) THEN
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
