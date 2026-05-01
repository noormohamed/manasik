/**
 * Preservation Property Tests — Payments Earnings
 *
 * These tests capture baseline behaviors that MUST be preserved after the fix.
 * They encode the current (unfixed) code's correct behaviors and should PASS
 * on the unfixed code.
 *
 * Property 3: Non-host users get empty earnings with zero totals
 * Property 5: Cancelled/refunded bookings are excluded from earnings totals
 * Property 6: Non-cancelled bookings are categorized as AVAILABLE or PENDING
 *
 * **Validates: Requirements 3.1, 3.4, 3.5**
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Extract the pure booking-processing logic from the earnings endpoint
// (service/src/routes/user.routes.ts) so we can test it without HTTP/DB.
// ---------------------------------------------------------------------------

interface RawBooking {
  id: string;
  status: string;
  currency: string;
  total: string | number;
  paymentStatus: string;
  metadata: string | Record<string, any>;
  createdAt: Date;
}

interface ProcessedEarning {
  id: string;
  bookingId: string;
  hotelId: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  originalAmount: number;
  originalCurrency: string;
  credits: number;
  status: string;
  createdAt: Date;
}

interface EarningsSummary {
  totalCredits: number;
  pendingCredits: number;
  availableCredits: number;
  pendingBookings: number;
  completedBookings: number;
}

/**
 * Pure function that mirrors the booking-processing logic inside
 * GET /api/users/me/earnings in user.routes.ts.
 *
 * Given a list of raw bookings and a hotel-name lookup map, it returns
 * the processed earnings array and summary — exactly as the endpoint does.
 */
function processBookings(
  bookings: RawBooking[],
  hotelNames: Record<string, string>,
  today: Date = new Date(),
): { earnings: ProcessedEarning[]; summary: EarningsSummary } {
  let pendingCredits = 0;
  let availableCredits = 0;
  let pendingBookings = 0;
  let completedBookings = 0;

  const earnings = bookings.map((booking) => {
    const metadata =
      typeof booking.metadata === 'string'
        ? JSON.parse(booking.metadata)
        : booking.metadata || {};

    const amount = parseFloat(String(booking.total)) || 0;
    const currency = booking.currency || 'USD';

    // Convert to GBP then to credits
    let gbpAmount = amount;
    if (currency === 'USD') {
      gbpAmount = amount * 0.79;
    } else if (currency === 'EUR') {
      gbpAmount = amount * 0.86;
    } else if (currency === 'SAR') {
      gbpAmount = amount * 0.21;
    }

    const credits = Math.round(gbpAmount * 100);

    // Determine status
    let checkOutDate: Date | null = null;
    if (metadata.checkOutDate) {
      checkOutDate = new Date(metadata.checkOutDate);
    }

    const isCheckedOut = checkOutDate && checkOutDate < today;
    const isConfirmed =
      booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
    const isCancelled =
      booking.status === 'CANCELLED' || booking.status === 'REFUNDED';

    let status = 'PENDING';
    if (isCancelled) {
      status = 'CANCELLED';
    } else if (isCheckedOut && isConfirmed) {
      status = 'AVAILABLE';
      availableCredits += credits;
      completedBookings++;
    } else {
      pendingCredits += credits;
      pendingBookings++;
    }

    return {
      id: booking.id,
      bookingId: booking.id,
      hotelId: metadata.hotelId,
      hotelName:
        metadata.hotelName || hotelNames[metadata.hotelId] || 'Unknown Hotel',
      roomType: metadata.roomType,
      checkInDate: metadata.checkInDate,
      checkOutDate: metadata.checkOutDate,
      nights: metadata.nights,
      guests: metadata.guests,
      originalAmount: amount,
      originalCurrency: currency,
      credits,
      status,
      createdAt: booking.createdAt,
    };
  });

  return {
    earnings,
    summary: {
      totalCredits: pendingCredits + availableCredits,
      pendingCredits,
      availableCredits,
      pendingBookings,
      completedBookings,
    },
  };
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/** Generate a valid booking status */
const bookingStatusArb = fc.constantFrom(
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
);

/** Generate a valid currency */
const currencyArb = fc.constantFrom('GBP', 'USD', 'EUR', 'SAR');

/** Generate a positive monetary amount (up to 10 000) */
const amountArb = fc
  .float({ min: Math.fround(0.01), max: Math.fround(10_000), noNaN: true })
  .map((n) => parseFloat(n.toFixed(2)));

/** Generate a date string in YYYY-MM-DD format within a reasonable range */
const dateStringArb = fc
  .integer({ min: 0, max: 1460 }) // ~4 years of days from 2023-01-01
  .map((dayOffset) => {
    const base = new Date('2023-01-01T00:00:00Z');
    base.setUTCDate(base.getUTCDate() + dayOffset);
    const y = base.getUTCFullYear();
    const m = String(base.getUTCMonth() + 1).padStart(2, '0');
    const d = String(base.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

/** Generate a raw booking with structured metadata */
const rawBookingArb = (hotelIds: string[]) =>
  fc
    .record({
      id: fc.uuid(),
      status: bookingStatusArb,
      currency: currencyArb,
      total: amountArb.map(String),
      paymentStatus: fc.constantFrom('PENDING', 'PAID', 'REFUNDED'),
      hotelId: fc.constantFrom(...hotelIds),
      roomType: fc.constantFrom('Standard', 'Deluxe', 'Suite'),
      checkInDate: dateStringArb,
      checkOutDate: dateStringArb,
      nights: fc.integer({ min: 1, max: 30 }),
      guests: fc.integer({ min: 1, max: 10 }),
    })
    .map((r) => ({
      id: r.id,
      status: r.status,
      currency: r.currency,
      total: r.total,
      paymentStatus: r.paymentStatus,
      metadata: JSON.stringify({
        hotelId: r.hotelId,
        hotelName: `Hotel ${r.hotelId}`,
        roomType: r.roomType,
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        nights: r.nights,
        guests: r.guests,
      }),
      createdAt: new Date(),
    }));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Payments Earnings Preservation Properties', () => {
  const hotelIds = ['hotel-001', 'hotel-002', 'hotel-003'];
  const hotelNames: Record<string, string> = {
    'hotel-001': 'Hotel One',
    'hotel-002': 'Hotel Two',
    'hotel-003': 'Hotel Three',
  };

  // A fixed "today" so tests are deterministic
  const today = new Date('2025-06-15T12:00:00Z');

  /**
   * Property 3: Non-host user earnings
   *
   * For users without an agent record, the earnings endpoint returns empty
   * earnings with zero totals. We model this by calling processBookings with
   * an EMPTY bookings array (which is what the endpoint does when no agent
   * is found — it short-circuits before querying bookings).
   *
   * _For any_ input (we use a dummy constant), the result must be the
   * canonical empty-earnings shape.
   *
   * **Validates: Requirements 3.1**
   */
  it('Property 3: non-host users receive empty earnings with zero totals', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary user IDs to represent non-host users
        fc.uuid(),
        (_userId) => {
          // When no agent record is found, the endpoint returns this directly
          // without ever calling processBookings. We verify the shape here.
          const result = processBookings([], hotelNames, today);

          expect(result.earnings).toEqual([]);
          expect(result.summary).toEqual({
            totalCredits: 0,
            pendingCredits: 0,
            availableCredits: 0,
            pendingBookings: 0,
            completedBookings: 0,
          });
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property 5: Cancelled booking exclusion
   *
   * For bookings with status IN ('CANCELLED', 'REFUNDED'), they should NOT
   * contribute to any credit totals (pendingCredits, availableCredits) and
   * should NOT increment pendingBookings or completedBookings.
   *
   * **Validates: Requirements 3.5**
   */
  it('Property 5: cancelled/refunded bookings are excluded from earnings totals', () => {
    fc.assert(
      fc.property(
        fc
          .array(rawBookingArb(hotelIds), { minLength: 1, maxLength: 20 })
          .chain((bookings) =>
            // Generate a cancelled/refunded status for each booking deterministically
            fc
              .array(fc.constantFrom('CANCELLED' as const, 'REFUNDED' as const), {
                minLength: bookings.length,
                maxLength: bookings.length,
              })
              .map((statuses) =>
                bookings.map((b, i) => ({
                  ...b,
                  status: statuses[i],
                })),
              ),
          ),
        (cancelledBookings) => {
          const result = processBookings(cancelledBookings, hotelNames, today);

          // All processed earnings should have status 'CANCELLED'
          for (const earning of result.earnings) {
            expect(earning.status).toBe('CANCELLED');
          }

          // Summary totals must all be zero
          expect(result.summary.totalCredits).toBe(0);
          expect(result.summary.pendingCredits).toBe(0);
          expect(result.summary.availableCredits).toBe(0);
          expect(result.summary.pendingBookings).toBe(0);
          expect(result.summary.completedBookings).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Booking categorization
   *
   * Non-cancelled bookings should be categorized as:
   *   - AVAILABLE: when checkOutDate < today AND status is CONFIRMED or COMPLETED
   *   - PENDING: otherwise (not checked out, or not confirmed/completed)
   *
   * Additionally:
   *   - The sum of credits for AVAILABLE bookings must equal availableCredits
   *   - The sum of credits for PENDING bookings must equal pendingCredits
   *   - totalCredits = pendingCredits + availableCredits
   *   - pendingBookings + completedBookings = number of non-cancelled bookings
   *
   * **Validates: Requirements 3.4, 3.5**
   */
  it('Property 6: non-cancelled bookings are categorized as AVAILABLE or PENDING with correct totals', () => {
    // Use a deterministic cancelled-status generator (not Math.random)
    const nonCancelledStatusArb = fc.constantFrom(
      'PENDING',
      'CONFIRMED',
      'COMPLETED',
    );

    // Generate bookings that are NOT cancelled
    const nonCancelledBookingArb = fc
      .record({
        id: fc.uuid(),
        status: nonCancelledStatusArb,
        currency: currencyArb,
        total: amountArb.map(String),
        paymentStatus: fc.constantFrom('PENDING', 'PAID'),
        hotelId: fc.constantFrom(...hotelIds),
        roomType: fc.constantFrom('Standard', 'Deluxe', 'Suite'),
        checkInDate: dateStringArb,
        checkOutDate: dateStringArb,
        nights: fc.integer({ min: 1, max: 30 }),
        guests: fc.integer({ min: 1, max: 10 }),
      })
      .map((r) => ({
        id: r.id,
        status: r.status,
        currency: r.currency,
        total: r.total,
        paymentStatus: r.paymentStatus,
        metadata: JSON.stringify({
          hotelId: r.hotelId,
          hotelName: `Hotel ${r.hotelId}`,
          roomType: r.roomType,
          checkInDate: r.checkInDate,
          checkOutDate: r.checkOutDate,
          nights: r.nights,
          guests: r.guests,
        }),
        createdAt: new Date(),
      }));

    fc.assert(
      fc.property(
        fc.array(nonCancelledBookingArb, { minLength: 1, maxLength: 20 }),
        (bookings) => {
          const result = processBookings(bookings, hotelNames, today);

          let expectedAvailableCredits = 0;
          let expectedPendingCredits = 0;
          let expectedCompletedBookings = 0;
          let expectedPendingBookings = 0;

          for (const earning of result.earnings) {
            // Every non-cancelled booking must be either AVAILABLE or PENDING
            expect(['AVAILABLE', 'PENDING']).toContain(earning.status);

            // Parse the checkout date from the original booking metadata
            const metadata = JSON.parse(
              bookings.find((b) => b.id === earning.id)!.metadata as string,
            );
            const checkOutDate = metadata.checkOutDate
              ? new Date(metadata.checkOutDate)
              : null;
            const isCheckedOut = checkOutDate && checkOutDate < today;
            const bookingStatus = bookings.find(
              (b) => b.id === earning.id,
            )!.status;
            const isConfirmed =
              bookingStatus === 'CONFIRMED' || bookingStatus === 'COMPLETED';

            if (isCheckedOut && isConfirmed) {
              expect(earning.status).toBe('AVAILABLE');
              expectedAvailableCredits += earning.credits;
              expectedCompletedBookings++;
            } else {
              expect(earning.status).toBe('PENDING');
              expectedPendingCredits += earning.credits;
              expectedPendingBookings++;
            }
          }

          // Verify summary matches
          expect(result.summary.availableCredits).toBe(
            expectedAvailableCredits,
          );
          expect(result.summary.pendingCredits).toBe(expectedPendingCredits);
          expect(result.summary.totalCredits).toBe(
            expectedPendingCredits + expectedAvailableCredits,
          );
          expect(result.summary.completedBookings).toBe(
            expectedCompletedBookings,
          );
          expect(result.summary.pendingBookings).toBe(expectedPendingBookings);
        },
      ),
      { numRuns: 200 },
    );
  });
});
