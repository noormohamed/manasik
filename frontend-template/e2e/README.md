# End-to-End Tests with Playwright

## Overview
Visual browser tests for the authentication system using Playwright. These tests run in a real Chrome browser and can be watched as they execute.

## Prerequisites

1. **Backend must be running:**
```bash
cd service
npm run dev
# Backend runs on http://localhost:3001
```

2. **Frontend will start automatically** when you run the tests (configured in playwright.config.ts)

## Routes

The application has separate routes for authentication:
- `/login` - Login page with email/password form
- `/register` - Registration page with user signup form
- `/authentication` - Combined page with both forms side-by-side (legacy)

## Test Files

### `auth.spec.ts`
Comprehensive authentication tests covering:
- Login validation (email format, password length)
- Login with valid/invalid credentials
- Registration validation
- Registration with duplicate email
- Password visibility toggle
- Loading states
- Navigation between login/register

### `visual-auth.spec.ts`
Slower, visual tests designed to be watched:
- Complete login journey with pauses
- Complete registration journey with pauses
- Error handling demonstration
- Password toggle demonstration
- Form validation demonstration

## Running Tests

### 1. Watch Tests Visually (RECOMMENDED)
```bash
npm run test:e2e:visual
```
This runs the visual tests in headed mode (browser visible) with console logs showing each step.

### 2. Interactive UI Mode
```bash
npm run test:e2e:ui
```
Opens Playwright's UI where you can:
- Select which tests to run
- Watch tests execute
- Time travel through test steps
- See screenshots and videos
- Debug failures

### 3. Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```
Runs all tests with the browser visible.

### 4. Headless Mode (CI/CD)
```bash
npm run test:e2e
```
Runs all tests in headless mode (no browser window).

### 5. Debug Mode
```bash
npm run test:e2e:debug
```
Opens Playwright Inspector for step-by-step debugging.

### 6. View Test Report
```bash
npm run test:e2e:report
```
Opens the HTML report from the last test run.

## Test Scenarios

### Login Tests ✅
- ✅ Navigate to login page
- ✅ Show validation errors for empty form
- ✅ Show error for invalid email format
- ✅ Show error for short password
- ✅ Show error for wrong credentials
- ✅ Successfully login with valid credentials
- ✅ Toggle password visibility
- ✅ Show loading state during login
- ✅ Link to registration page

### Registration Tests ✅
- ✅ Navigate to registration page
- ✅ Show validation errors for empty form
- ✅ Show error when passwords don't match
- ✅ Show error for duplicate email
- ✅ Successfully register with valid data
- ✅ Toggle password visibility on both fields
- ✅ Link to login page

### Visual Journey Tests 🎬
- 🎬 Complete login journey (with pauses)
- 🎬 Complete registration journey (with pauses)
- 🎬 Error handling demonstration
- 🎬 Password toggle demonstration
- 🎬 Form validation demonstration

## Test Credentials

### Valid Login (from seed data)
```
Email: admin@bookingplatform.com
Password: password123
```

### Invalid Login (for error testing)
```
Email: wrong@example.com
Password: wrongpassword
```

### Registration
Tests generate unique emails using timestamps:
```
Email: test{timestamp}@example.com
Password: password123
```

## Watching Tests Execute

### Best Way to Watch
```bash
# Terminal 1: Start backend
cd service && npm run dev

# Terminal 2: Run visual tests
cd frontend && npm run test:e2e:visual
```

You'll see:
1. Chrome browser opens
2. Tests navigate through pages
3. Forms fill in slowly
4. Errors appear and disappear
5. Console logs show each step
6. Tests pause so you can see what's happening

### Using Playwright UI (Interactive)
```bash
npm run test:e2e:ui
```

Features:
- Click on any test to run it
- Watch it execute in real-time
- See screenshots at each step
- Time travel through test execution
- Inspect DOM at any point
- See network requests
- View console logs

## Test Output

### Console Output
```
📍 Step 1: Navigating to home page...
📍 Step 2: Going to login page...
📍 Step 3: Login form is visible
📍 Step 4: Typing email...
📍 Step 5: Typing password...
📍 Step 6: Clicking login button...
📍 Step 7: Waiting for redirect...
✅ Login journey complete!
```

### Screenshots
Automatically captured on failure:
- Location: `test-results/`
- Format: PNG
- Includes: Full page screenshot at failure point

### Videos
Recorded on failure:
- Location: `test-results/`
- Format: WebM
- Includes: Full test execution

### HTML Report
```bash
npm run test:e2e:report
```
Shows:
- Test results summary
- Pass/fail status
- Execution time
- Screenshots
- Videos
- Traces

## Debugging Failed Tests

### 1. Run in Debug Mode
```bash
npm run test:e2e:debug
```
- Pauses at each step
- Allows inspection
- Can step through code
- See live DOM

### 2. Check Screenshots
```bash
ls test-results/
```
Look for PNG files showing failure point.

### 3. Watch Video
```bash
open test-results/[test-name]/video.webm
```
See exactly what happened.

### 4. View Trace
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```
Time-travel debugging with full context.

## Common Issues

### "Backend not running"
**Error:** Tests timeout waiting for API
**Solution:** Start backend first
```bash
cd service && npm run dev
```

### "Port 3000 already in use"
**Error:** Frontend can't start
**Solution:** Kill existing process
```bash
lsof -ti:3000 | xargs kill -9
```

### "Test failed: Element not found"
**Error:** Selector doesn't match
**Solution:** 
1. Run in headed mode to see what's happening
2. Check if element exists in browser
3. Update selector in test

### "Timeout waiting for redirect"
**Error:** Login/register doesn't redirect
**Solution:**
1. Check backend is running
2. Check API response in Network tab
3. Verify credentials are correct

## Writing New Tests

### Basic Test Structure
```typescript
test('test description', async ({ page }) => {
  // Navigate
  await page.goto('/path');
  
  // Interact
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  
  // Assert
  await expect(page.locator('.success')).toBeVisible();
});
```

### Visual Test Structure
```typescript
test('Visual test', async ({ page }) => {
  console.log('📍 Step 1: Description...');
  await page.goto('/path');
  await page.waitForTimeout(1000); // Pause to watch
  
  console.log('📍 Step 2: Next action...');
  await page.fill('input', 'value', { timeout: 2000 }); // Slow typing
  await page.waitForTimeout(500);
  
  console.log('✅ Test complete!');
});
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright
  run: npx playwright install --with-deps chromium
  
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Best Practices

1. **Always start backend first**
2. **Use visual tests for demos**
3. **Use regular tests for CI/CD**
4. **Add waits in visual tests** so you can see what's happening
5. **Use console.log** to show test progress
6. **Generate unique emails** for registration tests
7. **Clean up test data** if needed
8. **Use meaningful test descriptions**
9. **Group related tests** with describe blocks
10. **Take screenshots** on important steps

## Performance

### Test Execution Time
- Login tests: ~30 seconds
- Registration tests: ~40 seconds
- Visual tests: ~2-3 minutes (intentionally slow)
- Full suite: ~5 minutes

### Optimization
- Run tests in parallel (default)
- Use `--workers=1` for visual tests
- Skip unnecessary waits in CI
- Use `test.only()` during development

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)

## Support

If tests fail:
1. Check backend is running
2. Check frontend can start
3. Run in headed mode to see what's happening
4. Check screenshots/videos
5. Run in debug mode
6. Check test logs

## Next Steps

- [ ] Add hotel search tests
- [ ] Add booking flow tests
- [ ] Add user profile tests
- [ ] Add payment tests
- [ ] Add mobile viewport tests
- [ ] Add accessibility tests
- [ ] Add performance tests
