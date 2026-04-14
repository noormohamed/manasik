/**
 * Tax Service
 * Handles territory-based tax rate calculation for all booking types
 */

import { TaxRate, DEFAULT_TAX_RATES } from '../../features/hotel/types';

export class TaxService {
  private taxRates: TaxRate[];

  constructor(customTaxRates?: TaxRate[]) {
    this.taxRates = customTaxRates || DEFAULT_TAX_RATES;
  }

  /**
   * Get tax rate for a territory
   * Tries exact match first (e.g., "US-NY"), then falls back to country (e.g., "US")
   */
  getTaxRate(territory: string): TaxRate | null {
    if (!territory) return null;

    // Try exact match first (e.g., "US-NY")
    const exactMatch = this.taxRates.find(t => t.territory === territory);
    if (exactMatch) return exactMatch;

    // Fall back to country code (e.g., "US")
    const countryCode = territory.split('-')[0];
    const countryMatch = this.taxRates.find(t => t.territory === countryCode);
    if (countryMatch) return countryMatch;

    return null;
  }

  /**
   * Calculate tax amount
   * tax = subtotal × taxRate
   */
  calculateTax(subtotal: number, territory: string): number {
    const taxRate = this.getTaxRate(territory);
    if (!taxRate) {
      throw new Error(`No tax rate found for territory: ${territory}`);
    }

    return Math.round(subtotal * taxRate.rate * 100) / 100;
  }

  /**
   * Calculate total with tax
   * total = subtotal + tax
   */
  calculateTotal(subtotal: number, territory: string): number {
    const tax = this.calculateTax(subtotal, territory);
    return subtotal + tax;
  }

  /**
   * Calculate booking price with tax
   * subtotal = pricePerNight × nights × roomCount
   * tax = subtotal × taxRate
   * total = subtotal + tax
   */
  calculateBookingPrice(params: {
    pricePerNight: number;
    nights: number;
    roomCount: number;
    territory: string;
  }): {
    pricePerNight: number;
    nights: number;
    roomCount: number;
    subtotal: number;
    taxRate: number;
    tax: number;
    total: number;
  } {
    const { pricePerNight, nights, roomCount, territory } = params;

    const subtotal = pricePerNight * nights * roomCount;
    const taxRateObj = this.getTaxRate(territory);

    if (!taxRateObj) {
      throw new Error(`No tax rate found for territory: ${territory}`);
    }

    const tax = this.calculateTax(subtotal, territory);
    const total = subtotal + tax;

    return {
      pricePerNight,
      nights,
      roomCount,
      subtotal,
      taxRate: taxRateObj.rate,
      tax,
      total,
    };
  }

  /**
   * Get all available tax rates
   */
  getAllTaxRates(): TaxRate[] {
    return [...this.taxRates];
  }

  /**
   * Add or update a tax rate
   */
  setTaxRate(territory: string, rate: number, description?: string): void {
    const index = this.taxRates.findIndex(t => t.territory === territory);

    if (index >= 0) {
      this.taxRates[index] = { territory, rate, description };
    } else {
      this.taxRates.push({ territory, rate, description });
    }
  }

  /**
   * Remove a tax rate
   */
  removeTaxRate(territory: string): boolean {
    const index = this.taxRates.findIndex(t => t.territory === territory);
    if (index >= 0) {
      this.taxRates.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const taxService = new TaxService();
