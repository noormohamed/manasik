# Clean Project Structure

This document outlines the cleaned-up project structure after removing unused legacy code.

## Directory Structure

```
service/src/
├── models/                          # Core foundation models (shared by all features)
│   ├── user.ts                      # User with role-based access control
│   ├── company.ts                   # Company/service provider organization
│   ├── base.ts                      # Base class utilities
│   ├── booking/
│   │   └── base-booking.ts          # Abstract base for all booking types
│   ├── review/
│   │   └── base-review.ts           # Abstract base for all review types
│   ├── management/
│   │   ├── agent.ts                 # Service provider (hotel owner, taxi firm, etc.)
│   │   └── company-admin.ts         # Company administrator
│   └── rates/                       # Rate/pricing models (to be implemented)
│
├── features/                        # Service-specific features (isolated)
│   ├── hotel/                       # Hotel booking feature
│   │   ├── models/
│   │   │   ├── hotel.ts
│   │   │   ├── room-type.ts
│   │   │   ├── hotel-booking.ts
│   │   │   ├── hotel-review.ts
│   │   │   └── index.ts
│   │   ├── handlers/
│   │   │   ├── hotel.handler.ts
│   │   │   ├── room-type.handler.ts
│   │   │   ├── hotel-booking.handler.ts
│   │   │   ├── hotel-review.handler.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── hotel.service.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── taxi/                        # Taxi feature (to be added)
│   ├── experience/                  # Experience feature (to be added)
│   ├── car/                         # Car rental feature (to be added)
│   ├── food/                        # Food service feature (to be added)
│   │
│   ├── README.md                    # Features guide
│   └── TEMPLATE.md                  # Template for new features
│
├── typing/
│   ├── roles.d.ts                   # Role and permission types
│   ├── error.d.ts                   # Error types
│   └── schema.zod.ts                # Zod validation schemas
│
├── middleware/
│   ├── token.ts                     # JWT token middleware
│   ├── token.ws.ts                  # WebSocket token middleware
│   ├── hmac.ts                      # HMAC signature middleware
│   ├── adminOnly.ts                 # Admin-only middleware
│   ├── error.ts                     # Error handling middleware
│   └── debug.ts                     # Debug middleware
│
├── handlers/
│   ├── users.ts                     # User management handlers
│   ├── payments.ts                  # Payment handlers
│   └── (feature-specific handlers in features/)
│
├── services/
│   ├── elastic.ts                   # Elasticsearch service
│   ├── encrypt.ts                   # Encryption service
│   ├── error.ts                     # Error handling service
│   ├── llama3.ts                    # LLM service
│   ├── elastic/                     # Elasticsearch utilities
│   ├── email/                       # Email service
│   ├── payments/                    # Payment service
│   ├── freshworks/                  # Freshworks CRM service
│   └── analytics/                   # Analytics service
│
├── servers/
│   ├── http.ts                      # HTTP server setup
│   └── websocket.ts                 # WebSocket server setup
│
├── emails/                          # Email templates
│   ├── email.register.html
│   ├── email.credit.purchase.html
│   └── email.credit.low.html
│
└── server.ts                        # Main server entry point
```

## What Was Removed

### Models
- ❌ `chat.ts` - Not using chat features
- ❌ `userCache.ts` - Not needed for booking platform
- ❌ `contact.ts` - Not part of core booking system
- ❌ `message.ts` - Not using messaging
- ❌ `presence.ts` - Not tracking presence
- ❌ `account.ts` - Rebuilding from scratch
- ❌ `trait.ts` - Not needed
- ❌ `booking/booking.ts` - Replaced by base-booking.ts

### Handlers
- ❌ `accounts.ts` - Rebuilding
- ❌ `chat.ts` - Not using chat
- ❌ `presence.ts` - Not tracking presence
- ❌ `discussions.ts` - Not needed
- ❌ `contact.ts` - Not needed

### Typing
- ❌ `chat.d.ts` - Not using chat
- ❌ `contact.d.ts` - Not needed
- ❌ `accounts.d.ts` - Rebuilding

### Validation
- ❌ `validate/chat.ts` - Not using chat

### Entity
- ❌ `entity/account.ts` - Rebuilding

### Data
- ❌ `data/user-1.json` - Old test data
- ❌ `data/user-3.json` - Old test data

## What Remains

### Core Models (Foundation)
- ✅ `user.ts` - User with roles
- ✅ `company.ts` - Company entity
- ✅ `base.ts` - Base utilities
- ✅ `booking/base-booking.ts` - Abstract booking base
- ✅ `review/base-review.ts` - Abstract review base
- ✅ `management/agent.ts` - Service provider
- ✅ `management/company-admin.ts` - Company admin

### Features
- ✅ `features/hotel/` - Complete hotel feature

### Middleware
- ✅ All middleware files (token, HMAC, admin, error, debug)

### Services
- ✅ Elasticsearch, encryption, error handling, LLM
- ✅ Email, payments, Freshworks, analytics services

### Servers
- ✅ HTTP and WebSocket servers

## Next Steps

1. **Implement Core Handlers**
   - User management
   - Authentication/Authorization
   - Payment processing

2. **Implement Hotel Feature Handlers**
   - Database persistence
   - Validation
   - Business logic

3. **Add API Routes**
   - Hotel endpoints
   - Booking endpoints
   - Review endpoints
   - Management endpoints

4. **Add Tests**
   - Unit tests for models
   - Integration tests for handlers
   - API tests for endpoints

5. **Add Additional Features**
   - Taxi
   - Experience
   - Car rental
   - Food service

## Development Guidelines

1. **Keep features isolated** - Each feature in its own folder
2. **Use consistent structure** - Follow the hotel feature pattern
3. **Extend base classes** - Use BaseBooking and BaseReview
4. **Document everything** - Create READMEs for each feature
5. **Write tests** - Test as you develop
6. **Use TypeScript** - Strict type checking
7. **Handle errors** - Consistent error handling
8. **Validate inputs** - Validate all user inputs

## File Organization

### Models
- Core models in `src/models/`
- Feature-specific models in `src/features/[feature]/models/`

### Handlers
- Core handlers in `src/handlers/`
- Feature-specific handlers in `src/features/[feature]/handlers/`

### Services
- Core services in `src/services/`
- Feature-specific services in `src/features/[feature]/services/`

### Types
- Core types in `src/typing/`
- Feature-specific types in `src/features/[feature]/types/`

## Import Paths

```typescript
// Core models
import { User, Company, Agent, CompanyAdmin } from '@/models';
import { BaseBooking } from '@/models/booking/base-booking';
import { BaseReview } from '@/models/review/base-review';

// Hotel feature
import { Hotel, RoomType, HotelBooking, HotelReview } from '@/features/hotel';
import { HotelHandler, RoomTypeHandler } from '@/features/hotel';
import { HotelService } from '@/features/hotel';

// Types
import { UserRole, ServiceType } from '@/typing/roles';
```

## Clean Slate Benefits

1. **No legacy code** - Fresh start with only what we need
2. **Clear structure** - Easy to understand and navigate
3. **Scalable** - Easy to add new features
4. **Maintainable** - Consistent patterns throughout
5. **Testable** - Clear separation of concerns
6. **Documented** - Each feature has documentation

## Getting Started

1. Review the architecture in `ARCHITECTURE.md`
2. Check the quick start guide in `QUICK_START.md`
3. Look at the hotel feature as an example in `features/hotel/`
4. Follow the features structure guide in `FEATURES_STRUCTURE.md`
5. Start implementing handlers and API routes

## Questions?

Refer to:
- `ARCHITECTURE.md` - System design and patterns
- `QUICK_START.md` - Quick reference for common tasks
- `FEATURES_STRUCTURE.md` - How to add new features
- `features/hotel/README.md` - Hotel feature documentation
- `features/README.md` - Features guide
