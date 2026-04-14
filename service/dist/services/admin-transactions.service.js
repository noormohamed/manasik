"use strict";
/**
 * Admin Transactions Service
 * Handles transaction management operations for the admin panel
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
exports.createAdminTransactionsService = exports.AdminTransactionsService = void 0;
class AdminTransactionsService {
    constructor(database) {
        this.database = database;
    }
    /**
     * Get transactions list with pagination, search, and filtering
     */
    getTransactions(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let query = `
        SELECT 
          t.id,
          t.user_id as userId,
          CONCAT(u.first_name, ' ', u.last_name) as userName,
          u.email as userEmail,
          t.type,
          t.amount,
          t.currency,
          t.created_at as date,
          t.status,
          t.booking_id as bookingId
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
      `;
                const params = [];
                // Search filter
                if (filter.search) {
                    query += ` AND (t.id LIKE ? OR u.email LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR t.booking_id LIKE ?)`;
                    const searchTerm = `%${filter.search}%`;
                    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
                // Type filter
                if (filter.type) {
                    query += ` AND t.type = ?`;
                    params.push(filter.type);
                }
                // Status filter
                if (filter.status) {
                    query += ` AND t.status = ?`;
                    params.push(filter.status);
                }
                // Date range filter
                if (filter.dateRangeStart) {
                    query += ` AND t.created_at >= ?`;
                    params.push(filter.dateRangeStart);
                }
                if (filter.dateRangeEnd) {
                    query += ` AND t.created_at <= ?`;
                    params.push(filter.dateRangeEnd);
                }
                // Amount range filter
                if (filter.amountRangeMin !== undefined) {
                    query += ` AND t.amount >= ?`;
                    params.push(filter.amountRangeMin);
                }
                if (filter.amountRangeMax !== undefined) {
                    query += ` AND t.amount <= ?`;
                    params.push(filter.amountRangeMax);
                }
                // Currency filter
                if (filter.currency) {
                    query += ` AND t.currency = ?`;
                    params.push(filter.currency);
                }
                // Get total count
                const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM');
                const countResult = yield this.database.query(countQuery, params);
                const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                // Add sorting and pagination
                query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
                params.push(filter.limit, filter.offset);
                const transactions = yield this.database.query(query, params);
                return {
                    transactions,
                    total,
                };
            }
            catch (error) {
                // If transactions table doesn't exist, return empty list
                if (error.message && error.message.includes('transactions')) {
                    return {
                        transactions: [],
                        total: 0,
                    };
                }
                throw error;
            }
        });
    }
    /**
     * Get transaction detail
     */
    getTransactionDetail(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT 
        t.*,
        CONCAT(u.first_name, ' ', u.last_name) as userName,
        u.email as userEmail
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `;
            const results = yield this.database.query(query, [transactionId]);
            if (results.length === 0) {
                return null;
            }
            const transaction = results[0];
            return {
                id: transaction.id,
                userId: transaction.user_id,
                userName: transaction.userName,
                userEmail: transaction.userEmail,
                type: transaction.type,
                amount: transaction.amount,
                currency: transaction.currency,
                date: transaction.created_at,
                status: transaction.status,
                bookingId: transaction.booking_id,
                paymentMethod: transaction.payment_method,
                gatewayResponse: transaction.gateway_response ? JSON.parse(transaction.gateway_response) : null,
                dispute: transaction.dispute_reason ? {
                    reason: transaction.dispute_reason,
                    amount: transaction.dispute_amount,
                } : null,
            };
        });
    }
    /**
     * Mark a transaction as disputed
     */
    disputeTransaction(transactionId, reason, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE transactions 
      SET status = 'DISPUTED', dispute_reason = ?, dispute_amount = ?, updated_at = NOW()
      WHERE id = ?
    `;
            const result = yield this.database.query(query, [reason, amount, transactionId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Get transaction by ID
     */
    getTransactionById(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * FROM transactions WHERE id = ?
    `;
            const results = yield this.database.query(query, [transactionId]);
            return results.length > 0 ? results[0] : null;
        });
    }
}
exports.AdminTransactionsService = AdminTransactionsService;
const createAdminTransactionsService = (database) => {
    return new AdminTransactionsService(database);
};
exports.createAdminTransactionsService = createAdminTransactionsService;
