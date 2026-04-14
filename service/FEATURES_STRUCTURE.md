# Features Structure Guide

## Overview

The booking platform uses a **features-based architecture** where each service type (hotel, taxi, experience, etc.) is completely isolated in its own feature folder. This prevents code contamination and makes it easy to add new services.

## Directory Layout

```
service/src/
├── models/                          # Core foundation (shared by all features)
│   ├── user.ts                      # User with roles
│   ├── company.ts                   # Company entity
│   ├── booking/
│   │   └── base-booking.ts          # Abstract base for all bookings
│   ├── review/
│   │   └── base-review.ts           # Abstract base for all reviews
│   └── management/
│       ├── agent.ts                 # Service provider
│       └── company-admin.ts         # Company administrator
│
├── features/                        # Service-specific features
│   ├── hotel/                       # Hotel feature (example)
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
│   │   ├── index.ts                 # Main export
│   │   └── README.md                # Feature documentation
│   │
│   ├── taxi/                        # Taxi feature (to be added)
│   │   ├── models/
│   │   ├── handlers/
│   │   ├── services/
│   │   ├── types/
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── experience/                  # Experience feature (to be added)
│   ├── car/                         # Car rental feature (to be added)
│   ├── food/                        # Food service feature (to be added)
│   │
│   ├── README.md                    # Features guide
│   └── TEMPLATE.md                  # Template for new features
│
├── typing/
│   └── roles.d.ts                   # Role and permission types
│
├── handlers/                        # Core handlers (if needed)
├── services/                        # Core services (if needed)
└── middleware/                      # Middleware (existing)
```

## Core vs Features

### Core Models (Shared)
Located in `src/models/`, these are used by all features:

- **User**: User with role-based access control
- **Company**: Service provider organization
- **Agent**: Individual service provider
- **CompanyAdmin**: Company administrator
- **BaseBooking**: Abstract base for all booking types
- **BaseReview**: Abstract base for all review types

### Feature Models (Isolated)
Located in `src/features/[feature-name]/models/`, these extend core models:

- **HotelBooking** extends BaseBooking
- **HotelReview** extends BaseReview
- **Hotel**: Hotel-specific entity
- **RoomType**: Hotel-specific entity

## Feature Structure

Each feature follows this consistent structure:

### 1. Types (`types/index.ts`)
Define all TypeScript types and interfaces:

```typescript
export type HotelStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export interface HotelLocation { /* ... */ }
export interface HotelBookingMetadata { /* ... */ }
export interface HotelReviewCriteria { /* ... */ }
```

### 2. Models (`models/`)
Implement data models:

```typescript
// models/hotel.ts
export class Hotel { /* ... */ }

// models/room-type.ts
export class RoomType { /* ... */ }

// models/hotel-booking.ts
export class HotelBooking extends BaseBooking { /* ... */ }

// models/hotel-review.ts
export class HotelReview extends BaseReview { /* ... */ }

// models/index.ts
export { Hotel } from './hotel';
export { RoomType } from './room-type';
export { HotelBooking } from './hotel-booking';
export { HotelReview } from './hotel-review';
```

### 3. Handlers (`handlers/`)
Implement CRUD operations:

```typescript
// handlers/hotel.handler.ts
export class HotelHandler {
  async createHotel(params): Promise<Hotel> { /* ... */ }
  async getHotel(id): Promise<Hotel | null> { /* ... */ }
  async listHotels(filters): Promise<{ hotels: Hotel[]; total: number }> { /* ... */ }
  async updateHotel(id, updates): Promise<Hotel> { /* ... */ }
  async deleteHotel(id): Promise<boolean> { /* ... */ }
}

// handlers/room-type.handler.ts
export class RoomTypeHandler { /* ... */ }

// handlers/hotel-booking.handler.ts
export class HotelBookingHandler { /* ... */ }

// handlers/hotel-review.handler.ts
export class HotelReviewHandler { /* ... */ }

// handlers/index.ts
export { HotelHandler } from './hotel.handler';
export { RoomTypeHandler } from './room-type.handler';
export { HotelBookingHandler } from './hotel-booking.handler';
export { HotelReviewHandler } from './hotel-review.handler';
```

### 4. Services (`services/`)
Implement business logic:

```typescript
// services/hotel.service.ts
export class HotelService {
  async getHotelWithDetails(hotelId): Promise<any> { /* ... */ }
  async searchHotels(criteria): Promise<any[]> { /* ... */ }
  async getHotelStats(hotelId): Promise<any> { /* ... */ }
  async getAvailableRooms(hotelId, checkIn, checkOut): Promise<any[]> { /* ... */ }
}

// services/index.ts
export { HotelService } from './hotel.service';
```

### 5. Main Export (`index.ts`)
Export everything from the feature:

```typescript
// index.ts
export * from './models';
export * from './handlers';
export * from './services';
export * from './types';
```

### 6. Documentation (`README.md`)
Document the feature with examples and usage patterns.

## Usage Examples

### Import from Feature
```typescript
import {
  Hotel,
  RoomType,
  HotelBooking,
  HotelReview,
  HotelHandler,
  RoomTypeHandler,
  HotelBookingHandler,
  HotelReviewHandler,
  HotelService,
  HotelStatus,
  HotelLocation,
  HotelBookingMetadata,
  HotelReviewCriteria
} from '@/features/hotel';
```

### Create Models
```typescript
const hotel = Hotel.create({
  id: 'hotel-123',
  companyId: 'comp-456',
  agentId: 'agent-789',
  name: 'Grand Hotel',
  description: 'Luxury hotel',
  location: { /* ... */ }
});

const roomType = RoomType.create({
  id: 'room-type-123',
  hotelId: 'hotel-456',
  name: 'Deluxe Double',
  description: 'Spacious room',
  capacity: 2,
  totalRooms: 20,
  basePrice: 250
});

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

### Use Handlers
```typescript
const hotelHandler = new HotelHandler();
const hotel = await hotelHandler.createHotel({ /* params */ });
const hotels = await hotelHandler.listHotels({ companyId: 'comp-123' });

const roomTypeHandler = new RoomTypeHandler();
const roomType = await roomTypeHandler.createRoomType({ /* params */ });
const reserved = await roomTypeHandler.reserveRooms('room-type-123', 1);

const bookingHandler = new HotelBookingHandler();
const booking = await bookingHandler.createBooking({ /* params */ });
await bookingHandler.confirmBooking('booking-123');

const reviewHandler = new HotelReviewHandler();
const review = await reviewHandler.createReview({ /* params */ });
await reviewHandler.approveReview('review-123');
```

### Use Service
```typescript
const service = new HotelService();
const details = await service.getHotelWithDetails('hotel-123');
const results = await service.searchHotels({ city: 'New York', guestCount: 2 });
const stats = await service.getHotelStats('hotel-123');
const available = await service.getAvailableRooms('hotel-123', '2024-02-15', '2024-02-17', 2);
```

## Adding a New Feature

### Quick Steps

1. **Create folder structure**
   ```bash
   mkdir -p src/features/feature-name/{models,handlers,services,types}
   ```

2. **Create types** (`types/index.ts`)
   - Define all TypeScript types and interfaces

3. **Create models** (`models/`)
   - Extend BaseBooking and BaseReview
   - Create feature-specific entities
   - Export from `models/index.ts`

4. **Create handlers** (`handlers/`)
   - Implement CRUD operations
   - Export from `handlers/index.ts`

5. **Create services** (`services/`)
   - Implement business logic
   - Export from `services/index.ts`

6. **Create main export** (`index.ts`)
   - Export all models, handlers, services, types

7. **Create documentation** (`README.md`)
   - Document the feature with examples

See `src/features/README.md` for detailed guidelines.

## Best Practices

1. **Keep features isolated** - Don't import from other features
2. **Use consistent structure** - Follow the same pattern for all features
3. **Document everything** - Create comprehensive READMEs
4. **Export from index.ts** - Use clean import paths
5. **Validate in models** - Implement validation in model classes
6. **Use base classes** - Extend BaseBooking and BaseReview
7. **Handle errors** - Use consistent error handling
8. **Write tests** - Create tests alongside code

## Migration from Old Structure

If you have code in the old structure (e.g., `src/models/hotel/`), move it to the new structure:

```
OLD: src/models/hotel/hotel.ts
NEW: src/features/hotel/models/hotel.ts

OLD: src/models/hotel/room-type.ts
NEW: src/features/hotel/models/room-type.ts

OLD: src/models/hotel/hotel-booking.ts
NEW: src/features/hotel/models/hotel-booking.ts

OLD: src/models/hotel/hotel-review.ts
NEW: src/features/hotel/models/hotel-review.ts
```

Then update imports throughout the codebase.

## File Naming Conventions

- **Models**: `entity-name.ts` (e.g., `hotel.ts`, `room-type.ts`)
- **Handlers**: `entity-name.handler.ts` (e.g., `hotel.handler.ts`)
- **Services**: `feature-name.service.ts` (e.g., `hotel.service.ts`)
- **Types**: `index.ts` in types folder
- **Exports**: `index.ts` in each folder

## Import Paths

```typescript
// ✅ Good - Import from feature
import { Hotel, HotelHandler } from '@/features/hotel';

// ✅ Good - Import specific items
import { Hotel } from '@/features/hotel';
import { HotelHandler } from '@/features/hotel';

// ❌ Bad - Import from subfolder
import { Hotel } from '@/features/hotel/models/hotel';

// ❌ Bad - Import from other feature
import { Hotel } from '@/features/hotel';
import { Taxi } from '@/features/taxi';
// Then use both in same file - creates coupling
```

## Troubleshooting

### Import Errors
- Make sure you're importing from the feature's `index.ts`
- Check that all exports are properly defined

### Circular Dependencies
- Don't import from other features
- Use core models instead

### Type Errors
- Ensure all types are exported from `types/index.ts`
- Check that interfaces are properly defined

### Missing Methods
- Check that handlers implement all required methods
- Verify that models have all necessary getters/setters

## Future Enhancements

- [ ] Add feature templates
- [ ] Add feature generators
- [ ] Add feature testing utilities
- [ ] Add feature documentation generator
- [ ] Add feature migration tools
