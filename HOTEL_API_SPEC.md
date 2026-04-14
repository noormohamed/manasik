# Hotel API Specification

Complete API documentation for hotel search, listings, and room management endpoints.

## Table of Contents
- [Authentication](#authentication)
- [Search Hotels](#search-hotels)
- [User Listings](#user-listings)
- [Hotel Rooms](#hotel-rooms)
- [Data Models](#data-models)
- [Examples](#examples)

---

## Authentication

Most endpoints are public. Protected endpoints require a Bearer token:

```
Authorization: Bearer <access_token>
```

Get tokens via `/api/auth/login` or `/api/auth/register`.

---

## Search Hotels

Search and filter hotels with various criteria.

### Endpoint
```
GET /api/hotels
```

### Access
Public (no authentication required)

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location` | string | No | Fuzzy search across city, country, and address |
| `city` | string | No | Filter by specific city (exact match) |
| `country` | string | No | Filter by specific country (exact match) |
| `checkIn` | string | No | Check-in date (YYYY-MM-DD format) |
| `checkOut` | string | No | Check-out date (YYYY-MM-DD format) |
| `guests` | number | No | Number of guests (requires checkIn/checkOut) |
| `minRating` | number | No | Minimum average rating (0-5) |
| `maxPrice` | number | No | Maximum price per night |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 20, max: 100) |

### Response

```json
{
  "data": {
    "hotels": [
      {
        "id": "hotel-uuid",
        "companyId": "company-uuid",
        "agentId": "agent-uuid",
        "name": "Grand Palace Makkah",
        "description": "Luxury hotel in the heart of Makkah",
        "status": "ACTIVE",
        "address": "123 Main Street",
        "city": "Makkah",
        "state": "Makkah Province",
        "country": "Saudi Arabia",
        "zipCode": "12345",
        "latitude": 21.4225,
        "longitude": 39.8262,
        "starRating": 5,
        "totalRooms": 150,
        "checkInTime": "14:00",
        "checkOutTime": "11:00",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
        "averageRating": 4.5,
        "totalReviews": 250,
        "minPrice": 150.00,
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-02-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "filters": {
      "location": "Makkah",
      "city": null,
      "country": null,
      "checkIn": "2026-03-01",
      "checkOut": "2026-03-05",
      "guests": 2,
      "minRating": 4,
      "maxPrice": 300
    }
  }
}
```

### Examples

**Basic search:**
```bash
GET /api/hotels
```

**Search by location:**
```bash
GET /api/hotels?location=Makkah
```

**Filter by city and guests:**
```bash
GET /api/hotels?city=Dubai&guests=4&checkIn=2026-03-01&checkOut=2026-03-05
```

**Filter by rating and price:**
```bash
GET /api/hotels?minRating=4&maxPrice=250
```

**Combined filters:**
```bash
GET /api/hotels?city=Makkah&guests=2&checkIn=2026-03-01&checkOut=2026-03-05&maxPrice=300&minRating=4&page=1&limit=10
```

---

## User Listings

Get hotels managed by the authenticated user.

### Endpoint
```
GET /api/hotels/listings
```

### Access
Protected (requires authentication)

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeRooms` | string | No | Include room types ('true' or 'false') |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 20) |

### Response

```json
{
  "data": {
    "hotels": [
      {
        "id": "hotel-uuid",
        "companyId": "company-uuid",
        "companyName": "Anderson Hotels Group",
        "adminRole": "OWNER",
        "agentId": "agent-uuid",
        "name": "Coastal Hotel Makkah",
        "description": "Luxury beachfront hotel",
        "status": "ACTIVE",
        "address": "780 Main Street",
        "city": "Makkah",
        "state": "Makkah Province",
        "country": "Saudi Arabia",
        "zipCode": "16800",
        "latitude": null,
        "longitude": null,
        "starRating": 5,
        "totalRooms": 54,
        "checkInTime": "14:00",
        "checkOutTime": "11:00",
        "cancellationPolicy": null,
        "averageRating": 3.10,
        "totalReviews": 96,
        "createdAt": "2026-02-01T17:36:38.000Z",
        "updatedAt": "2026-02-01T21:32:35.000Z",
        "rooms": [
          {
            "id": "room-uuid",
            "hotelId": "hotel-uuid",
            "name": "Deluxe Room",
            "description": "Spacious room with ocean view",
            "capacity": 2,
            "totalRooms": 20,
            "availableRooms": 15,
            "basePrice": 250.00,
            "currency": "USD",
            "status": "ACTIVE",
            "createdAt": "2026-02-01T17:36:39.000Z",
            "updatedAt": "2026-02-01T17:36:39.000Z"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### Examples

**Get managed hotels:**
```bash
GET /api/hotels/listings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Include room types:**
```bash
GET /api/hotels/listings?includeRooms=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error Responses

**401 Unauthorized:**
```json
{
  "data": {
    "error": "Unauthorized"
  }
}
```

---

## Hotel Rooms

Get available room types for a specific hotel.

### Endpoint
```
GET /api/hotels/:id/rooms
```

### Access
Public (authentication optional)

### Headers (Optional)
```
Authorization: Bearer <access_token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Hotel UUID |

### Response

```json
{
  "data": {
    "hotelId": "hotel-uuid",
    "hotelName": "Coastal Hotel Makkah",
    "isManager": false,
    "rooms": [
      {
        "id": "room-uuid",
        "hotelId": "hotel-uuid",
        "name": "Standard Room",
        "description": "Comfortable standard room with modern amenities",
        "capacity": 2,
        "totalRooms": 30,
        "availableRooms": 25,
        "basePrice": 150.00,
        "currency": "USD",
        "status": "ACTIVE",
        "createdAt": "2026-02-01T17:36:39.000Z",
        "updatedAt": "2026-02-01T17:36:39.000Z"
      },
      {
        "id": "room-uuid-2",
        "hotelId": "hotel-uuid",
        "name": "Deluxe Room",
        "description": "Spacious deluxe room with ocean view",
        "capacity": 3,
        "totalRooms": 20,
        "availableRooms": 18,
        "basePrice": 250.00,
        "currency": "USD",
        "status": "ACTIVE",
        "createdAt": "2026-02-01T17:36:39.000Z",
        "updatedAt": "2026-02-01T17:36:39.000Z"
      }
    ],
    "total": 2
  }
}
```

### Manager Flag

The `isManager` field indicates if the authenticated user manages this hotel:
- `false` - User is not authenticated or doesn't manage this hotel
- `true` - User is authenticated and manages this hotel (OWNER, MANAGER, or SUPPORT role)

### Examples

**Public access (no auth):**
```bash
GET /api/hotels/023154fa-79c2-43e8-98f5-d64e76f84ce2/rooms
```

**Authenticated access:**
```bash
GET /api/hotels/023154fa-79c2-43e8-98f5-d64e76f84ce2/rooms
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error Responses

**404 Not Found:**
```json
{
  "data": {
    "error": "Hotel not found"
  }
}
```

---

## Data Models

### Hotel

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique hotel identifier (UUID) |
| `companyId` | string | Company that owns the hotel |
| `agentId` | string | Agent managing the hotel |
| `name` | string | Hotel name |
| `description` | string | Hotel description |
| `status` | enum | DRAFT, ACTIVE, INACTIVE, SUSPENDED |
| `address` | string | Street address |
| `city` | string | City name |
| `state` | string | State/province (optional) |
| `country` | string | Country name |
| `zipCode` | string | Postal code |
| `latitude` | number | GPS latitude (optional) |
| `longitude` | number | GPS longitude (optional) |
| `starRating` | number | Star rating (1-5) |
| `totalRooms` | number | Total number of rooms |
| `checkInTime` | string | Check-in time (HH:MM format) |
| `checkOutTime` | string | Check-out time (HH:MM format) |
| `cancellationPolicy` | string | Cancellation policy text |
| `averageRating` | number | Average customer rating (0-5) |
| `totalReviews` | number | Total number of reviews |
| `minPrice` | number | Minimum room price (search only) |
| `createdAt` | string | Creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

### Managed Hotel (extends Hotel)

Additional fields for `/listings` endpoint:

| Field | Type | Description |
|-------|------|-------------|
| `companyName` | string | Name of the company |
| `adminRole` | enum | OWNER, MANAGER, SUPPORT |
| `rooms` | array | Room types (if includeRooms=true) |

### Room Type

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique room type identifier (UUID) |
| `hotelId` | string | Hotel this room belongs to |
| `name` | string | Room type name (e.g., "Deluxe Room") |
| `description` | string | Room description |
| `capacity` | number | Maximum number of guests |
| `totalRooms` | number | Total rooms of this type |
| `availableRooms` | number | Currently available rooms |
| `basePrice` | number | Price per night |
| `currency` | string | Currency code (e.g., "USD") |
| `status` | enum | ACTIVE, INACTIVE |
| `createdAt` | string | Creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

---

## Examples

### Complete Search Flow

```bash
# 1. Search for hotels in Makkah for 2 guests
curl -X GET "http://localhost:3001/api/hotels?city=Makkah&guests=2&checkIn=2026-03-01&checkOut=2026-03-05&minRating=4"

# 2. Get rooms for a specific hotel
curl -X GET "http://localhost:3001/api/hotels/023154fa-79c2-43e8-98f5-d64e76f84ce2/rooms"

# 3. Book a room (requires authentication)
curl -X POST "http://localhost:3001/api/hotels/023154fa-79c2-43e8-98f5-d64e76f84ce2/bookings" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomTypeId": "room-uuid",
    "checkIn": "2026-03-01",
    "checkOut": "2026-03-05",
    "guestCount": 2,
    "guestName": "John Doe",
    "guestEmail": "john@example.com"
  }'
```

### Manager Flow

```bash
# 1. Login as hotel manager
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "james.anderson@email.com",
    "password": "password123"
  }'

# 2. Get managed hotels
curl -X GET "http://localhost:3001/api/hotels/listings?includeRooms=true" \
  -H "Authorization: Bearer <token>"

# 3. Check rooms for managed hotel (isManager will be true)
curl -X GET "http://localhost:3001/api/hotels/023154fa-79c2-43e8-98f5-d64e76f84ce2/rooms" \
  -H "Authorization: Bearer <token>"
```

---

## Testing

Run the test suite:

```bash
# Run all hotel API tests
npm test -- hotel

# Run specific test file
npm test -- hotel-search.api.test.ts

# Run with coverage
npm test -- --coverage hotel
```

Test files:
- `service/src/__tests__/hotel.api.test.ts` - Basic hotel endpoints
- `service/src/__tests__/hotel-search.api.test.ts` - Search and listings (comprehensive)

---

## Notes

- All dates should be in `YYYY-MM-DD` format
- Prices are in the currency specified in the room type (usually USD)
- The `guests` filter requires both `checkIn` and `checkOut` dates
- Hotels are sorted by rating (highest first), then by name
- The `minPrice` field in search results shows the cheapest available room
- The `isManager` flag helps frontend show/hide management features
- All timestamps are in ISO 8601 format with UTC timezone
