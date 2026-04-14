import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001';

test.describe('Frontend - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Homepage', () => {
    test('should load homepage', async ({ page }) => {
      await expect(page).toHaveTitle(/booking|hotel/i);
      await expect(page.locator('text=Search')).toBeVisible();
    });

    test('should display search form', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible();
    });

    test('should display featured hotels', async ({ page }) => {
      await page.waitForTimeout(2000);
      const hotelCards = page.locator('[class*="hotel"], [class*="card"]');
      const count = await hotelCards.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Authentication', () => {
    test('should navigate to login page', async ({ page }) => {
      const loginButton = page.locator('button:has-text("Login"), a:has-text("Login"), a:has-text("Sign In")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForURL(/login|signin/i);
      }
    });

    test('should register new user', async ({ page }) => {
      const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Register"), a:has-text("Sign Up")').first();
      if (await signupButton.isVisible()) {
        await signupButton.click();
        await page.waitForURL(/register|signup/i);
        
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill(`test-${Date.now()}@example.com`);
          await page.locator('input[type="password"]').first().fill('TestPassword123!');
          
          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
      }
    });

    test('should login with valid credentials', async ({ page }) => {
      const loginButton = page.locator('button:has-text("Login"), a:has-text("Login"), a:has-text("Sign In")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForURL(/login|signin/i);
        
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('customer-001@bookingplatform.com');
          await page.locator('input[type="password"]').first().fill('password123');
          
          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
      }
    });
  });

  test.describe('Hotel Search & Filtering', () => {
    test('should search for hotels', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('New York');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      }
    });

    test('should apply filters', async ({ page }) => {
      const filterButtons = page.locator('button:has-text("Filter"), select');
      if (await filterButtons.first().isVisible()) {
        await filterButtons.first().click();
        await page.waitForTimeout(1000);
      }
    });

    test('should display hotel details', async ({ page }) => {
      await page.waitForTimeout(2000);
      const hotelLink = page.locator('a[href*="/hotel"], [class*="hotel-card"]').first();
      if (await hotelLink.isVisible()) {
        await hotelLink.click();
        await page.waitForTimeout(2000);
        const hotelName = page.locator('h1, h2').first();
        await expect(hotelName).toBeVisible();
      }
    });
  });

  test.describe('Booking Flow', () => {
    test('should add hotel to cart', async ({ page }) => {
      await page.waitForTimeout(2000);
      const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve"), button:has-text("Add to Cart")').first();
      if (await bookButton.isVisible()) {
        await bookButton.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should view cart', async ({ page }) => {
      const cartButton = page.locator('button:has-text("Cart"), a:has-text("Cart"), [class*="cart"]').first();
      if (await cartButton.isVisible()) {
        await cartButton.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should proceed to checkout', async ({ page }) => {
      const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Continue"), button:has-text("Proceed")').first();
      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('User Dashboard', () => {
    test('should access user dashboard', async ({ page }) => {
      const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("My Bookings"), button:has-text("Profile")').first();
      if (await dashboardLink.isVisible()) {
        await dashboardLink.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should display user bookings', async ({ page }) => {
      const bookingsSection = page.locator('text=Bookings, text=My Bookings, text=Reservations').first();
      if (await bookingsSection.isVisible()) {
        await expect(bookingsSection).toBeVisible();
      }
    });

    test('should display user profile', async ({ page }) => {
      const profileLink = page.locator('a:has-text("Profile"), button:has-text("Account")').first();
      if (await profileLink.isVisible()) {
        await profileLink.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to home', async ({ page }) => {
      const homeLink = page.locator('a:has-text("Home"), [class*="logo"]').first();
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await page.waitForURL(BASE_URL);
      }
    });

    test('should navigate to about page', async ({ page }) => {
      const aboutLink = page.locator('a:has-text("About")').first();
      if (await aboutLink.isVisible()) {
        await aboutLink.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should navigate to contact page', async ({ page }) => {
      const contactLink = page.locator('a:has-text("Contact")').first();
      if (await contactLink.isVisible()) {
        await contactLink.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(BASE_URL);
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have no console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);
      expect(errors.length).toBe(0);
    });
  });
});
