# Koa Setup with JWT Auth & Permission Management

## Overview

Complete Koa.js setup with:
- ✅ JWT authentication (access + refresh tokens)
- ✅ Role-based access control (RBAC)
- ✅ Permission management system
- ✅ Database-driven roles and permissions
- ✅ Comprehensive Jest tests
- ✅ Middleware for auth and authorization

## What's Been Created

### 1. Package.json
- Koa and related dependencies
- JWT and bcrypt for security
- Jest for testing
- TypeScript support

### 2. Authentication Service (`src/services/auth.service.ts`)
- Generate access and refresh tokens
- Verify tokens
- Hash and compare passwords
- Extract tokens from headers
- Decode tokens

### 3. Permission Service (`src/services/permission.service.ts`)
- Role-based permissions
- Resource-based access control
- Company-level access control
- User-level access control
- Permission checking methods

### 4. Auth Middleware (`src/middleware/auth.middleware.ts`)
- `authMiddleware` - Verify JWT token
- `optionalAuthMiddleware` - Optional authentication
- `requireRole` - Require specific roles
- `requirePermission` - Require specific permission
- `requireCompanyAccess` - Require company access
- `requireUserAccess` - Require user access

### 5. Database Schema Updates
- `roles` table - System roles
- `permissions` table - System permissions
- `role_permissions` - Role-permission mapping
- `user_permissions` - Custom user permissions

### 6. Repositories
- `RoleRepository` - Manage roles
- `PermissionRepository` - Manage permissions

### 7. Jest Tests
- `auth.service.test.ts` - Auth service tests
- `permission.service.test.ts` - Permission service tests
- `api.integration.test.ts` - Full integration tests
- `setup.ts` - Jest configuration

## Database Schema

### Roles Table
```sql
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Permissions Table
```sql
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Role Permissions Junction Table
```sql
CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);
```

### User Permissions Junction Table
```sql
CREATE TABLE user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_permission (user_id, permission_id)
);
```

## Roles & Permissions

### SUPER_ADMIN
- All permissions
- Access to all resources
- Can manage all companies and users

### COMPANY_ADMIN
- User: read, create, update
- Company: read, update
- Agent: read, create, update
- Hotel: read, create, update
- Booking: read
- Review: read
- Admin: read, update

### AGENT
- User: read, update
- Company: read
- Agent: read, update
- Hotel: read, create, update
- Booking: read
- Review: read

### CUSTOMER
- User: read, update
- Hotel: read
- Booking: read, create
- Review: read, create

## Usage Examples

### 1. Generate Tokens
```typescript
import { authService } from '@/services/auth.service';
import { User } from '@/models/user';

const user = new User('user-123');
user.email = 'user@example.com';
user.role = 'CUSTOMER';

const { accessToken, refreshToken } = authService.generateTokens(user);
```

### 2. Verify Token
```typescript
const payload = authService.verifyAccessToken(accessToken);
if (payload) {
  console.log('Token is valid:', payload.userId);
}
```

### 3. Hash Password
```typescript
const password = 'SecurePassword123!';
const hash = await authService.hashPassword(password);

// Later, verify password
const isValid = await authService.comparePassword(password, hash);
```

### 4. Check Permissions
```typescript
import { permissionService } from '@/services/permission.service';

const user = {
  userId: 'user-123',
  email: 'user@example.com',
  role: 'CUSTOMER'
};

// Check if user can create booking
const canCreate = permissionService.canAccessResource(user, 'booking', 'create');

// Check if user can access company
const canAccess = permissionService.canAccessCompanyResource(user, 'comp-123');
```

### 5. Use Middleware in Koa
```typescript
import Koa from 'koa';
import Router from 'koa-router';
import { authMiddleware, requireRole, requirePermission } from '@/middleware/auth.middleware';

const app = new Koa();
const router = new Router();

// Protected route - requires authentication
router.get('/user/profile', authMiddleware, async (ctx) => {
  ctx.body = { user: ctx.user };
});

// Admin only route
router.delete('/user/:userId', 
  authMiddleware, 
  requireRole('SUPER_ADMIN'), 
  async (ctx) => {
    // Delete user
  }
);

// Permission-based route
router.post('/hotel', 
  authMiddleware, 
  requirePermission('hotel:create'), 
  async (ctx) => {
    // Create hotel
  }
);

app.use(router.routes());
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- auth.service.test.ts
```

## Test Coverage

### Auth Service Tests
- ✅ Generate tokens
- ✅ Verify access token
- ✅ Verify refresh token
- ✅ Hash password
- ✅ Compare password
- ✅ Extract token from header
- ✅ Decode token

### Permission Service Tests
- ✅ Get permissions by role
- ✅ Check if user has permission
- ✅ Access resource
- ✅ Access company resource
- ✅ Access user resource
- ✅ Manage agents
- ✅ Manage company
- ✅ Manage hotels
- ✅ View analytics

### Integration Tests
- ✅ Full authentication flow
- ✅ Invalid credentials
- ✅ Token extraction
- ✅ SUPER_ADMIN authorization
- ✅ COMPANY_ADMIN authorization
- ✅ AGENT authorization
- ✅ CUSTOMER authorization
- ✅ Token lifecycle
- ✅ Multi-role scenarios

## Environment Variables

```env
# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=booking_user
DB_PASSWORD=booking_password
DB_NAME=booking_platform
```

## Security Features

✅ **Password Hashing** - bcryptjs with salt rounds
✅ **JWT Tokens** - Secure token-based authentication
✅ **Token Expiry** - Access tokens expire in 24h, refresh in 7d
✅ **Role-Based Access** - Fine-grained permission control
✅ **Company Isolation** - Users can only access their company
✅ **User Isolation** - Users can only access their own profile
✅ **Permission Hierarchy** - SUPER_ADMIN > COMPANY_ADMIN > AGENT > CUSTOMER

## Next Steps

1. **Create Koa Server** - Set up main server file
2. **Create API Routes** - Implement endpoints
3. **Create Handlers** - Implement business logic
4. **Add Validation** - Validate request data
5. **Add Error Handling** - Consistent error responses
6. **Deploy** - Deploy to production

## File Structure

```
service/
├── package.json
├── jest.config.js
├── src/
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── permission.service.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── database/
│   │   └── repositories/
│   │       ├── role.repository.ts
│   │       └── permission.repository.ts
│   └── __tests__/
│       ├── setup.ts
│       ├── auth.service.test.ts
│       ├── permission.service.test.ts
│       └── api.integration.test.ts
└── database/
    ├── init.sql
    └── seed.sql
```

## Key Files

- `package.json` - Dependencies and scripts
- `src/services/auth.service.ts` - JWT and password management
- `src/services/permission.service.ts` - RBAC logic
- `src/middleware/auth.middleware.ts` - Koa middleware
- `src/database/repositories/role.repository.ts` - Role management
- `src/database/repositories/permission.repository.ts` - Permission management
- `database/init.sql` - Database schema
- `database/seed.sql` - Initial roles and permissions

## Testing Strategy

1. **Unit Tests** - Test individual services
2. **Integration Tests** - Test auth flow and permissions
3. **API Tests** - Test endpoints (next phase)
4. **Coverage** - Aim for 70%+ coverage

## Performance Considerations

- JWT tokens are stateless (no database lookup)
- Permissions cached in token payload
- Role-permission mapping cached in database
- Connection pooling for database queries

## Troubleshooting

### Invalid Token Error
- Check JWT_SECRET matches
- Verify token hasn't expired
- Ensure Bearer prefix in header

### Permission Denied Error
- Check user role
- Verify permission exists in database
- Check role-permission mapping

### Database Connection Error
- Verify MySQL is running
- Check database credentials
- Ensure database is initialized

---

**Status**: Koa setup with auth complete ✅
**Next**: Create API routes and handlers
