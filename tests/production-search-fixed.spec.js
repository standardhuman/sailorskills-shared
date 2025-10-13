import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin.html';

test('production - proper auth and search test', async ({ page }) => {
    console.log('Testing:', PRODUCTION_URL);

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check for auth
    const authEmailInput = page.locator('#auth-email');
    const authRequired = await authEmailInput.isVisible().catch(() => false);

    if (authRequired) {
        console.log('🔐 Auth required - logging in...');

        // Fill credentials
        await authEmailInput.fill('standardhuman@gmail.com');
        await page.locator('#auth-password').fill('KLRss!650');

        // Take screenshot before clicking
        await page.screenshot({ path: 'before-signin.png' });

        // Click the Sign In button by its text
        const signInButton = page.locator('button:has-text("Sign In")');
        await expect(signInButton).toBeVisible();

        console.log('Clicking Sign In button...');
        await signInButton.click();

        // Wait for navigation/auth to complete
        await page.waitForTimeout(3000);

        // Take screenshot after clicking
        await page.screenshot({ path: 'after-signin.png' });

        // Check if auth modal is gone
        const authModalGone = await page.evaluate(() => {
            const modal = document.getElementById('auth-modal');
            if (!modal) return true;
            const styles = window.getComputedStyle(modal);
            return styles.display === 'none';
        });

        console.log('Auth modal dismissed:', authModalGone);

        if (!authModalGone) {
            // Check for auth errors
            const authError = await page.locator('#auth-error').textContent().catch(() => '');
            if (authError) {
                console.log('❌ Auth error:', authError);
            }
        }
    }

    // Now check universal search
    await page.waitForTimeout(1000);

    const searchDetails = await page.evaluate(() => {
        const elem = document.getElementById('universalSearch');
        if (!elem) return { exists: false };

        const styles = window.getComputedStyle(elem);
        const rect = elem.getBoundingClientRect();

        return {
            exists: true,
            visible: rect.width > 0 && rect.height > 0,
            display: styles.display,
            dimensions: { width: rect.width, height: rect.height }
        };
    });

    console.log('\n=== Universal Search After Auth ===');
    console.log(JSON.stringify(searchDetails, null, 2));

    if (searchDetails.visible) {
        console.log('✓ Universal search is now visible!');

        // Test search interaction
        let searchApiCalled = false;

        await page.route('**/api/stripe-customers*', async (route) => {
            searchApiCalled = true;
            console.log('✓ Search API called!');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_test',
                        name: 'John Test',
                        email: 'test@example.com',
                        boat_name: 'Sea Breeze'
                    }
                ])
            });
        });

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('Test');

        await page.waitForTimeout(600); // Wait for debounced search

        console.log('Search API was called:', searchApiCalled);

        expect(searchApiCalled).toBeTruthy();
    } else {
        console.log('❌ Universal search still not visible');
    }

    expect(searchDetails.exists).toBeTruthy();
});
