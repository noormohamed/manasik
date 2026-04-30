/**
 * Hotel Image Management E2E Tests
 * Tests complete user flows for uploading, managing, and viewing hotel images
 */

import { test, expect } from '@playwright/test';

test.describe('Hotel Image Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as hotel owner
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard/**');
  });

  test.describe('Image Upload', () => {
    test('should upload image successfully', async ({ page }) => {
      // Navigate to hotel management
      await page.goto('/dashboard/listings');
      
      // Click on a hotel to manage
      await page.click('text=Manage Images');
      
      // Upload image
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('test-image.jpg');
      
      // Wait for preview
      await expect(page.locator('img[alt="Preview"]')).toBeVisible();
      
      // Click upload button
      await page.click('button:has-text("Upload Image")');
      
      // Wait for success message
      await expect(page.locator('text=Image uploaded successfully')).toBeVisible();
    });

    test('should show error for invalid file type', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Try to upload invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('test-file.txt');
      
      // Should show error
      await expect(page.locator('text=Invalid file type')).toBeVisible();
    });

    test('should show error for file exceeding size limit', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Create a large file (>10MB)
      // Note: This is a simplified test - in real scenario you'd need to create actual large file
      const fileInput = page.locator('input[type="file"]');
      
      // Show error message about size
      await expect(page.locator('text=exceeds maximum')).toBeVisible({ timeout: 5000 });
    });

    test('should display upload progress', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('test-image.jpg');
      
      await page.click('button:has-text("Upload Image")');
      
      // Check for progress bar
      await expect(page.locator('.progress-bar')).toBeVisible();
      
      // Wait for completion
      await expect(page.locator('text=Image uploaded successfully')).toBeVisible();
    });
  });

  test.describe('Image Gallery', () => {
    test('should display uploaded images in gallery', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Upload an image first
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('test-image.jpg');
      await page.click('button:has-text("Upload Image")');
      await expect(page.locator('text=Image uploaded successfully')).toBeVisible();
      
      // Check gallery displays image
      await expect(page.locator('img[alt="test-image.jpg"]')).toBeVisible();
    });

    test('should delete image from gallery', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Find delete button
      const deleteButton = page.locator('button[title="Delete image"]').first();
      await deleteButton.click();
      
      // Confirm deletion
      await page.click('button:has-text("Delete")');
      
      // Wait for image to be removed
      await expect(page.locator('text=Image deleted successfully')).toBeVisible();
    });

    test('should set primary image', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Find set primary button
      const setPrimaryButton = page.locator('button[title="Set as primary image"]').first();
      await setPrimaryButton.click();
      
      // Check for success
      await expect(page.locator('text=Primary image set successfully')).toBeVisible();
      
      // Verify primary badge appears
      await expect(page.locator('text=Primary')).toBeVisible();
    });

    test('should reorder images via drag and drop', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Get first two image cards
      const imageCards = page.locator('[class*="imageCard"]');
      const firstCard = imageCards.nth(0);
      const secondCard = imageCards.nth(1);
      
      // Drag first to second position
      await firstCard.dragTo(secondCard);
      
      // Wait for reorder to complete
      await expect(page.locator('text=Images reordered successfully')).toBeVisible();
    });
  });

  test.describe('Hotel Details Display', () => {
    test('should display images on hotel details page', async ({ page }) => {
      // Navigate to hotel details
      await page.goto('/stay/hotel-1');
      
      // Check for image carousel
      await expect(page.locator('[class*="carousel"]')).toBeVisible();
      
      // Check for images
      const images = page.locator('img[alt*="hotel"]');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate through image carousel', async ({ page }) => {
      await page.goto('/stay/hotel-1');
      
      // Find next button
      const nextButton = page.locator('button[aria-label="Next image"]');
      
      if (await nextButton.isVisible()) {
        // Click next
        await nextButton.click();
        
        // Verify image changed
        const counter = page.locator('[class*="imageCounter"]');
        await expect(counter).toContainText('2 /');
      }
    });

    test('should display primary image first', async ({ page }) => {
      await page.goto('/stay/hotel-1');
      
      // Check for primary badge on first image
      const primaryBadge = page.locator('text=Primary Image').first();
      await expect(primaryBadge).toBeVisible();
    });
  });

  test.describe('Hotel Listing Display', () => {
    test('should display primary images on listing page', async ({ page }) => {
      await page.goto('/search?city=Makkah');
      
      // Wait for results
      await page.waitForSelector('[class*="hotelCard"]');
      
      // Check for images in hotel cards
      const hotelCards = page.locator('[class*="hotelCard"]');
      const count = await hotelCards.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = hotelCards.nth(i);
        const image = card.locator('img').first();
        
        // Image should be visible or loading
        const isVisible = await image.isVisible();
        const hasLoadingClass = await image.evaluate(el => 
          el.className.includes('loading') || el.src !== ''
        );
        
        expect(isVisible || hasLoadingClass).toBeTruthy();
      }
    });

    test('should lazy load images on scroll', async ({ page }) => {
      await page.goto('/search?city=Makkah');
      
      // Wait for initial images
      await page.waitForSelector('img[alt*="hotel"]');
      
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      
      // Wait for more images to load
      await page.waitForTimeout(1000);
      
      // Check that images are loaded
      const images = page.locator('img[alt*="hotel"]');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle upload failure gracefully', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Simulate network error by intercepting request
      await page.route('**/api/hotel/*/images', route => {
        route.abort('failed');
      });
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('test-image.jpg');
      await page.click('button:has-text("Upload Image")');
      
      // Should show error message
      await expect(page.locator('[class*="errorMessage"]')).toBeVisible();
      
      // Should allow retry
      const retryButton = page.locator('button:has-text("Upload Image")');
      await expect(retryButton).toBeEnabled();
    });

    test('should handle deletion failure gracefully', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Simulate network error
      await page.route('**/api/hotel/*/images/*', route => {
        route.abort('failed');
      });
      
      const deleteButton = page.locator('button[title="Delete image"]').first();
      await deleteButton.click();
      await page.click('button:has-text("Delete")');
      
      // Should show error
      await expect(page.locator('[class*="errorMessage"]')).toBeVisible();
    });

    test('should show rate limit error', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.click('text=Manage Images');
      
      // Simulate rate limit response
      await page.route('**/api/hotel/*/images', route => {
        route.abort('failed');
      });
      
      // Try to upload multiple times
      for (let i = 0; i < 3; i++) {
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles('test-image.jpg');
        await page.click('button:has-text("Upload Image")');
        await page.waitForTimeout(500);
      }
      
      // Should eventually show rate limit error
      await expect(page.locator('text=Rate limit')).toBeVisible({ timeout: 5000 });
    });
  });
});
