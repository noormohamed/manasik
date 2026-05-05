/**
 * GBP currency formatting utility for the Admin Analytics Dashboard.
 *
 * Formats numeric values as British Pounds Sterling (£) with exactly
 * two decimal places and thousands separators.
 */

/**
 * Format a numeric value as GBP currency string.
 *
 * Returns a string in the format `£X,XXX.XX` with exactly two decimal places
 * and locale-appropriate thousands separators.
 *
 * @param value - The numeric value to format (supports zero, negative, and large values)
 * @returns A GBP-formatted string, e.g. "£1,234.56", "£0.00", "-£500.00"
 *
 * @example
 * formatGBP(1234.5)    // "£1,234.50"
 * formatGBP(0)         // "£0.00"
 * formatGBP(-500)      // "-£500.00"
 * formatGBP(1000000)   // "£1,000,000.00"
 */
export function formatGBP(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
