# Feature Flags Documentation

Feature flags allow you to enable/disable specific API endpoints and features without redeploying the application. This is useful for:

- A/B testing new features
- Gradual rollout of features
- Disabling problematic features in production
- Development and testing workflows

## Quick Start

All feature flags are controlled via environment variables in `.env`:

```bash
# Enable/disable entire modules
ENABLE_AUTH_ENDPOINTS=true
ENABLE_HOTEL_ENDPOINTS=false

# Enable/disable specific features
ENABLE_REGISTRATION=false
ENABLE_HOTEL_BOOKING=true
```

## Feature Flag Categories

### 1. Global Module Flags

These control entire feature modules:

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_AUTH_ENDPOINTS` | `true` | Enable/disable all authentication endpoints |
| `ENABLE_USER_ENDPOINTS` | `true` | Enable/disable all user endpoints |
| `ENABLE_HOTEL_ENDPOINTS` | `true` | Enable/disable all hotel endpoints |
| `ENABLE_CHECKOUT_ENDPOINTS` | `true` | Enable/disable all checkout endpoints |

**Example**: Disable entire hotel module
```env
ENABLE_HOTEL_ENDPOINTS=false
```

### 2. Authentication Flags

Control specific authentication methods:

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_REGISTRATION` | `true` | Allow new user registration |
| `ENABLE_LOGIN` | `true` | Allow user login |
| `ENABLE_REFRESH_TOKEN` | `true` | Allow token refresh |
| `ENABLE_GUEST_CHECKOUT` | `true` | Allow guest checkout without login |

**Example**: Disable registration (maintenance mode)
```env
ENABLE_REGISTRATION=false
```

### 3. Hotel Flags

Control specific hotel features:

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_HOTEL_LISTING` | `true` | List hotels endpoint |
| `ENABLE_HOTEL_DETAILS` | `true` | Get hotel details endpoint |
| `ENABLE_ROOM_AVAILABILITY` | `true` | Check room availability |
| `ENABLE_HOTEL_BOOKING` | `true` | Create hotel bookings |

**Example**: Disable bookings while updating inventory
```env
ENABLE_HOTEL_BOOKING=false
```

### 4. Checkout Flags

Control specific checkout features:

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_CHECKOUT_SESSION` | `true` | Get/manage checkout sessions |
| `ENABLE_CHECKOUT_ITEMS` | `true` | Add/remove items from cart |
| `ENABLE_CHECKOUT_DISCOUNT` | `true` | Apply discount codes |
| `ENABLE_CHECKOUT_CONVERSION` | `true` | Convert guest to authenticated user |
| `ENABLE_CHECKOUT_COMPLETE` | `true` | Complete checkout and process payment |

**Example**: Disable discounts temporarily
```env
ENABLE_CHECKOUT_DISCOUNT=false
```

## Usage Examples

### Scenario 1: Maintenance Mode

Disable all endpoints except health check:

```env
ENABLE_AUTH_ENDPOINTS=false
ENABLE_USER_ENDPOINTS=false
ENABLE_HOTEL_ENDPOINTS=false
ENABLE_CHECKOUT_ENDPOINTS=false
```

### Scenario 2: Read-Only Mode

Allow browsing but disable bookings:

```env
ENABLE_HOTEL_LISTING=true
ENABLE_HOTEL_DETAILS=true
ENABLE_ROOM_AVAILABILITY=true
ENABLE_HOTEL_BOOKING=false
ENABLE_CHECKOUT_COMPLETE=false
```

### Scenario 3: Guest Checkout Only

Disable registration and login, allow guest checkout:

```env
ENABLE_REGISTRATION=false
ENABLE_LOGIN=false
ENABLE_GUEST_CHECKOUT=true
ENABLE_CHECKOUT_CONVERSION=false
```

### Scenario 4: Beta Testing

Enable new features for testing:

```env
# Disable in production
ENABLE_HOTEL_ENDPOINTS=true
ENABLE_CHECKOUT_ENDPOINTS=true

# Enable new features
ENABLE_CHECKOUT_DISCOUNT=true
ENABLE_CHECKOUT_CONVERSION=true
```

## Checking Feature Status

### Via Health Endpoint

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T22:30:00.000Z",
  "features": {
    "auth": true,
    "users": true,
    "hotels": true,
    "checkout": true,
    "registration": true,
    "login": true,
    "refreshToken": true,
    "guestCheckout": true,
    "hotelListing": true,
    "hotelDetails": true,
    "roomAvailability": true,
    "hotelBooking": true,
    "checkoutSession": true,
    "checkoutItems": true,
    "checkoutDiscount": true,
    "checkoutConversion": true,
    "checkoutComplete": true
  }
}
```

### Via Logs

On startup, the API logs all feature flags:

```
📋 Feature Flags Status:
  ✅ auth
  ✅ users
  ✅ hotels
  ✅ checkout
  ✅ registration
  ✅ login
  ✅ refreshToken
  ✅ guestCheckout
  ✅ hotelListing
  ✅ hotelDetails
  ✅ roomAvailability
  ✅ hotelBooking
  ✅ checkoutSession
  ✅ checkoutItems
  ✅ checkoutDiscount
  ✅ checkoutConversion
  ✅ checkoutComplete
```

## Error Responses

When accessing a disabled endpoint:

```bash
curl -X POST http://localhost:3001/api/auth/register
```

Response (403 Forbidden):
```json
{
  "error": "Feature is disabled",
  "feature": "registration"
}
```

## Implementation Details

### How It Works

1. **Feature Flags Manager** (`service/src/utils/feature-flags.ts`)
   - Loads flags from environment variables on startup
   - Provides `isEnabled(feature)` method to check status
   - Returns all flags via `getStatus()`

2. **Feature Flag Middleware** (`service/src/middleware/feature-flag.ts`)
   - `requireFeature(feature)` - Middleware that checks if feature is enabled
   - Returns 403 if feature is disabled
   - Logs feature status on health check

3. **Route Integration**
   - Each endpoint uses `requireFeature()` middleware
   - Module-level flags checked in `api.routes.ts`
   - Endpoint-level flags checked in individual route handlers

### Adding New Feature Flags

1. Add to `.env.example`:
```env
ENABLE_NEW_FEATURE=true
```

2. Add to `FeatureFlags` interface in `service/src/utils/feature-flags.ts`:
```typescript
interface FeatureFlags {
  newFeature: boolean;
}
```

3. Load in `loadFlags()` method:
```typescript
newFeature: this.parseEnv('ENABLE_NEW_FEATURE', true),
```

4. Use in routes:
```typescript
router.get('/endpoint', requireFeature('newFeature'), handler);
```

## Best Practices

1. **Default to Enabled**: New features should default to `true` for backward compatibility
2. **Granular Flags**: Create specific flags for each feature, not just module-level
3. **Document Changes**: Update this file when adding new flags
4. **Test Disabled State**: Always test with flags disabled
5. **Monitor Usage**: Track which flags are disabled in production
6. **Gradual Rollout**: Use flags to gradually enable features to users

## Environment-Specific Configurations

### Development
```env
# Enable all features for testing
ENABLE_AUTH_ENDPOINTS=true
ENABLE_REGISTRATION=true
ENABLE_HOTEL_ENDPOINTS=true
ENABLE_CHECKOUT_ENDPOINTS=true
```

### Staging
```env
# Test new features before production
ENABLE_AUTH_ENDPOINTS=true
ENABLE_HOTEL_ENDPOINTS=true
ENABLE_CHECKOUT_ENDPOINTS=true
# Disable problematic features
ENABLE_CHECKOUT_DISCOUNT=false
```

### Production
```env
# Conservative approach - only enable stable features
ENABLE_AUTH_ENDPOINTS=true
ENABLE_HOTEL_ENDPOINTS=true
ENABLE_CHECKOUT_ENDPOINTS=true
# Disable experimental features
ENABLE_CHECKOUT_CONVERSION=false
```

## Troubleshooting

### Feature Not Disabled

1. Check `.env` file is loaded:
```bash
docker-compose exec api env | grep ENABLE_
```

2. Verify flag name matches exactly (case-sensitive)

3. Restart the API service:
```bash
docker-compose restart api
```

### Feature Still Accessible

1. Check health endpoint for actual status
2. Verify middleware is applied to the route
3. Check for typos in feature flag name
4. Ensure `.env` file is in the correct location

## Support

For issues or questions about feature flags, check:
- `service/src/utils/feature-flags.ts` - Feature flags manager
- `service/src/middleware/feature-flag.ts` - Feature flag middleware
- `service/src/routes/api.routes.ts` - Route integration
