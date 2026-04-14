"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRateEntity = void 0;
class RoomRateEntity {
    // ---- Getters
    getId() { return this.id; }
    getListingId() { return this.listingId; }
    getRoomTypeId() { return this.roomTypeId; }
    getCurrency() { return this.currency; }
    getMonth() { return this.month; }
    getDate() { return this.date; }
    getPricePerNight() { return this.pricePerNight; }
    getIsBlocked() { return this.isBlocked; }
    getReason() { return this.reason; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    // ---- Setters
    setCurrency(currency) {
        this.currency = currency;
        return this.touch();
    }
    setMonth(month) {
        // "YYYY-MM"
        if (!/^\d{4}-\d{2}$/.test(month))
            throw new Error(`Invalid month: ${month}`);
        this.month = month;
        return this.touch();
    }
    setDate(date) {
        // undefined = monthly rate, defined = date override
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
            throw new Error(`Invalid date: ${date}`);
        this.date = date;
        return this.touch();
    }
    setPricePerNight(amount) {
        if (!Number.isFinite(amount) || amount < 0)
            throw new Error("pricePerNight must be >= 0");
        this.pricePerNight = amount;
        return this.touch();
    }
    setBlocked(isBlocked, reason) {
        this.isBlocked = Boolean(isBlocked);
        this.reason = (reason === null || reason === void 0 ? void 0 : reason.trim()) || undefined;
        return this.touch();
    }
    // ---- Convenience
    isMonthlyRate() {
        return !this.date;
    }
    isDateOverride() {
        return Boolean(this.date);
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    // Factory
    static create(params) {
        var _a;
        const e = new RoomRateEntity();
        e.id = params.id;
        e.listingId = params.listingId;
        e.roomTypeId = params.roomTypeId;
        e.currency = params.currency;
        if (!/^\d{4}-\d{2}$/.test(params.month))
            throw new Error(`Invalid month: ${params.month}`);
        e.month = params.month;
        if (params.date && !/^\d{4}-\d{2}-\d{2}$/.test(params.date))
            throw new Error(`Invalid date: ${params.date}`);
        e.date = params.date;
        if (!Number.isFinite(params.pricePerNight) || params.pricePerNight < 0) {
            throw new Error("pricePerNight must be >= 0");
        }
        e.pricePerNight = params.pricePerNight;
        e.isBlocked = Boolean(params.isBlocked);
        e.reason = ((_a = params.reason) === null || _a === void 0 ? void 0 : _a.trim()) || undefined;
        e.createdAt = new Date();
        e.updatedAt = new Date();
        return e;
    }
}
exports.RoomRateEntity = RoomRateEntity;
