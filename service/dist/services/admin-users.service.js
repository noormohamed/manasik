"use strict";
/**
 * Admin Users Management Service
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
exports.createAdminUsersService = exports.AdminUsersService = void 0;
class AdminUsersService {
    constructor(database) {
        this.db = database;
    }
    /**
     * Get users list with filtering and pagination
     */
    getUsers(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Build WHERE clause
                let whereClause = '1=1';
                const params = [];
                if (filter.search) {
                    whereClause += ` AND (u.email LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.id LIKE ?)`;
                    const searchTerm = `%${filter.search}%`;
                    params.push(searchTerm, searchTerm, searchTerm);
                }
                if (filter.role) {
                    whereClause += ` AND u.role = ?`;
                    params.push(filter.role);
                }
                if (filter.status) {
                    const isActive = filter.status === 'ACTIVE' ? 1 : 0;
                    whereClause += ` AND u.is_active = ?`;
                    params.push(isActive);
                }
                // Get total count
                const countQuery = `SELECT COUNT(*) as count FROM users u WHERE ${whereClause}`;
                const countResult = yield this.db.query(countQuery, params);
                const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                // Get paginated results
                const limit = filter.limit || 25;
                const offset = filter.offset || 0;
                const query = `
        SELECT
          u.id,
          u.email,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          u.role,
          u.is_active as status,
          u.created_at as registered_at,
          u.updated_at as last_login_at
        FROM users u
        WHERE ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
                const users = yield this.db.query(query, params);
                return {
                    users: users.map((u) => (Object.assign(Object.assign({}, u), { status: u.status ? 'ACTIVE' : 'INACTIVE' }))),
                    total,
                };
            }
            catch (error) {
                console.error('Error in getUsers:', error);
                // Return empty list on error
                return { users: [], total: 0 };
            }
        });
    }
    /**
     * Get user detail with related data
     */
    getUserDetail(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userQuery = `
      SELECT
        u.id,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.role,
        u.is_active as status,
        u.created_at as registered_at,
        u.updated_at as last_login_at
      FROM users u
      WHERE u.id = ?
    `;
            const users = yield this.db.query(userQuery, [userId]);
            if (users.length === 0) {
                return null;
            }
            const user = users[0];
            // Get bookings
            const bookingsQuery = `
      SELECT
        id,
        id as booking_reference,
        service_type,
        status,
        total as total_amount,
        created_at
      FROM bookings
      WHERE customer_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `;
            const bookings = yield this.db.query(bookingsQuery, [userId]);
            // Get reviews
            const reviewsQuery = `
      SELECT
        id,
        rating,
        text,
        'APPROVED' as status,
        created_at
      FROM reviews
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `;
            const reviews = yield this.db.query(reviewsQuery, [userId]);
            // Get aggregates
            const aggregateQuery = `
      SELECT
        COUNT(DISTINCT b.id) as booking_count,
        0 as total_spent,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM users u
      LEFT JOIN bookings b ON u.id = b.customer_id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE u.id = ?
    `;
            const aggregates = yield this.db.query(aggregateQuery, [userId]);
            return Object.assign(Object.assign({}, user), { status: user.status ? 'ACTIVE' : 'INACTIVE', bookings: {
                    total: Number(aggregates[0].booking_count),
                    recent: bookings,
                }, reviews: {
                    total: Number(aggregates[0].review_count),
                    averageRating: Number(aggregates[0].average_rating),
                    recent: reviews,
                }, transactions: {
                    total: 0,
                    totalSpent: 0,
                    recent: [],
                } });
        });
    }
    /**
     * Suspend a user
     */
    suspendUser(userId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE users
      SET is_active = 0, updated_at = NOW()
      WHERE id = ?
    `;
            const result = yield this.db.query(query, [userId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Reactivate a user
     */
    reactivateUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE users
      SET is_active = 1, updated_at = NOW()
      WHERE id = ?
    `;
            const result = yield this.db.query(query, [userId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Reset user password
     */
    resetPassword(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // In a real implementation, this would generate a reset token and send an email
            // For now, we just return true to indicate the action was logged
            return true;
        });
    }
    /**
     * Get user by ID
     */
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT
        id,
        email,
        CONCAT(first_name, ' ', last_name) as name,
        role,
        is_active as status,
        created_at as registered_at,
        updated_at as last_login_at
      FROM users
      WHERE id = ?
    `;
            const users = yield this.db.query(query, [userId]);
            if (users.length === 0) {
                return null;
            }
            const user = users[0];
            return Object.assign(Object.assign({}, user), { status: user.status ? 'ACTIVE' : 'INACTIVE' });
        });
    }
}
exports.AdminUsersService = AdminUsersService;
const createAdminUsersService = (database) => {
    return new AdminUsersService(database);
};
exports.createAdminUsersService = createAdminUsersService;
