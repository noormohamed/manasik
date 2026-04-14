import { test, expect } from '@playwright/test';

/**
 * My Bookings Page E2E Tests
 * Tests the /me/bookings page functionality
 */

// Increase timeout for all tests
test.setTimeout(60000);

test.describe('My Bookings Page', () => {
  
  test.describe('Unauthenticated User', () => {
    test('should show login prompt when not authenticated', async ({ page }) => {
      await page.goto('/me/bookings');
      
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Should show sign in prompt
      await expect(page.locator('h2')).toContainText('Sign in to view your bookings', { timeout: 15000 });
      
      // Should have a sign in button
      const signInButton = page.locator('a', { hasText: /Sign In/i });
      await expect(signInButton).toBeVisible();
      
      // Click should navigate to login (which is /auth in this app)
      await signInButton.click();
      await expect(page).toHaveURL(/auth/);
    });
  });

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      // Login first - the login page is at /auth
      await page.goto('/auth');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for the login form to be visible
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      
      await page.fill('input[type="email"]', 'edward.sanchez@email.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for login to complete - either redirect or error
      await Promise.race([
        page.waitForURL('/', { timeout: 15000 }),
        page.waitForSelector('.alert-danger', { timeout: 15000 })
      ]).catch(() => {});
      
      // If we got an error, the test will fail on the next assertion
    });

    test('should display the My Bookings page', async ({ page }) => {
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Should show page title
      await expect(page.locator('h1')).toContainText('My Bookings', { timeout: 15000 });
      
      // Should show description
      await expect(page.locator('text=View and manage all your hotel reservations')).toBeVisible();
    });

    test('should show filter dropdown', async ({ page }) => {
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for page to load
      await expect(page.locator('h1')).toContainText('My Bookings', { timeout: 15000 });
      
      // Should have status filter dropdown
      const filterSelect = page.locator('select.form-select');
      await expect(filterSelect).toBeVisible();
      
      // Check filter options exist (options are hidden until dropdown is opened)
      await expect(filterSelect.locator('option', { hasText: 'All Bookings' })).toHaveCount(1);
      await expect(filterSelect.locator('option', { hasText: 'Pending' })).toHaveCount(1);
      await expect(filterSelect.locator('option', { hasText: 'Confirmed' })).toHaveCount(1);
    });

    test('should show refresh button', async ({ page }) => {
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for page to load
      await expect(page.locator('h1')).toContainText('My Bookings', { timeout: 15000 });
      
      // Should have refresh button
      const refreshButton = page.locator('button', { hasText: /Refresh/i });
      await expect(refreshButton).toBeVisible();
    });

    test('should display bookings or empty state', async ({ page }) => {
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for loading to complete
      await page.waitForSelector('.spinner-border', { state: 'hidden', timeout: 20000 }).catch(() => {});
      
      // Should show either bookings or empty state
      const hasBookings = await page.locator('.card.shadow-sm').count() > 0;
      const hasEmptyState = await page.locator('text=No bookings yet').isVisible().catch(() => false);
      
      expect(hasBookings || hasEmptyState).toBeTruthy();
    });

    test('should filter bookings by status', async ({ page }) => {
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for page to load
      await expect(page.locator('h1')).toContainText('My Bookings', { timeout: 15000 });
      await page.waitForSelector('.spinner-border', { state: 'hidden', timeout: 20000 }).catch(() => {});
      
      // Select "Confirmed" filter
      const filterSelect = page.locator('select.form-select');
      await filterSelect.selectOption('CONFIRMED');
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Clear filter button should appear
      const clearButton = page.locator('button', { hasText: /Clear Filter/i });
      await expect(clearButton).toBeVisible();
      
      // Click clear filter
      await clearButton.click();
      
      // Filter should be reset
      await expect(filterSelect).toHaveValue('');
    });

    test('should show booking cards with correct information', async ({ page }) => {
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for loading to complete
      await page.waitForSelector('.spinner-border', { state: 'hidden', timeout: 20000 }).catch(() => {});
      
      // Check if there are bookings
      const bookingCards = page.locator('.card.shadow-sm');
      const count = await bookingCards.count();
      
      if (count > 0) {
        // First booking card should have hotel name
        const firstCard = bookingCards.first();
        await expect(firstCard.locator('.card-title')).toBeVisible();
        
        // Should have check-in/check-out labels
        await expect(firstCard.locator('text=Check-in')).toBeVisible();
        await expect(firstCard.locator('text=Check-out')).toBeVisible();
        
        // Should have a status badge
        await expect(firstCard.locator('.badge')).toBeVisible();
        
        // Should have View Hotel button
        await expect(firstCard.locator('a', { hasText: /View Hotel/i })).toBeVisible();
      }
    });

    test('should show summary stats when bookings exist', async ({ page }) => {
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for loading to complete
      await page.waitForSelector('.spinner-border', { state: 'hidden', timeout: 20000 }).catch(() => {});
      
      // Check if there are bookings
      const bookingCards = page.locator('.card.shadow-sm');
      const count = await bookingCards.count();
      
      if (count > 0) {
        // Should show summary stats card
        const statsCard = page.locator('.card.bg-light');
        await expect(statsCard).toBeVisible();
        
        // Should show Total Bookings
        await expect(statsCard.locator('text=Total Bookings')).toBeVisible();
      }
    });
  });

  test.describe('API Integration', () => {
    test('should call the correct API endpoint', async ({ page }) => {
      // Login first - the login page is at /auth
      await page.goto('/auth');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      
      await page.fill('input[type="email"]', 'edward.sanchez@email.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await Promise.race([
        page.waitForURL('/', { timeout: 15000 }),
        page.waitForSelector('.alert-danger', { timeout: 15000 })
      ]).catch(() => {});
      
      // Intercept API calls
      let apiCalled = false;
      await page.route('**/api/users/me/bookings**', async (route) => {
        apiCalled = true;
        await route.continue();
      });
      
      // Navigate to bookings page
      await page.goto('/me/bookings');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for page to load
      await page.waitForSelector('.spinner-border', { state: 'hidden', timeout: 20000 }).catch(() => {});
      
      // Verify API was called
      expect(apiCalled).toBeTruthy();
    });
  });
});
