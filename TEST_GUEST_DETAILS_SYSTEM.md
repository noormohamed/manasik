# Testing the Guest Details System

## Quick Test Guide

Follow these steps to verify the guest details system is working correctly:

## Step 1: Verify Database Migrations

Check that the migrations have been applied:

```bash
# Connect to your database
mysql -u user -p database

# Check if guests table exists
SHOW TABLES LIKE 'guests';

# Check if guest_details column exists in bookings
DESCRIBE bookings;
# Look for: guest_details | JSON | YES
```

Expected output:
```
+--------+
| Tables |
+--------+
| guests |
+--------+

# And in bookings table:
guest_details | JSON | YES
```

## Step 2: Test Checkout Form

1. **Navigate to**: `http://localhost:3000/stay`
2. **Select a hotel** and add to cart
3. **Go to checkout**: Click checkout button
4. **Verify form fields**:
   - ✅ Lead Passenger section visible
   - ✅ First Name field (required)
   - ✅ Last Name field (required)
   - ✅ Email field (required)
   - ✅ **Nationality field (required)** ← NEW
   - ✅ Phone field (optional)
   - ✅ Date of Birth field (optional)
   - ✅ Passport Number field (optional)

5. **Test validation**:
   - Try to submit without filling nationality
   - Should show error: "Please fill in all required lead passenger fields"
   - Fill in nationality and try again
   - Should proceed

6. **Add additional guests** (if booking for 2+ guests):
   - Click "Add Guest" button
   - Fill in guest details including nationality
   - Verify all fields are present
   - Remove guest and verify it's removed

## Step 3: Create a Test Booking

1. **Fill in lead passenger**:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Nationality: **United Kingdom** ← NEW
   - Phone: +44-123-456-7890
   - Passport: UK123456789
   - DOB: 01/15/1985

2. **Add additional guest** (if 2+ guests):
   - First Name: Jane
   - Last Name: Doe
   - Email: jane@example.com
   - Nationality: **United Kingdom** ← NEW
   - Phone: +44-123-456-7891
   - Passport: UK987654321
   - DOB: 03/22/1988

3. **Complete checkout** and payment

## Step 4: Verify Booking in Database

```bash
# Connect to database
mysql -u user -p database

# Find the booking
SELECT id, guest_details FROM bookings ORDER BY created_at DESC LIMIT 1;

# Check guest records
SELECT * FROM guests WHERE booking_id = 'YOUR_BOOKING_ID';
```

Expected output:
```
# Guests table should have records like:
id | booking_id | first_name | last_name | email | phone | nationality | passport_number | date_of_birth | is_lead_passenger
1  | abc123     | John       | Doe       | john@ | +44   | United Kingdom | UK123456789 | 1985-01-15 | 1
2  | abc123     | Jane       | Doe       | jane@ | +44   | United Kingdom | UK987654321 | 1988-03-22 | 0
```

## Step 5: View Booking Confirmation

### Option A: Customer View
1. **Navigate to**: `http://localhost:3000/me/bookings`
2. **Find your booking** in the list
3. **Click "View Confirmation"** button
4. **Verify guest information section**:
   - ✅ All guests listed
   - ✅ Lead passenger has blue "LEAD" badge
   - ✅ Each guest shows:
     - Name with badge (if lead)
     - 📧 Email
     - 📱 Phone
     - 🌍 **Nationality** ← NEW
     - 📄 Passport Number
     - 🎂 Date of Birth

### Option B: Hotel Manager View
1. **Navigate to**: `http://localhost:3000/dashboard/listings/bookings`
2. **Find your booking** in the list
3. **Click booking** to open details modal
4. **Click "Print Confirmation"** button
5. **Verify guest information section** (same as above)

## Step 6: Print Confirmation

1. **In the confirmation popup**, click **"🖨️ Print Confirmation"** button
2. **Verify printed output**:
   - ✅ Header with booking ID and status
   - ✅ Accommodation section with hotel details
   - ✅ **Guest Information section with all guests**:
     - Name with LEAD badge
     - Email, Phone, Nationality, Passport, DOB
   - ✅ Stay Details section
   - ✅ Haram Gate Access section (if available)
   - ✅ Payment Summary section
   - ✅ Important Information section
   - ✅ Footer

## Step 7: API Testing (Optional)

### Test Booking Creation Endpoint
```bash
curl -X POST http://localhost:3001/api/hotels/HOTEL_ID/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "roomTypeId": "ROOM_ID",
    "checkIn": "2026-05-01",
    "checkOut": "2026-05-05",
    "guestCount": 2,
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "guestPhone": "+44-123-456-7890",
    "guestDetails": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+44-123-456-7890",
        "nationality": "United Kingdom",
        "passportNumber": "UK123456789",
        "dateOfBirth": "1985-01-15",
        "isLeadPassenger": true
      },
      {
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com",
        "phone": "+44-123-456-7891",
        "nationality": "United Kingdom",
        "passportNumber": "UK987654321",
        "dateOfBirth": "1988-03-22",
        "isLeadPassenger": false
      }
    ]
  }'
```

Expected response:
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "abc123",
    "status": "PENDING",
    "guests": [
      {
        "id": "guest1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+44-123-456-7890",
        "nationality": "United Kingdom",
        "passportNumber": "UK123456789",
        "dateOfBirth": "1985-01-15",
        "isLeadPassenger": true
      },
      {
        "id": "guest2",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com",
        "phone": "+44-123-456-7891",
        "nationality": "United Kingdom",
        "passportNumber": "UK987654321",
        "dateOfBirth": "1988-03-22",
        "isLeadPassenger": false
      }
    ]
  }
}
```

### Test Booking Retrieval Endpoint
```bash
curl -X GET http://localhost:3001/api/users/me/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response includes:
```json
{
  "bookings": [
    {
      "id": "abc123",
      "guestDetails": [
        {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phone": "+44-123-456-7890",
          "nationality": "United Kingdom",
          "passportNumber": "UK123456789",
          "dateOfBirth": "1985-01-15",
          "isLeadPassenger": true
        },
        {
          "firstName": "Jane",
          "lastName": "Doe",
          "email": "jane@example.com",
          "phone": "+44-123-456-7891",
          "nationality": "United Kingdom",
          "passportNumber": "UK987654321",
          "dateOfBirth": "1988-03-22",
          "isLeadPassenger": false
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Issue: Nationality field not showing in checkout
**Solution**: 
- Clear browser cache
- Rebuild frontend: `npm run build` in frontend directory
- Restart frontend server

### Issue: Guest details not showing in confirmation
**Solution**:
- Verify migrations were applied: `SHOW TABLES LIKE 'guests';`
- Check booking has guest records: `SELECT * FROM guests WHERE booking_id = 'YOUR_ID';`
- Verify API returns guestDetails: Check network tab in browser dev tools

### Issue: "Nationality is required" error
**Solution**:
- This is expected! Nationality is now a required field
- Fill in the nationality field and try again

### Issue: Old bookings still show old format
**Solution**:
- This is expected! Old bookings were created before the system
- Create a new booking to see the new format
- Old bookings will show fallback format (basic guest info)

## Success Criteria

✅ Checkout form has nationality field (required)
✅ Can create booking with multiple guests
✅ Guest records created in database
✅ Confirmation shows all guests with details
✅ Lead passenger has blue badge
✅ Nationality displayed for all guests
✅ Print confirmation works
✅ API returns guestDetails array

## Summary

If all steps pass, the guest details system is **working correctly**! 

The reason you don't see changes on existing bookings is because they were created before the system was implemented. **New bookings will show the new detailed guest format with nationality.**
