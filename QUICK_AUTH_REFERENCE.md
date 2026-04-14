# Quick Auth Reference

## Current Configuration

### Token Expiry
- **Access Token**: 24 hours
- **Refresh Token**: 7 days
- **Cookie**: 24 hours (matches access token)

### Endpoints
- Login: `POST /api/auth/login`
- Register: `POST /api/auth/register`
- Refresh: `POST /api/auth/refresh`
- Get User: `GET /api/auth/me`
- Logout: `POST /api/auth/logout`

### Test Credentials
- `admin@bookingplatform.com` / `password123`
- `james.anderson@email.com` / `password123`
- `edward.sanchez@email.com` / `password123`

## Debug Tools

### Debug Dashboard
URL: `http://localhost:3000/auth-debug`

Shows:
- Current auth state (user, loading, authenticated)
- Token information (expiry, user data)
- Storage status (localStorage, cookies)
- Real-time logs of auth activity
- Quick actions (reload, clear all)

### Browser Console
Look for these log prefixes:
- `[Auth]` - AuthContext operations
- `[API]` - API client operations

### Key Log Messages
```
[Auth] User loaded successfully - Initial user load
[Auth] Token changed in storage - Token was refreshed
[Auth] Cookie updated with new token - Cookie synced
[Auth] Syncing cookie with localStorage - Periodic sync
[Auth] User refreshed successfully - User reloaded

[API] Refreshing access token - Token refresh started
[API] Token refreshed successfully - Token refresh completed
[API] Received 401, attempting token refresh - Auto-retry triggered
[API] Retrying request with new token - Request being retried
```

## How Auth Works

### Login Flow
1. User enters credentials
2. POST to `/api/auth/login`
3. Receive access token (24h) and refresh token (7d)
4. Store in localStorage
5. Set cookie for middleware
6. Set user state in AuthContext

### Token Refresh Flow
1. API call receives 401 (token expired)
2. API client automatically calls `/api/auth/refresh`
3. New access token received
4. Update localStorage
5. Dispatch storage event
6. AuthContext receives event
7. Update cookie
8. Retry original request
9. User never notices

### Session Maintenance
- Cookie synced every 30 seconds
- Auth checked every 2 minutes
- User reloaded if state lost but token exists
- Tab focus triggers auth check
- Storage events keep components in sync

## Troubleshooting

### User Getting Logged Out
1. Open `/auth-debug` dashboard
2. Check if token exists in localStorage
3. Check if cookie exists
4. Watch logs for errors
5. Check browser console for `[Auth]` and `[API]` messages

### Token Not Refreshing
1. Check if refresh token exists in localStorage
2. Check network tab for `/api/auth/refresh` calls
3. Verify backend is running
4. Check for CORS errors

### Cookies Not Working
1. Check browser cookie settings
2. Verify SameSite attribute compatibility
3. Check if Secure flag is causing issues (HTTP vs HTTPS)
4. Look for cookie in Application tab

### Multiple Tabs Out of Sync
1. Storage events should sync them automatically
2. Check if localStorage is working
3. Try switching between tabs to trigger sync
4. Check logs for storage event messages

## Common Scenarios

### Scenario 1: User Navigates Pages
- Middleware checks cookie ✓
- AuthContext maintains user state ✓
- No API calls needed ✓
- User stays logged in ✓

### Scenario 2: Token Expires
- API call receives 401 ✓
- Token refresh triggered automatically ✓
- New token stored ✓
- Cookie updated ✓
- Request retried ✓
- User stays logged in ✓

### Scenario 3: User Switches Tabs
- Visibility change detected ✓
- Auth state checked ✓
- Cookie synced ✓
- User state maintained ✓

### Scenario 4: Network Error
- Request fails ✓
- Error logged ✓
- Auth state NOT cleared ✓
- User stays logged in ✓
- Can retry when network recovers ✓

## Quick Commands

### Clear Auth State (Browser Console)
```javascript
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
document.cookie = 'accessToken=; path=/; max-age=0';
location.reload();
```

### Check Token Expiry (Browser Console)
```javascript
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
console.log('Minutes left:', Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60));
```

### Force Token Refresh (Browser Console)
```javascript
// Remove access token to force refresh on next API call
localStorage.removeItem('accessToken');
// Make any API call - it will trigger refresh
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

## Files to Check

If you need to modify auth behavior:

### Frontend
- `frontend/src/context/AuthContext.tsx` - Auth state management
- `frontend/src/lib/api.ts` - API client with token refresh
- `frontend/src/middleware.ts` - Next.js middleware for protected routes
- `frontend/src/hooks/useAuth.ts` - Auth hook

### Backend
- `service/src/routes/auth.routes.ts` - Auth endpoints
- `service/src/services/auth.service.ts` - JWT token generation
- `service/src/middleware/auth.middleware.ts` - Token verification
- `service/.env` - Token expiry configuration
