# Admin Panel Authentication - Testing Guide

## Quick Start

### Prerequisites
- Backend API running on http://localhost:3001
- Management panel running on http://localhost:3002

### Test the Authentication Flow

#### 1. Access the Login Page
```
Navigate to: http://localhost:3002/admin/login
```

You should see:
- Admin Panel title
- Email input field
- Password input field
- Sign In button
- Demo credentials displayed at bottom

#### 2. Test Login with Valid Credentials
```
Email: admin@example.com
Password: any password (backend accepts any password for now)
```

Expected behavior:
- Loading state shows "Signing in..."
- Redirects to http://localhost:3002/admin/dashboard
- Dashboard displays "Welcome, [User Name]"
- Dashboard shows placeholder cards for metrics

#### 3. Test Session Persistence
```
1. Log in successfully
2. Refresh the page (F5 or Cmd+R)
3. Should remain logged in and stay on dashboard
```

Expected behavior:
- Page doesn't redirect to login
- User info is preserved
- Dashboard loads normally

#### 4. Test Protected Routes
```
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Delete localStorage items: admin_token, admin_refresh_token
4. Refresh the page
```

Expected behavior:
- Redirected to login page
- Cannot access dashboard without token

#### 5. Test Logout
```
1. Log in successfully
2. Open browser console and run:
   localStorage.removeItem('admin_token')
   localStorage.removeItem('admin_refresh_token')
3. Refresh the page
```

Expected behavior:
- Redirected to login page
- Session cleared

#### 6. Test Invalid Credentials
```
Email: nonexistent@example.com
Password: anypassword
```

Expected behavior:
- Error message: "Invalid credentials"
- Remains on login page
- Can retry login

#### 7. Test Form Validation
```
1. Leave email field empty
2. Click Sign In
```

Expected behavior:
- Error message: "Please fill in all fields"
- Form doesn't submit

## API Endpoints Being Used

### Login Endpoint
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Get Current User Endpoint
```
GET /auth/me
Authorization: Bearer {accessToken}

Response:
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "Admin",
    "role": "ADMIN"
  }
}
```

### Logout Endpoint
```
POST /auth/logout
Authorization: Bearer {accessToken}

Response:
{
  "message": "Logout successful"
}
```

### Refresh Token Endpoint
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}

Response:
{
  "message": "Token refreshed",
  "tokens": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

## Debugging

### Check Stored Tokens
Open browser DevTools → Application → Local Storage → http://localhost:3002

You should see:
- `admin_token` - JWT access token
- `admin_refresh_token` - Refresh token
- `admin_user` - User info JSON

### Check Redux State
In browser console:
```javascript
// Install Redux DevTools extension for better debugging
// Or check localStorage directly
console.log(localStorage.getItem('admin_token'))
console.log(localStorage.getItem('admin_refresh_token'))
```

### Check API Requests
Open DevTools → Network tab and:
1. Log in
2. Watch for POST /auth/login request
3. Check response contains tokens
4. Navigate to dashboard
5. Watch for GET /auth/me request

### Common Issues

#### Issue: "Login failed" error
- Check backend API is running on port 3001
- Check NEXT_PUBLIC_API_URL in management/.env.local
- Check backend auth routes are working

#### Issue: Stays on login page after login
- Check browser console for errors
- Check Network tab for failed requests
- Verify tokens are being stored in localStorage

#### Issue: Redirects to login immediately after login
- Check if token refresh is failing
- Check if /auth/me endpoint is returning 401
- Verify user exists in database

#### Issue: "Cannot read property 'isAuthenticated' of undefined"
- Redux store might not be initialized
- Check Providers component is wrapping app
- Check store configuration in management/src/store/index.ts

## Next Steps

After authentication is working:
1. Implement MFA verification page (1.4.2)
2. Add component tests for login page (1.4.7)
3. Add E2E tests for auth flow (1.4.8)
4. Implement sidebar and topbar (1.5)
5. Add user management features (2.3)
