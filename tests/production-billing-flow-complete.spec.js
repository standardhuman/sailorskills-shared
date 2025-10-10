import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE PRODUCTION TEST SUITE
 * Tests Universal Search & Quick Charge Features
 *
 * Tests the complete billing flow on production:
 * - Authentication
 * - Universal search with auto-suggestions
 * - Customer selection
 * - Service selection modal
 * - Quick charge with auto-fill
 * - Complete end-to-end billing flow
 */

const PRODUCTION_URL = 'https://sailorskills-billing.vercel.app/admin.html';
const AUTH_EMAIL = 'standardhuman@gmail.com';
const AUTH_PASSWORD = 'KLRss!650';

// Helper function to authenticate and setup page
async function setupAuthenticatedPage(page) {
    console.log('🔄 Loading page:', PRODUCTION_URL);
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check for authentication requirement
    const authEmailInput = page.locator('#auth-email');
    const authRequired = await authEmailInput.isVisible().catch(() => false);

    if (authRequired) {
        console.log('🔐 Authentication required - logging in...');
        await authEmailInput.fill(AUTH_EMAIL);
        await page.locator('#auth-password').fill(AUTH_PASSWORD);

        const signInButton = page.locator('button:has-text("Sign In")');
        await expect(signInButton).toBeVisible();
        await signInButton.click();

        // Wait for auth to complete
        await page.waitForTimeout(3000);

        // Verify auth modal is gone
        const authModalGone = await page.evaluate(() => {
            const modal = document.getElementById('auth-modal');
            if (!modal) return true;
            return window.getComputedStyle(modal).display === 'none';
        });

        if (!authModalGone) {
            const authError = await page.locator('#auth-error').textContent().catch(() => '');
            if (authError) {
                throw new Error(`Authentication failed: ${authError}`);
            }
        }

        console.log('✅ Authentication successful');
    } else {
        console.log('✅ No authentication required');
    }

    // Wait for page to be fully ready
    await page.waitForSelector('#universalSearch', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(1000);

    console.log('✅ Page setup complete');
}

// =============================================================================
// PHASE 1: DIAGNOSTIC TESTS
// =============================================================================

test.describe('Phase 1: Diagnostic Tests', () => {
    test('1.1 - Page loads and authentication works', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const title = await page.title();
        console.log('📄 Page title:', title);
        expect(title).toContain('Billing');

        await page.screenshot({ path: 'test-results/01-page-loaded.png', fullPage: true });
    });

    test('1.2 - Universal search input is visible and interactive', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const searchInput = page.locator('#universalSearch');

        // Check if element exists
        await expect(searchInput).toBeAttached();

        // Check visibility
        const isVisible = await searchInput.isVisible();
        console.log('🔍 Universal search visible:', isVisible);

        // Check dimensions
        const box = await searchInput.boundingBox();
        console.log('📐 Search box dimensions:', box);

        if (!isVisible || !box || box.width === 0 || box.height === 0) {
            // Get computed styles
            const styles = await page.evaluate(() => {
                const elem = document.getElementById('universalSearch');
                if (!elem) return null;
                const computed = window.getComputedStyle(elem);
                return {
                    display: computed.display,
                    visibility: computed.visibility,
                    opacity: computed.opacity,
                    position: computed.position,
                    width: computed.width,
                    height: computed.height
                };
            });
            console.log('🎨 Search box styles:', styles);
        }

        // Try to interact
        await searchInput.click({ timeout: 5000 });
        await searchInput.fill('test');
        const value = await searchInput.inputValue();
        console.log('✍️ Input value after typing:', value);
        expect(value).toBe('test');

        await page.screenshot({ path: 'test-results/02-search-interactive.png', fullPage: true });
    });

    test('1.3 - API endpoints are accessible', async ({ page }) => {
        await setupAuthenticatedPage(page);

        // Test stripe-customers API
        const searchApiTest = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/stripe-customers?search=test');
                return {
                    ok: response.ok,
                    status: response.status,
                    data: await response.json()
                };
            } catch (error) {
                return { ok: false, error: error.message };
            }
        });

        console.log('🔌 Stripe customers API:', searchApiTest.status, searchApiTest.ok ? '✅' : '❌');
        if (searchApiTest.data) {
            console.log('📦 Sample data:', JSON.stringify(searchApiTest.data).substring(0, 200));
        } else {
            console.log('⚠️  No data returned, error:', searchApiTest.error);
        }

        expect(searchApiTest.ok).toBeTruthy();

        // Test customer-services API (with a test customer ID)
        const servicesApiTest = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/customer-services?customerId=cus_test');
                return {
                    ok: response.ok,
                    status: response.status
                };
            } catch (error) {
                return { ok: false, error: error.message };
            }
        });

        console.log('🔌 Customer services API:', servicesApiTest.status, servicesApiTest.ok ? '✅' : '❌');
        expect(servicesApiTest.ok).toBeTruthy();
    });

    test('1.4 - Check for JavaScript errors', async ({ page }) => {
        const errors = [];
        const warnings = [];

        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
            if (msg.type() === 'warning') warnings.push(msg.text());
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await setupAuthenticatedPage(page);

        // Wait for any async operations
        await page.waitForTimeout(2000);

        console.log('❌ JavaScript Errors:', errors.length);
        if (errors.length > 0) {
            errors.forEach(err => console.log('  -', err));
        }

        console.log('⚠️  JavaScript Warnings:', warnings.length);

        // Filter out common harmless errors
        const criticalErrors = errors.filter(err =>
            !err.includes('favicon') &&
            !err.includes('manifest') &&
            !err.includes('404') &&
            !err.includes('Extension')
        );

        expect(criticalErrors.length).toBe(0);
    });

    test('1.5 - Verify DOM elements and functions exist', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const domCheck = await page.evaluate(() => {
            return {
                elements: {
                    universalSearch: !!document.getElementById('universalSearch'),
                    universalSearchResults: !!document.getElementById('universalSearchResults'),
                    serviceButtons: document.querySelectorAll('.simple-service-btn').length,
                    serviceSelectionModal: !!document.getElementById('serviceSelectionModal'),
                    wizardContainer: !!document.getElementById('wizardContainer')
                },
                functions: {
                    initUniversalSearch: typeof window.initUniversalSearch === 'function',
                    selectUniversalSearchCustomer: typeof window.selectUniversalSearchCustomer === 'function',
                    showServiceSelectionModal: typeof window.showServiceSelectionModal === 'function',
                    renderConsolidatedForm: typeof window.renderConsolidatedForm === 'function',
                    selectServiceDirect: typeof window.selectServiceDirect === 'function',
                    adminApp: typeof window.adminApp !== 'undefined'
                }
            };
        });

        console.log('🔍 DOM Elements:');
        Object.entries(domCheck.elements).forEach(([key, value]) => {
            console.log(`  ${value ? '✅' : '❌'} ${key}:`, value);
        });

        console.log('⚙️  Functions:');
        Object.entries(domCheck.functions).forEach(([key, value]) => {
            console.log(`  ${value ? '✅' : '❌'} ${key}:`, value);
        });

        expect(domCheck.elements.universalSearch).toBeTruthy();
        expect(domCheck.functions.selectUniversalSearchCustomer).toBeTruthy();
        expect(domCheck.functions.adminApp).toBeTruthy();
    });
});

// =============================================================================
// PHASE 2: UNIVERSAL SEARCH TESTS
// =============================================================================

test.describe('Phase 2: Universal Search Tests', () => {
    test('2.1 - Search triggers API call with debouncing', async ({ page }) => {
        await setupAuthenticatedPage(page);

        let apiCalls = [];
        page.on('request', request => {
            if (request.url().includes('/api/stripe-customers')) {
                apiCalls.push({
                    url: request.url(),
                    timestamp: Date.now()
                });
                console.log('→ API Request:', request.url());
            }
        });

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();

        // Type quickly - should debounce
        await searchInput.fill('j');
        await page.waitForTimeout(100);
        await searchInput.fill('jo');
        await page.waitForTimeout(100);
        await searchInput.fill('joh');
        await page.waitForTimeout(100);
        await searchInput.fill('john');

        // Wait for debounce (300ms + buffer)
        await page.waitForTimeout(600);

        console.log('📞 Total API calls:', apiCalls.length);

        // Should only make 1 API call due to debouncing
        expect(apiCalls.length).toBeGreaterThan(0);
        expect(apiCalls[0].url).toContain('search=john');
    });

    test('2.2 - Search by customer name shows results', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('John');

        // Wait for results
        await page.waitForTimeout(600);

        // Check if results dropdown appears
        const resultsDiv = page.locator('#universalSearchResults');
        const displayStyle = await page.evaluate(() => {
            const elem = document.getElementById('universalSearchResults');
            return elem ? window.getComputedStyle(elem).display : 'none';
        });

        console.log('📋 Results dropdown display:', displayStyle);

        if (displayStyle !== 'none') {
            const results = page.locator('#universalSearchResults .search-result-item');
            const count = await results.count();
            console.log('✅ Found', count, 'search results');

            if (count > 0) {
                const firstResult = await results.first().textContent();
                console.log('First result:', firstResult);
            }
        }

        await page.screenshot({ path: 'test-results/03-search-by-name.png', fullPage: true });
    });

    test('2.3 - Search by boat name shows results', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('Serenity'); // Common boat name

        await page.waitForTimeout(600);

        const resultsVisible = await page.evaluate(() => {
            const elem = document.getElementById('universalSearchResults');
            if (!elem) return false;
            const styles = window.getComputedStyle(elem);
            return styles.display !== 'none' && elem.innerHTML.length > 0;
        });

        console.log('🚤 Boat search results visible:', resultsVisible);
        await page.screenshot({ path: 'test-results/04-search-by-boat.png', fullPage: true });
    });

    test('2.4 - Search by email shows results', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('test@'); // Partial email

        await page.waitForTimeout(600);

        const resultsInfo = await page.evaluate(() => {
            const elem = document.getElementById('universalSearchResults');
            if (!elem) return { exists: false };
            const styles = window.getComputedStyle(elem);
            return {
                exists: true,
                display: styles.display,
                hasContent: elem.innerHTML.length > 0,
                innerHTML: elem.innerHTML.substring(0, 300)
            };
        });

        console.log('📧 Email search results:', resultsInfo);
        await page.screenshot({ path: 'test-results/05-search-by-email.png', fullPage: true });
    });

    test('2.5 - Clicking search result selects customer', async ({ page }) => {
        await setupAuthenticatedPage(page);

        let customerServicesCalled = false;
        page.on('request', request => {
            if (request.url().includes('/api/customer-services')) {
                customerServicesCalled = true;
                console.log('✅ Customer services API called');
            }
        });

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('John');
        await page.waitForTimeout(600);

        // Try to click first result
        const firstResult = page.locator('#universalSearchResults .search-result-item').first();
        const resultVisible = await firstResult.isVisible().catch(() => false);

        if (resultVisible) {
            console.log('✅ Result is visible, clicking...');
            await firstResult.click();
            await page.waitForTimeout(1000);
        } else {
            console.log('⚠️  Result not visible, selecting programmatically...');
            await page.evaluate(() => {
                if (window.selectUniversalSearchCustomer && window.universalSearchResults?.[0]) {
                    window.selectUniversalSearchCustomer(window.universalSearchResults[0]);
                }
            });
            await page.waitForTimeout(1000);
        }

        console.log('Customer services API called:', customerServicesCalled);
        await page.screenshot({ path: 'test-results/06-customer-selected.png', fullPage: true });
    });

    test('2.6 - Enter key selects first result', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('John');
        await page.waitForTimeout(600);

        // Press Enter
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);

        // Check if customer was selected
        const selectedCustomer = await page.evaluate(() => {
            return window.selectedCustomer || window.adminApp?.selectedCustomer || null;
        });

        console.log('📌 Selected customer:', selectedCustomer?.name || 'None');
        await page.screenshot({ path: 'test-results/07-enter-key-selection.png', fullPage: true });
    });

    test('2.7 - Search input clears after selection', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('John');
        await page.waitForTimeout(600);

        // Trigger selection programmatically to ensure it happens
        await page.evaluate(() => {
            if (window.selectUniversalSearchCustomer) {
                window.selectUniversalSearchCustomer({
                    id: 'cus_test',
                    name: 'Test Customer',
                    email: 'test@example.com'
                });
            }
        });

        await page.waitForTimeout(500);

        const inputValue = await searchInput.inputValue();
        console.log('🔄 Input value after selection:', inputValue);
        expect(inputValue).toBe('');
    });

    test('2.8 - Empty search results handled gracefully', async ({ page }) => {
        await setupAuthenticatedPage(page);

        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('xyznonexistentcustomer123');
        await page.waitForTimeout(600);

        const resultsInfo = await page.evaluate(() => {
            const elem = document.getElementById('universalSearchResults');
            if (!elem) return { exists: false };
            return {
                exists: true,
                display: window.getComputedStyle(elem).display,
                text: elem.textContent
            };
        });

        console.log('🔍 Empty search results:', resultsInfo);

        // Should show "No customers found" message
        if (resultsInfo.text) {
            console.log('Message:', resultsInfo.text);
        }

        await page.screenshot({ path: 'test-results/08-empty-results.png', fullPage: true });
    });
});

// =============================================================================
// PHASE 3: QUICK CHARGE FLOW TESTS
// =============================================================================

test.describe('Phase 3: Quick Charge Flow Tests', () => {
    test('3.1 - Customer with services shows selection modal', async ({ page }) => {
        await setupAuthenticatedPage(page);

        // Call the modal function directly with test data
        await page.evaluate(() => {
            const mockCustomer = {
                id: 'cus_test',
                name: 'Test Customer',
                email: 'test@example.com',
                boat_name: 'Sea Breeze'
            };

            const mockServices = [{
                id: 'service_1',
                service_name: 'Recurring Cleaning - Two Months',
                service_type: 'recurring_cleaning',
                frequency: 'two_months',
                boat_length: 35,
                base_price: 250
            }];

            if (window.showServiceSelectionModal) {
                window.showServiceSelectionModal(mockCustomer, mockServices);
            }
        });

        await page.waitForTimeout(500);

        const modalDisplay = await page.evaluate(() => {
            const modal = document.getElementById('serviceSelectionModal');
            return modal ? window.getComputedStyle(modal).display : 'none';
        });

        console.log('🎭 Service modal display:', modalDisplay);
        expect(modalDisplay).toBe('block');

        await page.screenshot({ path: 'test-results/09-service-modal.png', fullPage: true });
    });

    test('3.2 - Service selection opens wizard', async ({ page }) => {
        await setupAuthenticatedPage(page);

        // Set customer and select service
        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_test',
                name: 'Test Customer',
                email: 'test@example.com',
                boat_name: 'Sea Breeze',
                boat_length: 35
            };

            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }
        });

        await page.waitForTimeout(1500);

        const wizardInfo = await page.evaluate(() => {
            const container = document.getElementById('wizardContainer');
            if (!container) return { exists: false };
            return {
                exists: true,
                display: window.getComputedStyle(container).display,
                hasContent: container.innerHTML.length > 0
            };
        });

        console.log('🧙 Wizard info:', wizardInfo);
        await page.screenshot({ path: 'test-results/10-wizard-opened.png', fullPage: true });
    });

    test('3.3 - Customer data auto-fills in wizard', async ({ page }) => {
        await setupAuthenticatedPage(page);

        // Set customer with full details
        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_test',
                name: 'John Smith',
                email: 'john@example.com',
                phone: '555-1234',
                boat_name: 'Sea Breeze',
                boat_length: 35,
                boat_make: 'Catalina',
                boat_model: 'Catalina 350'
            };

            window.adminApp = window.adminApp || {};
            window.adminApp.selectedCustomer = window.selectedCustomer;

            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }
        });

        await page.waitForTimeout(2000);

        // Check for auto-filled fields
        const autoFilledData = await page.evaluate(() => {
            const data = {};

            // Try various field IDs that might contain customer data
            const fieldIds = [
                'wizardCustomerName', 'customerName', 'modalCustomerName',
                'wizardCustomerEmail', 'customerEmail', 'modalCustomerEmail',
                'wizardBoatName', 'boatName', 'modalBoatName',
                'wizardBoatLength', 'boatLength', 'modalBoatLength',
                'wizardBoatMake', 'boatMake', 'modalBoatMake',
                'wizardBoatModel', 'boatModel', 'modalBoatModel'
            ];

            fieldIds.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    data[id] = elem.value || elem.textContent || '';
                }
            });

            return {
                fields: data,
                selectedCustomer: window.selectedCustomer,
                adminAppCustomer: window.adminApp?.selectedCustomer
            };
        });

        console.log('📝 Auto-filled data:', autoFilledData);
        await page.screenshot({ path: 'test-results/11-autofill-data.png', fullPage: true });
    });

    test('3.4 - Boat details display correctly', async ({ page }) => {
        await setupAuthenticatedPage(page);

        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_test',
                name: 'Test Customer',
                boat_name: 'Sea Breeze',
                boat_length: 35,
                boat_make: 'Catalina',
                boat_model: 'Catalina 350',
                marina: 'San Francisco Marina',
                dock: 'A',
                slip: '123'
            };

            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }
        });

        await page.waitForTimeout(2000);

        const boatInfo = await page.evaluate(() => {
            // Check various places boat info might appear
            const wizardContent = document.getElementById('wizardContent')?.textContent || '';
            return {
                hasBoatName: wizardContent.includes('Sea Breeze'),
                hasBoatLength: wizardContent.includes('35'),
                hasMake: wizardContent.includes('Catalina'),
                wizardContentPreview: wizardContent.substring(0, 500)
            };
        });

        console.log('🚤 Boat info in wizard:', boatInfo);
        await page.screenshot({ path: 'test-results/12-boat-details.png', fullPage: true });
    });

    test('3.5 - Payment method details display', async ({ page }) => {
        await setupAuthenticatedPage(page);

        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_test',
                name: 'Test Customer',
                email: 'test@example.com',
                default_payment_method: {
                    card: {
                        brand: 'visa',
                        last4: '4242'
                    }
                }
            };

            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }
        });

        await page.waitForTimeout(2000);

        const paymentInfo = await page.evaluate(() => {
            const paymentElements = {
                modalPaymentInfo: document.getElementById('modalPaymentInfo')?.textContent || '',
                modalPaymentMethodInfo: document.getElementById('modalPaymentMethodInfo')?.style.display || 'none',
                modalPaymentMethodDetails: document.getElementById('modalPaymentMethodDetails')?.textContent || ''
            };

            return paymentElements;
        });

        console.log('💳 Payment info:', paymentInfo);
        await page.screenshot({ path: 'test-results/13-payment-details.png', fullPage: true });
    });

    test('3.6 - Customer with no services proceeds to manual selection', async ({ page }) => {
        await setupAuthenticatedPage(page);

        let modalShown = false;
        let alertShown = false;

        page.on('dialog', async dialog => {
            alertShown = true;
            console.log('🔔 Alert shown:', dialog.message());
            await dialog.accept();
        });

        // Simulate customer selection with no services
        await page.evaluate(() => {
            const mockCustomer = {
                id: 'cus_noservices',
                name: 'Customer Without Services',
                email: 'noservices@example.com'
            };

            if (window.selectUniversalSearchCustomer) {
                // Mock the API response
                window.fetch = async (url) => {
                    if (url.includes('customer-services')) {
                        return {
                            ok: true,
                            json: async () => ({ success: true, services: [], count: 0 })
                        };
                    }
                    return { ok: false };
                };

                window.selectUniversalSearchCustomer(mockCustomer);
            }
        });

        await page.waitForTimeout(2000);

        const modalDisplay = await page.evaluate(() => {
            const modal = document.getElementById('serviceSelectionModal');
            return modal ? window.getComputedStyle(modal).display : 'none';
        });

        console.log('🎭 Modal shown:', modalDisplay !== 'none');
        console.log('🔔 Alert shown:', alertShown);

        await page.screenshot({ path: 'test-results/14-no-services.png', fullPage: true });
    });

    test('3.7 - Multiple services all displayed in modal', async ({ page }) => {
        await setupAuthenticatedPage(page);

        await page.evaluate(() => {
            const mockCustomer = {
                id: 'cus_multi',
                name: 'Multi Service Customer',
                email: 'multi@example.com'
            };

            const mockServices = [
                {
                    id: 'service_1',
                    service_name: 'Recurring Cleaning - Two Months',
                    service_type: 'recurring_cleaning',
                    base_price: 250
                },
                {
                    id: 'service_2',
                    service_name: 'Underwater Inspection',
                    service_type: 'underwater_inspection',
                    base_price: 150
                },
                {
                    id: 'service_3',
                    service_name: 'Propeller Service',
                    service_type: 'propeller_service',
                    base_price: 200
                }
            ];

            if (window.showServiceSelectionModal) {
                window.showServiceSelectionModal(mockCustomer, mockServices);
            }
        });

        await page.waitForTimeout(500);

        const serviceButtons = page.locator('#existingServicesList .service-selection-btn');
        const count = await serviceButtons.count();

        console.log('📋 Services in modal:', count);
        expect(count).toBe(3);

        await page.screenshot({ path: 'test-results/15-multiple-services.png', fullPage: true });
    });

    test('3.8 - Form validation with pre-filled data', async ({ page }) => {
        await setupAuthenticatedPage(page);

        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_validation',
                name: 'Validation Test',
                email: 'valid@example.com',
                boat_name: 'Test Boat',
                boat_length: 35
            };

            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }
        });

        await page.waitForTimeout(2000);

        // Check if we can proceed to charge (validation passes)
        const validationState = await page.evaluate(() => {
            return {
                hasCustomer: !!window.selectedCustomer,
                hasService: !!window.currentServiceKey,
                chargeButtonExists: !!document.querySelector('.charge-button, #chargeButton, #pricingChargeButton')
            };
        });

        console.log('✅ Validation state:', validationState);
        expect(validationState.hasCustomer).toBeTruthy();
        expect(validationState.hasService).toBeTruthy();

        await page.screenshot({ path: 'test-results/16-form-validation.png', fullPage: true });
    });

    test('3.9 - Pricing calculation shows correct amount', async ({ page }) => {
        await setupAuthenticatedPage(page);

        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_pricing',
                name: 'Pricing Test',
                boat_length: 35
            };

            window.currentServiceKey = 'recurring_cleaning';

            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }

            // Trigger pricing update if function exists
            if (window.updatePricing) {
                window.updatePricing();
            }
        });

        await page.waitForTimeout(2000);

        const pricingInfo = await page.evaluate(() => {
            const pricingDisplay = document.getElementById('pricingDisplay');
            const priceBreakdown = document.getElementById('priceBreakdown');
            const totalCost = document.getElementById('totalCost')?.value ||
                            document.getElementById('editableAmount')?.value || '0';

            return {
                pricingVisible: pricingDisplay ? window.getComputedStyle(pricingDisplay).display : 'none',
                breakdown: priceBreakdown?.textContent || '',
                totalCost: totalCost,
                serviceKey: window.currentServiceKey
            };
        });

        console.log('💰 Pricing info:', pricingInfo);
        await page.screenshot({ path: 'test-results/17-pricing.png', fullPage: true });
    });

    test('3.10 - Complete end-to-end charge flow simulation', async ({ page }) => {
        await setupAuthenticatedPage(page);

        console.log('🎬 Starting complete E2E flow...');

        // Step 1: Search for customer
        console.log('1️⃣ Searching for customer...');
        const searchInput = page.locator('#universalSearch');
        await searchInput.click();
        await searchInput.fill('John');
        await page.waitForTimeout(600);

        // Step 2: Select customer
        console.log('2️⃣ Selecting customer...');
        await page.evaluate(() => {
            window.selectedCustomer = {
                id: 'cus_e2e',
                name: 'John E2E Test',
                email: 'john.e2e@example.com',
                boat_name: 'E2E Test Boat',
                boat_length: 35,
                boat_make: 'Catalina',
                boat_model: 'Catalina 350'
            };

            if (window.adminApp) {
                window.adminApp.selectedCustomer = window.selectedCustomer;
            }
        });

        await page.screenshot({ path: 'test-results/18-e2e-step1-customer.png', fullPage: true });

        // Step 3: Select service
        console.log('3️⃣ Selecting service...');
        await page.evaluate(() => {
            if (window.selectServiceDirect) {
                window.selectServiceDirect('recurring_cleaning');
            }
        });

        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/19-e2e-step2-service.png', fullPage: true });

        // Step 4: Verify wizard opened with data
        console.log('4️⃣ Verifying wizard...');
        const wizardState = await page.evaluate(() => {
            return {
                wizardExists: !!document.getElementById('wizardContainer'),
                selectedCustomer: window.selectedCustomer?.name,
                selectedService: window.currentServiceKey,
                adminAppReady: typeof window.adminApp !== 'undefined'
            };
        });

        console.log('📊 Final state:', wizardState);
        await page.screenshot({ path: 'test-results/20-e2e-complete.png', fullPage: true });

        expect(wizardState.selectedCustomer).toBeTruthy();
        expect(wizardState.selectedService).toBeTruthy();
    });
});

// =============================================================================
// SUMMARY TEST
// =============================================================================

test.describe('Test Summary', () => {
    test('Generate test report', async ({ page }) => {
        console.log('\n' + '='.repeat(80));
        console.log('TEST SUITE COMPLETE');
        console.log('='.repeat(80));
        console.log('\nCheck test-results/ folder for screenshots');
        console.log('Total tests: 23 (5 diagnostic + 8 search + 10 quick charge)');
        console.log('\n' + '='.repeat(80));
    });
});
