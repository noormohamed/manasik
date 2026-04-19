/**
 * Admin Transactions Service
 * Handles transaction management operations for the admin panel
 */

import { Database } from '../database/connection';

export interface TransactionFilter {
  search?: string;
  type?: string;
  status?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  amountRangeMin?: number;
  amountRangeMax?: number;
  currency?: string;
  limit: number;
  offset: number;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  bookingId?: string;
}

export interface TransactionDetail extends AdminTransaction {
  paymentMethod?: string;
  gatewayResponse?: any;
  dispute?: any;
}

export class AdminTransactionsService {
  constructor(private database: Database) {}

  /**
   * Get transactions list with pagination, search, and filtering
   */
  async getTransactions(filter: TransactionFilter): Promise<{ transactions: AdminTransaction[]; total: number }> {
    try {
      let query = `
        SELECT 
          p.id,
          p.customer_id as userId,
          COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Guest') as userName,
          COALESCE(u.email, 'N/A') as userEmail,
          'PAYMENT' as type,
          p.amount,
          p.currency,
          p.created_at as date,
          p.status,
          p.booking_id as bookingId
        FROM payments p
        LEFT JOIN users u ON p.customer_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];

      // Search filter
      if (filter.search) {
        query += ` AND (p.id LIKE ? OR u.email LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR p.booking_id LIKE ?)`;
        const searchTerm = `%${filter.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Type filter - payments table doesn't have type, skip this filter
      // if (filter.type) { ... }

      // Status filter
      if (filter.status) {
        query += ` AND p.status = ?`;
        params.push(filter.status);
      }

      // Date range filter
      if (filter.dateRangeStart) {
        query += ` AND p.created_at >= ?`;
        params.push(filter.dateRangeStart);
      }
      if (filter.dateRangeEnd) {
        query += ` AND p.created_at <= ?`;
        params.push(filter.dateRangeEnd);
      }

      // Amount range filter
      if (filter.amountRangeMin !== undefined) {
        query += ` AND p.amount >= ?`;
        params.push(filter.amountRangeMin);
      }
      if (filter.amountRangeMax !== undefined) {
        query += ` AND p.amount <= ?`;
        params.push(filter.amountRangeMax);
      }

      // Currency filter
      if (filter.currency) {
        query += ` AND p.currency = ?`;
        params.push(filter.currency);
      }

      // Get total count (use a copy of params for count query)
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        'SELECT COUNT(*) as count FROM'
      );
      const countResult = await this.database.query(countQuery, [...params]);
      const total = countResult[0]?.count || 0;

      // Add sorting and pagination
      // Note: Using string interpolation for LIMIT/OFFSET because MySQL prepared statements
      // have issues with these clauses. Values are validated as integers for safety.
      const limitVal = parseInt(String(filter.limit), 10);
      const offsetVal = parseInt(String(filter.offset), 10);
      
      if (isNaN(limitVal) || isNaN(offsetVal) || limitVal < 0 || offsetVal < 0) {
        throw new Error('Invalid pagination parameters');
      }
      
      query += ` ORDER BY p.created_at DESC LIMIT ${limitVal} OFFSET ${offsetVal}`;

      const transactions = await this.database.query(query, params);

      return {
        transactions,
        total,
      };
    } catch (error: any) {
      // If payments table doesn't exist, return empty list
      if (error.message && error.message.includes('payments')) {
        return {
          transactions: [],
          total: 0,
        };
      }
      throw error;
    }
  }

  /**
   * Get transaction detail
   */
  async getTransactionDetail(transactionId: string): Promise<TransactionDetail | null> {
    const query = `
      SELECT 
        p.*,
        COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Guest') as userName,
        COALESCE(u.email, 'N/A') as userEmail
      FROM payments p
      LEFT JOIN users u ON p.customer_id = u.id
      WHERE p.id = ?
    `;

    const results = await this.database.query(query, [transactionId]);

    if (results.length === 0) {
      return null;
    }

    const transaction = results[0];

    return {
      id: transaction.id,
      userId: transaction.customer_id,
      userName: transaction.userName,
      userEmail: transaction.userEmail,
      type: 'PAYMENT',
      amount: transaction.amount,
      currency: transaction.currency,
      date: transaction.created_at,
      status: transaction.status,
      bookingId: transaction.booking_id,
      paymentMethod: 'card',
      gatewayResponse: transaction.metadata ? JSON.parse(transaction.metadata) : null,
      dispute: null,
    };
  }

  /**
   * Mark a transaction as disputed
   */
  async disputeTransaction(transactionId: string, reason: string, amount: number): Promise<boolean> {
    const query = `
      UPDATE transactions 
      SET status = 'DISPUTED', dispute_reason = ?, dispute_amount = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.database.query(query, [reason, amount, transactionId]);
    return result.affectedRows > 0;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<any> {
    const query = `
      SELECT * FROM payments WHERE id = ?
    `;

    const results = await this.database.query(query, [transactionId]);
    return results.length > 0 ? results[0] : null;
  }
}

export const createAdminTransactionsService = (database: Database): AdminTransactionsService => {
  return new AdminTransactionsService(database);
};
