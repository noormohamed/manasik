/**
 * Admin Transactions Service Tests
 */

import { AdminTransactionsService } from '../services/admin-transactions.service';

describe('AdminTransactionsService', () => {
  let service: AdminTransactionsService;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
    };
    service = new AdminTransactionsService(mockDatabase);
  });

  describe('getTransactions', () => {
    it('should return transactions list with pagination', async () => {
      const mockTransactions = [
        {
          id: 'TXN001',
          userId: 'USER001',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          type: 'PAYMENT',
          amount: 450.00,
          currency: 'USD',
          date: '2024-01-15T11:00:00Z',
          status: 'COMPLETED',
          bookingId: 'BK001',
        },
      ];

      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }]) // count query
        .mockResolvedValueOnce(mockTransactions); // data query

      const result = await service.getTransactions({
        limit: 25,
        offset: 0,
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.transactions[0].id).toBe('TXN001');
    });

    it('should filter transactions by type', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getTransactions({
        type: 'PAYMENT',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('type = ?');
      expect(countCall[1]).toContain('PAYMENT');
    });

    it('should filter transactions by status', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getTransactions({
        status: 'COMPLETED',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('status = ?');
      expect(countCall[1]).toContain('COMPLETED');
    });

    it('should search transactions by ID', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getTransactions({
        search: 'TXN001',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('LIKE ?');
    });

    it('should filter transactions by date range', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getTransactions({
        dateRangeStart: '2024-01-01',
        dateRangeEnd: '2024-01-31',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('created_at >= ?');
      expect(countCall[0]).toContain('created_at <= ?');
    });

    it('should filter transactions by amount range', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getTransactions({
        amountRangeMin: 100,
        amountRangeMax: 500,
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('amount >= ?');
      expect(countCall[0]).toContain('amount <= ?');
    });

    it('should filter transactions by currency', async () => {
      mockDatabase.query
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getTransactions({
        currency: 'USD',
        limit: 25,
        offset: 0,
      });

      const countCall = mockDatabase.query.mock.calls[0];
      expect(countCall[0]).toContain('currency = ?');
      expect(countCall[1]).toContain('USD');
    });
  });

  describe('getTransactionDetail', () => {
    it('should return transaction detail', async () => {
      const mockTransaction = {
        id: 'TXN001',
        user_id: 'USER001',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        type: 'PAYMENT',
        amount: 450.00,
        currency: 'USD',
        created_at: '2024-01-15T11:00:00Z',
        status: 'COMPLETED',
        booking_id: 'BK001',
        payment_method: 'CREDIT_CARD',
        gateway_response: null,
        dispute_reason: null,
        dispute_amount: null,
      };

      mockDatabase.query.mockResolvedValueOnce([mockTransaction]);

      const result = await service.getTransactionDetail('TXN001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('TXN001');
      expect(result?.amount).toBe(450.00);
      expect(result?.status).toBe('COMPLETED');
    });

    it('should return null if transaction not found', async () => {
      mockDatabase.query.mockResolvedValueOnce([]);

      const result = await service.getTransactionDetail('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('disputeTransaction', () => {
    it('should mark transaction as disputed', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await service.disputeTransaction('TXN001', 'Unauthorized charge', 450.00);

      expect(result).toBe(true);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE transactions'),
        expect.arrayContaining(['Unauthorized charge', 450.00, 'TXN001'])
      );
    });

    it('should return false if transaction not found', async () => {
      mockDatabase.query.mockResolvedValueOnce({ affectedRows: 0 });

      const result = await service.disputeTransaction('INVALID', 'Unauthorized charge', 450.00);

      expect(result).toBe(false);
    });
  });
});
