# Hotel Filters API Documentation

This document describes the advanced hotel filter API endpoints and how to use them.

## Table of Contents
- [Hotel Creation with Filters](#hotel-creation-with-filters)
- [Room Creation with Facilities](#room-creation-with-facilities)
- [Hotel Search with Filters](#hotel-search-with-filters)
- [Managing Hotel Facilities](#managing-hotel-facilities)
- [Managing Room Facilities](#managing-room-facilities)
- [Managing Landmarks](#managing-landmarks)
- [Managing Surroundings](#managing-surroundings)

---

## Hotel Creation with Filters

Create a new hotel with facilities, landmarks, and surroundings in a single request.

**Endpoint:** `POST /api/hotels`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Grand Plaza Hotel",
  "description": "Luxury hotel in city center",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001",
  "starRating": 5,
  "totalRooms": 200,
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
  "facilities": ["WiFi", "Parking", "Gym", "Swimming Pool", "Restaurant", "Bar", "Spa"],
  "landmarks": [
    {
      "landmarkName": "Airport",
      "distanceKm": 15.5,
      "landmarkType": "transportation"
    },
    {
      "landmarkName": "City Center",
      "distanceKm": 0.5,
      "landmarkType": "downtown"
    },
    {
      "landmarkName": "Train Station",
      "distanceKm": 2.0,
      "landmarkType": "transportation"
    }
  ],
  "surroundings": {
    "restaurantsNearby": true,
    "cafesNearby": true,
    "topAttractions": true,
    "naturalBeauty": false,
    "publicTransport": true,
    "closestAirportKm": 15.5
  }
}
```

**Response:**
```json
{
  "message": "Hotel created successfully",
  "hotel": {
    "id": "uuid-here",
    "name": "Grand Plaza Hotel",
    "description": "Luxury hotel in city center",
    "address": "123 Main Street",
    "city": "New York",
    "country": "USA",
    "starRating": 5,
    "facilities": ["WiFi", "Parking", "Gym", "Swimming Pool", "Restaurant", "Bar", "Spa"],
    "landmarks": [
      {
        "landmark_name": "Airport",
        "distance_km": 15.5,
        "landmark_type": "transportation"
      },
      {
        "landmark_name": "City Center",
        "distance_km": 0.5,
        "landmark_type": "downtown"
      }
    ],
    "surroundings": {
      "restaurants_nearby": true,
      "cafes_nearby": true,
      "top_attractions": true,
      "natural_beauty": false,
      "public_transport": true,
      "closest_airport_km": 15.5
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## Room Creation with Facilities

Create a new room type with facilities.

**Endpoint:** `POST /api/hotels/:hotelId/rooms`

**Authentication:** Required (hotel manager)

**Request Body:**
```json
{
  "name": "Deluxe Suite",
  "description": "Spacious suite with city view",
  "capacity": 2,
  "totalRooms": 20,
  "availableRooms": 20,
  "basePrice": 250.00,
  "currency": "USD",
  "status": "ACTIVE",
  "facilities": [
    "Air Conditioning",
    "Television",
    "Minibar",
    "Safe",
    "Balcony",
    "Bathtub",
    "Work Desk"
  ]
}
```

**Response:**
```json
{
  "message": "Room type created successfully",
  "room": {
    "id": "room-uuid",
    "hotelId": "hotel-uuid",
    "name": "Deluxe Suite",
    "description": "Spacious suite with city view",
    "capacity": 2,
    "basePrice": 250.00,
    "currency": "USD",
    "facilities": [
      "Air Conditioning",
      "Television",
      "Minibar",
      "Safe",
      "Balcony",
      "Bathtub",
      "Work Desk"
    ],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## Hotel Search with Filters

Search for hotels with advanced filtering options.

**Endpoint:** `GET /api/hotels`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `location` | string | Search by city, country, or address | `New York` |
| `city` | string | Filter by specific city | `New York` |
| `country` | string | Filter by specific country | `USA` |
| `checkIn` | string | Check-in date (YYYY-MM-DD) | `2024-03-01` |
| `checkOut` | string | Check-out date (YYYY-MM-DD) | `2024-03-05` |
| `guests` | number | Number of guests | `2` |
| `minRating` | number | Minimum star rating | `4` |
| `maxPrice` | number | Maximum price per night | `300` |
| `facilities` | string | Comma-separated facility names | `WiFi,Parking,Gym` |
| `roomFacilities` | string | Comma-separated room facility names | `Air Conditioning,TV` |
| `proximityLandmark` | string | Landmark name for proximity filter | `Airport` |
| `proximityDistance` | number | Maximum distance in km | `10` |
| `surroundings` | string | Comma-separated surroundings | `restaurants,transport` |
| `airportMaxDistance` | number | Maximum distance to airport in km | `20` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Results per page (default: 20) | `20` |

**Surroundings Values:**
- `restaurants` - Restaurants & Cafes nearby
- `cafes` - Cafes nearby
- `attractions` - Top attractions nearby
- `nature` - Natural beauty nearby
- `transport` - Public transport nearby

**Example Request:**
```
GET /api/hotels?city=New York&checkIn=2024-03-01&checkOut=2024-03-05&guests=2&facilities=WiFi,Parking&roomFacilities=Air Conditioning&proximityLandmark=Airport&proximityDistance=15&surroundings=restaurants,transport&page=1&limit=20
```

**Response:**
```json
{
  "hotels": [
    {
      "id": "uuid",
      "name": "Grand Plaza Hotel",
      "description": "Luxury hotel in city center",
      "city": "New York",
      "country": "USA",
      "starRating": 5,
      "minPrice": 200.00,
      "facilities": ["WiFi", "Parking", "Gym", "Pool"],
      "images": ["url1", "url2"],
      "rooms": [
        {
          "id": "room-uuid",
          "name": "Deluxe Suite",
          "capacity": 2,
          "basePrice": 250.00,
          "facilities": ["Air Conditioning", "TV", "Minibar"]
        }
      ],
      "landmarks": [
        {
          "landmark_name": "Airport",
          "distance_km": 12.5,
          "landmark_type": "transportation"
        }
      ],
      "surroundings": {
        "restaurants_nearby": true,
        "public_transport": true,
        "closest_airport_km": 12.5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

## Managing Hotel Facilities

### Add Facility to Hotel

Add a single facility to an existing hotel.

**Endpoint:** `POST /api/hotels/:id/facilities`

**Authentication:** Required (hotel manager)

**Request Body:**
```json
{
  "facilityName": "Conference Rooms"
}
```

**Response:**
```json
{
  "message": "Facility added successfully",
  "facilities": ["WiFi", "Parking", "Gym", "Conference Rooms"]
}
```

### Available Hotel Facilities

Standard hotel facilities you can use:
- WiFi
- Parking
- Gym / Fitness Center
- Swimming Pool
- Restaurant
- Bar
- Spa
- Conference Rooms
- Pet Friendly
- Wheelchair Accessible
- 24-Hour Front Desk
- Room Service
- Concierge Service
- Airport Shuttle
- Laundry Service

---

## Managing Room Facilities

### Add Facility to Room

Add a single facility to an existing room type.

**Endpoint:** `POST /api/hotels/:hotelId/rooms/:roomId/facilities`

**Authentication:** Required (hotel manager)

**Request Body:**
```json
{
  "facilityName": "Coffee Maker"
}
```

**Response:**
```json
{
  "message": "Room facility added successfully",
  "roomFacilities": ["Air Conditioning", "TV", "Coffee Maker"]
}
```

### Available Room Facilities

Standard room facilities you can use:
- Air Conditioning
- Television
- Minibar
- Safe
- Balcony / Terrace
- Bathtub
- Shower
- Work Desk
- Hairdryer
- Iron & Board
- Coffee Maker
- Refrigerator
- Microwave
- Kitchen
- Washer & Dryer

---

## Managing Landmarks

### Add Landmark to Hotel

Add proximity information for a landmark near the hotel.

**Endpoint:** `POST /api/hotels/:id/landmarks`

**Authentication:** Required (hotel manager)

**Request Body:**
```json
{
  "landmarkName": "Central Park",
  "distanceKm": 1.2,
  "landmarkType": "attraction"
}
```

**Landmark Types:**
- `downtown` - City center / downtown area
- `transportation` - Airport, train station, bus terminal
- `shopping` - Shopping malls, markets
- `attraction` - Tourist attractions, museums
- `healthcare` - Hospitals, clinics
- `education` - Universities, schools
- `recreation` - Parks, beaches, sports venues

**Response:**
```json
{
  "message": "Landmark added successfully",
  "landmarks": [
    {
      "landmark_name": "Airport",
      "distance_km": 15.0,
      "landmark_type": "transportation"
    },
    {
      "landmark_name": "Central Park",
      "distance_km": 1.2,
      "landmark_type": "attraction"
    }
  ]
}
```

---

## Managing Surroundings

### Update Hotel Surroundings

Update or create surroundings information for a hotel.

**Endpoint:** `POST /api/hotels/:id/surroundings`

**Authentication:** Required (hotel manager)

**Request Body:**
```json
{
  "restaurantsNearby": true,
  "cafesNearby": true,
  "topAttractions": false,
  "naturalBeauty": true,
  "publicTransport": true,
  "closestAirportKm": 18.5
}
```

**Response:**
```json
{
  "message": "Surroundings updated successfully",
  "surroundings": {
    "restaurants_nearby": true,
    "cafes_nearby": true,
    "top_attractions": false,
    "natural_beauty": true,
    "public_transport": true,
    "closest_airport_km": 18.5
  }
}
```

---

## Filter Logic

### How Filters Work

1. **Facility Filters** - Hotels must have **ALL** selected facilities
2. **Room Facility Filters** - Hotels must have **at least ONE** room with **ALL** selected room facilities
3. **Proximity Filters** - Hotels must have the specified landmark within the distance threshold
4. **Surroundings Filters** - Hotels must match **ALL** selected surrounding criteria
5. **Combined Filters** - All filter types use **AND** logic (hotels must satisfy all applied filters)

### Filter Performance

- Target response time: < 500ms for any filter combination
- Database indexes are optimized for common filter queries
- Filters work efficiently with large datasets

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: name, address, city, country"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to manage this hotel"
}
```

### 404 Not Found
```json
{
  "error": "Hotel not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create hotel"
}
```

---

## Examples

### Example 1: Find WiFi Hotels Near Airport

```bash
GET /api/hotels?city=New York&facilities=WiFi&proximityLandmark=Airport&proximityDistance=20
```

### Example 2: Find Hotels with Pool and AC Rooms

```bash
GET /api/hotels?facilities=Swimming Pool&roomFacilities=Air Conditioning&minRating=4
```

### Example 3: Find Hotels Near Restaurants with Public Transport

```bash
GET /api/hotels?surroundings=restaurants,transport&maxPrice=200
```

### Example 4: Complete Filter Search

```bash
GET /api/hotels?city=New York&checkIn=2024-03-01&checkOut=2024-03-05&guests=2&minRating=4&maxPrice=300&facilities=WiFi,Parking,Gym&roomFacilities=Air Conditioning,TV&proximityLandmark=City Center&proximityDistance=5&surroundings=restaurants,transport&airportMaxDistance=20
```

---

## Migration & Seeding

### Apply Database Migrations

```bash
# Apply the filter tables migration
mysql -u your_user -p your_database < service/database/migrations/001-add-hotel-filters.sql
```

### Seed Sample Data

```bash
# Populate with sample facilities and surroundings
mysql -u your_user -p your_database < service/database/seed-facilities.sql
```

---

## Testing

### Unit Tests

```bash
npm test -- hotel-filter.service.test.ts
```

### Property-Based Tests

First install fast-check:
```bash
npm install --save-dev fast-check
```

Then run:
```bash
npm test -- hotel-filter.property.test.ts
```

---

## Notes

- All endpoints respect user permissions (hotel managers can only manage their own hotels)
- Filters are optional - you can use any combination or none
- Surroundings data is optional per hotel
- Landmark data is optional per hotel
- Multiple facilities/landmarks can be added to a hotel over time
