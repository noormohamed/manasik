# Super Admin Panel - Architecture & Data Flow

## Overview

The Super Admin Panel is a Next.js application that connects directly to the existing booking platform database. It provides centralized management and analytics for all platform entities without requiring a separate database schema.

## Data Architecture

### Shared Database
All three applications (Frontend, API, Management) connect to the same `booking_platform` MySQL database.

```
┌─────────────────────────────────────────────────────────┐
│                  booking_platform DB                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Core Tables:                                            │
│  ├── users (100 users)                                  │
│  ├── roles (SUPER_ADMIN, COMPANY_ADMIN, AGENT, CUSTOMER)
│  ├── permissions                                         │
│  ├── companies (10 companies)                           │
│  ├── agents (20 agents)                                 │
│  ├── hotels (50 hotels)                                 │
│  ├── room_types                                         │
│  ├── bookings (all bookings)                            │
│  ├── reviews (all reviews)                              │
│  └── ... (other platform tables)                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Application Architecture

### Three-Tier Application Stack

```
┌──────────────────────────────────────────────────────────────┐
│                    Docker Network                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Frontend      │  │   Management     │  │     API     │ │
│  │  (Port 3000)    │  │   (Port 3002)    │  │ (Port 3001) │ │
│  │                 │  │                  │  │             │ │
│  │ Next.js App     │  │  Next.js Admin   │  │ Node/Koa    │ │
│  │ Customer UI     │  │  Super Admin UI  │  │ Backend     │ │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬────┘ │
│           │                    │                     │       │
│           └────────────────────┼─────────────────────┘       │
│                                │                             │
│                        ┌───────▼────────┐                    │
│                        │  MySQL 8.0     │                    │
│                        │  (Port 3306)   │                    │
│                        │                │                    │
│                        │ booking_       │                    │
│                        │ platform DB    │                    │
│                        └────────────────┘                    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Management Flow
```
Management Panel
    ↓
API (/api/admin/users)
    ↓
Database (users table)
    ↓
Returns: User list, details, actions (suspend, reactivate, reset password)
```

### Bookings Management Flow
```
Management Panel
    ↓
API (/api/admin/bookings)
    ↓
Database (bookings table + related tables)
    ↓
Returns: Booking list, details, actions (cancel, refund)
```

### Reviews Management Flow
```
Management Panel
    ↓
API (/api/admin/reviews)
    ↓
Database (reviews table)
    ↓
Returns: Review list, details, actions (approve, reject, flag, delete)
```

### Analytics Flow
```
Management Panel
    ↓
API (/api/admin/analytics)
    ↓
Database (aggregates from multiple tables)
    ↓
Returns: Dashboard metrics, charts, trends
```

## Database Tables Used

### User Management
- `users` - All platform users
- `roles` - User roles (SUPER_ADMIN, COMPANY_ADMIN, AGENT, CUSTOMER)
- `permissions` - Role permissions
- `user_permissions` - User-specific permissions

### Booking Management
- `bookings` - All bookings
- `hotels` - Hotel properties
- `room_types` - Room types
- `companies` - Service providers
- `agents` - Service agents

### Review Management
- `reviews` - All reviews and ratings
- `users` - Reviewer information
- `hotels` - Reviewed properties

### Analytics
- `bookings` - For booking metrics
- `reviews` - For rating metrics
- `users` - For user metrics
- `hotels` - For property metrics
- `companies` - For provider metrics

## API Endpoints (to be implemented)

### Authentication
```
POST /api/admin/auth/login
POST /api/admin/auth/logout
POST /api/admin/auth/verify-mfa
POST /api/admin/auth/refresh-token
```

### Users Management
```
GET /api/admin/users (list, search, filter)
GET /api/admin/users/:id (detail)
POST /api/admin/users/:id/suspend
POST /api/admin/users/:id/reactivate
POST /api/admin/users/:id/reset-password
```

### Bookings Management
```
GET /api/admin/bookings (list, search, filter)
GET /api/admin/bookings/:id (detail)
POST /api/admin/bookings/:id/cancel
POST /api/admin/bookings/:id/refund
```

### Reviews Management
```
GET /api/admin/reviews (list, search, filter)
GET /api/admin/reviews/:id (detail)
POST /api/admin/reviews/:id/approve
POST /api/admin/reviews/:id/reject
POST /api/admin/reviews/:id/flag
POST /api/admin/reviews/:id/delete
```

### Transactions Management
```
GET /api/admin/transactions (list, search, filter)
GET /api/admin/transactions/:id (detail)
POST /api/admin/transactions/:id/dispute
```

### Analytics
```
GET /api/admin/analytics/dashboard
GET /api/admin/analytics/charts
GET /api/admin/export
```

## Authentication & Authorization

### Super Admin Role
- Only users with `SUPER_ADMIN` role can access the management panel
- Authenticated via JWT tokens
- Session timeout: 24 hours
- Optional MFA support

### Access Control
- Role-based access control (RBAC)
- All admin actions logged to audit trail
- Sensitive operations require re-authentication

## Data Security

### In Transit
- All API calls use HTTPS/TLS
- JWT tokens in Authorization header
- Automatic token refresh on expiry

### At Rest
- Passwords hashed with bcrypt
- Sensitive data encrypted in database
- Audit logs immutable

### Audit Trail
- All admin actions logged
- Timestamp, admin ID, action type, entity, old/new values
- Retention: 2 years minimum

## Performance Considerations

### Caching
- Dashboard metrics cached for 5 minutes
- Analytics data cached for 5 minutes
- User list cached for 1 minute

### Database Optimization
- Indexes on frequently queried columns
- Pagination for large datasets
- Query optimization for aggregations

### Frontend Optimization
- Code splitting by route
- Lazy loading of components
- Redux for state management
- React Query for data fetching

## Scalability

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Load balancing ready

### Vertical Scaling
- Efficient queries with proper indexing
- Caching strategies
- Pagination for large datasets

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up -d

# Access services
Frontend:    http://localhost:3000
Management:  http://localhost:3002
API:         http://localhost:3001
```

### Testing
- Unit tests for API endpoints
- Integration tests for database operations
- E2E tests for user workflows
- Property-based tests for correctness

### Deployment
- Docker containers for all services
- Environment-specific configurations
- Health checks and monitoring
- Automated backups

## Next Steps

### Phase 1.2: Authentication Backend
- Implement admin login endpoint
- JWT token generation
- MFA support
- Session management

### Phase 1.3: Authentication Frontend
- Login page component
- MFA verification page
- Protected routes
- Session persistence

### Phase 1.4: Admin Layout
- Sidebar navigation
- Top bar with user menu
- Responsive design
- Keyboard shortcuts

### Phase 2: Core Features
- Users management
- Bookings management
- Reviews management
- Transactions management

### Phase 3: Analytics
- Dashboard metrics
- Charts and visualizations
- Data export
- Trend analysis

## Key Benefits

1. **No Duplicate Data** - Uses existing platform tables
2. **Real-time Data** - Direct access to live data
3. **Simplified Maintenance** - Single source of truth
4. **Consistent Schema** - Same database structure
5. **Easy Integration** - Reuses existing API patterns
6. **Scalable** - Leverages existing infrastructure

## Conclusion

The Super Admin Panel is a lightweight, efficient admin interface that connects directly to the existing booking platform database. It provides comprehensive management and analytics capabilities without requiring separate data storage or complex synchronization logic.
