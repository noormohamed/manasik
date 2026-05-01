# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Agent Mapping & Manual Payment Earnings Bug
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Setup**: Install `fast-check` in the service package (`npm install --save-dev fast-check`) if not already present
  - **Test file**: `service/src/__tests__/payments-earnings-bug.property.test.ts`
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases for reproducibility
  - **Bug 1 — Agent Mapping**: Query `SELECT user_id FROM agents WHERE id = 'agent-10'` and assert it equals `'agent-010'`. On unfixed code, `user_id` is `'556e10c0-c6c1-48d5-9c73-c17beffc02d6'` due to stale `ON DUPLICATE KEY UPDATE` in `seed-william-smith.sql`
  - **Bug 2 — Manual Payment in Earnings**: Assert that `payment_method` column exists on `bookings` table. On unfixed code, column does not exist. Then assert that for any booking where `payment_method = 'MANUAL'`, the earnings endpoint excludes it from totals. On unfixed code, all PAID bookings are counted regardless of payment source
  - **Property**: For all bookings where `isBugCondition(input)` holds (agent `user_id` mismatch OR manually-marked payment), the fixed earnings endpoint should resolve the agent correctly AND exclude manual payments from totals
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., "agent-10 has user_id '556e10c0-...' instead of 'agent-010'", "no payment_method column exists on bookings table")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Earnings Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - **Test file**: `service/src/__tests__/payments-earnings-preservation.property.test.ts`
  - **Setup**: Ensure `fast-check` is installed in the service package
  - **Observe on UNFIXED code**:
    - Non-host users (no agent record) requesting earnings receive empty results with zero totals
    - Cancelled/refunded bookings are excluded from earnings calculations
    - Bookings are categorized as PENDING (not checked out) or AVAILABLE (checked out + confirmed/completed)
    - Stripe-verified PAID bookings with confirmed status are included in earnings
  - **Write property-based tests**:
    - Property: For all users without an agent record, `GET /api/users/me/earnings` returns `{ earnings: [], summary: { totalCredits: 0, pendingCredits: 0, availableCredits: 0, pendingBookings: 0, completedBookings: 0 } }`
    - Property: For all bookings with `status IN ('CANCELLED', 'REFUNDED')`, the booking is NOT included in earnings totals
    - Property: For all non-cancelled bookings, status is categorized as AVAILABLE (checked out + confirmed) or PENDING (otherwise)
    - Property: For all bookings with `payment_method = 'STRIPE'` and `payment_status = 'PAID'`, the booking IS included in earnings totals (this property will be validated after fix)
  - Verify tests pass on UNFIXED code (for the observable behaviors)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 3. Fix payments calculation bugs

  - [x] 3.1 Fix seed SQL agent-user mapping
    - Update `service/database/seed-william-smith.sql` `ON DUPLICATE KEY UPDATE` clause for the agents INSERT to include `user_id = 'agent-010'`
    - Change from: `ON DUPLICATE KEY UPDATE name = 'William Smith', email = 'agent-10@bookingplatform.com'`
    - Change to: `ON DUPLICATE KEY UPDATE user_id = 'agent-010', name = 'William Smith', email = 'agent-10@bookingplatform.com'`
    - _Bug_Condition: isBugCondition(input) where agent.user_id ≠ input.userId due to stale ON DUPLICATE KEY UPDATE_
    - _Expected_Behavior: Agent lookup resolves correctly, returning agent-10 for user agent-010_
    - _Preservation: Non-host users still get empty earnings; other agent records unaffected_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Add payment_method column to bookings table
    - Update `service/database/init.sql` to add `payment_method ENUM('STRIPE', 'MANUAL') NULL DEFAULT NULL` to the `bookings` table
    - Add after the `broker_notes TEXT NULL` column
    - Add index `INDEX idx_payment_method (payment_method)` for query performance
    - _Bug_Condition: No column exists to distinguish Stripe-verified from manually-marked payments_
    - _Expected_Behavior: payment_method column tracks payment source as 'STRIPE' or 'MANUAL', NULL for legacy/unpaid_
    - _Preservation: Existing bookings get NULL payment_method (no data loss); table schema is backward compatible_
    - _Requirements: 2.3_

  - [x] 3.3 Set payment_method='STRIPE' in checkout verification
    - Update `service/src/routes/checkout.routes.ts`
    - In `GET /api/checkout/session/:sessionId`: change booking UPDATE query from `SET status = 'CONFIRMED', payment_status = 'PAID', updated_at = NOW()` to `SET status = 'CONFIRMED', payment_status = 'PAID', payment_method = 'STRIPE', updated_at = NOW()`
    - In `POST /api/checkout/verify-payment`: change booking UPDATE query from `SET status = 'CONFIRMED', payment_status = 'PAID', updated_at = NOW()` to `SET status = 'CONFIRMED', payment_status = 'PAID', payment_method = 'STRIPE', updated_at = NOW()`
    - _Bug_Condition: Stripe payments set payment_status='PAID' but no payment_method, indistinguishable from manual_
    - _Expected_Behavior: Stripe-verified payments set payment_method='STRIPE' alongside payment_status='PAID'_
    - _Preservation: Stripe payment flow continues to mark bookings as PAID and CONFIRMED (requirement 3.2)_
    - _Requirements: 2.3, 3.2_

  - [x] 3.4 Set payment_method='MANUAL' in hotel management payment-status endpoint
    - Update `service/src/features/hotel/routes/hotel.routes.ts`
    - In `PATCH /api/hotels/bookings/:id/payment-status`: update the booking UPDATE query to also set `payment_method = 'MANUAL'` when `paymentStatus = 'PAID'`, and `payment_method = NULL` otherwise
    - Change from: `SET payment_status = ?, status = ?, updated_at = NOW()`
    - Change to: `SET payment_status = ?, status = ?, payment_method = CASE WHEN ? = 'PAID' THEN 'MANUAL' ELSE NULL END, updated_at = NOW()`
    - Pass `paymentStatus` as an additional bind parameter for the CASE expression
    - _Bug_Condition: Manual payment marking sets same payment_status='PAID' as Stripe with no distinction_
    - _Expected_Behavior: Manual payment marking sets payment_method='MANUAL' to distinguish from Stripe_
    - _Preservation: Hotel managers can still mark bookings as PAID; payment_status still updated for management UI (requirement 3.3)_
    - _Requirements: 2.3, 3.3_

  - [x] 3.5 Filter earnings endpoint by payment_method='STRIPE'
    - Update `service/src/routes/user.routes.ts`
    - In `GET /api/users/me/earnings`: update the bookings query to add `AND b.payment_method = 'STRIPE'` to the WHERE clause
    - This ensures only Stripe-verified bookings are included in earnings calculations
    - Bookings with `payment_method = 'MANUAL'` or `NULL` are excluded from earnings totals
    - _Bug_Condition: Earnings query counts ALL non-cancelled bookings regardless of payment source_
    - _Expected_Behavior: Earnings query only counts bookings where payment_method='STRIPE'_
    - _Preservation: Cancelled/refunded bookings still excluded; booking categorization (PENDING/AVAILABLE) unchanged (requirements 3.4, 3.5)_
    - _Requirements: 2.4, 3.2, 3.5_

  - [x] 3.6 Update seed bookings with payment_method values
    - Update `service/database/seed-william-smith.sql`
    - Add `payment_method` column to the INSERT statements for the 2 PAID seed bookings (`booking-0030`, `booking-0050`) with value `'MANUAL'`
    - The refunded booking (`booking-0010`) and any PENDING bookings should have `payment_method = NULL` (default)
    - Also update the `ON DUPLICATE KEY UPDATE` clauses for these bookings to include `payment_method` updates
    - _Bug_Condition: Seed bookings have payment_status='PAID' but no payment_method, counted in earnings incorrectly_
    - _Expected_Behavior: Seed PAID bookings marked as payment_method='MANUAL' are excluded from earnings_
    - _Preservation: Seed data still creates valid bookings; management UI still shows them as PAID_
    - _Requirements: 2.3, 2.4_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Agent Mapping & Manual Payment Earnings Bug
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied:
      - Agent `agent-10` has `user_id = 'agent-010'`
      - `payment_method` column exists on `bookings` table
      - Manually-marked bookings are excluded from earnings totals
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Earnings Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npm test` in the `service/` directory
  - Ensure all existing tests pass (no regressions)
  - Ensure bug condition exploration test (task 1) now passes
  - Ensure preservation property tests (task 2) still pass
  - Verify the database schema change is compatible with existing code
  - Ask the user if questions arise
