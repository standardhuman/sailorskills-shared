import { test, expect } from '@playwright/test';

/**
 * Test universal search with REAL API (no mocking)
 * This will test the actual production behavior
 */

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin.html';

test('real API - test search with actual production endpoint', async ({ page }) => {
    console.log('Testing with REAL API (no mocking)...');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Handle auth
    const authRequired = await page.locator('#auth-email').isVisible().catch(() => false);
    if (authRequired) {
        console.log('Logging in...');
        await page.locator('#auth-email').fill('standardhuman@gmail.com');
        await page.locator('#auth-password').fill('KLRss!650');
        await page.locator('button:has-text("Sign In")').click();
        await page.waitForTimeout(2000);
        await page.waitForSelector('#auth-modal', { state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    await page.waitForTimeout(1000);

    // Track network requests
    const apiCalls = [];
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            apiCalls.push({
                url: request.url(),
                method: request.method()
            });
            console.log('→ API Request:', request.method(), request.url());
        }
    });

    page.on('response', response => {
        if (response.url().includes('/api/')) {
            console.log('← API Response:', response.status(), response.url());
        }
    });

    // Get the search input
    const searchInput = page.locator('#universalSearch');
    await expect(searchInput).toBeVisible();

    console.log('\nTyping in search box...');
    await searchInput.click();
    await searchInput.fill('test');

    // Wait for debounced search
    console.log('Waiting for search API call...');
    await page.waitForTimeout(1000);

    console.log('\nAPI Calls made:', apiCalls.length);
    apiCalls.forEach(call => {
        console.log('  -', call.method, call.url);
    });

    // Check if results appeared
    const resultsDropdown = page.locator('#universalSearchResults');
    const resultsVisible = await resultsDropdown.isVisible().catch(() => false);

    console.log('\nResults dropdown visible:', resultsVisible);

    if (resultsVisible) {
        const resultsText = await resultsDropdown.textContent();
        console.log('Results content:', resultsText);

        const resultItems = page.locator('#universalSearchResults .search-result-item');
        const count = await resultItems.count();
        console.log('Number of results:', count);
    } else {
        // Check display style
        const displayInfo = await page.evaluate(() => {
            const elem = document.getElementById('universalSearchResults');
            if (!elem) return { exists: false };

            const styles = window.getComputedStyle(elem);
            return {
                exists: true,
                display: styles.display,
                innerHTML: elem.innerHTML.substring(0, 200),
                hasContent: elem.innerHTML.length > 0
            };
        });

        console.log('Results element info:', displayInfo);
    }

    // Check for any JavaScript errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('JavaScript Error:', error.message);
    });

    await page.waitForTimeout(1000);

    if (errors.length > 0) {
        console.log('\n❌ JavaScript Errors:', errors);
    }

    // Take screenshot
    await page.screenshot({ path: 'real-search-test.png', fullPage: true });

    console.log('\n✓ Screenshot saved to real-search-test.png');
});

test('real API - check if search endpoint exists', async ({ page }) => {
    console.log('Checking if API endpoint exists...');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Try to call the API directly
    const apiUrl = 'https://sailorskills-billing.vercel.app/api/stripe-customers?search=test';

    console.log('Testing API endpoint:', apiUrl);

    const response = await page.evaluate(async (url) => {
        try {
            const res = await fetch(url);
            return {
                ok: res.ok,
                status: res.status,
                statusText: res.statusText,
                data: await res.text()
            };
        } catch (error) {
            return {
                ok: false,
                error: error.message
            };
        }
    }, apiUrl);

    console.log('API Response:', response);

    if (response.ok) {
        console.log('✓ API endpoint is accessible');
        console.log('Response data:', response.data.substring(0, 200));
    } else {
        console.log('❌ API endpoint returned error:', response.status, response.statusText);
    }
});
