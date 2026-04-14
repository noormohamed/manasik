# Frontend UI Review & Recommendations

## Current State Analysis

### ✅ Strengths

1. **Modern Tech Stack**
   - Next.js 14 with App Router
   - TypeScript for type safety
   - React 18 with modern hooks
   - Responsive Bootstrap-based design

2. **Authentication System**
   - Well-implemented AuthContext with JWT
   - Login/Register forms with proper error handling
   - Token management (localStorage + cookies)
   - Protected routes via middleware

3. **API Integration**
   - Centralized API client (`apiClient`)
   - Proper error handling
   - Token injection for authenticated requests
   - TypeScript interfaces for API responses

4. **UI Components**
   - Toast notifications for user feedback
   - Error boundary for graceful error handling
   - Loading states in forms
   - Responsive design with Bootstrap

5. **Code Organization**
   - Clean separation of concerns (components, context, hooks, lib)
   - Feature-based component structure
   - Reusable hooks (useAuth, useToast)

### ⚠️ Issues & Areas for Improvement

#### 1. **Static Data - No API Integration**
**Problem:** Hotel listings use hardcoded data instead of fetching from the backend API.

**Current:**
```tsx
// ListingCardContent.tsx - Uses static images and hardcoded data
<h3><Link href="/stay-details">Khao Yai National Park</Link></h3>
```

**Should be:**
```tsx
// Fetch from /api/hotels endpoint
const { data, loading } = useHotels({ city, page, limit });
```

#### 2. **Missing API Response Handling**
**Problem:** API client doesn't handle the `{ data: {...} }` wrapper from backend.

**Current API Response:**
```json
{
  "data": {
    "hotels": [...],
    "pagination": {...}
  }
}
```

**API Client Issue:**
```typescript
// api.ts returns the full response, not response.data
return await response.json(); // Returns { data: {...} }
```

#### 3. **No Hotel Search/Filter Functionality**
**Problem:** Search forms exist but don't connect to API.

**Missing:**
- Hotel search by location
- Date range filtering
- Price range filtering
- Amenity filtering
- Real-time availability checking

#### 4. **No Booking Flow**
**Problem:** No integration with booking API endpoints.

**Missing:**
- Room selection
- Date picker integration
- Guest information form
- Booking confirmation
- Payment integration

#### 5. **Missing Features**
- User profile/account management
- Booking history
- Favorites/wishlist
- Reviews and ratings display
- Hotel details page with real data
- Room type selection
- Checkout process

#### 6. **Error Handling Gaps**
- No retry logic for failed requests
- No offline detection
- Limited error messages
- No loading skeletons

#### 7. **Performance Issues**
- No image optimization for hotel photos
- No lazy loading for listings
- No pagination implementation
- No caching strategy

#### 8. **Accessibility**
- Missing ARIA labels
- No keyboard navigation
- No screen reader support
- Color contrast issues

## Recommended Improvements

### Priority 1: Connect to Backend API

#### 1.1 Fix API Client Response Handling
```typescript
// lib/api.ts
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // ... existing code ...
  
  const json = await response.json();
  
  // Handle wrapped responses
  if (json.data !== undefined) {
    return json.data as T;
  }
  
  return json as T;
}
```

#### 1.2 Create Hotel Service
```typescript
// lib/hotels.ts
export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  rating: number;
  pricePerNight: number;
  images: string[];
}

export interface HotelFilters {
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export const hotelService = {
  async getHotels(filters: HotelFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    return apiClient.get<{
      hotels: Hotel[];
      pagination: { page: number; limit: number; total: number };
    }>(`/hotels?${params}`);
  },
  
  async getHotel(id: string) {
    return apiClient.get<Hotel>(`/hotels/${id}`);
  },
  
  async getRooms(hotelId: string, checkIn: string, checkOut: string) {
    return apiClient.get(`/hotels/${hotelId}/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
  },
  
  async createBooking(hotelId: string, bookingData: any) {
    return apiClient.post(`/hotels/${hotelId}/bookings`, bookingData);
  },
};
```

#### 1.3 Create useHotels Hook
```typescript
// hooks/useHotels.ts
export function useHotels(filters: HotelFilters = {}) {
  const [data, setData] = useState<{ hotels: Hotel[]; pagination: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const result = await hotelService.getHotels(filters);
        setData(result);
      } catch (err: any) {
        setError(err.error || 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}
```

#### 1.4 Update ListingCardContent Component
```typescript
// components/Stay/ListingCardContent.tsx
const ListingCardContent = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 6 });
  const { data, loading, error } = useHotels(filters);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!data?.hotels.length) return <EmptyState />;

  return (
    <div className="most-popular-area mt-35">
      <div className="container">
        <FilterHeader onFilterChange={setFilters} />
        
        <div className="row justify-content-center">
          {data.hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
        
        <Pagination 
          current={data.pagination.page}
          total={data.pagination.total}
          pageSize={data.pagination.limit}
          onChange={(page) => setFilters({ ...filters, page })}
        />
      </div>
    </div>
  );
};
```

### Priority 2: Implement Core Features

#### 2.1 Hotel Search Component
```typescript
// components/Stay/HotelSearch.tsx
export function HotelSearch({ onSearch }: { onSearch: (filters: HotelFilters) => void }) {
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, checkIn, checkOut, guests });
  };

  return (
    <form onSubmit={handleSubmit} className="hotel-search-form">
      <input 
        type="text" 
        placeholder="Where are you going?" 
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input 
        type="date" 
        value={checkIn}
        onChange={(e) => setCheckIn(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
      />
      <input 
        type="date" 
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
        min={checkIn}
      />
      <input 
        type="number" 
        min="1" 
        value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

#### 2.2 Hotel Card Component
```typescript
// components/Stay/HotelCard.tsx
export function HotelCard({ hotel }: { hotel: Hotel }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="col-xl-4 col-md-6">
      <div className="most-popular-single-item">
        <div className="most-popular-single-img position-relative">
          <Link href={`/stay-details/${hotel.id}`}>
            <Image 
              src={hotel.images[0] || '/images/placeholder.jpg'} 
              alt={hotel.name}
              width={400}
              height={300}
            />
          </Link>
          <div className="most-popular-single-heart-discount">
            <button 
              type="button" 
              className={`heart ${isFavorite ? 'favorite' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <i className="flaticon-heart"></i>
            </button>
          </div>
        </div>

        <div className="most-popular-single-content">
          <div className="d-flex align-items-center most-popular-single-star">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`ri-star-${i < Math.floor(hotel.rating) ? 'fill' : 'line'}`}
              />
            ))}
            <span>({hotel.rating})</span>
          </div>
          
          <h3>
            <Link href={`/stay-details/${hotel.id}`}>{hotel.name}</Link>
          </h3>

          <div className="d-flex align-items-center most-popular-single-location">
            <i className="flaticon-location"></i>
            <span>{hotel.city}, {hotel.country}</span>
          </div>

          <div className="d-flex align-items-center justify-content-between most-popular-single-price">
            <p>
              <span className="title">${hotel.pricePerNight}</span> / Per Night
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Priority 3: Add Loading & Error States

#### 3.1 Loading Skeleton
```typescript
// components/Common/LoadingSkeleton.tsx
export function LoadingSkeleton() {
  return (
    <div className="row">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-xl-4 col-md-6">
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Priority 4: Implement Booking Flow

#### 4.1 Room Selection Page
#### 4.2 Booking Form
#### 4.3 Payment Integration
#### 4.4 Booking Confirmation

## Implementation Plan

### Phase 1: API Integration (Week 1)
- [ ] Fix API client response handling
- [ ] Create hotel service
- [ ] Create useHotels hook
- [ ] Update ListingCardContent to use real data
- [ ] Add loading and error states

### Phase 2: Search & Filter (Week 2)
- [ ] Implement hotel search
- [ ] Add date range picker
- [ ] Add price filter
- [ ] Add amenity filter
- [ ] Implement pagination

### Phase 3: Hotel Details (Week 3)
- [ ] Create hotel details page
- [ ] Show room types
- [ ] Display amenities
- [ ] Show reviews
- [ ] Add image gallery

### Phase 4: Booking Flow (Week 4)
- [ ] Room selection
- [ ] Guest information form
- [ ] Booking summary
- [ ] Payment integration
- [ ] Confirmation page

### Phase 5: User Features (Week 5)
- [ ] User profile
- [ ] Booking history
- [ ] Favorites
- [ ] Reviews submission

### Phase 6: Polish & Optimization (Week 6)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Testing

## Quick Wins (Can be done immediately)

1. **Fix API Response Handling** (30 min)
2. **Create Hotel Service** (1 hour)
3. **Create useHotels Hook** (1 hour)
4. **Add Loading Skeleton** (1 hour)
5. **Update One Component to Use Real Data** (2 hours)

## Conclusion

The frontend has a solid foundation with good architecture and modern practices. The main gap is connecting the UI to the backend API. Once that's done, the platform will be fully functional. The recommended improvements are prioritized to deliver value quickly while building toward a complete, production-ready application.
