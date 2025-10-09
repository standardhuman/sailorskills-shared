import { test, expect } from '@playwright/test';

const BILLING_URL = process.env.TEST_URL || 'https://sailorskills-billing-c20mwqydc-brians-projects-bc2d3592.vercel.app/admin.html';

test('diagnostic - check what is on the page', async ({ page }) => {
    console.log('Loading page:', BILLING_URL);

    // Go to page
    await page.goto(BILLING_URL);

    // Wait a bit for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: 'diagnostic-screenshot.png', fullPage: true });

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check if there's an auth modal
    const authModal = await page.locator('.auth-modal').count();
    console.log('Auth modal count:', authModal);

    // Check for universal search
    const universalSearch = await page.locator('#universalSearch').count();
    console.log('Universal search count:', universalSearch);

    // Check for customerSearch (old selector)
    const customerSearch = await page.locator('#customerSearch').count();
    console.log('Customer search (old) count:', customerSearch);

    // Get all input IDs on the page
    const inputIds = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[id]'));
        return inputs.map(input => input.id);
    });
    console.log('All input IDs on page:', inputIds);

    // Check if admin app exists
    const adminAppExists = await page.evaluate(() => {
        return typeof window.adminApp !== 'undefined';
    });
    console.log('Admin app exists:', adminAppExists);

    // Check console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    console.log('Console errors:', errors);

    // Just verify page loaded
    expect(title).toBeTruthy();
});
