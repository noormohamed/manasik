# Guest Details Collection - Quick Reference

## What Changed?

The checkout form now collects detailed information for **all guests**, not just the lead passenger.

## New Fields Collected

### Lead Passenger (Required)
- ✅ First Name
- ✅ Last Name
- ✅ Email Address
- ✅ Phone Number
- ✅ **Nationality** (NEW - Required)
- ✅ Date of Birth
- ✅ Passport Number

### Additional Guests (If Multiple)
- Same fields as lead passenger
- Add/remove guests dynamically
- Progress indicator shows: "Additional Guests (X/Y)"

## How It Works

### 1. User Adds Hotels to Cart
- Selects multiple hotels
- Each hotel has guest count

### 2. Checkout Page Shows Total Guests
- Calculates total from all hotels
- Example: 2 hotels × 2 guests = 4 total guests

### 3. User Fills Lead Passenger Form
- All fields required except phone, DOB, passport
- **Nationality is required** (important for Hajj/Umrah)

### 4. User Adds Additional Guests
- If total > 1, shows "Additional Guests" section
- Click "Add Guest" button to add each guest
- Fill in details for each guest
- Can remove guests with "Remove" button

### 5. Validation Before Payment
- All required fields must be filled
- Guest count must match total
- Cannot proceed to payment until complete

### 6. Payment Processing
- All guest details sent to backend
- Stored with booking
- Displayed in confirmation

## Example Scenario

**Booking**: 2 hotels, 3 guests total

1. **Lead Passenger** (Guest 1)
   - John Doe
   - john@example.com
   - +1-234-567-8900
   - Nationality: United Kingdom
   - Passport: AB123456

2. **Guest 2**
   - Jane Doe
   - jane@example.com
   - +1-234-567-8901
   - Nationality: United Kingdom
   - Passport: CD789012

3. **Guest 3**
   - Bob Smith
   - bob@example.com
   - +1-234-567-8902
   - Nationality: United States
   - Passport: EF345678

## Confirmation Display

All guests listed in booking confirmation:

```
👤 Guest Information

Lead Passenger
├─ John Doe (Lead Passenger)
├─ Email: john@example.com
├─ Phone: +1-234-567-8900
├─ Nationality: United Kingdom
└─ Passport: AB123456

Guest 2
├─ Jane Doe
├─ Email: jane@example.com
├─ Phone: +1-234-567-8901
├─ Nationality: United Kingdom
└─ Passport: CD789012

Guest 3
├─ Bob Smith
├─ Email: bob@example.com
├─ Phone: +1-234-567-8902
├─ Nationality: United States
└─ Passport: EF345678
```

## Database Storage

### New Table: `guests`
- Stores individual guest information
- Links to booking via `booking_id`
- Marks lead passenger with `is_lead_passenger` flag

### Updated: `bookings` Table
- New `guest_details` JSON column
- Stores guest array for quick access

## Key Features

✅ **Lead Passenger Identification**
- Marked as lead passenger
- Highlighted in confirmation
- Primary contact for booking

✅ **Multiple Guests Support**
- Add as many guests as needed
- Each guest has full details
- Dynamic add/remove UI

✅ **Nationality Field**
- Required for all guests
- Important for Hajj/Umrah context
- Helps with compliance

✅ **Passport Information**
- Optional but recommended
- Useful for hotel check-in
- Stored for reference

✅ **Form Validation**
- Prevents incomplete submissions
- Validates guest count
- Shows error messages

✅ **Mobile Responsive**
- Works on all devices
- Easy to fill on mobile
- Clear section separation

## Implementation Status

### ✅ Complete
- Frontend checkout form
- Guest collection UI
- Form validation
- Database schema
- Migration file

### 🔄 In Progress
- Backend API updates
- Guest storage logic
- Confirmation display

### 📋 To Do
- Apply database migration
- Update booking endpoints
- Update confirmation display
- Test end-to-end

## Next Steps

1. **Apply Database Migration**
   ```bash
   mysql -u user -p database < service/database/migrations/010-add-guest-details-table.sql
   ```

2. **Update Backend**
   - Modify `/hotels/:id/bookings` endpoint
   - Accept and store guest details
   - Return guest info in responses

3. **Update Confirmation**
   - Display all guests
   - Show guest details
   - Highlight lead passenger

4. **Test**
   - Create booking with multiple guests
   - Verify data storage
   - Check confirmation display

## Benefits

🎯 **For Users**
- Provide complete guest information
- Know what's required upfront
- Easy to manage multiple guests
- Professional confirmation

🎯 **For Hotels**
- Know all guests staying
- Can contact any guest
- Nationality information
- Passport info for check-in

🎯 **For Platform**
- Better data collection
- Improved compliance
- Better guest tracking
- Enhanced bookings

## Troubleshooting

### "Please add details for all X guests"
- You haven't added enough guests
- Click "Add Guest" button
- Fill in all required fields

### "Please fill in all required lead passenger fields"
- Missing required field in lead passenger form
- Check: First Name, Last Name, Email, Nationality
- All marked with * are required

### Guest count doesn't match
- Total guests from hotels ≠ guests added
- Add/remove guests to match total
- Progress indicator shows current count

### Can't proceed to payment
- Form validation failed
- Check all required fields filled
- Verify guest count matches
- Look for error messages

## Support

For issues:
1. Check error messages on form
2. Verify all required fields filled
3. Ensure guest count matches
4. Clear browser cache
5. Try different browser

## Summary

The checkout process now collects comprehensive guest information including nationality, which is essential for Hajj/Umrah bookings. All guests are tracked individually with full details, providing better information for hotels and a more professional booking experience.

**Status**: ✅ Frontend Ready
- Checkout form: ✅ Updated
- Guest collection: ✅ Working
- Validation: ✅ Active
- Backend: 🔄 Ready for updates
