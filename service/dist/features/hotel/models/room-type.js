"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomType = void 0;
/**
 * RoomType represents a category of rooms in a hotel
 */
class RoomType {
    constructor() {
        this.capacity = 1;
        this.totalRooms = 0;
        this.availableRooms = 0;
        this.currency = 'USD';
        this.images = [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    getId() { return this.id; }
    getHotelId() { return this.hotelId; }
    getName() { return this.name; }
    getDescription() { return this.description; }
    getCapacity() { return this.capacity; }
    getTotalRooms() { return this.totalRooms; }
    getAvailableRooms() { return this.availableRooms; }
    getBasePrice() { return this.basePrice; }
    getCurrency() { return this.currency; }
    getAmenities() { return this.amenities; }
    getImages() { return this.images; }
    getStatus() { return this.status; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    setName(name) {
        if (!name || name.trim().length === 0)
            throw new Error('Room type name cannot be empty');
        this.name = name;
        return this.touch();
    }
    setDescription(description) {
        this.description = description;
        return this.touch();
    }
    setCapacity(capacity) {
        if (!Number.isInteger(capacity) || capacity < 1)
            throw new Error('Capacity must be >= 1');
        this.capacity = capacity;
        return this.touch();
    }
    setTotalRooms(total) {
        if (!Number.isInteger(total) || total < 0)
            throw new Error('Total rooms must be >= 0');
        this.totalRooms = total;
        this.availableRooms = Math.min(this.availableRooms, total);
        return this.touch();
    }
    setAvailableRooms(available) {
        if (!Number.isInteger(available) || available < 0 || available > this.totalRooms) {
            throw new Error('Available rooms must be between 0 and total rooms');
        }
        this.availableRooms = available;
        return this.touch();
    }
    setBasePrice(price) {
        if (!Number.isFinite(price) || price < 0)
            throw new Error('Base price must be >= 0');
        this.basePrice = price;
        return this.touch();
    }
    setAmenities(amenities) {
        this.amenities = amenities;
        return this.touch();
    }
    addImage(imageUrl) {
        this.images.push(imageUrl);
        return this.touch();
    }
    removeImage(imageUrl) {
        this.images = this.images.filter(img => img !== imageUrl);
        return this.touch();
    }
    setStatus(status) {
        this.status = status;
        return this.touch();
    }
    reserveRooms(count) {
        if (count > this.availableRooms)
            return false;
        this.availableRooms -= count;
        this.touch();
        return true;
    }
    releaseRooms(count) {
        this.availableRooms = Math.min(this.availableRooms + count, this.totalRooms);
        return this.touch();
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    static create(params) {
        var _a, _b;
        const roomType = new RoomType();
        roomType.id = params.id;
        roomType.hotelId = params.hotelId;
        roomType.name = params.name;
        roomType.description = params.description;
        roomType.capacity = params.capacity;
        roomType.totalRooms = params.totalRooms;
        roomType.availableRooms = params.totalRooms;
        roomType.basePrice = params.basePrice;
        roomType.currency = (_a = params.currency) !== null && _a !== void 0 ? _a : 'USD';
        roomType.amenities = (_b = params.amenities) !== null && _b !== void 0 ? _b : {};
        roomType.status = 'ACTIVE';
        roomType.createdAt = new Date();
        roomType.updatedAt = new Date();
        return roomType;
    }
}
exports.RoomType = RoomType;
