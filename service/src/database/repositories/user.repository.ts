/**
 * User Repository
 */

import { BaseRepository } from '../repository';
import { User } from '../../models/user';
import { RowDataPacket } from 'mysql2/promise';

export interface UserRow extends RowDataPacket {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: string;
  company_id?: string;
  service_type?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    const result = await this.queryOne<UserRow>(query, [email]);
    
    if (!result) return null;
    
    return this.mapRowToUser(result);
  }

  /**
   * Find users by company
   */
  async findByCompany(companyId: string, limit: number = 10, offset: number = 0): Promise<User[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
    const results = await this.query<UserRow>(query, [companyId, limit, offset]);
    
    return results.map(row => this.mapRowToUser(row));
  }

  /**
   * Find users by role
   */
  async findByRole(role: string, limit: number = 10, offset: number = 0): Promise<User[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE role = ? LIMIT ? OFFSET ?`;
    const results = await this.query<UserRow>(query, [role, limit, offset]);
    
    return results.map(row => this.mapRowToUser(row));
  }

  /**
   * Find active users
   */
  async findActive(limit: number = 10, offset: number = 0): Promise<User[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE is_active = TRUE LIMIT ? OFFSET ?`;
    const results = await this.query<UserRow>(query, [limit, offset]);
    
    return results.map(row => this.mapRowToUser(row));
  }

  /**
   * Count users by role
   */
  async countByRole(role: string): Promise<number> {
    return this.count('role = ?', [role]);
  }

  /**
   * Count users by company
   */
  async countByCompany(companyId: string): Promise<number> {
    return this.count('company_id = ?', [companyId]);
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.count('email = ?', [email]);
    return count > 0;
  }

  /**
   * Map database row to User model
   */
  private mapRowToUser(row: UserRow): User {
    const user = new User(row.id);
    user.first_name = row.first_name;
    user.last_name = row.last_name;
    user.email = row.email;
    user.accessToken = ''; // Will be set during authentication
    user.role = row.role as any;
    user.company_id = row.company_id;
    user.service_type = row.service_type as any;
    user.is_active = row.is_active;
    user.created_at = row.created_at;
    user.updated_at = row.updated_at;
    return user;
  }
}
