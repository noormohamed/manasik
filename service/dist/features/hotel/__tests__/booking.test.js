"use strict";
/**
 * Hotel Booking Tests
 * Tests for customer user creating and managing hotel bookings
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
const user_1 = require("../../../models/user");
const hotel_1 = require("../models/hotel");
const room_type_1 = require("../models/room-type");
const hotel_booking_1 = require("../models/hotel-booking");
const permission_service_1 = require("../../../services/permission.service");
const auth_service_1 = require("../../../services/auth.service");
describe('Hotel Booking - Customer User', () => {
    let customer;
    let hotel;
    let roomType;
    beforeEach(() => {
        customer = new user_1.User('customer-123');
        customer.first_name = 'John';
        customer.last_name = 'Smith';
        customer.email = 'john@example.co.uk';
        customer.role = 'CUSTOMER';
        const location = {
            address: '100 Strand',
            city: 'London',
            state: 'England',
            country: 'United Kingdom',
            zipCode: 'WC2R 0EU',
        };
        hotel = hotel_1.Hotel.create({
            id: 'hotel-123',
            companyId: 'comp-123',
            agentId: 'agent-123',
            name: 'The Savoy London',
            description: 'Luxury 5-star hotel on the Thames',
            location,
        });
        roomType = room_type_1.RoomType.create({
            id: 'room-type-123',
            hotelId: 'hotel-123',
            name: 'Deluxe Thames View Room',
            description: 'Spacious room with king bed and river view',
            capacity: 2,
            totalRooms: 10,
            basePrice: 500,
            currency: 'GBP',
            amenities: {
                wifi: true,
                airConditioning: true,
            },
        });
    });
    describe('Customer Permissions', () => {
        it('should allow customer to create bookings', () => {
            const canCreate = permission_service_1.permissionService.canAccessResource({
                userId: customer.id,
                email: customer.email,
                role: customer.role,
            }, 'booking', 'create');
            expect(canCreate).toBe(true);
        });
        it('should NOT allow customer to manage hotels', () => {
            const canManage = permission_service_1.permissionService.canManageHotels({
                userId: customer.id,
                email: customer.email,
                role: customer.role,
            });
            expect(canManage).toBe(false);
        });
    });
    describe('Hotel Booking Creation', () => {
        it('should create a valid hotel booking with territory and tax', () => {
            const metadata = {
                hotelId: 'hotel-123',
                hotelName: 'The Savoy London',
                roomTypeId: 'room-type-123',
                roomTypeName: 'Deluxe Thames View Room',
                roomCount: 2,
                roomOccupancy: 2,
                checkInDate: '2026-02-15',
                checkOutDate: '2026-02-18',
                guestCount: 4,
                pricePerNight: 500,
                territory: 'GB',
                taxRate: 0.20,
                guestName: 'John Smith',
                guestEmail: 'john@example.co.uk',
            };
            const booking = hotel_booking_1.HotelBooking.create({
                id: 'booking-123',
                companyId: 'comp-123',
                customerId: customer.id,
                currency: 'GBP',
                subtotal: 3000,
                tax: 600,
                total: 3600,
                metadata,
            });
            expect(booking.getId()).toBe('booking-123');
            expect(booking.getCustomerId()).toBe('customer-123');
            expect(booking.getStatus()).toBe('PENDING');
            expect(booking.getTotal()).toBe(3600);
        });
        it('should calculate nights correctly', () => {
            const metadata = {
                hotelId: 'hotel-123',
                hotelName: 'The Savoy London',
                roomTypeId: 'room-type-123',
                roomTypeName: 'Deluxe Thames View Room',
                roomCount: 1,
                roomOccupancy: 2,
                checkInDate: '2026-02-15',
                checkOutDate: '2026-02-18',
                guestCount: 2,
                pricePerNight: 500,
                territory: 'GB',
                taxRate: 0.20,
                guestName: 'John Smith',
                guestEmail: 'john@example.co.uk',
            };
            const booking = hotel_booking_1.HotelBooking.create({
                id: 'booking-123',
                companyId: 'comp-123',
                customerId: customer.id,
                currency: 'GBP',
                subtotal: 1500,
                tax: 300,
                total: 1800,
                metadata,
            });
            expect(booking.getNights()).toBe(3);
        });
        it('should validate room occupancy matches guest count', () => {
            const metadata = {
                hotelId: 'hotel-123',
                hotelName: 'The Savoy London',
                roomTypeId: 'room-type-123',
                roomTypeName: 'Deluxe Thames View Room',
                roomCount: 1,
                roomOccupancy: 2,
                checkInDate: '2026-02-15',
                checkOutDate: '2026-02-18',
                guestCount: 4,
                pricePerNight: 500,
                territory: 'GB',
                taxRate: 0.20,
                guestName: 'John Smith',
                guestEmail: 'john@example.co.uk',
            };
            expect(() => hotel_booking_1.HotelBooking.create({
                id: 'booking-123',
                companyId: 'comp-123',
                customerId: customer.id,
                currency: 'GBP',
                subtotal: 1500,
                tax: 300,
                total: 1800,
                metadata,
            })).toThrow('Selected rooms (1 × 2 capacity) cannot accommodate 4 guests');
        });
        it('should throw error for missing territory', () => {
            const metadata = {
                hotelId: 'hotel-123',
                hotelName: 'The Savoy London',
                roomTypeId: 'room-type-123',
                roomTypeName: 'Deluxe Thames View Room',
                roomCount: 1,
                roomOccupancy: 2,
                checkInDate: '2026-02-15',
                checkOutDate: '2026-02-18',
                guestCount: 2,
                pricePerNight: 500,
                territory: undefined,
                taxRate: 0.20,
                guestName: 'John Smith',
                guestEmail: 'john@example.co.uk',
            };
            expect(() => hotel_booking_1.HotelBooking.create({
                id: 'booking-123',
                companyId: 'comp-123',
                customerId: customer.id,
                currency: 'GBP',
                subtotal: 1500,
                tax: 300,
                total: 1800,
                metadata,
            })).toThrow('Territory is required for tax calculation');
        });
    });
    describe('Room Type Management', () => {
        it('should reserve rooms', () => {
            const reserved = roomType.reserveRooms(3);
            expect(reserved).toBe(true);
            expect(roomType.getAvailableRooms()).toBe(7);
        });
        it('should not reserve more rooms than available', () => {
            const reserved = roomType.reserveRooms(15);
            expect(reserved).toBe(false);
            expect(roomType.getAvailableRooms()).toBe(10);
        });
        it('should release rooms', () => {
            roomType.reserveRooms(5);
            expect(roomType.getAvailableRooms()).toBe(5);
            roomType.releaseRooms(3);
            expect(roomType.getAvailableRooms()).toBe(8);
        });
    });
    describe('Full Booking Workflow', () => {
        it('should complete a full booking workflow', () => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Authenticate
            const { accessToken } = auth_service_1.authService.generateTokens(customer);
            const payload = auth_service_1.authService.verifyAccessToken(accessToken);
            expect(payload === null || payload === void 0 ? void 0 : payload.userId).toBe('customer-123');
            // 2. Check permissions
            const canBook = permission_service_1.permissionService.canAccessResource({ userId: customer.id, email: customer.email, role: customer.role }, 'booking', 'create');
            expect(canBook).toBe(true);
            // 3. Reserve rooms
            const reserved = roomType.reserveRooms(2);
            expect(reserved).toBe(true);
            // 4. Create booking
            const metadata = {
                hotelId: hotel.getId(),
                hotelName: hotel.getName(),
                roomTypeId: roomType.getId(),
                roomTypeName: roomType.getName(),
                roomCount: 2,
                roomOccupancy: 2,
                checkInDate: '2026-02-15',
                checkOutDate: '2026-02-18',
                guestCount: 4,
                pricePerNight: 500,
                territory: 'GB',
                taxRate: 0.20,
                guestName: customer.first_name + ' ' + customer.last_name,
                guestEmail: customer.email,
            };
            const booking = hotel_booking_1.HotelBooking.create({
                id: 'booking-123',
                companyId: 'comp-123',
                customerId: customer.id,
                currency: 'GBP',
                subtotal: 3000,
                tax: 600,
                total: 3600,
                metadata,
            });
            expect(booking.getStatus()).toBe('PENDING');
            expect(booking.getNights()).toBe(3);
            expect(booking.getTotal()).toBe(3600);
        }));
    });
});
