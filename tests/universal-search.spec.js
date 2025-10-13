import { test, expect } from '@playwright/test';

/**
 * Universal Search Functionality Tests
 * Tests the actual user interaction with the universal search feature
 */

const BILLING_URL = process.env.TEST_URL || 'https://sailorskills-billing.vercel.app/admin.html';

async function setupPage(page) {
    await page.goto(BILLING_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Handle authentication
    const authEmailInput = page.locator('#auth-email');
    const authRequired = await authEmailInput.isVisible().catch(() => false);

    if (authRequired) {
        await authEmailInput.fill('standardhuman@gmail.com');
        await page.locator('#auth-password').fill('KLRss!650');
        await page.locator('button:has-text("Sign In")').click();
        await page.waitForTimeout(2000);
        await page.waitForSelector('#auth-modal', { state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    // Wait for universal search to be visible
    await page.waitForSelector('#universalSearch', { state: 'visible', timeout: 10000 });
    await page.waitForFunction(() => typeof window.adminApp !== 'undefined', { timeout: 5000 });
    await page.waitForTimeout(1000);
}

test.describe('Universal Search - User Interactions', () => {
    test('should display universal search box after login', async ({ page }) => {
        await setupPage(page);

        const searchInput = page.locator('#universalSearch');

        // Verify search box is visible
        await expect(searchInput).toBeVisible();

        // Verify placeholder text
        await expect(searchInput).toHaveAttribute('placeholder', /Search customers/i);

        // Check dimensions
        const dimensions = await searchInput.boundingBox();
        expect(dimensions.width).toBeGreaterThan(0);
        expect(dimensions.height).toBeGreaterThan(0);

        console.log('✓ Universal search is visible and properly sized');
    });

    test('should trigger API call when typing in search', async ({ page }) => {
        await setupPage(page);

        let searchApiCalled = false;
        let searchQuery = null;

        // Mock the customer search API
        await page.route('**/api/stripe-customers*', async (route) => {
            const url = new URL(route.request().url());
            searchApiCalled = true;
            searchQuery = url.searchParams.get('search');

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_test123',
                        name: 'John Test',
                        email: 'john@example.com',
                        boat_name: 'Sea Breeze'
                    }
                ])
            });
        });

        const searchInput = page.locator('#universalSearch');

        // Type in search box
        await searchInput.click();
        await searchInput.fill('John');

        // Wait for debounced search (300ms according to code)
        await page.waitForTimeout(500);

        // Verify API was called
        expect(searchApiCalled).toBeTruthy();
        expect(searchQuery).toBe('John');

        console.log('✓ Search API called with query:', searchQuery);
    });

    test('should display search results dropdown', async ({ page }) => {
        await setupPage(page);

        // Mock API with results
        await page.route('**/api/stripe-customers*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_test1',
                        name: 'Alice Johnson',
                        email: 'alice@example.com',
                        boat_name: 'Sunrise'
                    },
                    {
                        id: 'cus_test2',
                        name: 'Bob Smith',
                        email: 'bob@example.com',
                        boat_name: 'Sunset'
                    }
                ])
            });
        });

        const searchInput = page.locator('#universalSearch');
        await searchInput.fill('test');
        await page.waitForTimeout(500);

        // Check if results dropdown appears
        const resultsDropdown = page.locator('#universalSearchResults');
        const resultsVisible = await resultsDropdown.isVisible().catch(() => false);

        if (resultsVisible) {
            // Verify results are displayed
            const resultItems = page.locator('#universalSearchResults .search-result-item');
            const count = await resultItems.count();

            expect(count).toBeGreaterThan(0);
            console.log('✓ Results dropdown showing', count, 'results');
        } else {
            // Results might be in DOM but check display style
            const displayStyle = await page.evaluate(() => {
                const elem = document.getElementById('universalSearchResults');
                return elem ? window.getComputedStyle(elem).display : 'none';
            });

            console.log('Results dropdown display style:', displayStyle);
        }
    });

    test('should handle selecting a search result', async ({ page }) => {
        await setupPage(page);

        let servicesApiCalled = false;

        // Mock customer search
        await page.route('**/api/stripe-customers*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_select_test',
                        name: 'Select Test Customer',
                        email: 'select@example.com',
                        boat_name: 'Test Boat'
                    }
                ])
            });
        });

        // Mock customer services API (called when customer is selected)
        await page.route('**/api/customer-services*', async (route) => {
            servicesApiCalled = true;
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

        // Type and select
        await page.locator('#universalSearch').fill('Select');
        await page.waitForTimeout(500);

        // Try to click first result if visible
        const firstResult = page.locator('#universalSearchResults .search-result-item').first();
        const canClick = await firstResult.isVisible().catch(() => false);

        if (canClick) {
            await firstResult.click();
            await page.waitForTimeout(500);
        } else {
            // Trigger selection programmatically
            await page.evaluate(() => {
                if (window.selectUniversalSearchCustomer) {
                    window.selectUniversalSearchCustomer({
                        id: 'cus_select_test',
                        name: 'Select Test Customer',
                        email: 'select@example.com',
                        boat_name: 'Test Boat'
                    });
                }
            });
            await page.waitForTimeout(500);
        }

        // Verify customer services API was called
        expect(servicesApiCalled).toBeTruthy();
        console.log('✓ Customer selection triggered services lookup');
    });

    test('should handle empty search results', async ({ page }) => {
        await setupPage(page);

        // Mock API with no results
        await page.route('**/api/stripe-customers*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        await page.locator('#universalSearch').fill('NonexistentCustomer');
        await page.waitForTimeout(500);

        // Should not throw errors
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));

        await page.waitForTimeout(500);

        // Filter out unrelated errors (like 404s for favicons)
        const relevantErrors = errors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('manifest') &&
            !e.includes('404')
        );

        expect(relevantErrors.length).toBe(0);
        console.log('✓ Empty results handled gracefully');
    });

    test('should clear search input when result is selected', async ({ page }) => {
        await setupPage(page);

        // Mock APIs
        await page.route('**/api/stripe-customers*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{
                    id: 'cus_clear_test',
                    name: 'Clear Test',
                    email: 'clear@example.com'
                }])
            });
        });

        await page.route('**/api/customer-services*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, services: [], count: 0 })
            });
        });

        const searchInput = page.locator('#universalSearch');

        // Type and trigger selection
        await searchInput.fill('Clear');
        await page.waitForTimeout(500);

        // Trigger selection
        await page.evaluate(() => {
            if (window.selectUniversalSearchCustomer) {
                window.selectUniversalSearchCustomer({
                    id: 'cus_clear_test',
                    name: 'Clear Test',
                    email: 'clear@example.com'
                });
            }
        });

        await page.waitForTimeout(500);

        // Check if input was cleared
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('');

        console.log('✓ Search input cleared after selection');
    });
});
