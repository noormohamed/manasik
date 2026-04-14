"use strict";
/**
 * Tax Service Tests
 * Tests for territory-based tax calculation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tax_service_1 = require("../../../services/payments/tax.service");
describe('Tax Service', () => {
    let taxService;
    beforeEach(() => {
        taxService = new tax_service_1.TaxService();
    });
    describe('Get Tax Rate', () => {
        it('should get exact territory match', () => {
            const rate = taxService.getTaxRate('US-NY');
            expect(rate).toBeDefined();
            expect(rate === null || rate === void 0 ? void 0 : rate.territory).toBe('US-NY');
            expect(rate === null || rate === void 0 ? void 0 : rate.rate).toBe(0.08);
        });
        it('should fall back to country code', () => {
            const rate = taxService.getTaxRate('US-UNKNOWN');
            expect(rate).toBeDefined();
            expect(rate === null || rate === void 0 ? void 0 : rate.territory).toBe('US');
            expect(rate === null || rate === void 0 ? void 0 : rate.rate).toBe(0.07);
        });
        it('should return null for unknown territory', () => {
            const rate = taxService.getTaxRate('XX-UNKNOWN');
            expect(rate).toBeNull();
        });
        it('should get different state rates', () => {
            const ny = taxService.getTaxRate('US-NY');
            const ca = taxService.getTaxRate('US-CA');
            const tx = taxService.getTaxRate('US-TX');
            expect(ny === null || ny === void 0 ? void 0 : ny.rate).toBe(0.08);
            expect(ca === null || ca === void 0 ? void 0 : ca.rate).toBe(0.0725);
            expect(tx === null || tx === void 0 ? void 0 : tx.rate).toBe(0.0625);
        });
        it('should get international rates', () => {
            const gb = taxService.getTaxRate('GB');
            const fr = taxService.getTaxRate('FR');
            const au = taxService.getTaxRate('AU');
            expect(gb === null || gb === void 0 ? void 0 : gb.rate).toBe(0.20);
            expect(fr === null || fr === void 0 ? void 0 : fr.rate).toBe(0.20);
            expect(au === null || au === void 0 ? void 0 : au.rate).toBe(0.10);
        });
    });
    describe('Calculate Tax', () => {
        it('should calculate tax for US-NY (8%)', () => {
            const tax = taxService.calculateTax(1000, 'US-NY');
            expect(tax).toBe(80);
        });
        it('should calculate tax for US-CA (7.25%)', () => {
            const tax = taxService.calculateTax(1000, 'US-CA');
            expect(tax).toBe(72.5);
        });
        it('should calculate tax for GB (20%)', () => {
            const tax = taxService.calculateTax(1000, 'GB');
            expect(tax).toBe(200);
        });
        it('should calculate tax for AU (10%)', () => {
            const tax = taxService.calculateTax(1000, 'AU');
            expect(tax).toBe(100);
        });
        it('should throw error for unknown territory', () => {
            expect(() => taxService.calculateTax(1000, 'XX-UNKNOWN')).toThrow('No tax rate found for territory: XX-UNKNOWN');
        });
        it('should handle decimal subtotals', () => {
            const tax = taxService.calculateTax(1234.56, 'US-NY');
            expect(tax).toBe(98.76);
        });
        it('should round tax correctly', () => {
            const tax = taxService.calculateTax(333.33, 'US-NY');
            expect(tax).toBe(26.67);
        });
    });
    describe('Calculate Total', () => {
        it('should calculate total with tax', () => {
            const total = taxService.calculateTotal(1000, 'US-NY');
            expect(total).toBe(1080);
        });
        it('should calculate total for different territories', () => {
            const nyTotal = taxService.calculateTotal(1000, 'US-NY');
            const caTotal = taxService.calculateTotal(1000, 'US-CA');
            const gbTotal = taxService.calculateTotal(1000, 'GB');
            expect(nyTotal).toBe(1080);
            expect(caTotal).toBe(1072.5);
            expect(gbTotal).toBe(1200);
        });
    });
    describe('Calculate Booking Price', () => {
        it('should calculate booking price with tax', () => {
            const price = taxService.calculateBookingPrice({
                pricePerNight: 250,
                nights: 3,
                roomCount: 2,
                territory: 'US-NY',
            });
            expect(price.pricePerNight).toBe(250);
            expect(price.nights).toBe(3);
            expect(price.roomCount).toBe(2);
            expect(price.subtotal).toBe(1500); // 250 × 3 × 2
            expect(price.taxRate).toBe(0.08);
            expect(price.tax).toBe(120); // 1500 × 0.08
            expect(price.total).toBe(1620); // 1500 + 120
        });
        it('should calculate booking price for different territories', () => {
            const nyPrice = taxService.calculateBookingPrice({
                pricePerNight: 250,
                nights: 3,
                roomCount: 2,
                territory: 'US-NY',
            });
            const gbPrice = taxService.calculateBookingPrice({
                pricePerNight: 250,
                nights: 3,
                roomCount: 2,
                territory: 'GB',
            });
            expect(nyPrice.total).toBe(1620);
            expect(gbPrice.total).toBe(1800); // 1500 + (1500 × 0.20)
        });
        it('should calculate booking price for single room', () => {
            const price = taxService.calculateBookingPrice({
                pricePerNight: 100,
                nights: 5,
                roomCount: 1,
                territory: 'US-CA',
            });
            expect(price.subtotal).toBe(500); // 100 × 5 × 1
            expect(price.tax).toBe(36.25); // 500 × 0.0725
            expect(price.total).toBe(536.25);
        });
        it('should calculate booking price for multiple rooms', () => {
            const price = taxService.calculateBookingPrice({
                pricePerNight: 150,
                nights: 2,
                roomCount: 4,
                territory: 'AU',
            });
            expect(price.subtotal).toBe(1200); // 150 × 2 × 4
            expect(price.tax).toBe(120); // 1200 × 0.10
            expect(price.total).toBe(1320);
        });
        it('should throw error for unknown territory', () => {
            expect(() => taxService.calculateBookingPrice({
                pricePerNight: 250,
                nights: 3,
                roomCount: 2,
                territory: 'XX-UNKNOWN',
            })).toThrow('No tax rate found for territory: XX-UNKNOWN');
        });
    });
    describe('Manage Tax Rates', () => {
        it('should get all tax rates', () => {
            const rates = taxService.getAllTaxRates();
            expect(rates.length).toBeGreaterThan(0);
            expect(rates.some(r => r.territory === 'US-NY')).toBe(true);
        });
        it('should set new tax rate', () => {
            taxService.setTaxRate('XX-TEST', 0.15, 'Test Territory');
            const rate = taxService.getTaxRate('XX-TEST');
            expect(rate).toBeDefined();
            expect(rate === null || rate === void 0 ? void 0 : rate.territory).toBe('XX-TEST');
            expect(rate === null || rate === void 0 ? void 0 : rate.rate).toBe(0.15);
            expect(rate === null || rate === void 0 ? void 0 : rate.description).toBe('Test Territory');
        });
        it('should update existing tax rate', () => {
            const originalRate = taxService.getTaxRate('US-NY');
            expect(originalRate === null || originalRate === void 0 ? void 0 : originalRate.rate).toBe(0.08);
            taxService.setTaxRate('US-NY', 0.09, 'Updated NY Rate');
            const updatedRate = taxService.getTaxRate('US-NY');
            expect(updatedRate === null || updatedRate === void 0 ? void 0 : updatedRate.rate).toBe(0.09);
            expect(updatedRate === null || updatedRate === void 0 ? void 0 : updatedRate.description).toBe('Updated NY Rate');
        });
        it('should remove tax rate', () => {
            taxService.setTaxRate('XX-TEMP', 0.05);
            expect(taxService.getTaxRate('XX-TEMP')).toBeDefined();
            const removed = taxService.removeTaxRate('XX-TEMP');
            expect(removed).toBe(true);
            expect(taxService.getTaxRate('XX-TEMP')).toBeNull();
        });
        it('should return false when removing non-existent rate', () => {
            const removed = taxService.removeTaxRate('XX-NONEXISTENT');
            expect(removed).toBe(false);
        });
    });
    describe('Custom Tax Rates', () => {
        it('should use custom tax rates', () => {
            const customRates = [
                { territory: 'US', rate: 0.10 },
                { territory: 'CA', rate: 0.15 },
            ];
            const customService = new tax_service_1.TaxService(customRates);
            const usRate = customService.getTaxRate('US');
            const caRate = customService.getTaxRate('CA');
            expect(usRate === null || usRate === void 0 ? void 0 : usRate.rate).toBe(0.10);
            expect(caRate === null || caRate === void 0 ? void 0 : caRate.rate).toBe(0.15);
        });
        it('should calculate with custom rates', () => {
            const customRates = [
                { territory: 'TEST', rate: 0.25 },
            ];
            const customService = new tax_service_1.TaxService(customRates);
            const tax = customService.calculateTax(1000, 'TEST');
            expect(tax).toBe(250);
        });
    });
    describe('Edge Cases', () => {
        it('should handle zero subtotal', () => {
            const tax = taxService.calculateTax(0, 'US-NY');
            expect(tax).toBe(0);
        });
        it('should handle very large subtotal', () => {
            const tax = taxService.calculateTax(1000000, 'GB');
            expect(tax).toBe(200000); // 1000000 × 0.20
        });
        it('should handle very small subtotal', () => {
            const tax = taxService.calculateTax(0.01, 'US-NY');
            expect(tax).toBe(0);
        });
        it('should handle high tax rates', () => {
            const price = taxService.calculateBookingPrice({
                pricePerNight: 100,
                nights: 1,
                roomCount: 1,
                territory: 'GB', // 20% tax
            });
            expect(price.tax).toBe(20);
            expect(price.total).toBe(120);
        });
    });
});
