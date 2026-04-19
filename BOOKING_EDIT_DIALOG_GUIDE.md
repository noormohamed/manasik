# Booking Edit Dialog - User Guide

## Location
**URL**: `http://localhost:3000/me/bookings`

## How to Access the Edit Dialog

### Step 1: View Your Bookings
Navigate to `/me/bookings` to see all your bookings.

### Step 2: Find the Edit Button
On each booking card, you'll see several buttons:
- "Confirmation Details" (primary button)
- **"Edit"** (new button with pencil icon) ← Click this
- "View Hotel" (outline button)

### Step 3: Click Edit
Click the "Edit" button to open the booking management dialog.

## Edit Dialog Layout

```
┌─────────────────────────────────────────────────────┐
│ ✎ Edit Booking                              [×]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🏨 Beach Club                                       │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Check-in Date          Check-out Date           │ │
│ │ [2026-05-01]           [2026-05-05]             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 👤 Guest Information                            │ │
│ │                                                 │ │
│ │ Guest Name             Email                    │ │
│ │ [John Doe]             [john@example.com]       │ │
│ │                                                 │ │
│ │ Phone                                           │ │
│ │ [+44-123-456-7890]                              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 👥 Guest Details (2)                            │ │
│ │                                                 │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ John Doe [LEAD]                      [×]    │ │ │
│ │ ├─────────────────────────────────────────────┤ │ │
│ │ │ First Name: John                            │ │ │
│ │ │ Last Name: Doe                              │ │ │
│ │ │ Email: john@example.com                     │ │ │
│ │ │ Phone: +44-123-456-7890                     │ │ │
│ │ │ Nationality: United Kingdom                 │ │ │
│ │ │ Passport: UK123456789                       │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │                                                 │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Jane Doe                             [×]    │ │ │
│ │ ├─────────────────────────────────────────────┤ │ │
│ │ │ First Name: Jane                            │ │ │
│ │ │ Last Name: Doe                              │ │ │
│ │ │ Email: jane@example.com                     │ │ │
│ │ │ Phone: +44-123-456-7891                     │ │ │
│ │ │ Nationality: United Kingdom                 │ │ │
│ │ │ Passport: UK987654321                       │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Cancel]                    [💾 Save Changes]       │
└─────────────────────────────────────────────────────┘
```

## What You Can Edit

### ✅ Editable Fields
- **Check-in Date**: Change the check-in date
- **Check-out Date**: Change the check-out date
- **Guest Name**: Update the main guest name
- **Email**: Update the guest email
- **Phone**: Update the guest phone number

### ℹ️ View-Only Fields
- **Guest Details**: View all guest information (name, email, phone, nationality, passport)
- **Hotel Name**: Display only
- **Lead Passenger Badge**: Shows which guest is the lead passenger

## How to Make Changes

### Change Dates
1. Click on the date field
2. Select a new date from the calendar
3. The date will update in the field

### Change Guest Information
1. Click on the text field (Guest Name, Email, or Phone)
2. Clear the current value
3. Type the new value
4. The field will update as you type

### Remove a Guest
1. Find the guest in the "Guest Details" section
2. Click the [×] delete button on their card
3. The guest will be removed from the list

## Saving Changes

### To Save
1. Make your changes in the form
2. Click the **"Save Changes"** button
3. Wait for the save to complete (you'll see a loading spinner)
4. The modal will close automatically
5. Your booking will be updated in the list

### To Cancel
1. Click the **"Cancel"** button
2. The modal will close without saving
3. Your changes will be discarded

## What Happens After Saving

✅ Modal closes automatically
✅ Booking list updates with new information
✅ Changes are reflected in the booking card
✅ You can view the updated confirmation details

## Error Handling

If something goes wrong:
- An error alert will appear
- The modal will stay open
- You can try saving again
- Or click Cancel to close without saving

## Tips

💡 **Tip 1**: You can edit multiple fields before saving
💡 **Tip 2**: Check-out date must be after check-in date
💡 **Tip 3**: All guest information is displayed for reference
💡 **Tip 4**: Lead passenger is marked with a blue badge
💡 **Tip 5**: You can remove guests by clicking the delete button

## Limitations (Current)

⚠️ Guest details are view-only (cannot edit individual guest info)
⚠️ Cannot add new guests from this dialog
⚠️ Cannot change room type
⚠️ Cannot modify special requests

## Future Features

🔜 Edit individual guest details
🔜 Add new guests
🔜 Change room type
🔜 Modify special requests
🔜 Validate date changes
🔜 Show validation errors

## Support

If you encounter any issues:
1. Check that all required fields are filled
2. Ensure dates are valid (check-out after check-in)
3. Try refreshing the page
4. Contact support if problems persist

## Summary

The edit dialog allows you to quickly manage your bookings by:
- ✅ Changing check-in/check-out dates
- ✅ Updating guest information
- ✅ Viewing all guest details
- ✅ Removing guests if needed

Simply click the "Edit" button on any booking to get started!
