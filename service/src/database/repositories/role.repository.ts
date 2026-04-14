/**
 * Role Repository
 */

import { BaseRepository } from '../repository';
import { RowDataPacket } from 'mysql2/promise';

export interface RoleRow extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super('roles');
  }

  /**
   * Find role by name
   */
  async findByName(name: string): Promise<Role | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE name = ?`;
    const result = await this.queryOne<RoleRow>(query, [name]);
    
    return result ? this.mapRowToRole(result) : null;
  }

  /**
   * Find all system roles
   */
  async findSystemRoles(): Promise<Role[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE is_system = TRUE`;
    const results = await this.query<RoleRow>(query);
    
    return results.map(row => this.mapRowToRole(row));
  }

  /**
   * Get role with permissions
   */
  async getRoleWithPermissions(roleId: number): Promise<any> {
    const roleQuery = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const role = await this.queryOne<RoleRow>(roleQuery, [roleId]);
    
    if (!role) return null;

    const permissionsQuery = `
      SELECT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `;
    const permissions = await this.query<any>(permissionsQuery, [roleId]);

    return {
      ...this.mapRowToRole(role),
      permissions,
    };
  }

  /**
   * Add permission to role
   */
  async addPermissionToRole(roleId: number, permissionId: number): Promise<boolean> {
    const query = `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`;
    
    try {
      await this.pool.execute(query, [roleId, permissionId]);
      return true;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return true; // Already exists
      }
      throw error;
    }
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    const query = `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`;
    const [result] = await this.pool.execute(query, [roleId, permissionId]);
    
    return (result as any).affectedRows > 0;
  }

  /**
   * Map database row to Role model
   */
  private mapRowToRole(row: RoleRow): Role {
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      isSystem: row.is_system,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
