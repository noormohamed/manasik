# Search Filter Fix

## Issue
When searching for "Madinah" on the stay page, results were showing hotels from all cities (Dubai, Egypt, Turkey, etc.) instead of filtering to only Madinah hotels.

## Root Cause
The backend search method was correctly implementing the LIKE query for location filtering, but:
1. The search results weren't including hotel images and room data
2. The star rating filter was checking `average_rating` instead of `star_rating`

## Fix Applied

### 1. Enhanced Search Method (`service/src/features/hotel/repositories/hotel.repository.ts`)

**Added image and room fetching:**
```typescript
// Fetch images and rooms for each hotel
const hotelsWithDetails = await Promise.all(results.map(async (row) => {
  // Fetch images
  const imagesQuery = `SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order LIMIT 5`;
  const images = await this.query<any>(imagesQuery, [row.id]);

  // Fetch rooms
  const roomsQuery = `SELECT id, name, base_price, currency, capacity FROM room_types WHERE hotel_id = ? AND status = 'ACTIVE' LIMIT 5`;
  const rooms = await this.query<any>(roomsQuery, [row.id]);

  return {
    ...row,
    images: images.map((img: any) => ({ id: img.id, url: img.url, displayOrder: img.display_order })),
    rooms: rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      basePrice: parseFloat(room.base_price),
      currency: room.currency,
      capacity: room.capacity,
    })),
  };
}));
```

**Fixed star rating filter:**
```typescript
// Changed from h.average_rating to h.star_rating
if (minRating) {
  query += ` AND h.star_rating >= ?`;
  params.push(minRating);
}
```

### 2. Added Debug Logging (`frontend/src/components/Stay/ListingCardContent.tsx`)

Added console logging to help debug filter issues:
```typescript
console.log('Fetching hotels with params:', params);
const response = await apiClient.get('/hotels', { params });
console.log('API Response:', response);
```

## How the Search Works

### Location Filter
The backend uses LIKE queries to search across multiple fields:
```sql
AND (h.city LIKE '%Madinah%' OR h.country LIKE '%Madinah%' OR h.address LIKE '%Madinah%')
```

This means:
- Searching "Madinah" will match hotels in the city "Madinah"
- Searching "Saudi" will match hotels in "Saudi Arabia"
- Searching "UAE" will match hotels in "UAE"

### Filter Priority
1. **location** - General search (city, country, address)
2. **city** - Exact city match
3. **country** - Exact country match
4. **minRating** - Minimum star rating (1-5)
5. **maxPrice** - Maximum room price
6. **guests** - Minimum room capacity

## Testing

To verify the fix works:

1. **Start the backend:**
   ```bash
   cd service
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test searches:**
   - Search for "Madinah" - should show only Madinah hotels
   - Search for "Dubai" - should show only Dubai hotels
   - Search for "Saudi Arabia" - should show all Saudi hotels
   - Apply star rating filter - should filter by hotel star rating
   - Apply price filter - should filter by room prices

4. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - You should see logs showing the params being sent and the API response

## Expected Results

When searching for "Madinah":
- URL: `http://localhost:3000/stay/?location=Madinah&checkIn=2026-02-04&checkOut=2026-02-11&guests=2`
- API call: `GET /api/hotels?location=Madinah&checkIn=2026-02-04&checkOut=2026-02-11&guests=2&page=1&limit=12`
- Results: Only hotels where city, country, or address contains "Madinah"

## Database Cities

The seed data includes hotels in these cities:
- Makkah, Saudi Arabia
- Madinah, Saudi Arabia
- Jeddah, Saudi Arabia
- Riyadh, Saudi Arabia
- Dubai, UAE
- Abu Dhabi, UAE
- Doha, Qatar
- Istanbul, Turkey
- Cairo, Egypt
- Amman, Jordan

## Next Steps

If the issue persists:
1. Check browser console for the actual API params being sent
2. Check browser console for the API response
3. Verify the backend is running and accessible
4. Check if the database has been seeded with hotel data
5. Test the API directly with curl:
   ```bash
   curl "http://localhost:4000/api/hotels?location=Madinah&limit=5"
   ```
