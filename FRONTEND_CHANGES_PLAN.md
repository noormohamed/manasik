# Frontend Changes Plan - Authentication & API Integration

## Current State
The frontend is a **Next.js 14 static site** with beautiful UI components but **zero backend integration**. All authentication forms are presentational only with no API calls, state management, or token handling.

## Phase 1: Foundation Setup (Priority: HIGH)

### 1.1 Create API Client Layer
**File**: `frontend/src/lib/api.ts`
- Centralized fetch wrapper with error handling
- Base URL from environment variable
- Request/response interceptors
- Token injection in headers
- Error standardization

**File**: `frontend/src/lib/api-client.ts`
- Specific API endpoints (auth, users, hotels, checkout)
- Type-safe request/response interfaces
- Error handling per endpoint

### 1.2 Create Auth Context & State Management
**File**: `frontend/src/context/AuthContext.tsx`
- Global user state (logged in user, tokens, loading)
- Auth methods (login, register, logout, refresh)
- Token persistence (localStorage)
- Auto-refresh on app load

**File**: `frontend/src/hooks/useAuth.ts`
- Custom hook to access auth context
- Simplified API for components

### 1.3 Create Protected Route Middleware
**File**: `frontend/src/middleware.ts`
- Protect `/account/` and `/checkout/` routes
- Redirect unauthenticated users to login
- Handle token refresh

## Phase 2: Authentication Forms (Priority: HIGH)

### 2.1 Update LoginForm Component
**File**: `frontend/src/components/Authentication/LoginForm.tsx`
- Add form state (email, password, loading, error)
- Connect to API `/auth/login` endpoint
- Store tokens in context
- Redirect to home on success
- Show error messages
- Handle "Keep me logged in" checkbox

### 2.2 Update RegisterForm Component
**File**: `frontend/src/components/Authentication/RegisterForm.tsx`
- Add form state (name, email, password, confirmPassword)
- Split name into firstName/lastName
- Connect to API `/auth/register` endpoint
- Validate password match
- Auto-login after registration
- Show success/error messages

### 2.3 Update ForgotPassword Component
**File**: `frontend/src/components/Authentication/ForgotPassword.tsx`
- Add email input for password reset request
- Connect to API (future endpoint)
- Show confirmation message
- Link back to login

## Phase 3: User Account Management (Priority: MEDIUM)

### 3.1 Update AccountInfo Component
**File**: `frontend/src/components/account/AccountInfo.tsx`
- Fetch current user data on mount
- Connect form to API `/users/:id` PUT endpoint
- Show loading state while fetching
- Handle profile picture upload
- Show success/error messages

### 3.2 Update ChangePassword Component
**File**: `frontend/src/components/account/ChangePassword.tsx`
- Add form state (oldPassword, newPassword, confirmPassword)
- Connect to API (future endpoint)
- Validate passwords match
- Show success/error messages
- Logout after password change

### 3.3 Update ChangeBilling Component
**File**: `frontend/src/components/account/ChangeBilling.tsx`
- Fetch billing info from API
- Connect to API (future endpoint)
- Handle payment method updates

## Phase 4: Navigation & Auth UI (Priority: MEDIUM)

### 4.1 Update Navbar Component
**File**: `frontend/src/components/Layout/Navbar.tsx`
- Show user name when logged in
- Add logout button
- Hide login link when authenticated
- Show account link when authenticated
- Add loading state for logout

### 4.2 Add Auth Status Indicator
- Display user avatar/initials
- Show dropdown menu with account/logout options
- Add loading spinner during auth operations

## Phase 5: Error Handling & UX (Priority: MEDIUM)

### 5.1 Create Error Boundary
**File**: `frontend/src/components/ErrorBoundary.tsx`
- Catch and display errors gracefully
- Show retry button
- Log errors for debugging

### 5.2 Create Toast/Notification System
**File**: `frontend/src/components/Toast.tsx`
- Display success messages
- Display error messages
- Auto-dismiss after 3 seconds
- Accessible and styled

### 5.3 Add Loading States
- Loading spinners on form submissions
- Disabled buttons during requests
- Loading skeletons for data fetching

## Phase 6: Type Safety (Priority: LOW)

### 6.1 Create Type Definitions
**File**: `frontend/src/types/auth.ts`
- User interface
- LoginRequest/Response
- RegisterRequest/Response
- TokenPair interface

**File**: `frontend/src/types/api.ts`
- Generic API response wrapper
- Error response interface
- Pagination interface

## Implementation Order

1. **Week 1**: Phase 1 (API Client, Auth Context, Middleware)
2. **Week 2**: Phase 2 (Login, Register, Forgot Password forms)
3. **Week 3**: Phase 3 (Account management)
4. **Week 4**: Phase 4 & 5 (Navigation, Error handling, UX)
5. **Week 5**: Phase 6 (Type safety, Testing)

## Files to Create

```
frontend/src/
├── lib/
│   ├── api.ts                 # Fetch wrapper
│   └── api-client.ts          # Endpoint definitions
├── context/
│   └── AuthContext.tsx        # Global auth state
├── hooks/
│   └── useAuth.ts             # Auth hook
├── types/
│   ├── auth.ts                # Auth types
│   └── api.ts                 # API types
├── middleware.ts              # Route protection
└── components/
    └── ErrorBoundary.tsx      # Error handling
    └── Toast.tsx              # Notifications
```

## Files to Modify

```
frontend/src/
├── components/
│   ├── Authentication/
│   │   ├── LoginForm.tsx      # Add API integration
│   │   ├── RegisterForm.tsx   # Add API integration
│   │   └── ForgotPassword.tsx # Add API integration
│   ├── account/
│   │   ├── AccountInfo.tsx    # Add API integration
│   │   ├── ChangePassword.tsx # Add API integration
│   │   └── ChangeBilling.tsx  # Add API integration
│   └── Layout/
│       └── Navbar.tsx         # Add auth UI
├── app/
│   └── layout.tsx             # Add AuthProvider wrapper
└── .env.local                 # Already configured
```

## API Endpoints to Connect

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout (optional)
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Future Endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/users/:id/password` - Change password

## Key Decisions Made

1. **State Management**: Use React Context API (simple, no extra dependencies)
2. **Token Storage**: localStorage (persistent across sessions)
3. **API Client**: Custom fetch wrapper (lightweight, no axios)
4. **Protected Routes**: Middleware-based (Next.js 14 native)
5. **Error Handling**: Centralized with Toast notifications
6. **Loading States**: Component-level with disabled buttons

## Testing Strategy

1. **Unit Tests**: API client, hooks, context
2. **Integration Tests**: Form submissions, auth flow
3. **E2E Tests**: Full login/register/account flow
4. **Manual Testing**: Cross-browser, mobile responsiveness

## Deployment Considerations

1. Update `NEXT_PUBLIC_API_URL` for production
2. Ensure CORS is configured on backend
3. Set secure cookie flags for tokens
4. Implement rate limiting on frontend
5. Add analytics for auth events

## Success Criteria

✅ Users can register with email/password
✅ Users can login and receive JWT tokens
✅ Tokens persist across page refreshes
✅ Protected routes redirect to login
✅ Users can view/edit their profile
✅ Users can change password
✅ Logout clears tokens and redirects
✅ Error messages display clearly
✅ Loading states show during requests
✅ All forms are fully functional
