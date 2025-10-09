import { test, expect } from '@playwright/test';

const BILLING_URL = process.env.TEST_URL || 'https://sailorskills-billing-c20mwqydc-brians-projects-bc2d3592.vercel.app/admin.html';

test('debug - check why universal search is hidden', async ({ page }) => {
    await page.goto(BILLING_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check for auth modal (check for auth-email input visibility)
    const authEmailInput = page.locator('#auth-email');
    const authRequired = await authEmailInput.isVisible().catch(() => false);

    if (authRequired) {
        console.log('🔐 Authentication required - logging in...');
        await page.fill('#auth-email', 'standardhuman@gmail.com');
        await page.fill('#auth-password', 'KLRss!650');

        // Submit the auth form using JavaScript since button might not be visible
        await page.evaluate(() => {
            const form = document.getElementById('supabase-auth-form');
            if (form) {
                form.requestSubmit();
            }
        });

        await page.waitForTimeout(3000);

        // Wait for auth modal to close
        await page.waitForSelector('#auth-modal', { state: 'detached', timeout: 10000 }).catch(async () => {
            console.log('⚠️  Auth modal still visible, checking auth state...');
            const authStatus = await page.evaluate(() => {
                return {
                    modalExists: !!document.getElementById('auth-modal'),
                    supabaseAuthExists: !!window.supabaseAuth,
                    isAuthenticated: window.supabaseAuth?.isAuthenticated()
                };
            });
            console.log('Auth status:', authStatus);
        });

        console.log('✓ Logged in');
    } else {
        console.log('✓ No auth required');
    }

    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'debug-visibility.png', fullPage: true });

    // Check universal search visibility
    const searchDetails = await page.evaluate(() => {
        const elem = document.getElementById('universalSearch');
        if (!elem) return { exists: false };

        const styles = window.getComputedStyle(elem);
        const rect = elem.getBoundingClientRect();
        const parent = elem.parentElement;
        const parentStyles = parent ? window.getComputedStyle(parent) : null;

        return {
            exists: true,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            position: styles.position,
            zIndex: styles.zIndex,
            width: styles.width,
            height: styles.height,
            rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom,
                right: rect.right
            },
            offsetParent: elem.offsetParent ? elem.offsetParent.tagName : null,
            parentDisplay: parentStyles?.display,
            parentVisibility: parentStyles?.visibility,
            parentOpacity: parentStyles?.opacity
        };
    });

    console.log('\n=== Universal Search Element Details ===');
    console.log(JSON.stringify(searchDetails, null, 2));

    // Check if there's an overlaying element
    const topElement = await page.evaluate(() => {
        const search = document.getElementById('universalSearch');
        if (!search) return null;

        const rect = search.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const topElem = document.elementFromPoint(centerX, centerY);

        return {
            tagName: topElem?.tagName,
            id: topElem?.id,
            className: topElem?.className,
            isSearchInput: topElem === search
        };
    });

    console.log('\n=== Element at Search Box Position ===');
    console.log(JSON.stringify(topElement, null, 2));

    // Check for any overlay modals or elements
    const overlays = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('.modal, [role="dialog"]'));
        return modals.map(modal => ({
            id: modal.id,
            className: modal.className,
            display: window.getComputedStyle(modal).display,
            zIndex: window.getComputedStyle(modal).zIndex
        })).filter(m => m.display !== 'none');
    });

    console.log('\n=== Visible Modals/Overlays ===');
    console.log(JSON.stringify(overlays, null, 2));

    // Check what IS visible on the page
    const visibleInputs = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]'));
        return inputs
            .filter(input => {
                const style = window.getComputedStyle(input);
                const rect = input.getBoundingClientRect();
                return style.display !== 'none' &&
                       style.visibility !== 'hidden' &&
                       parseFloat(style.opacity) > 0 &&
                       rect.width > 0 &&
                       rect.height > 0;
            })
            .map(input => ({
                id: input.id,
                type: input.type,
                placeholder: input.placeholder,
                name: input.name
            }));
    });

    console.log('\n=== Currently Visible Text Inputs ===');
    console.log(JSON.stringify(visibleInputs, null, 2));

    expect(searchDetails.exists).toBeTruthy();
});
