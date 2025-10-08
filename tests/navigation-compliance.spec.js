import { test, expect } from '@playwright/test';

const services = [
  { name: 'Portal', url: 'http://localhost:5173', page: 'portal' },
  { name: 'Admin', url: 'http://localhost:8001/dashboard.html', page: 'admin' },
  { name: 'Inventory', url: 'http://localhost:5176/inventory.html', page: 'inventory', requiresAuth: true },
  { name: 'Schedule', url: 'http://localhost:3000/schedule.html', page: 'schedule' },
  { name: 'Estimator', url: 'http://localhost:5175/estimator.html', page: 'estimator' }
];

// Helper function to set up authentication for services that require it
async function setupAuth(page, service) {
  if (service.requiresAuth) {
    await page.goto(service.url);
    await page.evaluate(() => {
      const session = {
        authenticated: true,
        expires: new Date().getTime() + (8 * 60 * 60 * 1000) // 8 hours (matches auth.js)
      };
      localStorage.setItem('inventory_auth_session', JSON.stringify(session));
      sessionStorage.setItem('inventory_auth_session', JSON.stringify(session));
    });
  }
}

test.describe('Shared Navigation Compliance Tests', () => {
  for (const service of services) {
    test(`${service.name} should have global navigation header`, async ({ page }) => {
      await setupAuth(page, service);
      await page.goto(service.url);

      // Wait for navigation to be injected
      await page.waitForSelector('.global-header', { timeout: 5000 });

      // Check for global header
      const header = await page.locator('.global-header');
      await expect(header).toBeVisible();
    });

    test(`${service.name} should have SAILOR SKILLS logo link`, async ({ page }) => {
      await setupAuth(page, service);
      await page.goto(service.url);
      await page.waitForSelector('.global-header', { timeout: 5000 });

      const logo = await page.locator('.nav-logo');
      await expect(logo).toBeVisible();
      await expect(logo).toHaveText('SAILOR SKILLS');
      await expect(logo).toHaveAttribute('href', 'https://www.sailorskills.com/');
    });

    test(`${service.name} should have all navigation links`, async ({ page }) => {
      await setupAuth(page, service);
      await page.goto(service.url);
      await page.waitForSelector('.global-header', { timeout: 5000 });

      const nav = await page.locator('.global-nav');
      await expect(nav).toBeVisible();

      // Check for all required nav items
      const expectedLinks = ['Admin', 'Portal', 'Billing', 'Inventory', 'Schedule', 'Estimator'];

      for (const linkText of expectedLinks) {
        const link = nav.locator(`a:has-text("${linkText}")`);
        await expect(link).toBeVisible();
      }
    });

    test(`${service.name} should have active state on current page`, async ({ page }) => {
      await setupAuth(page, service);
      await page.goto(service.url);
      await page.waitForSelector('.global-header', { timeout: 5000 });

      // Find the active link
      const activeLink = await page.locator('.global-nav a.active');
      await expect(activeLink).toBeVisible();

      // Verify it corresponds to the current service (case-insensitive match)
      const activeLinkText = await activeLink.textContent();
      expect(activeLinkText.toLowerCase()).toContain(service.page.toLowerCase());
    });

    test(`${service.name} should have logout button`, async ({ page }) => {
      await setupAuth(page, service);
      await page.goto(service.url);
      await page.waitForSelector('.global-header', { timeout: 5000 });

      const logoutBtn = await page.locator('.logout-btn');
      await expect(logoutBtn).toBeVisible();
      await expect(logoutBtn).toContainText('Logout');
    });

    test(`${service.name} should have breadcrumb navigation`, async ({ page }) => {
      await setupAuth(page, service);
      await page.goto(service.url);
      await page.waitForSelector('.global-header', { timeout: 5000 });

      const breadcrumb = await page.locator('.breadcrumb');
      await expect(breadcrumb).toBeVisible();

      // Check for Home breadcrumb
      const homeLink = breadcrumb.locator('a:has-text("Home")');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute('href', 'https://www.sailorskills.com/');
    });

    test(`${service.name} should use shared design tokens`, async ({ page }) => {
      await setupAuth(page, service);
      await page.goto(service.url);
      await page.waitForSelector('.global-header', { timeout: 5000 });

      // Check that CSS custom properties are loaded
      const header = await page.locator('.global-header');
      const bgColor = await header.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Should have a computed background color (not 'rgba(0, 0, 0, 0)' or transparent)
      expect(bgColor).toBeTruthy();
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  }

  test('All services navigation links should be consistent', async ({ page }) => {
    const navLinks = {};

    for (const service of services) {
      await page.goto(service.url);
      await page.waitForSelector('.global-header', { timeout: 5000 });

      const links = await page.locator('.global-nav a').allTextContents();
      navLinks[service.name] = links.sort();
    }

    // All services should have the same nav links
    const firstServiceLinks = navLinks[services[0].name];
    for (const [serviceName, links] of Object.entries(navLinks)) {
      expect(links).toEqual(firstServiceLinks);
    }
  });
});
