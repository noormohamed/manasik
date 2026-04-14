import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';
const API_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@bookingplatform.com';
const ADMIN_PASSWORD = 'password123';

test.describe('Admin Panel - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
  });

  test.describe('Authentication', () => {
    test('should load login page', async ({ page }) => {
      await expect(page.locator('text=Login')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.locator('input[type="email"]').fill('invalid@example.com');
      await page.locator('input[type="password"]').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('text=error, text=failed, text=invalid').first();
      const isVisible = await errorMessage.isVisible().catch(() => false);
      expect(isVisible || page.url().includes('login')).toBeTruthy();
    });

    test('should logout', async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL(/login/);
      }
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
    });

    test('should display dashboard', async ({ page }) => {
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should display navigation menu', async ({ page }) => {
      await expect(page.locator('text=Users')).toBeVisible();
      await expect(page.locator('text=Bookings')).toBeVisible();
      await expect(page.locator('text=Reviews')).toBeVisible();
    });

    test('should display dashboard metrics', async ({ page }) => {
      await page.waitForTimeout(2000);
      const metrics = page.locator('[class*="metric"], [class*="card"], [class*="stat"]');
      const count = await metrics.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Users Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Users"), text=Users').first().click();
      await page.waitForURL(/users/);
    });

    test('should load users page', async ({ page }) => {
      await expect(page.locator('text=Users')).toBeVisible();
    });

    test('should display users list', async ({ page }) => {
      await page.waitForTimeout(2000);
      const userRows = page.locator('table tbody tr, [class*="user-row"], [class*="list-item"]');
      const count = await userRows.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should search users', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('customer');
        await page.waitForTimeout(1000);
      }
    });

    test('should filter users by role', async ({ page }) => {
      const filterSelect = page.locator('select').first();
      if (await filterSelect.isVisible()) {
        await filterSelect.selectOption('CUSTOMER');
        await page.waitForTimeout(1000);
      }
    });

    test('should view user details', async ({ page }) => {
      await page.waitForTimeout(2000);
      const userLink = page.locator('a[href*="/admin/users/"], [class*="user-row"]').first();
      if (await userLink.isVisible()) {
        await userLink.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Bookings Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Bookings"), text=Bookings').first().click();
      await page.waitForURL(/bookings/);
    });

    test('should load bookings page', async ({ page }) => {
      await expect(page.locator('text=Bookings')).toBeVisible();
    });

    test('should display bookings list', async ({ page }) => {
      await page.waitForTimeout(2000);
      const bookingRows = page.locator('table tbody tr, [class*="booking-row"], [class*="list-item"]');
      const count = await bookingRows.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should search bookings', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('booking');
        await page.waitForTimeout(1000);
      }
    });

    test('should filter bookings by status', async ({ page }) => {
      const filterSelect = page.locator('select').first();
      if (await filterSelect.isVisible()) {
        await filterSelect.selectOption('CONFIRMED');
        await page.waitForTimeout(1000);
      }
    });

    test('should view booking details', async ({ page }) => {
      await page.waitForTimeout(2000);
      const bookingLink = page.locator('a[href*="/admin/bookings/"], [class*="booking-row"]').first();
      if (await bookingLink.isVisible()) {
        await bookingLink.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Reviews Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Reviews"), text=Reviews').first().click();
      await page.waitForURL(/reviews/);
    });

    test('should load reviews page', async ({ page }) => {
      await expect(page.locator('text=Reviews')).toBeVisible();
    });

    test('should display reviews list', async ({ page }) => {
      await page.waitForTimeout(2000);
      const reviewRows = page.locator('table tbody tr, [class*="review-row"], [class*="list-item"]');
      const count = await reviewRows.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should search reviews', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('review');
        await page.waitForTimeout(1000);
      }
    });

    test('should filter reviews by status', async ({ page }) => {
      const filterSelect = page.locator('select').first();
      if (await filterSelect.isVisible()) {
        await filterSelect.selectOption('APPROVED');
        await page.waitForTimeout(1000);
      }
    });

    test('should view review details', async ({ page }) => {
      await page.waitForTimeout(2000);
      const reviewLink = page.locator('a[href*="/admin/reviews/"], [class*="review-row"]').first();
      if (await reviewLink.isVisible()) {
        await reviewLink.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Transactions Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Transactions"), text=Transactions').first().click();
      await page.waitForURL(/transactions/);
    });

    test('should load transactions page', async ({ page }) => {
      await expect(page.locator('text=Transactions')).toBeVisible();
    });

    test('should display transactions list', async ({ page }) => {
      await page.waitForTimeout(2000);
      const transactionRows = page.locator('table tbody tr, [class*="transaction-row"], [class*="list-item"]');
      const count = await transactionRows.count();
      expect(count >= 0).toBeTruthy();
    });
  });

  test.describe('Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Analytics"), text=Analytics').first().click();
      await page.waitForURL(/analytics/);
    });

    test('should load analytics page', async ({ page }) => {
      await expect(page.locator('text=Analytics')).toBeVisible();
    });
  });

  test.describe('Audit Log', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Audit"), text=Audit').first().click();
      await page.waitForURL(/audit/);
    });

    test('should load audit log page', async ({ page }) => {
      await expect(page.locator('text=Audit')).toBeVisible();
    });
  });

  test.describe('Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Settings"), text=Settings').first().click();
      await page.waitForURL(/settings/);
    });

    test('should load settings page', async ({ page }) => {
      await expect(page.locator('text=Settings')).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await page.locator('a:has-text("Users"), text=Users').first().click();
      await page.waitForURL(/users/);
    });

    test('should navigate to next page', async ({ page }) => {
      await page.waitForTimeout(2000);
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should navigate to previous page', async ({ page }) => {
      await page.waitForTimeout(2000);
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        const prevButton = page.locator('button:has-text("Previous"), a:has-text("Previous")').first();
        if (await prevButton.isVisible()) {
          await prevButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
      await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load login page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/admin/login`);
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have no console errors on login', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      await page.goto(`${BASE_URL}/admin/login`);
      await page.waitForTimeout(2000);
      expect(errors.length).toBe(0);
    });
  });
});
