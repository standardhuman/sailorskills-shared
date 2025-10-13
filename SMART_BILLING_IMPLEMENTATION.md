# Smart Billing Flow Implementation

## Overview
This document describes the Smart Billing Flow feature that streamlines the billing process for customers with recurring services.

## Features Implemented

### 1. **Customer Service Detection**
When a customer is selected via the universal search:
- System automatically fetches their active recurring services from the database
- If services exist, displays a service selection modal
- If no services, proceeds with manual service selection

### 2. **Service Selection Modal**
- Shows customer information (name, boat, email)
- Lists all active recurring services with:
  - Service icon and name
  - Frequency (weekly, monthly, etc.)
  - Boat length
  - Base price
- Option to bill for recurring service or choose different service

### 3. **Condition & Anodes Tracking**
All service conditions are automatically logged to the database for Portal access:
- Paint condition
- Growth level
- Anode conditions (by type)
- **Anodes installed** (full details from shopping cart)
- Through-hull condition & notes
- Propeller conditions & notes

### 4. **Portal Integration**
Condition data is saved via API and accessible to Portal for service history display.

## Database Schema

### `customer_services` Table
Tracks recurring services that customers are signed up for.

**Columns:**
- `id` (UUID, PK)
- `customer_id` (TEXT) - Stripe customer ID
- `boat_id` (UUID) - Reference to boat
- `service_type` (TEXT) - Service key
- `service_name` (TEXT) - Display name
- `frequency` (TEXT) - Service frequency
- `base_price` (DECIMAL)
- `boat_length` (INTEGER)
- `includes_anodes` (BOOLEAN)
- `twin_engines` (BOOLEAN)
- `hull_type` (TEXT)
- `boat_type` (TEXT)
- `status` (TEXT) - active, paused, cancelled
- `created_at`, `updated_at`, `cancelled_at`

### `service_conditions_log` Table
Stores condition data from service completion.

**Columns:**
- `id` (UUID, PK)
- `customer_id` (TEXT)
- `boat_id` (UUID)
- `service_id` (UUID) - Reference to customer_services
- `order_id` (TEXT) - Stripe payment intent ID
- `service_type`, `service_name`
- `service_date`, `service_time`
- `paint_condition_overall` (TEXT)
- `growth_level` (TEXT)
- `anode_conditions` (JSONB) - Array of {type, condition}
- **`anodes_installed`** (JSONB) - Array of {id, name, quantity, location, unit_price, inventory_id}
- `thru_hull_condition`, `thru_hull_notes`
- `propeller_1_condition`, `propeller_2_condition`, `propeller_notes`
- `time_in`, `time_out`
- `notes`, `photos` (JSONB array)
- `created_at`, `created_by`

## API Endpoints

### GET `/api/customer-services`
Fetches active recurring services for a customer.

**Query Parameters:**
- `customerId` (required) - Stripe customer ID

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": "uuid",
      "service_name": "Recurring Cleaning and Anodes - Two Months",
      "service_type": "recurring_cleaning",
      "frequency": "two_months",
      "boat_length": 35,
      "base_price": 250.00
    }
  ],
  "count": 1
}
```

### POST `/api/save-conditions`
Saves service condition data.

**Request Body:**
```json
{
  "customer_id": "cus_xxx",
  "boat_id": "uuid",
  "service_id": "uuid",
  "order_id": "pi_xxx",
  "service_type": "recurring_cleaning",
  "service_name": "Recurring Cleaning",
  "paint_condition_overall": "good",
  "growth_level": "light",
  "anode_conditions": [
    {"type": "shaft", "condition": "fair"}
  ],
  "anodes_installed": [
    {
      "id": "anode_123",
      "name": "Shaft Anode 1.5\"",
      "quantity": 2,
      "unit_price": 45.00,
      "inventory_id": "inv_456"
    }
  ],
  "thru_hull_condition": "good",
  "propeller_1_condition": "excellent"
}
```

**Response:**
```json
{
  "success": true,
  "condition_log_id": "uuid",
  "message": "Conditions saved successfully"
}
```

### GET `/api/service-logs`
Retrieves service condition logs (for Portal).

**Query Parameters:**
- `boatId` or `customerId` (required)
- `limit` (optional, default 50)
- `offset` (optional, default 0)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "service_date": "2025-10-09",
      "service_type": "recurring_cleaning",
      "paint_condition_overall": "good",
      "growth_level": "light",
      "anodes_installed": [...]
    }
  ],
  "count": 1
}
```

## User Flow

### Scenario 1: Customer with Recurring Service

1. User searches for "Brian Cline" in universal search
2. System fetches customer services
3. Modal appears: "Brian Cline is signed up for: Recurring Cleaning and Anodes - Two Months"
4. User clicks "Bill for this service"
5. Service is auto-selected, wizard appears
6. User fills in condition fields only (paint, growth, prop, anodes)
7. Anodes selector remains visible for adding/selecting anodes
8. User charges customer
9. Conditions + anodes data automatically saved to database
10. Portal can access this data for service history

### Scenario 2: Customer without Recurring Service

1. User searches for customer
2. No services found
3. User proceeds with manual service selection
4. Standard wizard flow continues

### Scenario 3: Customer Wants Different Service

1. User searches for customer with recurring service
2. Modal appears with existing services
3. User clicks "Bill for Different Service"
4. Proceeds with manual service selection

## Anodes Integration

The anodes selector remains available for all relevant services:
- Recurring Cleaning
- One-Time Cleaning
- Anodes Only

**Data Flow:**
1. User selects anodes from inventory
2. Anodes added to shopping cart (`window.anodeCart`)
3. On charge, anode details collected:
   - ID, name, quantity
   - Unit price
   - Inventory ID (for consumption tracking)
4. Saved to `anodes_installed` field in conditions log
5. Portal can display which anodes were installed for each service

## Integration Points

### Billing → Portal
- Conditions data saved via `/api/save-conditions`
- Portal fetches via `/api/service-logs?boatId=xxx`
- Displays service history with conditions and anodes

### Billing Internal
- `window.selectedRecurringService` - Stores selected service
- `window.collectServiceConditions()` - Collects all condition data
- `window.saveServiceConditionsLog()` - Saves to database
- Integrated into `chargeCustomer()` flow automatically

## TODO: Additional Enhancements

### Pre-fill Wizard (Future Enhancement)
To fully implement pre-filled wizard with conditions-only fields:

1. **Modify `renderConsolidatedForm()`** in compiled JS:
   - Accept `prefillMode` parameter
   - When true, hide boat info fields
   - Pre-fill from `window.selectedRecurringService`
   - Show only condition fields

2. **Fields to Hide in Prefill Mode:**
   - Boat name, length, make, model
   - Hull type, boat type
   - Twin engines checkbox
   - Other static boat info

3. **Fields to Show:**
   - Paint condition (required)
   - Growth level (required)
   - Anode conditions
   - Through-hull condition & notes
   - Propeller conditions & notes
   - Anodes selector (always visible)

4. **Payment Pre-fill:**
   - Auto-select default payment method from Stripe
   - Show card details
   - Enable immediate charge

## Testing Checklist

- [x] Database schema created
- [x] API endpoints created
- [x] Customer service detection works
- [x] Service selection modal displays
- [x] Condition data collection works
- [x] Anodes data included in conditions
- [ ] Database migrations applied
- [ ] Test with real customer data
- [ ] Verify Portal can access data
- [ ] Test payment flow with condition saving
- [ ] Test anodes selector visibility
- [ ] Playwright tests updated

## Deployment Steps

1. **Apply Database Migrations:**
   ```sql
   -- Run in Supabase SQL Editor
   \i supabase/migrations/001_customer_services.sql
   \i supabase/migrations/002_service_conditions_log.sql
   ```

2. **Add Sample Data (for testing):**
   ```sql
   INSERT INTO customer_services (customer_id, service_type, service_name, frequency, boat_length, base_price)
   VALUES ('cus_test123', 'recurring_cleaning', 'Recurring Cleaning and Anodes - Two Months', 'two_months', 35, 250.00);
   ```

3. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add smart billing flow with condition and anodes tracking"
   git push origin main
   ```

4. **Verify APIs:**
   - Test `/api/customer-services`
   - Test `/api/save-conditions`
   - Test `/api/service-logs`

5. **Update Portal:**
   - Add service log display
   - Fetch from `/api/service-logs?boatId=xxx`
   - Show conditions and anodes installed

## Notes

- Anodes selector is always available for relevant services (cleaning, anodes-only)
- Anodes data includes inventory_id for consumption tracking
- Conditions are saved automatically after successful payment
- All data is accessible to Portal via API
- Service pre-fill is partially implemented (needs compiled JS update for full functionality)

## Support

For issues or questions:
- Check browser console for errors
- Verify database migrations ran successfully
- Check API endpoint responses
- Review Supabase logs
