/**
 * Manasik Fee Utility
 *
 * Shared utility for calculating the platform commission (Manasik Fee)
 * on bookings. Used by all booking creation paths to ensure consistent
 * fee calculation and validation.
 */

import { Pool } from 'mysql2/promise';

const DEFAULT_FEE_PERCENT = 15;

export interface ManasikFeeResult {
  manasikFeePercent: number;
  manasikFeeAmount: number;
}

/**
 * Fetch the current rebate percent from platform_settings.
 * Returns the default (15) if not found, non-numeric, or out of range 0–100.
 */
export async function getManasikFeePercent(pool: Pool): Promise<number> {
  try {
    const [rows] = await pool.execute(
      `SELECT setting_value FROM platform_settings WHERE setting_key = 'rebate_percent' LIMIT 1`
    );

    const results = rows as Array<{ setting_value: string }>;

    if (results.length === 0) {
      return DEFAULT_FEE_PERCENT;
    }

    const parsed = parseFloat(results[0].setting_value);

    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      return DEFAULT_FEE_PERCENT;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to read rebate_percent from platform_settings, using default:', error);
    return DEFAULT_FEE_PERCENT;
  }
}

/**
 * Calculate the Manasik Fee for a given subtotal and percent.
 * Pure function — no DB access.
 *
 * - Validates percent is 0–100 (falls back to 15 if invalid)
 * - Computes: Math.round(subtotal * (percent / 100) * 100) / 100
 * - Ensures fee does not exceed subtotal
 */
export function calculateManasikFee(subtotal: number, percent: number): ManasikFeeResult {
  // Validate percent: must be a finite number in [0, 100]
  let validPercent = percent;
  if (!Number.isFinite(validPercent) || validPercent < 0 || validPercent > 100) {
    validPercent = DEFAULT_FEE_PERCENT;
  }

  // Calculate fee with standard rounding to 2 decimal places
  let feeAmount = Math.round(subtotal * (validPercent / 100) * 100) / 100;

  // Ensure fee does not exceed subtotal
  if (feeAmount > subtotal) {
    feeAmount = subtotal;
  }

  // Ensure fee is not negative (handles negative subtotals gracefully)
  if (feeAmount < 0) {
    feeAmount = 0;
  }

  return {
    manasikFeePercent: validPercent,
    manasikFeeAmount: feeAmount,
  };
}
