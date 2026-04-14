# Quick Start Guide

## Project Structure

```
service/src/
├── models/                        # Core foundation models
│   ├── user.ts                    # User with roles
│   ├── company.ts                 # Company entity
│   ├── booking/
│   │   └── base-booking.ts        # Abstract booking base
│   ├── review/
│   │   └── base-review.ts         # Abstract review base
│   └── management/
│       ├── agent.ts               # Service provider
│       └── company-admin.ts       # Company administrator
├── features/                      # Service-specific features
│   ├── hotel/                     # Hotel feature (isolated)
│   │   ├── models/
│   │   ├── handlers/
│   │   ├── services/
│   │   ├── types/
│   │   ├── index.ts
│   │   └── README.md
│   ├── taxi/                      # Taxi feature (to be added)
│   ├── experience/                # Experience feature (to be added)
│   └── README.md                  # Features guide
├── typing/
│   └── roles.d.ts                 # Role and permission types
└── handlers/
    └── (core handlers - to be created)
```

## Core Concepts

### 1. Users & Roles

```typescript
import { User } from './models/user';

const user = new User('user-123');
user.role = 'AGENT';
user.companyId = 'comp-456';
user.serviceType = 'HOTEL';

if (user.isAgent()) {
  // Agent-specific logic
}
```

### 2. Companies

```typescript
import { Company } from './models/company';

const company = Company.create({
  id: 'comp-123',
  name: 'Grand Hotels Inc',
  serviceType: 'HOTEL',
  email: 'contact@grandhotels.com'
});

company.setVerified(true);
company.setActive(true);
```

### 3. Management

#### Agents
```typescript
import { Agent } from './models/management/agent';

const agent = Agent.create({
  id: 'agent-123',
  userId: 'user-456',
  companyId: 'comp-123',
  serviceType: 'HOTEL',
  name: 'John Manager',
  email: 'john@grandhotels.com'
});

agent.setStatus('ACTIVE');
agent.setCommissionRate(15);
agent.recordBooking(500);  // Record revenue
agent.updateRating(4.5);   // Update rating
```

#### Company Admins
```typescript
import { CompanyAdmin } from './models/management/company-admin';

const admin = CompanyAdmin.create({
  id: 'admin-123',
  userId: 'user-789',
  companyId: 'comp-123',
  adminRole: 'OWNER',
  name: 'Jane Owner',
  email: 'jane@grandhotels.com'
});

admin.addPermission('manage_agents');
admin.addPermission('view_analytics');

if (admin.canManageAgents()) {
  // Manage agents
}
```

### 4. Hotels

```typescript
import { Hotel } from '@/features/hotel';

const hotel = Hotel.create({
  id: 'hotel-123',
  companyId: 'comp-456',
  agentId: 'agent-789',
  name: 'Grand Hotel Downtown',
  description: 'Luxury 5-star hotel',
  location: {
    address: '123 Main St',
    city: 'New York',
    country: 'USA'
  }
});

hotel.setStarRating(5);
hotel.setStatus('ACTIVE');
hotel.addImage('https://example.com/hotel.jpg');
```

### 5. Room Types

```typescript
import { RoomType } from '@/features/hotel';

const roomType = RoomType.create({
  id: 'room-type-123',
  hotelId: 'hotel-456',
  name: 'Deluxe Double Room',
  description: 'Spacious room with king bed',
  capacity: 2,
  totalRooms: 20,
  basePrice: 250,
  amenities: {
    ac: true,
    wifi: true,
    tv: true
  }
});

// Check availability
const available = roomType.getAvailableRooms();

// Reserve rooms
if (roomType.reserveRooms(1)) {
  console.log('Reservation successful');
}

// Release rooms (on cancellation)
roomType.releaseRooms(1);
```

### 6. Bookings

```typescript
import { HotelBooking } from '@/features/hotel';

const booking = HotelBooking.create({
  id: 'booking-123',
  companyId: 'comp-123',
  customerId: 'cust-456',
  currency: 'USD',
  subtotal: 500,
  tax: 50,
  total: 550,
  metadata: {
    hotelId: 'hotel-789',
    hotelName: 'Grand Hotel',
    roomTypeId: 'room-101',
    roomTypeName: 'Deluxe Double',
    roomCount: 1,
    checkInDate: '2024-02-15',
    checkOutDate: '2024-02-17',
    guestCount: 2,
    guestName: 'John Doe',
    guestEmail: 'john@example.com'
  }
});

// Validate
booking.validate();

// Get nights
const nights = booking.getNights();  // 2

// Update status
booking.setStatus('CONFIRMED');
```

### 7. Reviews

```typescript
import { HotelReview } from '@/features/hotel';

const review = HotelReview.create({
  id: 'review-123',
  bookingId: 'booking-456',
  companyId: 'comp-123',
  customerId: 'cust-789',
  rating: 4,
  title: 'Great stay!',
  comment: 'Excellent service and clean rooms.',
  criteria: {
    cleanliness: 5,
    comfort: 4,
    service: 5,
    amenities: 4,
    valueForMoney: 3,
    location: 5
  }
});

// Validate
review.validate();

// Get average criteria rating
const avgRating = review.getAverageCriteriaRating();  // 4.33

// Approve review
review.setStatus('APPROVED');
review.setVerified(true);
```

## Adding a New Service Type

To add a new service type (e.g., TAXI), follow these steps:

### Step 1: Create Feature Folder Structure
```bash
mkdir -p src/features/taxi/{models,handlers,services,types}
```

### Step 2: Create Booking Class
```typescript
// src/features/taxi/models/taxi-booking.ts
import { BaseBooking } from '../../../models/booking/base-booking';

export class TaxiBooking extends BaseBooking {
  validate(): boolean {
    // Taxi-specific validation
    return true;
  }

  static create(params: any): TaxiBooking {
    const booking = new TaxiBooking();
    // Initialize fields
    return booking;
  }
}
```

### Step 3: Create Review Class
```typescript
// src/features/taxi/models/taxi-review.ts
import { BaseReview } from '../../../models/review/base-review';

export class TaxiReview extends BaseReview {
  validate(): boolean {
    // Taxi-specific validation
    return true;
  }

  static create(params: any): TaxiReview {
    const review = new TaxiReview();
    // Initialize fields
    return review;
  }
}
```

### Step 4: Create Service Models
```typescript
// src/features/taxi/models/taxi-vehicle.ts
// src/features/taxi/models/taxi-driver.ts
// etc.
```

### Step 5: Create Handlers
```typescript
// src/features/taxi/handlers/taxi-booking.handler.ts
export class TaxiBookingHandler {
  async createBooking(params: any): Promise<TaxiBooking> {
    // Implementation
  }
}

// src/features/taxi/handlers/taxi-review.handler.ts
export class TaxiReviewHandler {
  async createReview(params: any): Promise<TaxiReview> {
    // Implementation
  }
}
```

### Step 6: Create Service
```typescript
// src/features/taxi/services/taxi.service.ts
export class TaxiService {
  // Business logic
}
```

### Step 7: Export Everything
```typescript
// src/features/taxi/index.ts
export * from './models';
export * from './handlers';
export * from './services';
export * from './types';
```

### Step 8: Create Documentation
Create `src/features/taxi/README.md` with examples and usage patterns.

See `src/features/README.md` for detailed guidelines.

## Common Patterns

### Chaining Setters
```typescript
hotel
  .setName('New Name')
  .setDescription('New Description')
  .setStatus('ACTIVE')
  .setStarRating(5);
```

### Validation
```typescript
try {
  booking.validate();
  // Proceed with booking
} catch (error) {
  console.error('Booking validation failed:', error.message);
}
```

### Status Transitions
```typescript
// Booking lifecycle
booking.setStatus('PENDING');
// ... payment processing ...
booking.setStatus('CONFIRMED');
// ... service provided ...
booking.setStatus('COMPLETED');
```

### Metadata Access
```typescript
const meta = booking.getHotelMetadata();
console.log(meta.hotelName);
console.log(meta.checkInDate);
```

## Next Steps

1. **Create Handlers**: Implement HTTP handlers for each feature
2. **Add Database Layer**: Implement persistence with Elasticsearch/PostgreSQL
3. **Add Validation**: Implement comprehensive input validation
4. **Add Tests**: Write unit and integration tests
5. **Add API Routes**: Create REST endpoints for each feature
6. **Add Authentication**: Implement JWT-based auth
7. **Add Authorization**: Implement role-based access control
