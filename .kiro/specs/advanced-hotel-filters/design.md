# Advanced Hotel Search Filters - Design

## Architecture Overview

The advanced filters feature extends the existing hotel search system with new filter parameters, database schema updates, and UI components.

### System Components

```
Frontend (React/Next.js)
├── Filter UI Components
│   ├── FacilityFilter
│   ├── RoomFacilityFilter
│   ├── ProximityFilter
│   └── SurroundingsFilter
└── Search Integration

Backend (Node.js/Express)
├── Filter Service
│   ├── Facility Filtering
│   ├── Room Facility Filtering
│   ├── Proximity Calculation
│   └── Surroundings Matching
├── Hotel API Routes
└── Database Layer

Database (PostgreSQL)
├── hotel_facilities (junction table)
├── room_facilities (junction table)
├── hotel_landmarks (proximity data)
└── hotel_surroundings (attractions/services)
```

## Database Schema

### New Tables

```sql
-- Hotel Facilities (many-to-many)
CREATE TABLE hotel_facilities (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id),
  facility_name VARCHAR(100),
  UNIQUE(hotel_id, facility_name)
);

-- Room Facilities (many-to-many)
CREATE TABLE room_facilities (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id),
  facility_name VARCHAR(100),
  UNIQUE(room_id, facility_name)
);

-- Hotel Landmarks (for proximity filtering)
CREATE TABLE hotel_landmarks (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id),
  landmark_name VARCHAR(255),
  distance_km DECIMAL(5, 2),
  landmark_type VARCHAR(50)
);

-- Hotel Surroundings
CREATE TABLE hotel_surroundings (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id),
  restaurants_nearby BOOLEAN DEFAULT false,
  cafes_nearby BOOLEAN DEFAULT false,
  top_attractions BOOLEAN DEFAULT false,
  natural_beauty BOOLEAN DEFAULT false,
  public_transport BOOLEAN DEFAULT false,
  closest_airport_km DECIMAL(5, 2)
);
```

## API Design

### Filter Query Parameters

```
GET /api/hotels/search?
  checkIn=2024-03-01&
  checkOut=2024-03-05&
  facilities=wifi,parking,gym&
  roomFacilities=ac,tv,balcony&
  proximityLandmark=airport&
  proximityDistance=10&
  surroundings=restaurants,public_transport&
  airportMaxDistance=15
```

### Response Format

```json
{
  "hotels": [
    {
      "id": 1,
      "name": "Hotel Name",
      "facilities": ["wifi", "parking", "gym"],
      "rooms": [
        {
          "id": 101,
          "type": "Deluxe",
          "facilities": ["ac", "tv", "balcony"]
        }
      ],
      "landmarks": [
        {
          "name": "Airport",
          "distance_km": 8.5
        }
      ],
      "surroundings": {
        "restaurants_nearby": true,
        "cafes_nearby": true,
        "top_attractions": true,
        "natural_beauty": false,
        "public_transport": true,
        "closest_airport_km": 8.5
      }
    }
  ],
  "total": 42,
  "page": 1
}
```

## Filter Logic

### Facility Filtering
- If facilities filter provided: return only hotels where hotel has ALL selected facilities
- If no facilities filter: include all hotels

### Room Facility Filtering
- If roomFacilities filter provided: return only hotels where at least ONE room has ALL selected room facilities
- If no roomFacilities filter: include all hotels

### Proximity Filtering
- If proximityLandmark and proximityDistance provided:
  - Return only hotels where landmark distance <= proximityDistance
  - If hotel has no landmark data, exclude it
- If no proximity filter: include all hotels

### Surroundings Filtering
- If surroundings filter provided: return only hotels matching ALL selected surroundings
- For airport distance: if airportMaxDistance provided, only include hotels with closest_airport_km <= airportMaxDistance
- If no surroundings filter: include all hotels

### Combined Filtering
- All filters use AND logic
- A hotel must match ALL applied filters to be included in results

## Frontend Components

### FacilityFilter Component
- Displays checkboxes for available facilities
- Allows multi-select
- Shows count of selected facilities
- Integrates with search query state

### RoomFacilityFilter Component
- Similar to FacilityFilter but for room amenities
- Clearly separated from hotel facilities
- Shows which rooms have selected facilities

### ProximityFilter Component
- Dropdown/autocomplete for landmark selection
- Distance input field (km)
- Optional filter

### SurroundingsFilter Component
- Checkboxes for each surrounding type
- Separate distance input for airport proximity
- Optional filter

## Correctness Properties

### Property 1: Facility Filter Completeness
**Validates: Requirements 1.1, 1.2**

For any set of selected facilities, the returned hotels must have ALL selected facilities. No hotel missing any selected facility should be in results.

```
Property: forall hotels in results, 
  forall selected_facility in facilities_filter,
    hotel.facilities contains selected_facility
```

### Property 2: Room Facility Filter Correctness
**Validates: Requirements 2.1, 2.2, 2.4**

For any set of selected room facilities, returned hotels must have at least one room with ALL selected room facilities.

```
Property: forall hotels in results,
  exists room in hotel.rooms,
    forall selected_facility in roomFacilities_filter,
      room.facilities contains selected_facility
```

### Property 3: Proximity Filter Accuracy
**Validates: Requirements 3.1, 3.2, 3.3**

For any landmark and distance threshold, only hotels within the distance are returned.

```
Property: forall hotels in results,
  exists landmark in hotel.landmarks where landmark.name == selected_landmark,
    landmark.distance_km <= proximityDistance
```

### Property 4: Surroundings Filter Matching
**Validates: Requirements 4.1-4.7**

For any combination of surrounding filters, returned hotels must match ALL selected surroundings.

```
Property: forall hotels in results,
  forall selected_surrounding in surroundings_filter,
    hotel.surroundings[selected_surrounding] == true
```

### Property 5: Combined Filter AND Logic
**Validates: Requirements 5.1, 5.2**

When multiple filter types are applied, results must satisfy ALL filters simultaneously.

```
Property: forall hotels in results,
  (facilities_filter_satisfied(hotel) OR no_facilities_filter) AND
  (room_facilities_filter_satisfied(hotel) OR no_room_facilities_filter) AND
  (proximity_filter_satisfied(hotel) OR no_proximity_filter) AND
  (surroundings_filter_satisfied(hotel) OR no_surroundings_filter)
```

### Property 6: Filter Performance
**Validates: Requirements 5.3, 5.4**

Search with any combination of filters completes within 500ms.

```
Property: forall filter_combinations,
  query_execution_time <= 500ms
```

## Testing Framework

- Unit tests: Jest
- Property-based tests: fast-check
- Integration tests: Supertest for API endpoints
- E2E tests: Playwright

## Implementation Phases

1. **Phase 1**: Database schema and migrations
2. **Phase 2**: Backend filter service and API integration
3. **Phase 3**: Frontend filter components
4. **Phase 4**: Testing and optimization
