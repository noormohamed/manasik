import { test, expect } from '@playwright/test';

/**
 * Example Test - Simple Demo
 * Run with: npm run test:e2e:headed
 */

test('Simple Login Test - Perfect for First Run', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Verify we're on the right page
  await expect(page.locator('h4')).toContainText('Log In');
  
  // Fill in the form
  await page.fill('input[type="email"]', 'admin@bookingplatform.com');
  await page.fill('input[type="password"]', 'password123');
  
  // Click login
  await page.click('button[type="submit"]');
  
  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 10000 });
  
  // Success!
  console.log('✅ Login successful!');
});
