"use strict";
/**
 * Hotel service - business logic for hotel operations
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
exports.HotelService = void 0;
const handlers_1 = require("../handlers");
const handlers_2 = require("../handlers");
const handlers_3 = require("../handlers");
const handlers_4 = require("../handlers");
class HotelService {
    constructor() {
        this.hotelHandler = new handlers_1.HotelHandler();
        this.roomTypeHandler = new handlers_2.RoomTypeHandler();
        this.bookingHandler = new handlers_3.HotelBookingHandler();
        this.reviewHandler = new handlers_4.HotelReviewHandler();
    }
    /**
     * Get hotel with all related data
     */
    getHotelWithDetails(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const hotel = yield this.hotelHandler.getHotel(hotelId);
            if (!hotel)
                return null;
            const roomTypes = yield this.roomTypeHandler.listRoomTypes(hotelId);
            const reviews = yield this.reviewHandler.getHotelReviews(hotelId, { status: 'APPROVED' });
            const avgRating = yield this.reviewHandler.getHotelAverageRating(hotelId);
            return {
                hotel: ((_a = hotel.toJSON) === null || _a === void 0 ? void 0 : _a.call(hotel)) || hotel,
                roomTypes: roomTypes.roomTypes,
                reviews: reviews.reviews,
                averageRating: avgRating,
                totalReviews: reviews.total,
            };
        });
    }
    /**
     * Search hotels by criteria
     */
    searchHotels(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement search logic with availability checking
            return [];
        });
    }
    /**
     * Get hotel statistics
     */
    getHotelStats(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const hotel = yield this.hotelHandler.getHotel(hotelId);
            if (!hotel)
                throw new Error('Hotel not found');
            const bookings = yield this.bookingHandler.listBookings({ hotelId });
            const reviews = yield this.reviewHandler.getHotelReviews(hotelId);
            return {
                totalBookings: bookings.total,
                totalReviews: reviews.total,
                averageRating: yield this.reviewHandler.getHotelAverageRating(hotelId),
                totalRooms: ((_a = hotel.getTotalRooms) === null || _a === void 0 ? void 0 : _a.call(hotel)) || 0,
                // TODO: Add more statistics
            };
        });
    }
    /**
     * Get available rooms for date range
     */
    getAvailableRooms(hotelId, checkInDate, checkOutDate, guestCount) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const roomTypes = yield this.roomTypeHandler.listRoomTypes(hotelId);
            const available = [];
            for (const roomType of roomTypes.roomTypes) {
                const isAvailable = yield this.bookingHandler.checkAvailability(((_a = roomType.getId) === null || _a === void 0 ? void 0 : _a.call(roomType)) || '', checkInDate, checkOutDate, 1);
                if (isAvailable && (!guestCount || ((_b = roomType.getCapacity) === null || _b === void 0 ? void 0 : _b.call(roomType)) >= guestCount)) {
                    available.push(roomType);
                }
            }
            return available;
        });
    }
}
exports.HotelService = HotelService;
