"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelBooking = void 0;
const base_booking_1 = require("../../../models/booking/base-booking");
const tax_service_1 = require("../../../services/payments/tax.service");
/**
 * HotelBooking extends BaseBooking with hotel-specific logic
 *
 * Workflow:
 * 1. User specifies check-in, check-out dates and guest count
 * 2. System filters available rooms by occupancy capacity
 * 3. User selects room type(s) and quantity
 * 4. System calculates: total = (roomPrice × nights × roomCount) + tax
 * 5. Tax is calculated based on territory (country/state)
 * 6. Booking is created with reserved rooms
 */
class HotelBooking extends base_booking_1.BaseBooking {
    validate() {
        const meta = this.metadata;
        if (!meta.hotelId || !meta.roomTypeId) {
            throw new Error('Hotel and room type are required');
        }
        if (!meta.checkInDate || !meta.checkOutDate) {
            throw new Error('Check-in and check-out dates are required');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.checkInDate)) {
            throw new Error('Invalid check-in date format. Use YYYY-MM-DD');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.checkOutDate)) {
            throw new Error('Invalid check-out date format. Use YYYY-MM-DD');
        }
        const checkIn = new Date(meta.checkInDate);
        const checkOut = new Date(meta.checkOutDate);
        if (checkOut <= checkIn) {
            throw new Error('Check-out date must be after check-in date');
        }
        if (meta.roomCount < 1) {
            throw new Error('At least 1 room must be booked');
        }
        if (meta.guestCount < 1) {
            throw new Error('At least 1 guest is required');
        }
        // Validate room occupancy can accommodate guests
        // If user specifies 4 guests, they need rooms with total capacity >= 4
        if (!meta.roomOccupancy || meta.roomOccupancy < 1) {
            throw new Error('Room occupancy must be specified');
        }
        const totalCapacity = meta.roomOccupancy * meta.roomCount;
        if (totalCapacity < meta.guestCount) {
            throw new Error(`Selected rooms (${meta.roomCount} × ${meta.roomOccupancy} capacity) cannot accommodate ${meta.guestCount} guests`);
        }
        if (!meta.territory) {
            throw new Error('Territory is required for tax calculation');
        }
        if (!meta.taxRate || meta.taxRate < 0) {
            throw new Error('Valid tax rate is required');
        }
        if (!meta.guestName || !meta.guestEmail) {
            throw new Error('Guest name and email are required');
        }
        return true;
    }
    getNights() {
        const meta = this.metadata;
        const checkIn = new Date(meta.checkInDate);
        const checkOut = new Date(meta.checkOutDate);
        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }
    /**
     * Calculate price breakdown
     * Price = (roomPrice × nights × roomCount) + tax
     */
    getPriceBreakdown() {
        const meta = this.metadata;
        const nights = this.getNights();
        const pricePerNight = meta.pricePerNight;
        return {
            pricePerNight,
            nights,
            roomCount: meta.roomCount,
            subtotal: this.subtotal,
            taxRate: meta.taxRate,
            tax: this.tax,
            total: this.total,
            territory: meta.territory,
        };
    }
    getHotelMetadata() {
        return this.metadata;
    }
    static create(params) {
        const booking = new HotelBooking();
        booking.id = params.id;
        booking.companyId = params.companyId;
        booking.customerId = params.customerId;
        booking.serviceType = 'HOTEL';
        booking.currency = params.currency;
        booking.subtotal = params.subtotal;
        booking.tax = params.tax;
        booking.total = params.total;
        booking.metadata = params.metadata;
        booking.status = 'PENDING';
        booking.createdAt = new Date();
        booking.updatedAt = new Date();
        booking.validate();
        return booking;
    }
    /**
     * Create booking with automatic tax calculation
     */
    static createWithTaxCalculation(params) {
        const priceBreakdown = tax_service_1.taxService.calculateBookingPrice({
            pricePerNight: params.pricePerNight,
            nights: params.nights,
            roomCount: params.roomCount,
            territory: params.territory,
        });
        const metadata = Object.assign(Object.assign({}, params.metadata), { taxRate: priceBreakdown.taxRate, territory: params.territory });
        return HotelBooking.create({
            id: params.id,
            companyId: params.companyId,
            customerId: params.customerId,
            currency: params.currency,
            subtotal: priceBreakdown.subtotal,
            tax: priceBreakdown.tax,
            total: priceBreakdown.total,
            metadata,
        });
    }
    static fromJSON(data) {
        return HotelBooking.create({
            id: data.id,
            companyId: data.companyId,
            customerId: data.customerId,
            currency: data.currency,
            subtotal: data.subtotal,
            tax: data.tax,
            total: data.total,
            metadata: data.metadata,
        });
    }
}
exports.HotelBooking = HotelBooking;
