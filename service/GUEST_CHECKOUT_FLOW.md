# Guest Checkout Flow

## Overview

Guests can browse, add items to cart, and see totals **without logging in**. When they're ready to checkout or decide to create an account, their session seamlessly converts to an authenticated user.

## Guest User ID Format

Guest users are identified with a special ID format:
```
guest-{uuid}
Example: guest-550e8400-e29b-41d4-a716-446655440000
```

This format allows the system to:
- Distinguish guests from authenticated users
- Track guest sessions in the database
- Migrate sessions when guests log in

## Session Flow

### 1. Guest Browsing (No Login)

```
Guest visits website
↓
sessionMiddleware runs
↓
No JWT token found
↓
Check for guest_user_id cookie
↓
Cookie not found → Create new guest-{uuid}
↓
Set httpOnly cookie: guest_user_id=guest-{uuid}
↓
ctx.state.userId = "guest-{uuid}"
ctx.state.isGuest = true
```

### 2. Guest Adds Items to Cart

```
POST /api/guest/checkout/items
{
  "id": "hotel-booking-123",
  "serviceType": "HOTEL",
  "quantity": 1,
  "pricePerUnit": 1500,
  "subtotal": 1500,
  "tax": 300,
  "total": 1800,
  ...
}

Response:
{
  "success": true,
  "data": {
    "id": "checkout-session-123",
    "sessionId": "guest-550e8400-e29b-41d4-a716-446655440000",
    "bookingItems": [...],
    "itemCount": 1,
    "subtotal": 1500,
    "totalTax": 300,
    "finalTotal": 1800,
    "isGuest": true
  }
}
```

### 3. Guest Views Cart Summary

```
GET /api/guest/checkout/summary

Response:
{
  "success": true,
  "data": {
    "itemCount": 2,
    "subtotal": 3000,
    "totalTax": 600,
    "discountAmount": 0,
    "finalTotal": 3600,
    "currency": "GBP",
    "items": [...]
  }
}
```

### 4. Guest Logs In

```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "accessToken": "jwt-token-with-userId",
  "userId": "user-123"
}
```

### 5. Guest Session Converts to Authenticated

```
POST /api/guest/login-and-convert
{
  "userId": "user-123"
}

Flow:
1. Get guest session (guest-{uuid})
2. Migrate session to authenticated user (user-123)
3. Delete temporary guest user record
4. Clear guest_user_id cookie
5. Return migrated session with all items preserved

Response:
{
  "success": true,
  "message": "Session converted to authenticated user",
  "data": {
    "id": "checkout-session-123",
    "sessionId": "guest-550e8400-e29b-41d4-a716-446655440000",
    "customerId": "user-123",
    "bookingItems": [...],
    "itemCount": 2,
    "subtotal": 3000,
    "totalTax": 600,
    "finalTotal": 3600,
    "isGuest": false
  }
}
```

### 6. Authenticated User Continues Shopping

```
GET /api/guest/checkout
Headers: Authorization: Bearer jwt-token

sessionMiddleware runs:
↓
JWT token found
↓
Extract userId from JWT: "user-123"
↓
ctx.state.userId = "user-123"
ctx.state.isAuthenticated = true
ctx.state.isGuest = false

Response:
{
  "success": true,
  "data": {
    "id": "checkout-session-123",
    "customerId": "user-123",
    "bookingItems": [...],
    "itemCount": 2,
    "subtotal": 3000,
    "totalTax": 600,
    "finalTotal": 3600,
    "isGuest": false
  },
  "isGuest": false,
  "userId": "user-123"
}
```

## Database Schema

### Guest User Record
```sql
users {
  id: "guest-550e8400-e29b-41d4-a716-446655440000",
  first_name: "Guest",
  last_name: "User",
  email: "guest-550e8400-e29b-41d4-a716-446655440000@guest.local",
  password_hash: "",
  role: "CUSTOMER",
  is_active: true,
  created_at: timestamp
}
```

### Checkout Session Record
```sql
checkout_sessions {
  id: "checkout-session-123",
  sessionId: "guest-550e8400-e29b-41d4-a716-446655440000",
  customerId: null (until conversion),
  email: null,
  bookingItems: JSON array,
  subtotal: 1500,
  totalTax: 300,
  discountAmount: 0,
  finalTotal: 1800,
  currency: "GBP",
  status: "ACTIVE",
  isGuest: true,
  expiresAt: timestamp (30 mins from now),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### After Conversion
```sql
checkout_sessions {
  id: "checkout-session-123",
  sessionId: "guest-550e8400-e29b-41d4-a716-446655440000",
  customerId: "user-123",  // ← Updated
  email: null,
  bookingItems: JSON array,  // ← Preserved
  subtotal: 1500,
  totalTax: 300,
  discountAmount: 0,
  finalTotal: 1800,
  currency: "GBP",
  status: "ACTIVE",
  isGuest: false,  // ← Updated
  expiresAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## API Endpoints

All endpoints work for both guests and authenticated users:

### Get Checkout Session
```
GET /api/guest/checkout
No authentication required
Returns: Current session or creates new one
```

### Add Item to Cart
```
POST /api/guest/checkout/items
Body: { id, serviceType, quantity, pricePerUnit, subtotal, tax, total, ... }
No authentication required
```

### Remove Item from Cart
```
DELETE /api/guest/checkout/items/:bookingId
No authentication required
```

### Update Item Quantity
```
PATCH /api/guest/checkout/items/:bookingId/quantity
Body: { quantity: 2 }
No authentication required
```

### Apply Discount Code
```
POST /api/guest/checkout/discount
Body: { discountCode: "WELCOME10" }
No authentication required
```

### Clear Discount Code
```
DELETE /api/guest/checkout/discount
No authentication required
```

### Get Cart Summary
```
GET /api/guest/checkout/summary
No authentication required
Returns: itemCount, subtotal, tax, discount, total
```

### Convert Guest to Authenticated
```
POST /api/guest/login-and-convert
Body: { userId: "user-123" }
Called after successful login
Migrates session and deletes guest user record
```

## Cookies

### Guest User ID Cookie
```
Name: guest_user_id
Value: guest-{uuid}
MaxAge: 30 days
HttpOnly: true
Secure: true (production only)
SameSite: lax
```

The cookie is automatically sent with every request, allowing the system to identify the guest.

## Session Middleware Logic

```typescript
if (JWT token exists) {
  // Authenticated user
  sessionId = userId from JWT
  isAuthenticated = true
  isGuest = false
} else {
  // Guest user
  if (guest_user_id cookie exists) {
    sessionId = cookie value (guest-{uuid})
  } else {
    sessionId = generate new guest-{uuid}
    set cookie
  }
  isAuthenticated = false
  isGuest = true
}
```

## Complete User Journey

### Scenario: Guest browses, adds items, then logs in

```
1. Guest visits website
   → sessionMiddleware creates guest-{uuid}
   → Sets guest_user_id cookie

2. Guest views hotels
   → GET /api/hotels
   → No authentication needed

3. Guest adds hotel to cart
   → POST /api/guest/checkout/items
   → Session created with guest-{uuid}
   → Items stored in database

4. Guest adds another hotel
   → POST /api/guest/checkout/items
   → Same session retrieved (guest-{uuid})
   → New item added

5. Guest views cart total
   → GET /api/guest/checkout/summary
   → Shows: 2 items, £3000 subtotal, £600 tax, £3600 total

6. Guest clicks "Login"
   → Redirected to login page

7. Guest logs in
   → POST /api/auth/login
   → Returns JWT with userId: "user-123"

8. Frontend calls conversion endpoint
   → POST /api/guest/login-and-convert
   → Body: { userId: "user-123" }
   → Session migrated: customerId = "user-123", isGuest = false
   → Guest user record deleted
   → guest_user_id cookie cleared

9. Guest (now authenticated) continues shopping
   → GET /api/guest/checkout
   → Headers: Authorization: Bearer jwt-token
   → sessionMiddleware extracts userId from JWT
   → Same session retrieved (now with customerId = "user-123")
   → All items preserved

10. Authenticated user completes checkout
    → POST /api/guest/checkout/complete
    → Session marked as COMPLETED
    → Bookings created from session items
```

## Key Features

✅ **No Login Required**: Guests can add items and see totals immediately
✅ **Persistent Cart**: Items saved in database, survive page refreshes
✅ **Seamless Conversion**: Guest session converts to authenticated without losing data
✅ **Dummy User ID**: guest-{uuid} format for easy identification
✅ **Cookie-Based**: httpOnly cookie prevents XSS attacks
✅ **Automatic Cleanup**: Expired sessions cleaned up automatically
✅ **Same API**: Both guests and authenticated users use same endpoints

## Security Considerations

1. **httpOnly Cookies**: Guest ID not accessible from JavaScript
2. **Secure Flag**: Cookies only sent over HTTPS in production
3. **SameSite**: Prevents CSRF attacks
4. **Session Expiry**: 30 minutes of inactivity
5. **Temporary Guest Records**: Deleted after conversion
6. **No Password**: Guest accounts have empty password_hash
