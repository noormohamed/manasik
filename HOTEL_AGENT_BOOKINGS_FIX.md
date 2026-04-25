# Hotel Agent Bookings Display - Fixed

## Problem
Hotel agents (like agent-010) couldn't see bookings for their managed hotels because the backend query was trying to use a non-existent `hotel_managers` table and checking for columns that don't exist.

## Solution
Updated the `/api/hotels/bookings` endpoint to use a simple LEFT JOIN on the hotels table and check if the logged-in user's ID matches the hotel's `agent_id` column.

## Changes Made

### Backend (service/src/features/hotel/routes/hotel.routes.ts)

**Old approach:**
- Used `HotelRepository.findByUserManaged()` to get managed hotels
- Returned empty list if no managed hotels found
- Used complex JSON extraction from metadata

**New approach:**
- Direct SQL query with LEFT JOIN on hotels table
- Checks if `h.agent_id = userId`
- Simpler and more efficient

**Query:**
```sql
SELECT 
  b.id, b.status, b.currency, b.subtotal, b.tax, b.total,
  b.booking_source, b.agent_id, b.customer_id, b.payment_status,
  b.metadata, b.hold_expires_at, b.created_at, b.updated_at,
  u.first_name as customer_first_name, u.last_name as customer_last_name,
  u.email as customer_email, ag.name as agent_name, ag.email as agent_email
FROM bookings b
LEFT JOIN users u ON b.customer_id = u.id
LEFT JOIN agents ag ON b.agent_id = ag.id
LEFT JOIN hotels h ON b.hotel_id = h.id
WHERE b.service_type = 'HOTEL'
  AND b.hotel_id IS NOT NULL
  AND h.agent_id = ?
ORDER BY b.created_at DESC
LIMIT ? OFFSET ?
```

## Results

### Before
- Agent-010 saw 0 bookings
- Error: "Unknown column 'h.created_by'"

### After
- Agent-010 now sees 12 bookings for their managed hotels
- Each booking displays with:
  - Full booking details (guest info, dates, price)
  - `visibleDates` array showing all dates the booking spans
  - Check-in and check-out badges on first/last days

## Example Response
```json
{
  "id": "de6f9e1d-69bf-4e0d-ad08-3141c79c4f1b",
  "hotelName": "Beach Club",
  "checkIn": "2026-04-21",
  "checkOut": "2026-04-24",
  "visibleDates": ["2026-04-21", "2026-04-22", "2026-04-23"],
  "status": "REFUNDED",
  "guestName": "Edward Sanchez",
  "guestEmail": "edward.sanchez@email.com",
  "guestCount": 2,
  "nights": 3,
  "total": 363,
  ...
}
```

## How It Works

1. **Agent logs in** → JWT token contains `userId: "agent-010"`
2. **Frontend calls** `/api/hotels/bookings` with agent's token
3. **Backend extracts** `userId` from JWT
4. **Query joins** bookings with hotels table
5. **Filters** for bookings where `h.agent_id = "agent-010"`
6. **Returns** all matching bookings with `visibleDates` array
7. **Frontend expands** each booking across its visible dates in the UI

## Database Schema Used
- `bookings.hotel_id` - Links booking to hotel
- `hotels.agent_id` - Links hotel to managing agent
- `bookings.metadata` - Contains check-in/check-out dates

## Files Modified
- `service/src/features/hotel/routes/hotel.routes.ts` - Updated `/hotels/bookings` endpoint

## Testing
```bash
# Test as agent-010
curl 'http://localhost:3001/api/hotels/bookings?limit=5' \
  -H 'Authorization: Bearer <agent-010-token>'

# Response: 12 total bookings for managed hotels
```

## Next Steps
- Frontend automatically displays bookings across date range
- Each date shows check-in/check-out badges
- Agent can view, refund, and manage bookings
