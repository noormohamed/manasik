# Requirements Document

## Introduction

This feature adds a "Manasik Fee" (platform rebate/commission) to the booking system. The Manasik Fee is a configurable percentage of the booking subtotal that the platform retains as commission on every booking. The fee must be calculated during booking creation, stored in the database, displayed in the booking details payment summary, and reflected on the payments page. The rebate percentage is managed via the existing admin settings page (`/admin/settings`) and stored in the `platform_settings` table under the key `rebate_percent`.

## Glossary

- **Booking_Service**: The backend service (`BookingService`) responsible for creating and managing hotel bookings, including price calculation.
- **Broker_Booking_Service**: The backend service (`BrokerBookingService`) responsible for creating broker-sourced hotel bookings with payment links.
- **Payment_Summary_Component**: The frontend React component (`PaymentSummarySection.tsx`) that renders the payment breakdown inside the booking details modal.
- **Payments_Page**: The frontend page at `/payments/` that displays available funds, pending credits, and recent bookings for a host.
- **Checkout_Flow**: The frontend checkout process (`CheckoutContent.tsx`) and backend checkout routes that create Stripe sessions and process payments.
- **Admin_Settings_API**: The existing API endpoints (`GET/PUT /api/admin/settings/rebate`) that read and update the platform rebate percentage.
- **Platform_Settings_Table**: The database table `platform_settings` that stores configurable platform values, including `rebate_percent`.
- **Bookings_Table**: The database table `bookings` that stores all booking records including financial columns (`subtotal`, `tax`, `total`, `broker_fee`).
- **Manasik_Fee**: The platform commission amount calculated as `subtotal × (rebate_percent / 100)`, deducted from the hotel payout.
- **Manasik_Fee_Percent**: The platform commission rate stored in `platform_settings` under key `rebate_percent`, expressed as a percentage (0–100).
- **Hotel_Payout**: The amount the hotel receives after the Manasik Fee is deducted: `subtotal − Manasik_Fee`.
- **Subtotal**: The base booking cost before tax and fees: `room_price × nights × quantity` (summed across all room types).

## Requirements

### Requirement 1: Database Schema for Manasik Fee Storage

**User Story:** As a platform operator, I want the Manasik Fee percentage and calculated amount stored against each booking, so that I have an auditable record of platform commission per booking.

#### Acceptance Criteria

1. THE Bookings_Table SHALL include a `manasik_fee_percent` column of type `DECIMAL(5,2)` with a default value of `0.00`.
2. THE Bookings_Table SHALL include a `manasik_fee_amount` column of type `DECIMAL(12,2)` with a default value of `0.00`.
3. WHEN a new booking is created, THE Booking_Service SHALL read the current Manasik_Fee_Percent from the Platform_Settings_Table.
4. WHEN a new booking is created, THE Booking_Service SHALL calculate the Manasik_Fee as `subtotal × (Manasik_Fee_Percent / 100)`, rounded to two decimal places.
5. WHEN a new booking is created, THE Booking_Service SHALL store both the Manasik_Fee_Percent and the calculated Manasik_Fee amount in the booking record.
6. IF the Platform_Settings_Table does not contain a `rebate_percent` entry, THEN THE Booking_Service SHALL use a default Manasik_Fee_Percent of `15`.

### Requirement 2: Manasik Fee Calculation in Booking Service

**User Story:** As a platform operator, I want the Manasik Fee calculated consistently across all booking creation paths, so that every booking has the correct platform commission recorded.

#### Acceptance Criteria

1. WHEN a staff-created booking is created via the Booking_Service, THE Booking_Service SHALL fetch the current Manasik_Fee_Percent from the Platform_Settings_Table and compute `manasik_fee_amount = subtotal × (Manasik_Fee_Percent / 100)`.
2. WHEN a broker booking is created via the Broker_Booking_Service, THE Broker_Booking_Service SHALL fetch the current Manasik_Fee_Percent from the Platform_Settings_Table and compute `manasik_fee_amount = subtotal × (Manasik_Fee_Percent / 100)`.
3. WHEN a direct booking is created via the Checkout_Flow, THE Checkout_Flow SHALL fetch the current Manasik_Fee_Percent from the Platform_Settings_Table and compute `manasik_fee_amount = subtotal × (Manasik_Fee_Percent / 100)`.
4. THE Booking_Service SHALL calculate the Manasik_Fee on the Subtotal before tax is applied.
5. THE Booking_Service SHALL round the Manasik_Fee amount to exactly two decimal places using standard rounding.
6. FOR ALL valid bookings, THE Booking_Service SHALL ensure that `manasik_fee_amount` equals `subtotal × (manasik_fee_percent / 100)` rounded to two decimal places (round-trip consistency).

### Requirement 3: Payment Summary Display in Booking Details Modal (Hotel Manager Only)

**User Story:** As a hotel manager, I want to see the Manasik Fee as a line item in the booking payment summary, so that I understand the platform commission deducted from each booking.

#### Acceptance Criteria

1. WHILE the current user is a hotel manager viewing bookings for a hotel the user manages, THE Payment_Summary_Component SHALL display a "Manasik Fee" line item showing the stored `manasik_fee_amount` for the booking.
2. THE Payment_Summary_Component SHALL position the "Manasik Fee" line item below the "Subtotal" row (and below "Broker Fee" if present) and above the "Tax" row.
3. THE Payment_Summary_Component SHALL display the Manasik Fee amount formatted in the booking currency with two decimal places.
4. THE Payment_Summary_Component SHALL display the Manasik Fee percentage in parentheses next to the label, formatted as `Manasik Fee (X%)`.
5. WHEN the `manasik_fee_amount` for a booking is `0` or not present, THE Payment_Summary_Component SHALL omit the "Manasik Fee" line item.
6. THE Payment_Summary_Component SHALL display a "Hotel Payout" line item showing `subtotal − manasik_fee_amount`, positioned after the Manasik Fee row and before the Tax row.
7. THE Payment_Summary_Component SHALL NOT display the Manasik Fee or Hotel Payout line items to any user who is not a hotel manager for the booking's hotel. Guests, brokers, and all other user roles SHALL NOT see these line items.

### Requirement 4: Booking Details API Response

**User Story:** As a frontend developer, I want the booking API to return Manasik Fee data, so that the payment summary component can display it.

#### Acceptance Criteria

1. WHEN the hotel bookings API returns booking data, THE API SHALL include `manasikFeePercent` and `manasikFeeAmount` fields in each booking object.
2. THE API SHALL return `manasikFeePercent` as a number representing the percentage (e.g., `15` for 15%).
3. THE API SHALL return `manasikFeeAmount` as a number representing the currency amount with two decimal precision.
4. IF a booking has no Manasik Fee columns populated (legacy bookings), THEN THE API SHALL return `manasikFeePercent` as `0` and `manasikFeeAmount` as `0`.

### Requirement 5: Payments Page Manasik Fee Integration (Hotel Manager Only)

**User Story:** As a hotel manager, I want to see Manasik Fee deductions on my payments page, so that I understand the net earnings from each booking.

#### Acceptance Criteria

1. THE Payments_Page SHALL display a "Manasik Fees" subsection within the "Available Funds" section showing the total Manasik Fee deducted across all completed bookings.
2. THE Payments_Page SHALL display a "Manasik Fee" column in the "Recent Bookings" list showing the `manasik_fee_amount` for each booking.
3. WHEN calculating available funds, THE Payments_Page SHALL subtract the total Manasik Fee from the gross booking totals to show net host earnings.
4. THE Payments_Page SHALL format all Manasik Fee amounts in the selected display currency (GBP, USD, or credits) consistent with other amounts on the page.
5. WHEN a booking has a `manasik_fee_amount` of `0`, THE Payments_Page SHALL display `0.00` in the Manasik Fee column for that booking.
6. THE Payments_Page SHALL only display Manasik Fee information to hotel manager users. Guests, brokers, and all other user roles SHALL NOT see Manasik Fee data on the Payments_Page.

### Requirement 6: Earnings API Manasik Fee Data

**User Story:** As a frontend developer, I want the earnings API to return Manasik Fee totals, so that the payments page can display accurate net earnings.

#### Acceptance Criteria

1. WHEN the earnings API (`GET /api/users/me/earnings`) returns data, THE API SHALL include `totalManasikFees` in the summary object representing the sum of `manasik_fee_amount` across all non-cancelled bookings for the host.
2. WHEN the earnings API returns individual booking records, THE API SHALL include `manasikFeeAmount` for each booking.
3. THE API SHALL compute `totalManasikFees` by summing `manasik_fee_amount` from the Bookings_Table for bookings belonging to the host's hotels with status CONFIRMED or COMPLETED.

### Requirement 7: Manasik Fee Validation and Constraints

**User Story:** As a platform operator, I want the Manasik Fee to be validated and constrained, so that invalid values cannot corrupt booking financial data.

#### Acceptance Criteria

1. THE Booking_Service SHALL validate that the fetched Manasik_Fee_Percent is between `0` and `100` inclusive before applying it.
2. IF the fetched Manasik_Fee_Percent is outside the range `0` to `100`, THEN THE Booking_Service SHALL use the default value of `15`.
3. THE Booking_Service SHALL ensure that `manasik_fee_amount` does not exceed the Subtotal for any booking.
4. THE Booking_Service SHALL store the Manasik_Fee_Percent that was active at the time of booking creation, preserving the historical rate even if the admin later changes the global setting.
