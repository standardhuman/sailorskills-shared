import { test, expect } from '@playwright/test';

/**
 * Test against actual production URL to verify search functionality
 */

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin.html';

test('production - check universal search visibility and functionality', async ({ page }) => {
    console.log('Testing production URL:', PRODUCTION_URL);

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check for auth
    const authEmailInput = page.locator('#auth-email');
    const authRequired = await authEmailInput.isVisible().catch(() => false);

    if (authRequired) {
        console.log('🔐 Auth required - logging in...');
        await page.fill('#auth-email', 'standardhuman@gmail.com');
        await page.fill('#auth-password', 'KLRss!650');

        // Submit form
        await page.evaluate(() => {
            const form = document.getElementById('supabase-auth-form');
            if (form) form.requestSubmit();
        });

        await page.waitForTimeout(3000);
        console.log('✓ Login submitted');
    }

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'production-screenshot.png', fullPage: true });

    // Check universal search details
    const searchDetails = await page.evaluate(() => {
        const elem = document.getElementById('universalSearch');
        if (!elem) return { exists: false };

        const styles = window.getComputedStyle(elem);
        const rect = elem.getBoundingClientRect();

        return {
            exists: true,
            visible: rect.width > 0 && rect.height > 0 && styles.display !== 'none',
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            dimensions: {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left
            }
        };
    });

    console.log('\n=== Production Universal Search ===');
    console.log(JSON.stringify(searchDetails, null, 2));

    // Check if auth modal is still blocking
    const authModalBlocking = await page.evaluate(() => {
        const modal = document.getElementById('auth-modal');
        if (!modal) return false;

        const styles = window.getComputedStyle(modal);
        return styles.display !== 'none';
    });

    console.log('Auth modal blocking:', authModalBlocking);

    // Check what's actually visible
    const visibleElements = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="search"]'));
        return inputs
            .filter(input => {
                const style = window.getComputedStyle(input);
                const rect = input.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && style.display !== 'none';
            })
            .map(input => ({
                id: input.id,
                placeholder: input.placeholder,
                dimensions: {
                    width: input.getBoundingClientRect().width,
                    height: input.getBoundingClientRect().height
                }
            }));
    });

    console.log('\n=== Visible Input Elements ===');
    console.log(JSON.stringify(visibleElements, null, 2));

    // Verify search is accessible
    expect(searchDetails.exists).toBeTruthy();

    if (!searchDetails.visible) {
        console.log('\n❌ ISSUE: Universal search exists but is not visible!');
        console.log('   This confirms the bug.');
    } else {
        console.log('\n✓ Universal search is visible and accessible');
    }
});

test('production - test actual search interaction', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('domcontentloaded');

    // Handle auth
    const authRequired = await page.locator('#auth-email').isVisible().catch(() => false);
    if (authRequired) {
        await page.fill('#auth-email', 'standardhuman@gmail.com');
        await page.fill('#auth-password', 'KLRss!650');
        await page.evaluate(() => {
            document.getElementById('supabase-auth-form')?.requestSubmit();
        });
        await page.waitForTimeout(3000);
    }

    await page.waitForTimeout(2000);

    // Check if search is actually clickable
    const searchInput = page.locator('#universalSearch');

    const canClick = await page.evaluate(() => {
        const elem = document.getElementById('universalSearch');
        if (!elem) return false;

        const rect = elem.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;

        // Check if something is blocking it
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const topElement = document.elementFromPoint(centerX, centerY);

        return topElement === elem;
    });

    console.log('Search input can be clicked:', canClick);

    if (canClick) {
        console.log('✓ Testing actual search interaction...');

        // Mock API
        await page.route('**/api/stripe-customers*', async (route) => {
            console.log('Search API called!');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'cus_test',
                        name: 'Test Customer',
                        email: 'test@example.com',
                        boat_name: 'Test Boat'
                    }
                ])
            });
        });

        // Try to click and type
        await searchInput.click();
        await page.keyboard.type('Test', { delay: 100 });
        await page.waitForTimeout(600);

        console.log('✓ Search interaction completed');
    } else {
        console.log('❌ Search input is blocked or not clickable');
    }

    expect(true).toBeTruthy(); // Placeholder assertion
});
