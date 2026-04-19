# Design Document: My Bookings Redesign

## Overview

The My Bookings page is being redesigned to improve usability and information accessibility through a modern two-column layout. The left column displays a scrollable, sortable list of bookings with visual selection states, while the right column shows comprehensive details for the selected booking. This design maintains all existing functionality (filters, search, refunds, print) while providing a clearer information hierarchy and improved mobile responsiveness.

### Key Design Goals

1. **Improved Information Hierarchy**: Separate booking list from detailed information for better cognitive load
2. **Enhanced Discoverability**: Gate proximity information prominently displayed for travel planning
3. **Responsive Experience**: Seamless adaptation across desktop, tablet, and mobile devices
4. **Preserved Functionality**: All existing features remain accessible and functional
5. **Visual Clarity**: Clear status indicators, organized sections, and consistent spacing

---

## Architecture

### Component Structure

```
MyBookingsPage
├── BookingListPanel (Left Column)
│   ├── FilterBar
│   │   ├── StatusFilter
│   │   ├── HotelFilter
│   │   ├── DateFilter
│   │   └── SearchInput
│   ├── BookingList (Scrollable Container)
│   │   └── BookingCard[] (Selectable)
│   └── PaginationControls (if needed)
├── BookingDetailPanel (Right Column)
│   ├── EmptyState (when no booking selected)
│   ├── AccommodationSection
│   ├── GuestInformationSection
│   ├── StayDetailsSection
│   ├── GateInformationSection
│   ├── PaymentSummarySection
│   ├── ActionButtons
│   │   ├── EditButton
│   │   ├── RefundButton
│   │   ├── CancelButton
│   │   └── PrintButton
│   └── RefundModal (conditional)
└── ResponsiveWrapper (handles layout switching)
```

### Layout Breakpoints

- **Desktop (≥1024px)**: Two-column side-by-side layout
  - Left column: 35% width, fixed height with scrollable content
  - Right column: 65% width, scrollable content
  - Minimum gap: 24px between columns

- **Tablet (768px - 1023px)**: Adjusted two-column layout
  - Left column: 40% width
  - Right column: 60% width
  - Reduced gap: 16px

- **Mobile (<768px)**: Stacked vertical layout
  - Full-width booking list (scrollable, max-height: 50vh)
  - Full-width booking details below
  - Tabs or accordion for section organization

---

## Components and Interfaces

### 1. BookingListPanel Component

**Purpose**: Displays filterable, sortable list of bookings with selection state

**Props**:
```typescript
interface BookingListPanelProps {
  bookings: Booking[];
  selectedBookingId: string | null;
  onSelectBooking: (booking: Booking) => void;
  filters: {
    status: string;
    hotel: string;
    date: Date | null;
    searchGuest: string;
  };
  onFilterChange: (filterKey: string, value: any) => void;
  loading: boolean;
  error: string | null;
}
```

**Features**:
- Compact booking cards showing: hotel name, room type, check-in/check-out dates, status badge
- Visual selection state (highlighted border, background color change)
- Sorted by most recent first (check-in date descending)
- Fixed height scrollable container (height: 600px on desktop, adjusts on tablet/mobile)
- Filter controls above list
- Search functionality for guest name/email
- Status filter with visual badges
- Hotel filter dropdown
- Date range filter
- Clear all filters button

**Styling**:
- Card padding: 12px
- Card border: 1px solid #e0e0e0
- Selected card: 2px solid #0d6efd, background: #f0f7ff
- Hover state: background: #f8f9fa
- Status badges: color-coded (green=confirmed, yellow=pending, red=cancelled, etc.)

### 2. BookingDetailPanel Component

**Purpose**: Displays comprehensive information for selected booking

**Props**:
```typescript
interface BookingDetailPanelProps {
  booking: Booking | null;
  onEdit: () => void;
  onRefund: () => void;
  onCancel: () => void;
  onPrint: () => void;
  isEditable: boolean;
}
```

**Sections** (in order):

#### 2.1 Accommodation Section
- Hotel name (large, prominent)
- Star rating (if available)
- Room type/name
- Full address with icon
- Check-in/check-out times
- Provider information (if applicable)

**Styling**:
- Background: #e8f4fd
- Border: 2px solid #0d6efd
- Padding: 20px
- Border-radius: 12px

#### 2.2 Guest Information Section
- Lead passenger highlighted
- For each guest: name, email, phone, nationality, passport number, date of birth
- Guest count summary

**Styling**:
- Grid layout: 2 columns on desktop, 1 on mobile
- Info boxes with left border accent
- Lead passenger: blue left border (#0d6efd)
- Other guests: gray left border (#6c757d)

#### 2.3 Stay Details Section
- Check-in date and time
- Check-out date and time
- Duration (number of nights)
- Booking creation date

**Styling**:
- Grid layout: 2x2 on desktop, 1 column on mobile
- Info boxes with subtle background (#f8f9fa)
- Border: 1px solid #e9ecef

#### 2.4 Gate Information Section
- **Closest Gate Box** (Teal/Cyan)
  - Gate name and number
  - Distance in kilometers
  - Walking time in minutes
  - Icon: 🚶

- **Kaaba Gate Box** (Purple)
  - Gate name and number
  - Distance in kilometers
  - Walking time in minutes
  - Icon: 🕋

**Styling**:
- Grid layout: 2 columns on desktop, 1 on mobile
- Closest Gate: background #e0f7fa, border-left: 4px solid #00bcd4
- Kaaba Gate: background #f3e5f5, border-left: 4px solid #9c27b0
- Padding: 16px
- Border-radius: 8px
- "Not available" placeholder if data missing

#### 2.5 Payment Summary Section
- Subtotal
- Tax
- Total (prominent)
- Refund information (if applicable)
  - Refund amount
  - Refund reason
  - Refund date

**Styling**:
- Background: #e7f1ff
- Border: 1px solid #b3d9ff
- Padding: 20px
- Border-radius: 8px
- Total row: bold, larger font, color: #0d6efd

#### 2.6 Action Buttons Section
- **Edit Button**: Primary button, enabled only for editable bookings
- **Refund Button**: Secondary button, enabled only for refundable bookings
- **Cancel Button**: Secondary button, enabled only for cancellable bookings
- **Print Button**: Secondary button, always enabled

**Styling**:
- Button layout: flex row, gap: 12px
- Responsive: stack vertically on mobile
- Primary button: background #0d6efd, color white
- Secondary button: background #f8f9fa, border: 1px solid #dee2e6

### 3. EmptyState Component

**Purpose**: Displayed when no booking is selected

**Content**:
- Icon: 📋
- Message: "Select a booking to view details"
- Subtext: "Choose a booking from the list on the left"

**Styling**:
- Centered content
- Padding: 40px
- Color: #6c757d
- Font size: 16px

### 4. RefundModal Component

**Purpose**: Modal for processing refunds

**Fields**:
- Refund amount (pre-filled with available amount)
- Refund reason (text area)
- Confirm/Cancel buttons

**Validation**:
- Amount must be positive
- Amount cannot exceed available refund amount
- Reason is required

---

## Data Models

### Booking Interface

```typescript
interface Booking {
  id: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  paymentStatus?: string;
  bookingSource?: string;
  
  // Hotel Information
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  hotelCity?: string;
  hotelCountry?: string;
  hotelFullAddress?: string;
  hotelImage?: string;
  hotelPhone?: string;
  starRating?: number;
  
  // Room Information
  roomTypeId: string;
  roomName: string;
  
  // Dates and Times
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  checkInTime?: string; // HH:mm format
  checkOutTime?: string; // HH:mm format
  nights: number;
  
  // Guest Information
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCount: number;
  guests?: Guest[];
  
  // Gate Information
  closestGate?: HaramGate;
  kaabaGate?: HaramGate;
  
  // Provider Information
  providerName?: string;
  providerReference?: string;
  providerPhone?: string;
  
  // Metadata
  customerId?: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  createdAt: string;
  updatedAt: string;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  isLeadPassenger: boolean;
}

interface HaramGate {
  name: string;
  gateNumber: number;
  distance: number; // in kilometers
  walkingTime: number; // in minutes
}
```

### Filter State

```typescript
interface BookingFilters {
  status: string; // empty string = all
  hotel: string; // empty string = all
  date: Date | null; // null = all
  searchGuest: string; // empty string = all
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Booking List Sorting Order

*For any* set of bookings, the booking list SHALL display bookings sorted by check-in date in descending order (most recent first), regardless of the order they were returned from the API.

**Validates: Requirements 1.2**

### Property 2: Selection State Persistence

*For any* booking selected from the list, the booking SHALL remain visually highlighted in the list while its details are displayed in the right panel, until a different booking is selected or the selection is cleared.

**Validates: Requirements 1.3**

### Property 3: Filter Isolation

*For any* combination of active filters (status, hotel, date, guest search), the booking list SHALL display only bookings that match ALL active filter criteria simultaneously.

**Validates: Requirements 1.1, 1.5**

### Property 4: Gate Information Display

*For any* booking with gate information data, the gate boxes SHALL display all required fields (gate name, gate number, distance, walking time) with correct formatting and color coding (teal for closest gate, purple for Kaaba gate).

**Validates: Requirements 3.2, 3.3, 3.5**

### Property 5: Editable Booking State

*For any* booking with a status that allows editing (CONFIRMED, PENDING), the Edit button SHALL be enabled; for bookings with non-editable statuses (CANCELLED, REFUNDED, COMPLETED), the Edit button SHALL be disabled or hidden.

**Validates: Requirements 4.3, 4.4**

### Property 6: Responsive Layout Adaptation

*For any* viewport width, the layout SHALL adapt correctly: desktop (≥1024px) displays two columns side-by-side, tablet (768px-1023px) displays adjusted columns, and mobile (<768px) displays stacked vertical layout, with all content remaining readable and functional.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 7: Refund Amount Validation

*For any* refund request, the refund amount SHALL not exceed the total booking amount minus any previously refunded amount, and the system SHALL prevent submission of invalid amounts.

**Validates: Requirements 4.1, 4.2**

### Property 8: Empty State Display

*For any* page load or filter change that results in zero bookings, the booking list SHALL display an appropriate empty state message, and the right panel SHALL display the empty state placeholder.

**Validates: Requirements 2.4**

---

## Error Handling

### API Errors

**Booking Fetch Failure**:
- Display error message: "Failed to load bookings. Please try again."
- Show retry button
- Log error to console for debugging

**Refund Processing Failure**:
- Display error modal with specific error message from API
- Preserve form data for user to retry
- Log error details

**Gate Information Missing**:
- Display "Not available" placeholder in gate boxes
- Do not block booking display
- Log warning for monitoring

### Validation Errors

**Refund Amount**:
- Validate amount is positive number
- Validate amount does not exceed available refund
- Show inline error message below input field

**Refund Reason**:
- Validate reason is not empty
- Show inline error message

**Filter Application**:
- Handle invalid date ranges gracefully
- Clear invalid filters automatically
- Show notification to user

### UI State Errors

**No Booking Selected**:
- Display empty state in right panel
- Disable action buttons
- Show helpful message

**Loading State**:
- Show skeleton loaders in booking list
- Disable interactions during load
- Show loading spinner in right panel

---

## Testing Strategy

### Unit Tests

**BookingListPanel Component**:
- Renders booking cards with correct information
- Applies correct visual styling for selected booking
- Filters bookings by status, hotel, date, and guest name
- Sorts bookings by check-in date (most recent first)
- Handles empty booking list
- Handles loading and error states

**BookingDetailPanel Component**:
- Displays all booking sections with correct data
- Shows empty state when no booking selected
- Enables/disables Edit button based on booking status
- Formats dates and times correctly
- Displays gate information with correct colors
- Handles missing gate information gracefully

**RefundModal Component**:
- Pre-fills refund amount with available amount
- Validates refund amount
- Validates refund reason
- Prevents submission with invalid data
- Calls refund API with correct parameters

**Filter Logic**:
- Applies single filter correctly
- Applies multiple filters simultaneously
- Clears filters correctly
- Handles edge cases (empty strings, null values)

### Integration Tests

**Booking Selection Flow**:
- User selects booking from list
- Booking details appear in right panel
- Selecting different booking updates right panel
- Clearing selection shows empty state

**Refund Flow**:
- User opens refund modal
- Enters refund amount and reason
- Submits refund
- Booking list updates with refund status
- Right panel shows refund information

**Filter Application**:
- User applies filters
- Booking list updates immediately
- Filters persist during session
- Clear filters button resets all filters

**Responsive Behavior**:
- Desktop view: two-column layout displays correctly
- Tablet view: layout adjusts appropriately
- Mobile view: layout stacks vertically
- Resizing viewport reflows layout smoothly

### Property-Based Tests

**Property 1: Booking List Sorting**
- Generate random bookings with various check-in dates
- Verify list is sorted by check-in date descending
- Test with 1, 10, 100+ bookings

**Property 2: Selection State**
- Generate random bookings
- Select each booking in sequence
- Verify selection state updates correctly
- Verify previous selection is cleared

**Property 3: Filter Isolation**
- Generate random bookings with various statuses, hotels, dates
- Apply random filter combinations
- Verify only bookings matching ALL filters are displayed
- Test with 0, 1, multiple matching bookings

**Property 4: Gate Information Display**
- Generate bookings with various gate information
- Verify gate boxes display all required fields
- Verify color coding is correct
- Test with missing gate information

**Property 5: Editable Booking State**
- Generate bookings with all possible statuses
- Verify Edit button state matches booking status
- Test with CONFIRMED, PENDING (enabled), CANCELLED, REFUNDED, COMPLETED (disabled)

**Property 6: Responsive Layout**
- Generate random viewport widths
- Verify layout adapts correctly at breakpoints
- Verify content remains readable at all widths
- Test with various content lengths

**Property 7: Refund Amount Validation**
- Generate random booking amounts and refund amounts
- Verify refund amount cannot exceed available amount
- Verify validation prevents invalid submissions
- Test with edge cases (0, negative, very large numbers)

**Property 8: Empty State Display**
- Generate empty booking list
- Verify empty state displays correctly
- Generate filters that result in no matches
- Verify empty state displays with active filters

### E2E Tests

**Complete User Journey**:
1. User logs in
2. Navigates to My Bookings
3. Sees list of bookings sorted by date
4. Clicks on a booking
5. Views all booking details
6. Clicks Edit button
7. Navigates to edit page
8. Returns to My Bookings
9. Applies filters
10. Clears filters
11. Prints booking confirmation
12. Processes refund
13. Verifies refund appears in booking details

**Responsive Testing**:
- Test on desktop (1920x1080)
- Test on tablet (768x1024)
- Test on mobile (375x667)
- Test viewport resize from desktop to mobile

**Error Scenarios**:
- Network error during booking fetch
- Invalid refund amount submission
- Missing gate information
- Very long hotel names/addresses
- Special characters in guest names

---

## Implementation Notes

### Performance Considerations

1. **Booking List Virtualization**: For users with many bookings (100+), implement virtual scrolling to render only visible cards
2. **Lazy Loading**: Load gate information on-demand when booking is selected
3. **Memoization**: Memoize filter functions to prevent unnecessary re-renders
4. **Debouncing**: Debounce search input to reduce API calls

### Accessibility

1. **Keyboard Navigation**: Support Tab, Enter, Escape keys for all interactions
2. **Screen Reader Support**: Add ARIA labels to all interactive elements
3. **Color Contrast**: Ensure all text meets WCAG AA standards
4. **Focus Management**: Manage focus when modals open/close

### Browser Compatibility

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android 80+

### State Management

- Use React Context for global booking state
- Use local component state for UI state (modals, filters)
- Persist filters to localStorage for session continuity
- Clear state on logout

### API Integration

- Use existing `/users/me/bookings` endpoint for fetching
- Use existing `/hotels/bookings/{id}/refund` endpoint for refunds
- Handle pagination if booking count exceeds limit
- Implement proper error handling and retry logic

---

## Future Enhancements

1. **Booking Modification**: Allow editing of booking details (dates, guest info)
2. **Booking Cancellation**: Add cancel booking functionality
3. **Booking History**: Archive completed/cancelled bookings
4. **Export Functionality**: Export bookings to PDF/CSV
5. **Booking Notifications**: Email/SMS notifications for booking status changes
6. **Multi-language Support**: Localize all text and date formats
7. **Dark Mode**: Support dark theme preference
8. **Advanced Analytics**: Show booking trends and statistics
