# Authentication Session Persistence - Comprehensive Fix

## Problem
Users were experiencing random logouts after a few clicks, even though the previous auth persistence fixes were in place. The session would be lost unexpectedly during navigation.

## Root Causes Identified

### 1. Cookie/LocalStorage Desynchronization
- When API client refreshed tokens, it updated localStorage but AuthContext didn't know about it
- Cookies could expire (7 days) while access tokens were still valid (24 hours)
- Cookie max-age was set to 7 days but should match access token expiry (24 hours)

### 2. Race Conditions
- Multiple API calls could trigger simultaneous user reloads
- No protection against concurrent user fetch operations
- Token refresh could happen while user was being loaded

### 3. Lack of Communication Between Components
- API client and AuthContext operated independently
- No notification system when tokens were refreshed
- User state could be lost without AuthContext knowing

### 4. Aggressive Redirect Logic
- Token refresh failures immediately redirected to login
- No delay to allow cleanup or state updates
- Could interrupt ongoing operations

## Solutions Implemented

### 1. Storage Event Communication
**AuthContext now listens for localStorage changes:**
```typescript
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'accessToken') {
      const newToken = e.newValue;
      if (newToken && newToken !== lastTokenCheckRef.current) {
        // Token was updated (likely by token refresh), update cookie
        setAuthCookie('accessToken', newToken);
        lastTokenCheckRef.current = newToken;
      } else if (!newToken) {
        // Token was removed
        removeAuthCookie('accessToken');
        setUser(null);
      }
    }
  };
  window.addEventListener('storage', handleStorageChange);
}, []);
```

**API client dispatches storage events when tokens change:**
```typescript
// After successful token refresh
window.dispatchEvent(new StorageEvent('storage', {
  key: 'accessToken',
  newValue: newAccessToken,
  oldValue: this.getToken(),
  storageArea: localStorage,
  url: window.location.href
}));
```

### 2. Race Condition Protection
**Added ref-based locking to prevent concurrent user loads:**
```typescript
const loadingUserRef = useRef(false);

// Before loading user
if (loadingUserRef.current) {
  console.log('[Auth] Already loading user, skipping refresh');
  return;
}
loadingUserRef.current = true;
// ... load user ...
loadingUserRef.current = false;
```

### 3. Token Tracking
**Track the last known token to detect changes:**
```typescript
const lastTokenCheckRef = useRef<string | null>(null);

// When setting token
lastTokenCheckRef.current = token;

// When checking for changes
if (token && token !== lastTokenCheckRef.current) {
  // Token changed, update cookie
}
```

### 4. Periodic Cookie Sync
**Sync cookie with localStorage every 30 seconds:**
```typescript
useEffect(() => {
  const syncCookie = () => {
    const token = localStorage.getItem('accessToken');
    if (token && token !== lastTokenCheckRef.current) {
      setAuthCookie('accessToken', token);
      lastTokenCheckRef.current = token;
    }
  };
  const interval = setInterval(syncCookie, 30 * 1000);
}, []);
```

### 5. More Frequent Auth Checks
**Changed from 5 minutes to 2 minutes:**
```typescript
const interval = setInterval(checkAuth, 2 * 60 * 1000); // 2 minutes
```

### 6. Fixed Cookie Expiry
**Changed cookie max-age from 7 days to 24 hours to match access token:**
```typescript
// Before: max-age=604800 (7 days)
// After: max-age=86400 (24 hours)
document.cookie = `${name}=${value}; path=/; max-age=86400; SameSite=Lax`;
```

### 7. Comprehensive Logging
**Added detailed console logging for debugging:**
- `[Auth]` prefix for AuthContext operations
- `[API]` prefix for API client operations
- Logs token changes, user loads, refreshes, and errors
- Helps track down issues in production

### 8. Improved Error Handling
**Less aggressive redirect logic:**
```typescript
// Use setTimeout to avoid blocking current execution
setTimeout(() => {
  window.location.href = '/auth/';
}, 100);
```

## How It Works Now

### Normal Flow
1. User logs in → tokens stored in localStorage + cookie set
2. User navigates → middleware checks cookie, AuthContext maintains user state
3. API calls → automatically include token from localStorage
4. Token tracked → lastTokenCheckRef keeps track of current token

### Token Refresh Flow
1. API call receives 401 → triggers token refresh
2. New token obtained → stored in localStorage
3. Storage event dispatched → AuthContext receives notification
4. Cookie updated → middleware can access new token
5. Request retried → succeeds with new token
6. User state maintained → no logout, seamless experience

### Recovery Flow
1. User state lost (but token exists) → detected by periodic check
2. Race condition check → ensure not already loading
3. User reloaded → from /auth/me endpoint
4. Cookie synced → updated with current token
5. State restored → user continues without interruption

### Tab Focus Flow
1. User returns to tab → visibility change detected
2. Token checked → verify localStorage has token
3. Cookie synced → ensure middleware can access token
4. User reloaded if needed → restore state if lost

## Files Modified

### Frontend
- `frontend/src/context/AuthContext.tsx` - Added storage event listener, race condition protection, token tracking, periodic sync, comprehensive logging
- `frontend/src/lib/api.ts` - Added storage event dispatch on token refresh, improved logging, delayed redirect

## Testing the Fix

### Manual Testing
1. **Login and navigate**: Login → navigate between pages → should stay logged in
2. **Token refresh**: Wait for token to expire (or force 401) → should refresh automatically
3. **Tab switching**: Switch tabs → return → should maintain session
4. **Multiple tabs**: Open multiple tabs → all should stay in sync
5. **Network issues**: Disconnect/reconnect → should recover gracefully

### Console Monitoring
Open browser console and watch for:
- `[Auth] User loaded successfully` - Initial load
- `[Auth] Token changed in storage` - Token refresh detected
- `[Auth] Cookie updated with new token` - Cookie sync
- `[API] Refreshing access token` - Token refresh triggered
- `[API] Token refreshed successfully` - Refresh completed
- `[Auth] User refreshed successfully` - User state updated

### Expected Behavior
- No unexpected logouts during normal navigation
- Automatic token refresh when expired
- Session persists across tab switches
- Multiple tabs stay synchronized
- Network errors don't cause logout
- Only 401 errors trigger token refresh

## Debugging

If issues persist, check:

1. **Browser Console**: Look for `[Auth]` and `[API]` logs
2. **Network Tab**: Check for 401 responses and retry attempts
3. **Application Tab**: Verify localStorage has `accessToken` and `refreshToken`
4. **Cookies**: Verify `accessToken` cookie exists and matches localStorage
5. **Token Expiry**: Check if tokens are actually expired (decode JWT)

### Common Issues

**Issue**: User still getting logged out
- Check: Are there 401 errors in network tab?
- Check: Is token refresh failing?
- Check: Are cookies being blocked by browser?

**Issue**: Token refresh not working
- Check: Is `refreshToken` in localStorage?
- Check: Is backend `/auth/refresh` endpoint working?
- Check: Are there CORS issues?

**Issue**: Cookies not persisting
- Check: Browser cookie settings
- Check: SameSite attribute compatibility
- Check: Secure flag (only works on HTTPS)

## Benefits

1. **Seamless Experience**: Users stay logged in without interruption
2. **Automatic Recovery**: System recovers from temporary issues
3. **Better Debugging**: Comprehensive logging helps identify issues
4. **Synchronized State**: All components stay in sync
5. **Race Condition Safe**: No concurrent user loads
6. **Token Tracking**: Always know the current token state

## Future Improvements

Consider implementing:
1. **Proactive Token Refresh**: Refresh before expiry (at 23 hours)
2. **Exponential Backoff**: For failed refresh attempts
3. **Session Timeout Warning**: Notify user before logout
4. **Activity-Based Extension**: Extend session on user activity
5. **Remember Me**: Longer token lifetime option
6. **Session Management UI**: Show active sessions, logout all devices
