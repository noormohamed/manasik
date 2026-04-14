# Auth Persistence Tests

## Overview
Comprehensive test suite to ensure users don't get randomly logged out. Includes unit tests, integration tests, and E2E tests.

## Test Files

### 1. Unit Tests

#### `frontend/src/__tests__/auth-persistence.test.tsx`
Tests for AuthContext and auth state management.

**Test Coverage:**
- ✅ Token refresh maintains user state
- ✅ Cookie updates when token changes
- ✅ Logout when token is removed
- ✅ Race condition prevention (no concurrent user loads)
- ✅ Session recovery when user state is lost
- ✅ 401 errors clear auth
- ✅ Network errors don't clear auth
- ✅ Login sets tokens and user
- ✅ Logout clears tokens and user
- ✅ Cookie management (set on login, remove on logout)

**Run:**
```bash
cd frontend
npm test auth-persistence.test.tsx
```

#### `frontend/src/__tests__/api-client.test.ts`
Tests for API client token refresh and error handling.

**Test Coverage:**
- ✅ Automatic token refresh on 401
- ✅ Request retry after token refresh
- ✅ No retry on auth endpoints
- ✅ Clear tokens on refresh failure
- ✅ Prevent concurrent token refreshes
- ✅ Network errors don't clear auth
- ✅ 500 errors don't clear auth
- ✅ 404 errors don't clear auth
- ✅ Authorization header included when token exists
- ✅ Credentials included in requests
- ✅ Response unwrapping
- ✅ All HTTP methods (GET, POST, PUT, DELETE)

**Run:**
```bash
cd frontend
npm test api-client.test.ts
```

### 2. E2E Tests

#### `frontend/e2e/auth-persistence.spec.ts`
End-to-end tests for auth persistence in real browser scenarios.

**Test Coverage:**
- ✅ Session maintained during navigation
- ✅ Session maintained across page reloads
- ✅ Session maintained when switching tabs
- ✅ Automatic token refresh
- ✅ No logout on network errors
- ✅ Logout when refresh token is invalid
- ✅ Auth state syncs across rapid navigations
- ✅ Session maintained during API calls
- ✅ Logout works correctly
- ✅ Auth debug page displays correctly

**Run:**
```bash
cd frontend
npx playwright test auth-persistence.spec.ts
```

## Running All Tests

### Unit Tests Only
```bash
cd frontend
npm test -- --testPathPattern="auth-persistence|api-client"
```

### E2E Tests Only
```bash
cd frontend
npx playwright test auth-persistence.spec.ts
```

### All Auth Tests
```bash
cd frontend
npm test -- --testPathPattern="auth-persistence|api-client"
npx playwright test auth-persistence.spec.ts
```

### With Coverage
```bash
cd frontend
npm test -- --coverage --testPathPattern="auth-persistence|api-client"
```

## Test Scenarios

### Scenario 1: Normal Navigation
**What it tests:** User stays logged in while navigating between pages

**Steps:**
1. Login
2. Navigate to multiple pages
3. Verify user stays logged in
4. Verify token exists

**Expected:** No logout, session maintained

### Scenario 2: Token Refresh
**What it tests:** Automatic token refresh when expired

**Steps:**
1. Login
2. Remove access token (simulate expiry)
3. Make API call
4. Verify token refreshed
5. Verify user stays logged in

**Expected:** New token obtained, request succeeds, no logout

### Scenario 3: Page Reload
**What it tests:** Session persists across page reloads

**Steps:**
1. Login
2. Reload page multiple times
3. Verify user stays logged in

**Expected:** Session maintained after each reload

### Scenario 4: Multiple Tabs
**What it tests:** Auth state syncs across tabs

**Steps:**
1. Login in tab 1
2. Open tab 2
3. Navigate in both tabs
4. Verify both tabs stay logged in

**Expected:** Both tabs maintain session, stay in sync

### Scenario 5: Network Error
**What it tests:** Network errors don't cause logout

**Steps:**
1. Login
2. Simulate network offline
3. Try to navigate
4. Go back online
5. Verify still logged in

**Expected:** Tokens not cleared, session maintained

### Scenario 6: Race Conditions
**What it tests:** Multiple concurrent user loads don't conflict

**Steps:**
1. Login
2. Trigger multiple user refresh calls simultaneously
3. Verify only one API call made
4. Verify user state correct

**Expected:** No race conditions, single API call, correct state

### Scenario 7: Invalid Refresh Token
**What it tests:** Logout when refresh token is invalid

**Steps:**
1. Login
2. Corrupt both tokens
3. Try to navigate
4. Verify redirected to login
5. Verify tokens cleared

**Expected:** Logout, redirect to login, tokens cleared

### Scenario 8: Rapid Navigation
**What it tests:** Auth state maintained during rapid page changes

**Steps:**
1. Login
2. Rapidly navigate between pages
3. Verify token exists after each navigation
4. Verify user stays logged in

**Expected:** Session maintained, no state loss

## Continuous Integration

### GitHub Actions Example
```yaml
name: Auth Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --testPathPattern="auth-persistence|api-client"

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm install
      - run: cd frontend && npx playwright install
      - run: docker-compose up -d
      - run: cd frontend && npx playwright test auth-persistence.spec.ts
      - run: docker-compose down
```

## Test Maintenance

### When to Update Tests

1. **Auth Flow Changes**: Update when login/logout flow changes
2. **Token Expiry Changes**: Update when JWT expiry times change
3. **API Changes**: Update when auth endpoints change
4. **New Features**: Add tests for new auth-related features

### Adding New Tests

1. Identify the scenario to test
2. Choose appropriate test type (unit/E2E)
3. Write test following existing patterns
4. Run test to verify it works
5. Add to CI pipeline

### Common Issues

**Issue: Tests timing out**
- Increase timeout in test
- Check if backend is running
- Verify API URL is correct

**Issue: Tests flaky**
- Add proper waits (waitFor, waitForLoadState)
- Avoid hardcoded delays
- Use proper assertions

**Issue: Mock not working**
- Verify mock is set up before test
- Clear mocks between tests
- Check mock implementation

## Coverage Goals

Target coverage for auth-related code:
- **AuthContext**: 90%+
- **API Client**: 90%+
- **Auth Middleware**: 80%+
- **Auth Routes**: 80%+

Current coverage:
```bash
cd frontend
npm test -- --coverage --testPathPattern="auth-persistence|api-client"
```

## Manual Testing Checklist

In addition to automated tests, manually verify:

- [ ] Login works
- [ ] Logout works
- [ ] Navigate between pages without logout
- [ ] Reload page maintains session
- [ ] Multiple tabs stay in sync
- [ ] Token refresh happens automatically
- [ ] Network errors don't cause logout
- [ ] Invalid tokens cause logout
- [ ] Debug page shows correct info
- [ ] Console logs are helpful

## Debugging Failed Tests

### Unit Tests
1. Check console output for error messages
2. Verify mocks are set up correctly
3. Check if test expectations match actual behavior
4. Run single test: `npm test -- -t "test name"`

### E2E Tests
1. Run with headed browser: `npx playwright test --headed`
2. Use debug mode: `npx playwright test --debug`
3. Check screenshots: `npx playwright test --screenshot=on`
4. View trace: `npx playwright show-trace trace.zip`

### Common Fixes
- Update snapshots: `npm test -- -u`
- Clear cache: `npm test -- --clearCache`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Rebuild Playwright: `npx playwright install`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
