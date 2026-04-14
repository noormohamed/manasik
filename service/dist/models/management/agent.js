"use strict";
/**
 * Agent represents a service provider (hotel owner, taxi firm owner, etc.)
 * Agents belong to a company and manage their own listings/services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
class Agent {
    constructor() {
        this.commissionRate = 0; // Percentage commission
        this.totalBookings = 0;
        this.totalRevenue = 0;
        this.averageRating = 0;
        this.totalReviews = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    // Getters
    getId() { return this.id; }
    getUserId() { return this.userId; }
    getCompanyId() { return this.companyId; }
    getServiceType() { return this.serviceType; }
    getName() { return this.name; }
    getEmail() { return this.email; }
    getPhone() { return this.phone; }
    getStatus() { return this.status; }
    getCommissionRate() { return this.commissionRate; }
    getTotalBookings() { return this.totalBookings; }
    getTotalRevenue() { return this.totalRevenue; }
    getAverageRating() { return this.averageRating; }
    getTotalReviews() { return this.totalReviews; }
    getBankDetails() { return this.bankDetails; }
    getDocuments() { return this.documents; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    // Setters
    setStatus(status) {
        this.status = status;
        return this.touch();
    }
    setCommissionRate(rate) {
        if (rate < 0 || rate > 100)
            throw new Error('Commission rate must be between 0 and 100');
        this.commissionRate = rate;
        return this.touch();
    }
    setBankDetails(details) {
        this.bankDetails = details;
        return this.touch();
    }
    setDocuments(documents) {
        this.documents = documents;
        return this.touch();
    }
    /**
     * Update statistics after a booking
     */
    recordBooking(revenue) {
        this.totalBookings++;
        this.totalRevenue += revenue;
        return this.touch();
    }
    /**
     * Update rating after a review
     */
    updateRating(newRating) {
        this.totalReviews++;
        this.averageRating = (this.averageRating * (this.totalReviews - 1) + newRating) / this.totalReviews;
        return this.touch();
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    static create(params) {
        var _a;
        const agent = new Agent();
        agent.id = params.id;
        agent.userId = params.userId;
        agent.companyId = params.companyId;
        agent.serviceType = params.serviceType;
        agent.name = params.name;
        agent.email = params.email;
        agent.phone = params.phone;
        agent.status = 'PENDING';
        agent.commissionRate = (_a = params.commissionRate) !== null && _a !== void 0 ? _a : 0;
        agent.createdAt = new Date();
        agent.updatedAt = new Date();
        return agent;
    }
}
exports.Agent = Agent;
