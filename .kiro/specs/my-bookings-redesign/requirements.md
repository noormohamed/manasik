# Requirements Document: My Bookings Redesign

## Introduction

The My Bookings page is being redesigned to improve usability and information accessibility. The new two-column layout will display a list of bookings on the left side and detailed booking information on the right side, with gate proximity information displayed prominently. Users will also gain the ability to edit existing bookings.

## Glossary

- **Booking**: A confirmed reservation for a hotel room with associated guest information, dates, and pricing
- **Booking_List**: The left-side panel displaying all bookings in chronological order
- **Booking_Summary**: The right-side panel displaying detailed information for the selected booking
- **Gate_Information**: Proximity data showing distance and walking time to the closest gate and Kaaba gate
- **Closest_Gate**: The nearest gate to the booked hotel
- **Kaaba_Gate**: A specific gate reference point for distance calculations
- **Edit_Booking**: The action to modify an existing booking's details
- **Status_Badge**: A visual indicator showing the current state of a booking (confirmed, cancelled, refunded, etc.)
- **My_Bookings_Page**: The main component displaying the redesigned booking interface

## Requirements

### Requirement 1: Display Bookings in Left Column

**User Story:** As a guest, I want to see all my bookings in a list on the left side of the page, so that I can quickly find and select a specific booking.

#### Acceptance Criteria

1. WHEN the My_Bookings_Page loads, THE Booking_List SHALL display all bookings for the logged-in user
2. THE Booking_List SHALL sort bookings with the most recent booking at the top
3. WHEN a booking is selected, THE Booking_List SHALL highlight the selected booking visually
4. WHILE the Booking_List is displayed, EACH booking item SHALL show: hotel name, room type, check-in date, check-out date, and Status_Badge
5. WHEN the user scrolls through the Booking_List, THE list SHALL remain responsive and load additional bookings if pagination is implemented

### Requirement 2: Display Booking Summary in Right Column

**User Story:** As a guest, I want to see detailed information about a selected booking on the right side, so that I can review all booking details in one place.

#### Acceptance Criteria

1. WHEN a booking is selected from the Booking_List, THE Booking_Summary SHALL display on the right side
2. THE Booking_Summary SHALL display: hotel name, room type, guest information, check-in time, check-out time, number of nights, guest count, pricing breakdown (subtotal, tax, total), and payment status
3. THE Booking_Summary layout SHALL match the current implementation's information structure
4. WHEN no booking is selected, THE Booking_Summary SHALL display a placeholder message or empty state
5. WHEN the Booking_Summary is displayed, THE information SHALL be organized in a clear, readable format with appropriate spacing and typography

### Requirement 3: Display Gate Information

**User Story:** As a guest, I want to see proximity information for nearby gates, so that I can plan my travel to the hotel.

#### Acceptance Criteria

1. WHEN a booking is selected, THE Booking_Summary SHALL display Gate_Information in the bottom half
2. THE Gate_Information section SHALL display two boxes: one for Closest_Gate (teal color) and one for Kaaba_Gate (purple color)
3. EACH gate box SHALL display: gate name, gate number, distance in kilometers, and walking time in minutes
4. IF a booking does not have Gate_Information data, THE gate boxes SHALL display "Not available" or similar placeholder text
5. THE gate boxes SHALL be visually distinct with their assigned colors (teal for Closest_Gate, purple for Kaaba_Gate)

### Requirement 4: Add Edit Booking Option

**User Story:** As a guest, I want to edit my booking details, so that I can make changes to my reservation.

#### Acceptance Criteria

1. WHEN a booking is selected and displayed in the Booking_Summary, THE Booking_Summary SHALL display an "Edit" button or action
2. WHEN the user clicks the "Edit" button, THE system SHALL navigate to the booking edit interface or open an edit modal
3. THE "Edit" button SHALL only be available for bookings with a status that allows editing (not cancelled or refunded)
4. WHEN a booking is in a non-editable state, THE "Edit" button SHALL be disabled or hidden with an explanation
5. WHEN the user completes editing, THE Booking_Summary SHALL refresh to display the updated booking information

### Requirement 5: Maintain Responsive Layout

**User Story:** As a guest using various devices, I want the two-column layout to adapt to my screen size, so that I can view my bookings on desktop, tablet, or mobile.

#### Acceptance Criteria

1. WHILE the My_Bookings_Page is displayed on a desktop screen (1024px or wider), THE two-column layout SHALL display side-by-side
2. WHILE the My_Bookings_Page is displayed on a tablet screen (768px to 1023px), THE layout SHALL adapt appropriately (may stack or adjust column widths)
3. WHILE the My_Bookings_Page is displayed on a mobile screen (below 768px), THE layout SHALL stack vertically with Booking_List above Booking_Summary
4. WHEN the viewport is resized, THE layout SHALL reflow smoothly without breaking
5. THE Booking_List and Booking_Summary SHALL remain fully functional and readable at all breakpoints

### Requirement 6: Preserve Existing Booking Features

**User Story:** As a guest, I want to maintain access to existing booking features, so that I can manage my bookings as before.

#### Acceptance Criteria

1. WHEN a booking is displayed, THE Booking_Summary SHALL display all existing action buttons (refund, cancel, etc.) if applicable
2. THE Status_Badge SHALL display the current booking status (confirmed, cancelled, refunded, pending, etc.)
3. WHEN a booking has been refunded, THE Booking_Summary SHALL display refund information (amount, reason, date)
4. WHEN the user interacts with action buttons, THE system SHALL perform the same actions as the current implementation
5. THE existing filtering and search functionality SHALL remain available and functional in the redesigned layout

