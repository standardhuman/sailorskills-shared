# 🚀 Production Deployment Checklist

## ⚠️ CRITICAL SECURITY ITEMS

### 1. Row Level Security (RLS) Policies

**Current Status:** ⚠️ DEVELOPMENT POLICIES ARE TOO PERMISSIVE

The following policies were added for development and **MUST BE RESTRICTED** before production:

#### Current Development Policies (TOO PERMISSIVE):
```sql
-- ⚠️ These allow ANY anon user to read/write customer services
CREATE POLICY "Allow anon to insert for development" ON customer_services
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to read customer services" ON customer_services
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to update customer services" ON customer_services
    FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

#### ✅ Production-Ready Policies (USE THESE):

**Option 1: Service Role Only (Most Secure)**
```sql
-- Drop development policies
DROP POLICY IF EXISTS "Allow anon to insert for development" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to read customer services" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to update customer services" ON customer_services;

-- Only allow service role (backend API only)
-- (Service role policy already exists from migration 001)
```

**Option 2: Authenticated Internal Users Only**
```sql
-- Drop development policies
DROP POLICY IF EXISTS "Allow anon to insert for development" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to read customer services" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to update customer services" ON customer_services;

-- Allow authenticated internal users (staff only)
CREATE POLICY "Allow authenticated to read customer services" ON customer_services
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated to insert customer services" ON customer_services
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated to update customer services" ON customer_services
    FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);
```

**Option 3: API Key Authentication (Recommended for Backend APIs)**
```sql
-- Drop development policies
DROP POLICY IF EXISTS "Allow anon to insert for development" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to read customer services" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to update customer services" ON customer_services;

-- Keep service role policy only
-- Use Supabase service role key in API routes
-- Never expose service role key to frontend
```

### 2. Service Conditions Log RLS

Check if similar development policies exist for `service_conditions_log`:

```sql
-- Review existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'service_conditions_log';

-- Drop any overly permissive policies if found
```

### 3. Environment Variables

**Frontend (.env)**
```bash
# ✅ Safe to expose
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... # Public anon key - safe to expose
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # Public Stripe key
```

**Backend (Vercel Environment Variables)**
```bash
# ⚠️ NEVER expose these to frontend
STRIPE_SECRET_KEY=sk_live_... # Server-side only
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-side only (if using)
```

### 4. API Endpoints Security

Review all API endpoints in `/api/` folder:

- [ ] `api/customer-services.js` - Uses anon key (check RLS)
- [ ] `api/save-conditions.js` - Uses anon key (check RLS)
- [ ] `api/service-logs.js` - Uses anon key (check RLS)

**Recommendation:** Consider migrating to service role key for API routes:

```javascript
// In API routes, use service role instead of anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Not anon key
```

## 📋 Pre-Deployment Checklist

### Database
- [ ] Review all RLS policies (run security audit script)
- [ ] Remove development/test data
- [ ] Ensure indexes are created
- [ ] Test database backup/restore

### Security
- [ ] Update RLS policies to production settings
- [ ] Verify no service role keys in frontend code
- [ ] Review CORS settings in API routes
- [ ] Enable rate limiting (if using Supabase edge functions)

### Testing
- [ ] All Playwright tests pass
- [ ] Manual testing in staging environment
- [ ] Test with real customer data (limited set)
- [ ] Verify Portal can read service logs

### Code Quality
- [ ] Remove console.log statements
- [ ] Remove debug code
- [ ] Update comments with production settings
- [ ] Git commit all changes

### Deployment
- [ ] Deploy to staging first
- [ ] Verify all API endpoints work
- [ ] Check Supabase logs for errors
- [ ] Monitor first few transactions
- [ ] Deploy to production
- [ ] Post-deployment smoke tests

## 🔒 Security Audit Script

Run this in Supabase SQL Editor to review all policies:

```sql
-- Review all policies for our tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE
        WHEN roles::text LIKE '%anon%' AND (qual = 'true' OR with_check = 'true')
        THEN '⚠️ PERMISSIVE ANON POLICY'
        ELSE '✅ OK'
    END as security_status,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('customer_services', 'service_conditions_log')
ORDER BY tablename, policyname;
```

Look for any policies with:
- Role = `anon` AND qual/with_check = `true` (⚠️ Very permissive!)
- Consider if these are appropriate for production

## 📝 Migration Files for Production RLS

**Create:** `supabase/migrations/002a_production_rls_policies.sql`

```sql
-- Production RLS Policies
-- Run this when deploying to production

-- Drop development policies
DROP POLICY IF EXISTS "Allow anon to insert for development" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to read customer services" ON customer_services;
DROP POLICY IF EXISTS "Allow anon to update customer services" ON customer_services;

-- Add production policies (choose your approach)
-- See options above in this checklist

-- Log the change
INSERT INTO migration_log (migration_name, applied_at)
VALUES ('002a_production_rls_policies', NOW());
```

## 🎯 Quick Pre-Deploy Command

Add this to package.json:

```json
{
  "scripts": {
    "predeploy": "node check-production-ready.js"
  }
}
```

Create `check-production-ready.js`:
- Verify no development RLS policies
- Check for console.log statements
- Verify environment variables
- Run security audit

## 🚨 Reminder System

1. **Git Pre-commit Hook** - Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
if git diff --cached --name-only | grep -q "001a_customer_services_dev_policy.sql"; then
    echo "⚠️  WARNING: Development RLS policies detected!"
    echo "Remember to apply production policies before deploying!"
    read -p "Continue commit? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

2. **Deployment Warning in README** - Already documented
3. **This checklist** - Reference before every production deploy

## 📅 When to Apply Production Policies

**Recommended Approach:**
1. Keep development policies during local testing
2. Apply production policies to staging environment first
3. Test thoroughly in staging
4. Apply same production policies to production
5. Monitor closely after deployment

**Timeline:**
- Development: Use permissive policies ✅ (current state)
- Staging: Use production policies 🔄 (before staging deploy)
- Production: Use production policies 🔄 (before production deploy)
