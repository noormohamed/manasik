"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hotel = void 0;
/**
 * Hotel represents a hotel property
 * Belongs to a company and has multiple room types
 */
class Hotel {
    constructor() {
        this.starRating = 0;
        this.totalRooms = 0;
        this.images = [];
        this.checkInTime = '14:00';
        this.checkOutTime = '11:00';
        this.averageRating = 0;
        this.totalReviews = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    getId() { return this.id; }
    getCompanyId() { return this.companyId; }
    getAgentId() { return this.agentId; }
    getName() { return this.name; }
    getDescription() { return this.description; }
    getStatus() { return this.status; }
    getLocation() { return this.location; }
    getStarRating() { return this.starRating; }
    getTotalRooms() { return this.totalRooms; }
    getAmenities() { return this.amenities; }
    getImages() { return this.images; }
    getCheckInTime() { return this.checkInTime; }
    getCheckOutTime() { return this.checkOutTime; }
    getCancellationPolicy() { return this.cancellationPolicy; }
    getAverageRating() { return this.averageRating; }
    getTotalReviews() { return this.totalReviews; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    setName(name) {
        if (!name || name.trim().length === 0)
            throw new Error('Hotel name cannot be empty');
        this.name = name;
        return this.touch();
    }
    setDescription(description) {
        this.description = description;
        return this.touch();
    }
    setStatus(status) {
        this.status = status;
        return this.touch();
    }
    setLocation(location) {
        this.location = location;
        return this.touch();
    }
    setStarRating(rating) {
        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            throw new Error('Star rating must be between 0 and 5');
        }
        this.starRating = rating;
        return this.touch();
    }
    setTotalRooms(total) {
        if (!Number.isInteger(total) || total < 0)
            throw new Error('Total rooms must be >= 0');
        this.totalRooms = total;
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
    setCheckInTime(time) {
        if (!/^\d{2}:\d{2}$/.test(time))
            throw new Error('Invalid time format. Use HH:mm');
        this.checkInTime = time;
        return this.touch();
    }
    setCheckOutTime(time) {
        if (!/^\d{2}:\d{2}$/.test(time))
            throw new Error('Invalid time format. Use HH:mm');
        this.checkOutTime = time;
        return this.touch();
    }
    setCancellationPolicy(policy) {
        this.cancellationPolicy = policy;
        return this.touch();
    }
    updateRating(newRating) {
        this.totalReviews++;
        this.averageRating = (this.averageRating * (this.totalReviews - 1) + newRating) / this.totalReviews;
        return this.touch();
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    toJSON() {
        return {
            id: this.id,
            companyId: this.companyId,
            agentId: this.agentId,
            name: this.name,
            description: this.description,
            status: this.status,
            location: this.location,
            starRating: this.starRating,
            totalRooms: this.totalRooms,
            amenities: this.amenities,
            images: this.images,
            checkInTime: this.checkInTime,
            checkOutTime: this.checkOutTime,
            cancellationPolicy: this.cancellationPolicy,
            averageRating: this.averageRating,
            totalReviews: this.totalReviews,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    static create(params) {
        var _a;
        const hotel = new Hotel();
        hotel.id = params.id;
        hotel.companyId = params.companyId;
        hotel.agentId = params.agentId;
        hotel.name = params.name;
        hotel.description = params.description;
        hotel.location = params.location;
        hotel.amenities = (_a = params.amenities) !== null && _a !== void 0 ? _a : {};
        hotel.status = 'DRAFT';
        hotel.createdAt = new Date();
        hotel.updatedAt = new Date();
        return hotel;
    }
}
exports.Hotel = Hotel;
