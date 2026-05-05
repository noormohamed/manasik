import { formatGBP } from '../formatCurrency';

describe('formatGBP', () => {
  it('formats a positive value with two decimal places', () => {
    expect(formatGBP(1234.5)).toBe('£1,234.50');
  });

  it('formats zero as £0.00', () => {
    expect(formatGBP(0)).toBe('£0.00');
  });

  it('formats negative values', () => {
    const result = formatGBP(-500);
    // Intl.NumberFormat may use a minus sign or Unicode minus
    expect(result).toMatch(/^-£500\.00$/);
  });

  it('formats large values with thousands separators', () => {
    expect(formatGBP(1000000)).toBe('£1,000,000.00');
  });

  it('rounds to exactly two decimal places', () => {
    expect(formatGBP(99.999)).toBe('£100.00');
    expect(formatGBP(10.005)).toBe('£10.01');
  });

  it('formats small decimal values', () => {
    expect(formatGBP(0.01)).toBe('£0.01');
    expect(formatGBP(0.1)).toBe('£0.10');
  });

  it('formats values with no decimal part', () => {
    expect(formatGBP(42)).toBe('£42.00');
  });
});
