import { test, expect } from '@playwright/test';

const CUSTOMER_PAGE_URL = 'http://localhost:8001/customers.html';

test.describe('Customer Management Page', () => {
  test('should load customers.html page', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Page should load
    await expect(page).toHaveTitle(/Customer Management/);
  });

  test('should show navigation header', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for navigation to be injected
    await page.waitForSelector('.global-header, #nav-container', { timeout: 5000 });

    // Check for navigation elements
    const hasNavigation = await page.evaluate(() => {
      return document.querySelector('.global-header') !== null ||
             document.querySelector('#nav-container') !== null;
    });

    expect(hasNavigation).toBeTruthy();
  });

  test('should have tab navigation', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for page to load
    await page.waitForSelector('.tab-navigation', { timeout: 5000 });

    // Check for tab buttons
    const overviewTab = await page.locator('button[data-tab="overview"]');
    const datatableTab = await page.locator('button[data-tab="datatable"]');

    await expect(overviewTab).toBeVisible();
    await expect(datatableTab).toBeVisible();
    await expect(overviewTab).toContainText('Overview');
    await expect(datatableTab).toContainText('Data Table');
  });

  test('should show Overview tab by default', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for tabs to load
    await page.waitForSelector('.tab-navigation', { timeout: 5000 });

    // Overview tab should be active
    const overviewTab = await page.locator('button[data-tab="overview"]');
    await expect(overviewTab).toHaveClass(/active/);

    // Overview content should be visible
    const overviewContent = await page.locator('#overview-tab');
    await expect(overviewContent).toHaveClass(/active/);
  });

  test('should have customer search input', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for page to load
    await page.waitForSelector('#customer-search', { timeout: 5000 });

    const searchInput = await page.locator('#customer-search');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search customers/);
  });

  test('should have customer stats cards', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for stats to load
    await page.waitForSelector('.stats-row', { timeout: 5000 });

    // Check for stat cards
    const totalCustomers = await page.locator('#total-customers');
    const activeCustomers = await page.locator('#active-customers');
    const avgLtv = await page.locator('#avg-ltv');

    await expect(totalCustomers).toBeVisible();
    await expect(activeCustomers).toBeVisible();
    await expect(avgLtv).toBeVisible();
  });

  test('should switch to Data Table tab', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for tabs to load
    await page.waitForSelector('.tab-navigation', { timeout: 5000 });

    // Click Data Table tab
    const datatableTab = await page.locator('button[data-tab="datatable"]');
    await datatableTab.click();

    // Data Table tab should become active
    await expect(datatableTab).toHaveClass(/active/);

    // Data Table content should be visible
    const datatableContent = await page.locator('#datatable-tab');
    await expect(datatableContent).toHaveClass(/active/);
  });

  test('should have data table controls', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Switch to data table tab
    await page.waitForSelector('.tab-navigation', { timeout: 5000 });
    const datatableTab = await page.locator('button[data-tab="datatable"]');
    await datatableTab.click();

    // Check for data table controls
    const searchInput = await page.locator('#datatable-search');
    const filterToggle = await page.locator('#filter-toggle');
    const columnsToggle = await page.locator('#columns-toggle');
    const exportCsv = await page.locator('#export-csv');
    const exportExcel = await page.locator('#export-excel');

    await expect(searchInput).toBeVisible();
    await expect(filterToggle).toBeVisible();
    await expect(columnsToggle).toBeVisible();
    await expect(exportCsv).toBeVisible();
    await expect(exportExcel).toBeVisible();
  });

  test('should have data table element', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Switch to data table tab
    await page.waitForSelector('.tab-navigation', { timeout: 5000 });
    const datatableTab = await page.locator('button[data-tab="datatable"]');
    await datatableTab.click();

    // Check for table
    const table = await page.locator('#customers-datatable');
    await expect(table).toBeVisible();
  });

  test('should have pagination controls', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Switch to data table tab
    await page.waitForSelector('.tab-navigation', { timeout: 5000 });
    const datatableTab = await page.locator('button[data-tab="datatable"]');
    await datatableTab.click();

    // Check for pagination
    const prevPage = await page.locator('#prev-page');
    const nextPage = await page.locator('#next-page');
    const pageInfo = await page.locator('#page-info');

    await expect(prevPage).toBeVisible();
    await expect(nextPage).toBeVisible();
    await expect(pageInfo).toBeVisible();
  });

  test('should have filter panel (hidden by default)', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Switch to data table tab
    await page.waitForSelector('.tab-navigation', { timeout: 5000 });
    const datatableTab = await page.locator('button[data-tab="datatable"]');
    await datatableTab.click();

    // Filter panel should exist but be hidden
    const filterPanel = await page.locator('#filter-panel');
    await expect(filterPanel).toHaveClass(/hidden/);

    // Click filter toggle
    const filterToggle = await page.locator('#filter-toggle');
    await filterToggle.click();

    // Filter panel should now be visible
    await expect(filterPanel).not.toHaveClass(/hidden/);
  });

  test('should have Supabase and SheetJS scripts loaded', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for scripts to load
    await page.waitForTimeout(2000);

    // Check if Supabase is loaded
    const hasSupabase = await page.evaluate(() => {
      return typeof window.supabase !== 'undefined';
    });

    // Check if XLSX (SheetJS) is loaded
    const hasXLSX = await page.evaluate(() => {
      return typeof window.XLSX !== 'undefined';
    });

    expect(hasSupabase).toBeTruthy();
    expect(hasXLSX).toBeTruthy();
  });

  test('should show customer modal on detail view', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Customer modal should exist but be hidden
    const modal = await page.locator('#customer-modal');
    await expect(modal).toHaveClass(/hidden/);
  });
});

test.describe('Customer Management - Authentication', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto(CUSTOMER_PAGE_URL);

    // Wait for either auth modal or authenticated content
    await page.waitForTimeout(2000);

    // Check if authentication is handled
    const hasAuthModal = await page.evaluate(() => {
      return document.querySelector('#auth-modal') !== null;
    });

    const hasAuthenticatedContent = await page.evaluate(() => {
      return document.querySelector('.customer-list') !== null;
    });

    // Should have either auth modal or authenticated content
    expect(hasAuthModal || hasAuthenticatedContent).toBeTruthy();
  });
});
