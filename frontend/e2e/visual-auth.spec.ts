import { test, expect } from '@playwright/test';

/**
 * Visual Authentication Tests
 * Run with: npm run test:e2e:ui
 * These tests are designed to be watched visually
 */

test.describe('Visual Authentication Journey', () => {
  test('Complete Login Journey - Watch Me!', async ({ page }) => {
    // Step 1: Go to home page
    console.log('📍 Step 1: Navigating to home page...');
    await page.goto('/');
    await page.waitForTimeout(1000); // Pause so you can see
    
    // Step 2: Navigate to login
    console.log('📍 Step 2: Going to login page...');
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Step 3: Show the form
    console.log('📍 Step 3: Login form is visible');
    await expect(page.locator('h4')).toContainText('Log In To Your Account');
    await page.waitForTimeout(1000);
    
    // Step 4: Fill in email slowly
    console.log('📍 Step 4: Typing email...');
    await page.fill('input[type="email"]', 'admin@bookingplatform.com', { timeout: 2000 });
    await page.waitForTimeout(500);
    
    // Step 5: Fill in password slowly
    console.log('📍 Step 5: Typing password...');
    await page.fill('input[type="password"]', 'password123', { timeout: 2000 });
    await page.waitForTimeout(500);
    
    // Step 6: Click submit
    console.log('📍 Step 6: Clicking login button...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Step 7: Wait for redirect
    console.log('📍 Step 7: Waiting for redirect...');
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('✅ Login journey complete!');
  });

  test('Complete Registration Journey - Watch Me!', async ({ page }) => {
    // Step 1: Go to registration page
    console.log('📍 Step 1: Navigating to registration page...');
    await page.goto('/register');
    await page.waitForTimeout(1000);
    
    // Step 2: Show the form
    console.log('📍 Step 2: Registration form is visible');
    await expect(page.locator('h4')).toContainText('Create An Account');
    await page.waitForTimeout(1000);
    
    // Step 3: Fill in first name
    console.log('📍 Step 3: Typing first name...');
    await page.fill('input#firstName', 'Visual', { timeout: 1000 });
    await page.waitForTimeout(500);
    
    // Step 4: Fill in last name
    console.log('📍 Step 4: Typing last name...');
    await page.fill('input#lastName', 'Test', { timeout: 1000 });
    await page.waitForTimeout(500);
    
    // Step 5: Fill in email
    console.log('📍 Step 5: Typing email...');
    const timestamp = Date.now();
    await page.fill('input#email', `visual${timestamp}@example.com`, { timeout: 2000 });
    await page.waitForTimeout(500);
    
    // Step 6: Fill in password
    console.log('📍 Step 6: Typing password...');
    await page.fill('input#password', 'password123', { timeout: 1000 });
    await page.waitForTimeout(500);
    
    // Step 7: Fill in confirm password
    console.log('📍 Step 7: Confirming password...');
    await page.fill('input#confirmPassword', 'password123', { timeout: 1000 });
    await page.waitForTimeout(500);
    
    // Step 8: Click submit
    console.log('📍 Step 8: Clicking register button...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Step 9: Wait for redirect
    console.log('📍 Step 9: Waiting for redirect...');
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('✅ Registration journey complete!');
  });

  test('Error Handling - Watch Me!', async ({ page }) => {
    // Step 1: Go to login page
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Step 2: Try invalid email
    console.log('📍 Step 2: Testing invalid email format...');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.waitForTimeout(500);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Step 3: Show error message
    console.log('📍 Step 3: Error message should appear...');
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 2000 });
    await page.waitForTimeout(2000);
    
    // Step 4: Clear and try wrong credentials
    console.log('📍 Step 4: Testing wrong credentials...');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.waitForTimeout(500);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Step 5: Show API error
    console.log('📍 Step 5: API error should appear...');
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
    
    console.log('✅ Error handling test complete!');
  });

  test('Password Toggle - Watch Me!', async ({ page }) => {
    // Step 1: Go to login page
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Step 2: Fill password
    console.log('📍 Step 2: Typing password (hidden)...');
    await page.fill('input[type="password"]', 'password123');
    await page.waitForTimeout(1000);
    
    // Step 3: Click toggle to show
    console.log('📍 Step 3: Clicking eye icon to show password...');
    const toggleButton = page.locator('button').filter({ hasText: /eye/i }).first();
    await toggleButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Click toggle to hide
    console.log('📍 Step 4: Clicking eye icon to hide password...');
    await toggleButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Password toggle test complete!');
  });

  test('Form Validation - Watch Me!', async ({ page }) => {
    // Step 1: Go to registration page
    console.log('📍 Step 1: Navigating to registration page...');
    await page.goto('/register');
    await page.waitForTimeout(1000);
    
    // Step 2: Test password mismatch
    console.log('📍 Step 2: Testing password mismatch...');
    await page.fill('input#firstName', 'Test');
    await page.fill('input#lastName', 'User');
    await page.fill('input#email', 'test@example.com');
    await page.fill('input#password', 'password123');
    await page.waitForTimeout(500);
    
    await page.fill('input#confirmPassword', 'different456');
    await page.waitForTimeout(500);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Step 3: Show error
    console.log('📍 Step 3: Password mismatch error should appear...');
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('.alert-danger')).toContainText(/do not match/i);
    await page.waitForTimeout(2000);
    
    console.log('✅ Form validation test complete!');
  });
});
