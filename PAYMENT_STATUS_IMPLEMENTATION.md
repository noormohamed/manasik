# Payment Status Implementation

## Overview
Added refund tracking fields to the bookings table. Payment status is only displayed on the confirmation page, not on booking cards.

## Database Changes

### Migration 015: Add Refund Fields
**File**: `service/database/migrations/015-add-refund-fields.sql`

Added the following columns to the `bookings` table:
- `refund_amount` (DECIMAL): Amount refunded
- `refund_reason` (VARCHAR): Reason for refund
- `refunded_at` (TIMESTAMP): When refund was processed
- `payment_status` (ENUM): Payment state (PENDING, PAID, PARTIAL_REFUND, FULLY_REFUNDED, FAILED)

### Migration 016: Clarify Booking Status
**File**: `service/database/migrations/016-clarify-booking-status.sql`

Documentation of the booking status system:

**Booking Status** (Primary - Lifecycle):
- `PENDING`: Booking awaiting confirmation/payment
- `CONFIRMED`: Booking confirmed and active
- `COMPLETED`: Booking completed (guest checked out)
- `CANCELLED`: Booking cancelled by customer
- `REFUNDED`: Booking fully refunded

**Payment Status** (Secondary - Payment State, shown only in confirmation):
- `PENDING`: Payment not yet received
- `PAID`: Full payment received
- `PARTIAL_REFUND`: Partial refund issued
- `FULLY_REFUNDED`: Full refund issued
- `FAILED`: Payment failed

## Frontend Changes

### Updated Components
**File**: `frontend/src/components/Dashboard/DashboardBookingsContent.tsx`

1. **Removed payment status badge from booking cards**
   - Booking cards now only show booking status (COMPLETED, PENDING, etc.)
   - Payment status is only relevant in the confirmation page

2. **Booking Card Display**
   - Shows: `[REF: 6FD48D5C] [COMPLETED]`
   - Payment details are shown in the amount display (net paid, refund amount)

3. **Confirmation Page**
   - Payment status badge will be displayed here (to be implemented)
   - Shows full payment details including refund information

## API Integration

The backend endpoints will return:
```json
{
  "id": "booking-id",
  "status": "COMPLETED",
  "paymentStatus": "PARTIAL_REFUND",
  "refundAmount": 181.50,
  "refundReason": "Guest requested partial refund",
  "refundedAt": "2026-04-23T10:30:00Z",
  ...
}
```

## Display Logic

**Booking Cards** (Dashboard):
- Show booking status only
- Show net paid amount and refund amount in price display
- Reference code and status badge

**Confirmation Page**:
- Show booking status
- Show payment status badge
- Show full refund details
- Show payment breakdown

## Next Steps

1. Run migrations to add columns to database
2. Update backend endpoints to populate `payment_status` field
3. Update refund processing logic to set `payment_status` appropriately
4. Add payment status badge to confirmation page
5. Test with various booking scenarios
