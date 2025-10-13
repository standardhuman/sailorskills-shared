import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin.html';
const AUTH_EMAIL = 'standardhuman@gmail.com';
const AUTH_PASSWORD = 'KLRss!650';

test('Debug API response for search', async ({ page }) => {
    // Capture all API responses
    const apiResponses = [];

    page.on('response', async response => {
        if (response.url().includes('/api/stripe-customers')) {
            const status = response.status();
            let body = null;
            try {
                body = await response.json();
            } catch (e) {
                body = await response.text();
            }

            apiResponses.push({
                url: response.url(),
                status: status,
                body: body
            });

            console.log('\n=== API RESPONSE ===');
            console.log('URL:', response.url());
            console.log('Status:', status);
            console.log('Body:', JSON.stringify(body, null, 2).substring(0, 500));
            console.log('===================\n');
        }
    });

    // Load page
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Auth
    const authRequired = await page.locator('#auth-email').isVisible().catch(() => false);
    if (authRequired) {
        await page.locator('#auth-email').fill(AUTH_EMAIL);
        await page.locator('#auth-password').fill(AUTH_PASSWORD);
        await page.locator('button:has-text("Sign In")').click();
        await page.waitForTimeout(3000);
    }

    // Wait for search box
    await page.waitForSelector('#universalSearch');

    // Test multiple searches
    const searches = ['Test', 'John', 'recurring', 'test@'];

    for (const searchTerm of searches) {
        console.log(`\n\n🔍 Searching for: "${searchTerm}"`);

        const searchInput = page.locator('#universalSearch');
        await searchInput.clear();
        await searchInput.fill(searchTerm);

        // Wait for debounce and response
        await page.waitForTimeout(800);

        // Check what's displayed
        const resultsInfo = await page.evaluate(() => {
            const elem = document.getElementById('universalSearchResults');
            if (!elem) return { exists: false };
            return {
                exists: true,
                display: window.getComputedStyle(elem).display,
                innerHTML: elem.innerHTML,
                textContent: elem.textContent.trim()
            };
        });

        console.log('Results display:', resultsInfo.display);
        console.log('Results text:', resultsInfo.textContent);

        await page.screenshot({ path: `test-results/debug-search-${searchTerm}.png` });
    }

    console.log('\n\n=== SUMMARY ===');
    console.log('Total API calls:', apiResponses.length);
    apiResponses.forEach((resp, i) => {
        console.log(`\nCall ${i + 1}:`);
        console.log('  URL:', resp.url);
        console.log('  Status:', resp.status);
        console.log('  Results:', Array.isArray(resp.body) ? `${resp.body.length} customers` : 'Error/Empty');
    });
});
