"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelReview = void 0;
const base_review_1 = require("../../../models/review/base-review");
/**
 * HotelReview extends BaseReview with hotel-specific criteria
 */
class HotelReview extends base_review_1.BaseReview {
    validate() {
        if (!this.criteria) {
            throw new Error('Review criteria are required');
        }
        const criteria = this.criteria;
        const requiredFields = ['cleanliness', 'comfort', 'service', 'amenities', 'valueForMoney', 'location'];
        for (const field of requiredFields) {
            const value = criteria[field];
            if (typeof value !== 'number' || value < 1 || value > 5) {
                throw new Error(`${field} must be a number between 1 and 5`);
            }
        }
        return true;
    }
    getAverageCriteriaRating() {
        const criteria = this.criteria;
        const values = Object.values(criteria).filter(v => typeof v === 'number');
        if (values.length === 0)
            return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    getHotelCriteria() {
        return this.criteria;
    }
    static create(params) {
        const review = new HotelReview();
        review.id = params.id;
        review.bookingId = params.bookingId;
        review.companyId = params.companyId;
        review.customerId = params.customerId;
        review.serviceType = 'HOTEL';
        review.rating = params.rating;
        review.title = params.title;
        review.comment = params.comment;
        review.criteria = params.criteria;
        review.status = 'PENDING';
        review.verified = false;
        review.createdAt = new Date();
        review.updatedAt = new Date();
        review.validate();
        return review;
    }
    static fromJSON(data) {
        return HotelReview.create({
            id: data.id,
            bookingId: data.bookingId,
            companyId: data.companyId,
            customerId: data.customerId,
            rating: data.rating,
            title: data.title,
            comment: data.comment,
            criteria: data.criteria,
        });
    }
}
exports.HotelReview = HotelReview;
