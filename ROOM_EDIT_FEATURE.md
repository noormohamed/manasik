# Room Edit Feature

## Overview
Added the ability to edit room details from the hotel management dashboard with a modal dialog.

## Features Implemented

### Frontend (`DashboardHotelDetailsContent.tsx`)
- ✅ Edit button on each room card
- ✅ Modal dialog with form fields
- ✅ Real-time form validation
- ✅ Loading states during save
- ✅ Success/error notifications
- ✅ Auto-close modal on success

### Editable Fields
1. **Room Name** - Text input
2. **Description** - Textarea
3. **Capacity** - Number input (1-10 guests)
4. **Base Price** - Number input (USD, decimal)
5. **Total Rooms** - Number input
6. **Available Rooms** - Number input (max = total rooms)
7. **Status** - Dropdown (Active, Inactive, Maintenance)

### Backend API
**Endpoint:** `PUT /api/hotels/:hotelId/rooms/:roomId`

**Authentication:** Required (JWT token)

**Authorization:** User must be a manager/owner of the hotel

**Request Body:**
```json
{
  "name": "Deluxe Suite",
  "description": "Spacious room with ocean view",
  "capacity": 4,
  "totalRooms": 10,
  "availableRooms": 8,
  "basePrice": 299.99,
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "message": "Room updated successfully",
  "room": {
    "id": "room-id",
    "hotelId": "hotel-id",
    "name": "Deluxe Suite",
    "description": "Spacious room with ocean view",
    "capacity": 4,
    "totalRooms": 10,
    "availableRooms": 8,
    "basePrice": 299.99,
    "currency": "USD",
    "status": "ACTIVE",
    "images": ["url1", "url2"],
    "createdAt": "2026-02-01T...",
    "updatedAt": "2026-02-02T..."
  }
}
```

## Security
- ✅ Authentication required (JWT)
- ✅ Authorization check (user must manage the hotel)
- ✅ Validates room belongs to specified hotel
- ✅ Input validation on backend

## User Flow
1. Navigate to `/dashboard/listings/[hotel-id]`
2. Click "Rooms" tab
3. Click "Edit" button on any room
4. Modal opens with current room data
5. Modify fields as needed
6. Click "Save Changes"
7. Loading spinner shows during save
8. Success message displays
9. Modal auto-closes after 1.5 seconds
10. Room list updates with new data

## Files Modified

### Frontend
- `frontend/src/components/Dashboard/DashboardHotelDetailsContent.tsx`
  - Added modal state management
  - Added edit handlers
  - Added modal UI with form

### Backend
- `service/src/features/hotel/routes/hotel.routes.ts`
  - Added PUT endpoint for room updates
  
- `service/src/features/hotel/repositories/room.repository.ts`
  - Added `findById()` method with images

## Database Tables Used
- `room_types` - Room details
- `room_images` - Room photos
- `hotels` - Hotel verification
- `company_admins` - Authorization check

## Future Enhancements
- [ ] Add room image management
- [ ] Bulk edit multiple rooms
- [ ] Room availability calendar
- [ ] Price history tracking
- [ ] Seasonal pricing
- [ ] Room amenities management
