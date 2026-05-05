# Tasks: Manasik Fee Rebate

## Task 1: Database Migration and Fee Utility

- [x] 1.1 Create migration file `service/database/migrations/031-add-manasik-fee-columns.sql` that adds `manasik_fee_percent DECIMAL(5,2) DEFAULT 0.00` and `manasik_fee_amount DECIMAL(12,2) DEFAULT 0.00` columns to the `bookings` table after `broker_fee`
- [x] 1.2 Create `service/src/utils/manasik-fee.ts` with `getManasikFeePercent(pool)` function that reads `rebate_percent` from `platform_settings`, validates it is 0–100, and returns the default of 15 if missing or out of range
- [x] 1.3 Create `calculateManasikFee(subtotal, percent)` pure function in the same utility file that computes `Math.round(subtotal * (percent / 100) * 100) / 100`, validates percent is 0–100 (falls back to 15), and ensures fee does not exceed subtotal
- [x] 1.4 Write property-based tests in `service/src/__tests__/manasik-fee-calculation.property.test.ts` for Properties 1–3 (fee calculation round-trip, invalid percent fallback, fee ≤ subtotal) using fast-check with minimum 100 iterations each

## Task 2: Integrate Fee Calculation into Booking Creation Paths

- [x] 2.1 Update `BookingService.createBookingOnBehalf` in `service/src/services/booking.service.ts` to call `getManasikFeePercent` and `calculateManasikFee` after computing subtotal, and include `manasik_fee_percent` and `manasik_fee_amount` in the INSERT statement
- [x] 2.2 Update `BrokerBookingService.createBrokerBooking` in `service/src/services/broker-booking.service.ts` to call `getManasikFeePercent` and `calculateManasikFee` after computing subtotal, and include both columns in the INSERT statement
- [x] 2.3 Update the direct booking creation in `service/src/features/hotel/routes/hotel.routes.ts` (`POST /api/hotels/:id/bookings`) to call `getManasikFeePercent` and `calculateManasikFee` after computing subtotal, and include both columns in the INSERT statement

## Task 3: Update API Responses to Include Fee Data

- [x] 3.1 Update `GET /api/hotels/bookings` in `service/src/features/hotel/routes/hotel.routes.ts` to add `b.manasik_fee_percent` and `b.manasik_fee_amount` to the SELECT query and map them to `manasikFeePercent` and `manasikFeeAmount` in the response (defaulting to 0 for NULL values)
- [x] 3.2 Update `GET /api/users/me/earnings` in `service/src/routes/user.routes.ts` to add `b.manasik_fee_amount` to the SELECT query, include `manasikFeeAmount` in each earning record, compute `totalManasikFees` as the sum of fees for CONFIRMED/COMPLETED bookings, and include it in the summary object
- [x] 3.3 Write property-based tests in `service/src/__tests__/manasik-fee-calculation.property.test.ts` for Properties 4–5 (net earnings = gross - fees, total fees excludes cancelled bookings) using fast-check with minimum 100 iterations each

## Task 4: Update PaymentSummarySection Component (Hotel Manager Only)

- [x] 4.1 Update the `Booking` type in `frontend/src/components/MyBookings/types.ts` to include `manasikFeePercent: number` and `manasikFeeAmount: number` fields
- [x] 4.2 Update `PaymentSummarySection.tsx` to accept an `isHotelManager` prop and conditionally render a "Manasik Fee (X%)" row (after Subtotal/Broker Fee, before Tax) and a "Hotel Payout" row showing `subtotal - manasikFeeAmount`, only when `isHotelManager` is true and `manasikFeeAmount > 0`
- [x] 4.3 Update the parent component that renders `PaymentSummarySection` to pass the `isHotelManager` prop based on the current user's role

## Task 5: Update Payments Page (Hotel Manager Only)

- [x] 5.1 Update the earnings API call in `frontend/src/app/payments/page.tsx` to read `totalManasikFees` from the summary and `manasikFeeAmount` from each booking record
- [x] 5.2 Add a "Manasik Fees" total display in the Available Funds section and subtract it from gross totals to show net earnings, visible only to hotel manager users
- [x] 5.3 Add a "Manasik Fee" column to the Recent Bookings list showing per-booking `manasikFeeAmount`, displaying `0.00` when the fee is 0, visible only to hotel manager users

## Task 6: Run Migration and Verify End-to-End

- [x] 6.1 Run the database migration `031-add-manasik-fee-columns.sql` against the development database and verify the columns exist
- [x] 6.2 Verify all property-based tests pass by running `npx jest manasik-fee-calculation.property --no-cache`
- [x] 6.3 Manually verify a staff-created booking stores the correct `manasik_fee_percent` and `manasik_fee_amount` values
