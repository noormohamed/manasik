# Requirements Document

## Introduction

This feature adds a "Broker" tab to the Management Suite navigation, positioned between "Hotel Bookings" and "Hotels". The Broker tab enables broker/agent users to create bookings on behalf of customers at any active hotel in the system (not limited to hotels they own) and to view all bookings they have created as a broker. Broker bookings are tagged with `booking_source = 'BROKER'` and linked to the broker's agent record via `agent_id`.

## Glossary

- **Management_Suite**: The frontend dashboard area containing tabs for Hotel Bookings, Hotels, and Payments, used by hotel managers and brokers to manage their operations.
- **Broker_Tab**: The new navigation tab in the Management Suite that provides broker-specific booking creation and listing functionality.
- **Broker**: A user with an associated agent record who creates bookings on behalf of customers at any hotel.
- **Agent_Record**: A row in the `agents` table linked to a user via `user_id`, representing the broker's identity for booking attribution.
- **Broker_Booking**: A booking record where `booking_source = 'BROKER'` and `agent_id` references the creating broker's agent record.
- **CreateBookingModal**: The existing multi-step wizard modal component used to create bookings, which collects hotel, dates, guest information, and room selections.
- **Hotel_Dropdown**: The hotel selection control within the CreateBookingModal that determines which hotels are available for selection.
- **Active_Hotel**: A hotel record in the system that is currently available for bookings (not deactivated or deleted).
- **Customer_Booking_View**: The customer-facing booking detail view (e.g., My Bookings page) where the customer sees their booking information.
- **Broker_Attribution**: The broker's name and contact details stored on a Broker_Booking, visible to the customer who the booking was made for.

## Requirements

### Requirement 1: Broker Tab Navigation

**User Story:** As a broker, I want to see a "Broker" tab in the Management Suite navigation, so that I can access my broker-specific booking functionality.

#### Acceptance Criteria

1. THE Management_Suite SHALL display a "Broker" navigation tab positioned after "Hotel Bookings" and before "Hotels" in the tab order.
2. WHEN the Broker_Tab is selected, THE Management_Suite SHALL navigate to the `/dashboard/listings/broker` route.
3. WHEN the current route is `/dashboard/listings/broker`, THE Management_Suite SHALL visually indicate the Broker_Tab as active.

### Requirement 2: Broker Bookings List

**User Story:** As a broker, I want to see all bookings I have created on behalf of customers, so that I can track and manage my broker activity.

#### Acceptance Criteria

1. WHEN the Broker_Tab page loads, THE Broker_Tab SHALL fetch bookings from the `GET /api/users/me/broker-bookings` endpoint.
2. THE Broker_Tab SHALL display only bookings where the `agent_id` matches the current user's Agent_Record.
3. WHEN the broker has no Agent_Record, THE Broker_Tab SHALL display an empty state with a message indicating no broker bookings exist.
4. THE Broker_Tab SHALL display each Broker_Booking with the hotel name, guest name, check-in date, check-out date, status, payment status, and total amount.
5. WHEN the bookings list is loading, THE Broker_Tab SHALL display a loading indicator.
6. IF the bookings fetch fails, THEN THE Broker_Tab SHALL display an error message to the user.

### Requirement 3: Create Broker Booking

**User Story:** As a broker, I want to create a booking on behalf of a customer at any active hotel, so that I can facilitate reservations for my clients.

#### Acceptance Criteria

1. THE Broker_Tab SHALL display a "Create Booking" button that opens the CreateBookingModal.
2. WHEN the CreateBookingModal is opened from the Broker_Tab, THE Hotel_Dropdown SHALL display all Active_Hotels in the system (not limited to hotels owned by the broker).
3. WHEN a broker submits a booking through the CreateBookingModal from the Broker_Tab, THE system SHALL set `booking_source` to `'BROKER'` on the created booking.
4. WHEN a broker submits a booking through the CreateBookingModal from the Broker_Tab, THE system SHALL set `agent_id` to the broker's Agent_Record identifier on the created booking.
5. WHEN a Broker_Booking is successfully created, THE Broker_Tab SHALL refresh the bookings list to include the new booking.
6. WHEN a Broker_Booking is successfully created, THE CreateBookingModal SHALL display a success confirmation before closing.

### Requirement 4: Hotel Selection for Broker Mode

**User Story:** As a broker, I want to select from all active hotels when creating a booking, so that I can book any hotel for my customers regardless of ownership.

#### Acceptance Criteria

1. WHEN the CreateBookingModal is in broker mode, THE Hotel_Dropdown SHALL fetch hotels from an endpoint that returns all Active_Hotels in the system.
2. WHEN the CreateBookingModal is in broker mode, THE Hotel_Dropdown SHALL always be visible regardless of how many hotels are available.
3. THE Hotel_Dropdown in broker mode SHALL display the hotel name for each selectable option.
4. WHEN no hotel is selected in broker mode, THE CreateBookingModal SHALL prevent progression to the next step with a validation error.

### Requirement 5: Broker Booking API Integration

**User Story:** As a broker, I want the system to correctly attribute bookings I create, so that they appear in my broker bookings list and are distinguishable from direct bookings.

#### Acceptance Criteria

1. WHEN a booking is created via the broker flow, THE API SHALL store the booking with `booking_source = 'BROKER'`.
2. WHEN a booking is created via the broker flow, THE API SHALL store the broker's `agent_id` from the Agent_Record associated with the authenticated user.
3. THE `GET /api/users/me/broker-bookings` endpoint SHALL return only bookings where `agent_id` matches the current user's Agent_Record.
4. IF the authenticated user has no Agent_Record, THEN THE `GET /api/users/me/broker-bookings` endpoint SHALL return an empty bookings array.


### Requirement 6: Broker Visibility for Customers

**User Story:** As a customer whose booking was created by a broker, I want to see who the broker is on my booking, so that I know who arranged my reservation and can contact them if needed.

#### Acceptance Criteria

1. WHEN a customer views a Broker_Booking in their My Bookings page, THE Customer_Booking_View SHALL display the broker's name.
2. WHEN a customer views a Broker_Booking in their My Bookings page, THE Customer_Booking_View SHALL display the broker's email address.
3. WHEN a customer views a Broker_Booking in their booking detail view, THE Customer_Booking_View SHALL display a "Booked by" section showing the broker's name and email.
4. WHEN a booking has `booking_source = 'BROKER'` and an `agent_id`, THE `GET /api/users/me/bookings` endpoint SHALL include the broker's name and email in the booking response.
5. WHEN a booking has `booking_source = 'DIRECT'` or no `agent_id`, THE Customer_Booking_View SHALL NOT display any broker attribution section.


### Requirement 7: Customer Details Entry by Broker

**User Story:** As a broker, I want to enter all relevant details for the customer I'm booking on behalf of, so that the booking has complete guest information without the customer needing to fill anything in themselves.

#### Acceptance Criteria

1. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL require the broker to enter the customer's full name (first name and last name).
2. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL require the broker to enter the customer's email address.
3. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL require the broker to enter the customer's phone number.
4. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL allow the broker to enter the customer's nationality.
5. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL allow the broker to enter the customer's passport number.
6. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL allow the broker to enter the customer's date of birth.
7. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL allow the broker to add multiple guests (for group bookings), each with their own name, email, phone, nationality, passport number, and date of birth.
8. WHEN a Broker_Booking is created, THE system SHALL store all entered guest details in the `guests` table linked to the booking, with the first guest marked as the lead passenger.
9. WHEN creating a Broker_Booking, THE CreateBookingModal SHALL allow the broker to enter optional special requests or notes for the booking.
10. WHEN a Broker_Booking is created, THE system SHALL store any broker notes in the `broker_notes` field on the booking record.


### Requirement 8: Booking Cancellation Cascade

**User Story:** As a broker or hotel manager, I want cancellations to propagate correctly across all views, so that the booking status is consistent for the broker, the hotel, and the customer.

#### Acceptance Criteria

1. WHEN a broker cancels a Broker_Booking from the Broker_Tab, THE system SHALL set the booking status to `'CANCELLED'` on the single booking record.
2. WHEN a broker cancels a Broker_Booking, THE booking SHALL appear as cancelled in the hotel's Hotel Bookings list.
3. WHEN a broker cancels a Broker_Booking, THE booking SHALL appear as cancelled in the customer's My Bookings view.
4. WHEN a hotel manager cancels a Broker_Booking from the Hotel Bookings tab, THE booking SHALL appear as cancelled in the broker's Broker_Tab list.
5. WHEN a hotel manager cancels a Broker_Booking from the Hotel Bookings tab, THE booking SHALL appear as cancelled in the customer's My Bookings view.
6. WHEN a Broker_Booking is cancelled by either the broker or the hotel, THE Broker_Tab SHALL display a confirmation prompt before proceeding with the cancellation.
7. WHEN a Broker_Booking is cancelled, THE system SHALL record the cancellation reason and the timestamp on the booking record.


### Requirement 9: Existing Functionality Preservation

**User Story:** As a user of the existing Hotel Bookings, Hotels, Payments, and My Bookings pages, I want all current functionality to remain unchanged after the Broker feature is added, so that nothing breaks for existing workflows.

#### Acceptance Criteria

1. THE Hotel Bookings tab SHALL continue to display only bookings for hotels the logged-in user manages, with no change to its filtering, sorting, or display behaviour.
2. THE Hotel Bookings tab's "Create Booking" modal SHALL continue to limit hotel selection to hotels owned by the logged-in user when opened from the Hotel Bookings tab.
3. THE Hotels tab SHALL continue to display and manage the user's hotel listings with no change to its functionality.
4. THE Payments tab SHALL continue to display earnings calculations, payment method breakdowns, and exchange rates with no change to its functionality.
5. THE customer's My Bookings page (`/dashboard/bookings`) SHALL continue to display all bookings where the customer is the `customer_id`, including both direct and broker-created bookings.
6. THE `GET /api/users/me/bookings` endpoint SHALL continue to return bookings for the authenticated customer with no change to its response format for existing (non-broker) bookings.
7. THE `GET /api/hotels/bookings` endpoint SHALL continue to return bookings for hotels managed by the authenticated user with no change to its filtering or response format.
8. THE `GET /api/users/me/earnings` endpoint SHALL continue to return host earnings with no change to its calculation logic.
9. ALL existing API endpoints SHALL maintain backward compatibility — no changes to request parameters, response shapes, or status codes for existing functionality.
10. THE CreateBookingModal component SHALL continue to function identically when opened from the Hotel Bookings tab (owned hotels only, `booking_source = 'DIRECT'` or `'STAFF_CREATED'`).
