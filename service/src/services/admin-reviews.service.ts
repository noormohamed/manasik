/**
 * Admin Reviews Service
 * Handles review management operations for the admin panel
 */

import { Database } from '../database/connection';

export interface ReviewFilter {
  search?: string;
  status?: string;
  rating?: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  serviceType?: string;
  limit: number;
  offset: number;
}

export interface AdminReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  serviceType: string;
  serviceName: string;
  rating: number;
  reviewDate: string;
  status: string;
  preview: string;
}

export interface ReviewDetail extends AdminReview {
  bookingId: string;
  companyId: string;
  text: string;
  criteria?: any;
  moderationNotes?: string;
  isVerified: boolean;
}

export class AdminReviewsService {
  constructor(private database: Database) {}

  /**
   * Get reviews list with pagination, search, and filtering
   */
  async getReviews(filter: ReviewFilter): Promise<{ reviews: AdminReview[]; total: number }> {
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

    const params: any[] = [];
    let hasWhere = false;

    // Search filter
    if (filter.search) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
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
      } else {
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
      } else {
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
      } else {
        query += ` AND `;
      }
      query += `r.created_at >= ?`;
      params.push(filter.dateRangeStart);
    }
    if (filter.dateRangeEnd) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
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
      } else {
        query += ` AND `;
      }
      query += `r.service_type = ?`;
      params.push(filter.serviceType);
    }

    // Get total count (use a copy of params before adding pagination)
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as count FROM'
    );
    const countResult = await this.database.query(countQuery, [...params]);
    const total = countResult[0]?.count || 0;

    // Add sorting and pagination (LIMIT and OFFSET must be literals, not parameters)
    query += ` ORDER BY r.created_at DESC LIMIT ${filter.limit} OFFSET ${filter.offset}`;

    const reviews = await this.database.query(query, params);

    return {
      reviews,
      total,
    };
  }

  /**
   * Get review detail
   */
  async getReviewDetail(reviewId: string): Promise<ReviewDetail | null> {
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

    const results = await this.database.query(query, [reviewId]);

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
  }

  /**
   * Approve a review
   */
  async approveReview(reviewId: string): Promise<boolean> {
    const query = `
      UPDATE reviews 
      SET status = 'APPROVED', updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.database.query(query, [reviewId]);
    return result.affectedRows > 0;
  }

  /**
   * Reject a review
   */
  async rejectReview(reviewId: string, reason: string): Promise<boolean> {
    const query = `
      UPDATE reviews 
      SET status = 'REJECTED', updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.database.query(query, [reviewId]);
    return result.affectedRows > 0;
  }

  /**
   * Flag a review as inappropriate
   */
  async flagReview(reviewId: string, reason: string): Promise<boolean> {
    const query = `
      UPDATE reviews 
      SET status = 'FLAGGED', updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.database.query(query, [reviewId]);
    return result.affectedRows > 0;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    const query = `
      DELETE FROM reviews WHERE id = ?
    `;

    const result = await this.database.query(query, [reviewId]);
    return result.affectedRows > 0;
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<any> {
    const query = `
      SELECT * FROM reviews WHERE id = ?
    `;

    const results = await this.database.query(query, [reviewId]);
    return results.length > 0 ? results[0] : null;
  }
}

export const createAdminReviewsService = (database: Database): AdminReviewsService => {
  return new AdminReviewsService(database);
};
