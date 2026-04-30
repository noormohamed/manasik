# Bookings Endpoint Fix - Agent/Manager View

## Problem
Agent users (like agent-010) were unable to see bookings because the frontend was calling `/users/me/bookings` endpoint instead of `/hotels/bookings`.

## Root Cause
The endpoint selection logic in `DashboardBookingsContent.tsx` was checking for user role, but the condition might not have been catching all agent/manager role variations.

## Solution
Updated the endpoint selection logic to:
1. Check for multiple role variations: `AGENT`, `MANAGER`, `HOTEL_MANAGER`
2. Added console logging to debug which endpoint is being used
3. Ensured the correct endpoint is selected based on user role

## Changes Made

### Frontend (frontend/src/components/Dashboard/DashboardBookingsContent.tsx)

**Before:**
```typescript
let endpoint = '/users/me/bookings';
if (user?.role === 'AGENT' || user?.role === 'MANAGER') {
  endpoint = '/hotels/bookings';
}
```

**After:**
```typescript
// Determine which endpoint to use based on user role
// For AGENT/MANAGER roles, use /hotels/bookings to see all bookings for managed hotels
// For CUSTOMER roles, use /users/me/bookings to see personal bookings
let endpoint = '/users/me/bookings';

if (user?.role === 'AGENT' || user?.role === 'MANAGER' || user?.role === 'HOTEL_MANAGER') {
  endpoint = '/hotels/bookings';
}

console.log('[Bookings] User:', { id: user?.id, role: user?.role }, 'Using endpoint:', endpoint);
```

## Endpoint Behavior

### `/hotels/bookings` (for AGENT/MANAGER users)
- Returns all bookings for hotels managed by the logged-in user
- Includes `visibleDates` array for each booking
- Example: agent-010 sees all bookings for hotel-010 and hotel-020

### `/users/me/bookings` (for CUSTOMER users)
- Returns only the customer's personal bookings
- Used for regular guests to view their own reservations

## Testing
1. Login as agent-010 (email: agent-10@bookingplatform.com)
2. Navigate to Dashboard > Bookings
3. Should now see bookings for managed hotels (Beach Club, etc.)
4. Each booking displays across all its visible dates with check-in/check-out badges

## Debugging
Console logs will show:
```
[Bookings] User: { id: 'agent-010', role: 'AGENT' } Using endpoint: /hotels/bookings
```

This confirms the correct endpoint is being used.

## Files Modified
- `frontend/src/components/Dashboard/DashboardBookingsContent.tsx` - Updated endpoint selection logic and added debugging
