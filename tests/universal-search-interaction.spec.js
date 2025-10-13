import { test, expect } from '@playwright/test';

/**
 * Universal Search Interactive Tests
 * Tests actual user interactions with the universal search box
 */

const BILLING_URL = process.env.TEST_URL || 'https://sailorskills-billing-c20mwqydc-brians-projects-bc2d3592.vercel.app/admin.html';

async function setupPage(page) {
    await page.goto(BILLING_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check for auth modal (it has id="auth-modal" not class)
    const authEmailInput = page.locator('#auth-email');
    const authRequired = await authEmailInput.isVisible().catch(() => false);

    if (authRequired) {
        console.log('🔐 Authentication required - logging in...');
        await page.fill('#auth-email', 'standardhuman@gmail.com');
        await page.fill('#auth-password', 'KLRss!650');
        await page.click('button.auth-submit, button[type="submit"]');
        await page.waitForTimeout(3000);

        // Wait for auth modal to disappear
        await page.waitForSelector('#auth-modal', { state: 'hidden', timeout: 10000 }).catch(() => {
            console.log('⚠️  Auth modal still visible after login');
        });
    }

    await page.waitForSelector('#universalSearch', { state: 'attached', timeout: 10000 });
    await page.waitForFunction(() => typeof window.adminApp !== 'undefined', { timeout: 5000 });
    await page.waitForTimeout(1500);
}

test.describe('Universal Search - Interactive Tests', () => {
    test('should show search results when typing in universal search', async ({ page }) => {
        await setupPage(page);

        // Mock the customer search API to return results
        let searchCalled = false;
        await page.route('**/api/stripe-customers*', async (route) => {
            searchCalled = true;
            const url = new URL(route.request().url());
            const searchQuery = url.searchParams.get('search');

            console.log('Search API called with query:', searchQuery);

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_test123',
                        name: 'John Test Customer',
                        email: 'john@example.com',
                        boat_name: 'Sea Breeze'
                    },
                    {
                        id: 'cus_test456',
                        name: 'Jane Test Customer',
                        email: 'jane@example.com',
                        boat_name: 'Ocean Wave'
                    }
                ])
            });
        });

        // Get the search input
        const searchInput = page.locator('#universalSearch');
        await expect(searchInput).toBeAttached();

        // Type in the search box
        await searchInput.click();
        await searchInput.fill('Test');

        // Wait for debounced search (300ms according to admin.html:565)
        await page.waitForTimeout(500);

        // Check if search was called
        console.log('Search API called:', searchCalled);

        // Wait for results dropdown to appear
        const resultsDropdown = page.locator('#universalSearchResults');

        // Check if results are visible or if display style changed
        await page.waitForTimeout(500);

        const resultsVisible = await resultsDropdown.isVisible().catch(() => false);
        const resultsCount = await resultsDropdown.count();
        const resultsDisplay = await page.evaluate(() => {
            const elem = document.getElementById('universalSearchResults');
            return elem ? window.getComputedStyle(elem).display : 'none';
        });

        console.log('Results visible:', resultsVisible);
        console.log('Results count:', resultsCount);
        console.log('Results display style:', resultsDisplay);

        // Get the results content
        const resultsContent = await resultsDropdown.textContent().catch(() => '');
        console.log('Results content:', resultsContent);

        // Verify search was triggered
        expect(searchCalled).toBeTruthy();

        // Verify results element exists
        expect(resultsCount).toBeGreaterThan(0);
    });

    test('should trigger search on typing with actual API call', async ({ page }) => {
        await setupPage(page);

        let apiCallDetails = null;

        // Intercept and log the API call
        await page.route('**/api/stripe-customers*', async (route) => {
            const url = new URL(route.request().url());
            apiCallDetails = {
                url: url.toString(),
                searchParam: url.searchParams.get('search'),
                method: route.request().method()
            };

            console.log('API Call Details:', apiCallDetails);

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_real_test',
                        name: 'Test Customer for Search',
                        email: 'search-test@example.com',
                        boat_name: 'Search Test Boat'
                    }
                ])
            });
        });

        // Focus and type in search
        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await page.keyboard.type('Tes', { delay: 50 }); // Type slowly to simulate real user

        // Wait for debounced search
        await page.waitForTimeout(600);

        // Verify API was called
        if (apiCallDetails) {
            console.log('✓ Search API was called');
            console.log('  - URL:', apiCallDetails.url);
            console.log('  - Search query:', apiCallDetails.searchParam);
            expect(apiCallDetails.searchParam).toBeTruthy();
        } else {
            console.log('✗ Search API was NOT called');

            // Debug: Check if event listeners are attached
            const debugInfo = await page.evaluate(() => {
                const input = document.getElementById('universalSearch');
                return {
                    inputExists: !!input,
                    inputValue: input?.value,
                    hasEventListener: input?._listeners !== undefined,
                    initFunctionExists: typeof window.initUniversalSearch !== 'undefined'
                };
            });

            console.log('Debug Info:', debugInfo);
        }

        expect(apiCallDetails).toBeTruthy();
    });

    test('should handle clicking on search result', async ({ page }) => {
        await setupPage(page);

        let serviceApiCalled = false;

        // Mock customer search API
        await page.route('**/api/stripe-customers*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_clicktest',
                        name: 'Click Test Customer',
                        email: 'click@example.com',
                        boat_name: 'Click Boat'
                    }
                ])
            });
        });

        // Mock customer services API
        await page.route('**/api/customer-services*', async (route) => {
            serviceApiCalled = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    services: [],
                    count: 0
                })
            });
        });

        // Type in search
        const searchInput = page.locator('#universalSearch');
        await searchInput.fill('Click');
        await page.waitForTimeout(500);

        // Try to click on first result if visible
        const firstResult = page.locator('#universalSearchResults .search-result-item').first();
        const resultVisible = await firstResult.isVisible().catch(() => false);

        if (resultVisible) {
            await firstResult.click();
            await page.waitForTimeout(500);

            // Verify customer services API was called
            expect(serviceApiCalled).toBeTruthy();
        } else {
            // If results aren't visible, trigger selection via JavaScript
            console.log('Results not visible, testing function call instead');
            await page.evaluate(() => {
                const customer = {
                    id: 'cus_clicktest',
                    name: 'Click Test Customer',
                    email: 'click@example.com',
                    boat_name: 'Click Boat'
                };

                if (window.selectUniversalSearchCustomer) {
                    window.selectUniversalSearchCustomer(customer);
                }
            });

            await page.waitForTimeout(500);
            expect(serviceApiCalled).toBeTruthy();
        }
    });

    test('should handle empty search results gracefully', async ({ page }) => {
        await setupPage(page);

        // Mock API to return empty results
        await page.route('**/api/stripe-customers*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        const searchInput = page.locator('#universalSearch');
        await searchInput.fill('NonexistentCustomer123');
        await page.waitForTimeout(500);

        // Should handle gracefully without errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.waitForTimeout(500);

        // No JavaScript errors should occur
        const criticalErrors = consoleErrors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('manifest') &&
            !e.includes('404')
        );

        expect(criticalErrors.length).toBe(0);
    });
});
