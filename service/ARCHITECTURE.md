# Booking Platform Architecture

## Overview

This is an extensible multi-service booking platform designed to support hotels, experiences, cars, taxis, and food services. The architecture is built on three core features: **Booking**, **Reviews**, and **Management**.

## Core Principles

1. **Extensibility**: Base classes for each feature allow new service types to be added without modifying core logic
2. **Separation of Concerns**: Each feature (booking, review, management) is independent
3. **Role-Based Access Control**: Users have specific roles with defined permissions
4. **Service Agnostic**: Core logic doesn't depend on specific service implementations

## Architecture Layers

### 1. User & Role Management

**Files**: `src/models/user.ts`, `src/typing/roles.d.ts`

#### User Roles
- **SUPER_ADMIN**: System administrator with full access
- **COMPANY_ADMIN**: Company-level manager (can manage agents, view company bookings)
- **AGENT**: Service provider (hotel owner, taxi firm, etc.)
- **CUSTOMER**: End user making bookings

#### Service Types
- HOTEL
- EXPERIENCE
- CAR
- TAXI
- FOOD

### 2. Company & Management

**Files**: 
- `src/models/company.ts` - Company entity
- `src/models/management/agent.ts` - Agent (service provider)
- `src/models/management/company-admin.ts` - Company administrator

#### Company
Represents a service provider organization (e.g., hotel chain, taxi company).

```typescript
Company.create({
  id: 'comp-123',
  name: 'Grand Hotels Inc',
  serviceType: 'HOTEL',
  email: 'contact@grandhotels.com',
  // ... other fields
});
```

#### Agent
Represents an individual service provider within a company (e.g., hotel owner, taxi firm owner).

```typescript
Agent.create({
  id: 'agent-123',
  userId: 'user-456',
  companyId: 'comp-123',
  serviceType: 'HOTEL',
  name: 'John Hotel Manager',
  email: 'john@grandhotels.com',
  commissionRate: 15
});
```

#### CompanyAdmin
Represents a company-level administrator with specific permissions.

```typescript
CompanyAdmin.create({
  id: 'admin-123',
  userId: 'user-789',
  companyId: 'comp-123',
  adminRole: 'OWNER',
  name: 'Jane Owner',
  email: 'jane@grandhotels.com'
});
```

### 3. Booking System

**Base Class**: `src/models/booking/base-booking.ts`

The booking system is built on an abstract `BaseBooking` class that all service-specific bookings extend.

#### BaseBooking
Core booking functionality:
- Booking ID, company, customer, service type
- Status tracking (PENDING, CONFIRMED, CANCELLED, COMPLETED, REFUNDED)
- Pricing (subtotal, tax, total)
- Metadata for service-specific data
- Timestamps

```typescript
abstract class BaseBooking {
  abstract validate(): boolean;
  abstract toJSON(): any;
  static fromJSON(data: any): BaseBooking;
}
```

#### HotelBooking
Hotel-specific booking implementation.

**Metadata Structure**:
```typescript
{
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  roomCount: number;
  checkInDate: string;      // YYYY-MM-DD
  checkOutDate: string;     // YYYY-MM-DD
  guestCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
}
```

**Usage**:
```typescript
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

booking.validate();  // Throws if invalid
const nights = booking.getNights();  // 2
```

### 4. Review System

**Base Class**: `src/models/review/base-review.ts`

The review system is built on an abstract `BaseReview` class that all service-specific reviews extend.

#### BaseReview
Core review functionality:
- Review ID, booking, company, customer, service type
- Rating (1-5)
- Title and comment
- Service-specific criteria
- Status tracking (PENDING, APPROVED, REJECTED, FLAGGED)
- Verified purchase flag
- Helpful count

```typescript
abstract class BaseReview {
  abstract validate(): boolean;
  abstract toJSON(): any;
  static fromJSON(data: any): BaseReview;
}
```

#### HotelReview
Hotel-specific review with predefined criteria.

**Criteria**:
- Cleanliness (1-5)
- Comfort (1-5)
- Service (1-5)
- Amenities (1-5)
- Value for Money (1-5)
- Location (1-5)

**Usage**:
```typescript
const review = HotelReview.create({
  id: 'review-123',
  bookingId: 'booking-456',
  companyId: 'comp-123',
  customerId: 'cust-789',
  rating: 4,
  title: 'Great stay!',
  comment: 'The hotel was clean and the staff was friendly.',
  criteria: {
    cleanliness: 5,
    comfort: 4,
    service: 5,
    amenities: 4,
    valueForMoney: 3,
    location: 5
  }
});

review.validate();  // Throws if invalid
const avgCriteria = review.getAverageCriteriaRating();  // 4.33
```

### 5. Hotel Feature (Isolated)

**Location**: `src/features/hotel/`

The hotel feature is completely isolated in its own folder structure to avoid contaminating the core models and handlers. This pattern should be followed for all new service types.

**Files**:
- `src/features/hotel/models/hotel.ts` - Hotel property
- `src/features/hotel/models/room-type.ts` - Room category
- `src/features/hotel/models/hotel-booking.ts` - Hotel booking
- `src/features/hotel/models/hotel-review.ts` - Hotel review
- `src/features/hotel/handlers/` - Hotel-specific handlers
- `src/features/hotel/services/` - Hotel business logic
- `src/features/hotel/types/` - Hotel-specific types

#### Hotel
Represents a hotel property.

```typescript
const hotel = Hotel.create({
  id: 'hotel-123',
  companyId: 'comp-456',
  agentId: 'agent-789',
  name: 'Grand Hotel Downtown',
  description: 'Luxury 5-star hotel in downtown',
  location: {
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zipCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060
  },
  amenities: {
    wifi: true,
    parking: true,
    pool: true,
    gym: true
  }
});

hotel.setStarRating(5);
hotel.setTotalRooms(100);
hotel.setStatus('ACTIVE');
```

#### RoomType
Represents a category of rooms in a hotel.

```typescript
const roomType = RoomType.create({
  id: 'room-type-123',
  hotelId: 'hotel-456',
  name: 'Deluxe Double Room',
  description: 'Spacious room with king bed and city view',
  capacity: 2,
  totalRooms: 20,
  basePrice: 250,
  currency: 'USD',
  amenities: {
    ac: true,
    tv: true,
    wifi: true,
    minibar: true
  }
});

// Reserve rooms for a booking
roomType.reserveRooms(1);  // Returns true if successful

// Release rooms from a cancelled booking
roomType.releaseRooms(1);
```

## Adding a New Service Type

To add a new service type (e.g., TAXI), follow these steps:

### 1. Create Feature Folder Structure

```
src/features/taxi/
├── models/
│   ├── taxi-booking.ts
│   ├── taxi-review.ts
│   ├── taxi-vehicle.ts
│   ├── taxi-driver.ts
│   └── index.ts
├── handlers/
│   ├── taxi-booking.handler.ts
│   ├── taxi-review.handler.ts
│   └── index.ts
├── services/
│   ├── taxi.service.ts
│   └── index.ts
├── types/
│   └── index.ts
├── index.ts
└── README.md
```

### 2. Create Service-Specific Types

```typescript
// src/features/taxi/types/index.ts
export type TaxiBookingStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface TaxiBookingMetadata {
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  estimatedDuration: number;
  vehicleType: string;
  passengerCount: number;
}

export interface TaxiReviewCriteria {
  driverBehavior: number;
  vehicleCondition: number;
  routeEfficiency: number;
  safety: number;
}
```

### 3. Create Service-Specific Models

```typescript
// src/features/taxi/models/taxi-booking.ts
import { BaseBooking } from '../../../models/booking/base-booking';
import { TaxiBookingMetadata } from '../types';

export class TaxiBooking extends BaseBooking {
  validate(): boolean {
    // Taxi-specific validation
    return true;
  }

  static create(params: any): TaxiBooking {
    // Implementation
  }
}
```

### 4. Create Service-Specific Review

```typescript
// src/features/taxi/models/taxi-review.ts
import { BaseReview } from '../../../models/review/base-review';
import { TaxiReviewCriteria } from '../types';

export class TaxiReview extends BaseReview {
  validate(): boolean {
    // Taxi-specific validation
    return true;
  }

  static create(params: any): TaxiReview {
    // Implementation
  }
}
```

### 5. Create Handlers

```typescript
// src/features/taxi/handlers/taxi-booking.handler.ts
export class TaxiBookingHandler {
  async createBooking(params: any): Promise<TaxiBooking> {
    // Implementation
  }
  // ... other methods
}
```

### 6. Create Service

```typescript
// src/features/taxi/services/taxi.service.ts
export class TaxiService {
  // High-level business logic
}
```

### 7. Export Everything

```typescript
// src/features/taxi/index.ts
export * from './models';
export * from './handlers';
export * from './services';
export * from './types';
```

### 8. Create Feature README

Document the feature with examples and usage patterns.

## Data Flow

### Booking Flow
1. Customer initiates booking
2. System validates availability (service-specific)
3. System calculates pricing
4. Booking is created with PENDING status
5. Payment is processed
6. Booking status changes to CONFIRMED
7. Service is provided
8. Booking status changes to COMPLETED

### Review Flow
1. Customer completes booking
2. Customer submits review
3. Review is created with PENDING status
4. Company admin approves/rejects review
5. Review is published (APPROVED status)
6. Review affects company/agent ratings

### Management Flow
1. Company admin manages agents
2. Agents manage their own listings/services
3. Company admin views all bookings and reviews
4. Super admin manages all companies and admins

## Database Considerations

Each model should be persisted using:
- **Elasticsearch** for search and analytics
- **Relational DB** (PostgreSQL) for transactional data
- **Cache** (Redis) for frequently accessed data

## Security Considerations

1. **Authentication**: Token-based (JWT)
2. **Authorization**: Role-based access control
3. **Data Validation**: All inputs validated before processing
4. **Encryption**: Sensitive data encrypted at rest
5. **Audit Logging**: All actions logged for compliance

## Future Enhancements

1. **Payment Integration**: Stripe, PayPal, etc.
2. **Notification System**: Email, SMS, push notifications
3. **Analytics Dashboard**: Real-time metrics and insights
4. **Recommendation Engine**: Personalized suggestions
5. **Multi-language Support**: i18n for global reach
6. **Mobile App**: Native iOS/Android apps
