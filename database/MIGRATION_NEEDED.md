# Admin Flag Migration - MANUAL STEP REQUIRED

## ⚠️  Action Required

The `is_admin` column needs to be added to the `customer_accounts` table before admin functionality will work in the portal.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the `sailorskills` project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `add-admin-flag.sql`
5. Click **Run**

### Option 2: Command Line (if you have DB access)

```bash
psql "$DATABASE_URL" < shared/database/add-admin-flag.sql
```

## What This Migration Does

1. Adds `is_admin BOOLEAN DEFAULT FALSE` column to `customer_accounts`
2. Sets `admin@sailorskills.com` to `is_admin = TRUE`
3. Creates an index for efficient admin checks
4. Adds column documentation

## Verification

After running the migration, verify it worked:

```bash
node scripts/check-customer-accounts.mjs
```

You should see:
- ✅ `is_admin` column exists
- ✅ Admin account has `is_admin = true`

## Admin Account Credentials

- **Email**: admin@sailorskills.com
- **Password**: KLRss!650

The admin account has been created in Supabase Auth. Once the migration is applied, logging in with these credentials will grant access to ALL boats in the portal.
