# Hotel Manager Edit Interface - Quick Guide

## How to Edit Hotel Policies and Rules

### Step-by-Step Instructions

1. **Go to Your Hotel Listings**
   - Navigate to `/dashboard/listings` (or click "Listings" in your dashboard)
   - You'll see a list of all your hotels

2. **Select a Hotel**
   - Find the hotel you want to edit
   - Click the **"Manage Hotel"** button (blue button with pencil icon)

3. **Open the Edit Modal**
   - Once on the hotel details page, click the **"Edit Hotel"** button (top right)
   - A modal dialog will open with all editable fields

4. **Edit Your Policies**
   - **Check-in Time**: Set your standard check-in time (e.g., 14:00 / 2:00 PM)
   - **Check-out Time**: Set your standard check-out time (e.g., 11:00 / 11:00 AM)
   - **Cancellation Policy**: Describe your cancellation terms (e.g., "Free cancellation up to 24 hours before check-in")
   - **Hotel Rules**: Add any house rules or guidelines for guests (e.g., "No smoking", "Quiet hours after 10 PM")

5. **Save Your Changes**
   - Click the **"Save Changes"** button at the bottom of the modal
   - You'll see a success message confirming the update
   - The modal will close automatically

### What Gets Updated

When you save changes to your hotel policies:
- ✅ Check-in and check-out times are updated
- ✅ Cancellation policy is updated
- ✅ Hotel rules are updated
- ✅ Changes appear immediately on your public hotel page
- ✅ Guests see the updated policies when booking

### Where Guests See Your Policies

Your policies are displayed to guests in two places:

1. **Hotel Details Page** (`/stay/{hotelId}`)
   - Shows check-in/check-out times
   - Shows cancellation policy
   - Shows hotel rules

2. **Booking Confirmation**
   - Guests see all policies before confirming their booking

### Example Policies

**Check-in Time**: `14:00` (2:00 PM)
**Check-out Time**: `11:00` (11:00 AM)

**Cancellation Policy**:
```
Free cancellation up to 24 hours before check-in.
Cancellations within 24 hours of check-in will be charged the full booking amount.
```

**Hotel Rules**:
```
- No smoking in rooms
- Quiet hours: 10 PM - 8 AM
- Maximum 2 guests per room
- Pets not allowed
- Check-in after 2 PM, check-out before 11 AM
```

### Troubleshooting

**Q: I can't find the "Manage Hotel" button**
- Make sure you're on the listings page (`/dashboard/listings`)
- The button is on each hotel card in the list

**Q: The "Edit Hotel" button isn't showing**
- Refresh the page
- Make sure you're logged in as the hotel manager
- Check that you have permission to edit this hotel

**Q: My changes aren't saving**
- Check for error messages in the modal
- Make sure all required fields are filled
- Try refreshing the page and editing again

**Q: When do guests see my updated policies?**
- Immediately! Changes are live as soon as you save
- Guests see the latest policies when they view your hotel page or make a booking

## Related Pages

- **Hotel Listings**: `/dashboard/listings`
- **Hotel Details**: `/dashboard/listings/{hotelId}`
- **Public Hotel Page**: `/stay/{hotelId}`
- **Bookings**: `/dashboard/listings/bookings`
