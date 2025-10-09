# Smart Billing Testing Guide

## Prerequisites
- ✅ Database migrations applied
- ✅ Sample data added
- 🔄 Local dev server running

## Starting the Dev Server

```bash
# Option 1: If you have a dev server configured
npm run dev

# Option 2: Use a simple HTTP server
npx http-server dist -p 8001
```

## Test Scenarios

### Test 1: Customer with Recurring Service

**Steps:**
1. Open http://localhost:8001/admin.html
2. In the universal search, search for: `John Doe 2`
3. Select the customer from results

**Expected Results:**
- ✅ Service selection modal should appear
- ✅ Shows: "Recurring Cleaning and Anodes - Two Months"
- ✅ Shows: "Recurring Cleaning - Monthly" (paused status)
- ✅ "Bill for this service" button visible

### Test 2: Service Selection and Wizard Pre-fill

**Steps:**
1. From the service modal, click "Bill for this service" on the active service
2. Wizard/form should appear

**Expected Results:**
- ✅ Service is auto-selected
- ✅ Boat length pre-filled: 35
- ✅ Base price shows: $250.00
- ✅ Condition fields visible (paint, growth, anodes, etc.)

### Test 3: Condition Data Entry

**Steps:**
1. Fill in condition fields:
   - Paint Condition: Good
   - Growth Level: Light
   - Through-hull Condition: Excellent
   - Propeller 1: Good
   - Notes: "Test service"
2. (Optional) Add anodes from inventory
3. Click "Charge Customer" (use test mode)

**Expected Results:**
- ✅ Payment processes successfully
- ✅ Conditions automatically saved to database
- ✅ Check browser console for success message

### Test 4: Verify Conditions Saved

**Steps:**
1. After charge completes, open browser DevTools Console
2. Run this JavaScript:

```javascript
fetch('/api/service-logs?customerId=cus_T0qqGn9xCudHEO')
  .then(r => r.json())
  .then(data => console.table(data.logs))
```

**Expected Results:**
- ✅ Shows the service log entry
- ✅ Contains all condition data
- ✅ Shows any anodes installed
- ✅ Displays customer_id, service_date, etc.

### Test 5: Customer Without Services

**Steps:**
1. Search for a different customer (e.g., "Jacqueline Zalstein")
2. Select customer

**Expected Results:**
- ✅ No service modal appears
- ✅ Proceeds to manual service selection
- ✅ Standard flow continues

## API Endpoint Tests

### Test GET /api/customer-services

```bash
# Using curl
curl "http://localhost:8001/api/customer-services?customerId=cus_T0qqGn9xCudHEO"

# Expected response:
{
  "success": true,
  "services": [
    {
      "id": "...",
      "service_name": "Recurring Cleaning and Anodes - Two Months",
      "frequency": "two_months",
      "base_price": 250.00
    }
  ],
  "count": 2
}
```

### Test GET /api/service-logs

```bash
curl "http://localhost:8001/api/service-logs?customerId=cus_T0qqGn9xCudHEO"

# Expected: List of service logs (empty initially)
```

### Test POST /api/save-conditions

```bash
curl -X POST http://localhost:8001/api/save-conditions \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cus_T0qqGn9xCudHEO",
    "service_type": "recurring_cleaning",
    "paint_condition_overall": "good",
    "growth_level": "light"
  }'

# Expected:
{
  "success": true,
  "condition_log_id": "...",
  "message": "Conditions saved successfully"
}
```

## Troubleshooting

### Service Modal Doesn't Appear
- Check browser console for errors
- Verify API endpoint is reachable: `/api/customer-services?customerId=xxx`
- Ensure customer has active services in database

### Conditions Not Saving
- Check browser console for API errors
- Verify `/api/save-conditions` endpoint is accessible
- Check Supabase logs for RLS policy issues

### API Returns 404
- Ensure you're running the dev server from the correct directory
- Verify Vercel CLI is running if using `vercel dev`
- Check that API files exist in `/api` folder

## Playwright Tests

Run automated tests:

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run only smart billing tests
npx playwright test tests/smart-billing-flow.spec.js

# Run with UI
npx playwright test --ui
```

## Database Verification

Check data in Supabase:

```sql
-- View all customer services
SELECT * FROM customer_services ORDER BY created_at DESC;

-- View all service logs
SELECT * FROM service_conditions_log ORDER BY created_at DESC;

-- View services for specific customer
SELECT * FROM customer_services WHERE customer_id = 'cus_T0qqGn9xCudHEO';
```

## Success Criteria

All tests pass when:
- ✅ Customer service detection works
- ✅ Service modal displays correctly
- ✅ Condition fields collect data
- ✅ Data saves to database after charge
- ✅ API endpoints return correct data
- ✅ Portal can fetch service logs
- ✅ Playwright tests pass

## Next Steps

After testing:
1. Add more customer services for real customers
2. Update Portal to display service logs
3. Add photos upload functionality
4. Implement additional condition fields if needed
5. Deploy to production
