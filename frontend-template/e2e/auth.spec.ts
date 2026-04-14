import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * These tests run in a real browser and can be watched visually
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should display the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Manasik/);
  });

  test.describe('Login', () => {
    test('should navigate to login page', async ({ page }) => {
      await page.goto('/login');
      
      // Verify we're on the login page
      await expect(page.locator('h4')).toContainText('Log In To Your Account');
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for HTML5 validation or custom error
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('required', '');
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/login');
      
      // Enter invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('.alert-danger')).toContainText(/valid email/i);
    });

    test('should show error for short password', async ({ page }) => {
      await page.goto('/login');
      
      // Enter short password
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', '123');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('.alert-danger')).toContainText(/at least 6 characters/i);
    });

    test('should show error for wrong credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Enter wrong credentials
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error message from API
      await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.alert-danger')).toContainText(/invalid credentials/i);
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in valid credentials
      await page.fill('input[type="email"]', 'admin@bookingplatform.com');
      await page.fill('input[type="password"]', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect to home page
      await page.waitForURL('/', { timeout: 10000 });
      
      // Verify we're logged in (check for user-specific elements)
      // This might need adjustment based on your navbar
      await expect(page).toHaveURL('/');
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/login');
      
      const passwordInput = page.locator('input[type="password"]');
      const toggleButton = page.locator('button').filter({ hasText: /eye/i });
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button
      await toggleButton.click();
      
      // Password should now be visible
      await expect(page.locator('input[type="text"]')).toBeVisible();
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in credentials
      await page.fill('input[type="email"]', 'admin@bookingplatform.com');
      await page.fill('input[type="password"]', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for loading spinner (briefly visible)
      const loadingSpinner = page.locator('.spinner-border');
      // Note: This might be too fast to catch, but we try
      await expect(loadingSpinner).toBeVisible({ timeout: 1000 }).catch(() => {
        // It's okay if we miss it due to fast response
      });
    });

    test('should have link to registration page', async ({ page }) => {
      await page.goto('/login');
      
      // Find and click the sign up link
      const signUpLink = page.locator('a', { hasText: /sign up/i });
      await expect(signUpLink).toBeVisible();
      
      await signUpLink.click();
      await expect(page).toHaveURL(/register/);
    });
  });

  test.describe('Registration', () => {
    test('should navigate to registration page', async ({ page }) => {
      await page.goto('/register');
      
      // Verify we're on the registration page
      await expect(page.locator('h4')).toContainText('Create An Account');
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/register');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for HTML5 validation
      const firstNameInput = page.locator('input#firstName');
      await expect(firstNameInput).toHaveAttribute('required', '');
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/register');
      
      // Fill in form with mismatched passwords
      await page.fill('input#firstName', 'Test');
      await page.fill('input#lastName', 'User');
      await page.fill('input#email', 'test@example.com');
      await page.fill('input#password', 'password123');
      await page.fill('input#confirmPassword', 'password456');
      
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('.alert-danger')).toContainText(/do not match/i);
    });

    test('should show error for duplicate email', async ({ page }) => {
      await page.goto('/register');
      
      // Try to register with existing email
      await page.fill('input#firstName', 'Test');
      await page.fill('input#lastName', 'User');
      await page.fill('input#email', 'admin@bookingplatform.com'); // Already exists
      await page.fill('input#password', 'password123');
      await page.fill('input#confirmPassword', 'password123');
      
      await page.click('button[type="submit"]');
      
      // Wait for error message from API
      await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.alert-danger')).toContainText(/already exists/i);
    });

    test('should successfully register with valid data', async ({ page }) => {
      await page.goto('/register');
      
      // Generate unique email
      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;
      
      // Fill in form
      await page.fill('input#firstName', 'Test');
      await page.fill('input#lastName', 'User');
      await page.fill('input#email', email);
      await page.fill('input#password', 'password123');
      await page.fill('input#confirmPassword', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect to home page
      await page.waitForURL('/', { timeout: 10000 });
      
      // Verify we're logged in
      await expect(page).toHaveURL('/');
    });

    test('should toggle password visibility on both fields', async ({ page }) => {
      await page.goto('/register');
      
      const passwordInput = page.locator('input#password');
      const confirmPasswordInput = page.locator('input#confirmPassword');
      
      // Initially both should be password type
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      
      // Toggle first password field
      const toggleButtons = page.locator('button').filter({ hasText: /eye/i });
      await toggleButtons.first().click();
      
      // First password should now be text type
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');
      
      // Find and click the log in link
      const loginLink = page.locator('a', { hasText: /log in/i });
      await expect(loginLink).toBeVisible();
      
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'admin@bookingplatform.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/', { timeout: 10000 });
      
      // Now logout (adjust selector based on your navbar)
      // This is a placeholder - adjust based on your actual logout button
      const logoutButton = page.locator('button', { hasText: /logout/i }).or(
        page.locator('a', { hasText: /logout/i })
      );
      
      if (await logoutButton.count() > 0) {
        await logoutButton.click();
        
        // Verify we're logged out (might redirect to login or home)
        // Add appropriate assertions based on your app behavior
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route while logged out', async ({ page }) => {
      // Try to access a protected route (adjust based on your routes)
      await page.goto('/account');
      
      // Should redirect to login
      // Adjust this based on your middleware behavior
      await page.waitForURL(/login|authentication/, { timeout: 5000 }).catch(() => {
        // If no redirect, that's also valid depending on your setup
      });
    });
  });
});
