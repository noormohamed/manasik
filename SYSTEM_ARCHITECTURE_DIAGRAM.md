# Hotel Manager Edit Interface - System Architecture

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HOTEL BOOKING SYSTEM                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐      │
│  │   ADMIN PANEL                │    │   BOOKING PAGE               │      │
│  │   (http://localhost:3002)    │    │   (http://localhost:3000)    │      │
│  │                              │    │                              │      │
│  │  Hotels Management           │    │  Hotel Details               │      │
│  │  ├─ Overview Tab             │    │  ├─ Sidebar                  │      │
│  │  ├─ Rooms Tab               │    │  │  ├─ Check-in Time 🕐      │      │
│  │  ├─ Bookings Tab            │    │  │  ├─ Check-out Time 🕐     │      │
│  │  ├─ Reviews Tab             │    │  │  └─ Cancellation Policy 📄 │      │
│  │  ├─ Transactions Tab        │    │  └─ Main Content             │      │
│  │  ├─ Amenities Tab           │    │     ├─ Description           │      │
│  │  └─ Edit Tab ✨ NEW         │    │     ├─ Amenities             │      │
│  │     ├─ Check-in Time        │    │     ├─ Available Rooms       │      │
│  │     ├─ Check-out Time       │    │     ├─ Reviews               │      │
│  │     ├─ Cancellation Policy  │    │     ├─ Location              │      │
│  │     └─ Hotel Rules          │    │     └─ Hotel Rules ✨ NEW    │      │
│  │                              │    │                              │      │
│  └──────────────────────────────┘    └──────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Management Service (hotelsService.ts)                              │  │
│  │  ├─ getHotels()                                                     │  │
│  │  ├─ getHotelDetail()                                                │  │
│  │  ├─ updateHotelStatus()                                             │  │
│  │  └─ updateHotelDetails() ✨ NEW                                     │  │
│  │     └─ Calls: PUT /api/hotels/:id                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Frontend Service (api.ts)                                          │  │
│  │  ├─ GET /hotels/:id                                                 │  │
│  │  └─ Displays policies on booking page                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Hotel Routes (hotel.routes.ts)                                     │  │
│  │                                                                      │  │
│  │  GET /api/hotels/:id                                                │  │
│  │  ├─ Returns: Hotel with all fields                                  │  │
│  │  ├─ Fields: id, name, checkInTime, checkOutTime, ...               │  │
│  │  └─ New Field: hotelRules ✨                                        │  │
│  │                                                                      │  │
│  │  PUT /api/hotels/:id ✨ UPDATED                                     │  │
│  │  ├─ Auth: Required (JWT)                                            │  │
│  │  ├─ Auth: Hotel manager only                                        │  │
│  │  ├─ Accepts:                                                        │  │
│  │  │  ├─ checkInTime                                                  │  │
│  │  │  ├─ checkOutTime                                                 │  │
│  │  │  ├─ cancellationPolicy                                           │  │
│  │  │  └─ hotelRules ✨ NEW                                            │  │
│  │  └─ Returns: Updated hotel object                                   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Hotel Repository (hotel.repository.ts)                             │  │
│  │  ├─ findById(id)                                                    │  │
│  │  ├─ updateHotel(id, data)                                           │  │
│  │  └─ Handles database operations                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  MySQL Database                                                     │  │
│  │  ├─ Table: hotels                                                   │  │
│  │  │  ├─ id (VARCHAR)                                                 │  │
│  │  │  ├─ name (VARCHAR)                                               │  │
│  │  │  ├─ check_in_time (VARCHAR) - "14:00"                            │  │
│  │  │  ├─ check_out_time (VARCHAR) - "11:00"                           │  │
│  │  │  ├─ cancellation_policy (TEXT)                                   │  │
│  │  │  ├─ hotel_rules (TEXT) ✨ NEW                                    │  │
│  │  │  ├─ updated_at (TIMESTAMP)                                       │  │
│  │  │  └─ ... other fields                                             │  │
│  │  └─ Status: ✅ Migration applied                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EDIT FLOW (Hotel Manager)                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. INITIATE EDIT
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Hotel Manager                                                        │
   │ ├─ Logs in to admin panel                                           │
   │ ├─ Navigates to Hotels Management                                   │
   │ ├─ Clicks on hotel                                                  │
   │ ├─ Clicks "Edit" tab                                                │
   │ └─ Clicks "Edit" button                                             │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

2. LOAD CURRENT DATA
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Frontend (HotelDetailModal.tsx)                                      │
   │ ├─ Calls: hotelsService.getHotelDetail(hotelId)                     │
   │ └─ Receives: Hotel object with current values                       │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

3. DISPLAY EDIT FORM
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Edit Form (View Mode → Edit Mode)                                   │
   │ ├─ Check-in Time: 14:00 (time picker)                               │
   │ ├─ Check-out Time: 11:00 (time picker)                              │
   │ ├─ Cancellation Policy: (text area)                                 │
   │ └─ Hotel Rules: (text area)                                         │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

4. EDIT DATA
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Hotel Manager                                                        │
   │ ├─ Updates check-in time to 15:00                                   │
   │ ├─ Updates check-out time to 12:00                                  │
   │ ├─ Enters cancellation policy                                       │
   │ ├─ Enters hotel rules                                               │
   │ └─ Clicks "Save Changes"                                            │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

5. SEND TO API
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Frontend (hotelsService.updateHotelDetails)                          │
   │ ├─ Prepares request body:                                           │
   │ │  {                                                                 │
   │ │    checkInTime: "15:00",                                          │
   │ │    checkOutTime: "12:00",                                         │
   │ │    cancellationPolicy: "...",                                     │
   │ │    hotelRules: "..."                                              │
   │ │  }                                                                 │
   │ ├─ Adds JWT token to headers                                        │
   │ └─ Sends: PUT /api/hotels/:id                                       │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

6. VALIDATE & AUTHORIZE
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Backend (hotel.routes.ts)                                            │
   │ ├─ Verify JWT token ✅                                              │
   │ ├─ Extract user ID from token                                       │
   │ ├─ Check if user manages this hotel ✅                              │
   │ ├─ Validate input data ✅                                           │
   │ └─ Proceed to update                                                │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

7. UPDATE DATABASE
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Backend (hotel.repository.ts)                                        │
   │ ├─ Build UPDATE query:                                              │
   │ │  UPDATE hotels SET                                                │
   │ │    check_in_time = "15:00",                                       │
   │ │    check_out_time = "12:00",                                      │
   │ │    cancellation_policy = "...",                                   │
   │ │    hotel_rules = "...",                                           │
   │ │    updated_at = NOW()                                             │
   │ │  WHERE id = :hotelId                                              │
   │ ├─ Execute query                                                    │
   │ └─ Return success                                                   │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

8. RETURN UPDATED DATA
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Backend (hotel.routes.ts)                                            │
   │ ├─ Fetch updated hotel                                              │
   │ ├─ Return: { message: "Hotel updated successfully", hotel: {...} }  │
   │ └─ Status: 200 OK                                                   │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

9. UPDATE FRONTEND
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Frontend (HotelDetailModal.tsx)                                      │
   │ ├─ Receive updated hotel data                                       │
   │ ├─ Update state: setHotel(response.data)                            │
   │ ├─ Exit edit mode: setIsEditing(false)                              │
   │ ├─ Show success message                                             │
   │ └─ Display updated values in view mode                              │
   └──────────────────────────────────────────────────────────────────────┘
                                    ↓

10. DISPLAY ON BOOKING PAGE
    ┌──────────────────────────────────────────────────────────────────────┐
    │ Booking Page (Frontend)                                              │
    │ ├─ Fetches hotel data: GET /api/hotels/:id                           │
    │ ├─ Displays in sidebar:                                             │
    │ │  ├─ Check-in: 15:00 🕐                                            │
    │ │  ├─ Check-out: 12:00 🕐                                           │
    │ │  └─ Cancellation Policy: ... 📄                                   │
    │ └─ Displays in main content:                                        │
    │    └─ Hotel Rules: ...                                              │
    └──────────────────────────────────────────────────────────────────────┘
                                    ↓

11. GUEST SEES UPDATED INFO
    ┌──────────────────────────────────────────────────────────────────────┐
    │ Guest                                                                │
    │ ├─ Views booking page                                               │
    │ ├─ Sees updated check-in time: 15:00                                │
    │ ├─ Sees updated check-out time: 12:00                               │
    │ ├─ Reads cancellation policy                                        │
    │ └─ Reads hotel rules                                                │
    └──────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT INTERACTIONS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

HotelDetailModal.tsx
├─ State:
│  ├─ hotel: HotelDetail
│  ├─ activeTab: 'edit'
│  ├─ isEditing: boolean
│  ├─ editForm: { checkInTime, checkOutTime, cancellationPolicy, hotelRules }
│  └─ statusUpdating: boolean
│
├─ Methods:
│  ├─ loadHotelDetail()
│  │  └─ Calls: hotelsService.getHotelDetail()
│  │     └─ Initializes editForm with current values
│  │
│  └─ handleUpdateHotelDetails()
│     ├─ Calls: hotelsService.updateHotelDetails(hotelId, editForm)
│     ├─ Updates state: setHotel(response.data)
│     ├─ Exits edit mode: setIsEditing(false)
│     └─ Reinitializes editForm with new values
│
└─ Renders:
   ├─ Edit Tab Button
   ├─ View Mode (when !isEditing)
   │  ├─ Check-in Time (read-only)
   │  ├─ Check-out Time (read-only)
   │  ├─ Cancellation Policy (read-only)
   │  └─ Hotel Rules (read-only)
   │
   └─ Edit Mode (when isEditing)
      ├─ Check-in Time Input (time picker)
      ├─ Check-out Time Input (time picker)
      ├─ Cancellation Policy Input (text area)
      ├─ Hotel Rules Input (text area)
      ├─ Save Changes Button
      └─ Cancel Button

hotelsService.ts
├─ getHotelDetail(id)
│  └─ GET /api/admin/hotels/:id
│
└─ updateHotelDetails(id, updates)
   └─ PUT /api/hotels/:id

Backend API (hotel.routes.ts)
├─ GET /api/hotels/:id
│  ├─ Returns: Hotel with all fields
│  └─ Fields: id, name, checkInTime, checkOutTime, cancellationPolicy, hotelRules
│
└─ PUT /api/hotels/:id
   ├─ Auth: JWT required
   ├─ Auth: Hotel manager only
   ├─ Accepts: checkInTime, checkOutTime, cancellationPolicy, hotelRules
   └─ Returns: Updated hotel object

Database (hotels table)
├─ Columns:
│  ├─ id
│  ├─ name
│  ├─ check_in_time
│  ├─ check_out_time
│  ├─ cancellation_policy
│  ├─ hotel_rules ✨ NEW
│  └─ updated_at
│
└─ Operations:
   ├─ SELECT: Fetch hotel data
   └─ UPDATE: Update policies
```

## Security Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────┘

Request: PUT /api/hotels/:id
    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. AUTHENTICATION CHECK                                                     │
│    ├─ Extract JWT token from headers                                        │
│    ├─ Verify token signature                                                │
│    ├─ Check token expiration                                                │
│    └─ Extract user ID from token                                            │
│       ├─ ✅ Valid → Continue                                                │
│       └─ ❌ Invalid → Return 401 Unauthorized                               │
└─────────────────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. AUTHORIZATION CHECK                                                      │
│    ├─ Get user role from token                                              │
│    ├─ Check if user is hotel manager                                        │
│    ├─ Verify user manages this hotel                                        │
│    └─ Check hotel ownership                                                 │
│       ├─ ✅ Authorized → Continue                                           │
│       └─ ❌ Not authorized → Return 403 Forbidden                           │
└─────────────────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. INPUT VALIDATION                                                         │
│    ├─ Validate checkInTime format (HH:MM)                                   │
│    ├─ Validate checkOutTime format (HH:MM)                                  │
│    ├─ Validate cancellationPolicy (text)                                    │
│    ├─ Validate hotelRules (text)                                            │
│    └─ Check for malicious content                                           │
│       ├─ ✅ Valid → Continue                                                │
│       └─ ❌ Invalid → Return 400 Bad Request                                │
└─────────────────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. SQL INJECTION PREVENTION                                                 │
│    ├─ Use parameterized queries                                             │
│    ├─ Escape special characters                                             │
│    └─ Use prepared statements                                               │
│       └─ ✅ Safe → Continue                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. XSS PREVENTION                                                           │
│    ├─ Sanitize input data                                                   │
│    ├─ Escape HTML entities                                                  │
│    └─ Validate content type                                                 │
│       └─ ✅ Safe → Continue                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. DATABASE UPDATE                                                          │
│    ├─ Execute UPDATE query                                                  │
│    ├─ Set updated_at timestamp                                              │
│    └─ Commit transaction                                                    │
│       └─ ✅ Success → Return 200 OK                                         │
└─────────────────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. AUDIT LOGGING                                                            │
│    ├─ Log user ID                                                           │
│    ├─ Log hotel ID                                                          │
│    ├─ Log changes made                                                      │
│    ├─ Log timestamp                                                         │
│    └─ Log IP address                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0
**Last Updated**: April 25, 2026
**Status**: ✅ PRODUCTION READY
