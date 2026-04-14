# Stripe Payment Integration

## Overview

Implemented Stripe Checkout Session integration for the booking platform. Users are redirected to Stripe's hosted checkout page to complete payment, then returned to success/cancel URLs.

## Architecture

### Flow
1. User fills cart with hotel bookings
2. User clicks "Pay with Stripe" on checkout page
3. Backend creates Stripe Checkout Session
4. User is redirected to Stripe's hosted checkout
5. After payment, user is redirected to success/cancel URL
6. Backend verifies payment and updates booking status

## Files Created/Modified

### Backend (service/)

#### New Files
- `src/services/payments/stripe-checkout.service.ts` - Stripe Checkout Session service
- `src/routes/checkout.routes.ts` - Checkout API routes
- `database/migrations/create-payments-table.sql` - Payments table migration

#### Modified Files
- `src/server.ts` - Added checkout routes
- `.env` - Added Stripe configuration
- `package.json` - Added axios dependency

### Frontend (frontend/)

#### New Files
- `src/app/checkout/success/page.tsx` - Payment success page
- `src/app/checkout/cancel/page.tsx` - Payment cancelled page

#### Modified Files
- `src/components/Checkout/CheckoutContent.tsx` - Updated to use Stripe Checkout

## API Endpoints

### POST /api/checkout/create-session
Creates a Stripe Checkout Session.

**Request:**
```json
{
  "items": [
    {
      "name": "Hotel Room - Deluxe Suite",
      "description": "2 nights, 2 guests",
      "amount": 250.00,
      "quantity": 1,
      "currency": "GBP"
    }
  ],
  "customerEmail": "user@example.com",
  "customerId": "user-123",
  "bookingIds": ["booking-001"],
  "metadata": {
    "guestName": "John Doe",
    "guestPhone": "+1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/...",
    "expiresAt": "2024-03-27T12:00:00Z"
  }
}
```

### GET /api/checkout/session/:sessionId
Get checkout session status.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "paymentStatus": "paid",
    "amountTotal": 275.00,
    "currency": "gbp",
    "customerEmail": "user@example.com"
  }
}
```

### POST /api/checkout/verify-payment
Verify payment and update booking status.

**Request:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentStatus": "paid",
    "amountTotal": 275.00,
    "currency": "gbp",
    "bookingIds": ["booking-001"]
  }
}
```

## Database Schema

### payments table
```sql
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    booking_id VARCHAR(36),
    customer_id VARCHAR(36),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    status ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled'),
    payment_intent_id VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### bookings table (modified)
Added `payment_status` column:
```sql
ALTER TABLE bookings ADD COLUMN payment_status 
    ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED') DEFAULT 'PENDING';
```

## Environment Variables

```env
# Stripe Configuration
STRIPE_BASE_URL=https://api.stripe.com/v1
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing

### Test Credentials
Use Stripe test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

### Test Flow
1. Add items to cart
2. Go to checkout
3. Fill in guest information
4. Click "Pay with Stripe"
5. Complete payment on Stripe checkout page
6. Verify redirect to success page
7. Check booking status is updated to CONFIRMED

## Security Considerations

1. **Server-side session creation** - Checkout sessions are created on the backend
2. **Payment verification** - Always verify payment status with Stripe API
3. **Webhook support** - Can be extended to use Stripe webhooks for real-time updates
4. **No card data handling** - All card data is handled by Stripe's hosted checkout

## Future Enhancements

1. Add Stripe webhook handler for real-time payment updates
2. Implement refund functionality
3. Add support for subscription payments
4. Implement payment method saving for returning customers
5. Add support for multiple currencies
6. Implement invoice generation

## Troubleshooting

### Common Issues

1. **Port already allocated**
   - Stop other services using port 3001
   - `lsof -i :3001` to find the process
   - `kill -9 <PID>` to stop it

2. **Stripe API errors**
   - Check STRIPE_SECRET_KEY is set correctly
   - Verify you're using test keys in development

3. **Payment not updating booking**
   - Check bookingIds are passed correctly in metadata
   - Verify database connection is working

## Status

✅ Stripe Checkout Service created
✅ Checkout API routes created
✅ Payments table created
✅ Frontend checkout updated
✅ Success/Cancel pages created
⏳ Docker containers need restart (Docker daemon was killed)

## Next Steps

1. Restart Docker daemon
2. Start all containers: `docker-compose up -d`
3. Test the checkout flow
4. Verify payment processing
