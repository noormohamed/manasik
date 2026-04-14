/**
 * Admin Reviews Service Tests
 */

import { AdminReviewsService } from '../services/admin-reviews.service';

describe('AdminReviewsService', () => {
  let service: AdminReviewsService;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
    };
    service = new AdminReviewsService(mockDatabase);
  });

  describe('getReviews', () => {
    it('should return reviews list with pagination', async () => {
      const mockReviews = [
        {
          id: 'REV001',
          reviewerId: 'CUST001',
          reviewerName: 'John Doe',
          reviewerEmail: 'john@example.com',
          serviceType: 'HOTEL',
          serviceName: 'Grand Hotel',
          rating: 5,
          reviewDate: '2024-01-23T15:30:00Z',
          status: 'PENDING',
          preview: 'Great hotel, excellent service...',
        },
      ];

      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }]) // count query
        .mockResolvedValueOnce(mockReviews); // data query

      const result = await service.getReviews({
        limit: 25,
        offset: 0,
      });

      expect(result.reviews).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.reviews[0].id).toBe('REV001');
    });

    it('should filter reviews by status', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getReviews({
        status: 'PENDING',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('status = ?');
      expect(countCall[1]).toContain('PENDING');
    });

    it('should filter reviews by rating', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getReviews({
        rating: 5,
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('rating = ?');
      expect(countCall[1]).toContain(5);
    });

    it('should search reviews by keyword', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getReviews({
        search: 'excellent',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('LIKE ?');
    });

    it('should filter reviews by date range', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getReviews({
        dateRangeStart: '2024-01-01',
        dateRangeEnd: '2024-01-31',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('created_at >= ?');
      expect(countCall[0]).toContain('created_at <= ?');
    });
  });

  describe('getReviewDetail', () => {
    it('should return review detail', async () => {
      const mockReview = {
        id: 'REV001',
        booking_id: 'BK001',
        customer_id: 'CUST001',
        reviewerName: 'John Doe',
        reviewerEmail: 'john@example.com',
        company_id: 'COMP001',
        service_type: 'HOTEL',
        serviceName: 'Grand Hotel',
        rating: 5,
        created_at: '2024-01-23T15:30:00Z',
        status: 'PENDING',
        comment: 'Great hotel, excellent service and clean rooms...',
        criteria: null,
        is_verified: false,
      };

      mockDatabase.query.mockResolvedValueOnce([mockReview]);

      const result = await service.getReviewDetail('REV001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('REV001');
      expect(result?.rating).toBe(5);
      expect(result?.text).toBe('Great hotel, excellent service and clean rooms...');
    });

    it('should return null if review not found', async () => {
      mockDatabase.query.mockResolvedValueOnce([]);

      const result = await service.getReviewDetail('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('approveReview', () => {
    it('should approve a review', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await service.approveReview('REV001');

      expect(result).toBe(true);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reviews'),
        expect.arrayContaining(['REV001'])
      );
    });

    it('should return false if review not found', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });

      const result = await service.approveReview('INVALID');

      expect(result).toBe(false);
    });
  });

  describe('rejectReview', () => {
    it('should reject a review', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await service.rejectReview('REV001', 'Inappropriate language');

      expect(result).toBe(true);
    });

    it('should return false if review not found', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });

      const result = await service.rejectReview('INVALID', 'Inappropriate language');

      expect(result).toBe(false);
    });
  });

  describe('flagReview', () => {
    it('should flag a review', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await service.flagReview('REV001', 'Suspicious review pattern');

      expect(result).toBe(true);
    });

    it('should return false if review not found', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });

      const result = await service.flagReview('INVALID', 'Suspicious review pattern');

      expect(result).toBe(false);
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await service.deleteReview('REV001');

      expect(result).toBe(true);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM reviews'),
        expect.arrayContaining(['REV001'])
      );
    });

    it('should return false if review not found', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });

      const result = await service.deleteReview('INVALID');

      expect(result).toBe(false);
    });
  });
});
