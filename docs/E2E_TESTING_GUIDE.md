# E2E Testing Quick Start Guide

## 🎬 Watch Your Tests Run in a Browser!

I've set up Playwright for visual end-to-end testing. You can literally watch the tests interact with your application in a real Chrome browser.

## Quick Start (3 Steps)

### Step 1: Start the Backend
```bash
cd service
npm run dev
```
Backend runs on http://localhost:3001

### Step 2: Run Visual Tests
```bash
cd frontend
npm run test:e2e:visual
```

### Step 3: Watch! 👀
A Chrome browser will open and you'll see:
- Forms filling in automatically
- Buttons clicking
- Pages navigating
- Errors appearing
- Success messages
- Console logs showing each step

## What Gets Tested

### ✅ Login Flow
- Email validation
- Password validation
- Wrong credentials error
- Successful login
- Password show/hide toggle
- Loading states

### ✅ Registration Flow
- Form validation
- Password matching
- Duplicate email error
- Successful registration
- Password toggles

### ✅ Error Handling
- Invalid email format
- Short passwords
- API errors
- Form validation errors

## Available Commands

### 🎬 Visual Tests (Watch in Browser)
```bash
npm run test:e2e:visual
```
**Best for:** Watching tests execute, demos, debugging

### 🎮 Interactive UI Mode
```bash
npm run test:e2e:ui
```
**Best for:** Selecting specific tests, time-travel debugging

### 👁️ Headed Mode (All Tests)
```bash
npm run test:e2e:headed
```
**Best for:** Running full suite with browser visible

### 🤖 Headless Mode (CI/CD)
```bash
npm run test:e2e
```
**Best for:** Automated testing, CI/CD pipelines

### 🐛 Debug Mode
```bash
npm run test:e2e:debug
```
**Best for:** Step-by-step debugging

### 📊 View Report
```bash
npm run test:e2e:report
```
**Best for:** Reviewing test results, screenshots, videos

## Test Files

### `e2e/auth.spec.ts`
Comprehensive authentication tests (fast execution)
- 15+ test scenarios
- Runs in ~2 minutes

### `e2e/visual-auth.spec.ts`
Visual demonstration tests (slow, watchable)
- 5 visual journeys
- Includes pauses and console logs
- Runs in ~3 minutes

## Example Output

When you run visual tests, you'll see:
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

## Test Credentials

### Valid Login
```
Email: admin@bookingplatform.com
Password: password123
```

### Invalid Login (for error testing)
```
Email: wrong@example.com
Password: wrongpassword
```

## What You'll See

### 1. Browser Opens
Chrome browser launches automatically

### 2. Navigation
Tests navigate to login/register pages

### 3. Form Filling
Watch as forms fill in character by character

### 4. Validation
See error messages appear for invalid input

### 5. API Calls
Watch loading spinners during API requests

### 6. Success
See redirects and success messages

### 7. Console Logs
Terminal shows progress of each step

## Troubleshooting

### Backend Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:3001
Solution: Start backend with 'cd service && npm run dev'
```

### Port Already in Use
```
Error: Port 3000 is already in use
Solution: Kill process with 'lsof -ti:3000 | xargs kill -9'
```

### Tests Timeout
```
Error: Timeout waiting for element
Solution: Run in headed mode to see what's happening
```

## Interactive UI Mode

The most powerful way to run tests:

```bash
npm run test:e2e:ui
```

Features:
- ✅ Click any test to run it
- ✅ Watch execution in real-time
- ✅ Time-travel through test steps
- ✅ See screenshots at each step
- ✅ Inspect DOM at any point
- ✅ View network requests
- ✅ See console logs
- ✅ Debug failures easily

## Test Results

### Screenshots
Automatically captured on failure:
- Location: `test-results/`
- Shows exact failure point

### Videos
Recorded on failure:
- Location: `test-results/`
- Full test execution

### HTML Report
```bash
npm run test:e2e:report
```
- Test summary
- Pass/fail status
- Execution time
- Screenshots & videos

## Next Steps

1. **Run the visual tests** to see them in action
2. **Try the UI mode** for interactive testing
3. **Check the HTML report** after tests run
4. **Write new tests** for hotel features
5. **Add to CI/CD** for automated testing

## Full Documentation

See `frontend/e2e/README.md` for:
- Detailed test scenarios
- Writing new tests
- CI/CD integration
- Best practices
- Advanced debugging

## Summary

✅ **Playwright installed and configured**
✅ **15+ authentication tests written**
✅ **Visual tests with pauses for watching**
✅ **Interactive UI mode available**
✅ **Screenshots and videos on failure**
✅ **HTML reports generated**
✅ **Ready to run and watch!**

**Start watching your tests now:**
```bash
cd frontend && npm run test:e2e:visual
```
