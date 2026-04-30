# Hotel Listing Tests

## Overview
Comprehensive test suite for hotel listing and creation functionality to ensure integrity when making changes.

## Test File
`service/src/__tests__/hotel-listing.api.test.ts`

## What's Tested

### 1. GET /api/hotels/listings

#### Authentication Tests
- ✅ Requires authentication (401 without token)
- ✅ Handles invalid tokens
- ✅ Handles missing authorization header

#### Functionality Tests
- ✅ Returns empty array for users with no hotels
- ✅ Supports pagination parameters (page, limit)
- ✅ Supports includeRooms parameter
- ✅ Returns correct pagination metadata
- ✅ Returns hotels created by the user

### 2. POST /api/hotels

#### Authentication Tests
- ✅ Requires authentication (401 without token)

#### Validation Tests
- ✅ Validates required fields (name, address, city, country)
- ✅ Returns 400 for missing required fields

#### Creation Tests
- ✅ Creates hotel with minimum required fields
- ✅ Creates hotel with all optional fields
- ✅ Sets default values for optional fields
- ✅ Assigns hotel to authenticated user
- ✅ Returns created hotel data

#### Default Values Tested
- ✅ Star rating defaults to 3
- ✅ Total rooms defaults to 0
- ✅ Status defaults to ACTIVE
- ✅ Check-in time defaults to 14:00
- ✅ Check-out time defaults to 11:00
- ✅ Cancellation policy has default text

### 3. Integration Tests

#### Create and Fetch Flow
- ✅ Creates hotel and immediately fetches it in listings
- ✅ Verifies hotel appears in user's listings
- ✅ Verifies all hotel data is correct

### 4. Error Handling

- ✅ Handles database errors gracefully
- ✅ Handles invalid data
- ✅ Doesn't crash on edge cases

## Running the Tests

### Run All Hotel Listing Tests
```bash
cd service
npm test hotel-listing.api.test.ts
```

### Run Specific Test Suite
```bash
npm test -- -t "GET /api/hotels/listings"
npm test -- -t "POST /api/hotels"
npm test -- -t "Integration"
```

### Run with Coverage
```bash
npm test -- --coverage hotel-listing.api.test.ts
```

### Watch Mode
```bash
npm test -- --watch hotel-listing.api.test.ts
```

## Test Structure

### Setup (beforeAll)
1. Initialize database connection
2. Create test user
3. Generate authentication token

### Cleanup (afterAll)
1. Delete test hotels
2. Delete test user
3. Close database connection
4. Close server

### Individual Tests
Each test:
1. Makes API request
2. Verifies response status
3. Verifies response body
4. Cleans up created data

## Key Fixes Made

### Issue: Hotels Not Appearing in Listings

**Problem:**
The `findByUserManaged` query only looked for hotels via `company_admins` table, but newly created hotels weren't linked to companies.

**Solution:**
Modified the query to use `LEFT JOIN` and check both:
- Hotels where user is in `company_admins` (for company-managed hotels)
- Hotels where user is the `agent_id` (for personally created hotels)

**Changed Methods:**
1. `findByUserManaged()` - Now uses `LEFT JOIN` and checks both conditions
2. `countByUserManaged()` - Now counts hotels from both sources
3. `isUserManagingHotel()` - Now checks both conditions

**SQL Changes:**
```sql
-- Before (INNER JOIN - required company)
FROM hotels h
JOIN companies c ON h.company_id = c.id
JOIN company_admins ca ON c.id = ca.company_id
WHERE ca.user_id = ?

-- After (LEFT JOIN - company optional)
FROM hotels h
LEFT JOIN companies c ON h.company_id = c.id
LEFT JOIN company_admins ca ON c.id = ca.company_id AND ca.user_id = ?
WHERE ca.user_id = ? OR h.agent_id = ?
```

## Test Coverage

### Endpoints Covered
- ✅ GET /api/hotels/listings
- ✅ POST /api/hotels

### Scenarios Covered
- ✅ Authenticated requests
- ✅ Unauthenticated requests
- ✅ Valid data
- ✅ Invalid data
- ✅ Missing required fields
- ✅ Optional fields
- ✅ Default values
- ✅ Pagination
- ✅ Query parameters
- ✅ User assignment
- ✅ Data persistence
- ✅ Error handling

### Edge Cases
- ✅ Empty listings
- ✅ Invalid tokens
- ✅ Missing headers
- ✅ Database errors
- ✅ Long strings
- ✅ Invalid data types

## Continuous Integration

### Pre-commit Hook
```bash
#!/bin/bash
cd service
npm test hotel-listing.api.test.ts
if [ $? -ne 0 ]; then
  echo "Hotel listing tests failed. Commit aborted."
  exit 1
fi
```

### GitHub Actions
```yaml
name: Hotel Listing Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd service && npm install
      - run: cd service && npm test hotel-listing.api.test.ts
```

## Debugging Failed Tests

### View Detailed Output
```bash
npm test -- --verbose hotel-listing.api.test.ts
```

### Run Single Test
```bash
npm test -- -t "should create a hotel with minimum required fields"
```

### Check Database State
```bash
# Connect to MySQL
mysql -u booking_user -p booking_platform

# Check hotels
SELECT * FROM hotels WHERE agent_id = 'test-user-id';

# Check company_admins
SELECT * FROM company_admins WHERE user_id = 'test-user-id';
```

## Maintenance

### When to Update Tests

1. **API Changes**: Update when endpoints change
2. **Validation Changes**: Update when validation rules change
3. **Default Values**: Update when defaults change
4. **New Features**: Add tests for new functionality
5. **Bug Fixes**: Add regression tests

### Adding New Tests

1. Identify the scenario to test
2. Add test case to appropriate describe block
3. Follow existing test patterns
4. Ensure cleanup is handled
5. Run test to verify it works
6. Update this documentation

## Common Issues

### Tests Timing Out
- Increase timeout: `jest.setTimeout(10000)`
- Check database connection
- Verify test data cleanup

### Tests Failing Randomly
- Check for race conditions
- Ensure proper cleanup between tests
- Use unique test data (timestamps, UUIDs)

### Database Connection Errors
- Verify MySQL is running
- Check connection credentials
- Ensure database exists

## Benefits

1. **Confidence**: Make changes knowing tests will catch issues
2. **Documentation**: Tests serve as usage examples
3. **Regression Prevention**: Catch bugs before production
4. **Faster Development**: Quick feedback on changes
5. **Better Design**: Writing tests improves code quality

## Next Steps

Consider adding:
1. Performance tests (response time)
2. Load tests (concurrent requests)
3. Security tests (SQL injection, XSS)
4. Integration tests with frontend
5. E2E tests with Playwright
