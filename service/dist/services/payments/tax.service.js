"use strict";
/**
 * Tax Service
 * Handles territory-based tax rate calculation for all booking types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxService = exports.TaxService = void 0;
const types_1 = require("../../features/hotel/types");
class TaxService {
    constructor(customTaxRates) {
        this.taxRates = customTaxRates || types_1.DEFAULT_TAX_RATES;
    }
    /**
     * Get tax rate for a territory
     * Tries exact match first (e.g., "US-NY"), then falls back to country (e.g., "US")
     */
    getTaxRate(territory) {
        if (!territory)
            return null;
        // Try exact match first (e.g., "US-NY")
        const exactMatch = this.taxRates.find(t => t.territory === territory);
        if (exactMatch)
            return exactMatch;
        // Fall back to country code (e.g., "US")
        const countryCode = territory.split('-')[0];
        const countryMatch = this.taxRates.find(t => t.territory === countryCode);
        if (countryMatch)
            return countryMatch;
        return null;
    }
    /**
     * Calculate tax amount
     * tax = subtotal × taxRate
     */
    calculateTax(subtotal, territory) {
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
    calculateTotal(subtotal, territory) {
        const tax = this.calculateTax(subtotal, territory);
        return subtotal + tax;
    }
    /**
     * Calculate booking price with tax
     * subtotal = pricePerNight × nights × roomCount
     * tax = subtotal × taxRate
     * total = subtotal + tax
     */
    calculateBookingPrice(params) {
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
    getAllTaxRates() {
        return [...this.taxRates];
    }
    /**
     * Add or update a tax rate
     */
    setTaxRate(territory, rate, description) {
        const index = this.taxRates.findIndex(t => t.territory === territory);
        if (index >= 0) {
            this.taxRates[index] = { territory, rate, description };
        }
        else {
            this.taxRates.push({ territory, rate, description });
        }
    }
    /**
     * Remove a tax rate
     */
    removeTaxRate(territory) {
        const index = this.taxRates.findIndex(t => t.territory === territory);
        if (index >= 0) {
            this.taxRates.splice(index, 1);
            return true;
        }
        return false;
    }
}
exports.TaxService = TaxService;
exports.taxService = new TaxService();
