# Admin Panel Authentication - Quick Reference

## 🚀 Quick Start

### Start Services
```bash
# Terminal 1: Backend API
cd service
npm run dev

# Terminal 2: Management Panel
cd management
npm run dev

# Terminal 3: MySQL (if not using Docker)
# Or use Docker Compose
docker-compose up
```

### Access Admin Panel
```
http://localhost:3002/admin/login
```

### Test Login
```
Email: admin@example.com
Password: any password
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `management/src/hooks/useAuth.ts` | Auth hook with login/logout |
| `management/src/services/authService.ts` | API service for auth endpoints |
| `management/src/components/ProtectedRoute.tsx` | Route protection wrapper |
| `management/src/app/admin/login/page.tsx` | Login page component |
| `management/src/app/admin/layout.tsx` | Admin layout with protection |
| `management/src/lib/api.ts` | API client with token refresh |

## 🔑 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/change-password` | Change password |

## 💾 localStorage Keys

| Key | Content |
|-----|---------|
| `admin_token` | JWT access token |
| `admin_refresh_token` | Refresh token |
| `admin_user` | User info JSON |

## 🎯 Usage Examples

### Use Auth in Component
```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protect a Route
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
```

### Make API Call
```typescript
import { apiClient } from '@/lib/api';

// Token automatically included
const users = await apiClient.get('/api/users');

// Token automatically refreshed on 401
const booking = await apiClient.post('/api/bookings', data);
```

## 🧪 Testing Checklist

- [ ] Login with valid credentials
- [ ] Redirects to dashboard
- [ ] Refresh page - stays logged in
- [ ] Delete tokens - redirects to login
- [ ] Invalid credentials - shows error
- [ ] Empty form - shows validation error
- [ ] Logout - clears tokens

## 📊 Redux State

```typescript
// Access auth state
const auth = useSelector((state: RootState) => state.auth);

// Properties
auth.token              // JWT token
auth.user               // User object
auth.isAuthenticated    // Boolean
auth.isLoading          // Boolean
auth.error              // Error message
auth.requiresMFA        // MFA required
auth.tempToken          // Temp token for MFA
```

## 🔄 Authentication Flow

```
1. User enters credentials on login page
2. useAuth.login() called
3. authService.login() calls POST /auth/login
4. Backend returns tokens
5. Tokens stored in localStorage
6. Redux state updated
7. Redirect to dashboard
8. ProtectedRoute checks auth on each page
9. On 401: API client calls POST /auth/refresh
10. New token stored, request retried
11. On logout: Tokens cleared, redirect to login
```

## ⚙️ Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_JWT_EXPIRY=86400
NEXT_PUBLIC_SESSION_TIMEOUT=86400
```

### Redux Store
```typescript
// Already configured in management/src/store/index.ts
// Includes auth, users, bookings, reviews, transactions, analytics, auditLog, ui slices
```

## 🐛 Debugging

### Check Tokens
```javascript
// In browser console
console.log(localStorage.getItem('admin_token'))
console.log(localStorage.getItem('admin_refresh_token'))
```

### Check Redux State
```javascript
// Install Redux DevTools extension
// Or check localStorage directly
```

### Check API Requests
```
DevTools → Network tab → Filter by /auth/
```

## 📝 Common Tasks

### Add New Protected Page
```typescript
// 1. Create page in management/src/app/admin/[feature]/page.tsx
// 2. Use useAuth hook to access user
// 3. ProtectedRoute in layout automatically protects it
```

### Add New API Endpoint
```typescript
// 1. Add method to authService
// 2. Use apiClient.get/post/put/delete
// 3. Token automatically included
```

### Handle Auth Errors
```typescript
const { error } = useAuth();
if (error) {
  // Display error to user
}
```

## 🚨 Important Notes

- Backend accepts any password for now (for testing)
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Token refresh happens automatically on 401
- Logout clears all tokens and redirects to login
- Protected routes prevent unauthorized access
- MFA not yet implemented (Phase 1.4.2)

## 📚 Documentation

- `ADMIN_AUTH_IMPLEMENTATION.md` - Complete implementation details
- `ADMIN_AUTH_TESTING_GUIDE.md` - Detailed testing guide
- `ADMIN_PANEL_AUTH_COMPLETE.md` - Full status and architecture
- `.kiro/specs/super-admin-panel/requirements.md` - Requirements
- `.kiro/specs/super-admin-panel/design.md` - Design document
- `.kiro/specs/super-admin-panel/tasks.md` - Implementation tasks

## 🎯 Next Steps

1. **Phase 1.5** - Implement sidebar and topbar
2. **Phase 2** - User management features
3. **Phase 3** - Dashboard and analytics
4. **Phase 4** - Booking management
5. **Phase 5** - Review management
6. **Phase 6** - Transaction management

---

**Status**: ✅ Authentication Complete - Ready for Phase 1.5
