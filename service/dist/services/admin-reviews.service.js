"use strict";
/**
 * Admin Reviews Service
 * Handles review management operations for the admin panel
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
exports.createAdminReviewsService = exports.AdminReviewsService = void 0;
class AdminReviewsService {
    constructor(database) {
        this.database = database;
    }
    /**
     * Get reviews list with pagination, search, and filtering
     */
    getReviews(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let query = `
      SELECT 
        r.id,
        r.customer_id as reviewerId,
        CONCAT(u.first_name, ' ', u.last_name) as reviewerName,
        u.email as reviewerEmail,
        r.service_type as serviceType,
        COALESCE(c.name, 'N/A') as serviceName,
        r.rating,
        r.created_at as reviewDate,
        r.status,
        SUBSTRING(r.comment, 1, 100) as preview
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      LEFT JOIN companies c ON r.company_id = c.id
    `;
            const params = [];
            let hasWhere = false;
            // Search filter
            if (filter.search) {
                if (!hasWhere) {
                    query += ` WHERE `;
                    hasWhere = true;
                }
                else {
                    query += ` AND `;
                }
                query += `(r.id LIKE ? OR u.email LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR c.name LIKE ? OR r.comment LIKE ?)`;
                const searchTerm = `%${filter.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }
            // Status filter
            if (filter.status) {
                if (!hasWhere) {
                    query += ` WHERE `;
                    hasWhere = true;
                }
                else {
                    query += ` AND `;
                }
                query += `r.status = ?`;
                params.push(filter.status);
            }
            // Rating filter
            if (filter.rating) {
                if (!hasWhere) {
                    query += ` WHERE `;
                    hasWhere = true;
                }
                else {
                    query += ` AND `;
                }
                query += `r.rating = ?`;
                params.push(filter.rating);
            }
            // Date range filter
            if (filter.dateRangeStart) {
                if (!hasWhere) {
                    query += ` WHERE `;
                    hasWhere = true;
                }
                else {
                    query += ` AND `;
                }
                query += `r.created_at >= ?`;
                params.push(filter.dateRangeStart);
            }
            if (filter.dateRangeEnd) {
                if (!hasWhere) {
                    query += ` WHERE `;
                    hasWhere = true;
                }
                else {
                    query += ` AND `;
                }
                query += `r.created_at <= ?`;
                params.push(filter.dateRangeEnd);
            }
            // Service type filter
            if (filter.serviceType) {
                if (!hasWhere) {
                    query += ` WHERE `;
                    hasWhere = true;
                }
                else {
                    query += ` AND `;
                }
                query += `r.service_type = ?`;
                params.push(filter.serviceType);
            }
            // Get total count (use a copy of params before adding pagination)
            const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as count FROM');
            const countResult = yield this.database.query(countQuery, [...params]);
            const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
            // Add sorting and pagination (LIMIT and OFFSET must be literals, not parameters)
            query += ` ORDER BY r.created_at DESC LIMIT ${filter.limit} OFFSET ${filter.offset}`;
            const reviews = yield this.database.query(query, params);
            return {
                reviews,
                total,
            };
        });
    }
    /**
     * Get review detail
     */
    getReviewDetail(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as reviewerName,
        u.email as reviewerEmail,
        c.name as serviceName
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN companies c ON r.company_id = c.id
      WHERE r.id = ?
    `;
            const results = yield this.database.query(query, [reviewId]);
            if (results.length === 0) {
                return null;
            }
            const review = results[0];
            return {
                id: review.id,
                bookingId: review.booking_id,
                reviewerId: review.customer_id,
                reviewerName: review.reviewerName,
                reviewerEmail: review.reviewerEmail,
                companyId: review.company_id,
                serviceType: review.service_type,
                serviceName: review.serviceName,
                rating: review.rating,
                reviewDate: review.created_at,
                status: review.status,
                preview: review.comment.substring(0, 100),
                text: review.comment,
                criteria: review.criteria ? JSON.parse(review.criteria) : null,
                isVerified: review.is_verified,
            };
        });
    }
    /**
     * Approve a review
     */
    approveReview(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE reviews 
      SET status = 'APPROVED', updated_at = NOW()
      WHERE id = ?
    `;
            const result = yield this.database.query(query, [reviewId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Reject a review
     */
    rejectReview(reviewId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE reviews 
      SET status = 'REJECTED', updated_at = NOW()
      WHERE id = ?
    `;
            const result = yield this.database.query(query, [reviewId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Flag a review as inappropriate
     */
    flagReview(reviewId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE reviews 
      SET status = 'FLAGGED', updated_at = NOW()
      WHERE id = ?
    `;
            const result = yield this.database.query(query, [reviewId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Delete a review
     */
    deleteReview(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      DELETE FROM reviews WHERE id = ?
    `;
            const result = yield this.database.query(query, [reviewId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Get review by ID
     */
    getReviewById(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * FROM reviews WHERE id = ?
    `;
            const results = yield this.database.query(query, [reviewId]);
            return results.length > 0 ? results[0] : null;
        });
    }
}
exports.AdminReviewsService = AdminReviewsService;
const createAdminReviewsService = (database) => {
    return new AdminReviewsService(database);
};
exports.createAdminReviewsService = createAdminReviewsService;
