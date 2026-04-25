# Hotel Manager Edit Interface - UI Guide

## Admin Panel Navigation

### Step 1: Access Hotels Management
```
Admin Panel (http://localhost:3002)
    ↓
Sidebar → Hotels Management
    ↓
Hotels List Page
```

### Step 2: Open Hotel Detail Modal
```
Hotels List
    ↓
Click on any hotel row
    ↓
Hotel Detail Modal opens
```

### Step 3: Navigate to Edit Tab
```
Hotel Detail Modal
    ├─ Overview Tab (current)
    ├─ Rooms Tab
    ├─ Bookings Tab
    ├─ Reviews Tab
    ├─ Transactions Tab
    ├─ Amenities Tab
    └─ Edit Tab ← Click here
```

## Edit Tab Interface

### View Mode (Default)
```
┌─────────────────────────────────────────────────────────┐
│ Edit Hotel Policies                          [Edit Button]│
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Check-in Time                                            │
│ 14:00                                                    │
│                                                           │
│ Check-out Time                                           │
│ 11:00                                                    │
│                                                           │
│ Cancellation Policy                                      │
│ Free cancellation up to 48 hours before check-in.       │
│ Cancellations within 48 hours will be charged...        │
│                                                           │
│ Hotel Rules                                              │
│ No smoking in rooms or common areas.                    │
│ Quiet hours: 22:00 - 08:00                             │
│ Maximum occupancy per room must be respected.           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Edit Mode (After Clicking Edit)
```
┌─────────────────────────────────────────────────────────┐
│ Edit Hotel Policies                                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Check-in Time                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 14:00                                    [Time Picker]│ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Check-out Time                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 11:00                                    [Time Picker]│ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Cancellation Policy                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Free cancellation up to 48 hours before check-in.  │ │
│ │ Cancellations within 48 hours will be charged...   │ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Hotel Rules                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ No smoking in rooms or common areas.               │ │
│ │ Quiet hours: 22:00 - 08:00                        │ │
│ │ Maximum occupancy per room must be respected.      │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Save Changes Button]  [Cancel Button]                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Form Fields

### 1. Check-in Time
- **Type**: Time Input (HH:MM format)
- **Format**: 24-hour (00:00 - 23:59)
- **Example**: 14:00 (2:00 PM)
- **Default**: 14:00
- **Validation**: Must be valid time format

### 2. Check-out Time
- **Type**: Time Input (HH:MM format)
- **Format**: 24-hour (00:00 - 23:59)
- **Example**: 11:00 (11:00 AM)
- **Default**: 11:00
- **Validation**: Must be valid time format

### 3. Cancellation Policy
- **Type**: Text Area
- **Rows**: 4
- **Max Length**: No limit (but keep reasonable)
- **Placeholder**: "Enter cancellation policy details..."
- **Supports**: Line breaks, special characters
- **Example**:
  ```
  Free cancellation up to 48 hours before check-in.
  Cancellations within 48 hours will be charged the full booking amount.
  No-show bookings will be charged in full.
  ```

### 4. Hotel Rules
- **Type**: Text Area
- **Rows**: 4
- **Max Length**: No limit (but keep reasonable)
- **Placeholder**: "Enter hotel rules and guidelines..."
- **Supports**: Line breaks, special characters
- **Example**:
  ```
  No smoking in rooms or common areas.
  Quiet hours: 22:00 - 08:00
  Maximum occupancy per room must be respected.
  Guests must present valid ID at check-in.
  Pets are not allowed.
  ```

## Button States

### Edit Button
- **State**: Visible in View Mode
- **Action**: Switches to Edit Mode
- **Color**: Indigo/Blue
- **Text**: "Edit"

### Save Changes Button
- **State**: Visible in Edit Mode
- **Action**: Saves all changes to database
- **Color**: Green
- **Text**: "Save Changes" or "Saving..." (when loading)
- **Disabled**: When saving (shows loading state)

### Cancel Button
- **State**: Visible in Edit Mode
- **Action**: Discards changes and returns to View Mode
- **Color**: Gray
- **Text**: "Cancel"

## Data Display on Booking Page

### Sidebar - Hotel Information Section
```
┌─────────────────────────────────┐
│ Hotel Information               │
├─────────────────────────────────┤
│                                 │
│ 🕐 Check-in: 14:00             │
│                                 │
│ 🕐 Check-out: 11:00            │
│                                 │
│ 📄 Cancellation Policy:         │
│    Free cancellation up to      │
│    48 hours before check-in.    │
│                                 │
└─────────────────────────────────┘
```

### Main Content - Hotel Rules Section
```
┌─────────────────────────────────────────────────────┐
│ Hotel Rules                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ No smoking in rooms or common areas.               │
│ Quiet hours: 22:00 - 08:00                        │
│ Maximum occupancy per room must be respected.      │
│ Guests must present valid ID at check-in.          │
│ Pets are not allowed.                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Workflow Examples

### Example 1: Update Check-in Time
```
1. Click "Edit" tab
2. Click "Edit" button
3. Click on Check-in Time field
4. Change from 14:00 to 15:00
5. Click "Save Changes"
6. Confirmation: "Hotel updated successfully"
7. Booking page shows new check-in time: 15:00
```

### Example 2: Add Cancellation Policy
```
1. Click "Edit" tab
2. Click "Edit" button
3. Click on Cancellation Policy text area
4. Enter policy text:
   "Free cancellation up to 72 hours before check-in.
    50% refund for cancellations 24-72 hours before check-in.
    No refund for cancellations within 24 hours."
5. Click "Save Changes"
6. Confirmation: "Hotel updated successfully"
7. Booking page shows new policy in sidebar
```

### Example 3: Add Hotel Rules
```
1. Click "Edit" tab
2. Click "Edit" button
3. Click on Hotel Rules text area
4. Enter rules text:
   "No smoking in rooms or common areas.
    Quiet hours: 22:00 - 08:00
    Maximum occupancy per room must be respected.
    Guests must present valid ID at check-in.
    Pets are not allowed."
5. Click "Save Changes"
6. Confirmation: "Hotel updated successfully"
7. Booking page shows new rules in main content area
```

## Error Handling

### Validation Errors
- **Invalid Time Format**: "Please enter a valid time (HH:MM)"
- **Empty Required Fields**: "This field is required"
- **Network Error**: "Failed to save changes. Please try again."

### Success Messages
- **Save Successful**: "Hotel updated successfully"
- **Changes Saved**: Form returns to View Mode
- **Data Persisted**: Changes visible on booking page

## Tips for Best Results

1. **Time Format**: Always use 24-hour format
   - ✅ Correct: 14:00, 11:00, 23:59
   - ❌ Wrong: 2:00 PM, 11 AM, 24:00

2. **Line Breaks**: Press Enter to create new lines
   - Makes policies easier to read
   - Improves guest experience

3. **Clear Language**: Use simple, clear language
   - Avoid jargon
   - Be specific about dates/times
   - Include all important details

4. **Regular Updates**: Update policies seasonally
   - Summer/Winter rates
   - Holiday policies
   - Special events

5. **Consistency**: Keep policies consistent across all hotels
   - Use similar formatting
   - Similar level of detail
   - Aligned with company standards

## Keyboard Shortcuts

- **Tab**: Move to next field
- **Shift+Tab**: Move to previous field
- **Enter**: In text areas, creates new line
- **Escape**: Cancel edit mode (if implemented)

## Accessibility

- ✅ All form fields have labels
- ✅ Time inputs have proper input type
- ✅ Text areas have placeholder text
- ✅ Buttons have clear labels
- ✅ Color contrast meets WCAG standards
- ✅ Keyboard navigation supported

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (responsive design)

## Performance

- ✅ Form loads instantly
- ✅ Save operation completes in <2 seconds
- ✅ No page reload required
- ✅ Changes visible immediately

---

**Last Updated**: April 25, 2026
**Version**: 1.0
