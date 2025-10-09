# Database Setup for Customer Management

## Problem
The customer management page requires these database tables:
- `customers` - Customer information
- `boats` - Customer boats
- `service_orders` - Service orders/bookings
- `payments` - Payment records

If these tables don't exist or are misconfigured, you'll see this error:
```
Error loading customers: column boats_1.name does not exist
```

## Solution

### Step 1: Run the Schema Migration

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `fzygakldvvzxmahkdylq`
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New query**
5. Copy the entire contents of `schema.sql` and paste it into the editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 2: Verify Tables Created

1. Go to **Table Editor** in the Supabase dashboard
2. You should see these tables:
   - ✅ `customers`
   - ✅ `boats`
   - ✅ `service_orders`
   - ✅ `payments`

### Step 3: Check Sample Data

The schema includes 3 sample customers with boats, orders, and payments for testing.

Navigate to: https://sailorskills-admin.vercel.app/customers.html

You should see:
- **Total Customers:** 3
- **Active Customers:** 3 (within 30 days)
- **Average LTV:** ~$283
- Customer list with John Doe, Jane Smith, and Bob Johnson

## Schema Overview

### Tables

**customers**
- `id` (UUID, Primary Key)
- `name` (TEXT, required)
- `email` (TEXT, unique, required)
- `phone` (TEXT, optional)
- `created_at`, `updated_at` (timestamps)

**boats**
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → customers)
- `name`, `make`, `model`, `type` (TEXT)
- `length` (NUMERIC)

**service_orders**
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → customers)
- `order_number` (TEXT, unique)
- `service_type` (TEXT) - diving, rigging, sailing, etc.
- `estimated_amount` (NUMERIC)
- `status` (TEXT) - pending, confirmed, completed, etc.

**payments**
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → customers)
- `service_order_id` (UUID, Foreign Key → service_orders)
- `amount` (NUMERIC)
- `status` (TEXT) - pending, succeeded, failed, refunded
- `payment_date` (TIMESTAMP)
- `stripe_payment_intent_id` (TEXT, optional)

### Relationships

- Customers → Boats (one-to-many)
- Customers → Service Orders (one-to-many)
- Customers → Payments (one-to-many)
- Service Orders → Payments (one-to-many)

## Security (Row Level Security)

The schema includes RLS policies that allow:
- ✅ **Authenticated users** can read/write all data

⚠️ **Important for Production:**
These policies are permissive for development. Before going to production, you should:
1. Restrict write access to admin users only
2. Implement proper role-based access control
3. Add data validation rules
4. Review and test all RLS policies

## Troubleshooting

### "column does not exist" error
- Run the `schema.sql` migration
- Check that all tables were created successfully
- Verify foreign key relationships exist

### No customers showing
- Check that `customers` table has data
- Run: `SELECT * FROM customers;` in SQL Editor
- If empty, the schema includes INSERT statements for sample data

### RLS blocking queries
- Ensure you're authenticated (logged in)
- Check RLS policies in Table Editor → Settings → RLS
- Policies must allow SELECT for authenticated users

### Related data not showing
- Check that foreign key relationships exist
- Verify `customer_id` columns in boats, service_orders, and payments
- Ensure sample data was inserted correctly

## Adding Your Own Data

After running the schema, you can add your own customers:

```sql
INSERT INTO customers (name, email, phone)
VALUES ('Your Customer', 'customer@example.com', '+1-555-1234');

-- Get the customer_id and add a boat
INSERT INTO boats (customer_id, name, make, model, length, type)
VALUES (
  (SELECT id FROM customers WHERE email = 'customer@example.com'),
  'Ocean Star',
  'Beneteau',
  'Oceanis 46',
  46,
  'sailboat'
);
```

## Migration Status

Run this query to check if tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('customers', 'boats', 'service_orders', 'payments');
```

Should return 4 rows if all tables exist.
