# Hotel Manager Refund Management Feature

## Overview
Added comprehensive refund management functionality for hotel managers to process refunds directly from their booking management dashboard.

## Changes Made

### Backend Changes

#### 1. New Endpoint: `POST /api/hotels/bookings/:id/refund`
**Location**: `service/src/features/hotel/routes/hotel.routes.ts`

**Purpose**: Allows hotel managers to process refunds for bookings at their hotels

**Authentication**: Required (authMiddleware)

**Authorization**: Only hotel managers can refund bookings for their hotels

**Request Body**:
```json
{
  "amount": 100.50,
  "reason": "Guest requested cancellation"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund": {
    "bookingId": "booking-id",
    "amount": 100.50,
    "totalRefund": 100.50,
    "isFullRefund": false,
    "reason": "Guest requested cancellation",
    "refundedAt": "2026-04-18T10:30:00.000Z"
  }
}
```

**Features**:
- Validates hotel manager ownership of the booking
- Supports partial and full refunds
- Tracks cumulative refund amounts
- Automatically updates booking status to REFUNDED if full refund
- Records refund reason and timestamp

### Frontend Changes

#### 1. Enhanced Booking Details Modal
**Location**: `frontend/src/components/Dashboard/DashboardBookingsContent.tsx`

**New State Variables**:
- `showRefundModal`: Controls refund modal visibility
- `refundAmount`: Stores the refund amount input
- `refundReason`: Stores the refund reason
- `processingRefund`: Tracks refund processing state

**New Functions**:
- `handleOpenRefundModal()`: Opens refund modal with pre-filled max refund amount
- `handleCloseRefundModal()`: Closes refund modal and clears inputs
- `handleProcessRefund()`: Validates and submits refund request

**UI Enhancements**:
1. **Process Refund Button**: Added to booking details modal footer
   - Only visible for CONFIRMED bookings
   - Opens refund modal when clicked
   - Yellow warning color to indicate refund action

2. **Refund Modal**: New modal dialog with:
   - Booking summary (ID, guest name, original total)
   - Already refunded amount display (if applicable)
   - Refund amount input with currency selector
   - Maximum refund validation
   - Remaining amount calculation
   - Refund reason textarea
   - Full/Partial refund type indicator
   - Process button with loading state

**Validation**:
- Refund amount must be positive
- Refund amount cannot exceed remaining balance
- Refund reason is required
- All fields must be filled before processing

**User Feedback**:
- Success alert on successful refund
- Error alert on failure
- Loading spinner during processing
- Real-time remaining amount calculation

## Usage Flow

### For Hotel Managers:

1. **Navigate to Bookings**: Go to `/dashboard/bookings/`
2. **View Booking Details**: Click "View Details" on any booking
3. **Open Refund Modal**: Click "Process Refund" button (only for CONFIRMED bookings)
4. **Enter Refund Details**:
   - Adjust refund amount (pre-filled with max available)
   - Enter reason for refund
5. **Process**: Click "Process Refund" button
6. **Confirmation**: Success message appears, modal closes, bookings list refreshes

## Refund Logic

### Refund Amount Calculation
- Maximum refund = Total - Already Refunded
- Partial refund: Amount < Maximum
- Full refund: Amount >= Maximum

### Booking Status Updates
- If full refund: Status changes to REFUNDED
- If partial refund: Status remains CONFIRMED (or current status)

### Refund Tracking
- `refund_amount`: Cumulative refund amount
- `refund_reason`: Reason for refund
- `refunded_at`: Timestamp of refund

## Security

### Authorization Checks
- User must be authenticated
- User must be the hotel manager (verified via `isUserManagingHotel`)
- Only bookings for managed hotels can be refunded

### Validation
- Refund amount must be positive and within limits
- Reason is required
- Booking must exist and belong to user's hotel

## Display Updates

### Booking List
- Refund status already displayed with badges
- Shows "Full Refund" or "Partial (amount)" badges
- Displays adjusted pricing with refund deduction

### Booking Details Modal
- Shows refund information if refund exists
- Displays refund reason and date
- Shows net amount after refund

## Integration Points

### API Endpoints Used
- `POST /hotels/bookings/:id/refund` - Process refund
- `GET /hotels/bookings` - Fetch bookings (already existed)

### Frontend Components
- DashboardBookingsContent: Main bookings management page
- Modal dialogs for details and refund processing

### Database Updates
- `bookings` table: Updates refund_amount, refund_reason, refunded_at, status

## Testing Recommendations

1. **Happy Path**: Process full and partial refunds
2. **Validation**: Test with invalid amounts and missing reasons
3. **Authorization**: Verify non-managers cannot refund
4. **Edge Cases**: 
   - Multiple partial refunds totaling full amount
   - Refund on already refunded booking
   - Refund on cancelled booking
5. **UI**: Verify modal opens/closes correctly, calculations are accurate

## Future Enhancements

1. Refund history/audit trail
2. Automatic refund to payment method
3. Refund approval workflow
4. Bulk refund operations
5. Refund templates/presets
6. Email notifications to guests
7. Refund analytics and reporting
