import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';
const ADMIN_EMAIL = 'admin@bookingplatform.com';
const ADMIN_PASSWORD = 'password123';

test.describe('Reviews Page - Error Detection', () => {
  test('should catch reviews fetch error', async ({ page }) => {
    // Intercept API calls to see what's happening
    const apiErrors: string[] = [];
    const apiResponses: any[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('/admin/reviews')) {
        const status = response.status();
        const body = await response.json().catch(() => null);
        
        console.log(`API Response: ${response.url()}`);
        console.log(`Status: ${status}`);
        console.log(`Body:`, JSON.stringify(body, null, 2));
        
        apiResponses.push({ status, body, url: response.url() });
        
        if (status !== 200) {
          apiErrors.push(`${response.url()} returned ${status}`);
        }
      }
    });

    // Login
    await page.goto(`${BASE_URL}/admin/login`);
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(`${BASE_URL}/admin/dashboard`);

    // Navigate to reviews
    await page.locator('a', { hasText: 'Reviews' }).first().click();
    await page.waitForURL(/reviews/);

    // Wait for page to load and check for errors
    await page.waitForTimeout(3000);

    // Check for error message
    const errorMessage = page.locator('[class*="error"], text=Failed, text=error').first();
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);

    console.log('\n=== Test Results ===');
    console.log(`Error visible: ${isErrorVisible}`);
    console.log(`API responses captured: ${apiResponses.length}`);
    console.log(`API errors: ${apiErrors.length}`);

    if (apiResponses.length > 0) {
      console.log('\nAPI Response Details:');
      apiResponses.forEach((resp, i) => {
        console.log(`\nResponse ${i + 1}:`);
        console.log(`  URL: ${resp.url}`);
        console.log(`  Status: ${resp.status}`);
        console.log(`  Body keys: ${resp.body ? Object.keys(resp.body).join(', ') : 'null'}`);
        if (resp.body?.data) {
          console.log(`  Data keys: ${Object.keys(resp.body.data).join(', ')}`);
        }
      });
    }

    // Assert that we should NOT have an error
    if (isErrorVisible) {
      const errorText = await errorMessage.textContent();
      console.log(`\n❌ ERROR FOUND: ${errorText}`);
      expect(isErrorVisible).toBe(false);
    } else {
      console.log('\n✅ No error message visible');
    }

    // Check if data is displayed
    const dataTable = page.locator('table tbody tr, [class*="list-item"]').first();
    const hasData = await dataTable.isVisible().catch(() => false);
    
    console.log(`Data displayed: ${hasData}`);
    
    if (!hasData && !isErrorVisible) {
      console.log('⚠️  WARNING: No data and no error - page may not have loaded properly');
    }
  });

  test('should validate API response structure', async ({ page }) => {
    let capturedResponse: any = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/reviews') && response.status() === 200) {
        try {
          capturedResponse = await response.json();
        } catch (e) {
          console.log('Failed to parse response:', e);
        }
      }
    });

    // Login
    await page.goto(`${BASE_URL}/admin/login`);
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(`${BASE_URL}/admin/dashboard`);

    // Navigate to reviews
    await page.locator('a', { hasText: 'Reviews' }).first().click();
    await page.waitForURL(/reviews/);
    await page.waitForTimeout(2000);

    console.log('\n=== API Response Structure ===');
    console.log(JSON.stringify(capturedResponse, null, 2));

    // Validate response structure
    if (capturedResponse) {
      expect(capturedResponse).toHaveProperty('data');
      expect(capturedResponse.data).toHaveProperty('success');
      expect(capturedResponse.data).toHaveProperty('data');
      expect(capturedResponse.data).toHaveProperty('pagination');
      
      console.log('✅ Response structure is correct');
    } else {
      console.log('❌ No response captured');
    }
  });

  test('should display reviews data correctly', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/admin/login`);
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(`${BASE_URL}/admin/dashboard`);

    // Navigate to reviews
    await page.locator('a', { hasText: 'Reviews' }).first().click();
    await page.waitForURL(/reviews/);
    await page.waitForTimeout(2000);

    // Check for error
    const errorElement = page.locator('[class*="error"]').first();
    const hasError = await errorElement.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorElement.textContent();
      console.log(`❌ Error found: ${errorText}`);
      expect(hasError).toBe(false);
    }

    // Check for data
    const rows = page.locator('table tbody tr, [class*="list-item"]');
    const rowCount = await rows.count();

    console.log(`\nReviews displayed: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);
  });
});
