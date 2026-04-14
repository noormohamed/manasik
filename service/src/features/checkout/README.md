# Checkout Feature

Complete checkout system for managing shopping carts with support for both authenticated and guest users.

## Directory Structure

```
checkout/
├── models/
│   └── checkout-session.ts       # CheckoutSession model
├── repositories/
│   └── checkout-session.repository.ts  # Database operations
├── services/
│   ├── checkout-session.service.ts     # Session management
│   └── guest-user.service.ts           # Guest user management
├── routes/
│   └── checkout.routes.ts        # API endpoints
├── types/
│   └── index.ts                  # TypeScript types
├── index.ts                      # Feature exports
└── README.md                     # This file
```

## Features

- ✅ Guest checkout without login
- ✅ Add/remove items from cart
- ✅ View cart totals (subtotal, tax, discount, final)
- ✅ Apply discount codes
- ✅ Seamless guest-to-authenticated conversion
- ✅ Persistent sessions across page refreshes
- ✅ Automatic session expiry (30 minutes)
- ✅ Support for multiple service types (HOTEL, TAXI, EXPERIENCE, etc.)

## Guest User ID Format

Guest users are identified with a special ID format:
```
guest-{uuid}
Example: guest-550e8400-e29b-41d4-a716-446655440000
```

## API Endpoints

All endpoints work for both guests and authenticated users.

### Get or Create Session
```
GET /api/checkout/session
Query: ?currency=GBP (optional)
Returns: Current session or creates new one
```

### Add Item to Cart
```
POST /api/checkout/items
Body: {
  id: string,
  serviceType: 'HOTEL' | 'TAXI' | 'EXPERIENCE' | 'FOOD' | 'CAR',
  quantity: number,
  pricePerUnit: number,
  subtotal: number,
  tax: number,
  total: number,
  metadata: object
}
```

### Remove Item from Cart
```
DELETE /api/checkout/items/:bookingId
```

### Update Item Quantity
```
PATCH /api/checkout/items/:bookingId/quantity
Body: { quantity: 2 }
```

### Apply Discount Code
```
POST /api/checkout/discount
Body: { discountCode: "WELCOME10", discountAmount: 150 }
```

### Clear Discount Code
```
DELETE /api/checkout/discount
```

### Get Cart Summary
```
GET /api/checkout/summary
Returns: itemCount, subtotal, tax, discount, total, items
```

### Complete Checkout
```
POST /api/checkout/complete
Marks session as COMPLETED
```

### Convert Guest to Authenticated
```
POST /api/checkout/login-and-convert
Body: { userId: "user-123" }
Called after successful login
Migrates session and deletes guest user record
```

## Session Flow

### Guest Browsing
1. Guest visits website
2. `sessionMiddleware` creates `guest-{uuid}`
3. Stored in httpOnly cookie: `guest_user_id`
4. Guest can add items and see totals

### Guest Logs In
1. Guest logs in → JWT token issued with `userId`
2. Frontend calls `POST /api/checkout/login-and-convert`
3. Session migrated: `customerId = userId`, `isGuest = false`
4. All items preserved

### Authenticated User Continues
1. Same session retrieved using `userId` from JWT
2. All items still there
3. Can complete checkout

## Database Schema

```sql
checkout_sessions {
  id: VARCHAR(36) PRIMARY KEY,
  sessionId: VARCHAR(36),
  customerId: VARCHAR(36),
  email: VARCHAR(255),
  bookingItems: LONGTEXT (JSON),
  subtotal: DECIMAL(12, 2),
  totalTax: DECIMAL(12, 2),
  discountAmount: DECIMAL(12, 2),
  discountCode: VARCHAR(50),
  finalTotal: DECIMAL(12, 2),
  currency: VARCHAR(3),
  status: ENUM('ACTIVE', 'COMPLETED', 'ABANDONED', 'EXPIRED'),
  isGuest: BOOLEAN,
  expiresAt: TIMESTAMP,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

## Usage Example

### Guest Adding Items
```typescript
// 1. Get session (creates if doesn't exist)
GET /api/checkout/session
// Response: { id: "checkout-123", sessionId: "guest-uuid", bookingItems: [], ... }

// 2. Add hotel to cart
POST /api/checkout/items
Body: {
  id: "hotel-booking-123",
  serviceType: "HOTEL",
  quantity: 1,
  pricePerUnit: 1500,
  subtotal: 1500,
  tax: 300,
  total: 1800,
  metadata: { hotelId: "hotel-123", ... }
}
// Response: { bookingItems: [item], subtotal: 1500, totalTax: 300, finalTotal: 1800 }

// 3. View cart summary
GET /api/checkout/summary
// Response: { itemCount: 1, subtotal: 1500, totalTax: 300, finalTotal: 1800 }

// 4. Guest logs in
POST /api/auth/login
// Response: { accessToken: "jwt-token", userId: "user-123" }

// 5. Convert session
POST /api/checkout/login-and-convert
Body: { userId: "user-123" }
// Response: { customerId: "user-123", isGuest: false, bookingItems: [item] }

// 6. Continue shopping (now authenticated)
GET /api/checkout/session
Headers: Authorization: Bearer jwt-token
// Response: { customerId: "user-123", isGuest: false, bookingItems: [item] }
```

## Security

- ✅ httpOnly cookies prevent XSS attacks
- ✅ Secure flag for HTTPS-only transmission
- ✅ SameSite attribute prevents CSRF
- ✅ Session expiry after 30 minutes
- ✅ Automatic cleanup of expired sessions
- ✅ Guest user records deleted after conversion

## Integration

To integrate checkout feature into your app:

```typescript
import { createCheckoutRoutes } from './features/checkout';
import { Connection } from './database/connection';

const connection = new Connection();
const checkoutRoutes = createCheckoutRoutes(connection);

app.use(checkoutRoutes.routes());
```

## Testing

Run checkout tests:
```bash
npm test -- src/features/checkout
```

## Future Enhancements

- [ ] Discount code validation service
- [ ] Payment gateway integration
- [ ] Order creation from checkout
- [ ] Email notifications
- [ ] Abandoned cart recovery
- [ ] Analytics and reporting
