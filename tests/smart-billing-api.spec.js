import { test, expect } from '@playwright/test';

/**
 * Smart Billing API Tests
 * Tests the production API endpoints directly
 */

const BASE_URL = process.env.TEST_URL || 'https://sailorskills-billing-c20mwqydc-brians-projects-bc2d3592.vercel.app';
const TEST_CUSTOMER_ID = 'cus_T0qqGn9xCudHEO'; // John Doe 2 - Test customer with sample services

test.describe('Smart Billing - API Endpoints', () => {
    test('GET /api/customer-services - should return customer services', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/customer-services?customerId=${TEST_CUSTOMER_ID}`);

        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.services).toBeInstanceOf(Array);
        expect(data.count).toBeGreaterThan(0);

        // Verify service structure
        const service = data.services[0];
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('customer_id', TEST_CUSTOMER_ID);
        expect(service).toHaveProperty('service_name');
        expect(service).toHaveProperty('service_type');
        expect(service).toHaveProperty('frequency');
        expect(service).toHaveProperty('base_price');
        expect(service).toHaveProperty('status');

        console.log(`✅ Found ${data.count} services for customer ${TEST_CUSTOMER_ID}`);
    });

    test('GET /api/customer-services - should return 400 without customerId', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/customer-services`);

        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data.error).toBeTruthy();
    });

    test('GET /api/customer-services - should return empty for non-existent customer', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/customer-services?customerId=cus_nonexistent123`);

        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.services).toEqual([]);
        expect(data.count).toBe(0);
    });

    test('GET /api/service-logs - should return service logs', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/service-logs?customerId=${TEST_CUSTOMER_ID}`);

        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.logs).toBeInstanceOf(Array);
        expect(data).toHaveProperty('count');

        console.log(`✅ Found ${data.count} service logs for customer ${TEST_CUSTOMER_ID}`);
    });

    test('GET /api/service-logs - should return 400 without customerId or boatId', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/service-logs`);

        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data.error).toBeTruthy();
    });

    test('POST /api/save-conditions - should save service conditions', async ({ request }) => {
        const testConditions = {
            customer_id: TEST_CUSTOMER_ID,
            service_type: 'recurring_cleaning',
            service_name: 'Test Cleaning Service',
            paint_condition_overall: 'good',
            growth_level: 'light',
            anode_conditions: [
                { type: 'shaft', condition: 'fair' }
            ],
            anodes_installed: [
                {
                    id: 'test_anode_1',
                    name: 'Shaft Anode 1.5"',
                    quantity: 2,
                    unit_price: 45.00
                }
            ],
            thru_hull_condition: 'excellent',
            propeller_1_condition: 'good',
            notes: 'Playwright API test'
        };

        const response = await request.post(`${BASE_URL}/api/save-conditions`, {
            data: testConditions
        });

        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.condition_log_id).toBeTruthy();
        expect(data.message).toContain('successfully');

        console.log(`✅ Saved condition log with ID: ${data.condition_log_id}`);

        // Verify we can retrieve it
        const logsResponse = await request.get(`${BASE_URL}/api/service-logs?customerId=${TEST_CUSTOMER_ID}`);
        const logsData = await logsResponse.json();

        expect(logsData.count).toBeGreaterThan(0);
        const savedLog = logsData.logs.find(log => log.id === data.condition_log_id);
        expect(savedLog).toBeTruthy();
        expect(savedLog.paint_condition_overall).toBe('good');
        expect(savedLog.growth_level).toBe('light');
        expect(savedLog.anodes_installed).toHaveLength(1);

        console.log(`✅ Verified condition log was saved and can be retrieved`);
    });

    test('POST /api/save-conditions - should return 400 without required fields', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/save-conditions`, {
            data: {}
        });

        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data.error).toBeTruthy();
    });
});

test.describe('Smart Billing - End-to-End Flow', () => {
    test('Complete billing flow - fetch services, save conditions, verify logs', async ({ request }) => {
        // Step 1: Fetch customer services
        console.log('Step 1: Fetching customer services...');
        const servicesResponse = await request.get(`${BASE_URL}/api/customer-services?customerId=${TEST_CUSTOMER_ID}`);
        expect(servicesResponse.ok()).toBeTruthy();

        const servicesData = await servicesResponse.json();
        expect(servicesData.services.length).toBeGreaterThan(0);

        const selectedService = servicesData.services[0];
        console.log(`✅ Found service: ${selectedService.service_name}`);

        // Step 2: Save condition data
        console.log('Step 2: Saving service conditions...');
        const conditionsData = {
            customer_id: TEST_CUSTOMER_ID,
            service_id: selectedService.id,
            service_type: selectedService.service_type,
            service_name: selectedService.service_name,
            paint_condition_overall: 'excellent',
            growth_level: 'minimal',
            anode_conditions: [
                { type: 'shaft', condition: 'excellent' },
                { type: 'prop', condition: 'good' }
            ],
            anodes_installed: [
                {
                    id: 'anode_test_001',
                    name: 'Shaft Anode 2"',
                    quantity: 1,
                    unit_price: 55.00,
                    inventory_id: 'inv_123'
                }
            ],
            thru_hull_condition: 'good',
            thru_hull_notes: 'All clear, no issues',
            propeller_1_condition: 'excellent',
            propeller_notes: 'Minor nicks, still good',
            notes: 'E2E test - complete service log',
            created_by: 'playwright_test'
        };

        const saveResponse = await request.post(`${BASE_URL}/api/save-conditions`, {
            data: conditionsData
        });
        expect(saveResponse.ok()).toBeTruthy();

        const saveData = await saveResponse.json();
        expect(saveData.success).toBe(true);
        const logId = saveData.condition_log_id;
        console.log(`✅ Saved condition log: ${logId}`);

        // Step 3: Fetch and verify service logs
        console.log('Step 3: Fetching and verifying service logs...');
        const logsResponse = await request.get(`${BASE_URL}/api/service-logs?customerId=${TEST_CUSTOMER_ID}`);
        expect(logsResponse.ok()).toBeTruthy();

        const logsData = await logsResponse.json();
        expect(logsData.success).toBe(true);

        const savedLog = logsData.logs.find(log => log.id === logId);
        expect(savedLog).toBeTruthy();

        // Verify all fields were saved correctly
        expect(savedLog.service_type).toBe(conditionsData.service_type);
        expect(savedLog.paint_condition_overall).toBe('excellent');
        expect(savedLog.growth_level).toBe('minimal');
        expect(savedLog.anode_conditions).toHaveLength(2);
        expect(savedLog.anodes_installed).toHaveLength(1);
        expect(savedLog.anodes_installed[0].name).toBe('Shaft Anode 2"');
        expect(savedLog.thru_hull_condition).toBe('good');
        expect(savedLog.propeller_1_condition).toBe('excellent');

        console.log(`✅ Verified all condition data was saved correctly`);
        console.log(`✅ End-to-end flow complete!`);
    });
});
