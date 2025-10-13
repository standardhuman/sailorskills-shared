import { test, expect } from '@playwright/test';

/**
 * Test Specific Customers: Kimber and Brad
 * Check if their boat data auto-fills from Supabase
 */

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin';
const AUTH_EMAIL = 'standardhuman@gmail.com';
const AUTH_PASSWORD = 'KLRss!650';

async function setupAuthenticatedPage(page) {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const authEmailInput = page.locator('#auth-email');
    const authRequired = await authEmailInput.isVisible().catch(() => false);

    if (authRequired) {
        await authEmailInput.fill(AUTH_EMAIL);
        await page.locator('#auth-password').fill(AUTH_PASSWORD);
        await page.locator('button:has-text("Sign In")').click();
        await page.waitForTimeout(3000);
    }

    await page.waitForSelector('#universalSearch', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(1000);
}

async function testCustomerAutofill(page, customerName) {
    console.log(`\n========== Testing Customer: ${customerName} ==========`);

    // Search for customer
    const searchInput = page.locator('#universalSearch');
    await searchInput.click();
    await searchInput.fill(customerName);
    await page.waitForTimeout(1500);

    // Check if search results appear
    const hasResults = await page.evaluate(() => {
        const results = document.getElementById('universalSearchResults');
        return results && results.innerHTML.length > 50;
    });

    if (!hasResults) {
        console.log(`❌ No search results found for ${customerName}`);
        return null;
    }

    // Click first result or select programmatically
    await page.evaluate(() => {
        if (window.universalSearchResults && window.universalSearchResults.length > 0) {
            window.selectUniversalSearchCustomer(window.universalSearchResults[0]);
        }
    });

    await page.waitForTimeout(2000);

    // Check if customer card appeared
    const cardVisible = await page.evaluate(() => {
        const card = document.getElementById('selectedCustomerCard');
        return card && window.getComputedStyle(card).display !== 'none';
    });

    console.log(`Customer card visible: ${cardVisible}`);

    // Get customer details from the card
    const customerDetails = await page.evaluate(() => {
        return {
            name: document.getElementById('selectedCustomerName')?.textContent || '',
            details: document.getElementById('selectedCustomerDetails')?.textContent || '',
            stripeId: window.selectedCustomer?.id || '',
            email: window.selectedCustomer?.email || ''
        };
    });

    console.log('Customer details:', customerDetails);

    // Select a service to trigger wizard and autofill
    await page.evaluate(() => {
        if (window.selectServiceDirect) {
            window.selectServiceDirect('recurring_cleaning');
        }
    });

    await page.waitForTimeout(3000);

    // Check all autofilled fields
    const autoFilledData = await page.evaluate(() => {
        return {
            // Customer fields
            customerName: document.getElementById('wizardCustomerName')?.value || '',
            customerEmail: document.getElementById('wizardCustomerEmail')?.value || '',
            customerPhone: document.getElementById('wizardCustomerPhone')?.value || '',

            // Boat fields
            boatName: document.getElementById('wizardBoatName')?.value || '',
            boatLength: (document.getElementById('wizardBoatLength') || document.getElementById('boat_length'))?.value || '',
            boatMake: (document.getElementById('wizardBoatMake') || document.getElementById('boat_make'))?.value || '',
            boatModel: (document.getElementById('wizardBoatModel') || document.getElementById('boat_model'))?.value || '',

            // Check if boat data exists globally
            hasBoatData: !!window.selectedBoat,
            boatData: window.selectedBoat || null,

            // Check if address data exists globally
            hasAddressData: !!window.selectedAddress,
            addressData: window.selectedAddress || null
        };
    });

    console.log('\n📋 Auto-filled data:');
    console.log('Customer:', {
        name: autoFilledData.customerName,
        email: autoFilledData.customerEmail,
        phone: autoFilledData.customerPhone
    });

    console.log('Boat:', {
        name: autoFilledData.boatName,
        length: autoFilledData.boatLength,
        make: autoFilledData.boatMake,
        model: autoFilledData.boatModel
    });

    if (autoFilledData.hasBoatData) {
        console.log('✅ Boat data from Supabase:', autoFilledData.boatData);
    } else {
        console.log('❌ No boat data found in Supabase for this customer');
    }

    if (autoFilledData.hasAddressData) {
        console.log('✅ Address data from Supabase:', autoFilledData.addressData);
    } else {
        console.log('❌ No address data found in Supabase for this customer');
    }

    return autoFilledData;
}

test.describe('Test Specific Customers', () => {
    test('Test Kimber autofill', async ({ page }) => {
        await setupAuthenticatedPage(page);
        const data = await testCustomerAutofill(page, 'Kimber');

        if (data) {
            // Take screenshot
            await page.screenshot({ path: 'test-results/kimber-autofill.png', fullPage: true });

            // Verify at least customer name is filled
            expect(data.customerName).toBeTruthy();
            console.log('\n✅ Kimber test completed');
        }
    });

    test('Test Brad autofill', async ({ page }) => {
        await setupAuthenticatedPage(page);
        const data = await testCustomerAutofill(page, 'Brad');

        if (data) {
            // Take screenshot
            await page.screenshot({ path: 'test-results/brad-autofill.png', fullPage: true });

            // Verify at least customer name is filled
            expect(data.customerName).toBeTruthy();
            console.log('\n✅ Brad test completed');
        }
    });
});
