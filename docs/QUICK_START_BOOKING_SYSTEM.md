# Quick Start Guide - Hotel Booking System

## Start the Application

### 1. Start Backend & Database
```bash
docker-compose -f docker-compose.dev.yml up
```
This starts:
- MySQL database on port 3306
- Backend API on port 3001

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

## Test the Booking Flow

### Step 1: Browse Hotels
1. Go to http://localhost:3000/stay
2. See list of 100 hotels with pagination
3. Click on any hotel card

### Step 2: View Hotel Details
1. You're now at `/stay-details/[hotel-id]`
2. See hotel images, description, amenities
3. Select check-in date (e.g., tomorrow)
4. Select check-out date (e.g., 3 days later)
5. Select number of guests (e.g., 2)
6. See calculated nights and pricing

### Step 3: Add to Cart
1. Scroll to "Available Rooms" section
2. See rooms with calculated total price
3. Click "Add to Cart" on any room
4. Alert confirms item added
5. Notice cart icon in navbar shows "1"

### Step 4: Continue Shopping (Optional)
1. Go back to `/stay`
2. Click another hotel
3. Add another room to cart
4. Cart icon now shows "2"

### Step 5: Checkout
1. Click cart icon in navbar
2. You're now at `/checkout`
3. See all cart items with details
4. Guest information is pre-filled if logged in
5. Review order summary (subtotal + tax)

### Step 6: Complete Booking
1. Verify guest name and email
2. Add phone number (optional)
3. Add special requests (optional)
4. Click "Complete Booking"
5. Wait for processing
6. Success! Redirected to `/dashboard/bookings`

### Step 7: View Bookings
1. You're now at `/dashboard/bookings`
2. See your new booking(s)
3. Check booking details, dates, pricing

## Quick Test URLs

### Public Pages (No Login Required)
- Hotels List: http://localhost:3000/stay
- Hotel Details: http://localhost:3000/stay-details/[any-hotel-id]

### Protected Pages (Login Required)
- Checkout: http://localhost:3000/checkout
- Your Bookings: http://localhost:3000/dashboard/bookings
- Your Listings: http://localhost:3000/dashboard/listings
- Listing Bookings: http://localhost:3000/dashboard/listings/bookings

## Test Accounts

### Customer Account
```
Email: james.anderson@email.com
Password: password123
```
Use this to:
- Browse hotels
- Make bookings
- View your bookings

### Hotel Manager Account
```
Email: edward.sanchez@email.com
Password: password123
```
Use this to:
- View managed hotels (3 hotels in Dubai)
- View bookings at your hotels (29 bookings)
- Manage hotel listings

## API Endpoints

### Public Endpoints
```bash
# List hotels
GET http://localhost:3001/api/hotels

# Get hotel details
GET http://localhost:3001/api/hotels/:id

# Get hotel rooms
GET http://localhost:3001/api/hotels/:id/rooms
```

### Protected Endpoints (Requires Auth Token)
```bash
# Create booking
POST http://localhost:3001/api/hotels/:id/bookings
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "roomTypeId": "uuid",
  "checkIn": "2024-03-15",
  "checkOut": "2024-03-18",
  "guestCount": 2,
  "guestName": "John Doe",
  "guestEmail": "john@example.com"
}

# Get your bookings (as manager)
GET http://localhost:3001/api/hotels/bookings
Authorization: Bearer YOUR_TOKEN

# Get your managed hotels
GET http://localhost:3001/api/hotels/listings
Authorization: Bearer YOUR_TOKEN
```

## Cart Features

### Add to Cart
- From hotel details page
- Click "Add to Cart" button
- Item stored in localStorage
- Cart count updates immediately

### View Cart
- Click cart icon in navbar
- See all items with details
- Remove items if needed

### Cart Persistence
- Cart saved in browser localStorage
- Survives page refresh
- Survives browser close/reopen
- Cleared after successful booking

## Troubleshooting

### Cart Icon Not Showing Count
- Check browser console for errors
- Verify CartProvider is in layout.tsx
- Clear localStorage and try again

### Hotel Details Not Loading
- Check backend is running (port 3001)
- Verify hotel ID exists in database
- Check browser console for API errors

### Booking Creation Fails
- Ensure you're logged in
- Check all required fields filled
- Verify dates are valid (check-out after check-in)
- Check room availability

### Database Connection Issues
```bash
# Restart Docker containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up
```

## Database Quick Checks

### Check Hotels
```sql
SELECT id, name, city, country FROM hotels LIMIT 10;
```

### Check Rooms
```sql
SELECT id, hotel_id, name, base_price, available_rooms 
FROM room_types 
WHERE hotel_id = 'YOUR_HOTEL_ID';
```

### Check Bookings
```sql
SELECT id, user_id, status, total, created_at 
FROM bookings 
WHERE service_type = 'HOTEL' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Hotel Images
```sql
SELECT hotel_id, image_url 
FROM hotel_images 
WHERE hotel_id = 'YOUR_HOTEL_ID';
```

## Development Tips

### Hot Reload
- Backend: Nodemon watches for changes
- Frontend: Next.js hot reload enabled
- Changes reflect immediately

### Clear Cart
```javascript
// In browser console
localStorage.removeItem('cart');
location.reload();
```

### Get Auth Token
```javascript
// In browser console (after login)
localStorage.getItem('accessToken');
```

### Test Different Users
1. Logout from current account
2. Go to http://localhost:3000/auth
3. Login with different credentials
4. Test booking flow

## Common Workflows

### Workflow 1: Simple Booking
1. Browse hotels → Select hotel → Choose dates → Add to cart → Checkout → Complete

### Workflow 2: Multi-Hotel Booking
1. Browse hotels → Add hotel 1 to cart
2. Browse more → Add hotel 2 to cart
3. Checkout → Complete all bookings

### Workflow 3: Manager View
1. Login as manager
2. Go to "Your Listings"
3. Click "Bookings"
4. See all bookings at your hotels

## Feature Flags

All features are enabled by default in `.env`:
```
FEATURE_HOTEL_LISTING=true
FEATURE_HOTEL_DETAILS=true
FEATURE_HOTEL_BOOKING=true
FEATURE_ROOM_AVAILABILITY=true
```

## Support

### Check Logs
```bash
# Backend logs
docker-compose -f docker-compose.dev.yml logs -f service

# Frontend logs
# Check terminal where npm run dev is running
```

### Reset Everything
```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (WARNING: Deletes all data)
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up
```

## Success Indicators

✅ Backend running on port 3001
✅ Frontend running on port 3000
✅ Can browse hotels
✅ Can view hotel details
✅ Can add items to cart
✅ Cart icon shows count
✅ Can view cart
✅ Can complete booking
✅ Booking appears in dashboard

## Next Steps

After testing the basic flow:
1. Test with different hotels
2. Test with multiple items in cart
3. Test as different users
4. Test edge cases (invalid dates, etc.)
5. Review booking data in database
6. Test manager booking view

Happy Testing! 🎉
