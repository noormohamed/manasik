import { apiClient } from '@/lib/api';
import { Transaction, TransactionDetail, PaginatedResponse } from '@/types';

export const transactionsService = {
  async getTransactions(
    page: number = 1,
    limit: number = 25,
    search?: string,
    type?: string,
    status?: string,
    dateRange?: { from: string; to: string },
    amountRange?: { min: number; max: number },
    currency?: string
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (dateRange) {
      params.append('dateRange', `${dateRange.from}:${dateRange.to}`);
    }
    if (amountRange) {
      params.append('amountRange', `${amountRange.min}:${amountRange.max}`);
    }
    if (currency) params.append('currency', currency);

    return apiClient.get(`/api/admin/transactions?${params.toString()}`);
  },

  async getTransactionDetail(id: string): Promise<TransactionDetail> {
    return apiClient.get(`/api/admin/transactions/${id}`);
  },

  async disputeTransaction(
    id: string,
    reason: string,
    amount: number
  ): Promise<{ success: boolean; transaction: Transaction }> {
    return apiClient.post(`/api/admin/transactions/${id}/dispute`, { reason, amount });
  },
};
