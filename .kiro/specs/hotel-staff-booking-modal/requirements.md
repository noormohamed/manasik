# Hotel Staff Booking Modal - Requirements

## Introduction

This feature enables hotel staff members to create bookings on behalf of guests directly from the hotel dashboard bookings page. Currently, the booking system only allows guests to create their own bookings through the public interface. This feature adds a staff-facing modal that allows hotel managers and staff to enter guest information and booking details to create bookings directly in the system, streamlining the booking process for walk-in guests, phone reservations, and other scenarios where staff need to create bookings on behalf of guests.

## Glossary

- **Hotel_Staff**: A user with HOTEL_MANAGER or AGENT role who manages bookings for a hotel
- **Guest**: The person staying at the hotel (may or may not have an account in the system)
- **Booking**: A reservation record containing guest information, room selection, dates, and payment details
- **Modal**: A dialog box that appears on top of the bookings dashboard page
- **Dashboard_Bookings_Page**: The hotel staff dashboard page located at /dashboard/bookings/
- **Room_Selection**: The process of choosing a specific room type and availability for the booking
- **Booking_Modal**: The modal dialog that allows staff to create bookings on behalf of guests

## Requirements

### Requirement 1: Access Booking Modal from Dashboard

**User Story:** As a hotel staff member, I want to access a modal to create bookings on behalf of guests, so that I can quickly create reservations for walk-in guests or phone bookings.

#### Acceptance Criteria

1. WHEN a hotel staff member views the bookings dashboard at /dashboard/bookings/, THE Dashboard_Bookings_Page SHALL display a button to open the Booking_Modal
2. WHEN the hotel staff member clicks the button to create a booking, THE Booking_Modal SHALL open as a modal dialog overlaying the dashboard
3. WHEN the Booking_Modal is open, THE modal SHALL display a form with sections for guest information and booking details
4. WHEN the hotel staff member clicks outside the modal or on a close button, THE Booking_Modal SHALL close without saving any data

### Requirement 2: Enter Guest Email Address

**User Story:** As a hotel staff member, I want to enter a guest's email address, so that the booking is associated with the correct guest account or a new guest record is created.

#### Acceptance Criteria

1. WHEN the Booking_Modal is open, THE form SHALL display an email input field labeled "Guest Email"
2. WHEN the hotel staff member enters an email address, THE email input field SHALL accept valid email format (e.g., user@example.com)
3. IF the email format is invalid, THE form SHALL display a validation error message indicating the required email format
4. WHEN a valid email is entered, THE system SHALL check if a guest account exists with that email address
5. IF a guest account exists, THE system SHALL pre-populate available guest information (if applicable)
6. IF no guest account exists, THE system SHALL allow the staff member to proceed with creating a booking for a new guest

### Requirement 3: Enter Guest Names

**User Story:** As a hotel staff member, I want to enter the guest's first and last name, so that the booking record contains the guest's full name.

#### Acceptance Criteria

1. WHEN the Booking_Modal is open, THE form SHALL display two separate input fields: "First Name" and "Last Name"
2. WHEN the hotel staff member enters a first name, THE First_Name field SHALL accept alphabetic characters and common name punctuation (hyphens, apostrophes)
3. WHEN the hotel staff member enters a last name, THE Last_Name field SHALL accept alphabetic characters and common name punctuation (hyphens, apostrophes)
4. IF either the first name or last name field is empty when attempting to create a booking, THE form SHALL display a validation error indicating both fields are required
5. WHEN valid names are entered, THE system SHALL store the guest's full name with the booking record

### Requirement 4: Enter Check-In Date

**User Story:** As a hotel staff member, I want to enter a check-in date, so that the booking reflects when the guest will arrive.

#### Acceptance Criteria

1. WHEN the Booking_Modal is open, THE form SHALL display a date input field labeled "Check-In Date"
2. WHEN the hotel staff member clicks the Check-In Date field, THE system SHALL display a date picker allowing selection of any future date
3. IF the hotel staff member selects a date in the past, THE form SHALL display a validation error indicating the check-in date must be today or later
4. WHEN a valid check-in date is selected, THE system SHALL store the date in ISO 8601 format (YYYY-MM-DD)
5. WHEN the check-in date is changed, THE system SHALL clear any previously selected check-out date if it is before or equal to the new check-in date

### Requirement 5: Enter Check-Out Date

**User Story:** As a hotel staff member, I want to enter a check-out date, so that the booking reflects the guest's departure date and calculates the correct number of nights.

#### Acceptance Criteria

1. WHEN the Booking_Modal is open, THE form SHALL display a date input field labeled "Check-Out Date"
2. WHEN the hotel staff member clicks the Check-Out Date field, THE system SHALL display a date picker allowing selection of dates after the check-in date
3. IF the hotel staff member selects a check-out date that is before or equal to the check-in date, THE form SHALL display a validation error indicating the check-out date must be after the check-in date
4. WHEN a valid check-out date is selected, THE system SHALL automatically calculate and display the number of nights
5. WHEN the check-in or check-out date changes, THE system SHALL recalculate the number of nights and update the display

### Requirement 6: Select Room Type

**User Story:** As a hotel staff member, I want to select a room type for the booking, so that the guest is assigned to the correct room category.

#### Acceptance Criteria

1. WHEN the Booking_Modal is open and valid check-in and check-out dates are selected, THE form SHALL display a dropdown or list of available room types for the hotel
2. WHEN the hotel staff member clicks the room type selector, THE system SHALL display all room types managed by the hotel
3. WHEN the hotel staff member selects a room type, THE system SHALL display the room type name and base price for that room type
4. IF no room types are available for the selected dates, THE form SHALL display a message indicating no rooms are available for those dates
5. WHEN a room type is selected, THE system SHALL store the room type ID with the booking

### Requirement 7: Enter Number of Guests

**User Story:** As a hotel staff member, I want to specify the number of guests, so that the booking reflects the correct occupancy.

#### Acceptance Criteria

1. WHEN the Booking_Modal is open, THE form SHALL display a number input field labeled "Number of Guests"
2. WHEN the hotel staff member enters a number of guests, THE system SHALL accept positive integers only
3. IF the hotel staff member enters zero or a negative number, THE form SHALL display a validation error indicating the number of guests must be at least 1
4. IF the hotel staff member enters a number of guests that exceeds the room type's maximum occupancy, THE form SHALL display a validation error indicating the maximum occupancy for the selected room type
5. WHEN a valid number of guests is entered, THE system SHALL store the guest count with the booking

### Requirement 8: Display Booking Summary

**User Story:** As a hotel staff member, I want to see a summary of the booking details before creating it, so that I can verify all information is correct.

#### Acceptance Criteria

1. WHEN all required booking information is entered in the Booking_Modal, THE form SHALL display a summary section showing the booking details
2. THE summary section SHALL display the guest name, email, check-in date, check-out date, number of nights, room type, number of guests, and total price
3. WHEN the booking details change, THE summary section SHALL update in real-time to reflect the current values
4. WHEN the total price is displayed, THE system SHALL show the price in the hotel's configured currency
5. THE summary section SHALL be clearly visually separated from the input fields

### Requirement 9: Create Booking

**User Story:** As a hotel staff member, I want to create a booking after entering all required information, so that the booking is saved to the system.

#### Acceptance Criteria

1. WHEN all required fields are filled with valid data, THE Booking_Modal SHALL display a "Create Booking" button that is enabled
2. WHEN any required field is empty or contains invalid data, THE "Create Booking" button SHALL be disabled
3. WHEN the hotel staff member clicks the "Create Booking" button, THE system SHALL validate all booking information
4. IF validation passes, THE system SHALL create a new booking record with the entered information
5. IF validation fails, THE form SHALL display validation error messages for each invalid field
6. WHEN a booking is successfully created, THE Booking_Modal SHALL close and the bookings dashboard SHALL refresh to display the newly created booking
7. WHEN a booking is successfully created, THE system SHALL display a success message confirming the booking was created

### Requirement 10: Handle Booking Creation Errors

**User Story:** As a hotel staff member, I want to receive clear error messages if booking creation fails, so that I can understand what went wrong and correct the issue.

#### Acceptance Criteria

1. IF the booking creation request fails due to a server error, THE system SHALL display an error message indicating the booking could not be created
2. IF the booking creation fails because the selected room is no longer available, THE system SHALL display a message indicating the room is no longer available and suggest selecting a different room or date
3. IF the booking creation fails due to invalid guest information, THE system SHALL display a message indicating which guest information is invalid
4. WHEN an error occurs, THE Booking_Modal SHALL remain open so the staff member can correct the information and retry
5. WHEN an error message is displayed, THE system SHALL provide a way to dismiss the error message and continue editing

### Requirement 11: Validate Email Format

**User Story:** As a hotel staff member, I want the system to validate email addresses, so that bookings are created with valid contact information.

#### Acceptance Criteria

1. WHEN the hotel staff member enters an email address in the Guest Email field, THE system SHALL validate the email format using standard email validation rules
2. IF the email format is invalid, THE form SHALL display a validation error message immediately
3. IF the email format is valid, THE validation error message SHALL be cleared
4. WHEN the form is submitted, THE system SHALL not allow booking creation if the email format is invalid

### Requirement 12: Prevent Duplicate Bookings

**User Story:** As a hotel staff member, I want the system to prevent creating duplicate bookings for the same guest and room, so that the booking system maintains data integrity.

#### Acceptance Criteria

1. WHEN the hotel staff member attempts to create a booking, THE system SHALL check if a booking already exists for the same guest email, room type, and date range
2. IF a booking already exists with the same guest email and overlapping dates for the same room, THE system SHALL display a warning message indicating a potential duplicate booking
3. IF a duplicate booking is detected, THE system SHALL allow the staff member to either cancel the operation or proceed with creating the booking
4. WHEN the staff member chooses to proceed, THE system SHALL create the booking with a note indicating it was created by staff

### Requirement 13: Integrate with Existing Bookings Dashboard

**User Story:** As a hotel staff member, I want the new booking modal to integrate seamlessly with the existing bookings dashboard, so that I can manage all bookings in one place.

#### Acceptance Criteria

1. WHEN a booking is created using the Booking_Modal, THE newly created booking SHALL appear in the bookings dashboard list immediately after creation
2. WHEN the Booking_Modal is closed, THE bookings dashboard SHALL remain on the same page and view as before the modal was opened
3. WHEN the bookings dashboard is filtered or sorted, THE Booking_Modal SHALL not affect the current filter or sort state
4. WHEN a booking is created using the Booking_Modal, THE booking SHALL have the same status and properties as bookings created through other methods

### Requirement 14: Accessible Modal Interface

**User Story:** As a hotel staff member using assistive technology, I want the booking modal to be accessible, so that I can create bookings using keyboard navigation and screen readers.

#### Acceptance Criteria

1. WHEN the Booking_Modal is open, THE modal SHALL be keyboard navigable using Tab and Shift+Tab keys
2. WHEN the Booking_Modal is open, THE modal SHALL have proper focus management with focus trapped within the modal
3. WHEN the Booking_Modal is open, THE modal SHALL have a proper ARIA role and labels for all form fields
4. WHEN the Booking_Modal is open, THE modal SHALL announce validation errors to screen reader users
5. WHEN the Booking_Modal is closed, THE focus SHALL return to the button that opened the modal

### Requirement 15: Send Booking Confirmation Email

**User Story:** As a hotel staff member, I want the guest to receive a booking confirmation email, so that the guest has a record of their reservation.

#### Acceptance Criteria

1. WHEN a booking is successfully created, THE system SHALL send a confirmation email to the guest's email address
2. WHEN the confirmation email is sent, THE email SHALL include the guest's name, booking reference number, check-in date, check-out date, room type, and number of nights
3. WHEN the confirmation email is sent, THE email SHALL include the hotel name, address, and contact information
4. WHEN the confirmation email is sent, THE email SHALL include the total booking price
5. IF the email fails to send, THE system SHALL log the error and display a warning message to the staff member, but SHALL NOT prevent the booking from being created
6. WHEN the confirmation email is sent, THE email SHALL be sent from a hotel-branded email address (if configured)
7. WHEN the confirmation email is sent, THE email SHALL include a link to view the booking details in the guest's account (if the guest has an account)

### Requirement 16: Optional Payment Link in Email

**User Story:** As a hotel staff member, I want to optionally include a payment link in the confirmation email, so that the guest can complete payment directly from the email.

#### Acceptance Criteria

1. WHEN creating a booking, THE Booking_Modal form SHALL display a checkbox option labeled "Send Payment Link to Guest"
2. WHEN the "Send Payment Link to Guest" checkbox is checked, THE system SHALL generate a secure payment link for the booking
3. WHEN a payment link is generated, THE payment link SHALL be valid for a configurable time period (e.g., 30 days)
4. WHEN the confirmation email is sent with a payment link, THE email SHALL include a prominent "Pay Now" button or link that directs the guest to the payment page
5. WHEN the guest clicks the payment link, THE guest SHALL be directed to a payment page pre-populated with the booking details and amount due
6. WHEN the guest completes payment via the link, THE booking payment status SHALL be updated to "Paid" and the guest SHALL receive a payment confirmation email
7. IF the "Send Payment Link to Guest" checkbox is unchecked, THE confirmation email SHALL NOT include a payment link
8. WHEN a payment link is generated, THE system SHALL track the payment link status (sent, clicked, expired, completed)

### Requirement 17: Payment Link Expiration and Resend

**User Story:** As a hotel staff member, I want to be able to resend payment links to guests, so that guests have multiple opportunities to complete payment.

#### Acceptance Criteria

1. WHEN viewing a booking that has an unpaid payment link, THE bookings dashboard SHALL display an option to "Resend Payment Link"
2. WHEN the staff member clicks "Resend Payment Link", THE system SHALL generate a new payment link and send it to the guest's email
3. WHEN a new payment link is generated, THE previous payment link SHALL be invalidated
4. WHEN a payment link expires, THE system SHALL display a message indicating the link has expired and provide an option to generate a new one
5. WHEN a payment link is resent, THE guest SHALL receive a new confirmation email with the updated payment link
6. WHEN a payment link is resent, THE system SHALL log the resend action with timestamp and staff member information

### Requirement 18: Send Payment Confirmation Email

**User Story:** As a guest, I want to receive a confirmation email when my payment has been received, so that I have proof of payment and confirmation that my booking is fully paid.

#### Acceptance Criteria

1. WHEN a guest completes full payment via the payment link, THE system SHALL send a payment confirmation email to the guest's email address
2. WHEN the payment confirmation email is sent, THE email SHALL include the booking reference number, payment amount, payment date and time, and payment method
3. WHEN the payment confirmation email is sent, THE email SHALL include the booking details (check-in date, check-out date, room type, number of nights, hotel name and address)
4. WHEN the payment confirmation email is sent, THE email SHALL include a statement confirming the booking is fully paid and the guest is confirmed for their stay
5. WHEN the payment confirmation email is sent, THE email SHALL include check-in instructions or a link to view check-in details
6. WHEN the payment confirmation email is sent, THE email SHALL include the hotel's contact information for any questions or changes
7. IF the payment confirmation email fails to send, THE system SHALL log the error and retry sending the email up to 3 times with exponential backoff
8. WHEN the payment confirmation email is sent, THE booking status SHALL be updated to "Confirmed" or "Paid" (depending on system configuration)
9. WHEN the payment confirmation email is sent, THE system SHALL log the email send action with timestamp and payment details for audit purposes

