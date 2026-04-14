# Checkout Session Flow

## Overview

The checkout system supports both authenticated and guest users with persistent session tracking across multiple API calls.

## Session Tracking Methods

### 1. Authenticated Users (JWT Token)
- **Identifier**: `userId` from JWT token
- **Storage**: Database `checkout_sessions` table with `customerId` set
- **Persistence**: Across all requests with valid JWT token
- **Expiry**: 30 minutes of inactivity

**Flow:**
```
User Login → JWT Token (userId) → Add to Cart → sessionId = userId
Multiple API calls → All use same userId → Same checkout session
```

### 2. Guest Users (Session Cookie)
- **Identifier**: UUID stored in `checkout_session_id` cookie
- **Storage**: Database `checkout_sessions` table with `isGuest = true`
- **Persistence**: Across all requests with valid session cookie
- **Expiry**: 30 days (cookie) or 30 minutes of inactivity (session)

**Flow:**
```
Guest Browse → No JWT → sessionMiddleware creates UUID
UUID stored in httpOnly cookie → Add to Cart → sessionId = UUID
Multiple API calls → Cookie sent automatically → Same checkout session
```

### 3. Guest to Authenticated Conversion
When a guest user logs in, their session is migrated to authenticated:

**Flow:**
```
Guest adds items → sessionId = UUID (guest)
Guest logs in → JWT token issued (userId)
migrateGuestToUser(UUID, userId) called
Session updated: customerId = userId, isGuest = false
Future requests use userId as sessionId
```

## Database Schema

```sql
checkout_sessions {
  id: UUID (primary key)
  sessionId: UUID (guest) or userId (authenticated)
  customerId: userId (only for authenticated)
  email: guest email (optional)
  bookingItems: JSON array
  subtotal: decimal
  totalTax: decimal
  discountAmount: decimal
  discountCode: string
  finalTotal: decimal
  currency: string
  status: ACTIVE | COMPLETED | ABANDONED | EXPIRED
  isGuest: boolean
  expiresAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

All endpoints use `sessionMiddleware` to automatically determine session ID:

### Get or Create Session
```
GET /api/checkout/session
Headers: Authorization: Bearer <JWT> (optional)
Cookies: checkout_session_id (optional)

Response:
{
  id: "checkout-123",
  sessionId: "user-123" or "uuid-456",
  bookingItems: [],
  subtotal: 0,
  totalTax: 0,
  finalTotal: 0,
  isGuest: false or true,
  ...
}
```

### Add Booking Item
```
POST /api/checkout/session/items
Body: {
  id: "hotel-booking-123",
  serviceType: "HOTEL",
  quantity: 1,
  pricePerUnit: 1500,
  subtotal: 1500,
  tax: 300,
  total: 1800,
  ...
}

Response: Updated session with new item
```

### Remove Booking Item
```
DELETE /api/checkout/session/items/:bookingId

Response: Updated session without item
```

### Update Item Quantity
```
PATCH /api/checkout/session/items/:bookingId/quantity
Body: { quantity: 2 }

Response: Updated session with recalculated totals
```

### Apply Discount
```
POST /api/checkout/session/discount
Body: { discountCode: "WELCOME10" }

Response: Updated session with discount applied
```

### Complete Checkout
```
POST /api/checkout/session/complete

Response: Session marked as COMPLETED
```

## Session Middleware

The `sessionMiddleware` automatically:

1. **Checks for JWT token** (authenticated user)
   - Extracts `userId` from JWT
   - Sets `ctx.state.sessionId = userId`
   - Sets `ctx.state.isAuthenticated = true`

2. **Checks for session cookie** (guest user)
   - Reads `checkout_session_id` cookie
   - If exists: uses UUID from cookie
   - If not exists: creates new UUID and sets cookie
   - Sets `ctx.state.sessionId = UUID`
   - Sets `ctx.state.isGuest = true`

3. **Sets context state**
   ```typescript
   ctx.state.sessionId: string // userId or UUID
   ctx.state.isAuthenticated: boolean
   ctx.state.isGuest: boolean
   ```

## Example Flows

### Authenticated User Flow
```
1. User logs in
   POST /api/auth/login
   Response: { accessToken: "jwt-token", userId: "user-123" }

2. User adds hotel to cart
   POST /api/checkout/session/items
   Headers: Authorization: Bearer jwt-token
   sessionMiddleware extracts userId from JWT
   Session created with customerId = "user-123"

3. User adds another hotel
   POST /api/checkout/session/items
   Headers: Authorization: Bearer jwt-token
   sessionMiddleware extracts userId from JWT
   Same session retrieved (customerId = "user-123")
   New item added to existing session

4. User completes checkout
   POST /api/checkout/session/complete
   Session marked as COMPLETED
```

### Guest User Flow
```
1. Guest browses hotels (no login)
   GET /api/checkout/session
   No JWT token
   sessionMiddleware creates UUID: "abc-123"
   Sets cookie: checkout_session_id=abc-123
   Session created with sessionId = "abc-123", isGuest = true

2. Guest adds hotel to cart
   POST /api/checkout/session/items
   No JWT token
   Cookie sent: checkout_session_id=abc-123
   sessionMiddleware uses UUID from cookie
   Item added to session with sessionId = "abc-123"

3. Guest logs in
   POST /api/auth/login
   Response: { accessToken: "jwt-token", userId: "user-456" }
   
4. Guest's session is migrated
   migrateGuestToUser("abc-123", "user-456")
   Session updated: customerId = "user-456", isGuest = false
   
5. Guest (now authenticated) continues shopping
   POST /api/checkout/session/items
   Headers: Authorization: Bearer jwt-token
   sessionMiddleware extracts userId from JWT
   Same session retrieved (now customerId = "user-456")
   New item added to existing session
```

### Guest to Authenticated Conversion Flow
```
1. Guest adds items to cart
   Session: { sessionId: "uuid-123", isGuest: true, bookingItems: [...] }

2. Guest logs in
   POST /api/auth/login
   Response: { accessToken: "jwt-token", userId: "user-789" }

3. Conversion happens (in login endpoint)
   checkoutSessionService.migrateGuestToUser("uuid-123", "user-789")
   
4. Session after migration
   { 
     sessionId: "uuid-123",
     customerId: "user-789",
     isGuest: false,
     bookingItems: [...] (preserved)
   }

5. All items are preserved in the session
   Guest's cart is now associated with authenticated user
```

## Cookie Details

**Cookie Name**: `checkout_session_id`

**Cookie Settings**:
- `maxAge`: 30 days (2,592,000,000 ms)
- `httpOnly`: true (not accessible from JavaScript)
- `secure`: true (only sent over HTTPS in production)
- `sameSite`: lax (sent with same-site requests)

**Why httpOnly?**
- Prevents XSS attacks from stealing session ID
- Session ID is only used server-side

## Session Expiry

Sessions expire in two ways:

1. **Cookie Expiry**: 30 days (guest sessions)
2. **Database Expiry**: 30 minutes of inactivity

When a session is accessed:
- If `expiresAt < NOW()`: session is marked as ABANDONED
- If `expiresAt > NOW()`: session is active and can be used

## Security Considerations

1. **JWT Token**: Signed and verified on each request
2. **Session Cookie**: httpOnly, secure, sameSite
3. **Database**: Foreign key constraints, indexed for performance
4. **Ownership**: All endpoints verify user owns the session
5. **Expiry**: Automatic cleanup of expired sessions

## Implementation Notes

- Session ID is the primary identifier for all operations
- For authenticated users: sessionId = userId
- For guests: sessionId = UUID (from cookie)
- Database stores both sessionId and customerId for flexibility
- Guests can be converted to authenticated without losing data
- All bookings are tied to the session, not the user
