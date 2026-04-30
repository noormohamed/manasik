# Random Logout Issue - Fixed

## Problem
You were experiencing random logouts after a few clicks, where the session would be forgotten unexpectedly.

## What Was Wrong

1. **Cookie/LocalStorage Desync**: When the API client refreshed your token automatically, it updated localStorage but the AuthContext didn't know about it, causing the user state to be lost.

2. **Race Conditions**: Multiple API calls could trigger simultaneous user reloads, causing conflicts and state loss.

3. **Cookie Expiry Mismatch**: Cookies were set to expire in 7 days, but access tokens expire in 24 hours, causing middleware to have stale cookies.

4. **No Communication**: The API client and AuthContext operated independently with no way to notify each other of token changes.

## What Was Fixed

### 1. Storage Event Communication
- AuthContext now listens for localStorage changes
- API client dispatches events when tokens are refreshed
- Both components stay synchronized automatically

### 2. Race Condition Protection
- Added locking mechanism to prevent concurrent user loads
- Only one user fetch operation can run at a time
- Prevents state conflicts and data races

### 3. Token Tracking
- System now tracks the current token and detects changes
- Automatically updates cookies when tokens change
- Ensures middleware always has access to valid tokens

### 4. Periodic Cookie Sync
- Cookies are synced with localStorage every 30 seconds
- Ensures middleware never has stale cookies
- Recovers automatically if cookies are lost

### 5. More Frequent Checks
- Auth checks now run every 2 minutes (was 5 minutes)
- Faster detection and recovery from issues
- Better session maintenance

### 6. Fixed Cookie Expiry
- Cookies now expire in 24 hours (matching access token)
- No more stale cookies causing issues
- Middleware always has valid cookies

### 7. Comprehensive Logging
- All auth operations now log with `[Auth]` prefix
- All API operations log with `[API]` prefix
- Easy to debug and track what's happening

### 8. Better Error Handling
- Less aggressive redirect logic
- Delays before redirecting to allow cleanup
- Network errors don't cause logout

## How to Test

### 1. Normal Usage
Just use the app normally:
- Login
- Navigate between pages
- Click around
- You should stay logged in

### 2. Debug Dashboard
Visit: `http://localhost:3000/auth-debug`

This page shows:
- Current auth state
- Token information and expiry
- localStorage and cookie status
- Real-time logs of auth activity
- Actions to test scenarios

### 3. Browser Console
Open browser console (F12) and watch for:
- `[Auth] User loaded successfully` - Initial load
- `[Auth] Token changed in storage` - Token refresh detected
- `[Auth] Cookie updated with new token` - Cookie sync
- `[API] Refreshing access token` - Token refresh triggered
- `[API] Token refreshed successfully` - Refresh completed

## What to Expect

### Normal Behavior
- ✅ Stay logged in while navigating
- ✅ Automatic token refresh when expired
- ✅ Session persists across tab switches
- ✅ Multiple tabs stay synchronized
- ✅ Network errors don't cause logout
- ✅ Only 401 errors trigger token refresh

### What Should NOT Happen
- ❌ Random logouts during navigation
- ❌ Session lost after a few clicks
- ❌ Need to login again frequently
- ❌ Different tabs showing different auth states

## Files Changed

### Frontend
1. `frontend/src/context/AuthContext.tsx`
   - Added storage event listener
   - Added race condition protection
   - Added token tracking
   - Added periodic cookie sync
   - Added comprehensive logging
   - Improved error handling

2. `frontend/src/lib/api.ts`
   - Added storage event dispatch on token refresh
   - Improved logging
   - Delayed redirect on auth failure

3. `frontend/src/app/auth-debug/page.tsx` (NEW)
   - Debug dashboard for monitoring auth state
   - Real-time logs
   - Token information
   - Storage status

### Backend
4. `service/src/middleware/auth.middleware.ts`
   - Added logging
   - Set both ctx.user and ctx.state for compatibility

## If Issues Persist

If you still experience logouts:

1. **Check the Debug Dashboard**: Visit `/auth-debug` and watch the logs
2. **Check Browser Console**: Look for `[Auth]` and `[API]` messages
3. **Check Network Tab**: Look for 401 responses
4. **Check Application Tab**: Verify tokens exist in localStorage and cookies

Common issues:
- Browser blocking cookies (check settings)
- Backend not returning proper tokens
- CORS issues preventing cookie access
- Token expiry too short

## Next Steps

1. **Test the app**: Navigate around and verify you stay logged in
2. **Use debug dashboard**: Visit `/auth-debug` to monitor auth state
3. **Report back**: Let me know if you still see any issues

The system now has comprehensive logging, so if issues occur, we can easily identify the cause from the console logs.
