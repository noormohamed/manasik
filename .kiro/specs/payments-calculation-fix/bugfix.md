# Bugfix Requirements Document

## Introduction

The payments page at `/payments/` displays incorrect earnings calculations for hotel host William Smith. Two distinct bugs prevent correct operation: (1) a broken agent-user mapping in the database seed causes the earnings endpoint to return empty results, and (2) the earnings endpoint does not distinguish between bookings paid via Stripe checkout and bookings manually marked as PAID by hotel staff, causing manually-marked bookings to incorrectly count toward host earnings.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a host user (William Smith, user ID `agent-010`) requests their earnings via `GET /api/users/me/earnings` THEN the system returns empty earnings because the `agents` table has `user_id = '556e10c0-c6c1-48d5-9c73-c17beffc02d6'` instead of `user_id = 'agent-010'`, so the query `SELECT id FROM agents WHERE user_id = ?` finds no matching agent record

1.2 WHEN the earnings endpoint returns empty results THEN the frontend falls back to fetching `/users/me/bookings` which shows William Smith's bookings as a CUSTOMER (not as a HOST), displaying only 1 pending booking at £1,726.15 instead of all 7 host bookings across both hotels

1.3 WHEN a hotel manager manually marks a booking as PAID via `PATCH /api/hotels/bookings/:id/payment-status` THEN the system records the same `payment_status = 'PAID'` value as Stripe-verified payments, with no way to distinguish the payment source

1.4 WHEN the earnings endpoint calculates host earnings THEN the system counts ALL non-cancelled bookings regardless of whether payment was received via Stripe or manually marked by staff, causing manually-marked-as-PAID bookings to be included in earnings calculations

### Expected Behavior (Correct)

2.1 WHEN a host user requests their earnings via `GET /api/users/me/earnings` THEN the system SHALL correctly resolve the agent record by matching the logged-in user's ID to the `agents.user_id` column, returning earnings for all hotels managed by that agent

2.2 WHEN the earnings endpoint successfully resolves the agent THEN the system SHALL return all bookings across all hotels managed by that agent (e.g., 7 bookings across Beach Club and Countryside Lodge for William Smith)

2.3 WHEN a hotel manager manually marks a booking as PAID THEN the system SHALL record the payment source as manual/staff-initiated, distinguishing it from Stripe-verified payments

2.4 WHEN the earnings endpoint calculates host earnings THEN the system SHALL only count bookings where payment was verified through Stripe checkout, excluding bookings that were manually marked as PAID by hotel staff

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user who is not a host requests earnings THEN the system SHALL CONTINUE TO return empty earnings with zero totals

3.2 WHEN bookings are paid via Stripe checkout and the checkout session is verified THEN the system SHALL CONTINUE TO mark those bookings as PAID and include them in host earnings calculations

3.3 WHEN a hotel manager marks a booking as PAID via the management UI THEN the system SHALL CONTINUE TO update the booking's payment_status to PAID (for display purposes in the management interface)

3.4 WHEN the frontend receives a successful earnings response with booking data THEN the system SHALL CONTINUE TO categorize bookings as PENDING (not yet checked out) or AVAILABLE (checked out and confirmed/completed)

3.5 WHEN a booking is cancelled or refunded THEN the system SHALL CONTINUE TO exclude it from earnings calculations

---

## Bug Condition (Formal)

### Bug 1: Broken Agent-User Mapping

```pascal
FUNCTION isBugCondition_AgentMapping(X)
  INPUT: X of type EarningsRequest (userId, agentsTable)
  OUTPUT: boolean
  
  // Returns true when the user has an agent record but user_id doesn't match
  agent ← FIND agent IN agentsTable WHERE agent.id CORRESPONDS TO user X
  RETURN agent EXISTS AND agent.user_id ≠ X.userId
END FUNCTION
```

```pascal
// Property: Fix Checking - Agent Mapping Resolution
FOR ALL X WHERE isBugCondition_AgentMapping(X) DO
  result ← getEarnings'(X)
  ASSERT result.earnings.length > 0 AND result includes all hotel bookings for the agent
END FOR
```

### Bug 2: Manual Payment Included in Earnings

```pascal
FUNCTION isBugCondition_ManualPayment(X)
  INPUT: X of type Booking
  OUTPUT: boolean
  
  // Returns true when a booking was manually marked as PAID (not via Stripe)
  RETURN X.payment_status = 'PAID' AND X.payment_source ≠ 'STRIPE'
END FUNCTION
```

```pascal
// Property: Fix Checking - Manual Payment Exclusion
FOR ALL X WHERE isBugCondition_ManualPayment(X) DO
  result ← calculateEarnings'(X)
  ASSERT X is NOT included in earnings totals
END FOR
```

### Preservation

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition_AgentMapping(X) AND NOT isBugCondition_ManualPayment(X) DO
  ASSERT getEarnings(X) = getEarnings'(X)
END FOR
```
