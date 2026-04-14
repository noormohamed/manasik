"use strict";
/**
 * Base review class - extensible foundation for all review types
 * Each service type can have reviews with different criteria
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseReview = void 0;
class BaseReview {
    constructor() {
        this.verified = false; // Verified purchase
        this.helpful = 0; // Helpful count
    }
    // Getters
    getId() { return this.id; }
    getBookingId() { return this.bookingId; }
    getCompanyId() { return this.companyId; }
    getCustomerId() { return this.customerId; }
    getServiceType() { return this.serviceType; }
    getRating() { return this.rating; }
    getTitle() { return this.title; }
    getComment() { return this.comment; }
    getCriteria() { return this.criteria; }
    getStatus() { return this.status; }
    isVerified() { return this.verified; }
    getHelpful() { return this.helpful; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    // Setters
    setRating(rating) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new Error('rating must be between 1 and 5');
        }
        this.rating = rating;
        return this.touch();
    }
    setTitle(title) {
        if (!title || title.trim().length === 0)
            throw new Error('title cannot be empty');
        this.title = title;
        return this.touch();
    }
    setComment(comment) {
        if (!comment || comment.trim().length === 0)
            throw new Error('comment cannot be empty');
        this.comment = comment;
        return this.touch();
    }
    setCriteria(criteria) {
        this.criteria = criteria;
        return this.touch();
    }
    setStatus(status) {
        this.status = status;
        return this.touch();
    }
    setVerified(verified) {
        this.verified = verified;
        return this.touch();
    }
    incrementHelpful() {
        this.helpful++;
        return this.touch();
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    /**
     * Convert to JSON for storage/transmission
     */
    toJSON() {
        return {
            id: this.id,
            bookingId: this.bookingId,
            companyId: this.companyId,
            customerId: this.customerId,
            serviceType: this.serviceType,
            rating: this.rating,
            title: this.title,
            comment: this.comment,
            criteria: this.criteria,
            status: this.status,
            verified: this.verified,
            helpful: this.helpful,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    /**
     * Create from JSON - override in subclasses
     */
    static fromJSON(data) {
        throw new Error('fromJSON must be implemented in subclass');
    }
}
exports.BaseReview = BaseReview;
