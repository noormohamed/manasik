/**
 * Company Admin Repository
 */

import { BaseRepository } from '../repository';
import { CompanyAdmin } from '../../models/management/company-admin';
import { RowDataPacket } from 'mysql2/promise';

export interface CompanyAdminRow extends RowDataPacket {
  id: string;
  user_id: string;
  company_id: string;
  admin_role: string;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CompanyAdminRepository extends BaseRepository<CompanyAdmin> {
  constructor() {
    super('company_admins');
  }

  /**
   * Find admins by company
   */
  async findByCompany(companyId: string, limit: number = 10, offset: number = 0): Promise<CompanyAdmin[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyAdminRow>(query, [companyId, limit, offset]);
    
    return results.map(row => this.mapRowToAdmin(row));
  }

  /**
   * Find admins by role
   */
  async findByRole(role: string, limit: number = 10, offset: number = 0): Promise<CompanyAdmin[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE admin_role = ? LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyAdminRow>(query, [role, limit, offset]);
    
    return results.map(row => this.mapRowToAdmin(row));
  }

  /**
   * Find active admins
   */
  async findActive(limit: number = 10, offset: number = 0): Promise<CompanyAdmin[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE is_active = TRUE LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyAdminRow>(query, [limit, offset]);
    
    return results.map(row => this.mapRowToAdmin(row));
  }

  /**
   * Find admin by user ID
   */
  async findByUserId(userId: string): Promise<CompanyAdmin | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
    const result = await this.queryOne<CompanyAdminRow>(query, [userId]);
    
    return result ? this.mapRowToAdmin(result) : null;
  }

  /**
   * Find company owner
   */
  async findOwner(companyId: string): Promise<CompanyAdmin | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? AND admin_role = 'OWNER'`;
    const result = await this.queryOne<CompanyAdminRow>(query, [companyId]);
    
    return result ? this.mapRowToAdmin(result) : null;
  }

  /**
   * Count admins by company
   */
  async countByCompany(companyId: string): Promise<number> {
    return this.count('company_id = ?', [companyId]);
  }

  /**
   * Count admins by role
   */
  async countByRole(role: string): Promise<number> {
    return this.count('admin_role = ?', [role]);
  }

  /**
   * Get admin permissions
   */
  async getPermissions(adminId: string): Promise<string[]> {
    const query = `SELECT permission_name FROM permissions WHERE admin_id = ?`;
    const results = await this.query<{ permission_name: string }>(query, [adminId]);
    
    return results.map(row => row.permission_name);
  }

  /**
   * Add permission to admin
   */
  async addPermission(adminId: string, permission: string): Promise<boolean> {
    const query = `INSERT INTO permissions (admin_id, permission_name) VALUES (?, ?)`;
    
    try {
      await this.pool.execute(query, [adminId, permission]);
      return true;
    } catch (error: any) {
      // Ignore duplicate key error
      if (error.code === 'ER_DUP_ENTRY') {
        return true;
      }
      throw error;
    }
  }

  /**
   * Remove permission from admin
   */
  async removePermission(adminId: string, permission: string): Promise<boolean> {
    const query = `DELETE FROM permissions WHERE admin_id = ? AND permission_name = ?`;
    const [result] = await this.pool.execute(query, [adminId, permission]);
    
    return (result as any).affectedRows > 0;
  }

  /**
   * Map database row to CompanyAdmin model
   */
  private mapRowToAdmin(row: CompanyAdminRow): CompanyAdmin {
    return CompanyAdmin.create({
      id: row.id,
      userId: row.user_id,
      companyId: row.company_id,
      adminRole: row.admin_role as any,
      name: row.name,
      email: row.email,
      phone: row.phone,
    });
  }
}
