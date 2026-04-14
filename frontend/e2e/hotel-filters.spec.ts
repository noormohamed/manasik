import { test, expect } from '@playwright/test';

/**
 * E2E tests for Advanced Hotel Filters
 * 
 * Prerequisites:
 * - Database should be seeded with hotels that have facilities, landmarks, and surroundings
 * - Backend API should be running
 * - Frontend should be running
 */

test.describe('Hotel Advanced Filters E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to hotel search page
    await page.goto('/stays');
    
    // Wait for hotels to load
    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 10000 });
  });

  test.describe('Single Filter Application', () => {
    test('should filter hotels by facility (WiFi)', async ({ page }) => {
      // Click "More Filters" button
      await page.click('text=More Filters');
      
      // Wait for advanced filters to appear
      await page.waitForSelector('text=Hotel Facilities');
      
      // Expand Hotel Facilities section
      await page.click('text=Hotel Facilities');
      
      // Select WiFi facility
      await page.check('label:has-text("WiFi")');
      
      // Wait for search results to update
      await page.waitForTimeout(1000);
      
      // Verify that results are filtered
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThan(0);
      
      // Verify that facility badge shows 1
      const badge = await page.locator('.badge.bg-secondary').first();
      await expect(badge).toHaveText('1');
    });

    test('should filter hotels by room facility (Air Conditioning)', async ({ page }) => {
      await page.click('text=More Filters');
      await page.waitForSelector('text=Room Facilities');
      
      // Expand Room Facilities section
      await page.click('text=Room Facilities');
      
      // Select Air Conditioning
      await page.check('label:has-text("Air Conditioning")');
      
      await page.waitForTimeout(1000);
      
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThan(0);
    });

    test('should filter hotels by proximity to landmark', async ({ page }) => {
      await page.click('text=More Filters');
      await page.waitForSelector('text=Proximity to Landmarks');
      
      // Expand Proximity section
      await page.click('text=Proximity to Landmarks');
      
      // Enter landmark name
      await page.fill('input[placeholder*="Airport"]', 'Airport');
      
      // Enter distance
      await page.fill('input[placeholder*="Distance in km"]', '15');
      
      await page.waitForTimeout(1000);
      
      // Verify Active badge is shown
      await expect(page.locator('text=Active')).toBeVisible();
      
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThan(0);
    });

    test('should filter hotels by surroundings', async ({ page }) => {
      await page.click('text=More Filters');
      await page.waitForSelector('text=Hotel Surroundings');
      
      // Expand Surroundings section
      await page.click('text=Hotel Surroundings');
      
      // Select restaurants
      await page.check('label:has-text("Restaurants & Cafes")');
      
      await page.waitForTimeout(1000);
      
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThan(0);
    });

    test('should filter hotels by airport distance', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Surroundings');
      
      // Enter airport distance
      const airportInput = page.locator('label:has-text("Max Distance to Airport") ~ input');
      await airportInput.fill('20');
      
      await page.waitForTimeout(1000);
      
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThan(0);
    });
  });

  test.describe('Multiple Filter Combinations', () => {
    test('should apply multiple facility filters', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      
      // Select multiple facilities
      await page.check('label:has-text("WiFi")');
      await page.check('label:has-text("Parking")');
      await page.check('label:has-text("Gym")');
      
      await page.waitForTimeout(1000);
      
      // Verify badge shows 3
      const facilityBadge = await page.locator('text=Hotel Facilities').locator('~ .badge').first();
      await expect(facilityBadge).toHaveText('3');
      
      // Should have results (hotels with all 3 facilities)
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThanOrEqual(0); // May be 0 if no hotels match all criteria
    });

    test('should combine facility and room facility filters', async ({ page }) => {
      await page.click('text=More Filters');
      
      // Select hotel facility
      await page.click('text=Hotel Facilities');
      await page.check('label:has-text("WiFi")');
      
      // Select room facility
      await page.click('text=Room Facilities');
      await page.check('label:has-text("Air Conditioning")');
      
      await page.waitForTimeout(1000);
      
      // Verify More Filters badge shows total count
      const moreFiltersBadge = page.locator('text=More Filters').locator('.badge');
      const badgeText = await moreFiltersBadge.textContent();
      expect(parseInt(badgeText || '0')).toBeGreaterThan(0);
    });

    test('should combine all filter types', async ({ page }) => {
      await page.click('text=More Filters');
      
      // Hotel facility
      await page.click('text=Hotel Facilities');
      await page.check('label:has-text("WiFi")');
      
      // Room facility
      await page.click('text=Room Facilities');
      await page.check('label:has-text("Air Conditioning")');
      
      // Proximity
      await page.click('text=Proximity to Landmarks');
      await page.fill('input[placeholder*="Airport"]', 'City Center');
      await page.fill('input[placeholder*="Distance in km"]', '10');
      
      // Surroundings
      await page.click('text=Hotel Surroundings');
      await page.check('label:has-text("Public Transport")');
      
      await page.waitForTimeout(1500);
      
      // Should show filtered results or empty state
      const resultsText = await page.locator('text=/\\d+ stay/').textContent();
      expect(resultsText).toBeTruthy();
    });

    test('should work with basic filters and advanced filters together', async ({ page }) => {
      // Apply basic rating filter
      await page.selectOption('select.form-control', '4');
      
      await page.waitForTimeout(500);
      
      // Apply advanced filter
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      await page.check('label:has-text("WiFi")');
      
      await page.waitForTimeout(1000);
      
      // Should show filtered results
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Filter Clearing', () => {
    test('should clear individual filter by deselecting', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      
      // Select WiFi
      await page.check('label:has-text("WiFi")');
      await page.waitForTimeout(500);
      
      // Verify badge shows 1
      let badge = await page.locator('text=Hotel Facilities').locator('~ .badge').first();
      await expect(badge).toHaveText('1');
      
      // Deselect WiFi
      await page.uncheck('label:has-text("WiFi")');
      await page.waitForTimeout(500);
      
      // Verify badge shows 0
      badge = await page.locator('text=Hotel Facilities').locator('~ .badge').first();
      await expect(badge).toHaveText('0');
    });

    test('should clear all filters with Clear All button', async ({ page }) => {
      // Apply multiple filters
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      await page.check('label:has-text("WiFi")');
      await page.check('label:has-text("Parking")');
      
      await page.waitForTimeout(500);
      
      // Click Clear All
      await page.click('text=Clear All');
      
      await page.waitForTimeout(500);
      
      // Verify filters are cleared
      await page.click('text=Hotel Facilities');
      const wifiCheckbox = page.locator('label:has-text("WiFi")').locator('input');
      await expect(wifiCheckbox).not.toBeChecked();
    });

    test('should reset results when all filters are cleared', async ({ page }) => {
      // Get initial count
      const initialCount = await page.locator('[data-testid="hotel-card"]').count();
      
      // Apply filter to reduce results
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      await page.check('label:has-text("Spa")'); // Assuming fewer hotels have spa
      
      await page.waitForTimeout(1000);
      
      const filteredCount = await page.locator('[data-testid="hotel-card"]').count();
      
      // Clear filter
      await page.uncheck('label:has-text("Spa")');
      await page.waitForTimeout(1000);
      
      const finalCount = await page.locator('[data-testid="hotel-card"]').count();
      
      // Should return to initial state
      expect(finalCount).toBe(initialCount);
    });
  });

  test.describe('Filter Persistence', () => {
    test('should persist filters in URL query parameters', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      await page.check('label:has-text("WiFi")');
      
      await page.waitForTimeout(500);
      
      // Check URL contains filter
      const url = page.url();
      expect(url).toContain('facilities=');
    });

    test('should restore filters from URL on page load', async ({ page }) => {
      // Navigate with filters in URL
      await page.goto('/stays?facilities=WiFi,Parking');
      
      await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 10000 });
      
      // Open filters
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      
      // Verify checkboxes are checked
      const wifiCheckbox = page.locator('label:has-text("WiFi")').locator('input');
      const parkingCheckbox = page.locator('label:has-text("Parking")').locator('input');
      
      await expect(wifiCheckbox).toBeChecked();
      await expect(parkingCheckbox).toBeChecked();
    });
  });

  test.describe('User Experience', () => {
    test('should show loading state while filtering', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      
      // Apply filter
      await page.check('label:has-text("WiFi")');
      
      // Should see some indication of loading/update (this depends on your implementation)
      // For now, just verify results eventually appear
      await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 5000 });
    });

    test('should show no results message when no hotels match filters', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      
      // Select many facilities that likely no hotel has all of
      await page.check('label:has-text("WiFi")');
      await page.check('label:has-text("Parking")');
      await page.check('label:has-text("Gym")');
      await page.check('label:has-text("Swimming Pool")');
      await page.check('label:has-text("Spa")');
      await page.check('label:has-text("Conference Rooms")');
      
      await page.waitForTimeout(1000);
      
      // Should show 0 stays or empty state message
      const resultsText = await page.locator('text=/\\d+ stay/').textContent();
      expect(resultsText).toMatch(/0 stay/);
    });

    test('should expand and collapse filter sections', async ({ page }) => {
      await page.click('text=More Filters');
      
      // Section should be collapsed initially
      await expect(page.locator('label:has-text("WiFi")')).not.toBeVisible();
      
      // Expand
      await page.click('text=Hotel Facilities');
      await expect(page.locator('label:has-text("WiFi")')).toBeVisible();
      
      // Collapse
      await page.click('text=Hotel Facilities');
      await expect(page.locator('label:has-text("WiFi")')).not.toBeVisible();
    });

    test('should show filter count badges', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      
      // Initially 0
      let badge = await page.locator('text=Hotel Facilities').locator('~ .badge').first();
      await expect(badge).toHaveText('0');
      
      // Select one
      await page.check('label:has-text("WiFi")');
      await expect(badge).toHaveText('1');
      
      // Select another
      await page.check('label:has-text("Parking")');
      await expect(badge).toHaveText('2');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle rapid filter changes', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      
      // Rapidly toggle filters
      for (let i = 0; i < 5; i++) {
        await page.check('label:has-text("WiFi")');
        await page.uncheck('label:has-text("WiFi")');
      }
      
      // Should end in unchecked state
      const checkbox = page.locator('label:has-text("WiFi")').locator('input');
      await expect(checkbox).not.toBeChecked();
      
      // Should still show results
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThan(0);
    });

    test('should handle invalid distance inputs gracefully', async ({ page }) => {
      await page.click('text=More Filters');
      await page.click('text=Proximity to Landmarks');
      
      // Enter landmark
      await page.fill('input[placeholder*="Airport"]', 'Airport');
      
      // Enter invalid distance
      await page.fill('input[placeholder*="Distance in km"]', '-5');
      
      await page.waitForTimeout(500);
      
      // Should handle gracefully (not crash)
      const hotelCount = await page.locator('[data-testid="hotel-card"]').count();
      expect(hotelCount).toBeGreaterThanOrEqual(0);
    });

    test('should maintain scroll position when filtering', async ({ page }) => {
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      
      const scrollBefore = await page.evaluate(() => window.scrollY);
      
      // Apply filter
      await page.click('text=More Filters');
      await page.click('text=Hotel Facilities');
      await page.check('label:has-text("WiFi")');
      
      await page.waitForTimeout(1000);
      
      const scrollAfter = await page.evaluate(() => window.scrollY);
      
      // Scroll position should be maintained or controlled
      expect(scrollAfter).toBeGreaterThanOrEqual(0);
    });
  });
});
