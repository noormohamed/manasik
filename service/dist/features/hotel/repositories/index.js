"use strict";
/**
 * Hotel feature repositories
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomTypeRepository = exports.HotelRepository = void 0;
exports.getHotelRepository = getHotelRepository;
exports.getRoomTypeRepository = getRoomTypeRepository;
const hotel_repository_1 = require("./hotel.repository");
const room_type_repository_1 = require("./room-type.repository");
var hotel_repository_2 = require("./hotel.repository");
Object.defineProperty(exports, "HotelRepository", { enumerable: true, get: function () { return hotel_repository_2.HotelRepository; } });
var room_type_repository_2 = require("./room-type.repository");
Object.defineProperty(exports, "RoomTypeRepository", { enumerable: true, get: function () { return room_type_repository_2.RoomTypeRepository; } });
// Singleton instances
let hotelRepository = null;
let roomTypeRepository = null;
function getHotelRepository() {
    if (!hotelRepository) {
        hotelRepository = new hotel_repository_1.HotelRepository();
    }
    return hotelRepository;
}
function getRoomTypeRepository() {
    if (!roomTypeRepository) {
        roomTypeRepository = new room_type_repository_1.RoomTypeRepository();
    }
    return roomTypeRepository;
}
