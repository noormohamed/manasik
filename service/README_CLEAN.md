# Booking Platform - Clean Build

A scalable, extensible multi-service booking platform built from scratch with a clean architecture.

## Overview

This is a complete rebuild of the booking platform with:
- ✅ Clean, focused codebase
- ✅ Extensible architecture for multiple service types
- ✅ Three core features: Booking, Reviews, Management
- ✅ Hotel feature as the first implementation
- ✅ Role-based access control
- ✅ Isolated feature modules

## Quick Start

### Core Concepts

**Three Core Features:**
1. **Booking** - Create, manage, and track bookings
2. **Reviews** - Submit and manage reviews for services
3. **Management** - Manage companies, agents, and service providers

**User Roles:**
- `SUPER_ADMIN` - System administrator
- `COMPANY_ADMIN` - Company manager
- `AGENT` - Service provider (hotel owner, taxi firm, etc.)
- `CUSTOMER` - End user

**Service Types:**
- `HOTEL` - Hotel bookings (implemented)
- `TAXI` - Taxi service (to be added)
- `EXPERIENCE` - Experiences (to be added)
- `CAR` - Car rental (to be added)
- `FOOD` - Food delivery (to be added)

### Project Structure

```
src/
├── models/              # Core foundation (shared by all features)
├── features/            # Service-specific features (isolated)
├── typing/              # TypeScript types
├── middleware/          # Express middleware
├── handlers/            # Core handlers
├── services/            # Core services
└── servers/             # HTTP and WebSocket servers
```

### Key Files

- `ARCHITECTURE.md` - System design and patterns
- `QUICK_START.md` - Quick reference guide
- `FEATURES_STRUCTURE.md` - How to add new features
- `CLEAN_STRUCTURE.md` - What was removed and why
- `IMPLEMENTATION_CHECKLIST.md` - Development roadmap

## Core Models

### User
```typescript
import { User } from '@/models/user';

const user = new User('user-123');
user.role = 'AGENT';
user.companyId = 'comp-456';
user.serviceType = 'HOTEL';
```

### Company
```typescript
import { Company } from '@/models/company';

const company = Company.create({
  id: 'comp-123',
  name: 'Grand Hotels Inc',
  serviceType: 'HOTEL',
  email: 'contact@grandhotels.com'
});
```

### Agent
```typescript
import { Agent } from '@/models/management/agent';

const agent = Agent.create({
  id: 'agent-123',
  userId: 'user-456',
  companyId: 'comp-123',
  serviceType: 'HOTEL',
  name: 'John Manager',
  email: 'john@grandhotels.com'
});
```

### CompanyAdmin
```typescript
import { CompanyAdmin } from '@/models/management/company-admin';

const admin = CompanyAdmin.create({
  id: 'admin-123',
  userId: 'user-789',
  companyId: 'comp-123',
  adminRole: 'OWNER',
  name: 'Jane Owner',
  email: 'jane@grandhotels.com'
});
```

## Hotel Feature

The hotel feature is a complete example of how to build service-specific features.

### Models
```typescript
import { Hotel, RoomType, HotelBooking, HotelReview } from '@/features/hotel';

// Create hotel
const hotel = Hotel.create({
  id: 'hotel-123',
  companyId: 'comp-456',
  agentId: 'agent-789',
  name: 'Grand Hotel',
  description: 'Luxury hotel',
  location: { /* ... */ }
});

// Create room type
const roomType = RoomType.create({
  id: 'room-type-123',
  hotelId: 'hotel-456',
  name: 'Deluxe Double',
  capacity: 2,
  totalRooms: 20,
  basePrice: 250
});

// Create booking
const booking = HotelBooking.create({
  id: 'booking-123',
  companyId: 'comp-123',
  customerId: 'cust-456',
  currency: 'USD',
  subtotal: 500,
  tax: 50,
  total: 550,
  metadata: { /* ... */ }
});

// Create review
const review = HotelReview.create({
  id: 'review-123',
  bookingId: 'booking-456',
  companyId: 'comp-123',
  customerId: 'cust-789',
  rating: 4,
  title: 'Great stay!',
  comment: 'Excellent service',
  criteria: { /* ... */ }
});
```

### Handlers
```typescript
import { HotelHandler, RoomTypeHandler, HotelBookingHandler, HotelReviewHandler } from '@/features/hotel';

const hotelHandler = new HotelHandler();
const hotel = await hotelHandler.createHotel({ /* params */ });

const roomTypeHandler = new RoomTypeHandler();
const roomType = await roomTypeHandler.createRoomType({ /* params */ });

const bookingHandler = new HotelBookingHandler();
const booking = await bookingHandler.createBooking({ /* params */ });

const reviewHandler = new HotelReviewHandler();
const review = await reviewHandler.createReview({ /* params */ });
```

### Service
```typescript
import { HotelService } from '@/features/hotel';

const service = new HotelService();
const details = await service.getHotelWithDetails('hotel-123');
const results = await service.searchHotels({ city: 'New York' });
const stats = await service.getHotelStats('hotel-123');
```

## Adding a New Feature

Follow the hotel feature as a template:

1. Create folder structure: `src/features/[feature-name]/{models,handlers,services,types}`
2. Create types in `types/index.ts`
3. Create models extending BaseBooking and BaseReview
4. Create handlers for CRUD operations
5. Create service for business logic
6. Export everything from `index.ts`
7. Create `README.md` with documentation

See `FEATURES_STRUCTURE.md` for detailed instructions.

## Development Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Core models (User, Company, Agent, CompanyAdmin)
- [x] Base classes (BaseBooking, BaseReview)
- [x] Hotel feature (complete)
- [x] Clean architecture

### Phase 2: Handlers & API Routes (NEXT)
- [ ] Implement database persistence
- [ ] Create API routes
- [ ] Add validation middleware
- [ ] Add authentication/authorization

### Phase 3: Additional Features
- [ ] Taxi feature
- [ ] Experience feature
- [ ] Car rental feature
- [ ] Food service feature

### Phase 4: Advanced Features
- [ ] Notifications
- [ ] Analytics
- [ ] Reporting
- [ ] Search & filtering

See `IMPLEMENTATION_CHECKLIST.md` for complete roadmap.

## Architecture Principles

1. **Extensibility** - Easy to add new service types
2. **Isolation** - Features don't contaminate core code
3. **Consistency** - All features follow the same pattern
4. **Clarity** - Clear separation of concerns
5. **Testability** - Easy to test each component
6. **Scalability** - Designed to grow

## Documentation

- **ARCHITECTURE.md** - System design, patterns, and principles
- **QUICK_START.md** - Quick reference for common tasks
- **FEATURES_STRUCTURE.md** - How to add new features
- **CLEAN_STRUCTURE.md** - What was removed and why
- **IMPLEMENTATION_CHECKLIST.md** - Development roadmap
- **features/hotel/README.md** - Hotel feature documentation
- **features/README.md** - Features guide

## Next Steps

1. **Review the architecture** - Read `ARCHITECTURE.md`
2. **Check the quick start** - Read `QUICK_START.md`
3. **Examine the hotel feature** - Look at `features/hotel/`
4. **Implement handlers** - Start with database persistence
5. **Create API routes** - Build REST endpoints
6. **Add tests** - Write unit and integration tests
7. **Add new features** - Follow the hotel pattern

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (planned)
- **Search**: Elasticsearch
- **Cache**: Redis (planned)
- **Authentication**: JWT
- **Validation**: Zod

## File Organization

```
src/
├── models/                  # Core foundation
│   ├── user.ts
│   ├── company.ts
│   ├── base.ts
│   ├── booking/
│   ├── review/
│   └── management/
├── features/                # Service-specific
│   ├── hotel/
│   ├── taxi/
│   ├── experience/
│   ├── car/
│   └── food/
├── typing/                  # Types
├── middleware/              # Express middleware
├── handlers/                # Core handlers
├── services/                # Core services
└── servers/                 # HTTP/WebSocket
```

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment: Copy `.env.example` to `.env`
3. Start development: `npm run dev`
4. Run tests: `npm test`

## Contributing

1. Follow the architecture patterns
2. Keep features isolated
3. Write tests for new code
4. Document your changes
5. Follow TypeScript best practices

## License

[Your License Here]

## Support

For questions or issues:
1. Check the documentation files
2. Review the hotel feature example
3. Look at the implementation checklist
4. Check the architecture guide

---

**Status**: Clean build ready for development
**Last Updated**: January 30, 2026
**Version**: 1.0.0
