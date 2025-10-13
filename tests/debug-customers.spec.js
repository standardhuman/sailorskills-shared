import { test, expect } from '@playwright/test';

test('Debug customer page - capture console and network', async ({ page }) => {
  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    console.log(`[${type.toUpperCase()}] ${text}`);
  });

  // Capture network errors
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()
    });
    console.log(`❌ FAILED REQUEST: ${request.url()}`);
    console.log(`   Reason: ${request.failure()?.errorText}`);
  });

  // Capture successful loads for key files
  page.on('response', response => {
    const url = response.url();
    if (url.includes('customers.js') || url.includes('components.js') || url.includes('supabase-auth.js')) {
      console.log(`✅ Loaded: ${url.split('/').pop()} [${response.status()}]`);
    }
  });

  console.log('\n🔍 Loading customer page...\n');

  // Navigate to the page
  await page.goto('https://sailorskills-admin.vercel.app/customers.html');

  // Wait a bit for modules to load
  await page.waitForTimeout(3000);

  console.log('\n📊 Checking page state...\n');

  // Check if modules loaded
  const moduleCheck = await page.evaluate(() => {
    return {
      showCustomerDetailExists: typeof window.showCustomerDetail === 'function',
      sortDataExists: typeof window.sortData === 'function',
      supabaseExists: typeof window.supabase !== 'undefined',
      closeCustomerModalExists: typeof window.closeCustomerModal === 'function'
    };
  });

  console.log('Module Status:', moduleCheck);

  // Check DOM elements
  const elementsCheck = await page.evaluate(() => {
    return {
      customerList: document.getElementById('customer-list')?.innerHTML || 'NOT FOUND',
      totalCustomers: document.getElementById('total-customers')?.textContent || 'NOT FOUND',
      activeCustomers: document.getElementById('active-customers')?.textContent || 'NOT FOUND',
      avgLtv: document.getElementById('avg-ltv')?.textContent || 'NOT FOUND',
      hasNavigation: !!document.querySelector('.global-nav'),
      hasLogoutBtn: !!document.querySelector('.logout-btn')
    };
  });

  console.log('DOM Elements:', elementsCheck);

  // Try to manually trigger the auth event
  console.log('\n🎯 Manually triggering admin-authenticated event...\n');

  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent('admin-authenticated', {
      detail: { user: { email: 'test@example.com' } }
    }));
  });

  // Wait for potential data loading
  await page.waitForTimeout(2000);

  // Check if customers loaded
  const afterTrigger = await page.evaluate(() => {
    return {
      customerList: document.getElementById('customer-list')?.innerHTML || 'NOT FOUND',
      totalCustomers: document.getElementById('total-customers')?.textContent || 'NOT FOUND'
    };
  });

  console.log('\nAfter manual trigger:', afterTrigger);

  // Check for any JavaScript errors
  const errors = consoleMessages.filter(msg => msg.type === 'error');
  console.log('\n🚨 JavaScript Errors:', errors.length);
  errors.forEach(err => {
    console.log(`   - ${err.text}`);
  });

  // Check for warnings
  const warnings = consoleMessages.filter(msg => msg.type === 'warning');
  console.log('\n⚠️  Warnings:', warnings.length);
  warnings.forEach(warn => {
    console.log(`   - ${warn.text}`);
  });

  // Summary
  console.log('\n📋 SUMMARY:');
  console.log(`   Total console messages: ${consoleMessages.length}`);
  console.log(`   Failed requests: ${failedRequests.length}`);
  console.log(`   Modules loaded: ${Object.values(moduleCheck).filter(v => v).length}/${Object.keys(moduleCheck).length}`);
  console.log(`   Navigation present: ${elementsCheck.hasNavigation}`);
  console.log(`   Total customers shown: ${elementsCheck.totalCustomers}`);

  // Keep browser open for 5 seconds so you can inspect
  await page.waitForTimeout(5000);
});
