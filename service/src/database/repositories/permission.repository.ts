/**
 * Permission Repository
 */

import { BaseRepository } from '../repository';
import { RowDataPacket } from 'mysql2/promise';

export interface PermissionRow extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: Date;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
}

export class PermissionRepository extends BaseRepository<Permission> {
  constructor() {
    super('permissions');
  }

  /**
   * Find permission by name
   */
  async findByName(name: string): Promise<Permission | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE name = ?`;
    const result = await this.queryOne<PermissionRow>(query, [name]);
    
    return result ? this.mapRowToPermission(result) : null;
  }

  /**
   * Find all permissions
   */
  async findAll(): Promise<Permission[]> {
    const query = `SELECT * FROM ${this.tableName}`;
    const results = await this.query<PermissionRow>(query);
    
    return results.map(row => this.mapRowToPermission(row));
  }

  /**
   * Find permission by resource and action
   */
  async findByResourceAction(resource: string, action: string): Promise<Permission | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE resource = ? AND action = ?`;
    const result = await this.queryOne<PermissionRow>(query, [resource, action]);
    
    return result ? this.mapRowToPermission(result) : null;
  }

  /**
   * Get user permissions (from role + custom)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const query = `
      SELECT DISTINCT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN users u ON u.role = r.name
      WHERE u.id = ?
      UNION
      SELECT p.* FROM permissions p
      INNER JOIN user_permissions up ON p.id = up.permission_id
      WHERE up.user_id = ?
    `;
    const results = await this.query<PermissionRow>(query, [userId, userId]);
    
    return results.map(row => this.mapRowToPermission(row));
  }

  /**
   * Add custom permission to user
   */
  async addPermissionToUser(userId: string, permissionId: number): Promise<boolean> {
    const query = `INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)`;
    
    try {
      await this.pool.execute(query, [userId, permissionId]);
      return true;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return true; // Already exists
      }
      throw error;
    }
  }

  /**
   * Remove custom permission from user
   */
  async removePermissionFromUser(userId: string, permissionId: number): Promise<boolean> {
    const query = `DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?`;
    const [result] = await this.pool.execute(query, [userId, permissionId]);
    
    return (result as any).affectedRows > 0;
  }

  /**
   * Map database row to Permission model
   */
  private mapRowToPermission(row: PermissionRow): Permission {
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      resource: row.resource,
      action: row.action,
      createdAt: row.created_at,
    };
  }
}
