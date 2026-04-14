/**
 * Admin Users Management Service
 */

import { Database } from '../database/connection';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  registered_at: Date;
  last_login_at?: Date;
  booking_count?: number;
  total_spent?: number;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export class AdminUsersService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Get users list with filtering and pagination
   */
  async getUsers(filter: UserFilter): Promise<{ users: AdminUser[]; total: number }> {
    try {
      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

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
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.count || 0;

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

      const users = await this.db.query(query, params);

      return {
        users: users.map((u: any) => ({
          ...u,
          status: u.status ? 'ACTIVE' : 'INACTIVE',
        })),
        total,
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      // Return empty list on error
      return { users: [], total: 0 };
    }
  }

  /**
   * Get user detail with related data
   */
  async getUserDetail(userId: number): Promise<any> {
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

    const users = await this.db.query(userQuery, [userId]);

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

    const bookings = await this.db.query(bookingsQuery, [userId]);

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

    const reviews = await this.db.query(reviewsQuery, [userId]);

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

    const aggregates = await this.db.query(aggregateQuery, [userId]);

    return {
      ...user,
      status: user.status ? 'ACTIVE' : 'INACTIVE',
      bookings: {
        total: Number(aggregates[0].booking_count),
        recent: bookings,
      },
      reviews: {
        total: Number(aggregates[0].review_count),
        averageRating: Number(aggregates[0].average_rating),
        recent: reviews,
      },
      transactions: {
        total: 0,
        totalSpent: 0,
        recent: [],
      },
    };
  }

  /**
   * Suspend a user
   */
  async suspendUser(userId: number, reason: string): Promise<boolean> {
    const query = `
      UPDATE users
      SET is_active = 0, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.db.query(query, [userId]);
    return result.affectedRows > 0;
  }

  /**
   * Reactivate a user
   */
  async reactivateUser(userId: number): Promise<boolean> {
    const query = `
      UPDATE users
      SET is_active = 1, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.db.query(query, [userId]);
    return result.affectedRows > 0;
  }

  /**
   * Reset user password
   */
  async resetPassword(userId: number): Promise<boolean> {
    // In a real implementation, this would generate a reset token and send an email
    // For now, we just return true to indicate the action was logged
    return true;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<AdminUser | null> {
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

    const users = await this.db.query(query, [userId]);

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    return {
      ...user,
      status: user.status ? 'ACTIVE' : 'INACTIVE',
    };
  }
}

export const createAdminUsersService = (database: Database) => {
  return new AdminUsersService(database);
};
