# Payments Calculation Fix — Bugfix Design

## Overview

Two bugs prevent the payments page from displaying correct host earnings for William Smith. Bug 1 is a broken agent-user mapping in the seed SQL: the `agents` table record `agent-10` has `user_id = '556e10c0-...'` instead of `user_id = 'agent-010'`, so the earnings endpoint query `SELECT id FROM agents WHERE user_id = ?` returns nothing and the frontend falls back to showing customer bookings. Bug 2 is the absence of any payment source tracking: both Stripe-verified and manually-marked payments set `payment_status = 'PAID'` with no way to distinguish them, so the earnings endpoint incorrectly counts manually-marked bookings toward host earnings.

The fix involves: (1) correcting the seed SQL's `ON DUPLICATE KEY UPDATE` to also update `user_id`, (2) adding a `payment_method` column to the `bookings` table, (3) setting `payment_method = 'STRIPE'` in the checkout verification flow, (4) setting `payment_method = 'MANUAL'` in the hotel manager payment-status endpoint, and (5) filtering the earnings query to only count `payment_method = 'STRIPE'` bookings.

## Glossary

- **Bug_Condition (C)**: The set of conditions that trigger incorrect behavior — either a mismatched `agents.user_id` preventing agent lookup, or a manually-marked-as-PAID booking being counted in earnings
- **Property (P)**: The desired correct behavior — agent lookup resolves correctly, and only Stripe-verified payments count toward earnings
- **Preservation**: Existing behaviors that must remain unchanged — mouse/UI interactions, non-host user responses, Stripe payment flow, management UI payment marking, booking status transitions
- **`agents` table**: Maps agent records to user accounts via `user_id` foreign key; used by the earnings endpoint to resolve which hotels a host manages
- **`payment_method`**: New column on `bookings` table to track whether payment was made via `'STRIPE'` (checkout verification) or `'MANUAL'` (hotel manager action); `NULL` for legacy/unpaid bookings
- **Earnings endpoint**: `GET /api/users/me/earnings` in `user.routes.ts` — looks up agent by `user_id`, finds hotels by `agent_id`, then fetches bookings for those hotels
- **Stripe verification**: `POST /api/checkout/verify-payment` and `GET /api/checkout/session/:sessionId` in `checkout.routes.ts` — confirms payment with Stripe and updates booking status
- **Manual payment marking**: `PATCH /api/hotels/bookings/:id/payment-status` in `hotel.routes.ts` — allows hotel managers to mark bookings as PAID

## Bug Details

### Bug Condition

The bug manifests in two independent scenarios:

**Bug 1 — Broken Agent-User Mapping**: When William Smith (user ID `agent-010`) requests earnings, the system queries `SELECT id FROM agents WHERE user_id = 'agent-010'`. The seed SQL inserts agent record `agent-10` with `user_id = 'agent-010'`, but the `ON DUPLICATE KEY UPDATE` clause only updates `name` and `email`, not `user_id`. If the record was previously inserted with a different `user_id` (e.g., `'556e10c0-c6c1-48d5-9c73-c17beffc02d6'`), the stale `user_id` persists and the query returns no rows.

**Bug 2 — No Payment Source Distinction**: When the earnings endpoint fetches bookings for a host's hotels, it includes ALL non-cancelled bookings regardless of how `payment_status` became `'PAID'`. Both Stripe-verified payments and hotel-manager manual markings set the same `payment_status = 'PAID'` value, with no column to distinguish the source.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type EarningsRequest OR Booking
  OUTPUT: boolean

  // Bug 1: Agent-user mapping is stale
  IF input IS EarningsRequest THEN
    agent ← SELECT FROM agents WHERE id corresponds to user input.userId
    RETURN agent EXISTS
           AND agent.user_id ≠ input.userId
  END IF

  // Bug 2: Manually-marked payment counted in earnings
  IF input IS Booking THEN
    RETURN input.payment_status = 'PAID'
           AND input.payment_source ≠ 'STRIPE'
           AND input IS included in earnings calculation
  END IF

  RETURN FALSE
END FUNCTION
```

### Examples

- **Bug 1 example**: William Smith logs in (userId = `agent-010`), visits `/payments/`. The earnings endpoint runs `SELECT id FROM agents WHERE user_id = 'agent-010'` → returns 0 rows (because `agents.user_id` is `'556e10c0-...'`). Frontend receives empty earnings, falls back to `/users/me/bookings`, shows 1 pending customer booking at £1,726.15 instead of 7 host bookings.
- **Bug 1 expected**: The query should return agent `agent-10`, then find hotels `hotel-010` (Beach Club) and `hotel-020` (Countryside Lodge), then return all 7 bookings across both hotels.
- **Bug 2 example**: Hotel manager manually marks `booking-0030` as PAID via `PATCH /api/hotels/bookings/booking-0030/payment-status`. The earnings endpoint later includes this booking in William Smith's earnings total, even though no actual Stripe payment was received.
- **Bug 2 expected**: `booking-0030` should still show `payment_status = 'PAID'` in the management UI, but should NOT be counted in the host earnings calculation because `payment_method` is `'MANUAL'`, not `'STRIPE'`.
- **Edge case**: A booking with `payment_status = 'PENDING'` and no `payment_method` set should not appear in earnings totals regardless (existing behavior, unchanged).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Non-host users requesting earnings must continue to receive empty results with zero totals (requirement 3.1)
- Stripe-verified payments must continue to mark bookings as PAID and be included in earnings (requirement 3.2)
- Hotel managers must continue to be able to mark bookings as PAID via the management UI for display purposes (requirement 3.3)
- The frontend must continue to categorize bookings as PENDING or AVAILABLE based on check-out date (requirement 3.4)
- Cancelled or refunded bookings must continue to be excluded from earnings (requirement 3.5)
- Mouse clicks, UI interactions, and all non-earnings API endpoints must be unaffected

**Scope:**
All inputs that do NOT involve the agent-user mapping lookup or the payment source distinction should be completely unaffected by this fix. This includes:
- All non-earnings API endpoints
- Bookings created through any source (DIRECT, STAFF_CREATED, AGENT, BROKER)
- The checkout flow itself (session creation, payment processing)
- Hotel search, listing, and management features
- User authentication and profile management

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Stale `user_id` in `agents` table (Bug 1)**: The seed SQL `seed-william-smith.sql` uses `ON DUPLICATE KEY UPDATE name = 'William Smith', email = 'agent-10@bookingplatform.com'` which does NOT update `user_id`. If the agent record `agent-10` was previously inserted (e.g., by `seed-platform-data.js`) with a different `user_id`, the stale value persists. The earnings endpoint in `user.routes.ts` queries `SELECT id FROM agents WHERE user_id = ?` with the logged-in user's ID, finds no match, and returns empty earnings.

2. **Missing `payment_method` column (Bug 2)**: The `bookings` table in `init.sql` has no column to track how a payment was made. Both the Stripe verification endpoint (`checkout.routes.ts` line: `SET payment_status = 'PAID'`) and the hotel manager endpoint (`hotel.routes.ts` line: `SET payment_status = ?`) write the same `'PAID'` value with no distinguishing metadata.

3. **Unfiltered earnings query (Bug 2)**: The earnings endpoint in `user.routes.ts` fetches all bookings for the host's hotels with `WHERE b.service_type = 'HOTEL' AND JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) IN (...)` — it does not filter by payment method, so manually-marked bookings are included in the earnings calculation.

4. **Seed data has no payment_method values**: The existing seed bookings in `seed-william-smith.sql` were inserted with `payment_status = 'PAID'` but no payment source indicator, making it impossible to distinguish Stripe from manual payments retroactively.

## Correctness Properties

Property 1: Bug Condition - Agent-User Mapping Resolution

_For any_ earnings request where the user has a corresponding agent record in the system, the fixed earnings endpoint SHALL correctly resolve the agent by matching `agents.user_id` to the logged-in user's ID, returning all bookings across all hotels managed by that agent.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition - Stripe-Only Earnings Calculation

_For any_ booking where `payment_status = 'PAID'` and `payment_method = 'MANUAL'` (manually marked by hotel staff), the fixed earnings endpoint SHALL exclude that booking from the host's earnings totals, only counting bookings where `payment_method = 'STRIPE'`.

**Validates: Requirements 2.3, 2.4**

Property 3: Preservation - Non-Host User Earnings

_For any_ user who does not have a corresponding agent record, the fixed earnings endpoint SHALL return empty earnings with zero totals, identical to the original behavior.

**Validates: Requirements 3.1**

Property 4: Preservation - Stripe Payment Flow

_For any_ booking paid via Stripe checkout verification, the fixed code SHALL continue to mark the booking as `payment_status = 'PAID'` and `status = 'CONFIRMED'`, and the earnings endpoint SHALL continue to include these bookings in host earnings calculations.

**Validates: Requirements 3.2**

Property 5: Preservation - Manual Payment Marking UI

_For any_ booking where a hotel manager marks payment as PAID via the management UI, the fixed code SHALL continue to update `payment_status = 'PAID'` (for display in the management interface), preserving the existing management workflow.

**Validates: Requirements 3.3**

Property 6: Preservation - Booking Status Categorization

_For any_ successful earnings response, the fixed frontend SHALL continue to categorize bookings as PENDING (not yet checked out) or AVAILABLE (checked out and confirmed/completed), preserving the existing display logic.

**Validates: Requirements 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `service/database/seed-william-smith.sql`

**Change**: Fix `ON DUPLICATE KEY UPDATE` clause

**Specific Changes**:
1. **Update seed SQL to include `user_id` in upsert**: Change the `ON DUPLICATE KEY UPDATE` clause for the agents INSERT to also update `user_id = 'agent-010'`, ensuring the agent record always maps to the correct user regardless of prior state.

---

**File**: `service/database/init.sql`

**Change**: Add `payment_method` column to `bookings` table

**Specific Changes**:
2. **Add `payment_method` column**: Add `payment_method ENUM('STRIPE', 'MANUAL') NULL DEFAULT NULL` to the `bookings` table schema. `NULL` represents legacy bookings or bookings where payment hasn't been processed yet. Add an index `idx_payment_method` for query performance.

---

**File**: `service/src/routes/checkout.routes.ts`

**Change**: Set `payment_method = 'STRIPE'` when Stripe confirms payment

**Specific Changes**:
3. **Update Stripe verification queries**: In both `GET /api/checkout/session/:sessionId` and `POST /api/checkout/verify-payment`, update the booking UPDATE query from `SET status = 'CONFIRMED', payment_status = 'PAID'` to `SET status = 'CONFIRMED', payment_status = 'PAID', payment_method = 'STRIPE'`.

---

**File**: `service/src/features/hotel/routes/hotel.routes.ts`

**Change**: Set `payment_method = 'MANUAL'` when hotel manager marks payment

**Specific Changes**:
4. **Update manual payment marking query**: In `PATCH /api/hotels/bookings/:id/payment-status`, update the booking UPDATE query to also set `payment_method = 'MANUAL'` when `paymentStatus = 'PAID'`. When payment status is changed to something other than PAID, `payment_method` should be set to `NULL`.

---

**File**: `service/src/routes/user.routes.ts`

**Change**: Filter earnings query by `payment_method`

**Specific Changes**:
5. **Filter earnings by Stripe payments only**: Update the bookings query in `GET /api/users/me/earnings` to add a condition that only includes bookings where `payment_method = 'STRIPE'` when calculating earnings. Bookings with `payment_method = 'MANUAL'` or `NULL` should be excluded from earnings totals. Alternatively, include all bookings in the response but only count `payment_method = 'STRIPE'` bookings in the summary totals, so the host can see all bookings but earnings reflect only verified payments.

---

**File**: `service/database/seed-william-smith.sql`

**Change**: Update seed bookings with appropriate `payment_method` values

**Specific Changes**:
6. **Set `payment_method` on seed bookings**: Update the existing seed booking INSERTs to include `payment_method = 'MANUAL'` for the 2 PAID bookings (since they were manually marked, not Stripe-verified). The 5 PENDING bookings should have `payment_method = NULL`.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that query the agents table and earnings endpoint to observe the broken mapping and unfiltered payment counting. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Agent Mapping Test**: Query `SELECT user_id FROM agents WHERE id = 'agent-10'` and assert it equals `'agent-010'` (will fail on unfixed code — returns `'556e10c0-...'`)
2. **Earnings Resolution Test**: Call `GET /api/users/me/earnings` as William Smith and assert earnings array is non-empty (will fail on unfixed code — returns empty array)
3. **Payment Method Column Test**: Query `SHOW COLUMNS FROM bookings LIKE 'payment_method'` and assert column exists (will fail on unfixed code — column doesn't exist)
4. **Manual Payment Exclusion Test**: Mark a booking as PAID via hotel manager endpoint, then call earnings endpoint and assert the booking is excluded from totals (will fail on unfixed code — booking is included)

**Expected Counterexamples**:
- Agent lookup returns 0 rows for user `agent-010` because `agents.user_id` is stale
- Earnings endpoint returns empty array, frontend falls back to customer bookings
- No `payment_method` column exists, so all PAID bookings are treated identically
- Possible causes: stale `ON DUPLICATE KEY UPDATE`, missing schema column

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
// Bug 1: Agent mapping
FOR ALL request WHERE user has agent record with mismatched user_id DO
  // After seed fix, user_id should match
  result := getEarnings'(request)
  ASSERT result.earnings.length > 0
  ASSERT result includes bookings from all hotels managed by agent
END FOR

// Bug 2: Manual payment exclusion
FOR ALL booking WHERE payment_status = 'PAID' AND payment_method = 'MANUAL' DO
  result := calculateEarnings'(booking)
  ASSERT booking is NOT included in earnings summary totals
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL request WHERE user has NO agent record DO
  ASSERT getEarnings(request) = getEarnings'(request)  // Both return empty
END FOR

FOR ALL booking WHERE payment_method = 'STRIPE' AND payment_status = 'PAID' DO
  ASSERT booking IS included in earnings totals  // Stripe payments still count
END FOR

FOR ALL booking WHERE status IN ('CANCELLED', 'REFUNDED') DO
  ASSERT booking IS NOT included in earnings totals  // Still excluded
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (various user types, payment methods, booking statuses)
- It catches edge cases that manual unit tests might miss (e.g., NULL payment_method, mixed booking states)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-host users and Stripe-paid bookings, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Non-Host Earnings Preservation**: Verify that users without agent records continue to receive empty earnings after the fix
2. **Stripe Payment Preservation**: Verify that Stripe-verified bookings continue to be included in earnings after the fix
3. **Cancelled Booking Preservation**: Verify that cancelled/refunded bookings continue to be excluded from earnings
4. **Frontend Display Preservation**: Verify that the payments page continues to categorize bookings as PENDING/AVAILABLE correctly

### Unit Tests

- Test agent lookup with correct `user_id` mapping returns the agent record
- Test agent lookup with non-existent user returns empty results
- Test earnings query with `payment_method = 'STRIPE'` filter includes only Stripe bookings
- Test earnings query excludes `payment_method = 'MANUAL'` bookings from totals
- Test earnings query excludes `payment_method = NULL` bookings from totals
- Test Stripe verification endpoint sets `payment_method = 'STRIPE'`
- Test hotel manager payment-status endpoint sets `payment_method = 'MANUAL'`
- Test edge case: booking with `payment_status = 'PENDING'` and `payment_method = NULL`

### Property-Based Tests

- Generate random combinations of booking statuses and payment methods, verify only `payment_method = 'STRIPE'` with `payment_status = 'PAID'` bookings are counted in earnings
- Generate random user IDs with and without agent records, verify non-host users always get empty earnings
- Generate random sets of bookings across multiple hotels, verify earnings totals match the sum of only Stripe-verified bookings

### Integration Tests

- Test full flow: create booking → pay via Stripe → verify earnings include the booking with `payment_method = 'STRIPE'`
- Test full flow: create booking → hotel manager marks as PAID → verify earnings exclude the booking
- Test William Smith login → payments page → verify correct earnings display with 7 bookings, only Stripe-verified ones in totals
- Test that the management UI still shows manually-marked bookings as PAID
