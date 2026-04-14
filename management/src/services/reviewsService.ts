/**
 * Reviews Service
 * Handles API calls for reviews management
 */

import { api } from '@/lib/api';

export interface ReviewListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  rating?: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  serviceType?: string;
}

export interface Review {
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

export interface ReviewDetail extends Review {
  bookingId: string;
  companyId: string;
  text: string;
  criteria?: any;
  moderationNotes?: string;
  isVerified: boolean;
}

export interface ReviewListResponse {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewDetailResponse {
  success: boolean;
  data: ReviewDetail;
}

export const reviewsService = {
  /**
   * Get reviews list
   */
  async getReviews(params: ReviewListParams): Promise<ReviewListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.dateRangeStart) queryParams.append('dateRangeStart', params.dateRangeStart);
    if (params.dateRangeEnd) queryParams.append('dateRangeEnd', params.dateRangeEnd);
    if (params.serviceType) queryParams.append('serviceType', params.serviceType);

    return await api.get(`/api/admin/reviews?${queryParams.toString()}`);
  },

  /**
   * Get review detail
   */
  async getReviewDetail(reviewId: string): Promise<ReviewDetailResponse> {
    return await api.get(`/api/admin/reviews/${reviewId}`);
  },

  /**
   * Approve a review
   */
  async approveReview(reviewId: string): Promise<ReviewDetailResponse> {
    return await api.post(`/api/admin/reviews/${reviewId}/approve`, {});
  },

  /**
   * Reject a review
   */
  async rejectReview(reviewId: string, reason: string): Promise<ReviewDetailResponse> {
    return await api.post(`/api/admin/reviews/${reviewId}/reject`, {
      reason,
    });
  },

  /**
   * Flag a review
   */
  async flagReview(reviewId: string, reason: string): Promise<ReviewDetailResponse> {
    return await api.post(`/api/admin/reviews/${reviewId}/flag`, {
      reason,
    });
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, reason: string): Promise<{ success: boolean; message: string }> {
    return await api.post(`/api/admin/reviews/${reviewId}/delete`, {
      reason,
    });
  },
};
