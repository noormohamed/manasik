/**
 * E2E Tests for Auth Persistence
 * Tests to ensure users don't get randomly logged out during navigation
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const BASE_URL = 'http://localhost:3000';

test.describe('Auth Persistence E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });
  });

  test('should maintain session during navigation', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 5000 });

    // Verify user is logged in
    await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    // Navigate to different pages
    const pages = [
      '/dashboard',
      '/dashboard/listings',
      '/account/profile',
      '/dashboard',
    ];

    for (const url of pages) {
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('networkidle');
      
      // Verify still logged in (user name should be visible)
      await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });
      
      // Verify token still exists
      const hasToken = await page.evaluate(() => {
        return !!localStorage.getItem('accessToken');
      });
      expect(hasToken).toBe(true);
    }
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 5000 });
    await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    // Reload page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be logged in
      await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should maintain session when switching tabs', async ({ browser }) => {
    const context = await browser.newContext();
    
    // Tab 1: Login
    const page1 = await context.newPage();
    await page1.goto(`${BASE_URL}/auth/`);
    await page1.fill('input[type="email"]', 'james.anderson@email.com');
    await page1.fill('input[type="password"]', 'password123');
    await page1.click('button[type="submit"]');
    await page1.waitForURL('**/dashboard**', { timeout: 5000 });
    await expect(page1.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    // Tab 2: Open new tab, should be logged in
    const page2 = await context.newPage();
    await page2.goto(`${BASE_URL}/dashboard`);
    await page2.waitForLoadState('networkidle');
    
    // Should be logged in without needing to login again
    await expect(page2.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    // Navigate in tab 2
    await page2.goto(`${BASE_URL}/dashboard/listings`);
    await page2.waitForLoadState('networkidle');
    await expect(page2.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    // Switch back to tab 1, should still be logged in
    await page1.bringToFront();
    await page1.reload();
    await page1.waitForLoadState('networkidle');
    await expect(page1.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    await context.close();
  });

  test('should handle token refresh automatically', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });

    // Get initial token
    const initialToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(initialToken).toBeTruthy();

    // Simulate token expiry by removing access token (but keep refresh token)
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
    });

    // Make an API call that requires auth (navigate to listings)
    await page.goto(`${BASE_URL}/dashboard/listings`);
    await page.waitForLoadState('networkidle');

    // Wait a bit for token refresh to happen
    await page.waitForTimeout(2000);

    // Should have a new token
    const newToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(newToken).toBeTruthy();
    
    // Should still be logged in
    await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });
  });

  test('should not logout on network errors', async ({ page, context }) => {
    // Login first
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });
    await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    // Simulate network offline
    await context.setOffline(true);

    // Try to navigate (will fail due to offline)
    await page.goto(`${BASE_URL}/dashboard/listings`).catch(() => {});
    
    // Go back online
    await context.setOffline(false);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in (tokens should not have been cleared)
    const hasToken = await page.evaluate(() => !!localStorage.getItem('accessToken'));
    expect(hasToken).toBe(true);
  });

  test('should logout when refresh token is invalid', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });

    // Corrupt both tokens
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'invalid-token');
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
    });

    // Try to navigate (should trigger token refresh, which will fail)
    await page.goto(`${BASE_URL}/dashboard/listings`);
    
    // Should be redirected to login
    await page.waitForURL('**/auth/**', { timeout: 10000 });
    
    // Tokens should be cleared
    const hasToken = await page.evaluate(() => !!localStorage.getItem('accessToken'));
    expect(hasToken).toBe(false);
  });

  test('should sync auth state across multiple rapid navigations', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });

    // Rapidly navigate between pages
    const rapidNavigations = [
      '/dashboard',
      '/dashboard/listings',
      '/account/profile',
      '/dashboard',
      '/dashboard/listings',
    ];

    for (const url of rapidNavigations) {
      await page.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded' });
      // Don't wait for full load, just check token exists
      const hasToken = await page.evaluate(() => !!localStorage.getItem('accessToken'));
      expect(hasToken).toBe(true);
    }

    // Final check - should still be logged in
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });
  });

  test('should maintain session during API calls', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });

    // Navigate to listings (triggers API call)
    await page.goto(`${BASE_URL}/dashboard/listings`);
    await page.waitForLoadState('networkidle');

    // Wait for listings to load
    await page.waitForTimeout(2000);

    // Should still be logged in
    await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });
    
    // Token should still exist
    const hasToken = await page.evaluate(() => !!localStorage.getItem('accessToken'));
    expect(hasToken).toBe(true);
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });
    await expect(page.locator('text=James Anderson')).toBeVisible({ timeout: 5000 });

    // Click user menu
    await page.click('text=James Anderson');
    
    // Click logout
    await page.click('text=Logout');

    // Wait a bit for logout to process
    await page.waitForTimeout(1000);

    // Should be redirected to home
    await page.waitForURL(BASE_URL, { timeout: 5000 });

    // Tokens should be cleared
    const hasToken = await page.evaluate(() => !!localStorage.getItem('accessToken'));
    expect(hasToken).toBe(false);

    // Cookie should be cleared
    const hasCookie = await page.evaluate(() => document.cookie.includes('accessToken='));
    expect(hasCookie).toBe(false);

    // Try to access protected page
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should be redirected to login
    await page.waitForURL('**/auth/**', { timeout: 5000 });
  });

  test('should show auth debug page correctly', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/`);
    await page.fill('input[type="email"]', 'james.anderson@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });

    // Navigate to debug page
    await page.goto(`${BASE_URL}/auth-debug`);
    await page.waitForLoadState('networkidle');

    // Check debug info is displayed
    await expect(page.locator('text=Auth Debug Dashboard')).toBeVisible();
    await expect(page.locator('text=Authenticated: Yes')).toBeVisible();
    await expect(page.locator('text=james.anderson@email.com')).toBeVisible();
    await expect(page.locator('text=Access Token (localStorage): Present')).toBeVisible();
    await expect(page.locator('text=Access Token (cookie): Present')).toBeVisible();
  });
});
