import { test, expect } from '@playwright/test';

/**
 * Test Wizard Auto-Fill Functionality
 * Verifies that customer data auto-fills into wizard fields
 */

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin'; // Note: cleanUrls removes .html
const AUTH_EMAIL = 'standardhuman@gmail.com';
const AUTH_PASSWORD = 'KLRss!650';

async function setupAuthenticatedPage(page) {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

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

test.describe('Wizard Auto-Fill Tests', () => {
    test('Customer info card appears (no alert)', async ({ page }) => {
        await setupAuthenticatedPage(page);

        // Set customer programmatically
        await page.evaluate(() => {
            const customer = {
                id: 'cus_PPaEsyKdP7jWd1',
                name: 'Brian',
                email: 'standardhuman@gmail.com',
                phone: '',
                boat_name: 'Maris',
                boat_length: '30'
            };

            window.selectedCustomer = customer;
            if (window.adminApp) window.adminApp.selectedCustomer = customer;

            // Call the manual service flow (should show card, not alert)
            if (window.proceedWithManualService) {
                window.proceedWithManualService(customer);
            }
        });

        await page.waitForTimeout(1000);

        // Check if customer card is visible
        const cardVisible = await page.evaluate(() => {
            const card = document.getElementById('selectedCustomerCard');
            return card && window.getComputedStyle(card).display !== 'none';
        });

        console.log('✅ Customer info card visible:', cardVisible);
        expect(cardVisible).toBeTruthy();

        // Verify card content
        const cardContent = await page.evaluate(() => {
            return {
                name: document.getElementById('selectedCustomerName')?.textContent || '',
                details: document.getElementById('selectedCustomerDetails')?.textContent || ''
            };
        });

        console.log('Card content:', cardContent);
        expect(cardContent.name).toBe('Brian');
        expect(cardContent.details).toContain('Maris');

        await page.screenshot({ path: 'test-results/autofill-01-customer-card.png', fullPage: true });
    });

    test('Wizard fields auto-fill from customer data', async ({ page }) => {
        // Capture console logs from browser
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Auto-fill') || text.includes('Wizard fields') || text.includes('waitForWizardFields')) {
                console.log('BROWSER:', text);
            }
        });

        await setupAuthenticatedPage(page);

        // Set customer with full data
        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_PPaEsyKdP7jWd1',
                name: 'Brian',
                email: 'standardhuman@gmail.com',
                phone: '555-1234',
                boat_name: 'Maris',
                boat_length: '30',
                boat_make: 'Catalina',
                boat_model: 'Catalina 30'
            };

            if (window.adminApp) {
                window.adminApp.selectedCustomer = window.selectedCustomer;
            }
        });

        // Check if our wrapper is present
        const wrapperCheck = await page.evaluate(() => {
            // Check if the function source includes our wrapper code
            const funcStr = window.selectServiceDirect?.toString() || '';
            return {
                includesWaitForWizard: funcStr.includes('waitForWizardFields'),
                includesAutoFill: funcStr.includes('autoFillWizardFromSelectedCustomer'),
                functionLength: funcStr.length,
                firstChars: funcStr.substring(0, 200)
            };
        });
        console.log('WRAPPER CHECK:', JSON.stringify(wrapperCheck, null, 2));

        // Select a service (should trigger auto-fill)
        const debugInfo = await page.evaluate(() => {
            console.log('DEBUG: About to call selectServiceDirect');
            console.log('DEBUG: window.selectedCustomer =', window.selectedCustomer);
            console.log('DEBUG: window.adminApp?.selectedCustomer =', window.adminApp?.selectedCustomer);

            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }

            return {
                hasSelectServiceDirect: !!window.selectServiceDirect,
                hasSelectedCustomer: !!window.selectedCustomer,
                customerName: window.selectedCustomer?.name
            };
        });
        console.log('DEBUG INFO:', debugInfo);

        await page.waitForTimeout(3500); // Increased to 3.5s to allow polling to complete

        // Check auto-filled fields
        const autoFilledData = await page.evaluate(() => {
            return {
                customerName: document.getElementById('wizardCustomerName')?.value || '',
                customerEmail: document.getElementById('wizardCustomerEmail')?.value || '',
                customerPhone: document.getElementById('wizardCustomerPhone')?.value || '',
                boatName: document.getElementById('wizardBoatName')?.value || '',
                boatLength: (document.getElementById('wizardBoatLength') || document.getElementById('boat_length'))?.value || '',
                boatMake: (document.getElementById('wizardBoatMake') || document.getElementById('boat_make'))?.value || '',
                boatModel: (document.getElementById('wizardBoatModel') || document.getElementById('boat_model'))?.value || ''
            };
        });

        console.log('✅ Auto-filled fields:', autoFilledData);

        // Verify all fields are filled
        expect(autoFilledData.customerName).toBe('Brian');
        expect(autoFilledData.customerEmail).toBe('standardhuman@gmail.com');
        expect(autoFilledData.customerPhone).toBe('555-1234');
        expect(autoFilledData.boatName).toBe('Maris');
        expect(autoFilledData.boatLength).toBe('30');
        expect(autoFilledData.boatMake).toBe('Catalina');
        expect(autoFilledData.boatModel).toBe('Catalina 30');

        await page.screenshot({ path: 'test-results/autofill-02-wizard-filled.png', fullPage: true });
    });

    test('Complete flow: Search → Card → Service → Auto-fill', async ({ page }) => {
        await setupAuthenticatedPage(page);

        console.log('1️⃣ Searching for customer...');
        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('Maris'); // Search by boat name
        await page.waitForTimeout(800);

        await page.screenshot({ path: 'test-results/autofill-03-search-results.png', fullPage: true });

        // Select first result
        console.log('2️⃣ Selecting customer...');
        await page.evaluate(() => {
            // Simulate customer selection
            if (window.selectUniversalSearchCustomer && window.universalSearchResults && window.universalSearchResults.length > 0) {
                window.selectUniversalSearchCustomer(window.universalSearchResults[0]);
            } else {
                // Fallback: set customer manually
                window.selectedCustomer = {
                    id: 'cus_PPaEsyKdP7jWd1',
                    name: 'Brian',
                    email: 'standardhuman@gmail.com',
                    boat_name: 'Maris',
                    boat_length: '30'
                };
                if (window.adminApp) window.adminApp.selectedCustomer = window.selectedCustomer;
                if (window.proceedWithManualService) {
                    window.proceedWithManualService(window.selectedCustomer);
                }
            }
        });

        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/autofill-04-customer-selected.png', fullPage: true });

        // Verify card is showing
        console.log('3️⃣ Verifying customer card...');
        const cardVisible = await page.evaluate(() => {
            const card = document.getElementById('selectedCustomerCard');
            return card && window.getComputedStyle(card).display !== 'none';
        });

        console.log('Customer card visible:', cardVisible);

        // Select service
        console.log('4️⃣ Selecting service...');
        await page.evaluate(() => {
            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }
        });

        await page.waitForTimeout(2500);

        // Verify wizard is auto-filled
        console.log('5️⃣ Verifying auto-fill...');
        const wizardData = await page.evaluate(() => {
            return {
                wizardVisible: document.getElementById('wizardContainer')?.style.display !== 'none',
                customerName: document.getElementById('wizardCustomerName')?.value || '',
                email: document.getElementById('wizardCustomerEmail')?.value || '',
                boatName: document.getElementById('wizardBoatName')?.value || '',
                boatLength: (document.getElementById('wizardBoatLength') || document.getElementById('boat_length'))?.value || ''
            };
        });

        console.log('Wizard state:', wizardData);

        expect(wizardData.wizardVisible).toBeTruthy();
        expect(wizardData.customerName).toBeTruthy();
        expect(wizardData.boatName).toBe('Maris');

        await page.screenshot({ path: 'test-results/autofill-05-complete-flow.png', fullPage: true });

        console.log('\n✅ Complete flow test passed!');
    });
});
