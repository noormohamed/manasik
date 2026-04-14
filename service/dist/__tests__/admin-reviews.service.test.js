"use strict";
/**
 * Admin Reviews Service Tests
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
const admin_reviews_service_1 = require("../services/admin-reviews.service");
describe('AdminReviewsService', () => {
    let service;
    let mockDatabase;
    beforeEach(() => {
        mockDatabase = {
            query: jest.fn(),
        };
        service = new admin_reviews_service_1.AdminReviewsService(mockDatabase);
    });
    describe('getReviews', () => {
        it('should return reviews list with pagination', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield service.getReviews({
                limit: 25,
                offset: 0,
            });
            expect(result.reviews).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.reviews[0].id).toBe('REV001');
        }));
        it('should filter reviews by status', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getReviews({
                status: 'PENDING',
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('status = ?');
            expect(countCall[1]).toContain('PENDING');
        }));
        it('should filter reviews by rating', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getReviews({
                rating: 5,
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('rating = ?');
            expect(countCall[1]).toContain(5);
        }));
        it('should search reviews by keyword', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getReviews({
                search: 'excellent',
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('LIKE ?');
        }));
        it('should filter reviews by date range', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query
                .mockResolvedValueOnce([{ count: 1 }])
                .mockResolvedValueOnce([]);
            yield service.getReviews({
                dateRangeStart: '2024-01-01',
                dateRangeEnd: '2024-01-31',
                limit: 25,
                offset: 0,
            });
            const countCall = mockDatabase.query.mock.calls[0];
            expect(countCall[0]).toContain('created_at >= ?');
            expect(countCall[0]).toContain('created_at <= ?');
        }));
    });
    describe('getReviewDetail', () => {
        it('should return review detail', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield service.getReviewDetail('REV001');
            expect(result).not.toBeNull();
            expect(result === null || result === void 0 ? void 0 : result.id).toBe('REV001');
            expect(result === null || result === void 0 ? void 0 : result.rating).toBe(5);
            expect(result === null || result === void 0 ? void 0 : result.text).toBe('Great hotel, excellent service and clean rooms...');
        }));
        it('should return null if review not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce([]);
            const result = yield service.getReviewDetail('INVALID');
            expect(result).toBeNull();
        }));
    });
    describe('approveReview', () => {
        it('should approve a review', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });
            const result = yield service.approveReview('REV001');
            expect(result).toBe(true);
            expect(mockDatabase.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE reviews'), expect.arrayContaining(['REV001']));
        }));
        it('should return false if review not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });
            const result = yield service.approveReview('INVALID');
            expect(result).toBe(false);
        }));
    });
    describe('rejectReview', () => {
        it('should reject a review', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });
            const result = yield service.rejectReview('REV001', 'Inappropriate language');
            expect(result).toBe(true);
        }));
        it('should return false if review not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });
            const result = yield service.rejectReview('INVALID', 'Inappropriate language');
            expect(result).toBe(false);
        }));
    });
    describe('flagReview', () => {
        it('should flag a review', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });
            const result = yield service.flagReview('REV001', 'Suspicious review pattern');
            expect(result).toBe(true);
        }));
        it('should return false if review not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });
            const result = yield service.flagReview('INVALID', 'Suspicious review pattern');
            expect(result).toBe(false);
        }));
    });
    describe('deleteReview', () => {
        it('should delete a review', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });
            const result = yield service.deleteReview('REV001');
            expect(result).toBe(true);
            expect(mockDatabase.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM reviews'), expect.arrayContaining(['REV001']));
        }));
        it('should return false if review not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });
            const result = yield service.deleteReview('INVALID');
            expect(result).toBe(false);
        }));
    });
});
