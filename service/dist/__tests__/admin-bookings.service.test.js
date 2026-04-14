"use strict";
/**
 * Admin Bookings Service Tests
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_bookings_service_1 = require("../services/admin-bookings.service");
describe('AdminBookingsService', () => {
    let service;
    let mockDatabase;
    beforeEach(() => {
        mockDatabase = {
            query: jest.fn(),
        };
        service = new admin_bookings_service_1.AdminBookingsService(mockDatabase);
    });
    describe('getBookings', () => {
        it('should return bookings list with pagination', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockBookings = [
                {
                    id: 'BK001',
                    customerId: 'CUST001',
                    customerName: 'John Doe',
                    customerEmail: 'john@example.com',
                    serviceType: 'HOTEL',
                    serviceName: 'Grand Hotel',
                    bookingDate: '2024-01-15T10:30:00Z',
                    status: 'CONFIRMED',
                    totalAmount: 450.00,
                    currency: 'USD',
                    metadata: null,
                },
            ];
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }]) // count query
                .mockResolvedValueOnce(mockBookings); // data query
            const result = yield service.getBookings({
                limit: 25,
                offset: 0,
            });
            expect(result.bookings).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.bookings[0].id).toBe('BK001');
        }));
        it('should filter bookings by status', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getBookings({
                status: 'CONFIRMED',
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('status = ?');
            expect(countCall[1]).toContain('CONFIRMED');
        }));
        it('should search bookings by customer email', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getBookings({
                search: 'john@example.com',
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('LIKE ?');
        }));
        it('should filter bookings by date range', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getBookings({
                dateRangeStart: '2024-01-01',
                dateRangeEnd: '2024-01-31',
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('created_at >= ?');
            expect(countCall[0]).toContain('created_at <= ?');
        }));
        it('should filter bookings by amount range', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getBookings({
                amountRangeMin: 100,
                amountRangeMax: 500,
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('total >= ?');
            expect(countCall[0]).toContain('total <= ?');
        }));
    });
    describe('getBookingDetail', () => {
        it('should return booking detail', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockBooking = {
                id: 'BK001',
                customer_id: 'CUST001',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                company_id: 'COMP001',
                service_type: 'HOTEL',
                serviceName: 'Grand Hotel',
                created_at: '2024-01-15T10:30:00Z',
                status: 'CONFIRMED',
                total: 450.00,
                currency: 'USD',
                subtotal: 400.00,
                tax: 50.00,
                metadata: null,
            };
            mockDatabase.query.mockResolvedValueOnce([mockBooking]);
            const result = yield service.getBookingDetail('BK001');
            expect(result).not.toBeNull();
            expect(result === null || result === void 0 ? void 0 : result.id).toBe('BK001');
            expect(result === null || result === void 0 ? void 0 : result.totalAmount).toBe(450.00);
        }));
        it('should return null if booking not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce([]);
            const result = yield service.getBookingDetail('INVALID');
            expect(result).toBeNull();
        }));
    });
    describe('cancelBooking', () => {
        it('should cancel a booking', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });
            const result = yield service.cancelBooking('BK001', 'Customer requested');
            expect(result).toBe(true);
            expect(mockDatabase.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE bookings'), expect.arrayContaining(['BK001']));
        }));
        it('should return false if booking not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });
            const result = yield service.cancelBooking('INVALID', 'Customer requested');
            expect(result).toBe(false);
        }));
    });
    describe('refundBooking', () => {
        it('should refund a booking', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });
            const result = yield service.refundBooking('BK001', 450.00, 'Service issues');
            expect(result).toBe(true);
            expect(mockDatabase.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE bookings'), expect.arrayContaining(['BK001']));
        }));
        it('should return false if booking not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });
            const result = yield service.refundBooking('INVALID', 450.00, 'Service issues');
            expect(result).toBe(false);
        }));
    });
});
