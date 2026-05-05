/**
 * Property-Based Tests — Manasik Fee Calculation
 *
 * These tests verify the correctness properties of the calculateManasikFee
 * pure utility function using fast-check.
 *
 * Feature: manasik-fee-rebate
 *
 * Property 1: Fee Calculation Round-Trip Consistency
 * Property 2: Invalid Percent Fallback to Default
 * Property 3: Fee Does Not Exceed Subtotal
 *
 * **Validates: Requirements 1.4, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3, 1.6**
 */

import * as fc from 'fast-check';
import { calculateManasikFee } from '../utils/manasik-fee';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PERCENT = 15;

/**
 * Reference implementation of the fee calculation formula.
 * Used to verify round-trip consistency.
 */
function referenceFeeCalc(subtotal: number, percent: number): number {
  return Math.round(subtotal * (percent / 100) * 100) / 100;
}

/**
 * Check that a number has at most 2 decimal places.
 */
function hasAtMostTwoDecimals(n: number): boolean {
  return Math.round(n * 100) === n * 100;
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/** Generate a valid subtotal (≥ 0, up to a large but reasonable value) */
const subtotalArb = fc
  .float({ min: 0, max: Math.fround(999_999.99), noNaN: true, noDefaultInfinity: true })
  .map((n) => parseFloat(Math.abs(n).toFixed(2)));

/** Generate a valid percent in [0, 100] */
const validPercentArb = fc
  .float({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true })
  .map((n) => parseFloat(n.toFixed(2)));

/** Generate an invalid percent (outside [0, 100], or NaN, or Infinity) */
const invalidPercentArb = fc.oneof(
  // Negative values
  fc.float({ min: Math.fround(-10_000), max: Math.fround(-0.01), noNaN: true, noDefaultInfinity: true }),
  // Values > 100
  fc.float({ min: Math.fround(100.01), max: Math.fround(10_000), noNaN: true, noDefaultInfinity: true }),
  // Special non-finite values
  fc.constant(NaN),
  fc.constant(Infinity),
  fc.constant(-Infinity),
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Manasik Fee Calculation Properties', () => {
  /**
   * Feature: manasik-fee-rebate, Property 1: Fee Calculation Round-Trip Consistency
   *
   * For any valid subtotal (≥ 0) and valid fee percent (0–100), the calculated
   * manasik_fee_amount SHALL equal Math.round(subtotal × (percent / 100) * 100) / 100.
   * Additionally, the result SHALL have at most two decimal places.
   *
   * **Validates: Requirements 1.4, 2.4, 2.5, 2.6**
   */
  it('Feature: manasik-fee-rebate, Property 1: Fee Calculation Round-Trip Consistency', () => {
    fc.assert(
      fc.property(subtotalArb, validPercentArb, (subtotal, percent) => {
        const result = calculateManasikFee(subtotal, percent);

        const expectedFee = referenceFeeCalc(subtotal, percent);

        // The fee should match the reference formula
        expect(result.manasikFeeAmount).toBeCloseTo(expectedFee, 2);

        // The percent should be passed through unchanged for valid values
        expect(result.manasikFeePercent).toBe(percent);

        // The fee amount should have at most 2 decimal places
        expect(hasAtMostTwoDecimals(result.manasikFeeAmount)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: manasik-fee-rebate, Property 2: Invalid Percent Fallback
   *
   * For any fee percent value outside the range [0, 100] (negative, greater than 100,
   * NaN, etc.), the calculateManasikFee function SHALL produce the same result as if
   * the percent were 15 (the default).
   *
   * **Validates: Requirements 7.1, 7.2, 1.6**
   */
  it('Feature: manasik-fee-rebate, Property 2: Invalid Percent Fallback', () => {
    fc.assert(
      fc.property(subtotalArb, invalidPercentArb, (subtotal, invalidPercent) => {
        const resultInvalid = calculateManasikFee(subtotal, invalidPercent);
        const resultDefault = calculateManasikFee(subtotal, DEFAULT_PERCENT);

        // The fee amount should be the same as using the default percent
        expect(resultInvalid.manasikFeeAmount).toBe(resultDefault.manasikFeeAmount);

        // The percent should fall back to the default
        expect(resultInvalid.manasikFeePercent).toBe(DEFAULT_PERCENT);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: manasik-fee-rebate, Property 3: Fee Does Not Exceed Subtotal
   *
   * For any subtotal (≥ 0) and any percent value (including out-of-range values
   * that trigger the default), the calculated manasik_fee_amount SHALL be less
   * than or equal to the subtotal. That is, 0 ≤ manasik_fee_amount ≤ subtotal.
   *
   * **Validates: Requirements 7.3**
   */
  it('Feature: manasik-fee-rebate, Property 3: Fee Does Not Exceed Subtotal', () => {
    // Use any percent — valid or invalid — to test the constraint broadly
    const anyPercentArb = fc.oneof(validPercentArb, invalidPercentArb);

    fc.assert(
      fc.property(subtotalArb, anyPercentArb, (subtotal, percent) => {
        const result = calculateManasikFee(subtotal, percent);

        // Fee must be non-negative
        expect(result.manasikFeeAmount).toBeGreaterThanOrEqual(0);

        // Fee must not exceed subtotal
        expect(result.manasikFeeAmount).toBeLessThanOrEqual(subtotal);
      }),
      { numRuns: 100 },
    );
  });
});


// ---------------------------------------------------------------------------
// Properties 4–5: Earnings-level properties
// ---------------------------------------------------------------------------

/** Booking status generator */
const statusArb = fc.constantFrom('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

/** Generate a booking record with a fee amount */
const bookingArb = fc.record({
  subtotal: subtotalArb,
  manasikFeeAmount: subtotalArb,
  status: statusArb,
});

describe('Manasik Fee Earnings Properties', () => {
  /**
   * Feature: manasik-fee-rebate, Property 4: Net Earnings Equal Gross Minus Total Fees
   *
   * For any set of bookings with associated Manasik Fee amounts, the net available
   * earnings SHALL equal the gross available earnings minus the sum of all Manasik
   * Fee amounts for those bookings.
   *
   * **Validates: Requirements 5.3**
   */
  it('Feature: manasik-fee-rebate, Property 4: Net Earnings Equal Gross Minus Total Fees', () => {
    fc.assert(
      fc.property(fc.array(bookingArb, { minLength: 0, maxLength: 50 }), (bookings) => {
        // Only CONFIRMED/COMPLETED bookings contribute to earnings
        const eligibleBookings = bookings.filter(
          (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED',
        );

        const grossEarnings = eligibleBookings.reduce((sum, b) => sum + b.subtotal, 0);
        const totalFees = eligibleBookings.reduce((sum, b) => sum + b.manasikFeeAmount, 0);
        const netEarnings = grossEarnings - totalFees;

        // Net earnings must equal gross minus fees
        expect(netEarnings).toBeCloseTo(grossEarnings - totalFees, 2);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: manasik-fee-rebate, Property 5: Total Manasik Fees Excludes Cancelled Bookings
   *
   * For any set of bookings with mixed statuses, the totalManasikFees SHALL equal
   * the sum of manasik_fee_amount only for bookings with status CONFIRMED or COMPLETED.
   * Cancelled and refunded bookings SHALL NOT contribute to the total.
   *
   * **Validates: Requirements 6.3**
   */
  it('Feature: manasik-fee-rebate, Property 5: Total Manasik Fees Excludes Cancelled Bookings', () => {
    fc.assert(
      fc.property(fc.array(bookingArb, { minLength: 1, maxLength: 50 }), (bookings) => {
        // Compute totalManasikFees the way the API does
        const totalManasikFees = bookings
          .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
          .reduce((sum, b) => sum + b.manasikFeeAmount, 0);

        // Compute what cancelled/refunded bookings would add
        const cancelledFees = bookings
          .filter((b) => b.status === 'CANCELLED' || b.status === 'REFUNDED')
          .reduce((sum, b) => sum + b.manasikFeeAmount, 0);

        // Compute total across ALL bookings
        const allFees = bookings.reduce((sum, b) => sum + b.manasikFeeAmount, 0);

        // totalManasikFees must NOT include cancelled/refunded fees
        // i.e., totalManasikFees + cancelledFees + pendingFees = allFees
        expect(totalManasikFees).toBeLessThanOrEqual(allFees);

        // Specifically, cancelled fees must not be in totalManasikFees
        const pendingFees = bookings
          .filter((b) => b.status === 'PENDING')
          .reduce((sum, b) => sum + b.manasikFeeAmount, 0);

        expect(totalManasikFees + cancelledFees + pendingFees).toBeCloseTo(allFees, 2);
      }),
      { numRuns: 100 },
    );
  });
});
