# Customer Services Integration - TODO

## Status
**Partially Implemented** - Boat location fields added, but full billing plan integration pending.

## What's Working
- ✅ Boat location fields (dock, slip, marina) added to boats table
- ✅ Full boat details displayed in customer data table (make, model, length, type)
- ✅ Boat location shown in customer detail modal
- ✅ Data table columns for boat information (hidden by default, toggleable)

## What's Pending
The `customer_services` table contains valuable billing plan data:
- Billing frequency/interval (`frequency`: monthly, two_months, quarterly, etc.)
- Plan status (`status`: active, paused, cancelled)
- Hull type (`hull_type`: monohull, catamaran, trimaran)
- Twin engines flag (`twin_engines`: boolean)
- Includes anodes (`includes_anodes`: boolean)
- Start date (`created_at`)

### Blocker
The `customer_services` table uses `customer_id` as TEXT (Stripe customer ID like 'cus_XXXXX'), but the `customers` table doesn't have this field.

### Solution Needed
1. Add `stripe_customer_id TEXT` column to `customers` table
2. Populate it from Stripe for existing customers
3. Update customer creation flow to store Stripe customer ID
4. Then join `customer_services` in the query:
   ```sql
   customers!inner(id, stripe_customer_id),
   customer_services!customer_services_customer_id_fkey(
     frequency, status, hull_type, twin_engines, includes_anodes, created_at
   )
   ```

### Data Transformations Needed
Once joined, transform the data:
- `hull_type` → number of hulls (monohull=1, catamaran=2, trimaran=3)
- `twin_engines` → number of engines (false=1, true=2)
- `frequency` → readable interval ("Every 2 Months")
- `created_at` → start month ("Jan 2025")

## Files Modified
- `database/add-boat-location-fields.sql` - Migration for dock/slip/marina
- `js/customers.js` - Updated queries and data table columns
