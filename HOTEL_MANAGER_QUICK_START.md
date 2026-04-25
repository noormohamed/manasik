# Hotel Manager - Edit Hotel Policies Quick Start

## Access the Feature

1. **Log in to Admin Panel**: http://localhost:3002
2. **Navigate to**: Hotels Management (from sidebar)
3. **Select a Hotel**: Click on any hotel in the list
4. **Click "Edit" Tab**: In the hotel detail modal

## Edit Hotel Information

### Check-in Time
- **Current Value**: Displayed in the overview tab
- **How to Edit**: 
  1. Go to Edit tab
  2. Click the "Edit" button
  3. Use the time picker to set check-in time
  4. Click "Save Changes"
- **Format**: HH:MM (24-hour format, e.g., 14:00)
- **Where It Shows**: Booking page sidebar under "Hotel Information"

### Check-out Time
- **Current Value**: Displayed in the overview tab
- **How to Edit**: 
  1. Go to Edit tab
  2. Click the "Edit" button
  3. Use the time picker to set check-out time
  4. Click "Save Changes"
- **Format**: HH:MM (24-hour format, e.g., 11:00)
- **Where It Shows**: Booking page sidebar under "Hotel Information"

### Cancellation Policy
- **Current Value**: Displayed in the overview tab
- **How to Edit**: 
  1. Go to Edit tab
  2. Click the "Edit" button
  3. Enter or update the cancellation policy text
  4. Click "Save Changes"
- **Format**: Plain text (supports line breaks)
- **Where It Shows**: Booking page sidebar under "Hotel Information"
- **Example**: 
  ```
  Free cancellation up to 48 hours before check-in.
  Cancellations within 48 hours will be charged the full booking amount.
  No-show bookings will be charged in full.
  ```

### Hotel Rules
- **Current Value**: Displayed in the edit tab
- **How to Edit**: 
  1. Go to Edit tab
  2. Click the "Edit" button
  3. Enter or update the hotel rules text
  4. Click "Save Changes"
- **Format**: Plain text (supports line breaks)
- **Where It Shows**: Booking page main content area under "Hotel Rules" section
- **Example**: 
  ```
  No smoking in rooms or common areas.
  Quiet hours: 22:00 - 08:00
  Maximum occupancy per room must be respected.
  Guests must present valid ID at check-in.
  Pets are not allowed.
  ```

## Edit Mode vs View Mode

### View Mode (Default)
- All fields are displayed in read-only format
- Click "Edit" button to enter edit mode
- Shows current values for all policies

### Edit Mode
- All fields become editable
- Time pickers for check-in/check-out times
- Text areas for policies and rules
- Two buttons appear:
  - **Save Changes**: Saves all updates to the database
  - **Cancel**: Discards changes and returns to view mode

## Tips & Best Practices

1. **Time Format**: Always use 24-hour format (14:00 instead of 2:00 PM)

2. **Cancellation Policy**: Be clear and specific about:
   - Cancellation deadlines
   - Refund amounts
   - No-show policies
   - Special conditions

3. **Hotel Rules**: Include important information like:
   - Smoking policies
   - Quiet hours
   - Pet policies
   - Check-in/check-out procedures
   - House rules and restrictions

4. **Line Breaks**: Press Enter to create line breaks in policies and rules for better readability

5. **Save Regularly**: Click "Save Changes" after each update to ensure changes are persisted

## Troubleshooting

### Changes Not Saving
- Ensure you clicked "Save Changes" button
- Check that you have proper permissions (must be hotel manager)
- Verify the API is running (check health at http://localhost:3001/api/health)

### Changes Not Appearing on Booking Page
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Refresh the booking page
- Wait a few seconds for the changes to propagate

### Cannot Access Edit Tab
- Verify you're logged in as a hotel manager
- Check that you have permission to manage this hotel
- Try logging out and logging back in

## What Gets Updated

When you save changes in the Edit tab:

| Field | Database Column | Booking Page Location |
|-------|-----------------|----------------------|
| Check-in Time | `check_in_time` | Sidebar - Hotel Information |
| Check-out Time | `check_out_time` | Sidebar - Hotel Information |
| Cancellation Policy | `cancellation_policy` | Sidebar - Hotel Information |
| Hotel Rules | `hotel_rules` | Main Content - Hotel Rules Section |

## Example Workflow

### Scenario: Update Hotel Policies for Summer Season

1. **Log in** to admin panel
2. **Navigate** to Hotels Management
3. **Find** your hotel and click to open
4. **Click** Edit tab
5. **Click** Edit button
6. **Update** cancellation policy:
   ```
   Summer Season (June-August):
   - Free cancellation up to 72 hours before check-in
   - 50% refund for cancellations 24-72 hours before check-in
   - No refund for cancellations within 24 hours
   ```
7. **Update** hotel rules:
   ```
   Summer Season Rules:
   - Pool hours: 08:00 - 20:00
   - Quiet hours: 22:00 - 08:00
   - Beach towels available at front desk
   - Air conditioning available in all rooms
   ```
8. **Click** Save Changes
9. **Verify** changes appear on booking page

## Support

For issues or questions:
- Check the API health: http://localhost:3001/api/health
- Review logs in the management container: `docker logs booking_management`
- Check API logs: `docker logs booking_api`
