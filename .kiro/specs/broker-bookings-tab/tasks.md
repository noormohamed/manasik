# Implementation Plan: Broker Bookings Tab

## Overview

This plan implements the Broker Bookings Tab feature across backend and frontend. The backend work creates the `POST /api/broker-bookings/create` and `GET /api/hotels/active` endpoints, and modifies `GET /api/users/me/bookings` to include broker attribution. The frontend work adds the "Broker" tab to ManagementPageLayout, creates the `DashboardBrokerContent` component, extends `CreateBookingModal` with a `mode` prop for broker-specific behavior, and adds broker attribution display to the customer booking detail view.

## Tasks

- [ ] 1. Backend: Create GET /api/hotels/active endpoint
  - [ ] 1.1 Create broker-booking routes file and GET /api/hotels/active endpoint
    - Create `service/src/routes/broker-booking.routes.ts` with a `GET /active` route
    - Query `SELECT id, name FROM hotels WHERE status = 'ACTIVE' ORDER BY name`
    - Require authentication via `authMiddleware` but no ownership check
    - Return `{ hotels: [{ id, name }] }`
    - Register the new router in `service/src/routes/api.routes.ts` under prefix `/broker-bookings` or `/hotels` as appropriate
    - _Requirements: 3.2, 4.1_

  - [ ]* 1.2 Write property test for active hotels filtering (Property 3)
    - **Property 3: All active hotels available in broker mode**
    - **Validates: Requirements 3.2, 4.1**

- [ ] 2. Backend: Create POST /api/broker-bookings/create endpoint
  - [ ] 2.1 Implement the POST /api/broker-bookings/create route
    - Add the route to the broker-booking routes file created in task 1.1
    - Authenticate user, look up their `agents` record by `user_id`; return 403 if no agent record
    - Validate required fields: `hotelId`, `checkInDate`, `checkOutDate`, `rooms`, lead guest with `firstName`, `lastName`, `email`, `phone`
    - Verify the hotel exists and is active
    - Create booking with `booking_source = 'BROKER'`, `agent_id = agent.id`
    - Insert all guests into `guests` table with `booking_id`; first guest as `is_lead_passenger = true`
    - Store `broker_notes` on the booking record
    - Return 201 with `{ success, booking: { id, status, guestName, guestEmail, checkInDate, checkOutDate, numberOfGuests, createdAt }, message }`
    - Follow the pattern established in `service/src/routes/staff-booking.routes.ts`
    - _Requirements: 3.3, 3.4, 5.1, 5.2, 7.1, 7.2, 7.3, 7.8, 7.10_

  - [ ]* 2.2 Write property test for broker booking attribution (Property 2)
    - **Property 2: Broker booking attribution**
    - **Validates: Requirements 3.3, 3.4, 5.1, 5.2**

  - [ ]* 2.3 Write property test for required field validation (Property 7)
    - **Property 7: Required field validation for broker bookings**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ]* 2.4 Write property test for guest details persistence (Property 8)
    - **Property 8: Guest details persistence round-trip**
    - **Validates: Requirements 7.8, 7.10**

- [ ] 3. Backend: Modify GET /api/users/me/bookings for broker attribution
  - [ ] 3.1 Add LEFT JOIN to agents table in the /me/bookings query
    - In `service/src/routes/user.routes.ts`, modify the `GET /me/bookings` SQL query
    - Add `LEFT JOIN agents a ON b.agent_id = a.id` to the existing query
    - Add `b.booking_source as bookingSource`, `b.agent_id as agentId`, `a.name as agentName`, `a.email as agentEmail` to the SELECT clause
    - Include `bookingSource`, `agentId`, `agentName`, `agentEmail` in the formatted response object
    - For non-broker bookings, `agentName` and `agentEmail` will be `null` — no breaking change
    - _Requirements: 6.1, 6.2, 6.4, 9.6, 9.9_

  - [ ]* 3.2 Write property test for customer view broker attribution (Property 5)
    - **Property 5: Customer view broker attribution**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [ ]* 3.3 Write property test for no broker attribution on non-broker bookings (Property 6)
    - **Property 6: No broker attribution for non-broker bookings**
    - **Validates: Requirements 6.5**

  - [ ]* 3.4 Write property test for customer bookings include all sources (Property 11)
    - **Property 11: Customer bookings include all sources**
    - **Validates: Requirements 9.5**

- [ ] 4. Checkpoint - Backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Frontend: Add Broker tab to ManagementPageLayout
  - [ ] 5.1 Add "Broker" menu item to ManagementPageLayout
    - In `frontend/src/components/ManagementPageLayout/ManagementPageLayout.tsx`, add a new entry to the `menuItems` array
    - Position it after "Hotel Bookings" and before "Hotels": `{ label: "Broker", href: "/dashboard/listings/broker", icon: "ri-user-shared-line" }`
    - Ensure the `isActive` function correctly handles the `/dashboard/listings/broker` route (prefix matching already works)
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 5.2 Create the Broker page at /dashboard/listings/broker
    - Create `frontend/src/app/dashboard/listings/broker/page.tsx`
    - Follow the same pattern as `frontend/src/app/dashboard/listings/bookings/page.tsx`
    - Render `Navbar`, `ManagementPageLayout`, `DashboardBrokerContent`, and `Footer`
    - _Requirements: 1.2_

- [ ] 6. Frontend: Create DashboardBrokerContent component
  - [ ] 6.1 Implement DashboardBrokerContent component
    - Create `frontend/src/components/Dashboard/DashboardBrokerContent.tsx`
    - Model after `DashboardBookingsContent` but fetch from `GET /api/users/me/broker-bookings`
    - Display loading spinner while fetching
    - Show error message with retry on fetch failure
    - Show empty state when no bookings exist (or no agent record)
    - Display each booking with: hotel name, guest name, check-in, check-out, status, payment status, total amount
    - Include a "Create Booking" button that opens `CreateBookingModal` with `mode="broker"`
    - Include cancel button per booking with confirmation prompt, calling `PUT /api/hotels/bookings/:id/cancel`
    - Refresh list after successful booking creation or cancellation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.5, 8.1, 8.6_

  - [ ]* 6.2 Write unit tests for DashboardBrokerContent
    - Test loading, error, and empty states
    - Test that fetch is called on mount with correct endpoint
    - Test cancellation confirmation prompt appears
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [ ] 7. Frontend: Extend CreateBookingModal with broker mode
  - [ ] 7.1 Add `mode` prop to CreateBookingModal
    - Add `mode?: 'hotel' | 'broker'` to `CreateBookingModalProps` interface, defaulting to `'hotel'`
    - When `mode='broker'`: fetch hotels from `GET /api/hotels/active` instead of `GET /api/hotels/listings`
    - When `mode='broker'`: always show hotel dropdown regardless of hotel count
    - When `mode='broker'`: submit to `POST /api/broker-bookings/create` instead of `POST /api/staff-bookings/create-on-behalf`
    - When `mode='hotel'`: preserve all existing behavior unchanged
    - _Requirements: 3.2, 4.1, 4.2, 4.3, 4.4, 9.2, 9.10_

  - [ ] 7.2 Add extended guest fields and broker notes for broker mode
    - When `mode='broker'`: add nationality, passport number, and date of birth fields to each guest card (optional fields)
    - When `mode='broker'`: make phone field required (not optional) for lead guest
    - When `mode='broker'`: add a broker notes textarea field (optional)
    - When `mode='broker'`: include extended guest fields and broker notes in the submit payload
    - When `mode='hotel'`: hide nationality, passport, DOB fields and broker notes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.9, 7.10_

  - [ ]* 7.3 Write unit tests for CreateBookingModal broker mode
    - Test hotel dropdown always visible in broker mode
    - Test extended guest fields rendered in broker mode
    - Test broker notes field present in broker mode
    - Test required field validation (phone required in broker mode)
    - Test hotel mode behavior unchanged
    - _Requirements: 4.2, 7.1, 7.2, 7.3, 9.10_

- [ ] 8. Checkpoint - Core frontend complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Frontend: Customer booking detail broker attribution
  - [ ] 9.1 Add "Booked by" section to BookingDetailPanel
    - In `frontend/src/components/MyBookings/BookingDetailPanel.tsx`, add a conditional section
    - When `booking.bookingSource === 'BROKER'` and `booking.agentName` is present, render a "Booked by" section showing broker name and email
    - When `bookingSource` is not `'BROKER'` or `agentId` is null, do not render any broker attribution section
    - Style consistently with existing detail panel sections
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 9.2 Write unit tests for broker attribution display
    - Test "Booked by" section renders for broker bookings with agent info
    - Test "Booked by" section hidden for non-broker bookings
    - Test "Booked by" section hidden when agentName is null
    - _Requirements: 6.3, 6.5_

- [ ] 10. Frontend: Broker cancellation flow
  - [ ] 10.1 Implement cancellation with confirmation in DashboardBrokerContent
    - Add cancel button to each booking row (visible for non-cancelled bookings)
    - Show confirmation prompt with booking details before cancellation
    - On confirm, call `PUT /api/hotels/bookings/:id/cancel` with optional reason
    - On success, refresh the bookings list
    - On failure, show error message; booking state unchanged
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

  - [ ]* 10.2 Write property test for cancellation status propagation (Property 9)
    - **Property 9: Cancellation status propagation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

  - [ ]* 10.3 Write property test for cancellation metadata persistence (Property 10)
    - **Property 10: Cancellation metadata persistence**
    - **Validates: Requirements 8.7**

- [ ] 11. Integration wiring and final verification
  - [ ] 11.1 Wire all components together and verify end-to-end flow
    - Verify broker tab appears in correct position in ManagementPageLayout
    - Verify DashboardBrokerContent loads and displays bookings from broker-bookings endpoint
    - Verify CreateBookingModal in broker mode fetches all active hotels and submits to broker-bookings/create
    - Verify customer My Bookings page shows broker attribution for broker-created bookings
    - Verify existing Hotel Bookings tab, Hotels tab, and Payments tab are unchanged
    - Verify CreateBookingModal in hotel mode still limits to owned hotels
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 9.8_

  - [ ]* 11.2 Write property test for broker bookings filtered by agent_id (Property 1)
    - **Property 1: Broker bookings filtered by agent_id**
    - **Validates: Requirements 2.2, 5.3**

- [ ] 12. Final checkpoint - All tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `broker-booking.service.ts` handles payment link generation and can be leveraged by the new create endpoint
- The existing `GET /api/users/me/broker-bookings` endpoint in `user.routes.ts` already handles listing — no changes needed there
- The `guests` table and `broker_notes` column already exist in the schema — no migrations required
