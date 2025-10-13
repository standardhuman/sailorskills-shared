import { test, expect } from '@playwright/test';

/**
 * Test Felipe - A customer with complete data in both Stripe and Supabase
 */

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin';
const AUTH_EMAIL = 'standardhuman@gmail.com';
const AUTH_PASSWORD = 'KLRss!650';

test('Test Felipe autofill with complete data', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Auto-fill') || text.includes('Found') || text.includes('boat') || text.includes('address')) {
            console.log('BROWSER:', text);
        }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Login
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

    console.log('\n========== Testing Felipe (fulloa@ucsc.edu) ==========');

    // Search for Felipe by email
    const searchInput = page.locator('#universalSearch');
    await searchInput.click();
    await searchInput.fill('fulloa');
    await page.waitForTimeout(1500);

    // Take screenshot of search results
    await page.screenshot({ path: 'test-results/felipe-01-search.png', fullPage: true });

    // Check if search results appear
    const hasResults = await page.evaluate(() => {
        const results = document.getElementById('universalSearchResults');
        return results && results.innerHTML.length > 50;
    });

    console.log(`Search results found: ${hasResults}`);
    expect(hasResults).toBe(true);

    // Select first result
    await page.evaluate(() => {
        if (window.universalSearchResults && window.universalSearchResults.length > 0) {
            console.log('Selecting customer:', window.universalSearchResults[0]);
            window.selectUniversalSearchCustomer(window.universalSearchResults[0]);
        }
    });

    await page.waitForTimeout(2000);

    // Check customer card
    const cardVisible = await page.evaluate(() => {
        const card = document.getElementById('selectedCustomerCard');
        return card && window.getComputedStyle(card).display !== 'none';
    });

    console.log(`Customer card visible: ${cardVisible}`);
    await page.screenshot({ path: 'test-results/felipe-02-card.png', fullPage: true });

    // Get customer details
    const customerDetails = await page.evaluate(() => {
        return {
            name: document.getElementById('selectedCustomerName')?.textContent || '',
            details: document.getElementById('selectedCustomerDetails')?.textContent || '',
            stripeId: window.selectedCustomer?.id || '',
            email: window.selectedCustomer?.email || ''
        };
    });

    console.log('Customer card shows:', customerDetails);

    // Select Recurring Cleaning service
    await page.evaluate(() => {
        if (window.selectServiceDirect) {
            window.selectServiceDirect('recurring_cleaning');
        }
    });

    await page.waitForTimeout(4000); // Wait longer for API call to Supabase

    // Take screenshot of wizard
    await page.screenshot({ path: 'test-results/felipe-03-wizard.png', fullPage: true });

    // Check ALL autofilled fields
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

            // Global data
            hasBoatData: !!window.selectedBoat,
            boatData: window.selectedBoat,
            hasAddressData: !!window.selectedAddress,
            addressData: window.selectedAddress
        };
    });

    console.log('\n📋 Auto-filled Customer Data:');
    console.log('  Name:', autoFilledData.customerName);
    console.log('  Email:', autoFilledData.customerEmail);
    console.log('  Phone:', autoFilledData.customerPhone);

    console.log('\n🚤 Auto-filled Boat Data:');
    console.log('  Boat Name:', autoFilledData.boatName);
    console.log('  Length:', autoFilledData.boatLength);
    console.log('  Make:', autoFilledData.boatMake);
    console.log('  Model:', autoFilledData.boatModel);

    if (autoFilledData.hasBoatData) {
        console.log('\n✅ BOAT DATA FROM SUPABASE:');
        console.log(JSON.stringify(autoFilledData.boatData, null, 2));
    } else {
        console.log('\n❌ No boat data found in Supabase');
    }

    if (autoFilledData.hasAddressData) {
        console.log('\n✅ ADDRESS DATA FROM SUPABASE:');
        console.log(JSON.stringify(autoFilledData.addressData, null, 2));
    } else {
        console.log('\n❌ No address data found in Supabase');
    }

    // Verify at least customer info filled
    expect(autoFilledData.customerName).toBeTruthy();
    expect(autoFilledData.customerEmail).toContain('fulloa');

    // If boat data exists, verify it's filled
    if (autoFilledData.hasBoatData) {
        console.log('\n✅✅✅ SUCCESS! Boat data auto-filled from Supabase! ✅✅✅');
        expect(autoFilledData.boatName).toBeTruthy();
    } else {
        console.log('\n⚠️ Felipe exists in Supabase but has no boat data');
    }
});
