# Super Admin Panel - Design Document

## Architecture Overview

The Super Admin Panel is a comprehensive administrative dashboard built as a separate Next.js application that connects to the existing booking platform backend. It provides centralized management and monitoring of all platform entities.

### System Components

```
Admin Frontend (Next.js/React)
├── Authentication Layer
│   ├── Login/MFA
│   └── Session Management
├── Core Pages
│   ├── Dashboard (metrics & overview)
│   ├── Users Management
│   ├── Bookings Management
│   ├── Reviews Management
│   ├── Transactions Management
│   ├── Analytics & Reporting
│   ├── Audit Log Viewer
│   └── Settings
├── Shared Components
│   ├── Navigation/Sidebar
│   ├── Data Tables (with search, filter, sort, pagination)
│   ├── Detail Views
│   ├── Action Modals
│   ├── Notifications
│   └── Export Utilities
└── State Management (Redux/Context)

Backend API (Node.js/Koa)
├── Admin Authentication Routes
│   ├── POST /api/admin/auth/login
│   ├── POST /api/admin/auth/logout
│   ├── POST /api/admin/auth/verify-mfa
│   └── POST /api/admin/auth/refresh-token
├── Admin Data Routes
│   ├── GET /api/admin/users (list, search, filter)
│   ├── GET /api/admin/users/:id (detail)
│   ├── POST /api/admin/users/:id/suspend
│   ├── POST /api/admin/users/:id/reactivate
│   ├── POST /api/admin/users/:id/reset-password
│   ├── GET /api/admin/bookings (list, search, filter)
│   ├── GET /api/admin/bookings/:id (detail)
│   ├── POST /api/admin/bookings/:id/cancel
│   ├── POST /api/admin/bookings/:id/refund
│   ├── GET /api/admin/reviews (list, search, filter)
│   ├── GET /api/admin/reviews/:id (detail)
│   ├── POST /api/admin/reviews/:id/approve
│   ├── POST /api/admin/reviews/:id/reject
│   ├── POST /api/admin/reviews/:id/flag
│   ├── POST /api/admin/reviews/:id/delete
│   ├── GET /api/admin/transactions (list, search, filter)
│   ├── GET /api/admin/transactions/:id (detail)
│   ├── POST /api/admin/transactions/:id/dispute
│   ├── GET /api/admin/analytics/dashboard
│   ├── GET /api/admin/analytics/charts
│   ├── GET /api/admin/audit-log (list, search, filter)
│   └── GET /api/admin/export (CSV, JSON, PDF)
├── Admin Metrics Service
│   ├── Dashboard metrics calculation
│   ├── Analytics data aggregation
│   └── Caching layer
└── Audit Logging Service
    ├── Action logging
    ├── Change tracking
    └── Compliance reporting

Database (PostgreSQL)
├── admin_users (super admin accounts)
├── admin_sessions (session management)
├── audit_logs (comprehensive action logging)
├── admin_alerts (alert configuration & history)
└── admin_preferences (user settings)
```

## Database Schema

### New Tables

```sql
-- Super Admin Users
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  created_by_id INTEGER REFERENCES admin_users(id)
);

-- Admin Sessions
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id),
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id),
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_entity_type (entity_type)
);

-- Admin Alerts
CREATE TABLE admin_alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  threshold_value DECIMAL(10, 2),
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alert History
CREATE TABLE alert_history (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER NOT NULL REFERENCES admin_alerts(id),
  triggered_at TIMESTAMP NOT NULL,
  current_value DECIMAL(10, 2),
  acknowledged_by_id INTEGER REFERENCES admin_users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Preferences
CREATE TABLE admin_preferences (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL UNIQUE REFERENCES admin_users(id),
  theme VARCHAR(20) DEFAULT 'light',
  items_per_page INTEGER DEFAULT 25,
  notifications_enabled BOOLEAN DEFAULT true,
  email_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Design

### Authentication Endpoints

```
POST /api/admin/auth/login
Request:
{
  "email": "admin@platform.com",
  "password": "secure_password"
}
Response:
{
  "success": true,
  "requiresMFA": false,
  "token": "jwt_token",
  "expiresIn": 86400
}

POST /api/admin/auth/verify-mfa
Request:
{
  "mfaCode": "123456",
  "tempToken": "temp_jwt"
}
Response:
{
  "success": true,
  "token": "jwt_token",
  "expiresIn": 86400
}

POST /api/admin/auth/logout
Response:
{
  "success": true
}
```

### Users Management Endpoints

```
GET /api/admin/users?page=1&limit=25&search=email&filter=status:ACTIVE&sort=created_at:desc
Response:
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "registeredAt": "2024-01-15T10:30:00Z",
      "lastLoginAt": "2024-01-20T14:22:00Z",
      "bookingCount": 5,
      "totalSpent": 1250.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 342,
    "totalPages": 14
  }
}

GET /api/admin/users/:id
Response:
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "registeredAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-20T14:22:00Z",
  "bookings": {
    "total": 5,
    "recent": [...]
  },
  "reviews": {
    "total": 4,
    "averageRating": 4.5,
    "recent": [...]
  },
  "transactions": {
    "total": 5,
    "totalSpent": 1250.00,
    "recent": [...]
  }
}

POST /api/admin/users/:id/suspend
Request:
{
  "reason": "Suspicious activity detected"
}
Response:
{
  "success": true,
  "user": { ... }
}

POST /api/admin/users/:id/reactivate
Response:
{
  "success": true,
  "user": { ... }
}

POST /api/admin/users/:id/reset-password
Response:
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Bookings Management Endpoints

```
GET /api/admin/bookings?page=1&limit=25&search=booking_id&filter=status:CONFIRMED,serviceType:HOTEL&dateRange=2024-01-01:2024-01-31&amountRange=100:5000
Response:
{
  "data": [
    {
      "id": "BK001",
      "customerId": 1,
      "customerName": "John Doe",
      "serviceType": "HOTEL",
      "serviceName": "Grand Hotel",
      "bookingDate": "2024-01-15T10:30:00Z",
      "checkInDate": "2024-01-20T00:00:00Z",
      "status": "CONFIRMED",
      "totalAmount": 450.00,
      "currency": "USD"
    }
  ],
  "pagination": { ... }
}

GET /api/admin/bookings/:id
Response:
{
  "id": "BK001",
  "customerId": 1,
  "customerName": "John Doe",
  "serviceType": "HOTEL",
  "serviceName": "Grand Hotel",
  "bookingDate": "2024-01-15T10:30:00Z",
  "checkInDate": "2024-01-20T00:00:00Z",
  "checkOutDate": "2024-01-23T00:00:00Z",
  "status": "CONFIRMED",
  "totalAmount": 450.00,
  "currency": "USD",
  "pricingBreakdown": {
    "roomRate": 150.00,
    "nights": 3,
    "subtotal": 450.00,
    "taxes": 45.00,
    "total": 495.00
  },
  "timeline": [
    {
      "status": "PENDING",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "status": "CONFIRMED",
      "timestamp": "2024-01-15T11:00:00Z"
    }
  ],
  "payment": {
    "method": "CREDIT_CARD",
    "transactionId": "TXN001",
    "paidAt": "2024-01-15T11:00:00Z"
  },
  "cancellation": null,
  "refund": null
}

POST /api/admin/bookings/:id/cancel
Request:
{
  "reason": "Customer requested cancellation"
}
Response:
{
  "success": true,
  "booking": { ... }
}

POST /api/admin/bookings/:id/refund
Request:
{
  "amount": 450.00,
  "reason": "Partial refund for service issues"
}
Response:
{
  "success": true,
  "booking": { ... }
}
```

### Reviews Management Endpoints

```
GET /api/admin/reviews?page=1&limit=25&search=review_id&filter=status:PENDING,rating:5&dateRange=2024-01-01:2024-01-31&serviceType=HOTEL
Response:
{
  "data": [
    {
      "id": "REV001",
      "reviewerId": 1,
      "reviewerName": "John Doe",
      "serviceType": "HOTEL",
      "serviceName": "Grand Hotel",
      "rating": 5,
      "reviewDate": "2024-01-23T15:30:00Z",
      "status": "PENDING",
      "preview": "Great hotel, excellent service..."
    }
  ],
  "pagination": { ... }
}

GET /api/admin/reviews/:id
Response:
{
  "id": "REV001",
  "reviewerId": 1,
  "reviewerName": "John Doe",
  "serviceType": "HOTEL",
  "serviceName": "Grand Hotel",
  "rating": 5,
  "reviewDate": "2024-01-23T15:30:00Z",
  "status": "PENDING",
  "text": "Great hotel, excellent service and clean rooms...",
  "moderationNotes": null
}

POST /api/admin/reviews/:id/approve
Response:
{
  "success": true,
  "review": { ... }
}

POST /api/admin/reviews/:id/reject
Request:
{
  "reason": "Inappropriate language"
}
Response:
{
  "success": true,
  "review": { ... }
}

POST /api/admin/reviews/:id/flag
Request:
{
  "reason": "Suspicious review pattern"
}
Response:
{
  "success": true,
  "review": { ... }
}

POST /api/admin/reviews/:id/delete
Request:
{
  "reason": "Spam content"
}
Response:
{
  "success": true,
  "message": "Review deleted"
}
```

### Transactions Management Endpoints

```
GET /api/admin/transactions?page=1&limit=25&search=transaction_id&filter=type:PAYMENT,status:COMPLETED&dateRange=2024-01-01:2024-01-31&amountRange=100:5000&currency=USD
Response:
{
  "data": [
    {
      "id": "TXN001",
      "userId": 1,
      "userName": "John Doe",
      "type": "PAYMENT",
      "amount": 450.00,
      "currency": "USD",
      "date": "2024-01-15T11:00:00Z",
      "status": "COMPLETED",
      "bookingId": "BK001"
    }
  ],
  "pagination": { ... }
}

GET /api/admin/transactions/:id
Response:
{
  "id": "TXN001",
  "userId": 1,
  "userName": "John Doe",
  "type": "PAYMENT",
  "amount": 450.00,
  "currency": "USD",
  "date": "2024-01-15T11:00:00Z",
  "status": "COMPLETED",
  "bookingId": "BK001",
  "paymentMethod": "CREDIT_CARD",
  "gatewayResponse": {
    "code": "SUCCESS",
    "message": "Transaction approved"
  },
  "dispute": null
}

POST /api/admin/transactions/:id/dispute
Request:
{
  "reason": "Unauthorized charge",
  "amount": 450.00
}
Response:
{
  "success": true,
  "transaction": { ... }
}
```

### Analytics Endpoints

```
GET /api/admin/analytics/dashboard
Response:
{
  "metrics": {
    "totalUsers": 5432,
    "totalBookings": 12543,
    "totalRevenue": 2543210.50,
    "averageBookingValue": 202.50,
    "platformUptime": 99.95,
    "totalReviews": 8932,
    "averageRating": 4.6,
    "pendingTransactions": 23
  },
  "lastUpdated": "2024-01-20T14:22:00Z"
}

GET /api/admin/analytics/charts?dateRange=last_30_days&metrics=bookings,revenue,ratings
Response:
{
  "bookingVolume": [
    { "date": "2024-01-01", "count": 342 },
    { "date": "2024-01-02", "count": 356 }
  ],
  "revenue": [
    { "date": "2024-01-01", "amount": 45230.50 },
    { "date": "2024-01-02", "amount": 48920.75 }
  ],
  "bookingsByServiceType": [
    { "type": "HOTEL", "count": 8932 },
    { "type": "TAXI", "count": 2341 }
  ],
  "revenueByServiceType": [
    { "type": "HOTEL", "amount": 1923450.00 },
    { "type": "TAXI", "amount": 456230.50 }
  ],
  "topServiceProviders": [
    { "name": "Grand Hotel", "bookings": 234, "revenue": 45230.50 }
  ],
  "averageRatingTrend": [
    { "date": "2024-01-01", "rating": 4.5 },
    { "date": "2024-01-02", "rating": 4.6 }
  ],
  "ratingDistribution": [
    { "stars": 5, "count": 4500 },
    { "stars": 4, "count": 2800 }
  ]
}
```

### Audit Log Endpoints

```
GET /api/admin/audit-log?page=1&limit=25&filter=actionType:SUSPEND,entityType:USER&dateRange=2024-01-01:2024-01-31&adminName=admin@platform.com
Response:
{
  "data": [
    {
      "id": 1,
      "adminName": "admin@platform.com",
      "actionType": "SUSPEND",
      "entityType": "USER",
      "entityId": 123,
      "reason": "Suspicious activity",
      "timestamp": "2024-01-20T14:22:00Z",
      "ipAddress": "192.168.1.1"
    }
  ],
  "pagination": { ... }
}
```

### Export Endpoints

```
GET /api/admin/export?type=users&format=csv&filters=status:ACTIVE
Response: CSV file download

GET /api/admin/export?type=bookings&format=json&filters=status:COMPLETED&dateRange=2024-01-01:2024-01-31
Response: JSON file download

GET /api/admin/export?type=transactions&format=pdf&filters=status:COMPLETED
Response: PDF file download
```

## Frontend Architecture

### Page Structure

```
/admin
├── /login (public)
├── /mfa-verify (public)
├── /dashboard (protected)
├── /users
│   ├── / (list)
│   └── /:id (detail)
├── /bookings
│   ├── / (list)
│   └── /:id (detail)
├── /reviews
│   ├── / (list)
│   └── /:id (detail)
├── /transactions
│   ├── / (list)
│   └── /:id (detail)
├── /analytics
├── /audit-log
└── /settings
```

### Component Hierarchy

```
AdminLayout
├── Sidebar Navigation
├── TopBar
│   ├── Breadcrumbs
│   ├── Search
│   ├── Notifications
│   └── User Menu
└── MainContent
    ├── PageHeader
    └── PageContent
        ├── DataTable (for list pages)
        │   ├── SearchBar
        │   ├── FilterPanel
        │   ├── Table
        │   └── Pagination
        ├── DetailView (for detail pages)
        │   ├── Header
        │   ├── Tabs/Sections
        │   ├── ActionButtons
        │   └── RelatedData
        └── Charts (for analytics)
```

### State Management

Using Redux with slices for:
- `auth` - Authentication state
- `users` - Users list and detail
- `bookings` - Bookings list and detail
- `reviews` - Reviews list and detail
- `transactions` - Transactions list and detail
- `analytics` - Analytics data
- `auditLog` - Audit log data
- `ui` - UI state (modals, notifications, etc.)

## Correctness Properties

### Property 1: Authentication & Authorization
**Validates: Requirements 1.1-1.7**

Only users with Super_Admin role can access the admin panel. All access attempts are logged.

```
Property: forall access_attempts,
  IF user.role != SUPER_ADMIN THEN access_denied AND logged_to_audit_log
  IF user.role == SUPER_ADMIN AND session_valid THEN access_granted
```

### Property 2: Dashboard Metrics Accuracy
**Validates: Requirements 2.1-2.10**

Dashboard metrics are calculated correctly and updated within 2 seconds.

```
Property: forall metrics,
  metric_value == correct_calculation(database_data) AND
  calculation_time <= 2000ms
```

### Property 3: User Search & Filter Correctness
**Validates: Requirements 3.1-3.11**

Search and filter operations return only matching users with correct pagination.

```
Property: forall search_queries,
  forall returned_users,
    user_matches_search_criteria(user, query) AND
    user_matches_all_active_filters(user, filters)
```

### Property 4: Data Consistency in Detail Views
**Validates: Requirements 4.1-4.14, 6.1-6.15, 8.1-8.14, 10.1-10.13**

Detail views display complete and consistent data from the database.

```
Property: forall detail_views,
  displayed_data == database_data AND
  all_related_data_loaded AND
  no_stale_data_displayed
```

### Property 5: Audit Log Completeness
**Validates: Requirements 13.1-13.13**

All administrative actions are logged with complete information.

```
Property: forall admin_actions,
  action_logged_to_audit_log AND
  log_contains(action_type, admin_id, timestamp, entity_type, entity_id, reason, ip_address)
```

### Property 6: Export Data Integrity
**Validates: Requirements 12.1-12.10**

Exported data matches displayed data and respects all active filters.

```
Property: forall export_operations,
  exported_data == displayed_data AND
  export_respects_filters AND
  export_respects_search AND
  export_generation_time <= 5000ms
```

### Property 7: Performance Requirements
**Validates: Requirements 17.1-17.10**

All pages and operations meet performance requirements.

```
Property: forall operations,
  dashboard_load_time <= 2000ms AND
  list_page_load_time <= 2000ms AND
  detail_page_load_time <= 1000ms AND
  search_time <= 1000ms AND
  filter_time <= 1000ms
```

### Property 8: Security & Data Protection
**Validates: Requirements 18.1-18.11**

All data is encrypted in transit and at rest. Sensitive data is masked in logs.

```
Property: forall data_transfers,
  data_encrypted_in_transit AND
  sensitive_data_encrypted_at_rest AND
  sensitive_data_masked_in_logs
```

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up Next.js admin application structure
- Implement authentication (login, MFA, session management)
- Create database schema for admin users and audit logs
- Implement basic API endpoints for authentication

### Phase 2: Core Management Features (Weeks 3-5)
- Implement users management (list, search, filter, detail, actions)
- Implement bookings management (list, search, filter, detail, actions)
- Implement reviews management (list, search, filter, detail, actions)
- Implement transactions management (list, search, filter, detail, actions)
- Create shared data table component with search, filter, sort, pagination

### Phase 3: Analytics & Reporting (Weeks 6-7)
- Implement dashboard metrics calculation
- Implement analytics charts and visualizations
- Implement data export functionality (CSV, JSON, PDF)
- Create analytics page with date range selection

### Phase 4: Advanced Features (Weeks 8-9)
- Implement audit log viewer
- Implement alert system and notifications
- Implement admin settings and preferences
- Implement help and documentation

### Phase 5: Testing & Optimization (Weeks 10-11)
- Unit tests for all components and services
- Integration tests for API endpoints
- E2E tests for critical workflows
- Performance optimization and caching
- Security audit and hardening

### Phase 6: Deployment & Documentation (Week 12)
- Deployment to staging environment
- User acceptance testing
- Documentation and training materials
- Production deployment

## Technology Stack

**Frontend:**
- Next.js 14+ (React framework)
- TypeScript (type safety)
- Redux Toolkit (state management)
- React Query (data fetching and caching)
- Tailwind CSS (styling)
- Recharts (data visualization)
- React Table (data tables)
- Zod (form validation)

**Backend:**
- Node.js with Koa (existing)
- PostgreSQL (existing)
- JWT (authentication)
- bcrypt (password hashing)
- Joi (validation)

**Testing:**
- Jest (unit tests)
- Supertest (API tests)
- Playwright (E2E tests)
- fast-check (property-based tests)

**Deployment:**
- Docker (containerization)
- Docker Compose (orchestration)
- Nginx (reverse proxy)

## Security Considerations

1. **Authentication**: JWT tokens with 24-hour expiration, MFA support
2. **Authorization**: Role-based access control (RBAC) - Super_Admin only
3. **Data Protection**: HTTPS/TLS for all communications, encryption at rest for sensitive data
4. **Input Validation**: All inputs validated and sanitized
5. **CSRF Protection**: CSRF tokens for all state-changing operations
6. **Rate Limiting**: Rate limiting on authentication endpoints
7. **Audit Logging**: Comprehensive logging of all administrative actions
8. **Session Management**: Secure session storage, timeout after 24 hours
9. **Data Masking**: Sensitive data masked in logs and exports
10. **Access Logging**: All access attempts logged

## Performance Optimization

1. **Caching**: Redis caching for frequently accessed data (5-minute TTL)
2. **Pagination**: Server-side pagination with configurable page sizes
3. **Lazy Loading**: Lazy load related data in detail views
4. **Database Indexing**: Indexes on frequently queried columns
5. **Query Optimization**: Optimized queries with proper joins
6. **Frontend Optimization**: Code splitting, lazy loading of routes
7. **API Response Compression**: Gzip compression for API responses
8. **Database Connection Pooling**: Connection pooling for database

## Monitoring & Logging

1. **Application Logging**: Structured logging with Winston
2. **Error Tracking**: Sentry for error tracking and reporting
3. **Performance Monitoring**: Application performance monitoring (APM)
4. **Audit Logging**: Comprehensive audit trail of all actions
5. **Health Checks**: Regular health checks of API endpoints
6. **Metrics**: Prometheus metrics for monitoring

