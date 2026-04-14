# Hotel Feature

Complete hotel booking system with room management, bookings, and reviews.

## Structure

```
hotel/
├── models/              # Data models
│   ├── hotel.ts        # Hotel property
│   ├── room-type.ts    # Room categories
│   ├── hotel-booking.ts # Hotel bookings
│   ├── hotel-review.ts # Hotel reviews
│   └── index.ts        # Exports
├── handlers/           # Request handlers
│   ├── hotel.handler.ts
│   ├── room-type.handler.ts
│   ├── hotel-booking.handler.ts
│   ├── hotel-review.handler.ts
│   └── index.ts        # Exports
├── services/           # Business logic
│   ├── hotel.service.ts
│   └── index.ts        # Exports
├── types/              # TypeScript types
│   └── index.ts
└── index.ts            # Main export
```

## Usage

### Import Models
```typescript
import { Hotel, RoomType, HotelBooking, HotelReview } from '@/features/hotel';

const hotel = Hotel.create({
  id: 'hotel-123',
  companyId: 'comp-456',
  agentId: 'agent-789',
  name: 'Grand Hotel',
  description: 'Luxury hotel',
  location: { /* ... */ }
});
```

### Import Handlers
```typescript
import { HotelHandler, RoomTypeHandler, HotelBookingHandler, HotelReviewHandler } from '@/features/hotel';

const hotelHandler = new HotelHandler();
const hotel = await hotelHandler.createHotel({
  id: 'hotel-123',
  // ... params
});
```

### Import Service
```typescript
import { HotelService } from '@/features/hotel';

const service = new HotelService();
const hotelDetails = await service.getHotelWithDetails('hotel-123');
```

## Models

### Hotel
Represents a hotel property.

```typescript
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

### RoomType
Represents a category of rooms.

```typescript
const roomType = RoomType.create({
  id: 'room-type-123',
  hotelId: 'hotel-456',
  name: 'Deluxe Double Room',
  description: 'Spacious room with king bed',
  capacity: 2,
  totalRooms: 20,
  basePrice: 250,
  amenities: { ac: true, wifi: true }
});

roomType.reserveRooms(1);
roomType.releaseRooms(1);
```

### HotelBooking
Represents a hotel booking.

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
    roomTypeId: 'room-101',
    checkInDate: '2024-02-15',
    checkOutDate: '2024-02-17',
    guestCount: 2,
    guestName: 'John Doe',
    guestEmail: 'john@example.com'
  }
});

booking.validate();
const nights = booking.getNights();
```

### HotelReview
Represents a hotel review.

```typescript
const review = HotelReview.create({
  id: 'review-123',
  bookingId: 'booking-456',
  companyId: 'comp-123',
  customerId: 'cust-789',
  rating: 4,
  title: 'Great stay!',
  comment: 'Excellent service',
  criteria: {
    cleanliness: 5,
    comfort: 4,
    service: 5,
    amenities: 4,
    valueForMoney: 3,
    location: 5
  }
});

review.validate();
const avgRating = review.getAverageCriteriaRating();
```

## Handlers

Each handler manages CRUD operations for its entity.

### HotelHandler
```typescript
const handler = new HotelHandler();
const hotel = await handler.createHotel({ /* params */ });
const hotel = await handler.getHotel('hotel-123');
const { hotels, total } = await handler.listHotels({ companyId: 'comp-123' });
await handler.updateHotelStatus('hotel-123', 'ACTIVE');
```

### RoomTypeHandler
```typescript
const handler = new RoomTypeHandler();
const roomType = await handler.createRoomType({ /* params */ });
const reserved = await handler.reserveRooms('room-type-123', 1);
await handler.releaseRooms('room-type-123', 1);
```

### HotelBookingHandler
```typescript
const handler = new HotelBookingHandler();
const booking = await handler.createBooking({ /* params */ });
await handler.confirmBooking('booking-123');
await handler.cancelBooking('booking-123');
const available = await handler.checkAvailability('room-type-123', '2024-02-15', '2024-02-17', 1);
```

### HotelReviewHandler
```typescript
const handler = new HotelReviewHandler();
const review = await handler.createReview({ /* params */ });
await handler.approveReview('review-123');
const avgRating = await handler.getHotelAverageRating('hotel-123');
```

## Service

High-level business logic operations.

```typescript
const service = new HotelService();

// Get hotel with all details
const details = await service.getHotelWithDetails('hotel-123');

// Search hotels
const results = await service.searchHotels({
  city: 'New York',
  checkInDate: '2024-02-15',
  checkOutDate: '2024-02-17',
  guestCount: 2
});

// Get hotel statistics
const stats = await service.getHotelStats('hotel-123');

// Get available rooms
const available = await service.getAvailableRooms(
  'hotel-123',
  '2024-02-15',
  '2024-02-17',
  2
);
```

## Types

All TypeScript types are exported from `types/index.ts`:

- `HotelStatus`
- `RoomTypeStatus`
- `HotelAmenities`
- `RoomAmenities`
- `HotelLocation`
- `HotelBookingMetadata`
- `HotelReviewCriteria`

## Next Steps

1. Implement database persistence in handlers
2. Add validation middleware
3. Create API routes
4. Add authentication/authorization
5. Implement search and filtering
6. Add analytics and reporting
