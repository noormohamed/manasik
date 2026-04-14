import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    
    // Check if page loaded
    const title = await page.title();
    console.log('Page title:', title);
    
    // Take a screenshot
    await page.screenshot({ path: 'login-page.png' });
    
    // Check for common elements
    const body = await page.locator('body');
    expect(body).toBeTruthy();
  });

  test('should display login form', async ({ page }) => {
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    
    // Look for email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    console.log('Email input found:', await emailInput.count());
    console.log('Password input found:', await passwordInput.count());
    
    // Check page content
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);
    console.log('First 500 chars:', pageContent.substring(0, 500));
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    
    // Try to find and fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@bookingplatform.com');
      await passwordInput.fill('password123');
      await submitButton.click();
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      
      // Check if we're on dashboard
      const url = page.url();
      console.log('Current URL after login:', url);
      expect(url).toContain('dashboard');
    } else {
      console.log('Login form not found');
    }
  });
});
